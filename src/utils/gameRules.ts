export interface DebrisObject {
  id: string;
  name: string;
  isDebris: boolean; // true = trash to remove; false = marine animal / live coral to protect
  penaltyPoints?: number;
  points: number;
  type: 'bottle' | 'bag' | 'wrapper' | 'net' | 'can' | 'turtle' | 'fish' | 'coral' | 'dolphin';
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  speedX: number;
  speedY: number;
  size: number;
}

export interface LevelConfig {
  level: number;
  name: string;
  depthName: string;
  durationSeconds: number;
  targetScore: number;
  debrisSpeedMultiplier: number;
  spawnIntervalMs: number;
  backgroundTheme: string;
}

export const GAME_LEVELS: LevelConfig[] = [
  {
    level: 1,
    name: 'Coastal Beginner',
    depthName: 'Zona Intertidal & Pesisir Dangkal (0 - 5m)',
    durationSeconds: 30,
    targetScore: 200,
    debrisSpeedMultiplier: 1.0,
    spawnIntervalMs: 1400,
    backgroundTheme: 'from-[#0B526B] via-[#087F8C] to-[#0A2435]',
  },
  {
    level: 2,
    name: 'Reef Explorer',
    depthName: 'Terumbu Karang Penghalang (5 - 20m)',
    durationSeconds: 35,
    targetScore: 400,
    debrisSpeedMultiplier: 1.3,
    spawnIntervalMs: 1200,
    backgroundTheme: 'from-[#087F8C] via-[#0A2435] to-[#061622]',
  },
  {
    level: 3,
    name: 'Deep Ocean Cleaner',
    depthName: 'Zona Mesopelagik & Palung Terbuka (20 - 100m)',
    durationSeconds: 40,
    targetScore: 650,
    debrisSpeedMultiplier: 1.6,
    spawnIntervalMs: 1000,
    backgroundTheme: 'from-[#0A2435] via-[#061622] to-[#031019]',
  },
  {
    level: 4,
    name: 'Marine Protector',
    depthName: 'Penyelamatan Fauna & Penjaga Arus Laut Global',
    durationSeconds: 45,
    targetScore: 900,
    debrisSpeedMultiplier: 1.9,
    spawnIntervalMs: 850,
    backgroundTheme: 'from-[#061622] via-[#04121B] to-[#020A10]',
  },
  {
    level: 5,
    name: 'Ocean Guardian',
    depthName: 'Palung Samudra Terdalam & Ekspedisi Konservasi Puncak',
    durationSeconds: 50,
    targetScore: 1200,
    debrisSpeedMultiplier: 2.2,
    spawnIntervalMs: 750,
    backgroundTheme: 'from-[#04121B] via-[#020A10] to-[#000508]',
  },
];

export function calculateClickOutcome(
  target: { isDebris: boolean; points: number },
  currentCombo: number
): {
  scoreDelta: number;
  newCombo: number;
  isCorrect: boolean;
  message: string;
} {
  if (target.isDebris) {
    const multiplier = 1 + Math.floor(currentCombo / 3) * 0.5; // combo 0-2: 1x, 3-5: 1.5x, 6+: 2x
    const scoreDelta = Math.round(target.points * multiplier);
    return {
      scoreDelta,
      newCombo: currentCombo + 1,
      isCorrect: true,
      message: `+${scoreDelta} (${multiplier}x Combo!)`,
    };
  } else {
    // Penalty for disturbing live marine fauna or corals
    return {
      scoreDelta: -100,
      newCombo: 0,
      isCorrect: false,
      message: '-100! Jangan ganggu fauna atau karang hidup!',
    };
  }
}

export function calculateGameAccuracy(correct: number, wrong: number): number {
  const total = correct + wrong;
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

export function calculateXpFromGame(score: number, accuracy: number, level: number): number {
  if (score <= 0) return 10;
  const base = Math.floor(score / 5);
  const accuracyBonus = Math.floor((accuracy / 100) * 50);
  const levelBonus = level * 25;
  return base + accuracyBonus + levelBonus;
}
