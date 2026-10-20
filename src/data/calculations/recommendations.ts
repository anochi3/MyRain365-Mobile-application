import type { Project } from '@/data/store/projectTypes';

import { WATER_BUTT_COST_EUR } from './constants';
import type { Economics, Range, SharedEconomics, Verdict } from './finance';
import type { WaterCutResult } from './resilience';

export type RecommendationKey =
  | 'sharedTank'
  | 'waterButt'
  | 'ownTank'
  | 'rainGarden'
  | 'infiltration'
  | 'waterCutReserve'
  | 'accessibleTap'
  | 'maintenanceHelp';

export type Recommendation = {
  key: RecommendationKey;
  tone: 'best' | 'good' | 'neutral' | 'caution';
  payback?: Range;
  cost?: Range;
  reserveL?: number;
  days?: number;
};

export function recommendationsFor(
  project: Project,
  verdict: Verdict,
  own: Economics,
  shared: SharedEconomics,
  waterCut: WaterCutResult,
): Recommendation[] {
  const list: Recommendation[] = [];
  const canShare = project.site.isCouree || project.site.kind === 'shared';
  const hasSpace = project.site.tankSpace !== 'none';

  if (canShare) {
    list.push({
      key: 'sharedTank',
      tone: verdict.bestOption === 'shared' ? 'best' : 'good',
      payback: shared.payback,
    });
  }
  if (project.household.uses.garden || !hasSpace) {
    list.push({
      key: 'waterButt',
      tone: verdict.bestOption === 'butt' ? 'best' : 'good',
      cost: WATER_BUTT_COST_EUR,
    });
  }
  if (hasSpace) {
    list.push({
      key: 'ownTank',
      tone: verdict.bestOption === 'own' ? 'best' : 'neutral',
      payback: own.payback,
    });
  }
  if (waterCut.autonomyDays < 3) {
    list.push({
      key: 'waterCutReserve',
      tone: 'neutral',
      days: 3,
      reserveL: Math.ceil(waterCut.dailyDemandL * 3),
    });
  }
  if (project.access.includes('stepFreeAccess') || project.access.includes('easyTap')) {
    list.push({ key: 'accessibleTap', tone: 'neutral' });
  }
  if (project.access.includes('lightMaintenance') || project.access.includes('helpNeeded')) {
    list.push({ key: 'maintenanceHelp', tone: 'neutral' });
  }
  list.push({ key: 'rainGarden', tone: 'neutral' });
  list.push({ key: 'infiltration', tone: 'caution' });

  const order = { best: 0, good: 1, neutral: 2, caution: 3 };
  return list.sort((a, b) => order[a.tone] - order[b.tone]);
}
