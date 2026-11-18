import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clampPlayerPosition,
  computeBobberTargetPosition,
  findNearestNpc,
  FISCH_NPC_SPAWNS,
  getGroundHeightAt,
  isOnWoodenPier,
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

test('computeBobberTargetPosition always projects bobber into open water', () => {
  // Even if facing inland (-Z), bobber projects safely out to open sea (+Z)
  const inlandFacing = computeBobberTargetPosition(0, 5, Math.PI, 0.8);
  assert.ok(inlandFacing.z >= 12);

  // Facing ocean (+Z) projects cleanly ahead
  const seaFacing = computeBobberTargetPosition(0, 10, 0, 0.86);
  assert.ok(seaFacing.z > 14);
});
