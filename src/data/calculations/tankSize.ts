/** Picks the tank size worth recommending. */
import type { ProjectSimulation } from './simulation';

/** A bigger tank is only worth it if it covers at least 5 more percentage points of the needs. */
const WORTHWHILE_GAIN = 0.05;

/**
 * Goes up the sizes (1,000, 2,000, 3,000, 5,000 L) and stops at the first one where the next size
 * would add less than 5 points of coverage. Sizes above maxLitres (for example a wall tank) are skipped.
 */
export function recommendedTank(bySize: ProjectSimulation['bySize'], maxLitres = Infinity) {
  const allowed = bySize.filter((option) => option.tankLitres <= maxLitres);
  const pick = allowed.find((option, index) => {
    const next = allowed[index + 1];
    return !next || next.coverage - option.coverage < WORTHWHILE_GAIN;
  });
  return pick ?? allowed[allowed.length - 1] ?? bySize[0];
}
