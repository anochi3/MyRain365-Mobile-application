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

const LEVELS: RiskLevel[] = ['low', 'medium', 'high'];

const raise = (level: RiskLevel, steps = 1): RiskLevel =>
  LEVELS[Math.min(LEVELS.indexOf(level) + steps, LEVELS.length - 1)];

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
    treatment: ['gutterMesh', 'firstFlush', 'sedimentFilter', 'labelledPipes'],
    wantsDrinking: household.uses.drinking,
  };
}
