import { Asset } from 'expo-asset';

import treesModel from '@/assets/roof-model/colour_trees.bin';
import convnextModel from '@/assets/roof-model/convnext.onnx';
import efficientnetModel from '@/assets/roof-model/efficientnet.onnx';
import engineDocument from '@/assets/roof-model/engine.html';
import roofModelMeta from '@/assets/roof-model/meta.json';
import type { RoofMaterial } from '@/data/store/projectTypes';
import type { Coordinates } from '@/shared/geo';

export const ROOF_MODEL_CHANNEL = 'myrain365-roof-model';

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

export type RoofModelCommand = {
  type: 'detect';
  id: number;
  lat: number;
  lon: number;
  files: { convnext: string; efficientnet: string; trees: string };
  meta: typeof roofModelMeta;
};

type EngineResult = {
  ok: boolean;
  material?: string;
  confidence?: number;
  ask_user?: boolean;
  probabilities?: Record<string, number>;
  model_version?: string | null;
};

export type RoofModelMessage =
  | { type: 'ready' }
  | { type: 'result'; id: number; result: EngineResult };

const uriOf = (module: number) => Asset.fromModule(module).uri;

export const roofModelEngineUri = () => uriOf(engineDocument);

export function detectionCommand(
  id: number,
  { latitude, longitude }: Coordinates,
): RoofModelCommand {
  return {
    type: 'detect',
    id,
    lat: latitude,
    lon: longitude,
    files: {
      convnext: uriOf(convnextModel),
      efficientnet: uriOf(efficientnetModel),
      trees: uriOf(treesModel),
    },
    meta: roofModelMeta,
  };
}

export function parseRoofModelMessage(raw: string): RoofModelMessage | null {
  try {
    const message = JSON.parse(raw) as { channel?: string } & RoofModelMessage;
    return message.channel === ROOF_MODEL_CHANNEL ? message : null;
  } catch {
    return null;
  }
}

export function toDetectedMaterial(result: EngineResult): DetectedMaterial | null {
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
}
