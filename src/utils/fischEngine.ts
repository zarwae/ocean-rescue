import {
  FISCH_BAITS,
  FISCH_ENCHANTS,
  FISCH_ISLANDS,
  FISCH_MUTATIONS,
  FISCH_QUESTS,
  FISCH_RODS,
  FISCH_SPECIES,
  FischBait,
  FischEnchant,
  FischRarity,
  FischRod,
  FischSeason,
  FischSpecies,
  FischTimeOfDay,
  FischWeather,
  RARITY_ORDER,
} from './fischData';

export const FISCH_STORAGE_KEY = 'ocean_rescue_fisch_save_v1';

export interface EffectiveRodStats {
  lureSpeed: number;
  luck: number;
  control: number;
  resilience: number;
  maxKg: number;
  barWidthRatio: number; // 0.14 .. 0.62 of minigame track
  progressBonus: number;
  shinySparklingBonus: number;
  weightMultiplier: number;
  xpMultiplier: number;
  heatResistant: boolean;
  nocturnalOverride: boolean;
}

export interface FischCaughtItem {
  uid: string;
  speciesId: string;
  weightKg: number;
  mutationId: string;
  isShiny: boolean;
  isSparkling: boolean;
  isGiant: boolean;
  isTiny: boolean;
  sellValue: number;
  caughtAt: number;
  locked: boolean;
}

export interface BestiaryEntry {
  caughtCount: number;
  bestWeightKg: number;
  mutations: string[];
  firstCaughtAt: number;
}

export interface RotatingAnglerQuest {
  id: string;
  title: string;
  speciesId: string;
  requiredAmount: number;
  progress: number;
  rewardCredits: number;
  rewardXp: number;
  rewardBaitId: string;
  rewardBaitAmount: number;
}

export interface FischSaveState {
  version: number;
  level: number;
  xp: number;
  credits: number;
  totalCatches: number;
  streak: number;
  cratesOpened: number;
  currentIslandId: string;
  equippedRodId: string;
  equippedBaitId: string | null;
  ownedRods: string[];
  rodEnchants: Record<string, string>;
  baitCounts: Record<string, number>;
  crateCounts: Record<string, number>;
  relicCount: number;
  inventory: FischCaughtItem[];
  bestiary: Record<string, BestiaryEntry>;
  islandCatches: Record<string, number>;
  completedQuestIds: string[];
  questProgress: Record<string, number>;
  anglerQuest: RotatingAnglerQuest | null;
  merlinLuckUntil: number;
  auroraTotemUntil: number;
  soundMuted: boolean;
}

export interface WorldCondition {
  timeOfDay: FischTimeOfDay;
  weather: FischWeather;
  season: FischSeason;
  merlinLuckActive?: boolean;
  auroraActive?: boolean;
  perfectCast?: boolean;
  streak?: number;
}

export function getXpForNextLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return Math.round(120 + (safeLevel - 1) * 85 + Math.pow(safeLevel - 1, 1.45) * 45);
}

export function applyFischXp(
  currentLevel: number,
  currentXp: number,
  gainedXp: number
): { level: number; xp: number; levelsGained: number } {
  let level = Math.max(1, currentLevel);
  let xp = Math.max(0, currentXp + Math.max(0, Math.round(gainedXp)));
  let levelsGained = 0;

  while (xp >= getXpForNextLevel(level) && level < 100) {
    xp -= getXpForNextLevel(level);
    level += 1;
    levelsGained += 1;
  }

  return { level, xp, levelsGained };
}

