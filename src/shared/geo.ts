/**
 * Small geometry toolkit for building outlines: is a point inside a building, how far is it from
 * one, and how big is its roof seen from above.
 */
export type Coordinates = {
  latitude: number;
  longitude: number;
};

/** A map point in GeoJSON order: longitude first, then latitude (both in degrees). */
export type LonLat = [longitude: number, latitude: number];

/** A closed outline: the last point repeats the first. */
export type Ring = LonLat[];

/** Mean radius of the Earth in metres. */
const EARTH_RADIUS_M = 6371008.8;

/** Trigonometry works in radians: radians = degrees × π ÷ 180. */
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * Ray casting test: draw an imaginary line from the point towards the east and count how many edges
 * of the outline it crosses. An odd number of crossings means the point is inside.
 */
export function isInsideRing({ latitude, longitude }: Coordinates, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[j];
    // Does this edge span the point's latitude (one end above, the other below)?
    const crosses = y1 > latitude !== y2 > latitude;
    // If so, find where the edge meets that latitude; a crossing counts when it lies east of the point.
    if (crosses && longitude < ((x2 - x1) * (latitude - y1)) / (y2 - y1) + x1) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Shortest distance from the point to the outline, in degrees (only used to compare buildings, so
 * no conversion to metres is needed). For each edge, the closest point on that edge is found by
 * projecting the point onto the edge and clamping the result between the edge's two ends.
 */
export function distanceToRingDegrees({ latitude, longitude }: Coordinates, ring: Ring): number {
  let nearest = Infinity;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    const dx = x2 - x1;
    const dy = y2 - y1;
    // t is how far along the edge the closest point lies: 0 = start, 1 = end.
    const lengthSquared = dx * dx + dy * dy || 1;
    const t = Math.max(
      0,
      Math.min(1, ((longitude - x1) * dx + (latitude - y1) * dy) / lengthSquared),
    );
    nearest = Math.min(nearest, Math.hypot(longitude - x1 - t * dx, latitude - y1 - t * dy));
  }
  return nearest;
}

/**
 * Roof area seen from above, in square metres.
 *
 * 1. Convert each corner from degrees to metres on a flat local map:
 *      x = R × longitude (radians) × cos(average latitude)
 *      y = R × latitude (radians)
 *    The cos() shrinks east-west distances, because longitude lines get closer towards the poles.
 *    For something the size of a building, this flat approximation is off by far less than 0.1%.
 * 2. Apply the shoelace formula, the exact area of any polygon from its corners:
 *      area = ½ × | Σ (xᵢ × yᵢ₊₁ − xᵢ₊₁ × yᵢ) |
 */
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
