export type GameTier = 1 | 2 | 3 | 4;

export type PlayableFishId = 'andy' | 'orville' | 'kuro';

export type SpeciesId =
  | 'minnow'
  | 'clownfish'
  | 'damselfish'
  | 'lanternfish'
  | 'butterflyfish'
  | 'angelfish'
  | 'lionfish'
  | 'tuna_mackerel'
  | 'snapper'
  | 'barracuda'
  | 'swordfish'
  | 'reef_shark'
  | 'hammerhead'
  | 'great_white'
  | 'pufferfish'
  | 'jellyfish'
  | 'sea_mine';

export type PowerUpKind = 'speed' | 'magnet' | 'shield' | 'freeze' | 'star' | 'time';

export interface PlayableFishConfig {
  id: PlayableFishId;
  name: string;
  speciesLabel: string;
  description: string;
  perkLabel: string;
  primaryColor: string;
  secondaryColor: string;
  bellyColor: string;
  finColor: string;
  accentColor: string;
  speedStat: number;
  dashRecoveryBonus: number;
  whipRadiusMultiplier: number;
  frenzyDecayBonus: number;
}

export interface SpeciesConfig {
  id: SpeciesId;
  name: string;
  tier: GameTier;
  baseRadius: number;
  aspectRatio: number;
  baseSpeed: number;
  growthValue: number;
  scoreValue: number;
  primaryColor: string;
  secondaryColor: string;
  bellyColor: string;
  finColor: string;
  pattern: 'solid' | 'clown' | 'stripes' | 'spots' | 'tiger' | 'shark' | 'lion' | 'puffer' | 'glow';
  tailStyle: 'fork' | 'crescent' | 'fan' | 'pointed';
  isHazardOnly?: boolean;
  canChase?: boolean;
}

export type BackdropKey =
  | 'coral_lagoon'
  | 'kelp_forest'
  | 'sunken_wreck'
  | 'twilight_canyon'
  | 'apex_trench';

export interface StageConfig {
  id: number;
  name: string;
  subtitle: string;
  backdropKey: BackdropKey;
  ambientTop: string;
  ambientBottom: string;
  rayColor: string;
  growthThresholds: [number, number, number]; // [toTier2, toTier3, stageClear]
  spawnRates: { id: SpeciesId; weight: number }[];
  maxActiveFish: number;
  hazardCount: number;
  clamIntervalSec: number;
  powerUpIntervalSec: number;
  foodChainSpecies: SpeciesId[];
}

export const PLAYABLE_FISH: PlayableFishConfig[] = [
  {
    id: 'andy',
    name: 'Andy Bidadari',
    speciesLabel: 'Ikan Bidadari Karang',
    description: 'Gesit bermanuver di sela karang dengan pemulihan stamina Dash lebih cepat.',
    perkLabel: 'Pemulihan Dash +25%',
    primaryColor: '#2B8E8A',
    secondaryColor: '#F0B648',
    bellyColor: '#F3EFE0',
    finColor: '#6ED4C6',
    accentColor: '#133C4A',
    speedStat: 1.0,
    dashRecoveryBonus: 1.25,
    whipRadiusMultiplier: 1.0,
    frenzyDecayBonus: 1.0,
  },
  {
    id: 'orville',
    name: 'Orville Orka',
    speciesLabel: 'Paus Pembunuh Muda',
    description: 'Tubuh bertenaga dengan pusaran Tail Whip lebih luas untuk menyedot kawanan mangsa.',
    perkLabel: 'Radius Tail Whip +35%',
    primaryColor: '#172530',
    secondaryColor: '#3B5C70',
    bellyColor: '#F6F7F8',
    finColor: '#243847',
    accentColor: '#9CD3DB',
    speedStat: 0.96,
    dashRecoveryBonus: 1.0,
    whipRadiusMultiplier: 1.35,
    frenzyDecayBonus: 1.05,
  },
  {
    id: 'kuro',
    name: 'Kuro Kakap Emas',
    speciesLabel: 'Kakap Merah Pelagis',
    description: 'Perenang cepat berdarah predator yang mempertahankan kombo Frenzy lebih lama.',
    perkLabel: 'Kecepatan +10% · Frenzy Awet',
    primaryColor: '#D65B45',
    secondaryColor: '#F3A64B',
    bellyColor: '#FCE8D5',
    finColor: '#F7C97E',
    accentColor: '#6D241C',
    speedStat: 1.1,
    dashRecoveryBonus: 1.05,
    whipRadiusMultiplier: 1.05,
    frenzyDecayBonus: 1.3,
  },
];

