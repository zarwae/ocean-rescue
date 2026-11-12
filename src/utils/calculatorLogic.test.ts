import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePlasticFootprint, calculateReductionSavings } from './calculatorLogic';

test('calculatePlasticFootprint calculates annual items and weight correctly', () => {
  const result = calculatePlasticFootprint({
    bottlesPerDay: 2,
    bagsPerWeek: 5,
    foodContainersPerWeek: 3,
    usesReusableBottle: false,
    recyclesReliably: false,
  });

  assert.ok(result.yearlyItems > 500, `Expected yearly items > 500, got ${result.yearlyItems}`);
  assert.ok(result.yearlyWeightKg > 10, `Expected yearly weight > 10kg, got ${result.yearlyWeightKg}`);
  assert.ok(result.oceanLeakageRiskKg > 0, `Expected leakage risk > 0, got ${result.oceanLeakageRiskKg}`);
});

test('calculateReductionSavings computes 50% reduction scenario accurately', () => {
  const current = calculatePlasticFootprint({
    bottlesPerDay: 2,
    bagsPerWeek: 4,
    foodContainersPerWeek: 2,
    usesReusableBottle: false,
    recyclesReliably: true,
  });

  const scenario = calculateReductionSavings(current, 50);
  assert.equal(scenario.savedYearlyItems, Math.round(current.yearlyItems * 0.5));
  assert.ok(scenario.savedKg > 0);
  assert.ok(scenario.savedCo2Kg > 0);
});
