export interface PlasticInputs {
  bottlesPerDay: number;
  bagsPerWeek: number;
  foodContainersPerWeek: number;
  usesReusableBottle: boolean;
  recyclesReliably: boolean;
}

export interface PlasticFootprintResult {
  monthlyItems: number;
  yearlyItems: number;
  yearlyWeightKg: number;
  yearlyCo2Kg: number;
  oceanLeakageRiskKg: number;
  treesEquivalentToOffset: number;
}

export interface ReductionScenario {
  reducedYearlyItems: number;
  savedYearlyItems: number;
  savedKg: number;
  savedCo2Kg: number;
}

// Average weight approximations based on UNEP & Ellen MacArthur Foundation studies:
// Plastic bottle ~ 20g (0.02 kg)
// Plastic bag ~ 6g (0.006 kg)
// Single-use food container ~ 15g (0.015 kg)
// 1 kg PET/HDPE production generates approx 2.5 kg CO2 equivalent.
// In developing/coastal regions, ~15-25% of unmanaged plastic is at risk of entering aquatic/marine environments.
export function calculatePlasticFootprint(inputs: PlasticInputs): PlasticFootprintResult {
  const dailyBottles = inputs.usesReusableBottle ? Math.max(0, inputs.bottlesPerDay - 1) : inputs.bottlesPerDay;
  const weeklyBags = inputs.bagsPerWeek;
  const weeklyContainers = inputs.foodContainersPerWeek;

  const monthlyBottles = dailyBottles * 30;
  const monthlyBags = weeklyBags * 4.3;
  const monthlyContainers = weeklyContainers * 4.3;

  const monthlyItems = Math.round(monthlyBottles + monthlyBags + monthlyContainers);
  const yearlyItems = monthlyItems * 12;

  const bottleWeight = (dailyBottles * 365) * 0.020;
  const bagWeight = (weeklyBags * 52) * 0.006;
  const containerWeight = (weeklyContainers * 52) * 0.015;

  const yearlyWeightKg = Number((bottleWeight + bagWeight + containerWeight).toFixed(2));
  const yearlyCo2Kg = Number((yearlyWeightKg * 2.5).toFixed(2));

  // Leakage risk rate (higher if not properly recycled: ~18% vs 4% if reliably separated)
  const leakageRate = inputs.recyclesReliably ? 0.04 : 0.18;
  const oceanLeakageRiskKg = Number((yearlyWeightKg * leakageRate).toFixed(2));

  // 1 tree absorbs ~21 kg CO2 per year
  const treesEquivalentToOffset = Number((yearlyCo2Kg / 21).toFixed(1));

  return {
    monthlyItems,
    yearlyItems,
    yearlyWeightKg,
    yearlyCo2Kg,
    oceanLeakageRiskKg,
    treesEquivalentToOffset,
  };
}

export function calculateReductionSavings(
  current: PlasticFootprintResult,
  targetReductionPercent: number // e.g. 50%
): ReductionScenario {
  const factor = Math.min(100, Math.max(0, targetReductionPercent)) / 100;
  const savedYearlyItems = Math.round(current.yearlyItems * factor);
  const reducedYearlyItems = current.yearlyItems - savedYearlyItems;
  const savedKg = Number((current.yearlyWeightKg * factor).toFixed(2));
  const savedCo2Kg = Number((current.yearlyCo2Kg * factor).toFixed(2));

  return {
    reducedYearlyItems,
    savedYearlyItems,
    savedKg,
    savedCo2Kg,
  };
}