export const SPECIES_CATALOG: Record<SpeciesId, SpeciesConfig> = {
  minnow: {
    id: 'minnow',
    name: 'Teri Perak',
    tier: 1,
    baseRadius: 13,
    aspectRatio: 1.85,
    baseSpeed: 98,
    growthValue: 8,
    scoreValue: 15,
    primaryColor: '#90CED0',
    secondaryColor: '#C9ECEC',
    bellyColor: '#F4FAFA',
    finColor: '#72AEB2',
    pattern: 'solid',
    tailStyle: 'fork',
  },
  clownfish: {
    id: 'clownfish',
    name: 'Ikan Badut',
    tier: 1,
    baseRadius: 15,
    aspectRatio: 1.65,
    baseSpeed: 90,
    growthValue: 10,
    scoreValue: 20,
    primaryColor: '#EF733A',
    secondaryColor: '#FFFFFF',
    bellyColor: '#FCA976',
    finColor: '#F39453',
    pattern: 'clown',
    tailStyle: 'fan',
  },
  damselfish: {
    id: 'damselfish',
    name: 'Betok Biru',
    tier: 1,
    baseRadius: 14,
    aspectRatio: 1.55,
    baseSpeed: 108,
    growthValue: 9,
    scoreValue: 20,
    primaryColor: '#2E78D2',
    secondaryColor: '#F0C746',
    bellyColor: '#9AD4F5',
    finColor: '#4BA3E3',
    pattern: 'solid',
    tailStyle: 'fork',
  },
  lanternfish: {
    id: 'lanternfish',
    name: 'Ikan Lentera',
    tier: 1,
    baseRadius: 15,
    aspectRatio: 1.75,
    baseSpeed: 102,
    growthValue: 12,
    scoreValue: 25,
    primaryColor: '#375894',
    secondaryColor: '#76F7EC',
    bellyColor: '#7AA3D6',
    finColor: '#67D4DA',
    pattern: 'glow',
    tailStyle: 'fork',
  },
  butterflyfish: {
    id: 'butterflyfish',
    name: 'Kepe-Kepe Emas',
    tier: 2,
    baseRadius: 24,
    aspectRatio: 1.4,
    baseSpeed: 95,
    growthValue: 18,
    scoreValue: 45,
    primaryColor: '#F1C144',
    secondaryColor: '#1E2C36',
    bellyColor: '#FAF2CF',
    finColor: '#F8DA7C',
    pattern: 'stripes',
    tailStyle: 'fan',
    canChase: true,
  },
  angelfish: {
    id: 'angelfish',
    name: 'Bidadari Zamrud',
    tier: 2,
    baseRadius: 25,
    aspectRatio: 1.35,
    baseSpeed: 92,
    growthValue: 20,
    scoreValue: 50,
    primaryColor: '#329688',
    secondaryColor: '#D6BE7B',
    bellyColor: '#D6EFEA',
    finColor: '#78CFC1',
    pattern: 'stripes',
    tailStyle: 'crescent',
    canChase: true,
  },
  lionfish: {
    id: 'lionfish',
    name: 'Lepu Karang',
    tier: 2,
    baseRadius: 26,
    aspectRatio: 1.5,
    baseSpeed: 84,
    growthValue: 22,
    scoreValue: 60,
    primaryColor: '#B54B3C',
    secondaryColor: '#F2E7D5',
    bellyColor: '#EBD3C4',
    finColor: '#D87562',
    pattern: 'lion',
    tailStyle: 'fan',
    canChase: true,
  },
  tuna_mackerel: {
    id: 'tuna_mackerel',
    name: 'Tenggiri Muda',
    tier: 2,
    baseRadius: 25,
    aspectRatio: 2.05,
    baseSpeed: 130,
    growthValue: 22,
    scoreValue: 55,
    primaryColor: '#336A8E',
    secondaryColor: '#98D0DE',
    bellyColor: '#EFF7FA',
    finColor: '#C5B86E',
    pattern: 'tiger',
    tailStyle: 'crescent',
    canChase: true,
  },
  snapper: {
    id: 'snapper',
    name: 'Kakap Karang',
    tier: 3,
    baseRadius: 36,
    aspectRatio: 1.75,
    baseSpeed: 105,
    growthValue: 35,
    scoreValue: 95,
    primaryColor: '#C94D46',
    secondaryColor: '#E59F62',
    bellyColor: '#F7DCD4',
    finColor: '#DF7466',
    pattern: 'spots',
    tailStyle: 'fork',
    canChase: true,
  },
  barracuda: {
    id: 'barracuda',
    name: 'Barakuda Perak',
    tier: 3,
    baseRadius: 38,
    aspectRatio: 2.45,
    baseSpeed: 145,
    growthValue: 40,
    scoreValue: 120,
    primaryColor: '#4E6B7B',
    secondaryColor: '#B6CDD7',
    bellyColor: '#ECF3F6',
    finColor: '#7D9AA8',
    pattern: 'tiger',
    tailStyle: 'fork',
    canChase: true,
  },
  swordfish: {
    id: 'swordfish',
    name: 'Ikan Todak',
    tier: 3,
    baseRadius: 39,
    aspectRatio: 2.55,
    baseSpeed: 158,
    growthValue: 45,
    scoreValue: 140,
    primaryColor: '#2B4E77',
    secondaryColor: '#76A6C9',
    bellyColor: '#E3EFF7',
    finColor: '#4B78A8',
    pattern: 'solid',
    tailStyle: 'crescent',
    canChase: true,
  },
  reef_shark: {
    id: 'reef_shark',
    name: 'Hiu Karang',
    tier: 4,
    baseRadius: 50,
    aspectRatio: 2.3,
    baseSpeed: 128,
    growthValue: 65,
    scoreValue: 220,
    primaryColor: '#566A78',
    secondaryColor: '#202D35',
    bellyColor: '#E4ECEF',
    finColor: '#4B5E6B',
    pattern: 'shark',
    tailStyle: 'crescent',
    canChase: true,
  },
  hammerhead: {
    id: 'hammerhead',
    name: 'Hiu Martil',
    tier: 4,
    baseRadius: 52,
    aspectRatio: 2.35,
    baseSpeed: 136,
    growthValue: 75,
    scoreValue: 260,
    primaryColor: '#67747C',
    secondaryColor: '#374249',
    bellyColor: '#E8EEF0',
    finColor: '#536068',
    pattern: 'shark',
    tailStyle: 'crescent',
    canChase: true,
  },
  great_white: {
    id: 'great_white',
    name: 'Raja Hiu Putih',
    tier: 4,
    baseRadius: 58,
    aspectRatio: 2.3,
    baseSpeed: 142,
    growthValue: 95,
    scoreValue: 350,
    primaryColor: '#415564',
    secondaryColor: '#1E2D36',
    bellyColor: '#F3F6F8',
    finColor: '#344754',
    pattern: 'shark',
    tailStyle: 'crescent',
    canChase: true,
  },
  pufferfish: {
    id: 'pufferfish',
    name: 'Ikan Buntal',
    tier: 2,
    baseRadius: 23,
    aspectRatio: 1.25,
    baseSpeed: 74,
    growthValue: 25,
    scoreValue: 75,
    primaryColor: '#D6B055',
    secondaryColor: '#7C5D24',
    bellyColor: '#F7E7BD',
    finColor: '#E6C775',
    pattern: 'puffer',
    tailStyle: 'fan',
  },
  jellyfish: {
    id: 'jellyfish',
    name: 'Ubur-ubur Listrik',
    tier: 4,
    baseRadius: 24,
    aspectRatio: 1.0,
    baseSpeed: 42,
    growthValue: 0,
    scoreValue: 0,
    primaryColor: '#D982B8',
    secondaryColor: '#98DDF2',
    bellyColor: '#F5D5EC',
    finColor: '#D982B8',
    pattern: 'glow',
    tailStyle: 'fan',
    isHazardOnly: true,
  },
  sea_mine: {
    id: 'sea_mine',
    name: 'Ranjau Karang Tua',
    tier: 4,
    baseRadius: 24,
    aspectRatio: 1.0,
    baseSpeed: 18,
    growthValue: 0,
    scoreValue: 0,
    primaryColor: '#39464D',
    secondaryColor: '#D96D56',
    bellyColor: '#253036',
    finColor: '#566670',
    pattern: 'solid',
    tailStyle: 'fan',
    isHazardOnly: true,
  },
};