export function getEffectiveStats(
  rod: FischRod,
  bait: FischBait | null,
  enchant: FischEnchant | null,
  world?: Pick<WorldCondition, 'merlinLuckActive' | 'auroraActive' | 'perfectCast' | 'streak'>
): EffectiveRodStats {
  const fungalBonus =
    rod.id === 'fungal' && (world?.streak ?? 0) >= 2 ? 35 : 0;
  const merlinBonus = world?.merlinLuckActive ? 65 : 0;
  const auroraLuck = world?.auroraActive ? 140 : 0;
  const castLuck = world?.perfectCast ? 25 : 0;
  const castLure = world?.perfectCast ? 15 : 0;

  const lureSpeed =
    rod.lureSpeed + (bait?.lureSpeed ?? 0) + (enchant?.lureSpeedBonus ?? 0) + castLure;

  const luck =
    rod.luck +
    (bait?.universalLuck ?? 0) +
    (enchant?.luckBonus ?? 0) +
    fungalBonus +
    merlinBonus +
    auroraLuck +
    castLuck;

  const control = rod.control + (enchant?.controlBonus ?? 0);
  const resilience =
    rod.resilience + (bait?.resilience ?? 0) + (enchant?.resilienceBonus ?? 0);

  const barWidthRatio = Math.max(0.14, Math.min(0.58, 0.27 + control));

  return {
    lureSpeed,
    luck,
    control,
    resilience,
    maxKg: rod.maxKg,
    barWidthRatio,
    progressBonus: (rod.progressBonus ?? 0) + (enchant?.progressBonus ?? 0),
    shinySparklingBonus: enchant?.shinySparklingBonus ?? 0,
    weightMultiplier: (1 + (rod.sizeBoost ?? 0)) * (enchant?.weightMultiplier ?? 1),
    xpMultiplier: enchant?.xpMultiplier ?? 1,
    heatResistant: Boolean(rod.heatResistant),
    nocturnalOverride: Boolean(rod.nocturnalOverride),
  };
}

const RARITY_BASE_WEIGHTS: Record<FischRarity, number> = {
  Trash: 13,
  Common: 44,
  Uncommon: 23,
  Unusual: 11,
  Rare: 5.5,
  Legendary: 2.3,
  Mythical: 0.9,
  Exotic: 0.3,
};

