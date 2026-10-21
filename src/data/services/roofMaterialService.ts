import type { RoofMaterial } from '@/data/store/projectTypes';
import type { Coordinates } from '@/shared/geo';

const ROOF_API_URL = process.env.EXPO_PUBLIC_ROOF_API_URL?.replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = 20000;

const MATERIAL_BY_CLASS: Record<string, RoofMaterial> = {
  tiles: 'tiles',
  slate: 'slate',
  metal: 'metal',
  concrete: 'flat',
};

export type DetectedMaterial = {
  material: RoofMaterial;
  confidence: number;
  shouldAskUser: boolean;
  probabilities: { material: RoofMaterial; probability: number }[];
  modelVersion: string | null;
};

type RoofApiResponse = {
  ok: boolean;
  material?: string;
  confidence?: number;
  ask_user?: boolean;
  probabilities?: Record<string, number>;
  model_version?: string;
};

export const isRoofModelAvailable = Boolean(ROOF_API_URL);

export async function detectRoofMaterial(
  { latitude, longitude }: Coordinates,
  signal?: AbortSignal,
): Promise<DetectedMaterial | null> {
  if (!ROOF_API_URL) return null;

  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), REQUEST_TIMEOUT_MS);
  signal?.addEventListener('abort', () => timeout.abort());

  try {
    const response = await fetch(`${ROOF_API_URL}/roof?lat=${latitude}&lon=${longitude}`, {
      signal: timeout.signal,
    });
    if (!response.ok) return null;

    const result = (await response.json()) as RoofApiResponse;
    const material = result.material ? MATERIAL_BY_CLASS[result.material] : undefined;
    if (!result.ok || !material) return null;

    const probabilities = Object.entries(result.probabilities ?? {})
      .filter(([name]) => name in MATERIAL_BY_CLASS)
      .map(([name, probability]) => ({ material: MATERIAL_BY_CLASS[name], probability }))
      .sort((a, b) => b.probability - a.probability);

    return {
      material,
      confidence: result.confidence ?? 0,
      shouldAskUser: result.ask_user ?? true,
      probabilities,
      modelVersion: result.model_version ?? null,
    };
  } finally {
    clearTimeout(timer);
  }
}
