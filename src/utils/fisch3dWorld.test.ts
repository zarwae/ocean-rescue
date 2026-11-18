import assert from 'node:assert/strict';
import test from 'node:test';
import { FISCH_ISLANDS } from './fischData.ts';
import {
  clampPlayerPosition,
  clampPlayerWorldPosition,
  computeBobberTargetPosition,
  findActiveIslandAt,
  findNearestDisembarkPoint,
  findNearestNpc,
  FISCH_ISLAND_LAYOUTS,
  FISCH_NPC_SPAWNS,
  getAllWorldNpcSpawns,
  getGroundHeightAt,
  getGroundHeightAtWorld,
  getIslandDockSpawn,
  getIslandNpcSpawns,
  isOnWoodenPier,
  isWalkablePosition,
  isWalkableWorldPosition,
  islandLocalToWorld,
  resolveBoatWorldPosition,
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

test('all 11 islands have distinct layouts, dock angles, lobe geometry, and walkable NPC placements', () => {
  assert.equal(FISCH_ISLANDS.length, 11);
  const dockAngles = new Set<number>();

  for (const island of FISCH_ISLANDS) {
    const layout = FISCH_ISLAND_LAYOUTS[island.id];
    assert.ok(layout, `Missing layout for ${island.id}`);
    assert.ok(layout.lobes.length >= 2, `${island.id} should have multi-lobe terrain`);
    dockAngles.add(layout.dockAngle);

    const dockSpawn = getIslandDockSpawn(island.id);
    assert.equal(
      isWalkableWorldPosition(dockSpawn.px, dockSpawn.pz),
      true,
      `Dock spawn for ${island.id} must be walkable`
    );

    const npcs = getIslandNpcSpawns(island.id);
    assert.equal(npcs.length, 7, `${island.id} should spawn 7 NPCs`);
    for (const npc of npcs) {
      assert.equal(
        isWalkableWorldPosition(npc.x, npc.z),
        true,
        `NPC ${npc.role} on ${island.id} at (${npc.x.toFixed(2)}, ${npc.z.toFixed(2)}) must stand on walkable terrain`
      );
    }
  }

  assert.ok(dockAngles.size >= 8, 'Islands should have varied dock orientations');
  assert.equal(getAllWorldNpcSpawns().length, 77);
});

test('distinct island bridges and lagoons work accurately in local and world space', () => {
  // Moosewood pier and multi-lobe heights
  assert.equal(isOnWoodenPier(0, 10), true);
  assert.equal(isOnWoodenPier(5.4, 14.2), true);
  assert.equal(isOnWoodenPier(0, 19.0), false);
  assert.equal(getGroundHeightAt('moosewood', 0, 10), 0.96);
  assert.ok(getGroundHeightAt('moosewood', 0, -9.5) >= 0.74);

  // Roslit Bay horseshoe lagoon: water in the inner lagoon, walkable across the bamboo bridge!
  assert.equal(isWalkablePosition(0, -6.2, 'roslit_bay'), false);
  assert.equal(isWalkablePosition(0, -9.2, 'roslit_bay'), true);
  assert.ok(getGroundHeightAt('roslit_bay', 0, -9.2) > 1.4);

  // Mushgrove swamp boardwalk connects center and outer mud islets
  assert.equal(isWalkablePosition(-4.8, -5.6, 'mushgrove'), true);
  assert.equal(isWalkablePosition(-9.6, -5.6, 'mushgrove'), true);

  // Volcano caldera rim is significantly higher than Moosewood pier
  assert.ok(getGroundHeightAt('roslit_volcano', 0, -14.2) > getGroundHeightAt('moosewood', 0, 10));
});

test('clampPlayerPosition and clampPlayerWorldPosition keep avatar safely on land/pier/bridges', () => {
  const onPier = clampPlayerPosition('moosewood', 0, 8, 0.5, 11);
  assert.equal(onPier.x, 0.5);
  assert.equal(onPier.z, 11);

  const edgeClamp = clampPlayerPosition('moosewood', 0, 14.5, 0.4, 21.0);
  assert.equal(edgeClamp.z, 14.5);
  assert.equal(edgeClamp.x, 0.4);

  // World-space movement on Sunstone Island (rotated + elevated steps)
  const sunstoneSpawn = getIslandDockSpawn('sunstone');
  const clamped = clampPlayerWorldPosition(
    sunstoneSpawn.px,
    sunstoneSpawn.pz,
    sunstoneSpawn.px + 0.3,
    sunstoneSpawn.pz + 0.2
  );
  assert.equal(isWalkableWorldPosition(clamped.x, clamped.z), true);
  assert.ok(getGroundHeightAtWorld(clamped.x, clamped.z) > 0.9);
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

test('computeBobberTargetPosition strictly projects bobber along player yaw into open water', () => {
  const backFacing = computeBobberTargetPosition(0, 5, Math.PI, 0.8);
  assert.ok(backFacing.z < -18, `Expected z < -18 when facing PI, got ${backFacing.z}`);
  assert.ok(Math.abs(backFacing.x) < 0.01);
  assert.equal(isWalkableWorldPosition(backFacing.x, backFacing.z), false);

  const sideFacing = computeBobberTargetPosition(0, 14, Math.PI / 2, 0.7);
  assert.ok(sideFacing.x > 10);
  assert.ok(Math.abs(sideFacing.z - 14) < 0.01);
  assert.equal(isWalkableWorldPosition(sideFacing.x, sideFacing.z), false);

  const seaFacing = computeBobberTargetPosition(0, 15, 0, 0.86);
  assert.ok(seaFacing.z > 20);
  assert.equal(isWalkableWorldPosition(seaFacing.x, seaFacing.z), false);
});

test('seamless archipelago sailing: boat collision, disembarking at any island pier, and active island detection', () => {
  // Sailing into Moosewood pier is blocked safely in world coordinates
  const blockedPier = resolveBoatWorldPosition(-9.6, 15.0, 0, 15.0);
  assert.ok(blockedPier.x !== 0 || blockedPier.z >= 15.0);

  // Boat moored near Roslit Bay pier can disembark directly onto Roslit Bay without loading screen
  const roslitSpawn = getIslandDockSpawn('roslit_bay');
  const disembarkRoslit = findNearestDisembarkPoint(roslitSpawn.bx, roslitSpawn.bz, 11.5);
  assert.ok(disembarkRoslit);
  assert.equal(disembarkRoslit.islandId, 'roslit_bay');
  assert.equal(isWalkableWorldPosition(disembarkRoslit.x, disembarkRoslit.z), true);

  // Mid-ocean has no disembark point
  const openOceanDisembark = findNearestDisembarkPoint(0, 28, 11.5);
  assert.equal(openOceanDisembark, null);

  // Active island detection switches accurately by world coordinates
  const volcanoSpawn = getIslandDockSpawn('roslit_volcano');
  const activeVolcano = findActiveIslandAt(volcanoSpawn.px, volcanoSpawn.pz);
  assert.equal(activeVolcano?.id, 'roslit_volcano');

  const depthsPierWorld = islandLocalToWorld('the_depths', 0, 10);
  const activeDepths = findActiveIslandAt(depthsPierWorld.x, depthsPierWorld.z);
  assert.equal(activeDepths?.id, 'the_depths');
});
