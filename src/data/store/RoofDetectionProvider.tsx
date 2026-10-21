import { createContext, useContext, useState, type ReactNode } from 'react';

import type { DetectedMaterial } from '@/data/services/roofMaterialService';
import RoofModelEngine from '@/shared/components/RoofModelEngine';

import { useProjectActions, useProjectStore } from './ProjectProvider';
import type { RoofDetection } from './projectTypes';

export type RoofDetectionStatus = 'idle' | 'detecting' | 'failed' | 'done';

type RoofDetectionContextValue = {
  status: RoofDetectionStatus;
  detection: RoofDetection | null;
  retry: () => void;
};

const RoofDetectionContext = createContext<RoofDetectionContextValue | null>(null);

export function RoofDetectionProvider({ children }: { children: ReactNode }) {
  const { project } = useProjectStore();
  const { applyRoofDetection } = useProjectActions();
  const { building, roofDetection } = project;
  const [failedBuildingId, setFailedBuildingId] = useState<string | null>(null);

  const detection = building && roofDetection?.buildingId === building.id ? roofDetection : null;

  let status: RoofDetectionStatus;
  if (!building) {
    status = 'idle';
  } else if (detection) {
    status = 'done';
  } else if (failedBuildingId === building.id) {
    status = 'failed';
  } else {
    status = 'detecting';
  }

  const handleResult = (result: DetectedMaterial | null) => {
    if (!building) return;
    if (result) {
      applyRoofDetection({ ...result, buildingId: building.id });
    } else {
      setFailedBuildingId(building.id);
    }
  };

  const value: RoofDetectionContextValue = {
    status,
    detection,
    retry: () => setFailedBuildingId(null),
  };

  return (
    <RoofDetectionContext.Provider value={value}>
      {children}
      {status === 'detecting' && building ? (
        <RoofModelEngine
          coordinates={{ latitude: building.latitude, longitude: building.longitude }}
          onResult={handleResult}
        />
      ) : null}
    </RoofDetectionContext.Provider>
  );
}

export function useRoofDetection(): RoofDetectionContextValue {
  const context = useContext(RoofDetectionContext);
  if (!context) {
    throw new Error('useRoofDetection must be used inside RoofDetectionProvider');
  }
  return context;
}
