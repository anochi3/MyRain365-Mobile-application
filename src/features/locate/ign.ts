// IGN Géoplateforme: free, no API key, CORS open. Licence Ouverte 2.0 (credit "IGN" on the map).
// The same sources the roof material model is trained on, so what the user sees is what the model reads.

const GEOPF = 'https://data.geopf.fr';

export type LatLon = { lat: number; lon: number };

export type Building = {
  id: string;
  outline: [number, number][]; // [lon, lat] ring
  areaM2: number;
  flatRoof: boolean | null;
  ignMaterial: string | null; // BD TOPO materiaux_de_la_toiture, often empty
};

export type Suggestion = LatLon & { label: string };

async function getJson(url: string, signal?: AbortSignal) {
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(`IGN ${r.status}`);
  return r.json();
}

// Address autocomplete while the user types.
export async function suggest(text: string, signal?: AbortSignal): Promise<Suggestion[]> {
  if (text.trim().length < 3) return [];
  const d = await getJson(
    `${GEOPF}/geocodage/completion?text=${encodeURIComponent(text)}&maximumResponses=5&type=StreetAddress`,
    signal,
  );
  return (d.results ?? []).map((r: any) => ({ lat: r.y, lon: r.x, label: r.fulltext }));
}

// Closest address to a point, shown under the pin.
export async function addressAt(p: LatLon, signal?: AbortSignal): Promise<string | null> {
  const d = await getJson(`${GEOPF}/geocodage/reverse?lon=${p.lon}&lat=${p.lat}&limit=1&index=address`, signal);
  const f = d.features?.[0];
  return f ? `${f.properties.name}, ${f.properties.city}` : null;
}

function inside(lon: number, lat: number, ring: number[][]) {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[j];
    if (y1 > lat !== y2 > lat && lon < ((x2 - x1) * (lat - y1)) / (y2 - y1) + x1) c = !c;
  }
  return c;
}

function distance(lon: number, lat: number, ring: number[][]) {
  let best = Infinity;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const t = Math.max(0, Math.min(1, ((lon - x1) * dx + (lat - y1) * dy) / (dx * dx + dy * dy || 1)));
    best = Math.min(best, Math.hypot(lon - x1 - t * dx, lat - y1 - t * dy));
  }
  return best;
}

// Shoelace formula on a local flat projection: plenty for a single building.
function areaM2(ring: number[][]) {
  const R = 6371008.8;
  const lat0 = (ring.reduce((s, c) => s + c[1], 0) / ring.length) * (Math.PI / 180);
  const pts = ring.map(([lo, la]) => [R * lo * (Math.PI / 180) * Math.cos(lat0), R * la * (Math.PI / 180)]);
  let s = 0;
  for (let i = 0; i < pts.length - 1; i++) s += pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1];
  return Math.abs(s) / 2;
}

// The BD TOPO building under the pin. Only accepts a building the pin is on, or one within about 6 m,
// so a pin dropped in the street says "no building" instead of guessing the neighbour.
export async function buildingAt(p: LatLon, signal?: AbortSignal): Promise<Building | null> {
  const e = 0.00025;
  const url =
    `${GEOPF}/wfs/ows?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=BDTOPO_V3:batiment` +
    `&OUTPUTFORMAT=application/json&COUNT=40` +
    `&BBOX=${p.lat - e},${p.lon - e},${p.lat + e},${p.lon + e},urn:ogc:def:crs:EPSG::4326`;
  const d = await getJson(url, signal);
  const feats: any[] = d.features ?? [];
  const main = feats.filter((f) => f.properties?.usage_1 !== 'Annexe');
  let best: any = null;
  let bestD = Infinity;
  for (const f of main.length ? main : feats) {
    const ring: number[][] = f.geometry.coordinates[0][0];
    const dd = inside(p.lon, p.lat, ring) ? 0 : distance(p.lon, p.lat, ring);
    if (dd < bestD) {
      best = f;
      bestD = dd;
    }
  }
  if (!best || bestD > 0.00008) return null;
  const ring: number[][] = best.geometry.coordinates[0][0];
  const pr = best.properties;
  const tmin = pr.altitude_minimale_toit;
  const tmax = pr.altitude_maximale_toit;
  return {
    id: pr.cleabs,
    outline: ring.map((c) => [c[0], c[1]] as [number, number]),
    areaM2: areaM2(ring),
    flatRoof: tmin == null || tmax == null ? null : tmax - tmin < 0.5,
    ignMaterial: pr.materiaux_de_la_toiture || null,
  };
}
