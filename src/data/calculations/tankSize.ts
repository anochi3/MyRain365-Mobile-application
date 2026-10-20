import type { ProjectSimulation } from './simulation';

const WORTHWHILE_GAIN = 0.05;

export function recommendedTank(bySize: ProjectSimulation['bySize'], maxLitres = Infinity) {
  const allowed = bySize.filter((option) => option.tankLitres <= maxLitres);
  const pick = allowed.find((option, index) => {
    const next = allowed[index + 1];
    return !next || next.coverage - option.coverage < WORTHWHILE_GAIN;
  });
  return pick ?? allowed[allowed.length - 1] ?? bySize[0];
}
