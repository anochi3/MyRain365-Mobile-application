/**
 * Live estimate for the My tank screen and the alerts. There is no sensor, so the level is worked out
 * from the rain that actually fell on the roof over the last 60 days, using the same daily model as
 * the simulation.
 */
import { useEffect, useMemo, useState } from 'react';

import { FIRST_FLUSH_LOSS } from '@/data/calculations/constants';
import { simulateWaterCut, type WaterCutResult } from '@/data/calculations/resilience';
import { simulate, systemFor } from '@/data/calculations/simulation';
import { getRecentWeather, type RecentWeather } from '@/data/services/weatherService';
import { useProjectStore } from '@/data/store/ProjectProvider';

// The screen shows the next three days of forecast.
const FORECAST_DAYS = 3;
// Below 10% of capacity the tank counts as almost empty.
const LOW_LEVEL_SHARE = 0.1;

export type ForecastWithInflow = RecentWeather['forecast'][number] & {
  inflowL: number;
};

export type TankStatus = {
  levelL: number;
  capacityL: number;
  fill: number;
  forecast: ForecastWithInflow[];
  overflowExpectedL: number;
  overflowDay: string | null;
  isLow: boolean;
  savedThisMonthM3: number;
  waterCut: WaterCutResult;
};

export type TankState =
  | { status: 'missing' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; tank: TankStatus };

/** Recent weather kept in memory so switching tabs does not download it again. */
const weatherCache = new Map<string, RecentWeather>();

export function useTankStatus(): TankState {
  const { project } = useProjectStore();
  const building = project.building;
  const key = building ? `${building.latitude.toFixed(3)}:${building.longitude.toFixed(3)}` : '';
  const [weather, setWeather] = useState<RecentWeather | null>(() => weatherCache.get(key) ?? null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!building || weatherCache.has(key)) return;
    let isActive = true;
    getRecentWeather(building)
      .then((recent) => {
        weatherCache.set(key, recent);
        if (isActive) setWeather(recent);
      })
      .catch(() => isActive && setFailed(true));
    return () => {
      isActive = false;
    };
  }, [building, key]);

  const tank = useMemo<TankStatus | null>(() => {
    const current = weather ?? weatherCache.get(key);
    if (!current || !building) return null;

    // 1. Replay the last 60 days, starting from an empty tank, to estimate today's level.
    //    Water used during the current month is added up for the "saved this month" tile.
    const system = systemFor(project);
    const capacityL = project.tankLitres;
    let levelL = 0;
    let usedThisMonthL = 0;
    const thisMonth = new Date().toISOString().slice(0, 7);
    for (const day of current.past) {
      const result = simulate([day], system, levelL);
      levelL = result.averageLevelL;
      if (day.date.startsWith(thisMonth)) usedThisMonthL += result.usedM3 * 1000;
    }

    // 2. Litres each forecast day would bring = roof area × forecast rain × runoff × (1 − first flush).
    const forecast = current.forecast.slice(0, FORECAST_DAYS).map((day) => ({
      ...day,
      inflowL: system.catchmentM2 * day.mm * system.runoff * (1 - FIRST_FLUSH_LOSS),
    }));
    // 3. Run the next days forward: level + rain in − water used. Anything above capacity would
    //    overflow, so we remember how much and on which day, to advise using it before then.
    let projected = levelL;
    let overflowExpectedL = 0;
    let overflowDay: string | null = null;
    for (const day of forecast) {
      projected += day.inflowL - system.dailyDemandLitres(Number(day.date.slice(5, 7)));
      projected = Math.max(projected, 0);
      if (projected > capacityL) {
        overflowExpectedL += projected - capacityL;
        overflowDay = overflowDay ?? day.date;
        projected = capacityL;
      }
    }

    return {
      levelL,
      capacityL,
      // Fill = litres now ÷ capacity (0 = empty, 1 = full).
      fill: levelL / capacityL,
      forecast,
      overflowExpectedL,
      overflowDay,
      isLow: levelL < capacityL * LOW_LEVEL_SHARE,
      savedThisMonthM3: usedThisMonthL / 1000,
      // Water-cut autonomy if mains water stopped today, from today's estimated level.
      waterCut: simulateWaterCut(project.household, levelL, 3, new Date().getMonth() + 1),
    };
  }, [weather, key, building, project]);

  if (!building) return { status: 'missing' };
  if (failed) return { status: 'error' };
  if (!tank) return { status: 'loading' };
  return { status: 'ready', tank };
}