export function rollCatchCandidate(
  islandId: string,
  rod: FischRod,
  bait: FischBait | null,
  stats: EffectiveRodStats,
  world: WorldCondition,
  rng: () => number = Math.random
): FischSpecies {
  // Check universal crates & Enchant Relic chance first
  const magnetBonus = bait?.crateChanceBonus ?? 0;
  const relicRoll = rng();
  const relicChance = 0.012 + Math.max(0, stats.luck) * 0.00004;
  if (relicRoll < relicChance) {
    const relic = FISCH_SPECIES.find((s) => s.id === 'relic__enchant_relic');
    if (relic) return relic;
  }

  const crateChance = 0.055 + magnetBonus;
  if (rng() < crateChance) {
    const crateIds =
      islandId === 'roslit_volcano'
        ? ['crate__volcanic_geode', 'crate__quality_bait_crate', 'crate__bait_crate']
        : islandId === 'roslit_bay' || islandId === 'sunstone'
        ? ['crate__coral_geode', 'crate__quality_bait_crate', 'crate__bait_crate', 'crate__common_crate']
        : ['crate__bait_crate', 'crate__common_crate', 'crate__quality_bait_crate'];
    const pickedId = crateIds[Math.floor(rng() * crateIds.length)];
    const crate = FISCH_SPECIES.find((s) => s.id === pickedId);
    if (crate) return crate;
  }

  const pool = FISCH_SPECIES.filter((s) => s.islandId === islandId);
  const fallbackPool = pool.length > 0 ? pool : FISCH_SPECIES.filter((s) => s.islandId === 'moosewood');

  // High luck lifts rarer tiers and compresses Trash/Common
  const luckScale = Math.max(-0.4, stats.luck / 100);
  const island = FISCH_ISLANDS.find((i) => i.id === islandId);

  const weighted = fallbackPool.map((sp) => {
    let w = RARITY_BASE_WEIGHTS[sp.rarity];

    if (sp.rarity === 'Trash') {
      w = Math.max(2, w * Math.max(0.25, 1 - luckScale * 0.38));
    } else if (sp.rarity === 'Common') {
      w = Math.max(8, w * Math.max(0.42, 1 - luckScale * 0.22));
    } else if (sp.rarity === 'Uncommon') {
      w *= 1 + Math.max(0, luckScale) * 0.22;
    } else if (sp.rarity === 'Unusual') {
      w *= 1 + Math.max(0, luckScale) * 0.48;
    } else if (sp.rarity === 'Rare') {
      w *= 1 + Math.max(0, luckScale) * 0.95;
    } else if (sp.rarity === 'Legendary') {
      w *= 1 + Math.max(0, luckScale) * 1.45;
    } else if (sp.rarity === 'Mythical') {
      w *= 1 + Math.max(0, luckScale) * 1.95;
    } else if (sp.rarity === 'Exotic') {
      w *= 1 + Math.max(0, luckScale) * 2.4;
    }

    // Time of day bonus/penalty
    if (sp.preferredTime) {
      if (sp.preferredTime === world.timeOfDay || (sp.preferredTime === 'Night' && stats.nocturnalOverride)) {
        w *= 1.6;
      } else {
        w *= 0.25;
      }
    }

    // Weather preference
    if (sp.preferredWeather) {
      const effectiveWeather = world.auroraActive ? 'Aurora' : world.weather;
      if (sp.preferredWeather === effectiveWeather) {
        w *= 2.4;
      } else {
        w *= 0.38;
      }
    }

    // Season preference
    if (sp.preferredSeason) {
      w *= sp.preferredSeason === world.season ? 1.55 : 0.72;
    }

    // Preferred bait multiplier
    if (bait && sp.preferredBait === bait.id) {
      w *= 1 + bait.preferredLuck / 100;
    }

    // Volcano heat resistance factor: without heatResistant rod, rare magma catches are harder to keep
    if (island?.requiresHeatProtect && !stats.heatResistant && (sp.rarity === 'Mythical' || sp.rarity === 'Exotic')) {
      w *= 0.45;
    }

    return { sp, w: Math.max(0.05, w) };
  });

  const totalWeight = weighted.reduce((sum, entry) => sum + entry.w, 0);
  let cursor = rng() * totalWeight;
  for (const entry of weighted) {
    cursor -= entry.w;
    if (cursor <= 0) return entry.sp;
  }

  return weighted[weighted.length - 1].sp;
}

export function calculateFishSellValue(
  species: FischSpecies,
  weightKg: number,
  mutationId: string,
  isShiny: boolean,
  isSparkling: boolean
): number {
  const mut = FISCH_MUTATIONS.find((m) => m.id === mutationId) ?? FISCH_MUTATIONS[0];
  const base = Math.max(2, species.baseValuePerKg * weightKg);
  const shinyMult = isShiny ? 1.85 : 1;
  const sparklingMult = isSparkling ? 1.85 : 1;
  return Math.max(1, Math.round(base * mut.multiplier * shinyMult * sparklingMult));
}

export interface CatchRollOutcome {
  species: FischSpecies;
  weightKg: number;
  mutationId: string;
  isShiny: boolean;
  isSparkling: boolean;
  isGiant: boolean;
  isTiny: boolean;
  sellValue: number;
  xpGained: number;
  lineSnapped: boolean;
}

