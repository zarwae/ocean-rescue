import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateClickOutcome, calculateGameAccuracy, calculateXpFromGame, GAME_LEVELS } from './gameRules';

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

test('GAME_LEVELS contains 5 progressive levels', () => {
  assert.equal(GAME_LEVELS.length, 5);
  assert.equal(GAME_LEVELS[0].name, 'Coastal Beginner');
  assert.equal(GAME_LEVELS[4].name, 'Ocean Guardian');
});

test('level completion evaluates target score correctly', () => {
  const level1 = GAME_LEVELS[0];
  assert.equal(level1.targetScore, 200);
  assert.equal(220 >= level1.targetScore, true);
  assert.equal(200 >= level1.targetScore, true);
  assert.equal(190 >= level1.targetScore, false);
});

