export type LevelEnemyKind =
  | 'trawler'
  | 'plastic_barge'
  | 'oil_drone'
  | 'shark_ship'
  | 'abyss_dredger';

export type CompanionKind =
  | 'nemo'
  | 'green_turtle'
  | 'manta_ray'
  | 'orca'
  | 'kraken';

export type HazardKind =
  | 'trap_net'
  | 'toxic_barrel'
  | 'oil_glob'
  | 'harpoon'
  | 'abyss_mine';

export interface CompanionConfig {
  id: CompanionKind;
  name: string;
  speciesLabel: string;
  skillName: string;
  skillDescription: string;
  ultimateDamage: number;
  passiveDamage: number;
  healPlayerHp: number;
  clearsHazards: boolean;
  stunsBossSeconds: number;
  bonusScore: number;
}

export interface EnemyArchetypeConfig {
  kind: LevelEnemyKind;
  name: string;
  hazardKind: HazardKind;
  hazardName: string;
  hazardDamage: number;
  bossName: string;
  bossTitle: string;
  bossMaxHp: number;
  bossAttackIntervalMs: number;
}

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
  baseY?: number;
  phase?: number;
  rotation?: number;
  rotSpeed?: number;
  facing?: 1 | -1;
}

export interface FishingBoat {
  id: string;
  kind: LevelEnemyKind;
  name: string;
  x: number; // percentage 0 - 100
  targetX: number; // percentage 18 - 82
  facing: 1 | -1; // 1 = sailing right, -1 = sailing left
  clicksRemaining: number;
  maxClicks: number;
  netProgress: number; // 0 - 100 (at 100, enemy launches attack / drops hazard)
  attackCooldown: number; // seconds until next hazard projectile
  status: 'approaching' | 'fishing' | 'fleeing';
  hitTick: number;
}

export interface HazardProjectile {
  id: string;
  kind: HazardKind;
  name: string;
  x: number; // percentage
  y: number; // percentage
  vx: number;
  vy: number;
  damage: number;
  fuse: number; // 0 -> 100; explodes on player HP at 100
  fuseDurationSec: number;
  phase: number;
}