export const FF_STAGES: StageConfig[] = [
  {
    id: 1,
    name: 'Laguna Terumbu Karang',
    subtitle: 'Zona Terang · Pengenalan Rantai Makanan',
    backdropKey: 'coral_lagoon',
    ambientTop: '#0F4C5C',
    ambientBottom: '#07222D',
    rayColor: 'rgba(225, 248, 240, 0.16)',
    growthThresholds: [90, 230, 420],
    spawnRates: [
      { id: 'minnow', weight: 32 },
      { id: 'clownfish', weight: 28 },
      { id: 'damselfish', weight: 18 },
      { id: 'butterflyfish', weight: 14 },
      { id: 'snapper', weight: 6 },
      { id: 'barracuda', weight: 2 },
    ],
    maxActiveFish: 24,
    hazardCount: 0,
    clamIntervalSec: 13,
    powerUpIntervalSec: 12,
    foodChainSpecies: ['minnow', 'clownfish', 'butterflyfish', 'snapper', 'barracuda'],
  },
  {
    id: 2,
    name: 'Hutan Kelp Zamrud',
    subtitle: 'Waspadai Ikan Buntal Mengembang & Hiu Patroli',
    backdropKey: 'kelp_forest',
    ambientTop: '#0B434A',
    ambientBottom: '#061B23',
    rayColor: 'rgba(170, 236, 214, 0.15)',
    growthThresholds: [110, 280, 520],
    spawnRates: [
      { id: 'minnow', weight: 24 },
      { id: 'damselfish', weight: 24 },
      { id: 'angelfish', weight: 16 },
      { id: 'pufferfish', weight: 12 },
      { id: 'tuna_mackerel', weight: 10 },
      { id: 'snapper', weight: 9 },
      { id: 'reef_shark', weight: 5 },
    ],
    maxActiveFish: 26,
    hazardCount: 1,
    clamIntervalSec: 12,
    powerUpIntervalSec: 11,
    foodChainSpecies: ['minnow', 'damselfish', 'angelfish', 'pufferfish', 'snapper', 'reef_shark'],
  },
  {
    id: 3,
    name: 'Karang Bangkai Kapal',
    subtitle: 'Arus Cepat Barakuda & Lepu Berbisa',
    backdropKey: 'sunken_wreck',
    ambientTop: '#0C3A52',
    ambientBottom: '#051520',
    rayColor: 'rgba(155, 225, 245, 0.14)',
    growthThresholds: [130, 340, 640],
    spawnRates: [
      { id: 'clownfish', weight: 20 },
      { id: 'damselfish', weight: 20 },
      { id: 'lionfish', weight: 15 },
      { id: 'tuna_mackerel', weight: 15 },
      { id: 'pufferfish', weight: 8 },
      { id: 'barracuda', weight: 14 },
      { id: 'hammerhead', weight: 8 },
    ],
    maxActiveFish: 28,
    hazardCount: 2,
    clamIntervalSec: 11,
    powerUpIntervalSec: 10,
    foodChainSpecies: ['clownfish', 'lionfish', 'tuna_mackerel', 'barracuda', 'hammerhead'],
  },
  {
    id: 4,
    name: 'Palung Senja Bioluminesen',
    subtitle: 'Ikan Lentera, Ubur-ubur Listrik & Todak Kilat',
    backdropKey: 'twilight_canyon',
    ambientTop: '#102B4B',
    ambientBottom: '#050E1C',
    rayColor: 'rgba(130, 210, 240, 0.11)',
    growthThresholds: [150, 400, 760],
    spawnRates: [
      { id: 'lanternfish', weight: 32 },
      { id: 'minnow', weight: 14 },
      { id: 'butterflyfish', weight: 12 },
      { id: 'tuna_mackerel', weight: 14 },
      { id: 'swordfish', weight: 16 },
      { id: 'hammerhead', weight: 12 },
    ],
    maxActiveFish: 30,
    hazardCount: 3,
    clamIntervalSec: 10,
    powerUpIntervalSec: 9.5,
    foodChainSpecies: ['lanternfish', 'butterflyfish', 'tuna_mackerel', 'swordfish', 'hammerhead'],
  },
  {
    id: 5,
    name: 'Singgasana Raja Predator',
    subtitle: 'Puncak Rantai Makanan · Taklukkan Raja Hiu Putih',
    backdropKey: 'apex_trench',
    ambientTop: '#0B3348',
    ambientBottom: '#040F17',
    rayColor: 'rgba(175, 232, 245, 0.14)',
    growthThresholds: [175, 460, 900],
    spawnRates: [
      { id: 'minnow', weight: 22 },
      { id: 'lanternfish', weight: 18 },
      { id: 'angelfish', weight: 14 },
      { id: 'lionfish', weight: 12 },
      { id: 'barracuda', weight: 14 },
      { id: 'swordfish', weight: 10 },
      { id: 'great_white', weight: 10 },
    ],
    maxActiveFish: 32,
    hazardCount: 3,
    clamIntervalSec: 9.5,
    powerUpIntervalSec: 9,
    foodChainSpecies: ['minnow', 'angelfish', 'barracuda', 'swordfish', 'great_white'],
  },
];

