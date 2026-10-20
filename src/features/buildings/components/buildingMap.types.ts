import type { Ref } from 'react';

import type { Coordinates, Ring } from '@/shared/geo';

export const MAP_COMMAND_CHANNEL = 'myrain365:map-command';
export const MAP_EVENT_CHANNEL = 'myrain365:map-event';

export type MapCommand =
  | { type: 'flyTo'; center: Coordinates; zoom: number }
  | { type: 'showOutline'; outline: Ring | null };

export type MapEvent =
  | { type: 'ready' }
  | { type: 'moveStart' }
  | { type: 'moveEnd'; center: Coordinates; isUserInitiated: boolean };

export type BuildingMapHandle = {
  flyTo: (center: Coordinates, zoom?: number) => void;
  showOutline: (outline: Ring | null) => void;
};

export type BuildingMapProps = {
  ref?: Ref<BuildingMapHandle>;
  initialCenter: Coordinates;
  initialZoom: number;
  outlineColor: string;
  onMoveStart: () => void;
  onMoveEnd: (center: Coordinates, isUserInitiated: boolean) => void;
};
