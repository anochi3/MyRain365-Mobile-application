/**
 * Optional link to our roof material model (`roof-api`). When EXPO_PUBLIC_ROOF_API_URL is set, the app
 * asks it which material the roof is made of, judging from the aerial photo.
 */
import type { RoofMaterial } from '@/data/store/projectTypes';
import type { Coordinates } from '@/shared/geo';

const ROOF_API_URL = process.env.EXPO_PUBLIC_ROOF_API_URL;

/** The model's classes mapped to the app's materials (its "concrete" class means a flat roof). */
const MATERIAL_BY_CLASS: Record<string, RoofMaterial> = {
  tiles: 'tiles',
  slate: 'slate',
  metal: 'metal',
  concrete: 'flat',
};

export type DetectedMaterial = {
  material: RoofMaterial;
  confidence: number;
};

export const isRoofModelAvailable = Boolean(ROOF_API_URL);

/** Material and confidence (0 to 1) for the building at a point, or null if unavailable. */
export async function detectRoofMaterial(
  { latitude, longitude }: Coordinates,
  signal?: AbortSignal,
): Promise<DetectedMaterial | null> {
  if (!ROOF_API_URL) return null;

  const response = await fetch(`${ROOF_API_URL}/roof?lat=${latitude}&lon=${longitude}`, { signal });
  if (!response.ok) return null;

  const result = (await response.json()) as { ok: boolean; material?: string; confidence?: number };
  const material = result.material ? MATERIAL_BY_CLASS[result.material] : undefined;
  if (!result.ok || !material) return null;

  return { material, confidence: result.confidence ?? 0 };
}