export function rollCatchResult(
  species: FischSpecies,
  rod: FischRod,
  enchant: FischEnchant | null,
  stats: EffectiveRodStats,
  world: WorldCondition,
  rng: () => number = Math.random
): CatchRollOutcome {
  // Skewed bell-like curve toward lower-mid weights, occasional massive specimen
  const rawRoll = Math.pow(rng(), 1.55);
  let weightKg = species.minKg + (species.maxKg - species.minKg) * rawRoll;

  const sizeChance = rng();
  let isGiant = false;
  let isTiny = false;
  if (sizeChance > 0.94) {
    isGiant = true;
    weightKg *= 1.65 + rng() * 0.65;
  } else if (sizeChance < 0.05) {
    isTiny = true;
    weightKg *= 0.48 + rng() * 0.2;
  }

  weightKg = Number(Math.max(0.05, weightKg * stats.weightMultiplier).toFixed(2));
  const lineSnapped = stats.maxKg < 999999 && weightKg > stats.maxKg;

  // Mutation roll: check rod passive -> enchant override -> natural table
  let mutationId = 'none';
  if (rod.mutationBonus && rng() < rod.mutationBonus.chance) {
    mutationId = rod.mutationBonus.mutationId;
  } else if (enchant?.mutationOverride && rng() < enchant.mutationOverride.chance) {
    mutationId = enchant.mutationOverride.mutationId;
  } else {
    const auroraBoost = world.auroraActive || world.weather === 'Aurora';
    const mutPool = FISCH_MUTATIONS.map((m) => {
      let w = m.naturalWeight;
      if (auroraBoost && m.id === 'aurora') w += 4.5;
      if (world.weather === 'Storm' && m.id === 'electric') w += 3.5;
      return { id: m.id, w };
    });
    const total = mutPool.reduce((acc, item) => acc + item.w, 0);
    let r = rng() * total;
    for (const item of mutPool) {
      r -= item.w;
      if (r <= 0) {
        mutationId = item.id;
        break;
      }
    }
  }

  const shinyProb = (world.auroraActive ? 0.045 : 0.015) + stats.shinySparklingBonus;
  const sparklingProb = (world.timeOfDay === 'Night' ? 0.032 : 0.014) + stats.shinySparklingBonus;
  const isShiny = rng() < shinyProb;
  const isSparkling = rng() < sparklingProb;

  const sellValue = calculateFishSellValue(species, weightKg, mutationId, isShiny, isSparkling);
  const mutObj = FISCH_MUTATIONS.find((m) => m.id === mutationId);
  const xpBonusMut = mutObj && mutObj.multiplier > 1 ? 1.25 : 1;
  const xpGained = Math.round(species.xp * stats.xpMultiplier * xpBonusMut);

  return {
    species,
    weightKg,
    mutationId,
    isShiny,
    isSparkling,
    isGiant,
    isTiny,
    sellValue,
    xpGained,
    lineSnapped,
  };
}

export interface ReelPhysicsConfig {
  barWidth: number; // 0.14..0.58
  fishSpeed: number; // normalized track units per second
  fishErraticness: number; // direction flip propensity
  progressGainPerSec: number;
  progressDrainPerSec: number;
}

export function getReelPhysics(species: FischSpecies, stats: EffectiveRodStats): ReelPhysicsConfig {
  const resFactor = Math.max(0.45, Math.min(1.65, 1 - stats.resilience / 140));
  const diffNorm = species.difficulty / 10; // 0.1 .. 0.97

  const fishSpeed = (0.18 + diffNorm * 0.56) * resFactor;
  const fishErraticness = (0.7 + diffNorm * 2.1) * resFactor;
  const baseGain = 0.34 + stats.progressBonus * 0.35 + species.progressSpeedMod * 0.24;
  const progressGainPerSec = Math.max(0.14, baseGain);
  const progressDrainPerSec = 0.17 + diffNorm * 0.16;

  return {
    barWidth: stats.barWidthRatio,
    fishSpeed,
    fishErraticness,
    progressGainPerSec,
    progressDrainPerSec,
  };
}

