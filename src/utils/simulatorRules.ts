export interface SimulatorParams {
  waterTemp: number; // 24 - 34 deg C (baseline 26.5)
  plasticPollution: number; // 0 - 100
  acidification: number; // pH 7.6 - 8.3 (baseline 8.15)
  fishingPressure: number; // 0 - 100
  coralBaselineHealth?: number; // 0 - 100
  biodiversityBaseline?: number; // 0 - 100
}

export interface SimulationResult {
  overallHealthScore: number; // 0 - 100
  coralHealth: number; // 0 - 100
  biodiversityIndex: number; // 0 - 100
  thermalStressDegreeDays: number;
  bleachingRisk: 'Rendah' | 'Waspada' | 'Peringatan Level 1' | 'Peringatan Level 2 (Kritis)';
  trophicCollapseRisk: 'Stabil' | 'Moderat' | 'Tinggi' | 'Kolaps Ekologis';
  statusDescription: string;
}

/**
 * Calculates scientifically grounded ecosystem indicators based on environmental stressors.
 * References: NOAA Coral Reef Watch Degree Heating Weeks model & IPCC Marine Ecosystem Sensitivity indices.
 */
export function calculateSimulation(params: SimulatorParams): SimulationResult {
  const { waterTemp, plasticPollution, acidification, fishingPressure } = params;

  // Temperature stress: baseline optimal for tropical reefs is ~26.5 - 28.0°C.
  // Above 29.5°C triggers cumulative thermal stress.
  const tempExcess = Math.max(0, waterTemp - 28.5);
  const thermalStressDegreeDays = Number((tempExcess * 4.2).toFixed(1));

  let bleachingRisk: SimulationResult['bleachingRisk'] = 'Rendah';
  if (thermalStressDegreeDays > 8.0) {
    bleachingRisk = 'Peringatan Level 2 (Kritis)';
  } else if (thermalStressDegreeDays > 4.0) {
    bleachingRisk = 'Peringatan Level 1';
  } else if (thermalStressDegreeDays > 1.0) {
    bleachingRisk = 'Waspada';
  }

  // Ocean Acidification: baseline normal ocean pH is ~8.15.
  // Every 0.1 decrease represents ~26% increase in hydronium ion concentration, impairing aragonite calcification.
  const phDeficit = Math.max(0, 8.15 - acidification);
  const calcificationImpact = phDeficit * 60; // 0 to ~33% drop

  // Coral Health impact
  // Corals are severely hit by temp (weight 0.45), acidification (0.3), plastic disease risk (0.15), and fishing pressure (0.1)
  const tempCoralPenalty = Math.min(60, tempExcess * 18);
  const acidCoralPenalty = Math.min(30, calcificationImpact * 0.7);
  const plasticCoralPenalty = (plasticPollution / 100) * 15;
  const fishingCoralPenalty = (fishingPressure / 100) * 10;

  const rawCoralHealth = 100 - (tempCoralPenalty + acidCoralPenalty + plasticCoralPenalty + fishingCoralPenalty);
  const coralHealth = Math.max(0, Math.min(100, Math.round(rawCoralHealth)));

  // Biodiversity Index
  // Impacted strongly by overfishing (0.35), habitat loss/coral decline (0.35), plastic ingestion/ghost nets (0.2), and temp/acid (0.1)
  const coralHabitatFactor = coralHealth / 100;
  const fishingBioPenalty = (fishingPressure / 100) * 35;
  const plasticBioPenalty = (plasticPollution / 100) * 20;
  const habitatLossPenalty = (1 - coralHabitatFactor) * 35;
  const acidBioPenalty = (phDeficit / 0.55) * 10;

  const rawBioIndex = 100 - (fishingBioPenalty + plasticBioPenalty + habitatLossPenalty + acidBioPenalty);
  const biodiversityIndex = Math.max(0, Math.min(100, Math.round(rawBioIndex)));

  // Overall Ecosystem Health (weighted balance)
  const overallHealthScore = Math.max(0, Math.min(100, Math.round(
    coralHealth * 0.4 +
    biodiversityIndex * 0.45 +
    (100 - plasticPollution) * 0.08 +
    (acidification >= 8.1 ? 7 : (acidification - 7.6) / 0.5 * 7)
  )));

  // Trophic status
  let trophicCollapseRisk: SimulationResult['trophicCollapseRisk'] = 'Stabil';
  if (fishingPressure > 75 || biodiversityIndex < 25) {
    trophicCollapseRisk = 'Kolaps Ekologis';
  } else if (fishingPressure > 50 || biodiversityIndex < 50) {
    trophicCollapseRisk = 'Tinggi';
  } else if (fishingPressure > 25 || biodiversityIndex < 70) {
    trophicCollapseRisk = 'Moderat';
  }

  let statusDescription = 'Ekosistem berada pada kesetimbangan dinamis yang sehat dan memiliki resiliensi tinggi.';
  if (overallHealthScore < 30) {
    statusDescription = 'Kondisi laut berada dalam ancaman katastropik: pemutihan massal karang, runtuhnya rantai makanan trofik, dan akumulasi toksisitas polutan tinggi.';
  } else if (overallHealthScore < 60) {
    statusDescription = 'Ekosistem mengalami stres lingkungan kronis dengan laju regenerasi biologi yang menurun drastis.';
  } else if (overallHealthScore < 80) {
    statusDescription = 'Tekanan antropogenik mulai mengikis ketahanan karang dan keanekaragaman biota bentik.';
  }

  return {
    overallHealthScore,
    coralHealth,
    biodiversityIndex,
    thermalStressDegreeDays,
    bleachingRisk,
    trophicCollapseRisk,
    statusDescription,
  };
}