export interface LevelBoss {
  id: string;
  kind: LevelEnemyKind;
  name: string;
  title: string;
  x: number; // percentage
  y: number; // percentage
  vx: number;
  hp: number;
  maxHp: number;
  stunRemaining: number; // seconds
  attackTimer: number; // seconds until next projectile volley
  hitFlashUntil: number;
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
  enemy: EnemyArchetypeConfig;
  companion: CompanionConfig;
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
    enemy: {
      kind: 'trawler',
      name: 'Kapal Nelayan Pukat',
      hazardKind: 'trap_net',
      hazardName: 'Jaring Sergap',
      hazardDamage: 14,
      bossName: 'Trawler Alpha',
      bossTitle: 'Kapal Pukat Raksasa',
      bossMaxHp: 140,
      bossAttackIntervalMs: 3600,
    },
    companion: {
      id: 'nemo',
      name: 'Nemo',
      speciesLabel: 'Ikan Badut Penjaga Karang',
      skillName: 'Gelombang Anemon Cepat',
      skillDescription: 'Menghantam bos 55 dmg & memberi +50 skor bonus',
      ultimateDamage: 55,
      passiveDamage: 5,
      healPlayerHp: 0,
      clearsHazards: false,
      stunsBossSeconds: 0,
      bonusScore: 50,
    },
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
    enemy: {
      kind: 'plastic_barge',
      name: 'Tongkang Limbah Plastik',
      hazardKind: 'toxic_barrel',
      hazardName: 'Tong Limbah Plastik',
      hazardDamage: 16,
      bossName: 'Barge Rex',
      bossTitle: 'Kapal Induk Pembuang Limbah',
      bossMaxHp: 185,
      bossAttackIntervalMs: 3300,
    },
    companion: {
      id: 'green_turtle',
      name: 'Penyu Hijau',
      speciesLabel: 'Pelindung Terumbu Karang',
      skillName: 'Tameng Karapas & Arus',
      skillDescription: 'Menghantam bos 65 dmg & memulihkan +20 HP Penjaga',
      ultimateDamage: 65,
      passiveDamage: 6,
      healPlayerHp: 20,
      clearsHazards: false,
      stunsBossSeconds: 0,
      bonusScore: 40,
    },
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
    enemy: {
      kind: 'oil_drone',
      name: 'Drone Pengebor Minyak',
      hazardKind: 'oil_glob',
      hazardName: 'Bola Tumpahan Minyak',
      hazardDamage: 18,
      bossName: 'Rig-X9',
      bossTitle: 'Anjungan Pengeboran Bocor',
      bossMaxHp: 230,
      bossAttackIntervalMs: 3000,
    },
    companion: {
      id: 'manta_ray',
      name: 'Pari Manta',
      speciesLabel: 'Pengelana Zona Pelagik',
      skillName: 'Sayap Pusaran Pembersih',
      skillDescription: '75 dmg ke bos & menyapu bersih seluruh proyektil bahaya',
      ultimateDamage: 75,
      passiveDamage: 7,
      healPlayerHp: 0,
      clearsHazards: true,
      stunsBossSeconds: 0,
      bonusScore: 60,
    },
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
    enemy: {
      kind: 'shark_ship',
      name: 'Kapal Trawler Pemburu',
      hazardKind: 'harpoon',
      hazardName: 'Tombak Harpoon',
      hazardDamage: 20,
      bossName: 'Vanguard',
      bossTitle: 'Kapal Induk Trawler Baja',
      bossMaxHp: 280,
      bossAttackIntervalMs: 2800,
    },
    companion: {
      id: 'orca',
      name: 'Paus Orca',
      speciesLabel: 'Apex Penjaga Arus Samudra',
      skillName: 'Gelombang Sonik Oseanik',
      skillDescription: '85 dmg ke bos & membekukan serangan bos selama 5 detik',
      ultimateDamage: 85,
      passiveDamage: 9,
      healPlayerHp: 0,
      clearsHazards: false,
      stunsBossSeconds: 5,
      bonusScore: 80,
    },
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
    enemy: {
      kind: 'abyss_dredger',
      name: 'Pengeruk Dasar Laut',
      hazardKind: 'abyss_mine',
      hazardName: 'Ranjau Limbah Beracun',
      hazardDamage: 22,
      bossName: 'Abyssal Dredger',
      bossTitle: 'Leviathan Mesin Limbah',
      bossMaxHp: 340,
      bossAttackIntervalMs: 2500,
    },
    companion: {
      id: 'kraken',
      name: 'Kraken',
      speciesLabel: 'Penguasa Legendaris Palung Dalam',
      skillName: 'Amukan Delapan Tentakel',
      skillDescription: '105 dmg ke bos, sapu proyektil bahaya & pulih +15 HP',
      ultimateDamage: 105,
      passiveDamage: 11,
      healPlayerHp: 15,
      clearsHazards: true,
      stunsBossSeconds: 2.5,
      bonusScore: 120,
    },
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

export function calculateBoatClickOutcome(
  clicksRemaining: number,
  level: number,
  currentCombo: number
): {
  nextClicksRemaining: number;
  repelled: boolean;
  scoreDelta: number;
  newCombo: number;
  message: string;
} {
  const nextClicks = Math.max(0, clicksRemaining - 1);
  if (nextClicks === 0) {
    const bonus = 80 + (level - 1) * 15;
    return {
      nextClicksRemaining: 0,
      repelled: true,
      scoreDelta: bonus,
      newCombo: currentCombo + 1,
      message: `+${bonus} Musuh Diusir!`,
    };
  }
  return {
    nextClicksRemaining: nextClicks,
    repelled: false,
    scoreDelta: 10,
    newCombo: currentCombo,
    message: `Usir Musuh! (${nextClicks} klik lagi)`,
  };
}

export function calculateBoatEscapePenalty(): {
  scoreDelta: number;
  newCombo: number;
  message: string;
} {
  return {
    scoreDelta: -120,
    newCombo: 0,
    message: '-120! Jaring musuh merusak ekosistem!',
  };
}

export function calculateHazardParryOutcome(currentCombo: number): {
  scoreDelta: number;
  energyGain: number;
  newCombo: number;
  message: string;
} {
  return {
    scoreDelta: 15,
    energyGain: 18,
    newCombo: currentCombo + 1,
    message: '+15 Serangan Ditangkis!',
  };
}

export function calculateBossClickOutcome(
  bossHp: number,
  clickDamage: number = 14
): {
  nextHp: number;
  defeated: boolean;
  energyGain: number;
} {
  const nextHp = Math.max(0, bossHp - clickDamage);
  return {
    nextHp,
    defeated: nextHp <= 0,
    energyGain: 12,
  };
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
