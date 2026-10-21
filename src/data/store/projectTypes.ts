import type { LonLat } from '@/shared/geo';

export type Language = 'en' | 'fr';

export type RoofMaterial = 'tiles' | 'slate' | 'metal' | 'flat' | 'green' | 'thatched';

export type WaterUse = 'toilets' | 'laundry' | 'garden' | 'cleaning' | 'drinking';

export type SiteKind = 'private' | 'shared';

export type TankSpace = 'buried' | 'wall' | 'none';

export type RoofCondition = 'good' | 'average' | 'poor';

export type PollutionSource = 'none' | 'traffic' | 'industry' | 'agriculture';

export type AccessNeed = 'stepFreeAccess' | 'easyTap' | 'lightMaintenance' | 'helpNeeded';

export type MaterialSource = 'model' | 'ign' | 'user' | 'guess';

export type Building = {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  outline: LonLat[];
  footprintM2: number;
  isFlatRoof: boolean | null;
};

export type Roof = {
  areaM2: number;
  material: RoofMaterial;
  materialSource: MaterialSource;
  materialConfidence: number | null;
  drainedShare: number;
};

export type Household = {
  people: number;
  uses: Record<WaterUse, boolean>;
};

export type Site = {
  kind: SiteKind;
  isCouree: boolean;
  sharedHomes: number;
  tankSpace: TankSpace;
};

export type Quality = {
  roofCondition: RoofCondition;
  pollution: PollutionSource;
};

export type RoofDetection = {
  buildingId: string;
  material: RoofMaterial;
  confidence: number;
  shouldAskUser: boolean;
  probabilities: { material: RoofMaterial; probability: number }[];
  modelVersion: string | null;
};

export type Project = {
  building: Building | null;
  roof: Roof;
  roofDetection: RoofDetection | null;
  household: Household;
  site: Site;
  quality: Quality;
  access: AccessNeed[];
  tankLitres: number;
  installedOn: string | null;
  completedAt: string | null;
};

export type Preferences = {
  language: Language;
  includeSewerCharge: boolean;
  notifications: {
    weather: boolean;
    tank: boolean;
    maintenance: boolean;
    neighbours: boolean;
  };
};
