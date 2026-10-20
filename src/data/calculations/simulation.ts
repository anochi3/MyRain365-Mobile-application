/**
 * Daily rainwater tank simulation.
 *
 * This is the heart of the app: it replays ten years of real daily rainfall over the user's roof and
 * tank, one day at a time, and counts how much water was collected, used, and lost to overflow.
 * It is the same model as `myrain365/mockups/sim.py` and gives identical numbers.
 */
import type { Household, Project, WaterUse } from '@/data/store/projectTypes';

import {
  FIRST_FLUSH_LOSS,
  GARDEN_LITRES_PER_DAY,
  GARDEN_MONTHS,
  LITRES_PER_PERSON_PER_DAY,
  RUNOFF_COEFFICIENT,
  SHARED_HOMES,
  SHARED_TANK_L,
  TANK_SIZES_L,
} from './constants';

/** One day of rain: the date as "YYYY-MM-DD" and the rainfall in millimetres. */
export type RainDay = {
  date: string;
  mm: number;
};

/** Averages for one calendar month (January = 1), over all simulated years. */
export type MonthResult = {
  month: number;
  rainMm: number;
  inflowM3: number;
  demandM3: number;
  usedM3: number;
  overflowM3: number;
  averageLevelL: number;
};

/** Yearly averages for a whole simulation, plus the month-by-month breakdown. */
export type SimulationResult = {
  years: number;
  rainMm: number;
  inflowM3: number;
  demandM3: number;
  usedM3: number;
  overflowM3: number;
  coverage: number;
  emptyDays: number;
  fullDays: number;
  averageFill: number;
  averageLevelL: number;
  months: MonthResult[];
};

/**
 * Everything the simulation needs to know about a rainwater system.
 * - catchmentM2: roof area that drains into the tank, in square metres
 * - runoff: share of the rain that runs off this roof material (0 to 1)
 * - tankLitres: tank capacity in litres
 * - dailyDemandLitres: litres the household wants from the tank on one day of a given month
 */
export type SystemInput = {
  catchmentM2: number;
  runoff: number;
  tankLitres: number;
  dailyDemandLitres: (month: number) => number;
};

/** Running totals for one specific month of one specific year (for example March 2019). */
type MonthAccumulator = Omit<MonthResult, 'month' | 'averageLevelL'> & {
  levelSum: number;
  days: number;
};

const emptyMonth = (): MonthAccumulator => ({
  rainMm: 0,
  inflowM3: 0,
  demandM3: 0,
  usedM3: 0,
  overflowM3: 0,
  levelSum: 0,
  days: 0,
});

// Dates are ISO strings "YYYY-MM-DD", so the month is characters 5-6 and the year characters 0-3.
const monthOf = (date: string) => Number(date.slice(5, 7));
const yearOf = (date: string) => Number(date.slice(0, 4));

/**
 * Replays the rain day by day through the tank.
 *
 * For every day, in this order:
 *   1. Water arriving (litres) = roof area (m²) × rain (mm) × runoff coefficient × (1 − first-flush loss)
 *      (1 mm of rain on 1 m² is exactly 1 litre, which is why m² × mm gives litres directly.)
 *   2. The tank fills up. Anything above its capacity overflows and is lost.
 *   3. The household draws what it needs, but never more than what is in the tank.
 *   4. Whatever is left stays in the tank for tomorrow.
 *
 * @param startLevelL litres already in the tank on the first day (default: empty)
 */
