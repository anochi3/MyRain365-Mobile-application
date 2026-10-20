import type { RoofMaterial } from '@/data/store/projectTypes';
import {
  distanceToRingDegrees,
  isInsideRing,
  ringAreaM2,
  type Coordinates,
  type LonLat,
  type Ring,
} from '@/shared/geo';

const GEOPLATEFORME_URL = 'https://data.geopf.fr';

export const IGN_AERIAL_TILE_URL =
  `${GEOPLATEFORME_URL}/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0` +
  '&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&TILEMATRIXSET=PM' +
  '&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg';

export const IGN_AERIAL_MAX_ZOOM = 19;

export const IGN_ATTRIBUTION = '&copy; IGN';

const BUILDING_SEARCH_RADIUS_DEG = 0.00025;
const MAX_DISTANCE_TO_BUILDING_DEG = 0.00008;
const FLAT_ROOF_MAX_HEIGHT_M = 0.5;
const MIN_QUERY_LENGTH = 3;
const MAX_SUGGESTIONS = 5;

export type AddressSuggestion = Coordinates & {
  label: string;
};

export type Building = {
  id: string;
  outline: Ring;
  roofAreaM2: number;
  isFlatRoof: boolean | null;
  roofMaterialCode: string | null;
};

type BuildingFeature = {
  geometry: { coordinates: number[][][][] };
  properties: {
    cleabs: string;
    usage_1: string | null;
    materiaux_de_la_toiture: string | null;
    altitude_minimale_toit: number | null;
    altitude_maximale_toit: number | null;
  };
};

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Géoplateforme request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function suggestAddresses(
  query: string,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> {
  if (query.trim().length < MIN_QUERY_LENGTH) {
    return [];
  }

  const url =
    `${GEOPLATEFORME_URL}/geocodage/completion?type=StreetAddress` +
    `&maximumResponses=${MAX_SUGGESTIONS}&text=${encodeURIComponent(query)}`;
  const data = await fetchJson<{ results?: { x: number; y: number; fulltext: string }[] }>(
    url,
    signal,
  );

  return (data.results ?? []).map((result) => ({
    latitude: result.y,
    longitude: result.x,
    label: result.fulltext,
  }));
}

export async function reverseGeocode(
  { latitude, longitude }: Coordinates,
  signal?: AbortSignal,
): Promise<string | null> {
  const url = `${GEOPLATEFORME_URL}/geocodage/reverse?index=address&limit=1&lat=${latitude}&lon=${longitude}`;
  const data = await fetchJson<{ features?: { properties: { name: string; city: string } }[] }>(
    url,
    signal,
  );
  const place = data.features?.[0]?.properties;

  return place ? `${place.name}, ${place.city}` : null;
}

function toBuilding({ geometry, properties }: BuildingFeature): Building {
  const outline: Ring = geometry.coordinates[0][0].map(
    ([longitude, latitude]): LonLat => [longitude, latitude],
  );
  const roofLow = properties.altitude_minimale_toit;
  const roofHigh = properties.altitude_maximale_toit;

  return {
    id: properties.cleabs,
    outline,
    roofAreaM2: ringAreaM2(outline),
    isFlatRoof:
      roofLow == null || roofHigh == null ? null : roofHigh - roofLow < FLAT_ROOF_MAX_HEIGHT_M,
    roofMaterialCode: properties.materiaux_de_la_toiture || null,
  };
}

export async function findBuildingAt(
  point: Coordinates,
  signal?: AbortSignal,
): Promise<Building | null> {
  const { latitude, longitude } = point;
  const r = BUILDING_SEARCH_RADIUS_DEG;
  const bbox = [latitude - r, longitude - r, latitude + r, longitude + r].join(',');
  const url =
    `${GEOPLATEFORME_URL}/wfs/ows?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature` +
    `&TYPENAMES=BDTOPO_V3:batiment&OUTPUTFORMAT=application/json&COUNT=40` +
    `&BBOX=${bbox},urn:ogc:def:crs:EPSG::4326`;
  const { features = [] } = await fetchJson<{ features?: BuildingFeature[] }>(url, signal);

  const mainBuildings = features.filter((feature) => feature.properties.usage_1 !== 'Annexe');
  const candidates = mainBuildings.length > 0 ? mainBuildings : features;

  let nearest: BuildingFeature | null = null;
  let nearestDistance = Infinity;
  for (const feature of candidates) {
    const ring = feature.geometry.coordinates[0][0] as LonLat[];
    const distance = isInsideRing(point, ring) ? 0 : distanceToRingDegrees(point, ring);
    if (distance < nearestDistance) {
      nearest = feature;
      nearestDistance = distance;
    }
  }

  return nearest && nearestDistance <= MAX_DISTANCE_TO_BUILDING_DEG ? toBuilding(nearest) : null;
}

const AERIAL_WMS_URL =
  `${GEOPLATEFORME_URL}/wms-r/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap` +
  '&LAYERS=ORTHOIMAGERY.ORTHOPHOTOS&STYLES=&CRS=EPSG:4326&FORMAT=image/jpeg';

export type GeoBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

export function boundsAround(outline: Ring, paddingShare: number, aspectRatio: number): GeoBounds {
  const longitudes = outline.map(([longitude]) => longitude);
  const latitudes = outline.map(([, latitude]) => latitude);
  const centerLon = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
  const centerLat = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
  const lonScale = Math.cos((centerLat * Math.PI) / 180);
  let halfWidth = ((Math.max(...longitudes) - Math.min(...longitudes)) * lonScale) / 2;
  let halfHeight = (Math.max(...latitudes) - Math.min(...latitudes)) / 2;
  halfWidth *= 1 + paddingShare;
  halfHeight *= 1 + paddingShare;
  if (halfWidth / halfHeight > aspectRatio) {
    halfHeight = halfWidth / aspectRatio;
  } else {
    halfWidth = halfHeight * aspectRatio;
  }
  return {
    south: centerLat - halfHeight,
    north: centerLat + halfHeight,
    west: centerLon - halfWidth / lonScale,
    east: centerLon + halfWidth / lonScale,
  };
}

export function aerialImageUrl(
  { south, west, north, east }: GeoBounds,
  width: number,
  height: number,
): string {
  return `${AERIAL_WMS_URL}&BBOX=${south},${west},${north},${east}&WIDTH=${Math.round(width)}&HEIGHT=${Math.round(height)}`;
}

const IGN_MATERIAL_BY_DIGIT: Record<string, RoofMaterial> = {
  '1': 'tiles',
  '2': 'slate',
  '3': 'metal',
  '4': 'flat',
};

export function materialFromIgnCode(code: string | null): RoofMaterial | null {
  if (!code || code === '00') return null;
  return IGN_MATERIAL_BY_DIGIT[code[0]] ?? null;
}
