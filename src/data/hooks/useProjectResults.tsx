/**
 * Computes every result once for the whole app (simulation, money, verdict, water quality, water cut,
 * recommendations) and shares it through a React context, so each screen just reads it.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  economicsFor,
  sharedEconomicsFor,
  verdictFor,
  type Economics,
  type SharedEconomics,
  type Verdict,
} from '@/data/calculations/finance';
import { assessQuality, type QualityAssessment } from '@/data/calculations/quality';
import { recommendationsFor, type Recommendation } from '@/data/calculations/recommendations';
import { simulateWaterCut, type WaterCutResult } from '@/data/calculations/resilience';
import {
  simulateProject,
  type ProjectSimulation,
  type RainDay,
} from '@/data/calculations/simulation';
import { getRainHistory } from '@/data/services/weatherService';
import { useProjectStore } from '@/data/store/ProjectProvider';

export type ProjectResults = {
  rain: RainDay[];
  simulation: ProjectSimulation;
  own: Economics;
  shared: SharedEconomics;
  verdict: Verdict;
  quality: QualityAssessment;
  waterCut: WaterCutResult;
  recommendations: Recommendation[];
};

export type ResultsState =
  | { status: 'missing' }
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready'; results: ProjectResults };

// The water-cut card on Results assumes a three-day cut.
const WATER_CUT_DAYS = 3;
const currentMonth = () => new Date().getMonth() + 1;

/** Downloads (or reads from cache) the ten-year rain history for the building, with a retry. */
export function useRainHistory(latitude?: number, longitude?: number) {
  const [rain, setRain] = useState<RainDay[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (latitude === undefined || longitude === undefined) return;
    let isActive = true;
    getRainHistory({ latitude, longitude })
      .then((days) => isActive && setRain(days))
      .catch(() => isActive && setFailed(true));
    return () => {
      isActive = false;
    };
  }, [latitude, longitude, attempt]);

  const retry = () => {
    setFailed(false);
    setAttempt((value) => value + 1);
  };

  return { rain, failed, retry };
}

/** Builds the results whenever the project, the rain or the price setting changes. */
function useComputedResults(): ResultsState {
  const { project, preferences } = useProjectStore();
  const { rain, failed, retry } = useRainHistory(
    project.building?.latitude,
    project.building?.longitude,
  );

  const results = useMemo<ProjectResults | null>(() => {
    if (!rain || !project.building || project.roof.areaM2 <= 0) return null;
    const simulation = simulateProject(project, rain);
    const own = economicsFor(project, simulation, preferences.includeSewerCharge);
    const shared = sharedEconomicsFor(project, simulation, preferences.includeSewerCharge);
    const verdict = verdictFor(project, simulation, own, shared);
    // Water-cut card: start from the tank level that is typical for the current month.
    const month = currentMonth();
    const startLevel = simulation.typical.months[month - 1].averageLevelL;
    const waterCut = simulateWaterCut(project.household, startLevel, WATER_CUT_DAYS, month);

    return {
      rain,
      simulation,
      own,
      shared,
      verdict,
      quality: assessQuality(project),
      waterCut,
      recommendations: recommendationsFor(project, verdict, own, shared, waterCut),
    };
  }, [rain, project, preferences.includeSewerCharge]);

  if (!project.building || project.roof.areaM2 <= 0) return { status: 'missing' };
  if (failed) return { status: 'error', retry };
  if (!results) return { status: 'loading' };
  return { status: 'ready', results };
}

const ResultsContext = createContext<ResultsState>({ status: 'missing' });

/** Wraps the app so every screen can call useProjectResults(). */
export function ResultsProvider({ children }: { children: ReactNode }) {
  const state = useComputedResults();
  return <ResultsContext.Provider value={state}>{children}</ResultsContext.Provider>;
}

export function useProjectResults(): ResultsState {
  return useContext(ResultsContext);
}