export function openCrateReward(
  crateId: string,
  rng: () => number = Math.random
): {
  credits: number;
  baits: Record<string, number>;
  relicsGained: number;
  summaryText: string;
} {
  const baits: Record<string, number> = {};
  let credits = 0;
  let relicsGained = 0;

  const addBait = (id: string, qty: number) => {
    baits[id] = (baits[id] ?? 0) + qty;
  };

  if (crateId === 'crate__bait_crate') {
    const pool = ['worm', 'bagel', 'flakes', 'insect', 'maggot', 'minnow', 'shrimp'];
    for (let i = 0; i < 3; i += 1) {
      addBait(pool[Math.floor(rng() * pool.length)], 2 + Math.floor(rng() * 3));
    }
    credits = 45 + Math.floor(rng() * 65);
  } else if (crateId === 'crate__quality_bait_crate') {
    const pool = ['squid', 'magnet', 'fish_head', 'coral', 'night_shrimp', 'weird_algae'];
    for (let i = 0; i < 3; i += 1) {
      addBait(pool[Math.floor(rng() * pool.length)], 2 + Math.floor(rng() * 2));
    }
    if (rng() < 0.22) addBait('truffle_worm', 1);
    credits = 140 + Math.floor(rng() * 140);
  } else if (crateId === 'crate__coral_geode') {
    addBait('coral', 3 + Math.floor(rng() * 3));
    addBait('night_shrimp', 2);
    credits = 350 + Math.floor(rng() * 320);
    if (rng() < 0.25) relicsGained = 1;
  } else if (crateId === 'crate__volcanic_geode') {
    addBait('weird_algae', 2 + Math.floor(rng() * 2));
    addBait('truffle_worm', 1 + Math.floor(rng() * 2));
    credits = 720 + Math.floor(rng() * 680);
    if (rng() < 0.45) relicsGained = 1;
  } else {
    addBait('worm', 3);
    addBait('shrimp', 2);
    credits = 110 + Math.floor(rng() * 110);
  }

  const baitParts = Object.entries(baits)
    .map(([id, count]) => `${count}× ${FISCH_BAITS.find((b) => b.id === id)?.name ?? id}`)
    .join(', ');

  const summaryText = `+${credits} C$ · ${baitParts}${relicsGained > 0 ? ` · +${relicsGained} Enchant Relic!` : ''}`;
  return { credits, baits, relicsGained, summaryText };
}

export function generateAnglerQuest(
  playerLevel: number,
  rng: () => number = Math.random
): RotatingAnglerQuest {
  const unlockedIslands = FISCH_ISLANDS.filter((isl) => isl.minLevel <= playerLevel).map((i) => i.id);
  const candidates = FISCH_SPECIES.filter(
    (sp) =>
      unlockedIslands.includes(sp.islandId) &&
      !sp.isCrate &&
      !sp.isRelic &&
      sp.rarity !== 'Trash' &&
      sp.rarity !== 'Exotic'
  );
  const picked = candidates[Math.floor(rng() * candidates.length)] ?? FISCH_SPECIES[4];
  const island = FISCH_ISLANDS.find((i) => i.id === picked.islandId);

  const requiredAmount =
    picked.rarity === 'Mythical' || picked.rarity === 'Legendary'
      ? 1
      : picked.rarity === 'Rare'
      ? 2
      : 3;

  const rewardCredits = Math.round((picked.baseValuePerKg * picked.maxKg * 1.35 + 280) * requiredAmount);
  const rewardXp = Math.round(picked.xp * requiredAmount * 1.85);
  const baitPool = ['minnow', 'shrimp', 'squid', 'magnet', 'coral', 'night_shrimp'];
  const rewardBaitId = baitPool[Math.min(baitPool.length - 1, Math.floor(playerLevel / 4))];

  return {
    id: `angler_${Date.now()}_${Math.floor(rng() * 999)}`,
    title: `Pesanan Angler: ${picked.name}`,
    speciesId: picked.id,
    requiredAmount,
    progress: 0,
    rewardCredits,
    rewardXp,
    rewardBaitId,
    rewardBaitAmount: 3 + Math.floor(rng() * 3),
  };
}

export function isRarityAtLeast(rarity: FischRarity, target: FischRarity): boolean {
  return RARITY_ORDER.indexOf(rarity) >= RARITY_ORDER.indexOf(target);
}

