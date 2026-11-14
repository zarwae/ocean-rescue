import * as THREE from 'three';

/**
 * Convert geographic latitude & longitude (degrees) to 3D Cartesian point on sphere.
 */
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Convert geographic latitude & longitude to 2D equirectangular SVG coordinates.
 */
export function latLngToSvgXY(
  lat: number,
  lng: number,
  width: number,
  height: number
): { x: number; y: number } {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
}

/**
 * Interpolate a smooth curved path on sphere surface between geographic waypoints.
 */
export function buildSphericalArcPoints(
  waypoints: [number, number][],
  radius: number,
  stepsPerSegment = 16
): THREE.Vector3[] {
  if (waypoints.length < 2) return [];
  const result: THREE.Vector3[] = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = latLngToVector3(waypoints[i][0], waypoints[i][1], radius).normalize();
    const end = latLngToVector3(waypoints[i + 1][0], waypoints[i + 1][1], radius).normalize();

    for (let s = 0; s <= stepsPerSegment; s++) {
      if (i > 0 && s === 0) continue;
      const t = s / stepsPerSegment;
      const interp = new THREE.Vector3().lerpVectors(start, end, t).normalize().multiplyScalar(radius);
      result.push(interp);
    }
  }

  return result;
}
