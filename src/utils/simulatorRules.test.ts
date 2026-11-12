import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSimulation } from './simulatorRules';

test('calculateSimulation returns baseline optimal values for healthy ocean', () => {
  const result = calculateSimulation({
    waterTemp: 26.5,
    plasticPollution: 5,
    acidification: 8.15,
    fishingPressure: 10,
  });

  assert.ok(result.overallHealthScore >= 80, `Expected score >= 80, got ${result.overallHealthScore}`);
  assert.ok(result.coralHealth >= 80, `Expected coral health >= 80, got ${result.coralHealth}`);
  assert.equal(result.bleachingRisk, 'Rendah');
  assert.equal(result.trophicCollapseRisk, 'Stabil');
});

test('calculateSimulation detects critical bleaching when temperature exceeds thermal thresholds', () => {
  const result = calculateSimulation({
    waterTemp: 32.0,
    plasticPollution: 60,
    acidification: 7.75,
    fishingPressure: 80,
  });

  assert.equal(result.bleachingRisk, 'Peringatan Level 2 (Kritis)');
  assert.ok(result.coralHealth < 40, `Coral health should plummet, got ${result.coralHealth}`);
  assert.equal(result.trophicCollapseRisk, 'Kolaps Ekologis');
  assert.ok(result.overallHealthScore < 40, `Overall score should be low, got ${result.overallHealthScore}`);
});
