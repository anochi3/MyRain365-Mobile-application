import {
  IGN_AERIAL_MAX_ZOOM,
  IGN_AERIAL_TILE_URL,
  IGN_ATTRIBUTION,
} from '@/data/services/ignService';
import type { Coordinates } from '@/shared/geo';
import { colors } from '@/shared/global.styles';

import { MAP_COMMAND_CHANNEL, MAP_EVENT_CHANNEL } from './buildingMap.types';

const LEAFLET_URL = 'https://unpkg.com/leaflet@1.9.4/dist';
const MAX_ZOOM = 20;
const FLY_DURATION_S = 1.1;
const TAP_PAN_DURATION_S = 0.4;

type DocumentOptions = {
  center: Coordinates;
  zoom: number;
  outlineColor: string;
};

export function buildingMapDocument({ center, zoom, outlineColor }: DocumentOptions): string {
  const config = JSON.stringify({
    center: [center.latitude, center.longitude],
    zoom,
    maxZoom: MAX_ZOOM,
    tileUrl: IGN_AERIAL_TILE_URL,
    tileMaxZoom: IGN_AERIAL_MAX_ZOOM,
    attribution: IGN_ATTRIBUTION,
    outlineColor,
    outlineStroke: colors.cardBackground,
    flyDuration: FLY_DURATION_S,
    tapPanDuration: TAP_PAN_DURATION_S,
    commandChannel: MAP_COMMAND_CHANNEL,
    eventChannel: MAP_EVENT_CHANNEL,
  });

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="${LEAFLET_URL}/leaflet.css">
<script src="${LEAFLET_URL}/leaflet.js"></script>
<style>
  html, body, #map { margin: 0; height: 100%; background: ${colors.mapBackground}; }
  .leaflet-control-attribution { font: 10px system-ui, sans-serif; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  const config = ${config};

  const emit = (event) => {
    const message = JSON.stringify({ channel: config.eventChannel, event });
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(message);
    } else {
      window.parent.postMessage(message, '*');
    }
  };

  const map = L.map('map', { zoomControl: false, maxZoom: config.maxZoom }).setView(config.center, config.zoom);
  map.attributionControl.setPrefix(false);
  L.tileLayer(config.tileUrl, {
    maxNativeZoom: config.tileMaxZoom,
    maxZoom: config.maxZoom,
    attribution: config.attribution,
  }).addTo(map);

  let outline = null;
  let isUserInitiated = false;

  ['pointerdown', 'touchstart', 'wheel'].forEach((type) =>
    map.getContainer().addEventListener(type, () => { isUserInitiated = true; }, { passive: true }),
  );

  map.on('movestart', () => emit({ type: 'moveStart' }));
  map.on('moveend', () => {
    const { lat, lng } = map.getCenter();
    emit({ type: 'moveEnd', center: { latitude: lat, longitude: lng }, isUserInitiated });
    isUserInitiated = false;
  });
  map.on('click', ({ latlng }) => {
    isUserInitiated = true;
    map.panTo(latlng, { animate: true, duration: config.tapPanDuration });
  });

  const handlers = {
    flyTo: ({ center, zoom }) => {
      isUserInitiated = true;
      map.flyTo([center.latitude, center.longitude], zoom, { duration: config.flyDuration });
    },
    showOutline: ({ outline: ring }) => {
      if (outline) {
        map.removeLayer(outline);
        outline = null;
      }
      if (ring) {
        outline = L.polygon(ring.map(([longitude, latitude]) => [latitude, longitude]), {
          color: config.outlineStroke,
          weight: 2,
          fillColor: config.outlineColor,
          fillOpacity: 0.28,
          interactive: false,
        }).addTo(map);
      }
    },
  };

  window.receiveMapCommand = (command) => handlers[command.type]?.(command);

  window.addEventListener('message', ({ data }) => {
    try {
      const message = typeof data === 'string' ? JSON.parse(data) : data;
      if (message?.channel === config.commandChannel) {
        window.receiveMapCommand(message.command);
      }
    } catch {}
  });

  emit({ type: 'ready' });
</script>
</body>
</html>`;
}