export function applyCatchToQuests(
  save: FischSaveState,
  species: FischSpecies
): FischSaveState {
  const nextProgress = { ...save.questProgress };
  for (const q of FISCH_QUESTS) {
    if (save.completedQuestIds.includes(q.id)) continue;
    if (save.level < q.minLevel) continue;

    let matches = false;
    if (q.targetType === 'catch_count') matches = true;
    else if (q.targetType === 'catch_species' && species.id === q.targetValue) matches = true;
    else if (q.targetType === 'island_catch' && species.islandId === q.targetValue) matches = true;
    else if (
      q.targetType === 'catch_rarity' &&
      isRarityAtLeast(species.rarity, q.targetValue as FischRarity)
    ) {
      matches = true;
    }

    if (matches) {
      nextProgress[q.id] = Math.min(q.requiredAmount, (nextProgress[q.id] ?? 0) + 1);
    }
  }

  let nextAngler = save.anglerQuest;
  if (nextAngler && nextAngler.speciesId === species.id) {
    nextAngler = {
      ...nextAngler,
      progress: Math.min(nextAngler.requiredAmount, nextAngler.progress + 1),
    };
  }

  return {
    ...save,
    questProgress: nextProgress,
    anglerQuest: nextAngler,
  };
}

export function createInitialFischSave(): FischSaveState {
  return {
    version: 1,
    level: 1,
    xp: 0,
    credits: 150,
    totalCatches: 0,
    streak: 0,
    cratesOpened: 0,
    currentIslandId: 'moosewood',
    equippedRodId: 'flimsy',
    equippedBaitId: 'worm',
    ownedRods: ['flimsy'],
    rodEnchants: {},
    baitCounts: {
      worm: 10,
      flakes: 4,
    },
    crateCounts: {
      crate__bait_crate: 1,
    },
    relicCount: 0,
    inventory: [],
    bestiary: {},
    islandCatches: {},
    completedQuestIds: [],
    questProgress: {},
    anglerQuest: generateAnglerQuest(1),
    merlinLuckUntil: 0,
    auroraTotemUntil: 0,
    soundMuted: false,
  };
}

export function loadFischSave(): FischSaveState {
  if (typeof window === 'undefined') return createInitialFischSave();
  try {
    const raw = window.localStorage.getItem(FISCH_STORAGE_KEY);
    if (!raw) return createInitialFischSave();
    const parsed = JSON.parse(raw) as Partial<FischSaveState>;
    const base = createInitialFischSave();
    return {
      ...base,
      ...parsed,
      ownedRods:
        Array.isArray(parsed.ownedRods) && parsed.ownedRods.length > 0
          ? parsed.ownedRods
          : base.ownedRods,
      baitCounts: parsed.baitCounts ?? base.baitCounts,
      crateCounts: parsed.crateCounts ?? base.crateCounts,
      inventory: Array.isArray(parsed.inventory) ? parsed.inventory : [],
      bestiary: parsed.bestiary ?? {},
      rodEnchants: parsed.rodEnchants ?? {},
      islandCatches: parsed.islandCatches ?? {},
      completedQuestIds: Array.isArray(parsed.completedQuestIds) ? parsed.completedQuestIds : [],
      questProgress: parsed.questProgress ?? {},
      anglerQuest: parsed.anglerQuest ?? generateAnglerQuest(parsed.level ?? 1),
    };
  } catch {
    return createInitialFischSave();
  }
}

export function saveFischSave(state: FischSaveState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FISCH_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota safe ignore
  }
}

export function formatCredits(amount: number): string {
  return `${Math.round(amount).toLocaleString('en-US')} C$`;
}

export function findRod(rodId: string): FischRod {
  return FISCH_RODS.find((r) => r.id === rodId) ?? FISCH_RODS[0];
}

export function findBait(baitId: string | null): FischBait | null {
  if (!baitId) return null;
  return FISCH_BAITS.find((b) => b.id === baitId) ?? null;
}

export function findEnchant(enchantId: string | undefined): FischEnchant | null {
  if (!enchantId) return null;
  return FISCH_ENCHANTS.find((e) => e.id === enchantId) ?? null;
}
