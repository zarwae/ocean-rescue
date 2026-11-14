import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateClickOutcome,
  calculateGameAccuracy,
  calculateXpFromGame,
  calculateHazardParryOutcome,
  calculateBossClickOutcome,
  GAME_LEVELS,
} from './gameRules';

test('calculateClickOutcome handles debris hit and combo multiplier correctly', () => {
  const hit1 = calculateClickOutcome({ isDebris: true, points: 20 }, 0);
  assert.equal(hit1.isCorrect, true);
  assert.equal(hit1.scoreDelta, 20);
  assert.equal(hit1.newCombo, 1);

  // Combo multiplier at combo = 3 should be 1.5x (20 * 1.5 = 30)
  const hitCombo = calculateClickOutcome({ isDebris: true, points: 20 }, 3);
  assert.equal(hitCombo.isCorrect, true);
  assert.equal(hitCombo.scoreDelta, 30);
  assert.equal(hitCombo.newCombo, 4);
});

test('calculateClickOutcome penalizes clicking protected wildlife', () => {
  const penalty = calculateClickOutcome({ isDebris: false, points: 0 }, 5);
  assert.equal(penalty.isCorrect, false);
  assert.equal(penalty.scoreDelta, -100);
  assert.equal(penalty.newCombo, 0);
});

test('calculateGameAccuracy returns 100 on zero total and correct percentage on mix', () => {
  assert.equal(calculateGameAccuracy(0, 0), 100);
  assert.equal(calculateGameAccuracy(8, 2), 80);
});

test('calculateXpFromGame scales with score, accuracy and level', () => {
  const xp = calculateXpFromGame(500, 90, 2);
  assert.ok(xp > 150, `Expected xp > 150, got ${xp}`);
});

test('GAME_LEVELS contains 5 progressive levels with unique enemies and companions', () => {
  assert.equal(GAME_LEVELS.length, 5);
  assert.equal(GAME_LEVELS[0].name, 'Coastal Beginner');
  assert.equal(GAME_LEVELS[0].companion.id, 'nemo');
  assert.equal(GAME_LEVELS[4].name, 'Ocean Guardian');
  assert.equal(GAME_LEVELS[4].companion.id, 'kraken');

  const uniqueEnemies = new Set(GAME_LEVELS.map((l) => l.enemy.kind));
  const uniqueCompanions = new Set(GAME_LEVELS.map((l) => l.companion.id));
  assert.equal(uniqueEnemies.size, 5);
  assert.equal(uniqueCompanions.size, 5);
});

test('hazard parry and boss click outcomes compute HP and companion charge cleanly', () => {
  const parry = calculateHazardParryOutcome(2);
  assert.equal(parry.scoreDelta, 15);
  assert.equal(parry.energyGain, 18);
  assert.equal(parry.newCombo, 3);

  const hit = calculateBossClickOutcome(20, 14);
  assert.equal(hit.nextHp, 6);
  assert.equal(hit.defeated, false);

  const finish = calculateBossClickOutcome(6, 14);
  assert.equal(finish.nextHp, 0);
  assert.equal(finish.defeated, true);
});

