import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clampPlayerPosition,
  computeBobberTargetPosition,
  findNearestNpc,
  findNearestOutpostBeacon,
  FISCH_NPC_SPAWNS,
  getGroundHeightAt,
  isOnWoodenPier,
  resolveBoatPosition,
  waterHeightAt,
} from './fisch3dWorld.ts';

test('waterHeightAt produces smooth bounded wave displacement', () => {
  const samples = [
    waterHeightAt(0, 12, 0),
    waterHeightAt(4.5, 16, 1.25),
    waterHeightAt(-8, 22, 3.7),
  ];
  for (const h of samples) {
    assert.ok(Number.isFinite(h));
    assert.ok(Math.abs(h) <= 0.35, `Expected wave height within +-0.35, got ${h}`);
  }
});

test('wooden pier and island ground height are solid and aligned', () => {
  assert.equal(isOnWoodenPier(0, 6), true);
  assert.equal(isOnWoodenPier(4.2, 10), true);
  assert.equal(isOnWoodenPier(0, 14), false);

  assert.equal(getGroundHeightAt('moosewood', 0, 6), 0.96);
  assert.ok(getGroundHeightAt('moosewood', 0, -6) >= 0.72);
  assert.ok(getGroundHeightAt('roslit_volcano', 0, -10) > getGroundHeightAt('moosewood', 0, 6));
});

test('clampPlayerPosition keeps avatar on pier or island and slides cleanly along edges', () => {
  const onPier = clampPlayerPosition('moosewood', 0, 5, 0.5, 6);
  assert.equal(onPier.x, 0.5);
  assert.equal(onPier.z, 6);

  // Attempting to walk straight into deep water past pier edge clamps Z cleanly
  const edgeClamp = clampPlayerPosition('moosewood', 0, 11.4, 0.4, 15.0);
  assert.equal(edgeClamp.z, 11.4);
  assert.equal(edgeClamp.x, 0.4);
});

test('findNearestNpc detects NPCs within interaction distance', () => {
  const merchant = FISCH_NPC_SPAWNS.find((n) => n.role === 'merchant')!;
  const found = findNearestNpc(merchant.x + 1.0, merchant.z - 0.5, 3.2);
  assert.ok(found);
  assert.equal(found.id, merchant.id);

  const none = findNearestNpc(0, 11, 3.2);
  assert.equal(none, null);
});

test('computeBobberTargetPosition strictly projects bobber along player yaw into water', () => {
  // Facing back (-Z, yaw = PI) casts strictly behind player across island into open water (-Z)
  const backFacing = computeBobberTargetPosition(0, 5, Math.PI, 0.8);
  assert.ok(backFacing.z < -12, `Expected z < -12 when facing PI, got ${backFacing.z}`);
  assert.ok(Math.abs(backFacing.x) < 0.01);

  // Facing right (+X, yaw = PI / 2) casts strictly to +X
  const sideFacing = computeBobberTargetPosition(0, 10, Math.PI / 2, 0.7);
  assert.ok(sideFacing.x > 10);
  assert.ok(Math.abs(sideFacing.z - 10) < 0.01);

  // Facing ocean (+Z, yaw = 0) projects cleanly ahead
  const seaFacing = computeBobberTargetPosition(0, 10, 0, 0.86);
  assert.ok(seaFacing.z > 14);
});

test('resolveBoatPosition collides cleanly around pier and findNearestOutpostBeacon detects boat islands', () => {
  const blockedPier = resolveBoatPosition(-6.8, 13.5, 0, 10.5);
  assert.ok(blockedPier.z >= 12.9 || blockedPier.x !== 0);

  const outpost = findNearestOutpostBeacon(-48, 42, 15.5);
  assert.ok(outpost);
  assert.equal(outpost.islandId, 'forsaken_shores');

  const noOutpost = findNearestOutpostBeacon(0, 15, 15.5);
  assert.equal(noOutpost, null);
});
