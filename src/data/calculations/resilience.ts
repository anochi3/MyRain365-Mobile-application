/**
 * Water-cut readiness: if mains water stops, how many days can the tank keep the essential uses
 * (toilets, cleaning) going? No rain is assumed during the cut, so the answer is on the safe side.
 */
import type { Household, WaterUse } from '@/data/store/projectTypes';

import { ESSENTIAL_USES } from './constants';
import { dailyDemandFor } from './simulation';

/** Cut lengths offered on the Water cut screen, in days. */
export const WATER_CUT_DURATIONS = [1, 3, 7];

/** One day of the cut: what was needed, what the tank supplied, and the share covered. */
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

/** Essential uses the household has switched on; toilets at minimum. */
export function waterCutUses(household: Household): WaterUse[] {
  const chosen = ESSENTIAL_USES.filter((use) => household.uses[use]);
  return chosen.length > 0 ? chosen : ['toilets'];
}

/**
 * Empties the tank day by day during a cut.
 * Each day the household takes its daily need, or whatever is left if the tank runs short.
 *
 * Autonomy (days) = litres in the tank at the start ÷ litres needed per day.
 * Coverage = litres supplied over the whole cut ÷ litres needed over the whole cut.
 */
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
    // Serve today's need, but never more than what is still in the tank.
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
    // Shortfall = litres that would have to come from somewhere else (bottles, neighbours).
    shortfallL: demandTotal - servedTotal,
    firstShortDay: shortDay ? shortDay.day : null,
    days,
  };
}

/** Reserve to keep in the tank to cover N days = litres needed per day × N. */
export function levelNeededForDays(
  household: Household,
  durationDays: number,
  month: number,
  uses: WaterUse[] = waterCutUses(household),
): number {
  return dailyDemandFor(household, uses)(month) * durationDays;
}