export function simulate(rain: RainDay[], input: SystemInput, startLevelL = 0): SimulationResult {
  const monthly = new Map<string, MonthAccumulator>();
  let level = startLevelL;
  let emptyDays = 0;
  let fullDays = 0;

  for (const { date, mm } of rain) {
    const month = monthOf(date);

    // Step 1: litres reaching the tank today.
    const inflow = input.catchmentM2 * mm * input.runoff * (1 - FIRST_FLUSH_LOSS);
    const demand = input.dailyDemandLitres(month);

    // Step 2: fill the tank; the part above capacity is overflow.
    level += inflow;
    const overflow = Math.max(0, level - input.tankLitres);
    level = Math.min(level, input.tankLitres);

    // Step 3: serve the demand from what is available.
    const used = Math.min(level, demand);
    level -= used;

    // Add today's figures to the totals of this month of this year (litres are converted to m³ by ÷ 1000).
    const key = date.slice(0, 7);
    const bucket = monthly.get(key) ?? emptyMonth();
    bucket.rainMm += mm;
    bucket.inflowM3 += inflow / 1000;
    bucket.demandM3 += demand / 1000;
    bucket.usedM3 += used / 1000;
    bucket.overflowM3 += overflow / 1000;
    bucket.levelSum += level;
    bucket.days += 1;
    monthly.set(key, bucket);

    // A tank with less than one litre counts as empty; any overflow counts as a "full" day.
    if (level < 1) emptyDays += 1;
    if (overflow > 0) fullDays += 1;
  }

  // Group the per-year months by calendar month (all Januaries together, and so on).
  const years = new Set(rain.map(({ date }) => yearOf(date))).size || 1;
  const byMonth = Array.from({ length: 12 }, () => ({ ...emptyMonth(), count: 0 }));
  for (const [key, bucket] of monthly) {
    const target = byMonth[monthOf(key) - 1];
    target.rainMm += bucket.rainMm;
    target.inflowM3 += bucket.inflowM3;
    target.demandM3 += bucket.demandM3;
    target.usedM3 += bucket.usedM3;
    target.overflowM3 += bucket.overflowM3;
    target.levelSum += bucket.levelSum;
    target.days += bucket.days;
    target.count += 1;
  }

  // Average month = total over all years ÷ number of years that month appeared in.
  // Average tank level = sum of the daily levels ÷ number of days.
  const months: MonthResult[] = byMonth.map((bucket, index) => {
    const count = bucket.count || 1;
    return {
      month: index + 1,
      rainMm: bucket.rainMm / count,
      inflowM3: bucket.inflowM3 / count,
      demandM3: bucket.demandM3 / count,
      usedM3: bucket.usedM3 / count,
      overflowM3: bucket.overflowM3 / count,
      averageLevelL: bucket.days ? bucket.levelSum / bucket.days : 0,
    };
  });

  // A typical year is the sum of the twelve average months.
  const sum = (pick: (month: MonthResult) => number) =>
    months.reduce((total, month) => total + pick(month), 0);
  const totalDays = rain.length || 1;
  const levelSum = Array.from(monthly.values()).reduce(
    (total, bucket) => total + bucket.levelSum,
    0,
  );
  const demandM3 = sum((month) => month.demandM3);
  const usedM3 = sum((month) => month.usedM3);

  return {
    years,
    rainMm: sum((month) => month.rainMm),
    inflowM3: sum((month) => month.inflowM3),
    demandM3,
    usedM3,
    overflowM3: sum((month) => month.overflowM3),
    // Coverage = share of the household's needs met by rainwater = water used ÷ water wanted.
    coverage: demandM3 > 0 ? usedM3 / demandM3 : 0,
    emptyDays: emptyDays / years,
    fullDays: fullDays / years,
    // Average fill = average litres in the tank ÷ tank capacity (0 = always empty, 1 = always full).
    averageFill: levelSum / totalDays / input.tankLitres,
    averageLevelL: levelSum / totalDays,
    months,
  };
}

/**
 * Builds the household's daily water need, in litres, for any month.
 *
 * Daily need = number of people × (sum of litres per person for each chosen indoor use)
 *            + 30 L for the garden, only from April to September.
 */
export function dailyDemandFor(household: Household, uses: WaterUse[] = activeUses(household)) {
  const perPerson = uses
    .filter((use): use is Exclude<WaterUse, 'garden'> => use !== 'garden')
    .reduce((total, use) => total + LITRES_PER_PERSON_PER_DAY[use], 0);
  const hasGarden = uses.includes('garden');

  return (month: number) =>
    household.people * perPerson +
    (hasGarden && GARDEN_MONTHS.includes(month) ? GARDEN_LITRES_PER_DAY : 0);
}

