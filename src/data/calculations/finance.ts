/**
 * Money side of the results: what the system costs, what it saves, when it pays back,
 * and the overall verdict shown at the top of the Results screen.
 */
import type { Project } from '@/data/store/projectTypes';

import {
  SHARED_COST_PER_HOME_EUR,
  SHARED_HOMES,
  SHARED_UPKEEP_PER_HOME_EUR,
  SYSTEM_LIFE_YEARS,
  UPKEEP_EUR_PER_YEAR,
  WALL_TANK_MAX_L,
  WATER_PRICE_EUR_PER_M3,
  systemCostItems,
  totalCost,
  type CostItem,
} from './constants';
import type { ProjectSimulation } from './simulation';

/** A low and a high estimate, always in that order. */
export type Range = [number, number];

export type Rating = 'good' | 'fair' | 'weak';

/** Economics of the user's own tank. */
export type Economics = {
  pricePerM3: number;
  costItems: CostItem[];
  cost: Range;
  annualSaving: number;
  netAnnualSaving: number;
  payback: Range;
  rainwaterCostPerM3: Range;
  netAfter: (years: number) => Range;
};

/** Economics of one home's share of a courée tank. */
export type SharedEconomics = {
  homes: number;
  costPerHome: Range;
  usedM3PerHome: number;
  netAnnualSaving: number;
  payback: Range;
  rainwaterCostPerM3: Range;
};

/** The three ratings and the recommended option shown on the Results screen. */
export type Verdict = {
  water: Rating;
  money: Rating;
  environment: Rating;
  feasible: boolean;
  bestOption: 'shared' | 'own' | 'butt';
};

/**
 * Payback time in years = upfront cost ÷ money saved each year after upkeep.
 * If the system saves nothing (or loses money every year) it never pays back.
 */
const paybackYears = (cost: number, net: number) => (net > 0 ? cost / net : Infinity);

/**
 * Price of one cubic metre of mains water.
 * With sewer: water + sanitation (€4.58, Iléo). Water only: €2.42, used when rainwater sent to the
 * drain is still charged for sanitation, so only the water part is really saved.
 */
export function waterPrice(includeSewerCharge: boolean): number {
  return includeSewerCharge ? WATER_PRICE_EUR_PER_M3.withSewer : WATER_PRICE_EUR_PER_M3.waterOnly;
}

/** Costs, savings and payback for the user's own tank. */
export function economicsFor(
  project: Project,
  simulation: ProjectSimulation,
  includeSewerCharge: boolean,
): Economics {
  const pricePerM3 = waterPrice(includeSewerCharge);

  // A tank against a wall cannot be larger than about 1,000 L.
  const tankLitres =
    project.site.tankSpace === 'wall'
      ? Math.min(project.tankLitres, WALL_TANK_MAX_L)
      : project.tankLitres;
  const costItems = systemCostItems(tankLitres, project.site.tankSpace === 'buried');
  const cost = totalCost(costItems);

  // Money saved per year = rainwater actually used (m³) × price of the mains water it replaces.
  const usedM3 = simulation.typical.usedM3;
  const annualSaving = usedM3 * pricePerM3;

  // Net saving = saving − yearly upkeep (filters, pump electricity, cleaning).
  const netAnnualSaving = annualSaving - UPKEEP_EUR_PER_YEAR;

  return {
    pricePerM3,
    costItems,
    cost,
    annualSaving,
    netAnnualSaving,
    payback: [paybackYears(cost[0], netAnnualSaving), paybackYears(cost[1], netAnnualSaving)],
    // Real cost of one m³ of rainwater = (cost spread over the system's life + yearly upkeep)
    //                                    ÷ m³ used per year.
    // (The 0.1 floor avoids dividing by zero when almost nothing is used.)
    rainwaterCostPerM3: [
      (cost[0] / SYSTEM_LIFE_YEARS + UPKEEP_EUR_PER_YEAR) / Math.max(usedM3, 0.1),
      (cost[1] / SYSTEM_LIFE_YEARS + UPKEEP_EUR_PER_YEAR) / Math.max(usedM3, 0.1),
    ],
    // Balance after N years = N × net yearly saving − what the system cost.
    // The worst case uses the high cost, the best case the low cost.
    netAfter: (years) => [years * netAnnualSaving - cost[1], years * netAnnualSaving - cost[0]],
  };
}

/** Costs, savings and payback for one home of a shared courée tank. */
export function sharedEconomicsFor(
  project: Project,
  simulation: ProjectSimulation,
  includeSewerCharge: boolean,
): SharedEconomics {
  const homes = project.site.isCouree ? project.site.sharedHomes : SHARED_HOMES;

  // Each home gets an equal share of the water the shared tank supplies.
  const usedM3PerHome = simulation.shared.usedM3 / homes;
  const netAnnualSaving =
    usedM3PerHome * waterPrice(includeSewerCharge) - SHARED_UPKEEP_PER_HOME_EUR;
  const [low, high] = SHARED_COST_PER_HOME_EUR;

  return {
    homes,
    costPerHome: [low, high],
    usedM3PerHome,
    netAnnualSaving,
    payback: [paybackYears(low, netAnnualSaving), paybackYears(high, netAnnualSaving)],
    // Same formula as for a single tank, but per home.
    rainwaterCostPerM3: [
      (low / SYSTEM_LIFE_YEARS + SHARED_UPKEEP_PER_HOME_EUR) / Math.max(usedM3PerHome, 0.1),
      (high / SYSTEM_LIFE_YEARS + SHARED_UPKEEP_PER_HOME_EUR) / Math.max(usedM3PerHome, 0.1),
    ],
  };
}

/**
 * Turns a number into good / fair / weak using two thresholds.
 * Example with higherIsBetter: coverage ≥ 50% is good, ≥ 25% is fair, below is weak.
 * For payback, lower is better: ≤ 15 years good, ≤ 30 years fair, more is weak.
 */
const rate = (value: number, good: number, fair: number, higherIsBetter = true): Rating => {
  if (higherIsBetter) return value >= good ? 'good' : value >= fair ? 'fair' : 'weak';
  return value <= good ? 'good' : value <= fair ? 'fair' : 'weak';
};

/**
 * The verdict card:
 * - water: share of needs covered by rain (good from 50%, fair from 25%)
 * - money: fastest payback of the own tank (good up to 15 years, fair up to 30)
 * - environment: rain collected per year, i.e. kept out of the sewers (good from 20 m³, fair from 8 m³)
 * - best option: a water butt when there is no room for a tank, the shared tank when the home can
 *   share and it pays back faster, otherwise the user's own tank.
 */
export function verdictFor(
  project: Project,
  simulation: ProjectSimulation,
  own: Economics,
  shared: SharedEconomics,
): Verdict {
  const water = rate(simulation.typical.coverage, 0.5, 0.25);
  const money = rate(own.payback[0], 15, 30, false);
  const environment = rate(simulation.typical.inflowM3, 20, 8);
  const canShare = project.site.isCouree || project.site.kind === 'shared';
  const bestOption =
    project.site.tankSpace === 'none'
      ? 'butt'
      : canShare && shared.payback[0] < own.payback[0]
        ? 'shared'
        : 'own';

  return {
    water,
    money,
    environment,
    feasible: water !== 'weak',
    bestOption,
  };
}
