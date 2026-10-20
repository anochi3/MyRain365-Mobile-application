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

export type Range = [number, number];

export type Rating = 'good' | 'fair' | 'weak';

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

export type SharedEconomics = {
  homes: number;
  costPerHome: Range;
  usedM3PerHome: number;
  netAnnualSaving: number;
  payback: Range;
  rainwaterCostPerM3: Range;
};

export type Verdict = {
  water: Rating;
  money: Rating;
  environment: Rating;
  feasible: boolean;
  bestOption: 'shared' | 'own' | 'butt';
};

const paybackYears = (cost: number, net: number) => (net > 0 ? cost / net : Infinity);

export function waterPrice(includeSewerCharge: boolean): number {
  return includeSewerCharge ? WATER_PRICE_EUR_PER_M3.withSewer : WATER_PRICE_EUR_PER_M3.waterOnly;
}

export function economicsFor(
  project: Project,
  simulation: ProjectSimulation,
  includeSewerCharge: boolean,
): Economics {
  const pricePerM3 = waterPrice(includeSewerCharge);
  const tankLitres =
    project.site.tankSpace === 'wall'
      ? Math.min(project.tankLitres, WALL_TANK_MAX_L)
      : project.tankLitres;
  const costItems = systemCostItems(tankLitres, project.site.tankSpace === 'buried');
  const cost = totalCost(costItems);
  const usedM3 = simulation.typical.usedM3;
  const annualSaving = usedM3 * pricePerM3;
  const netAnnualSaving = annualSaving - UPKEEP_EUR_PER_YEAR;

  return {
    pricePerM3,
    costItems,
    cost,
    annualSaving,
    netAnnualSaving,
    payback: [paybackYears(cost[0], netAnnualSaving), paybackYears(cost[1], netAnnualSaving)],
    rainwaterCostPerM3: [
      (cost[0] / SYSTEM_LIFE_YEARS + UPKEEP_EUR_PER_YEAR) / Math.max(usedM3, 0.1),
      (cost[1] / SYSTEM_LIFE_YEARS + UPKEEP_EUR_PER_YEAR) / Math.max(usedM3, 0.1),
    ],
    netAfter: (years) => [years * netAnnualSaving - cost[1], years * netAnnualSaving - cost[0]],
  };
}

export function sharedEconomicsFor(
  project: Project,
  simulation: ProjectSimulation,
  includeSewerCharge: boolean,
): SharedEconomics {
  const homes = project.site.isCouree ? project.site.sharedHomes : SHARED_HOMES;
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
    rainwaterCostPerM3: [
      (low / SYSTEM_LIFE_YEARS + SHARED_UPKEEP_PER_HOME_EUR) / Math.max(usedM3PerHome, 0.1),
      (high / SYSTEM_LIFE_YEARS + SHARED_UPKEEP_PER_HOME_EUR) / Math.max(usedM3PerHome, 0.1),
    ],
  };
}

const rate = (value: number, good: number, fair: number, higherIsBetter = true): Rating => {
  if (higherIsBetter) return value >= good ? 'good' : value >= fair ? 'fair' : 'weak';
  return value <= good ? 'good' : value <= fair ? 'fair' : 'weak';
};

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
