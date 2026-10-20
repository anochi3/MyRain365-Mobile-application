import type { Building } from '@/data/services/ignService';
import type { Coordinates } from '@/shared/geo';

export type SelectedRoof = {
  building: Building;
  center: Coordinates;
  address: string | null;
};

export type RoofSelectionStatus =
  | { kind: 'idle' }
  | { kind: 'locating' }
  | { kind: 'locationDenied'; canAskAgain: boolean }
  | { kind: 'loadingRoof' }
  | { kind: 'roofFound'; roof: SelectedRoof }
  | { kind: 'noBuilding' }
  | { kind: 'unavailable' };
