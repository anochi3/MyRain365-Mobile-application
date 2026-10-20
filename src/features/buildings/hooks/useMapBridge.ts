/** Shared logic of the native and web maps: builds the page once and queues commands until it is ready. */
import { useImperativeHandle, useRef, useState } from 'react';

import { buildingMapDocument } from '../components/buildingMapDocument';
import {
  MAP_EVENT_CHANNEL,
  type BuildingMapProps,
  type MapCommand,
  type MapEvent,
} from '../components/buildingMap.types';

const DEFAULT_FLY_ZOOM = 19;

export function useMapBridge(
  { ref, initialCenter, initialZoom, outlineColor, onMoveStart, onMoveEnd }: BuildingMapProps,
  deliver: (command: MapCommand) => void,
) {
  const isReady = useRef(false);
  const pendingCommands = useRef<MapCommand[]>([]);

  const [html] = useState(() =>
    buildingMapDocument({ center: initialCenter, zoom: initialZoom, outlineColor }),
  );

  // Commands sent before the map page has loaded are kept and delivered once it says "ready".
  const send = (command: MapCommand) => {
    if (isReady.current) {
      deliver(command);
    } else {
      pendingCommands.current.push(command);
    }
  };

  useImperativeHandle(ref, () => ({
    flyTo: (center, zoom = DEFAULT_FLY_ZOOM) => send({ type: 'flyTo', center, zoom }),
    showOutline: (outline) => send({ type: 'showOutline', outline }),
  }));

  // Messages from the map page: ignore anything that is not ours, then dispatch by type.
  const handleMessage = (raw: string) => {
    const message = JSON.parse(raw) as { channel?: string; event?: MapEvent };
    if (message.channel !== MAP_EVENT_CHANNEL || !message.event) {
      return;
    }

    const { event } = message;
    switch (event.type) {
      case 'ready':
        isReady.current = true;
        pendingCommands.current.splice(0).forEach(deliver);
        break;
      case 'moveStart':
        onMoveStart();
        break;
      case 'moveEnd':
        onMoveEnd(event.center, event.isUserInitiated);
        break;
    }
  };

  return { html, handleMessage };
}
