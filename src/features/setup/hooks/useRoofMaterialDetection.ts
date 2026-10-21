import { useEffect, useRef, useState } from 'react';

import {
  detectRoofMaterial,
  isRoofModelAvailable,
  type DetectedMaterial,
} from '@/data/services/roofMaterialService';
import { useProjectActions, useProjectStore } from '@/data/store/ProjectProvider';
import type { MaterialSource, RoofMaterial } from '@/data/store/projectTypes';

const AUTO_APPLY_CONFIDENCE = 0.6;

export type DetectionState =
  | { status: 'disabled' }
  | { status: 'detecting' }
  | { status: 'failed' }
  | { status: 'done'; detection: DetectedMaterial; agreesWithChoice: boolean };

export function useRoofMaterialDetection() {
  const { project } = useProjectStore();
  const { updateRoof } = useProjectActions();
  const { building, roof } = project;
  const [detection, setDetection] = useState<DetectedMaterial | null>(null);
  const [hasFailed, setHasFailed] = useState(false);
  const materialSource = useRef<MaterialSource>(roof.materialSource);

  useEffect(() => {
    materialSource.current = roof.materialSource;
  }, [roof.materialSource]);

  useEffect(() => {
    if (!building || !isRoofModelAvailable) return;
    const controller = new AbortController();

    detectRoofMaterial(building, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        if (!result) {
          setHasFailed(true);
          return;
        }
        setDetection(result);
        const isUnset = materialSource.current !== 'user' && materialSource.current !== 'ign';
        if (isUnset && result.confidence >= AUTO_APPLY_CONFIDENCE) {
          updateRoof({
            material: result.material,
            materialSource: 'model',
            materialConfidence: result.confidence,
          });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasFailed(true);
      });

    return () => controller.abort();
  }, [building, updateRoof]);

  const applySuggestion = (material: RoofMaterial) => {
    const match = detection?.probabilities.find((item) => item.material === material);
    updateRoof({
      material,
      materialSource: 'model',
      materialConfidence: match?.probability ?? null,
    });
  };

  let state: DetectionState;
  if (!isRoofModelAvailable || !building) {
    state = { status: 'disabled' };
  } else if (detection) {
    state = { status: 'done', detection, agreesWithChoice: detection.material === roof.material };
  } else if (hasFailed) {
    state = { status: 'failed' };
  } else {
    state = { status: 'detecting' };
  }

  return { state, applySuggestion };
}
