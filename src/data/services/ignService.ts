/**
 * IGN Géoplateforme, France's free national mapping service (no API key, Licence Ouverte 2.0):
 * address search, address under a point, building outlines (BD TOPO) and aerial photos (BD ORTHO).
 */
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

/** Tile address of the aerial photos used by the interactive map ({z}/{x}/{y} are filled in by Leaflet). */
export const IGN_AERIAL_TILE_URL =
  `${GEOPLATEFORME_URL}/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0` +
  '&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&TILEMATRIXSET=PM' +
  '&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg';

/** Zoom 19 is the sharpest level IGN serves, about 20 cm per pixel. */
export const IGN_AERIAL_MAX_ZOOM = 19;

export const IGN_ATTRIBUTION = '&copy; IGN';

// Look for buildings within about 25 m of the pin.
const BUILDING_SEARCH_RADIUS_DEG = 0.00025;
// Accept a building only if the pin is on it or within about 6 m, otherwise answer "no building".
const MAX_DISTANCE_TO_BUILDING_DEG = 0.00008;
// A roof whose highest and lowest points differ by less than 0.5 m is treated as flat.
const FLAT_ROOF_MAX_HEIGHT_M = 0.5;
const MIN_QUERY_LENGTH = 3;
const MAX_SUGGESTIONS = 5;

export type AddressSuggestion = Coordinates & {
  label: string;
};

/** A building as the app uses it: id, outline, roof area and what IGN knows about the roof. */
export type Building = {
  id: string;
  outline: Ring;
  roofAreaM2: number;
  isFlatRoof: boolean | null;
  roofMaterialCode: string | null;
};

/** The raw building record returned by IGN (only the fields we use). */
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

/** GET a URL and parse the JSON answer; any HTTP error becomes an exception. */
async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Géoplateforme request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

/** Address autocomplete while the user types (from 3 characters, 5 suggestions at most). */
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

/** The closest postal address to a point, shown in the search bar as "48 Rue des Fabricants, Roubaix". */
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

/** Converts an IGN record: area from the outline, flat roof from the roof heights, IGN material code. */
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

/**
 * The building under the pin:
 * 1. ask IGN for every building in a small square around the point,
 * 2. ignore annexes (sheds, garages) when a main building is available,
 * 3. keep the building the point is inside, or else the closest one,
 * 4. reject it if it is more than about 6 m away.
 */
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

/** Single aerial image for any rectangle (used for the roof preview and the welcome background). */
const AERIAL_WMS_URL =
  `${GEOPLATEFORME_URL}/wms-r/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap` +
  '&LAYERS=ORTHOIMAGERY.ORTHOPHOTOS&STYLES=&CRS=EPSG:4326&FORMAT=image/jpeg';

export type GeoBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

/**
 * Rectangle around a building, with some margin, matching the shape of the image it will fill.
 * Longitudes are multiplied by cos(latitude) so widths and heights are compared in the same units,
 * otherwise the photo would look stretched. The shorter side is then grown to match the aspect ratio.
 */
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

/** Image address for a rectangle; WMS 1.3.0 with EPSG:4326 expects south, west, north, east. */
export function aerialImageUrl(
  { south, west, north, east }: GeoBounds,
  width: number,
  height: number,
): string {
  return `${AERIAL_WMS_URL}&BBOX=${south},${west},${north},${east}&WIDTH=${Math.round(width)}&HEIGHT=${Math.round(height)}`;
}

/** IGN roof material codes: the first digit is the main material (1 tiles, 2 slate, 3 zinc/metal, 4 concrete). */
const IGN_MATERIAL_BY_DIGIT: Record<string, RoofMaterial> = {
  '1': 'tiles',
  '2': 'slate',
  '3': 'metal',
  '4': 'flat',
};

/** Main material from an IGN code such as "10" or "13"; "00" or empty means unknown. */
export function materialFromIgnCode(code: string | null): RoofMaterial | null {
  if (!code || code === '00') return null;
  return IGN_MATERIAL_BY_DIGIT[code[0]] ?? null;
}
