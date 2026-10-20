import type { Household, WaterUse } from '@/data/store/projectTypes';

import { ESSENTIAL_USES } from './constants';
import { dailyDemandFor } from './simulation';

export const WATER_CUT_DURATIONS = [1, 3, 7];

export type WaterCutDay = {
  day: number;
  demandL: number;
  servedL: number;
  coverage: number;
};

export type WaterCutResult = {
  startLevelL: number;
  dailyDemandL: number;
  autonomyDays: number;
  coverage: number;
  shortfallL: number;
  firstShortDay: number | null;
  days: WaterCutDay[];
};

export function waterCutUses(household: Household): WaterUse[] {
  const chosen = ESSENTIAL_USES.filter((use) => household.uses[use]);
  return chosen.length > 0 ? chosen : ['toilets'];
}

export function simulateWaterCut(
  household: Household,
  startLevelL: number,
  durationDays: number,
  month: number,
  uses: WaterUse[] = waterCutUses(household),
): WaterCutResult {
  const dailyDemandL = dailyDemandFor(household, uses)(month);
  let level = startLevelL;
  const days: WaterCutDay[] = [];

  for (let day = 1; day <= durationDays; day++) {
    const servedL = Math.min(level, dailyDemandL);
    level -= servedL;
    days.push({
      day,
      demandL: dailyDemandL,
      servedL,
      coverage: dailyDemandL > 0 ? servedL / dailyDemandL : 1,
    });
  }

  const demandTotal = dailyDemandL * durationDays;
  const servedTotal = days.reduce((total, day) => total + day.servedL, 0);
  const shortDay = days.find((day) => day.coverage < 1);

  return {
    startLevelL,
    dailyDemandL,
    autonomyDays: dailyDemandL > 0 ? startLevelL / dailyDemandL : Infinity,
    coverage: demandTotal > 0 ? servedTotal / demandTotal : 1,
    shortfallL: demandTotal - servedTotal,
    firstShortDay: shortDay ? shortDay.day : null,
    days,
  };
}

export function levelNeededForDays(
  household: Household,
  durationDays: number,
  month: number,
  uses: WaterUse[] = waterCutUses(household),
): number {
  return dailyDemandFor(household, uses)(month) * durationDays;
}
