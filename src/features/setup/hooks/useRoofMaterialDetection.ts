import { useProjectActions, useProjectStore } from '@/data/store/ProjectProvider';
import type { RoofMaterial } from '@/data/store/projectTypes';
import { useRoofDetection } from '@/data/store/RoofDetectionProvider';

export function useRoofMaterialDetection() {
  const { project } = useProjectStore();
  const { updateRoof } = useProjectActions();
  const { status, detection, retry } = useRoofDetection();
  const { roof } = project;

  const applySuggestion = (material: RoofMaterial) => {
    const match = detection?.probabilities.find((item) => item.material === material);
    updateRoof({
      material,
      materialSource: 'model',
      materialConfidence: match?.probability ?? null,
    });
  };

  const isChosenByAi = roof.materialSource === 'model' && detection?.material === roof.material;

  return { status, detection, isChosenByAi, applySuggestion, retry };
}