export const TIME_ATTACK_DURATION_SEC = 90;

/**
 * Determines whether the player at `playerTier` can safely eat a target fish.
 * - Hazard-only entities (jellyfish, sea_mine) cannot be eaten.
 * - Pufferfish cannot be eaten while inflated, even if playerTier >= 2.
 * - Normal fish can be eaten whenever playerTier >= targetTier.
 */
export function canPlayerEat(
  playerTier: GameTier,
  targetTier: GameTier,
  speciesId: SpeciesId,
  isPufferInflated: boolean = false
): boolean {
  const cfg = SPECIES_CATALOG[speciesId];
  if (cfg.isHazardOnly) return false;
  if (speciesId === 'pufferfish' && isPufferInflated) return false;
  return playerTier >= targetTier;
}

/**
 * Determines whether touching a non-edible entity harms the player.
 * - Equal-tier fish never harm you (you eat them unless inflated pufferfish).
 * - Larger predators (targetTier > playerTier), inflated pufferfish, or hazard-only entities harm you.
 */
export function isTargetDangerous(
  playerTier: GameTier,
  targetTier: GameTier,
  speciesId: SpeciesId,
  isPufferInflated: boolean = false
): boolean {
  const cfg = SPECIES_CATALOG[speciesId];
  if (cfg.isHazardOnly) return true;
  if (speciesId === 'pufferfish' && isPufferInflated) return true;
  return targetTier > playerTier;
}

