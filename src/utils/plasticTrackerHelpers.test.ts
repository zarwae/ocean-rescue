import test from 'node:test';
import assert from 'node:assert/strict';
import { latLngToVector3, latLngToSvgXY, buildSphericalArcPoints } from './plasticTrackerHelpers';
import {
  kmhToMs,
  degreesToCompass,
  buildBaselineStationCurrents,
  OBSERVATION_STATIONS,
} from '../data/plasticTrackerData';

test('latLngToVector3 places coordinates accurately on the sphere radius', () => {
  const radius = 2.0;

  // North pole should sit at y = +radius
  const northPole = latLngToVector3(90, 0, radius);
  assert.ok(Math.abs(northPole.y - radius) < 1e-6);
  assert.ok(Math.abs(northPole.x) < 1e-6);
  assert.ok(Math.abs(northPole.z) < 1e-6);

  // South pole should sit at y = -radius
  const southPole = latLngToVector3(-90, 0, radius);
  assert.ok(Math.abs(southPole.y + radius) < 1e-6);

  // Equator point should have norm === radius and y === 0
  const eq = latLngToVector3(0, 118.5, radius);
  assert.ok(Math.abs(eq.length() - radius) < 1e-6);
  assert.ok(Math.abs(eq.y) < 1e-6);
});

test('latLngToSvgXY projects geographic bounds into 2D equirectangular viewport', () => {
  const width = 1000;
  const height = 500;

  const topLeft = latLngToSvgXY(90, -180, width, height);
  assert.equal(topLeft.x, 0);
  assert.equal(topLeft.y, 0);

  const center = latLngToSvgXY(0, 0, width, height);
  assert.equal(center.x, 500);
  assert.equal(center.y, 250);

  const bottomRight = latLngToSvgXY(-90, 180, width, height);
  assert.equal(bottomRight.x, 1000);
  assert.equal(bottomRight.y, 500);
});

test('buildSphericalArcPoints interpolates waypoints along the sphere surface', () => {
  const radius = 2.05;
  const arc = buildSphericalArcPoints(
    [
      [0, 120],
      [20, 150],
      [35, -145],
    ],
    radius,
    8
  );

  assert.equal(arc.length, 17);
  for (const pt of arc) {
    assert.ok(Math.abs(pt.length() - radius) < 1e-5);
  }
});

test('kmhToMs and degreesToCompass format oceanographic velocity and bearings properly', () => {
  assert.equal(kmhToMs(3.6), 1);
  assert.equal(kmhToMs(1.8), 0.5);

  assert.equal(degreesToCompass(0), 'U');
  assert.equal(degreesToCompass(90), 'T');
  assert.equal(degreesToCompass(180), 'S');
  assert.equal(degreesToCompass(270), 'B');
  assert.equal(degreesToCompass(-45), 'BL');
});

test('buildBaselineStationCurrents generates valid HISTORICAL_BASELINE entries for all stations', () => {
  const baseline = buildBaselineStationCurrents();
  assert.equal(Object.keys(baseline).length, OBSERVATION_STATIONS.length);

  for (const station of OBSERVATION_STATIONS) {
    const entry = baseline[station.id];
    assert.ok(entry, `Missing baseline entry for ${station.id}`);
    assert.equal(entry.provenance, 'HISTORICAL_BASELINE');
    assert.equal(entry.velocityKmh, station.baselineVelocityKmh);
    assert.equal(entry.velocityMs, kmhToMs(station.baselineVelocityKmh));
  }
});
