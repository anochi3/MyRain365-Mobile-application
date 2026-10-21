import type { DetectedMaterial } from '@/data/services/roofMaterialService';
import type { Coordinates } from '@/shared/geo';

export type RoofModelEngineProps = {
  coordinates: Coordinates | null;
  onResult: (detection: DetectedMaterial | null) => void;
};