/**
 * Computes player's current growth tier (1, 2, or 3) and bar percentage (0..100).
 */
export function getGrowthProgress(
  growthPoints: number,
  thresholds: [number, number, number]
): {
  tier: GameTier;
  percent: number;
  tier1MarkerPercent: number;
  tier2MarkerPercent: number;
} {
  const [t1, t2, tMax] = thresholds;
  const safeMax = Math.max(1, tMax);
  const clamped = Math.max(0, Math.min(safeMax, growthPoints));
  const tier: GameTier = growthPoints >= t2 ? 3 : growthPoints >= t1 ? 2 : 1;

  return {
    tier,
    percent: Math.round((clamped / safeMax) * 1000) / 10,
    tier1MarkerPercent: Math.round((t1 / safeMax) * 1000) / 10,
    tier2MarkerPercent: Math.round((t2 / safeMax) * 1000) / 10,
  };
}

/**
 * Computes Feeding Frenzy score multiplier based on rapid consecutive eats (`frenzyMeter` 0..100).
 */
export function calculateFrenzyState(frenzyMeter: number): {
  multiplier: 1 | 2 | 3 | 4;
  isFrenzyActive: boolean;
  label: string;
} {
  if (frenzyMeter >= 90) {
    return { multiplier: 4, isFrenzyActive: true, label: 'MEGA FRENZY 4×' };
  }
  if (frenzyMeter >= 65) {
    return { multiplier: 3, isFrenzyActive: true, label: 'FEEDING FRENZY 3×' };
  }
  if (frenzyMeter >= 40) {
    return { multiplier: 2, isFrenzyActive: true, label: 'FRENZY 2×' };
  }
  return { multiplier: 1, isFrenzyActive: false, label: '1×' };
}

/**
 * Computes visual pixel radius for player based on current tier and continuous growth micro-scaling.
 */
export function getPlayerVisualRadius(
  growthPoints: number,
  thresholds: [number, number, number]
): number {
  const [t1, t2, tMax] = thresholds;
  if (growthPoints < t1) {
    const sub = Math.max(0, growthPoints / Math.max(1, t1));
    return 18 + sub * 7; // 18px -> 25px
  }
  if (growthPoints < t2) {
    const sub = Math.max(0, (growthPoints - t1) / Math.max(1, t2 - t1));
    return 29 + sub * 9; // 29px -> 38px
  }
  const sub = Math.min(1, Math.max(0, (growthPoints - t2) / Math.max(1, tMax - t2)));
  return 42 + sub * 11; // 42px -> 53px
}
