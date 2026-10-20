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

export type RainDay = {
  date: string;
  mm: number;
};

export type MonthResult = {
  month: number;
  rainMm: number;
  inflowM3: number;
  demandM3: number;
  usedM3: number;
  overflowM3: number;
  averageLevelL: number;
};

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

export type SystemInput = {
  catchmentM2: number;
  runoff: number;
  tankLitres: number;
  dailyDemandLitres: (month: number) => number;
};

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

const monthOf = (date: string) => Number(date.slice(5, 7));
const yearOf = (date: string) => Number(date.slice(0, 4));

export function simulate(rain: RainDay[], input: SystemInput, startLevelL = 0): SimulationResult {
  const monthly = new Map<string, MonthAccumulator>();
  let level = startLevelL;
  let emptyDays = 0;
  let fullDays = 0;

  for (const { date, mm } of rain) {
    const month = monthOf(date);
    const inflow = input.catchmentM2 * mm * input.runoff * (1 - FIRST_FLUSH_LOSS);
    const demand = input.dailyDemandLitres(month);

    level += inflow;
    const overflow = Math.max(0, level - input.tankLitres);
    level = Math.min(level, input.tankLitres);
    const used = Math.min(level, demand);
    level -= used;

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

    if (level < 1) emptyDays += 1;
    if (overflow > 0) fullDays += 1;
  }

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
    coverage: demandM3 > 0 ? usedM3 / demandM3 : 0,
    emptyDays: emptyDays / years,
    fullDays: fullDays / years,
    averageFill: levelSum / totalDays / input.tankLitres,
    averageLevelL: levelSum / totalDays,
    months,
  };
}

export function dailyDemandFor(household: Household, uses: WaterUse[] = activeUses(household)) {
  const perPerson = uses
    .filter((use): use is Exclude<WaterUse, 'garden'> => use !== 'garden')
    .reduce((total, use) => total + LITRES_PER_PERSON_PER_DAY[use], 0);
  const hasGarden = uses.includes('garden');

  return (month: number) =>
    household.people * perPerson +
    (hasGarden && GARDEN_MONTHS.includes(month) ? GARDEN_LITRES_PER_DAY : 0);
}

export function activeUses(household: Household): WaterUse[] {
  return (Object.keys(household.uses) as WaterUse[]).filter(
    (use) => household.uses[use] && use !== 'drinking',
  );
}

export function catchmentM2(project: Project): number {
  return project.roof.areaM2 * project.roof.drainedShare;
}

export function systemFor(project: Project, tankLitres = project.tankLitres): SystemInput {
  return {
    catchmentM2: catchmentM2(project),
    runoff: RUNOFF_COEFFICIENT[project.roof.material],
    tankLitres,
    dailyDemandLitres: dailyDemandFor(project.household),
  };
}

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

export function rainByYear(rain: RainDay[]): Map<number, number> {
  const totals = new Map<number, number>();
  for (const { date, mm } of rain) {
    totals.set(yearOf(date), (totals.get(yearOf(date)) ?? 0) + mm);
  }
  return totals;
}

export function extremeYears(rain: RainDay[]): { dry: number; wet: number } {
  const totals = Array.from(rainByYear(rain).entries()).filter(([year]) => {
    const days = rain.filter(({ date }) => yearOf(date) === year).length;
    return days >= 360;
  });
  totals.sort((a, b) => a[1] - b[1]);
  return { dry: totals[0][0], wet: totals[totals.length - 1][0] };
}

export const onlyYear = (rain: RainDay[], year: number) =>
  rain.filter(({ date }) => yearOf(date) === year);

export type ProjectSimulation = {
  typical: SimulationResult;
  dry: SimulationResult;
  wet: SimulationResult;
  dryYear: number;
  wetYear: number;
  shared: SimulationResult;
  bySize: { tankLitres: number; coverage: number }[];
};

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