/**
 * The uses the user switched on. Drinking is always left out of the simulation because it is not
 * allowed from rainwater in French homes connected to mains water.
 */
export function activeUses(household: Household): WaterUse[] {
  return (Object.keys(household.uses) as WaterUse[]).filter(
    (use) => household.uses[use] && use !== 'drinking',
  );
}

/** Roof area that actually feeds the tank = measured roof area × share of it that drains there. */
export function catchmentM2(project: Project): number {
  return project.roof.areaM2 * project.roof.drainedShare;
}

/** The user's own system, optionally with a different tank size to compare options. */
export function systemFor(project: Project, tankLitres = project.tankLitres): SystemInput {
  return {
    catchmentM2: catchmentM2(project),
    runoff: RUNOFF_COEFFICIENT[project.roof.material],
    tankLitres,
    dailyDemandLitres: dailyDemandFor(project.household),
  };
}

/**
 * A shared courée system: several similar homes pool their roofs into one large tank.
 * Roof area and demand are both multiplied by the number of homes; the tank is 15,000 L.
 */
export function sharedSystemFor(project: Project): SystemInput {
  const homes = project.site.isCouree ? project.site.sharedHomes : SHARED_HOMES;
  const single = dailyDemandFor(project.household);
  return {
    catchmentM2: catchmentM2(project) * homes,
    runoff: RUNOFF_COEFFICIENT[project.roof.material],
    tankLitres: SHARED_TANK_L,
    dailyDemandLitres: (month) => single(month) * homes,
  };
}

/** Total rainfall of each calendar year, in millimetres. */
export function rainByYear(rain: RainDay[]): Map<number, number> {
  const totals = new Map<number, number>();
  for (const { date, mm } of rain) {
    totals.set(yearOf(date), (totals.get(yearOf(date)) ?? 0) + mm);
  }
  return totals;
}

/**
 * The driest and the wettest complete year in the record. Years with fewer than 360 days of data
 * are skipped so a partial year never looks artificially dry.
 */
export function extremeYears(rain: RainDay[]): { dry: number; wet: number } {
  const totals = Array.from(rainByYear(rain).entries()).filter(([year]) => {
    const days = rain.filter(({ date }) => yearOf(date) === year).length;
    return days >= 360;
  });
  totals.sort((a, b) => a[1] - b[1]);
  return { dry: totals[0][0], wet: totals[totals.length - 1][0] };
}

/** Only the days of one year. */
export const onlyYear = (rain: RainDay[], year: number) =>
  rain.filter(({ date }) => yearOf(date) === year);

/** Every simulation the results screens need, computed once. */
export type ProjectSimulation = {
  typical: SimulationResult;
  dry: SimulationResult;
  wet: SimulationResult;
  dryYear: number;
  wetYear: number;
  shared: SimulationResult;
  bySize: { tankLitres: number; coverage: number }[];
};

/**
 * Runs all scenarios for a project:
 * - typical: all ten years averaged
 * - dry / wet: the single driest and wettest year
 * - shared: the courée tank
 * - bySize: coverage for each standard tank size (1,000 to 5,000 L)
 */
export function simulateProject(project: Project, rain: RainDay[]): ProjectSimulation {
  const { dry, wet } = extremeYears(rain);
  const system = systemFor(project);

  return {
    typical: simulate(rain, system),
    dry: simulate(onlyYear(rain, dry), system),
    wet: simulate(onlyYear(rain, wet), system),
    dryYear: dry,
    wetYear: wet,
    shared: simulate(rain, sharedSystemFor(project)),
    bySize: TANK_SIZES_L.map((tankLitres) => ({
      tankLitres,
      coverage: simulate(rain, systemFor(project, tankLitres)).coverage,
    })),
  };
}
