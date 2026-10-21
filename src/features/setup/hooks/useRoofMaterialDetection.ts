import { useEffect, useRef, useState } from 'react';

import type { DetectedMaterial } from '@/data/services/roofMaterialService';
import { useProjectActions, useProjectStore } from '@/data/store/ProjectProvider';
import type { MaterialSource, RoofMaterial } from '@/data/store/projectTypes';

import type { RoofModelEngineProps } from '../components/roofModelEngine.types';

const AUTO_APPLY_CONFIDENCE = 0.6;

export type DetectionState =
  | { status: 'disabled' }
  | { status: 'detecting' }
  | { status: 'failed' }
  | { status: 'done'; detection: DetectedMaterial; agreesWithChoice: boolean };

type Outcome = { buildingId: string; detection: DetectedMaterial | null };

export function useRoofMaterialDetection() {
  const { project } = useProjectStore();
  const { updateRoof } = useProjectActions();
  const { building, roof } = project;
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const materialSource = useRef<MaterialSource>(roof.materialSource);

  useEffect(() => {
    materialSource.current = roof.materialSource;
  }, [roof.materialSource]);

  const handleResult = (detection: DetectedMaterial | null) => {
    if (!building) return;
    setOutcome({ buildingId: building.id, detection });

    const isUnset = materialSource.current !== 'user' && materialSource.current !== 'ign';
    if (detection && isUnset && detection.confidence >= AUTO_APPLY_CONFIDENCE) {
      updateRoof({
        material: detection.material,
        materialSource: 'model',
        materialConfidence: detection.confidence,
      });
    }
  };

  const applySuggestion = (material: RoofMaterial) => {
    const detection = outcome?.detection;
    const match = detection?.probabilities.find((item) => item.material === material);
    updateRoof({
      material,
      materialSource: 'model',
      materialConfidence: match?.probability ?? null,
    });
  };

  let state: DetectionState;
  if (!building) {
    state = { status: 'disabled' };
  } else if (outcome?.buildingId !== building.id) {
    state = { status: 'detecting' };
  } else if (outcome.detection) {
    state = {
      status: 'done',
      detection: outcome.detection,
      agreesWithChoice: outcome.detection.material === roof.material,
    };
  } else {
    state = { status: 'failed' };
  }

  const engine: RoofModelEngineProps = {
    coordinates: building ? { latitude: building.latitude, longitude: building.longitude } : null,
    onResult: handleResult,
  };

  return { state, applySuggestion, engine };
}
