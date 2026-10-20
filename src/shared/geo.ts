export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type LonLat = [longitude: number, latitude: number];

export type Ring = LonLat[];

const EARTH_RADIUS_M = 6371008.8;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function isInsideRing({ latitude, longitude }: Coordinates, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[j];
    const crosses = y1 > latitude !== y2 > latitude;
    if (crosses && longitude < ((x2 - x1) * (latitude - y1)) / (y2 - y1) + x1) {
      inside = !inside;
    }
  }
  return inside;
}

export function distanceToRingDegrees({ latitude, longitude }: Coordinates, ring: Ring): number {
  let nearest = Infinity;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy || 1;
    const t = Math.max(
      0,
      Math.min(1, ((longitude - x1) * dx + (latitude - y1) * dy) / lengthSquared),
    );
    nearest = Math.min(nearest, Math.hypot(longitude - x1 - t * dx, latitude - y1 - t * dy));
  }
  return nearest;
}

export function ringAreaM2(ring: Ring): number {
  const meanLatitude = toRadians(
    ring.reduce((sum, [, latitude]) => sum + latitude, 0) / ring.length,
  );
  const points = ring.map(([longitude, latitude]) => [
    EARTH_RADIUS_M * toRadians(longitude) * Math.cos(meanLatitude),
    EARTH_RADIUS_M * toRadians(latitude),
  ]);
  let twiceArea = 0;
  for (let i = 0; i < points.length - 1; i++) {
    twiceArea += points[i][0] * points[i + 1][1] - points[i + 1][0] * points[i][1];
  }
  return Math.abs(twiceArea) / 2;
}
