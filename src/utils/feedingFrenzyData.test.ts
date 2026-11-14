import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canPlayerEat,
  isTargetDangerous,
  getGrowthProgress,
  calculateFrenzyState,
  getPlayerVisualRadius,
  FF_STAGES,
} from './feedingFrenzyData';

test('canPlayerEat enforces food-chain tier and pufferfish inflation', () => {
  assert.equal(canPlayerEat(1, 1, 'clownfish', false), true);
  assert.equal(canPlayerEat(1, 2, 'butterflyfish', false), false);
  assert.equal(canPlayerEat(2, 2, 'pufferfish', false), true);
  assert.equal(canPlayerEat(2, 2, 'pufferfish', true), false);
  assert.equal(canPlayerEat(3, 4, 'jellyfish', false), false);
  assert.equal(canPlayerEat(3, 3, 'barracuda', false), true);
});

test('isTargetDangerous detects predators, hazards, and inflated puffers', () => {
  assert.equal(isTargetDangerous(1, 2, 'butterflyfish', false), true);
  assert.equal(isTargetDangerous(2, 2, 'butterflyfish', false), false);
  assert.equal(isTargetDangerous(3, 2, 'pufferfish', true), true);
  assert.equal(isTargetDangerous(3, 4, 'sea_mine', false), true);
});

test('getGrowthProgress computes evolution tiers and marker percentages accurately', () => {
  const thresholds: [number, number, number] = [100, 250, 500];
  const s1 = getGrowthProgress(50, thresholds);
  assert.equal(s1.tier, 1);
  assert.equal(s1.percent, 10);
  assert.equal(s1.tier1MarkerPercent, 20);
  assert.equal(s1.tier2MarkerPercent, 50);

  const s2 = getGrowthProgress(120, thresholds);
  assert.equal(s2.tier, 2);

  const s3 = getGrowthProgress(260, thresholds);
  assert.equal(s3.tier, 3);
});

test('calculateFrenzyState scales multiplier cleanly across Frenzy thresholds', () => {
  assert.equal(calculateFrenzyState(20).multiplier, 1);
  assert.equal(calculateFrenzyState(20).isFrenzyActive, false);
  assert.equal(calculateFrenzyState(45).multiplier, 2);
  assert.equal(calculateFrenzyState(45).isFrenzyActive, true);
  assert.equal(calculateFrenzyState(75).multiplier, 3);
  assert.equal(calculateFrenzyState(95).multiplier, 4);
});

test('getPlayerVisualRadius grows smoothly across tiers and all 5 stages have valid thresholds', () => {
  const r1 = getPlayerVisualRadius(0, [100, 250, 500]);
  const r2 = getPlayerVisualRadius(100, [100, 250, 500]);
  const r3 = getPlayerVisualRadius(250, [100, 250, 500]);
  assert.ok(r2 > r1);
  assert.ok(r3 > r2);

  assert.equal(FF_STAGES.length, 5);
  FF_STAGES.forEach((stage) => {
    const [a, b, c] = stage.growthThresholds;
    assert.ok(a > 0 && b > a && c > b);
  });
});
