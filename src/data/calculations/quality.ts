/**
 * Rough water-quality estimate from what we know about the roof and its surroundings.
 * It is a guide, not a measurement: only a lab test measures the real quality.
 */
import type { Project } from '@/data/store/projectTypes';

export type RiskLevel = 'low' | 'medium' | 'high';

export type Contaminant = 'bacteria' | 'metals' | 'particles' | 'pesticides' | 'organic';

export type TreatmentStep = 'gutterMesh' | 'firstFlush' | 'sedimentFilter' | 'labelledPipes';

export type QualityAssessment = {
  risks: { contaminant: Contaminant; level: RiskLevel }[];
  overall: RiskLevel;
  treatment: TreatmentStep[];
  wantsDrinking: boolean;
};

/** Risk levels from best to worst; their position in this list is used to compare them. */
const LEVELS: RiskLevel[] = ['low', 'medium', 'high'];

/** Moves a risk one step up (low → medium → high), never above high. */
const raise = (level: RiskLevel, steps = 1): RiskLevel =>
  LEVELS[Math.min(LEVELS.indexOf(level) + steps, LEVELS.length - 1)];

/**
 * Starting points and what raises them:
 * - bacteria: always at least medium in stored rainwater (birds, leaves); higher on a poor roof
 * - metals: medium on a metal roof; higher near industry
 * - dust and particles: low; higher near a busy road or on a poor roof
 * - pesticides: low; higher next to fields
 * - organic matter and colour: medium on green or thatched roofs; higher on a poor roof
 * The overall risk is the worst of the five.
 */
export function assessQuality(project: Project): QualityAssessment {
  const { roof, quality, household } = project;
  const poorRoof = quality.roofCondition === 'poor';

  let bacteria: RiskLevel = 'medium';
  let metals: RiskLevel = roof.material === 'metal' ? 'medium' : 'low';
  let particles: RiskLevel = 'low';
  let pesticides: RiskLevel = 'low';
  let organic: RiskLevel =
    roof.material === 'green' || roof.material === 'thatched' ? 'medium' : 'low';

  if (poorRoof) {
    bacteria = raise(bacteria);
    particles = raise(particles);
    organic = raise(organic);
  }
  if (quality.pollution === 'traffic') particles = raise(particles);
  if (quality.pollution === 'industry') metals = raise(metals);
  if (quality.pollution === 'agriculture') pesticides = raise(pesticides);

  const risks = [
    { contaminant: 'bacteria' as const, level: bacteria },
    { contaminant: 'metals' as const, level: metals },
    { contaminant: 'particles' as const, level: particles },
    { contaminant: 'pesticides' as const, level: pesticides },
    { contaminant: 'organic' as const, level: organic },
  ];
  const overall = risks.reduce<RiskLevel>(
    (worst, { level }) => (LEVELS.indexOf(level) > LEVELS.indexOf(worst) ? level : worst),
    'low',
  );

  return {
    risks,
    overall,
    // Treatment for non-drinking uses: the same four steps for every home.
    treatment: ['gutterMesh', 'firstFlush', 'sedimentFilter', 'labelledPipes'],
    wantsDrinking: household.uses.drinking,
  };
}
