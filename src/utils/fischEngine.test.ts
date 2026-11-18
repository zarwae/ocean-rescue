import assert from 'node:assert/strict';
import test from 'node:test';
import {
  FISCH_BAITS,
  FISCH_BOATS,
  FISCH_ENCHANTS,
  FISCH_ISLANDS,
  FISCH_MUTATIONS,
  FISCH_RODS,
  FISCH_SPECIES,
} from './fischData';
import {
  applyFischXp,
  calculateFishSellValue,
  createInitialFischSave,
  findBoat,
  getEffectiveStats,
  getReelPhysics,
  openCrateReward,
  rollCatchCandidate,
  rollCatchResult,
} from './fischEngine';

test('FISCH_SPECIES has 250+ unique species and crates across all 11 islands and 4 boats', () => {
  assert.ok(FISCH_SPECIES.length >= 250, `Expected 250+ species, got ${FISCH_SPECIES.length}`);
  const uniqueIds = new Set(FISCH_SPECIES.map((s) => s.id));
  assert.equal(uniqueIds.size, FISCH_SPECIES.length, 'Every species ID must be unique');
  assert.equal(FISCH_ISLANDS.length, 11);
  assert.ok(
    FISCH_ISLANDS.every(
      (isl) => isl.minLevel === 1 && Number.isFinite(isl.worldCoords.x) && Number.isFinite(isl.worldCoords.z)
    ),
    'All 11 islands must be unlocked from Lv. 1 with valid worldCoords'
  );
  assert.ok(FISCH_BOATS.length >= 4);
  assert.equal(findBoat('pirate_ship').hullStyle, 'galleon');
  assert.equal(createInitialFischSave().equippedBoatId, 'rowboat');
  assert.ok(FISCH_RODS.length >= 16);
  assert.ok(FISCH_BAITS.length >= 14);
  assert.ok(FISCH_MUTATIONS.length >= 18);
  assert.ok(FISCH_ENCHANTS.length >= 12);
});

test('getEffectiveStats combines rod, bait, enchant, and world buffs accurately', () => {
  const mythRod = FISCH_RODS.find((r) => r.id === 'mythical')!;
  const truffle = FISCH_BAITS.find((b) => b.id === 'truffle_worm')!;
  const divine = FISCH_ENCHANTS.find((e) => e.id === 'divine')!;

  const stats = getEffectiveStats(mythRod, truffle, divine, {
    merlinLuckActive: true,
    auroraActive: true,
    perfectCast: true,
  });

  // Mythical (55) + Truffle (300) + Divine (45) + Merlin (65) + Aurora (140) + Cast (25) = 630
  assert.equal(stats.luck, 630);
  assert.ok(stats.barWidthRatio > 0.3 && stats.barWidthRatio <= 0.58);
});

test('calculateFishSellValue applies mutation, Shiny, and Sparkling multipliers cleanly', () => {
  const sample = FISCH_SPECIES.find((s) => s.id === 'moosewood__cod')!;
  const normalVal = calculateFishSellValue(sample, 5, 'none', false, false);
  const mythicShinyVal = calculateFishSellValue(sample, 5, 'mythical', true, false);
  assert.equal(normalVal, Math.round(sample.baseValuePerKg * 5));
  assert.equal(mythicShinyVal, Math.round(sample.baseValuePerKg * 5 * 4.5 * 1.85));
});

test('rollCatchResult detects line snap when catch exceeds rod Max Kg', () => {
  const flimsy = FISCH_RODS.find((r) => r.id === 'flimsy')!; // 10.4 kg max
  const whale = FISCH_SPECIES.find((s) => s.id === 'desolate_deep__scylla')!; // 420-1150 kg
  const stats = getEffectiveStats(flimsy, null, null);

  const outcome = rollCatchResult(
    whale,
    flimsy,
    null,
    stats,
    { timeOfDay: 'Night', weather: 'Clear', season: 'Summer' },
    () => 0.5
  );
  assert.equal(outcome.lineSnapped, true);

  const kings = FISCH_RODS.find((r) => r.id === 'kings')!; // infinite maxKg
  const kingStats = getEffectiveStats(kings, null, null);
  const kingOutcome = rollCatchResult(
    whale,
    kings,
    null,
    kingStats,
    { timeOfDay: 'Night', weather: 'Clear', season: 'Summer' },
    () => 0.5
  );
  assert.equal(kingOutcome.lineSnapped, false);
});

test('applyFischXp levels up cleanly across multiple levels and rollCatchCandidate picks valid island species', () => {
  const progressed = applyFischXp(1, 0, 500);
  assert.ok(progressed.level >= 3);
  assert.ok(progressed.levelsGained >= 2);

  const save = createInitialFischSave();
  const rod = FISCH_RODS[0];
  const stats = getEffectiveStats(rod, null, null);
  const sp = rollCatchCandidate(
    save.currentIslandId,
    rod,
    null,
    stats,
    { timeOfDay: 'Day', weather: 'Clear', season: 'Spring' },
    () => 0.42
  );
  assert.ok(sp.islandId === 'moosewood' || sp.islandId === 'universal');

  const physics = getReelPhysics(sp, stats);
  assert.ok(physics.barWidth >= 0.14 && physics.progressGainPerSec > 0);

  const crate = openCrateReward('crate__volcanic_geode', () => 0.2);
  assert.ok(crate.credits >= 720);
  assert.equal(crate.relicsGained, 1);
});
