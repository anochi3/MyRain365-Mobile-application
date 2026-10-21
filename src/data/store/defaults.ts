import { DEFAULT_TANK_L } from '@/data/calculations/constants';

import type { Preferences, Project } from './projectTypes';

export const DEFAULT_PEOPLE = 3;
export const DEFAULT_SHARED_HOMES = 10;

export const emptyProject: Project = {
  building: null,
  roof: {
    areaM2: 0,
    material: 'tiles',
    materialSource: 'guess',
    materialConfidence: null,
    drainedShare: 1,
  },
  roofDetection: null,
  household: {
    people: DEFAULT_PEOPLE,
    uses: { toilets: true, laundry: true, garden: true, cleaning: false, drinking: false },
  },
  site: {
    kind: 'private',
    isCouree: false,
    sharedHomes: DEFAULT_SHARED_HOMES,
    tankSpace: 'buried',
  },
  quality: {
    roofCondition: 'good',
    pollution: 'none',
  },
  access: [],
  tankLitres: DEFAULT_TANK_L,
  installedOn: null,
  completedAt: null,
};

export const defaultPreferences: Preferences = {
  language: 'en',
  includeSewerCharge: true,
  notifications: { weather: true, tank: true, maintenance: true, neighbours: true },
};

export const exampleProject: Project = {
  ...emptyProject,
  building: {
    id: 'BATIMENT0000000289248776',
    address: '48 Rue des Fabricants, Roubaix',
    latitude: 50.690304,
    longitude: 3.170804,
    outline: [
      [3.1708362, 50.6903043],
      [3.1707529, 50.6903134],
      [3.1707702, 50.6904274],
      [3.1708073, 50.6905296],
      [3.1708327, 50.6905269],
      [3.1708154, 50.6904183],
      [3.1708521, 50.6904147],
      [3.1708362, 50.6903043],
    ],
    footprintM2: 103.7,
    isFlatRoof: false,
  },
  roof: {
    areaM2: 103.7,
    material: 'tiles',
    materialSource: 'ign',
    materialConfidence: null,
    drainedShare: 1,
  },
  roofDetection: null,
  site: {
    kind: 'private',
    isCouree: true,
    sharedHomes: DEFAULT_SHARED_HOMES,
    tankSpace: 'buried',
  },
  completedAt: '2026-10-20',
};
