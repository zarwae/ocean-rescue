import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clampPlayerPosition,
  computeBobberTargetPosition,
  findNearestHarborBeacon,
  findNearestNpc,
  FISCH_NPC_SPAWNS,
  getGroundHeightAt,
  getIslandNpcSpawns,
  getNeighborHarborBeacons,
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

test('wooden pier and enlarged island ground height are solid and aligned', () => {
  assert.equal(isOnWoodenPier(0, 10), true);
  assert.equal(isOnWoodenPier(6.0, 14.8), true);
  assert.equal(isOnWoodenPier(0, 19.0), false);

  assert.equal(getGroundHeightAt('moosewood', 0, 10), 0.96);
  assert.ok(getGroundHeightAt('moosewood', 0, -9.5) >= 0.74);
  assert.ok(getGroundHeightAt('roslit_volcano', 0, -15) > getGroundHeightAt('moosewood', 0, 10));
});

test('clampPlayerPosition keeps avatar on enlarged pier or island and slides cleanly along edges', () => {
  const onPier = clampPlayerPosition('moosewood', 0, 8, 0.5, 11);
  assert.equal(onPier.x, 0.5);
  assert.equal(onPier.z, 11);

  // Attempting to walk straight into deep water past T-dock edge (z = 16.6) clamps Z cleanly
  const edgeClamp = clampPlayerPosition('moosewood', 0, 16.4, 0.4, 21.0);
  assert.equal(edgeClamp.z, 16.4);
  assert.equal(edgeClamp.x, 0.4);
});

test('getIslandNpcSpawns assigns unique Merchant and Appraiser personas per island and findNearestNpc detects them', () => {
  const moosewoodNpcs = getIslandNpcSpawns('moosewood');
  const volcanoNpcs = getIslandNpcSpawns('roslit_volcano');
  const mwMerchant = moosewoodNpcs.find((n) => n.role === 'merchant')!;
  const rvMerchant = volcanoNpcs.find((n) => n.role === 'merchant')!;
  const mwAppraiser = moosewoodNpcs.find((n) => n.role === 'appraiser')!;
  const rvAppraiser = volcanoNpcs.find((n) => n.role === 'appraiser')!;

  assert.notEqual(mwMerchant.name, rvMerchant.name);
  assert.notEqual(mwMerchant.stallStyle, rvMerchant.stallStyle);
  assert.notEqual(mwAppraiser.name, rvAppraiser.name);
  assert.notEqual(mwAppraiser.tableStyle, rvAppraiser.tableStyle);

  const merchant = FISCH_NPC_SPAWNS.find((n) => n.role === 'merchant')!;
  const found = findNearestNpc(merchant.x + 1.0, merchant.z - 0.5, 3.6, moosewoodNpcs);
  assert.ok(found);
  assert.equal(found.id, mwMerchant.id);

  const none = findNearestNpc(0, 10, 3.6, moosewoodNpcs);
  assert.equal(none, null);
});

test('computeBobberTargetPosition strictly projects bobber along player yaw into water', () => {
  // Facing back (-Z, yaw = PI) casts strictly behind player across enlarged island into open water (-Z)
  const backFacing = computeBobberTargetPosition(0, 5, Math.PI, 0.8);
  assert.ok(backFacing.z < -20, `Expected z < -20 when facing PI, got ${backFacing.z}`);
  assert.ok(Math.abs(backFacing.x) < 0.01);

  // Facing right (+X, yaw = PI / 2) casts strictly to +X
  const sideFacing = computeBobberTargetPosition(0, 14, Math.PI / 2, 0.7);
  assert.ok(sideFacing.x > 10);
  assert.ok(Math.abs(sideFacing.z - 14) < 0.01);

  // Facing ocean (+Z, yaw = 0) projects cleanly ahead
  const seaFacing = computeBobberTargetPosition(0, 15, 0, 0.86);
  assert.ok(seaFacing.z > 20);
});

test('getNeighborHarborBeacons provides 10 neighbor islands and resolveBoatPosition/findNearestHarborBeacon work dynamically', () => {
  const neighborsFromMoosewood = getNeighborHarborBeacons('moosewood');
  assert.equal(neighborsFromMoosewood.length, 10);

  const blockedPier = resolveBoatPosition(-9.6, 15.0, 0, 15.0, 'moosewood');
  assert.ok(blockedPier.x !== 0 || blockedPier.z >= 15.0);

  const forsaken = findNearestHarborBeacon(-48, 16, 'moosewood', 17.5);
  assert.ok(forsaken);
  assert.equal(forsaken.islandId, 'forsaken_shores');

  const noHarborAtOrigin = findNearestHarborBeacon(0, 16, 'moosewood', 17.5);
  assert.equal(noHarborAtOrigin, null);

  // From Roslit Bay (worldCoords 0, 52), Moosewood sits at relative (0, -52)
  const returnToMoosewood = findNearestHarborBeacon(0, -52, 'roslit_bay', 17.5);
  assert.ok(returnToMoosewood);
  assert.equal(returnToMoosewood.islandId, 'moosewood');
});
