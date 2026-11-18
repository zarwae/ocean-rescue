// Authentic Fisch-inspired Ocean Expedition Data Registry
// 8 Islands · 18 Rods · 14 Baits · 18 Mutations · 12 Enchants · 228 Unique Species & Crates · NPC Quests

export type FischRarity =
  | 'Trash'
  | 'Common'
  | 'Uncommon'
  | 'Unusual'
  | 'Rare'
  | 'Legendary'
  | 'Mythical'
  | 'Exotic';

export type FischTimeOfDay = 'Day' | 'Night';
export type FischWeather = 'Clear' | 'Rain' | 'Foggy' | 'Windy' | 'Storm' | 'Aurora';
export type FischSeason = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export interface FischIsland {
  id: string;
  name: string;
  subtitle: string;
  minLevel: number;
  description: string;
  dangerNote?: string;
  requiresHeatProtect?: boolean;
  requiresBoat?: boolean;
  outpostCoords?: { x: number; z: number };
  skyTopLight: string;
  skyBottomLight: string;
  waterTopLight: string;
  waterBottomLight: string;
  skyTopDark: string;
  skyBottomDark: string;
  waterTopDark: string;
  waterBottomDark: string;
  silhouetteType:
    | 'dock'
    | 'coral'
    | 'swamp'
    | 'volcano'
    | 'ice'
    | 'sunstone'
    | 'statue'
    | 'abyss'
    | 'forsaken'
    | 'ancient'
    | 'depths';
}

export interface FischBoat {
  id: string;
  name: string;
  price: number;
  minLevel: number;
  speed: number;
  turnSpeed: number;
  hullStyle: 'rowboat' | 'speedboat' | 'trawler' | 'galleon';
  colorHex: string;
  accentHex: string;
  description: string;
}

export const FISCH_BOATS: FischBoat[] = [
  {
    id: 'rowboat',
    name: 'Perahu Dayung Kayu',
    price: 0,
    minLevel: 1,
    speed: 8.2,
    turnSpeed: 2.5,
    hullStyle: 'rowboat',
    colorHex: '#8C5E3C',
    accentHex: '#D9B382',
    description: 'Perahu kayu ringan bawaan pelabuhan. Cukup untuk memancing di tengah laut dan menjelajah pulau terdekat.',
  },
  {
    id: 'speedboat',
    name: 'Speedboat Penjelajah',
    price: 2800,
    minLevel: 3,
    speed: 13.5,
    turnSpeed: 3.1,
    hullStyle: 'speedboat',
    colorHex: '#1D6664',
    accentHex: '#F7F6F1',
    description: 'Perahu motor lincah yang membelah ombak dengan cepat menuju Forsaken Shores.',
  },
  {
    id: 'trawler',
    name: 'Kapal Pancing Trawler',
    price: 12500,
    minLevel: 8,
    speed: 17.0,
    turnSpeed: 2.4,
    hullStyle: 'trawler',
    colorHex: '#B84F3C',
    accentHex: '#F6C453',
    description: 'Kapal besi kokoh berlampu sorot kabin, stabil diterjang badai menuju Ancient Isle.',
  },
  {
    id: 'pirate_ship',
    name: 'Galleon Bajak Laut',
    price: 48000,
    minLevel: 15,
    speed: 21.5,
    turnSpeed: 2.2,
    hullStyle: 'galleon',
    colorHex: '#3B281E',
    accentHex: '#EAB308',
    description: 'Kapal layar raksasa berlayar penuh dan lentera emas untuk ekspedisi jauh ke The Depths.',
  },
];

export interface FischRod {
  id: string;
  name: string;
  price: number;
  minLevel: number;
  lureSpeed: number; // % (-70 to 90)
  luck: number; // % (-20 to 225)
  control: number; // -0.1 to 0.25 (base bar width = 0.28 + control)
  resilience: number; // % (-20 to 35)
  maxKg: number; // 999999 means Infinite
  colorHex: string;
  accentHex: string;
  passiveText: string;
  heatResistant?: boolean;
  nocturnalOverride?: boolean;
  progressBonus?: number; // additive % speed (e.g. +0.15)
  mutationBonus?: { mutationId: string; chance: number };
  spiritBonusEvery?: number; // e.g. Rod of the Depths spawns free spirit fish every 3 catches
  sizeBoost?: number; // e.g. King's Rod +15%
  questRewardOnly?: boolean;
}

export interface FischBait {
  id: string;
  name: string;
  preferredLuck: number;
  universalLuck: number;
  lureSpeed: number;
  resilience: number;
  crateChanceBonus: number;
  rarityLabel: 'Common' | 'Uncommon' | 'Rare' | 'Legendary' | 'Mythical';
  description: string;
  shopPrice?: number;
}

export interface FischMutation {
  id: string;
  name: string;
  multiplier: number;
  colorHex: string;
  badgeText: string;
  naturalWeight: number; // relative spawn chance (0 = rod/appraise/event only)
}

export interface FischEnchant {
  id: string;
  name: string;
  description: string;
  luckBonus?: number;
  lureSpeedBonus?: number;
  controlBonus?: number;
  resilienceBonus?: number;
  progressBonus?: number;
  xpMultiplier?: number;
  shinySparklingBonus?: number;
  weightMultiplier?: number;
  mutationOverride?: { mutationId: string; chance: number };
}

export interface FischSpecies {
  id: string;
  name: string;
  islandId: string; // 'universal' or specific island id
  rarity: FischRarity;
  minKg: number;
  maxKg: number;
  baseValuePerKg: number;
  xp: number;
  preferredTime?: FischTimeOfDay;
  preferredWeather?: FischWeather;
  preferredSeason?: FischSeason;
  preferredBait?: string;
  difficulty: number; // 1..10 (controls fish dash speed & erraticness)
  progressSpeedMod: number; // e.g. 0 = normal, -0.35 = slow progress
  colorHex: string;
  accentHex: string;
  isCrate?: boolean;
  isRelic?: boolean;
  description: string;
}

export interface FischQuest {
  id: string;
  npcName: string;
  npcRole: string;
  title: string;
  description: string;
  minLevel: number;
  targetType: 'catch_count' | 'catch_species' | 'catch_rarity' | 'island_catch' | 'open_crates';
  targetValue: string | number;
  requiredAmount: number;
  rewardCredits: number;
  rewardXp: number;
  rewardBait?: { baitId: string; amount: number };
  rewardCrate?: { crateId: string; amount: number };
  rewardRodId?: string;
  rewardRelics?: number;
}

export const RARITY_ORDER: FischRarity[] = [
  'Trash',
  'Common',
  'Uncommon',
  'Unusual',
  'Rare',
  'Legendary',
  'Mythical',
  'Exotic',
];

export const RARITY_COLORS: Record<FischRarity, { light: string; dark: string; bgTint: string }> = {
  Trash: { light: '#5F7782', dark: '#8FA3AC', bgTint: 'rgba(143,163,172,0.14)' },
  Common: { light: '#1D6664', dark: '#82AAA1', bgTint: 'rgba(130,170,161,0.16)' },
  Uncommon: { light: '#2A7B4F', dark: '#5EC48B', bgTint: 'rgba(94,196,139,0.16)' },
  Unusual: { light: '#2B6CB0', dark: '#63B3ED', bgTint: 'rgba(99,179,237,0.16)' },
  Rare: { light: '#9E3A63', dark: '#E87EA1', bgTint: 'rgba(232,126,161,0.16)' },
  Legendary: { light: '#A66C14', dark: '#F6C453', bgTint: 'rgba(246,196,83,0.18)' },
  Mythical: { light: '#7B3FE4', dark: '#B794F4', bgTint: 'rgba(183,148,244,0.18)' },
  Exotic: { light: '#B84F3C', dark: '#FF8E7A', bgTint: 'rgba(255,142,122,0.2)' },
};

export const FISCH_ISLANDS: FischIsland[] = [
  {
    id: 'moosewood',
    name: 'Moosewood Docks',
    subtitle: 'Pelabuhan Awal & Perairan Tenang',
    minLevel: 1,
    description:
      'Pusat komunitas pemancing Moosewood tempat Pierre, Phineas, Merchant, dan Appraiser berada. Cocok untuk memulai koleksi Bestiary.',
    skyTopLight: '#BEE7E8',
    skyBottomLight: '#E8F4EF',
    waterTopLight: '#3B9498',
    waterBottomLight: '#17545F',
    skyTopDark: '#071722',
    skyBottomDark: '#122E3C',
    waterTopDark: '#123D4B',
    waterBottomDark: '#05131B',
    silhouetteType: 'dock',
  },
  {
    id: 'roslit_bay',
    name: 'Roslit Bay',
    subtitle: 'Teluk Terumbu & Laguna Karang',
    minLevel: 2,
    description:
      'Teluk tropis yang kaya ikan karang warna-warni, pari, dan hiu pesisir. Rumah bagi The Orc dan jalur masuk ke kawah vulkanik.',
    skyTopLight: '#A8E6E4',
    skyBottomLight: '#F3EFE0',
    waterTopLight: '#2FA1A6',
    waterBottomLight: '#135E69',
    skyTopDark: '#091E2A',
    skyBottomDark: '#163D49',
    waterTopDark: '#154B56',
    waterBottomDark: '#061820',
    silhouetteType: 'coral',
  },
  {
    id: 'mushgrove',
    name: 'Mushgrove Swamp',
    subtitle: 'Rawa Jamur Bercahaya',
    minLevel: 5,
    description:
      'Rawa berkabut dengan pohon jamur raksasa tempat Agric berjaga. Rumah bagi aligator purba dan ikan air tawar mistis.',
    skyTopLight: '#B4D6C8',
    skyBottomLight: '#DCE6D5',
    waterTopLight: '#3E7A69',
    waterBottomLight: '#1A453B',
    skyTopDark: '#0A1C19',
    skyBottomDark: '#16352E',
    waterTopDark: '#174036',
    waterBottomDark: '#061511',
    silhouetteType: 'swamp',
  },
  {
    id: 'roslit_volcano',
    name: 'Roslit Volcano',
    subtitle: 'Kaldera Lava & Magma Mendidih',
    minLevel: 7,
    requiresHeatProtect: true,
    dangerNote: 'Air super panas! Gunakan Magma Rod atau Rod tahan panas agar tangkapan langka tidak meleleh.',
    description:
      'Kawah vulkanik aktif dengan kolam lava pijar yang menyimpan makhluk obsidian dan belut magma bernilai tinggi.',
    skyTopLight: '#D9A78C',
    skyBottomLight: '#F0CFB8',
    waterTopLight: '#B34C32',
    waterBottomLight: '#5C1E14',
    skyTopDark: '#1F0C0A',
    skyBottomDark: '#3E1813',
    waterTopDark: '#7C2918',
    waterBottomDark: '#260906',
    silhouetteType: 'volcano',
  },
  {
    id: 'snowcap',
    name: 'Snowcap Island',
    subtitle: 'Pulau Es & Gua Glasial',
    minLevel: 9,
    description:
      'Tebing salju abadi dengan celah es dingin yang sering menghadirkan ikan bermutasi Frozen dan paus kutub raksasa.',
    skyTopLight: '#CFE4F2',
    skyBottomLight: '#F2F8FC',
    waterTopLight: '#4E8FB3',
    waterBottomLight: '#1F4B6E',
    skyTopDark: '#091726',
    skyBottomDark: '#1A344D',
    waterTopDark: '#1B4362',
    waterBottomDark: '#061524',
    silhouetteType: 'ice',
  },
  {
    id: 'sunstone',
    name: 'Sunstone Island',
    subtitle: 'Puncak Matahari & Menara Merlin',
    minLevel: 12,
    description:
      'Kepulauan berbatu keemasan tempat penyihir Merlin menjual Enchant Relic & berkah Luck. Terkenal dengan Sunfish raksasa.',
    skyTopLight: '#D6D9B8',
    skyBottomLight: '#F7ECD1',
    waterTopLight: '#378B89',
    waterBottomLight: '#164E54',
    skyTopDark: '#141B29',
    skyBottomDark: '#2E2B38',
    waterTopDark: '#194552',
    waterBottomDark: '#071822',
    silhouetteType: 'sunstone',
  },
  {
    id: 'sovereignty',
    name: 'Statue of Sovereignty',
    subtitle: 'Monumen Agung & Keeper’s Altar',
    minLevel: 16,
    description:
      'Pulau monumen batu kuno yang menyimpan Keeper’s Altar di ruang bawah tanah untuk memasang Enchant pada Rod di malam hari.',
    skyTopLight: '#BCCBD4',
    skyBottomLight: '#E5E8EB',
    waterTopLight: '#386E82',
    waterBottomLight: '#153647',
    skyTopDark: '#0B111C',
    skyBottomDark: '#19293D',
    waterTopDark: '#133245',
    waterBottomDark: '#05101A',
    silhouetteType: 'statue',
  },
  {
    id: 'desolate_deep',
    name: 'Desolate Deep',
    subtitle: 'Palung Abyssal & Mariana’s Veil',
    minLevel: 22,
    description:
      'Zona laut terdalam paling ekstrem yang dijaga Submariner. Tempat tinggal Kraken, Ancient Depth Serpent, dan Scylla.',
    skyTopLight: '#97B5C4',
    skyBottomLight: '#CBE0E8',
    waterTopLight: '#1E5166',
    waterBottomLight: '#0A2230',
    skyTopDark: '#030810',
    skyBottomDark: '#0B1B2B',
    waterTopDark: '#0B2838',
    waterBottomDark: '#02070D',
    silhouetteType: 'abyss',
  },
  {
    id: 'forsaken_shores',
    name: 'Forsaken Shores',
    subtitle: 'Pulau Bajak Laut (Wajib Naik Kapal)',
    minLevel: 6,
    requiresBoat: true,
    outpostCoords: { x: -48, z: 36 },
    description:
      'Pulau karang tengkorak dan bangkai kapal bajak laut di samudra barat. Hanya dapat diakses menggunakan kapal dari dermaga!',
    skyTopLight: '#C8B8A6',
    skyBottomLight: '#EADCCB',
    waterTopLight: '#2E727D',
    waterBottomLight: '#10343F',
    skyTopDark: '#12101B',
    skyBottomDark: '#262033',
    waterTopDark: '#173A4A',
    waterBottomDark: '#051017',
    silhouetteType: 'forsaken',
  },
  {
    id: 'ancient_isle',
    name: 'Ancient Isle',
    subtitle: 'Kepulauan Meteor Prasejarah (Wajib Naik Kapal)',
    minLevel: 12,
    requiresBoat: true,
    outpostCoords: { x: 50, z: 38 },
    description:
      'Pulau purba di timur samudra dengan kawah meteor bercahaya. Rumah fosil hidup seperti Mosasaurus dan Leedsichthys!',
    skyTopLight: '#BFD9C8',
    skyBottomLight: '#ECEAD3',
    waterTopLight: '#288580',
    waterBottomLight: '#0F4447',
    skyTopDark: '#08181D',
    skyBottomDark: '#17363B',
    waterTopDark: '#13494D',
    waterBottomDark: '#05161A',
    silhouetteType: 'ancient',
  },
  {
    id: 'the_depths',
    name: 'The Depths Atoll',
    subtitle: 'Atol Kristal Samudra Dalam (Wajib Naik Kapal)',
    minLevel: 18,
    requiresBoat: true,
    outpostCoords: { x: 0, z: 68 },
    description:
      'Atol batu gelap berpendar kristal biru-ungu jauh di utara samudra terbuka, hanya dapat ditempuh pelaut tangguh dengan kapal.',
    skyTopLight: '#91B4C9',
    skyBottomLight: '#C9E1EE',
    waterTopLight: '#1D4963',
    waterBottomLight: '#081C2B',
    skyTopDark: '#040914',
    skyBottomDark: '#121F38',
    waterTopDark: '#0D2A42',
    waterBottomDark: '#020710',
    silhouetteType: 'depths',
  },
];

export const FISCH_RODS: FischRod[] = [
  {
    id: 'flimsy',
    name: 'Flimsy Rod',
    price: 0,
    minLevel: 1,
    lureSpeed: 0,
    luck: 0,
    control: 0,
    resilience: 0,
    maxKg: 10.4,
    colorHex: '#A68B6B',
    accentHex: '#C7B99E',
    passiveText: 'Joran kayu awal pemula. Cukup untuk ikan kecil di Moosewood.',
  },
  {
    id: 'training',
    name: 'Training Rod',
    price: 300,
    minLevel: 1,
    lureSpeed: 10,
    luck: -15,
    control: 0.2,
    resilience: 20,
    maxKg: 12,
    colorHex: '#6EA89E',
    accentHex: '#EDEBE3',
    passiveText: 'Bar kontrol sangat lebar (+0.2 Control) untuk melatih ritme Reel.',
  },
  {
    id: 'plastic',
    name: 'Plastic Rod',
    price: 900,
    minLevel: 2,
    lureSpeed: 10,
    luck: 15,
    control: 0.05,
    resilience: 10,
    maxKg: 100,
    colorHex: '#4F94B8',
    accentHex: '#9FD3EC',
    passiveText: 'Ringan & fleksibel dengan daya angkat hingga 100 kg.',
  },
  {
    id: 'carbon',
    name: 'Carbon Rod',
    price: 2000,
    minLevel: 3,
    lureSpeed: 5,
    luck: 25,
    control: 0.05,
    resilience: 10,
    maxKg: 600,
    colorHex: '#3B4954',
    accentHex: '#82AAA1',
    passiveText: 'Serat karbon kokoh mampu mengangkat ikan hingga 600 kg.',
  },
  {
    id: 'fast',
    name: 'Fast Rod',
    price: 4500,
    minLevel: 4,
    lureSpeed: 45,
    luck: -10,
    control: 0.05,
    resilience: -10,
    maxKg: 175,
    colorHex: '#E07A5F',
    accentHex: '#F2CC8F',
    passiveText: 'Kecepatan umpan disambar +45% untuk farming cepat.',
  },
  {
    id: 'lucky',
    name: 'Lucky Rod',
    price: 5250,
    minLevel: 5,
    lureSpeed: 5,
    luck: 60,
    control: 0.05,
    resilience: -10,
    maxKg: 175,
    colorHex: '#3D9970',
    accentHex: '#A8E6CF',
    passiveText: 'Keberuntungan +60% untuk memancing ikan Uncommon hingga Rare.',
  },
  {
    id: 'steady',
    name: 'Steady Rod',
    price: 7000,
    minLevel: 6,
    lureSpeed: -20,
    luck: 35,
    control: 0.08,
    resilience: 30,
    maxKg: 100000,
    colorHex: '#7A6347',
    accentHex: '#D8C39E',
    progressBonus: 0.15,
    passiveText: 'Max Kg 100.000 kg & bonus +15% kecepatan isi bar Reel.',
  },
  {
    id: 'nocturnal',
    name: 'Nocturnal Rod',
    price: 11000,
    minLevel: 7,
    lureSpeed: 10,
    luck: 70,
    control: 0.04,
    resilience: 5,
    maxKg: 2000,
    colorHex: '#433878',
    accentHex: '#B794F4',
    nocturnalOverride: true,
    passiveText: 'Menangkap ikan malam maupun siang tanpa batasan jam!',
  },
  {
    id: 'fungal',
    name: 'Fungal Rod',
    price: 12500,
    minLevel: 6,
    lureSpeed: 12,
    luck: 45,
    control: 0.05,
    resilience: 12,
    maxKg: 450,
    colorHex: '#48A999',
    accentHex: '#C3F0CA',
    passiveText: 'Hadiah spora Mushgrove: memberi +35% Luck tambahan saat Streak aktif.',
  },
  {
    id: 'magma',
    name: 'Magma Rod',
    price: 14500,
    minLevel: 7,
    lureSpeed: -10,
    luck: 25,
    control: 0.04,
    resilience: 10,
    maxKg: 1500,
    colorHex: '#C84B31',
    accentHex: '#F9B248',
    heatResistant: true,
    mutationBonus: { mutationId: 'scorched', chance: 0.25 },
    passiveText: 'Tahan panas Roslit Volcano + 25% peluang mutasi Scorched.',
  },
  {
    id: 'fortune',
    name: 'Fortune Rod',
    price: 12750,
    minLevel: 8,
    lureSpeed: 5,
    luck: 110,
    control: 0.02,
    resilience: -12,
    maxKg: 700,
    colorHex: '#C7A03D',
    accentHex: '#FFF1A8',
    passiveText: 'Joran emas dengan +110% Luck murni untuk berburu Legendary.',
  },
  {
    id: 'rapid',
    name: 'Rapid Rod',
    price: 14000,
    minLevel: 9,
    lureSpeed: 72,
    luck: -10,
    control: 0.02,
    resilience: -15,
    maxKg: 700,
    colorHex: '#D95D39',
    accentHex: '#FFDF91',
    passiveText: 'Tarikan super kilat (+72% Lure Speed), sangat cepat menggigit.',
  },
  {
    id: 'mythical',
    name: 'Mythical Rod',
    price: 110000,
    minLevel: 14,
    lureSpeed: 15,
    luck: 55,
    control: 0.06,
    resilience: 8,
    maxKg: 4500,
    colorHex: '#8E44AD',
    accentHex: '#F5B041',
    mutationBonus: { mutationId: 'mythical', chance: 0.3 },
    passiveText: '30% peluang mutasi Mythical (4.5× nilai jual!) di setiap tangkapan.',
  },
  {
    id: 'kings',
    name: "King's Rod",
    price: 120000,
    minLevel: 15,
    lureSpeed: -15,
    luck: 65,
    control: 0.15,
    resilience: 35,
    maxKg: 999999,
    colorHex: '#D4AF37',
    accentHex: '#EDEBE3',
    sizeBoost: 0.15,
    passiveText: 'Max Kg Tak Terbatas! +35% Resilience & bobot ikan +15% lebih berat.',
  },
  {
    id: 'trident',
    name: 'Trident Rod',
    price: 150000,
    minLevel: 18,
    lureSpeed: 25,
    luck: 150,
    control: 0.04,
    resilience: 12,
    maxKg: 12000,
    colorHex: '#209CEE',
    accentHex: '#F6C453',
    heatResistant: true,
    progressBonus: 0.2,
    mutationBonus: { mutationId: 'atlantean', chance: 0.3 },
    passiveText: 'Tusukan trisula mempercepat Reel +20% & 30% peluang mutasi Atlantean (3×).',
  },
  {
    id: 'rotd',
    name: 'Rod of the Depths',
    price: 750000,
    minLevel: 24,
    lureSpeed: 65,
    luck: 130,
    control: 0.15,
    resilience: 15,
    maxKg: 60000,
    colorHex: '#9B2335',
    accentHex: '#4ECDC4',
    heatResistant: true,
    spiritBonusEvery: 3,
    passiveText: 'Setiap 3 tangkapan, roh Abyssal menghadiahkan 1 ikan ekstra gratis!',
  },
  {
    id: 'heavens',
    name: "Heaven's Rod",
    price: 1750000,
    minLevel: 32,
    lureSpeed: 35,
    luck: 225,
    control: 0.2,
    resilience: 30,
    maxKg: 500000,
    colorHex: '#F3D250',
    accentHex: '#FFFFFF',
    heatResistant: true,
    mutationBonus: { mutationId: 'heavenly', chance: 0.18 },
    passiveText: '+225% Luck surgawi & 18% peluang mutasi Heavenly (5× nilai jual!).',
  },
  {
    id: 'nolife',
    name: 'No-Life Rod',
    price: 2500000,
    minLevel: 40,
    lureSpeed: 90,
    luck: 135,
    control: 0.23,
    resilience: 15,
    maxKg: 999999,
    colorHex: '#E03C31',
    accentHex: '#18181B',
    heatResistant: true,
    nocturnalOverride: true,
    progressBonus: 0.28,
    mutationBonus: { mutationId: 'abyssal', chance: 0.22 },
    passiveText: 'Legenda pamungkas: Max Kg ∞, +90% Lure, +28% Reel Speed & mutasi Abyssal.',
  },
];

export const FISCH_BAITS: FischBait[] = [
  {
    id: 'worm',
    name: 'Worm',
    preferredLuck: 25,
    universalLuck: 0,
    lureSpeed: 10,
    resilience: 0,
    crateChanceBonus: 0,
    rarityLabel: 'Common',
    description: 'Umpan klasik pemula yang disukai ikan sungai & teluk dangkal.',
    shopPrice: 20,
  },
  {
    id: 'bagel',
    name: 'Bagel',
    preferredLuck: 25,
    universalLuck: 0,
    lureSpeed: 0,
    resilience: 15,
    crateChanceBonus: 0,
    rarityLabel: 'Common',
    description: 'Menambah +15% Resilience agar ikan tidak mudah berontak.',
    shopPrice: 35,
  },
  {
    id: 'flakes',
    name: 'Flakes',
    preferredLuck: 55,
    universalLuck: 0,
    lureSpeed: 10,
    resilience: -3,
    crateChanceBonus: 0,
    rarityLabel: 'Common',
    description: 'Serpihan pakan ikan karang untuk meningkatkan gigitan cepat.',
    shopPrice: 40,
  },
  {
    id: 'insect',
    name: 'Insect',
    preferredLuck: 35,
    universalLuck: 0,
    lureSpeed: 5,
    resilience: 0,
    crateChanceBonus: 0,
    rarityLabel: 'Common',
    description: 'Serangga air favorit penghuni Mushgrove Swamp & Moosewood.',
    shopPrice: 45,
  },
  {
    id: 'maggot',
    name: 'Maggot',
    preferredLuck: 35,
    universalLuck: 0,
    lureSpeed: -5,
    resilience: 10,
    crateChanceBonus: 0,
    rarityLabel: 'Uncommon',
    description: 'Umpan stabil yang cocok untuk memancing tangkapan menengah.',
    shopPrice: 60,
  },
  {
    id: 'minnow',
    name: 'Minnow',
    preferredLuck: 65,
    universalLuck: 0,
    lureSpeed: 0,
    resilience: -5,
    crateChanceBonus: 0,
    rarityLabel: 'Uncommon',
    description: 'Ikan kecil hidup pemancing predator laut terbuka.',
    shopPrice: 80,
  },
  {
    id: 'shrimp',
    name: 'Shrimp',
    preferredLuck: 45,
    universalLuck: 25,
    lureSpeed: 0,
    resilience: -5,
    crateChanceBonus: 0,
    rarityLabel: 'Uncommon',
    description: 'Memberi +25% Universal Luck untuk segala jenis ikan laut.',
    shopPrice: 95,
  },
  {
    id: 'squid',
    name: 'Squid',
    preferredLuck: 55,
    universalLuck: 45,
    lureSpeed: -10,
    resilience: 0,
    crateChanceBonus: 0,
    rarityLabel: 'Rare',
    description: 'Umpan cumi aromatik dengan +45% Universal Luck.',
    shopPrice: 140,
  },
  {
    id: 'magnet',
    name: 'Magnet',
    preferredLuck: 0,
    universalLuck: 0,
    lureSpeed: 0,
    resilience: 0,
    crateChanceBonus: 0.45,
    rarityLabel: 'Uncommon',
    description: 'Menarik peti Bait Crate, Quality Crate & Geode hampir tiap lemparan!',
    shopPrice: 110,
  },
  {
    id: 'fish_head',
    name: 'Fish Head',
    preferredLuck: 150,
    universalLuck: 0,
    lureSpeed: 10,
    resilience: -10,
    crateChanceBonus: 0,
    rarityLabel: 'Rare',
    description: 'Aroma kuat pemikat hiu, tuna raksasa, dan predator Roslit.',
    shopPrice: 210,
  },
  {
    id: 'coral',
    name: 'Coral',
    preferredLuck: 0,
    universalLuck: 0,
    lureSpeed: 20,
    resilience: 20,
    crateChanceBonus: 0,
    rarityLabel: 'Rare',
    description: 'Menyeimbangkan +20% Lure Speed dan +20% Resilience.',
    shopPrice: 240,
  },
  {
    id: 'night_shrimp',
    name: 'Night Shrimp',
    preferredLuck: 0,
    universalLuck: 90,
    lureSpeed: 15,
    resilience: 0,
    crateChanceBonus: 0,
    rarityLabel: 'Legendary',
    description: 'Udang berpendar dengan +90% Universal Luck di perairan gelap.',
    shopPrice: 380,
  },
  {
    id: 'weird_algae',
    name: 'Weird Algae',
    preferredLuck: 0,
    universalLuck: 200,
    lureSpeed: -20,
    resilience: 0,
    crateChanceBonus: 0,
    rarityLabel: 'Legendary',
    description: 'Alga misterius berisi +200% Universal Luck untuk memburu Legendary!',
    shopPrice: 650,
  },
  {
    id: 'truffle_worm',
    name: 'Truffle Worm',
    preferredLuck: 300,
    universalLuck: 300,
    lureSpeed: -10,
    resilience: 10,
    crateChanceBonus: 0,
    rarityLabel: 'Mythical',
    description: 'Umpan terlangka (+300% Luck) untuk memanggil Mythical & Exotic!',
    shopPrice: 1200,
  },
];

export const FISCH_MUTATIONS: FischMutation[] = [
  { id: 'none', name: 'Normal', multiplier: 1, colorHex: '#82AAA1', badgeText: 'Normal', naturalWeight: 72 },
  { id: 'translucent', name: 'Translucent', multiplier: 1.3, colorHex: '#A5E3F2', badgeText: 'Translucent', naturalWeight: 5.5 },
  { id: 'darkened', name: 'Darkened', multiplier: 1.3, colorHex: '#637381', badgeText: 'Darkened', naturalWeight: 5.5 },
  { id: 'frozen', name: 'Frozen', multiplier: 1.3, colorHex: '#7CE8FF', badgeText: 'Frozen', naturalWeight: 3.5 },
  { id: 'scorched', name: 'Scorched', multiplier: 1.35, colorHex: '#F27D42', badgeText: 'Scorched', naturalWeight: 2 },
  { id: 'electric', name: 'Electric', multiplier: 1.45, colorHex: '#FFE066', badgeText: 'Electric', naturalWeight: 3 },
  { id: 'glossy', name: 'Glossy', multiplier: 1.6, colorHex: '#9BF6FF', badgeText: 'Glossy', naturalWeight: 3.5 },
  { id: 'silver', name: 'Silver', multiplier: 1.6, colorHex: '#D8DEE9', badgeText: 'Silver', naturalWeight: 3 },
  { id: 'midas', name: 'Midas', multiplier: 2.0, colorHex: '#F4C430', badgeText: 'Midas', naturalWeight: 1.4 },
  { id: 'fossilized', name: 'Fossilized', multiplier: 2.5, colorHex: '#C7A97C', badgeText: 'Fossilized', naturalWeight: 1.0 },
  { id: 'atlantean', name: 'Atlantean', multiplier: 3.0, colorHex: '#3FD8C9', badgeText: 'Atlantean', naturalWeight: 0.7 },
  { id: 'abyssal', name: 'Abyssal', multiplier: 3.5, colorHex: '#5A67D8', badgeText: 'Abyssal', naturalWeight: 0.55 },
  { id: 'sunken', name: 'Sunken', multiplier: 4.0, colorHex: '#2ECC71', badgeText: 'Sunken', naturalWeight: 0.45 },
  { id: 'mythical', name: 'Mythical', multiplier: 4.5, colorHex: '#C084FC', badgeText: 'Mythical', naturalWeight: 0.35 },
  { id: 'heavenly', name: 'Heavenly', multiplier: 5.0, colorHex: '#FFF3B0', badgeText: 'Heavenly', naturalWeight: 0.15 },
  { id: 'subspace', name: 'Subspace', multiplier: 5.0, colorHex: '#FF5C8A', badgeText: 'Subspace', naturalWeight: 0.15 },
  { id: 'aurora', name: 'Aurora', multiplier: 6.5, colorHex: '#56F0B5', badgeText: 'Aurora', naturalWeight: 0.1 },
  { id: 'prismize', name: 'Prismize', multiplier: 8.0, colorHex: '#FF9EAA', badgeText: 'Prismize', naturalWeight: 0.05 },
];

export const FISCH_ENCHANTS: FischEnchant[] = [
  { id: 'lucky', name: 'Lucky', description: '+20% Luck permanen pada joran.', luckBonus: 20 },
  { id: 'resilient', name: 'Resilient', description: '+20% Resilience agar ikan lebih jinak.', resilienceBonus: 20 },
  { id: 'steady', name: 'Steady', description: '+25% kecepatan bar progres Reel.', progressBonus: 0.25 },
  { id: 'swift', name: 'Swift', description: '+30% Lure Speed untuk tarikan lebih cepat.', lureSpeedBonus: 30 },
  { id: 'controlled', name: 'Controlled', description: '+0.08 Control (memperlebar zona putih Reel).', controlBonus: 0.08 },
  {
    id: 'divine',
    name: 'Divine',
    description: '+45% Luck, +20% Resilience, dan +20% Lure Speed.',
    luckBonus: 45,
    resilienceBonus: 20,
    lureSpeedBonus: 20,
  },
  {
    id: 'abyssal',
    name: 'Abyssal',
    description: '+15% peluang mutasi Abyssal (3.5×) & +30% berat ikan.',
    weightMultiplier: 1.3,
    mutationOverride: { mutationId: 'abyssal', chance: 0.15 },
  },
  {
    id: 'quality',
    name: 'Quality',
    description: '+15% Luck, +15% Lure Speed, dan +10% Resilience.',
    luckBonus: 15,
    lureSpeedBonus: 15,
    resilienceBonus: 10,
  },
  { id: 'hasty', name: 'Hasty', description: '+55% Lure Speed ekstrem.', lureSpeedBonus: 55 },
  {
    id: 'blessed',
    name: 'Blessed',
    description: '+8% peluang atribut Shiny & Sparkling sekaligus.',
    shinySparklingBonus: 0.08,
  },
  { id: 'insight', name: 'Insight', description: '+1.5× perolehan XP setiap tangkapan.', xpMultiplier: 1.5 },
  {
    id: 'quantum',
    name: 'Quantum',
    description: '+25% peluang mutasi Subspace (5× nilai jual!).',
    mutationOverride: { mutationId: 'subspace', chance: 0.25 },
  },
];

// Curated 228+ Unique Species & Crates across all 8 Islands (28 per island + 6 universal crates/relics = 230 entries!)
interface RawSpeciesSeed {
  name: string;
  rarity: FischRarity;
  minKg: number;
  maxKg: number;
  val: number;
  time?: FischTimeOfDay;
  weather?: FischWeather;
  season?: FischSeason;
  bait?: string;
  color: string;
  accent: string;
  desc: string;
}

const RARITY_DIFFICULTY: Record<FischRarity, { diff: number; mod: number; xp: number }> = {
  Trash: { diff: 1, mod: 0.18, xp: 10 },
  Common: { diff: 2.2, mod: 0.05, xp: 24 },
  Uncommon: { diff: 3.4, mod: 0, xp: 45 },
  Unusual: { diff: 4.5, mod: -0.05, xp: 75 },
  Rare: { diff: 5.8, mod: -0.12, xp: 135 },
  Legendary: { diff: 7.4, mod: -0.22, xp: 320 },
  Mythical: { diff: 8.8, mod: -0.34, xp: 720 },
  Exotic: { diff: 9.7, mod: -0.45, xp: 1650 },
};

const ISLAND_SPECIES_SEEDS: Record<string, RawSpeciesSeed[]> = {
  moosewood: [
    { name: 'Old Boot', rarity: 'Trash', minKg: 0.6, maxKg: 1.8, val: 4, color: '#6E5A47', accent: '#9B856E', desc: 'Sepatu bot nelayan tua yang tersangkut di dasar dermaga.' },
    { name: 'Seaweed', rarity: 'Trash', minKg: 0.3, maxKg: 1.2, val: 6, color: '#3F6E52', accent: '#72A883', desc: 'Rumpun rumput laut lembab yang hanyut di arus dangkal.' },
    { name: 'Driftwood', rarity: 'Trash', minKg: 1.2, maxKg: 4.5, val: 8, color: '#8C6D4E', accent: '#C4A882', desc: 'Potongan kayu apung dari kapal layar lama.' },
    { name: 'Anchovy', rarity: 'Common', minKg: 0.1, maxKg: 0.5, val: 45, bait: 'worm', color: '#89A7B8', accent: '#DDE9F0', desc: 'Ikan teri kecil mengilap yang bergerak dalam kawanan rapat.' },
    { name: 'Sardine', rarity: 'Common', minKg: 0.2, maxKg: 0.9, val: 42, bait: 'flakes', color: '#789EB2', accent: '#CFE3EE', desc: 'Ikan sarden perak cepat yang mudah ditemui sepanjang hari.' },
    { name: 'Mackerel', rarity: 'Common', minKg: 0.6, maxKg: 2.8, val: 38, bait: 'minnow', color: '#457E9C', accent: '#9CD1E8', desc: 'Ikan makarel bergaris biru metalik di dekat pilar dermaga.' },
    { name: 'Cod', rarity: 'Common', minKg: 1.5, maxKg: 7.5, val: 32, bait: 'worm', color: '#8A8068', accent: '#D8CEB8', desc: 'Ikan kod pesisir berdaging tebal favorit Merchant Moosewood.' },
    { name: 'Sockeye Salmon', rarity: 'Common', minKg: 1.8, maxKg: 6.5, val: 44, season: 'Autumn', bait: 'insect', color: '#C2564B', accent: '#8FB59B', desc: 'Salmon merah cerah yang bermigrasi menyusuri muara.' },
    { name: 'Largemouth Bass', rarity: 'Common', minKg: 1.2, maxKg: 5.5, val: 40, bait: 'worm', color: '#5D8A56', accent: '#C5D8A4', desc: 'Ikan air payau lincah yang menyambar umpan permukaan.' },
    { name: 'Flounder', rarity: 'Common', minKg: 0.9, maxKg: 4.2, val: 46, bait: 'shrimp', color: '#A38B6D', accent: '#E0CBAF', desc: 'Ikan pipih penyamar ulung yang bersembunyi di pasir dasar.' },
    { name: 'Carp', rarity: 'Uncommon', minKg: 2.0, maxKg: 9.0, val: 48, bait: 'bagel', color: '#C98944', accent: '#F4CE8B', desc: 'Ikan mas muara berpostur bulat yang gemar umpan roti.' },
    { name: 'Yellowtail Snapper', rarity: 'Uncommon', minKg: 1.8, maxKg: 8.5, val: 56, time: 'Day', bait: 'shrimp', color: '#D4AF37', accent: '#F5E79E', desc: 'Kakap ekor kuning cerah yang berenang dekat dermaga kayu.' },
    { name: 'Red Snapper', rarity: 'Uncommon', minKg: 2.5, maxKg: 11.0, val: 54, bait: 'minnow', color: '#CC5548', accent: '#F2A399', desc: 'Kakap merah bernilai baik di pasar pelabuhan.' },
    { name: 'Trout', rarity: 'Uncommon', minKg: 1.4, maxKg: 6.0, val: 58, weather: 'Rain', bait: 'insect', color: '#6F9E84', accent: '#E69F8A', desc: 'Muncul lebih sering saat hujan turun di pelabuhan Moosewood.' },
    { name: 'Halibut', rarity: 'Uncommon', minKg: 6.0, maxKg: 26.0, val: 38, bait: 'squid', color: '#7D6E5D', accent: '#C9BBA8', desc: 'Ikan dasar datar berukuran lebar yang cukup berat ditarik.' },
    { name: 'Barracuda', rarity: 'Unusual', minKg: 4.5, maxKg: 18.0, val: 68, time: 'Day', bait: 'minnow', color: '#63808E', accent: '#D0E0E8', desc: 'Predator ramping bergigi tajam dengan tarikan kilat.' },
    { name: 'Eel', rarity: 'Unusual', minKg: 2.5, maxKg: 11.5, val: 76, time: 'Night', bait: 'maggot', color: '#47594D', accent: '#98B39D', desc: 'Belut laut licin yang aktif berburu saat malam tiba.' },
    { name: 'Bream', rarity: 'Unusual', minKg: 1.5, maxKg: 5.5, val: 82, bait: 'bagel', color: '#A3B4C2', accent: '#F0EDE5', desc: 'Ikan perak membulat dengan kilau keperakan halus.' },
    { name: 'Bullhead Catfish', rarity: 'Unusual', minKg: 3.0, maxKg: 12.0, val: 72, weather: 'Foggy', bait: 'worm', color: '#5C5042', accent: '#B8A894', desc: 'Lele berkumis panjang penjaga perairan berkabut.' },
    { name: 'Whiting', rarity: 'Uncommon', minKg: 1.0, maxKg: 4.5, val: 55, bait: 'flakes', color: '#BAC9D1', accent: '#FFFFFF', desc: 'Ikan ramping putih bersih yang berenang dalam kelompok.' },
    { name: 'Angelfish', rarity: 'Rare', minKg: 0.8, maxKg: 3.2, val: 210, time: 'Day', bait: 'coral', color: '#3986B5', accent: '#F4C95D', desc: 'Ikan bidadari bercorak elegan yang diincar kolektor.' },
    { name: 'Piranha', rarity: 'Rare', minKg: 1.5, maxKg: 5.0, val: 190, weather: 'Storm', bait: 'fish_head', color: '#9E3333', accent: '#E59866', desc: 'Pemangsa agresif dengan gerakan zig-zag sangat cepat.' },
    { name: 'Pike', rarity: 'Rare', minKg: 4.0, maxKg: 16.0, val: 140, season: 'Spring', bait: 'minnow', color: '#4E7D54', accent: '#E8D58E', desc: 'Ikan tombak air payau dengan serangan mendadak.' },
    { name: 'Sturgeon', rarity: 'Rare', minKg: 15.0, maxKg: 65.0, val: 65, bait: 'truffle_worm', color: '#59636E', accent: '#B6C0CC', desc: 'Ikan purba berlapis pelat tulang di punggungnya.' },
    { name: 'Golden Smallmouth Bass', rarity: 'Legendary', minKg: 3.5, maxKg: 11.0, val: 480, time: 'Day', weather: 'Clear', bait: 'weird_algae', color: '#E3B23C', accent: '#FFF4B8', desc: 'Varian emas berkilau dari Bass legendaris Moosewood.' },
    { name: 'Oarfish', rarity: 'Legendary', minKg: 35.0, maxKg: 140.0, val: 95, time: 'Night', weather: 'Foggy', bait: 'squid', color: '#C9D6DF', accent: '#E04F5F', desc: 'Ikan pita raksasa berjambul merah terang penanda badai.' },
    { name: 'Isonade', rarity: 'Mythical', minKg: 65.0, maxKg: 210.0, val: 175, time: 'Night', weather: 'Aurora', bait: 'truffle_worm', color: '#2F3D73', accent: '#82E9DE', desc: 'Hiu bayangan mitologis yang jarang menampakkan siripnya.' },
    { name: 'Golden Sea Pearl', rarity: 'Exotic', minKg: 2.0, maxKg: 6.0, val: 3800, weather: 'Aurora', bait: 'truffle_worm', color: '#F6D365', accent: '#FFF8DB', desc: 'Mutiara keramat raksasa peninggalan penjelajah awal.' },
  ],
  roslit_bay: [
    { name: 'Tire', rarity: 'Trash', minKg: 4.0, maxKg: 12.0, val: 5, color: '#3B4248', accent: '#69737D', desc: 'Ban karet tua yang tenggelam di sisi terumbu.' },
    { name: 'Rusty Tin', rarity: 'Trash', minKg: 0.4, maxKg: 1.5, val: 6, color: '#8E6248', accent: '#B8896D', desc: 'Kaleng logam berkarat sisa kapal karam.' },
    { name: 'Clownfish', rarity: 'Common', minKg: 0.2, maxKg: 0.8, val: 65, bait: 'flakes', color: '#E86A33', accent: '#FFFFFF', desc: 'Ikan badut penghuni anemon Roslit Bay.' },
    { name: 'Blue Tang', rarity: 'Common', minKg: 0.3, maxKg: 1.1, val: 62, bait: 'flakes', color: '#2B6CB0', accent: '#F6E05E', desc: 'Ikan biru cerah berekor kuning di karang dangkal.' },
    { name: 'Perch', rarity: 'Common', minKg: 0.7, maxKg: 2.9, val: 50, bait: 'worm', color: '#6D8C54', accent: '#D8B45B', desc: 'Ikan berduri kecil yang sering menyambar umpan cepat.' },
    { name: 'Butterflyfish', rarity: 'Common', minKg: 0.4, maxKg: 1.4, val: 68, time: 'Day', bait: 'coral', color: '#F2C14E', accent: '#2D3748', desc: 'Ikan kupu-kupu kuning bergaris hitam anggun.' },
    { name: 'Damselfish', rarity: 'Common', minKg: 0.2, maxKg: 0.7, val: 60, bait: 'flakes', color: '#38B2AC', accent: '#E6FFFA', desc: 'Ikan kecil agresif penjaga karang meja.' },
    { name: 'Mandarin Fish', rarity: 'Uncommon', minKg: 0.3, maxKg: 0.9, val: 95, bait: 'shrimp', color: '#2B7A9E', accent: '#F27D42', desc: 'Ikan berpola psikedelik biru-oranye sangat memikat.' },
    { name: 'Parrotfish', rarity: 'Uncommon', minKg: 1.5, maxKg: 6.5, val: 66, bait: 'coral', color: '#2F9E8F', accent: '#EC708B', desc: 'Ikan kakatua berwarna zamrud-merah muda pemakan alga karang.' },
    { name: 'Squid', rarity: 'Uncommon', minKg: 1.2, maxKg: 5.5, val: 72, time: 'Night', bait: 'minnow', color: '#D68989', accent: '#FADBD8', desc: 'Cumi-cumi teluk yang bersinar lembut saat malam.' },
    { name: 'Stingray', rarity: 'Uncommon', minKg: 4.5, maxKg: 18.0, val: 58, bait: 'shrimp', color: '#6D7F8C', accent: '#B8C9D4', desc: 'Ikan pari yang meluncur anggun di dasar laguna.' },
    { name: 'Pufferfish', rarity: 'Uncommon', minKg: 1.0, maxKg: 4.2, val: 86, bait: 'shrimp', color: '#D9A441', accent: '#F9E79F', desc: 'Ikan buntal berduri yang diburu The Orc untuk misinya!' },
    { name: 'Nurse Shark', rarity: 'Unusual', minKg: 18.0, maxKg: 65.0, val: 48, bait: 'fish_head', color: '#8C7A65', accent: '#D6C7B2', desc: 'Hiu perawat jinak namun bertenaga berat saat ditarik.' },
    { name: 'Trumpetfish', rarity: 'Unusual', minKg: 1.4, maxKg: 4.8, val: 98, bait: 'minnow', color: '#C99E48', accent: '#F2E1A0', desc: 'Ikan bermoncong pipa panjang yang mengintai dari balik karang.' },
    { name: 'Lionfish', rarity: 'Unusual', minKg: 1.1, maxKg: 3.9, val: 112, time: 'Night', bait: 'shrimp', color: '#C04838', accent: '#F9EBEA', desc: 'Ikan bersirip kipas beracun dengan pola belang mencolok.' },
    { name: 'Ribbon Eel', rarity: 'Unusual', minKg: 1.8, maxKg: 6.5, val: 105, bait: 'squid', color: '#2980B9', accent: '#F1C40F', desc: 'Belut pita biru cerah yang meliuk cepat di arus.' },
    { name: 'Mahi Mahi', rarity: 'Rare', minKg: 8.0, maxKg: 28.0, val: 120, time: 'Day', bait: 'minnow', color: '#32A86D', accent: '#F7DC6F', desc: 'Dorado pelagis cepat berdaya tarik tinggi.' },
    { name: 'Swordfish', rarity: 'Rare', minKg: 28.0, maxKg: 110.0, val: 85, bait: 'squid', color: '#41698E', accent: '#DCE6F2', desc: 'Ikan todak berhidung pedang dengan lompatan eksplosif.' },
    { name: 'Moray Eel', rarity: 'Rare', minKg: 6.0, maxKg: 22.0, val: 145, time: 'Night', bait: 'fish_head', color: '#587849', accent: '#B7D48C', desc: 'Belut karang bertubuh kuat penghuni celah batu.' },
    { name: 'Scorpionfish', rarity: 'Rare', minKg: 1.6, maxKg: 5.5, val: 195, bait: 'shrimp', color: '#B0413E', accent: '#E89B82', desc: 'Ikan kalajengking berbalut kamuflase karang merah.' },
    { name: 'Manta Ray', rarity: 'Legendary', minKg: 55.0, maxKg: 190.0, val: 98, time: 'Day', weather: 'Clear', bait: 'coral', color: '#2A3F54', accent: '#D5E5F2', desc: 'Pari manta raksasa bersayap lebar meluncur di permukaan Roslit.' },
    { name: 'Axolotl', rarity: 'Legendary', minKg: 1.2, maxKg: 4.5, val: 650, weather: 'Rain', bait: 'worm', color: '#F4A6B8', accent: '#E85D75', desc: 'Salamander air langka berwarna merah jambu lembut.' },
    { name: 'Crown Tang', rarity: 'Legendary', minKg: 2.0, maxKg: 6.5, val: 580, bait: 'weird_algae', color: '#3675B5', accent: '#F9D448', desc: 'Tang bermahkota emas kebanggaan penyelam Roslit.' },
    { name: 'Great Hammerhead', rarity: 'Legendary', minKg: 85.0, maxKg: 280.0, val: 82, bait: 'fish_head', color: '#6E7F8A', accent: '#CBD6DE', desc: 'Hiu martil besar yang menguji kekuatan senar Rod Anda.' },
    { name: 'Sea Turtle Relic', rarity: 'Mythical', minKg: 35.0, maxKg: 95.0, val: 310, weather: 'Clear', bait: 'weird_algae', color: '#2E7D67', accent: '#E2C07D', desc: 'Penyu karang tua bercangkang bertatahkan batu bercahaya.' },
    { name: 'Great White Shark', rarity: 'Mythical', minKg: 210.0, maxKg: 620.0, val: 135, weather: 'Storm', bait: 'fish_head', color: '#5F6F7A', accent: '#F4F6F7', desc: 'Predator puncak laut biru pemburu perairan badai.' },
    { name: 'Whale Shark', rarity: 'Mythical', minKg: 450.0, maxKg: 1400.0, val: 92, time: 'Day', bait: 'truffle_worm', color: '#395B75', accent: '#EAECEE', desc: 'Raksasa lembut berbintik bintang, sangat berat namun berharga fantastis.' },
    { name: 'Prism Coral Dragon', rarity: 'Exotic', minKg: 48.0, maxKg: 130.0, val: 890, weather: 'Aurora', bait: 'truffle_worm', color: '#E85D88', accent: '#7CE8FF', desc: 'Naga laut karang prismatik yang memantulkan pelangi cahaya.' },
  ],
  mushgrove: [
    { name: 'Fungal Log', rarity: 'Trash', minKg: 2.0, maxKg: 6.5, val: 7, color: '#635344', accent: '#7EA888', desc: 'Batang kayu lapuk yang ditumbuhi lumut dan spora.' },
    { name: 'Swamp Boot', rarity: 'Trash', minKg: 0.9, maxKg: 2.2, val: 6, color: '#555C48', accent: '#8F9B76', desc: 'Sepatu bot berlumpur tertinggal di rawa.' },
    { name: 'White Perch', rarity: 'Common', minKg: 0.6, maxKg: 2.4, val: 58, bait: 'worm', color: '#A3B0A8', accent: '#E1EAE5', desc: 'Ikan rawa pucat yang menyukai perairan teduh.' },
    { name: 'Swamp Bass', rarity: 'Common', minKg: 1.5, maxKg: 5.5, val: 54, bait: 'insect', color: '#4E6B48', accent: '#B4C99A', desc: 'Bass berlumut penghuni akar bakau Mushgrove.' },
    { name: 'Grey Carp', rarity: 'Common', minKg: 2.0, maxKg: 8.0, val: 52, bait: 'bagel', color: '#7D827E', accent: '#C6CCC8', desc: 'Ikan karper kelabu tenang di perairan rawa dalam.' },
    { name: 'Mudskipper', rarity: 'Common', minKg: 0.4, maxKg: 1.3, val: 66, bait: 'insect', color: '#707856', accent: '#C2CA99', desc: 'Ikan glodok amfibi yang melompat di lumpur akar.' },
    { name: 'Bowfin', rarity: 'Uncommon', minKg: 2.8, maxKg: 10.5, val: 74, bait: 'minnow', color: '#566942', accent: '#D4B66A', desc: 'Ikan purba bersirip punggung panjang bak ombak.' },
    { name: 'Swamp Frog', rarity: 'Uncommon', minKg: 0.5, maxKg: 1.8, val: 92, weather: 'Rain', bait: 'insect', color: '#4A8C4A', accent: '#B5E699', desc: 'Katak besar bersuara nyaring saat gerimis rawa.' },
    { name: 'Snakehead', rarity: 'Uncommon', minKg: 3.0, maxKg: 11.0, val: 84, bait: 'minnow', color: '#4B5E40', accent: '#A6B57A', desc: 'Ikan gabus agresif dengan sisik bercorak ular.' },
    { name: 'Peat Eel', rarity: 'Uncommon', minKg: 1.8, maxKg: 7.2, val: 88, time: 'Night', bait: 'maggot', color: '#4D4438', accent: '#998974', desc: 'Belut rawa gelap yang keluar di sela lumut malam.' },
    { name: 'Spore Minnow', rarity: 'Uncommon', minKg: 0.3, maxKg: 1.0, val: 110, bait: 'flakes', color: '#58B59B', accent: '#C4FAF0', desc: 'Ikan kecil bercahaya hijau zamrud dari spora jamur.' },
    { name: 'Longnose Gar', rarity: 'Unusual', minKg: 6.0, maxKg: 24.0, val: 86, bait: 'minnow', color: '#6E7F5B', accent: '#D8E3C3', desc: 'Ikan berparuh panjang bergigi runcing.' },
    { name: 'Marsh Snapper', rarity: 'Unusual', minKg: 4.5, maxKg: 16.0, val: 95, bait: 'shrimp', color: '#627358', accent: '#B8C9AC', desc: 'Penyu gertak berkerapas lumut penghuni lubuk.' },
    { name: 'Glowgill', rarity: 'Unusual', minKg: 1.1, maxKg: 3.8, val: 128, time: 'Night', bait: 'insect', color: '#47C9AF', accent: '#E0FFF9', desc: 'Ikan biru-toska dengan insang bioluminesen.' },
    { name: 'Mushgrove Toad', rarity: 'Unusual', minKg: 1.5, maxKg: 5.5, val: 120, weather: 'Foggy', bait: 'maggot', color: '#8C624A', accent: '#D9A78B', desc: 'Kodok bertopi spora jamur yang melompat tinggi.' },
    { name: 'Catfish Elder', rarity: 'Rare', minKg: 12.0, maxKg: 42.0, val: 115, time: 'Night', bait: 'squid', color: '#4B5248', accent: '#A8B89A', desc: 'Lele raksasa berkumis panjang penjaga rawa tua.' },
    { name: 'Bichir', rarity: 'Rare', minKg: 3.5, maxKg: 12.0, val: 175, bait: 'minnow', color: '#557A67', accent: '#D4B46A', desc: 'Ikan naga rawa bersirip punggung bergerigi.' },
    { name: 'Alligator', rarity: 'Rare', minKg: 32.0, maxKg: 98.0, val: 96, weather: 'Rain', bait: 'fish_head', color: '#3E5E3E', accent: '#A6C49A', desc: 'Tangkapan wajib untuk misi Agric demi meraih Fungal Rod!' },
    { name: 'Fungal Carp', rarity: 'Rare', minKg: 4.0, maxKg: 14.0, val: 195, bait: 'bagel', color: '#6B998E', accent: '#E8A5C8', desc: 'Karper bermahkota jamur ungu bercahaya.' },
    { name: 'Electric Catfish', rarity: 'Rare', minKg: 5.0, maxKg: 18.0, val: 185, weather: 'Storm', bait: 'shrimp', color: '#647687', accent: '#FCE883', desc: 'Menghasilkan kejutan listrik ringan di ujung senar.' },
    { name: 'Alligator Gar', rarity: 'Legendary', minKg: 45.0, maxKg: 165.0, val: 145, time: 'Night', bait: 'fish_head', color: '#455D41', accent: '#B8C99D', desc: 'Monster rawa raksasa bertenaga tarik luar biasa.' },
    { name: 'Handfish', rarity: 'Legendary', minKg: 1.8, maxKg: 6.0, val: 720, weather: 'Foggy', bait: 'weird_algae', color: '#D4814A', accent: '#F7D294', desc: 'Ikan langka yang berjalan di dasar lumpur memakai siripnya.' },
    { name: 'Mycelium Drake', rarity: 'Legendary', minKg: 18.0, maxKg: 55.0, val: 260, time: 'Night', bait: 'weird_algae', color: '#52B788', accent: '#F4A261', desc: 'Makhluk amfibi bercahaya yang hidup di akar jamur purba.' },
    { name: 'Swamp Leviathan', rarity: 'Legendary', minKg: 90.0, maxKg: 260.0, val: 125, weather: 'Storm', bait: 'truffle_worm', color: '#2B4A3E', accent: '#7CE8D8', desc: 'Raja lumpur kuno penunggu tengah Mushgrove.' },
    { name: 'Goliath Tigerfish', rarity: 'Mythical', minKg: 35.0, maxKg: 110.0, val: 380, time: 'Day', bait: 'truffle_worm', color: '#7D8E95', accent: '#E86A53', desc: 'Predator ganas berwajah taring terbesar di perairan tawar.' },
    { name: 'Ancient Swamp Lurker', rarity: 'Mythical', minKg: 75.0, maxKg: 195.0, val: 290, time: 'Night', bait: 'truffle_worm', color: '#294036', accent: '#9BF6FF', desc: 'Makhluk legendaris rawa yang hanya muncul di kabut malam.' },
    { name: 'Luminous Hydra Eel', rarity: 'Mythical', minKg: 42.0, maxKg: 120.0, val: 420, weather: 'Aurora', bait: 'night_shrimp', color: '#45B89E', accent: '#F5E79E', desc: 'Belut bercahaya biru-hijau dengan tarikan beruntun.' },
    { name: 'Elder Mycelium Queen', rarity: 'Exotic', minKg: 60.0, maxKg: 170.0, val: 960, weather: 'Aurora', bait: 'truffle_worm', color: '#9D4EDD', accent: '#7CE8C8', desc: 'Penguasa spora abadi Mushgrove, sangat jarang terlihat.' },
  ],
  roslit_volcano: [
    { name: 'Basalt Shard', rarity: 'Trash', minKg: 1.5, maxKg: 5.0, val: 9, color: '#433A39', accent: '#806A66', desc: 'Bongkahan batu vulkanik keras tersangkut kail.' },
    { name: 'Charred Wood', rarity: 'Trash', minKg: 1.0, maxKg: 3.5, val: 8, color: '#332927', accent: '#A64D32', desc: 'Kayu hangus yang mengapung di tepi kaldera.' },
    { name: 'Ember Goby', rarity: 'Common', minKg: 0.4, maxKg: 1.4, val: 85, bait: 'insect', color: '#D45B35', accent: '#F7C266', desc: 'Ikan goby tahan panas bersirip bara api.' },
    { name: 'Cinder Minnow', rarity: 'Common', minKg: 0.3, maxKg: 1.0, val: 90, bait: 'flakes', color: '#BA4A2F', accent: '#FFDF7D', desc: 'Ikan kecil lincah yang meluncur di kolam lava dangkal.' },
    { name: 'Ash Perch', rarity: 'Common', minKg: 1.0, maxKg: 3.8, val: 82, bait: 'worm', color: '#6E615F', accent: '#E8744A', desc: 'Ikan abu vulkanik yang menyukai panas dasar kawah.' },
    { name: 'Pyro Crab', rarity: 'Common', minKg: 0.8, maxKg: 2.8, val: 92, bait: 'shrimp', color: '#C83E2B', accent: '#F59B42', desc: 'Kepiting bercangkang tahan leleh di pinggir bebatuan.' },
    { name: 'Volcanic Bass', rarity: 'Uncommon', minKg: 2.2, maxKg: 8.5, val: 96, bait: 'minnow', color: '#9C3B28', accent: '#F49D37', desc: 'Bass bertubuh keras dengan sisik seperti arang menyala.' },
    { name: 'Magma Tang', rarity: 'Uncommon', minKg: 1.2, maxKg: 4.5, val: 112, bait: 'coral', color: '#E06D3B', accent: '#FCE883', desc: 'Ikan pipih jingga menyala yang memercikkan percikan bara.' },
    { name: 'Sulfur Snapper', rarity: 'Uncommon', minKg: 2.5, maxKg: 9.0, val: 105, bait: 'squid', color: '#C99E32', accent: '#FF6B4A', desc: 'Kakap belerang yang banyak dicari alkemis pulau.' },
    { name: 'Lava Clam', rarity: 'Uncommon', minKg: 1.8, maxKg: 6.2, val: 118, bait: 'magnet', color: '#5C3A33', accent: '#FF9852', desc: 'Kerang batu yang menyimpan butiran panas bercahaya.' },
    { name: 'Molten Tetra', rarity: 'Uncommon', minKg: 0.5, maxKg: 1.8, val: 124, bait: 'flakes', color: '#E8533A', accent: '#FFF1A8', desc: 'Ikan tetra magma berbaris merah menyilaukan.' },
    { name: 'Obsidian Pike', rarity: 'Unusual', minKg: 4.5, maxKg: 16.0, val: 132, bait: 'minnow', color: '#2E2B36', accent: '#F26430', desc: 'Ikan ramping sehitam kaca obsidian dengan garis lava.' },
    { name: 'Pyrite Puffer', rarity: 'Unusual', minKg: 1.6, maxKg: 5.5, val: 145, bait: 'shrimp', color: '#D4A838', accent: '#6E4B32', desc: 'Ikan buntal berkilau logam emas semu dari kaldera.' },
    { name: 'Blazing Barracuda', rarity: 'Unusual', minKg: 6.0, maxKg: 21.0, val: 135, time: 'Day', bait: 'fish_head', color: '#B53726', accent: '#FFCC66', desc: 'Barracuda berkecepatan tinggi di tengah kawah lava.' },
    { name: 'Cinder Eel', rarity: 'Unusual', minKg: 3.0, maxKg: 10.5, val: 142, time: 'Night', bait: 'maggot', color: '#4A312C', accent: '#FF7043', desc: 'Belut kawah yang meliuk di balik batu pijar.' },
    { name: 'Magma Grouper', rarity: 'Rare', minKg: 14.0, maxKg: 48.0, val: 140, bait: 'fish_head', color: '#8A3324', accent: '#F79D42', desc: 'Kerapu raksasa bercorak retakan lahar.' },
    { name: 'Ignis Ray', rarity: 'Rare', minKg: 10.0, maxKg: 35.0, val: 158, bait: 'squid', color: '#A33E2E', accent: '#FFD166', desc: 'Pari kaldera bersayap lebar membelah permukaan panas.' },
    { name: 'Lava Jellyfish', rarity: 'Rare', minKg: 2.0, maxKg: 7.0, val: 265, time: 'Night', bait: 'night_shrimp', color: '#FF6B4A', accent: '#FFF0A5', desc: 'Ubur-ubur bara bercahaya lembut bagai lampion.' },
    { name: 'Scorchback Shark', rarity: 'Rare', minKg: 28.0, maxKg: 85.0, val: 132, bait: 'fish_head', color: '#4B3634', accent: '#FF5722', desc: 'Hiu bertulang punggung hangus yang bertarung sengit.' },
    { name: 'Ember Koi', rarity: 'Rare', minKg: 3.5, maxKg: 12.0, val: 240, bait: 'bagel', color: '#E85C3A', accent: '#FFF6CC', desc: 'Ikan koi keramat berenang tenang di tengah panas ekstrem.' },
    { name: 'Volcanic Emperor', rarity: 'Legendary', minKg: 24.0, maxKg: 75.0, val: 310, bait: 'weird_algae', color: '#B83227', accent: '#FFD700', desc: 'Ikan kaisar kawah bersisik emas dan merah tua.' },
    { name: 'Obsidian Serpent', rarity: 'Legendary', minKg: 42.0, maxKg: 130.0, val: 270, time: 'Night', bait: 'squid', color: '#231F29', accent: '#FF6D3F', desc: 'Ular laut lava raksasa yang menantang kontrol pemain.' },
    { name: 'Molten Banshee', rarity: 'Legendary', minKg: 16.0, maxKg: 48.0, val: 350, weather: 'Storm', bait: 'night_shrimp', color: '#D94326', accent: '#FFE680', desc: 'Makhluk api bermata menyala muncul saat abu badai turun.' },
    { name: 'Solar Magma Marlin', rarity: 'Legendary', minKg: 58.0, maxKg: 170.0, val: 245, time: 'Day', bait: 'fish_head', color: '#CF4D28', accent: '#FFF176', desc: 'Marlin bermoncong tajam membelah arus magma.' },
    { name: 'Pyroclastic Leviathan', rarity: 'Mythical', minKg: 95.0, maxKg: 260.0, val: 410, bait: 'truffle_worm', color: '#592018', accent: '#FF9E44', desc: 'Leviathan kaldera yang sangat agresif di minigame Reel.' },
    { name: 'Infernal Phoenix Fish', rarity: 'Mythical', minKg: 18.0, maxKg: 52.0, val: 760, time: 'Day', bait: 'truffle_worm', color: '#F05D3B', accent: '#FFF4A3', desc: 'Ikan bersayap api membara berharga sangat tinggi.' },
    { name: 'Corebound Kraken', rarity: 'Mythical', minKg: 140.0, maxKg: 380.0, val: 330, time: 'Night', bait: 'truffle_worm', color: '#381B18', accent: '#FF7043', desc: 'Tentakel raksasa penghuni inti kawah Roslit.' },
    { name: 'Magma Sovereign', rarity: 'Exotic', minKg: 110.0, maxKg: 290.0, val: 1150, weather: 'Aurora', bait: 'truffle_worm', color: '#FF4E2A', accent: '#FFF3B0', desc: 'Penguasa tertinggi kaldera, simbol penakluk Roslit Volcano.' },
  ],
  snowcap: [
    { name: 'Icicle Fragment', rarity: 'Trash', minKg: 0.8, maxKg: 2.5, val: 8, color: '#A3D5EB', accent: '#FFFFFF', desc: 'Pecahan es bening dari tepi tebing gletser.' },
    { name: 'Frozen Boot', rarity: 'Trash', minKg: 1.2, maxKg: 2.8, val: 7, color: '#647C8C', accent: '#CBE5F0', desc: 'Sepatu kulit beku milik penjelajah kutub.' },
    { name: 'Arctic Char', rarity: 'Common', minKg: 1.4, maxKg: 5.5, val: 74, bait: 'insect', color: '#59849E', accent: '#E87E6B', desc: 'Ikan salmon kutub berperut oranye lembut.' },
    { name: 'Pollock', rarity: 'Common', minKg: 1.8, maxKg: 7.2, val: 68, bait: 'worm', color: '#708C8E', accent: '#D0E0E2', desc: 'Ikan dingin perairan Snowcap yang mudah ditangkap.' },
    { name: 'Frost Herring', rarity: 'Common', minKg: 0.3, maxKg: 1.2, val: 78, bait: 'flakes', color: '#99C7DE', accent: '#F2FAFF', desc: 'Ikan kecil keperakan berkilau seperti keping salju.' },
    { name: 'Ice Cod', rarity: 'Common', minKg: 2.5, maxKg: 9.5, val: 66, bait: 'minnow', color: '#6E8EA3', accent: '#DDEAF2', desc: 'Ikan kod air beku berlemak tebal.' },
    { name: 'Glacier Grayling', rarity: 'Uncommon', minKg: 0.9, maxKg: 3.4, val: 108, bait: 'insect', color: '#6B99B8', accent: '#B8DDF2', desc: 'Ikan bersirip punggung bak layar es transparan.' },
    { name: 'Bluegill', rarity: 'Uncommon', minKg: 0.7, maxKg: 2.5, val: 102, bait: 'worm', color: '#4B779E', accent: '#E69F4E', desc: 'Ikan tahan dingin dengan bercak insang biru gelap.' },
    { name: 'Snow Crab', rarity: 'Uncommon', minKg: 1.6, maxKg: 5.8, val: 118, bait: 'shrimp', color: '#C4685E', accent: '#F5E6E4', desc: 'Kepiting berkaki panjang dari dasar gua es.' },
    { name: 'Lingcod', rarity: 'Uncommon', minKg: 5.5, maxKg: 21.0, val: 76, bait: 'minnow', color: '#5E7880', accent: '#C2D4D9', desc: 'Predator dasar berbatu es yang tangguh.' },
    { name: 'Rime Smelt', rarity: 'Uncommon', minKg: 0.4, maxKg: 1.5, val: 115, bait: 'flakes', color: '#A5D4E8', accent: '#FFFFFF', desc: 'Ikan mungil beraroma dingin segar khas salju.' },
    { name: 'Crystal Pike', rarity: 'Unusual', minKg: 4.5, maxKg: 15.0, val: 145, bait: 'minnow', color: '#71B4D4', accent: '#EBF8FF', desc: 'Ikan tombak bening yang membiaskan cahaya es.' },
    { name: 'Burbot', rarity: 'Unusual', minKg: 3.2, maxKg: 11.5, val: 138, time: 'Night', bait: 'maggot', color: '#5E6B6E', accent: '#BFCFD1', desc: 'Satu-satunya ikan kod air tawar-es aktif malam.' },
    { name: 'Aurora Tetra', rarity: 'Unusual', minKg: 0.5, maxKg: 1.9, val: 175, time: 'Night', bait: 'night_shrimp', color: '#4ECDC4', accent: '#A8F5D2', desc: 'Ikan bersinar hijau-toska di balik lapisan es.' },
    { name: 'Frostbite Eel', rarity: 'Unusual', minKg: 3.8, maxKg: 12.5, val: 148, bait: 'squid', color: '#4F7799', accent: '#BEE6FC', desc: 'Belut es licin dengan gerak tiba-tiba.' },
    { name: 'Glacier Squid', rarity: 'Rare', minKg: 6.5, maxKg: 22.0, val: 185, time: 'Night', bait: 'minnow', color: '#88C0D0', accent: '#ECEFF4', desc: 'Cumi-cumi biru pucat penjelajah celah gletser.' },
    { name: 'Arctic Sturgeon', rarity: 'Rare', minKg: 22.0, maxKg: 78.0, val: 120, bait: 'squid', color: '#5A768C', accent: '#D8E8F2', desc: 'Ikan lapis es purba dengan tarikan berat.' },
    { name: 'Icefin Tuna', rarity: 'Rare', minKg: 32.0, maxKg: 115.0, val: 115, bait: 'fish_head', color: '#3B6E8C', accent: '#B3E5FC', desc: 'Tuna kecepatan tinggi di arus dingin utara.' },
    { name: 'Boreal Angler', rarity: 'Rare', minKg: 4.2, maxKg: 14.0, val: 245, time: 'Night', bait: 'night_shrimp', color: '#4C5E73', accent: '#9BF6FF', desc: 'Pemancing laut dingin dengan lentera es biru.' },
    { name: 'Snowcap Puffer', rarity: 'Rare', minKg: 2.0, maxKg: 6.8, val: 260, bait: 'shrimp', color: '#B4D6E8', accent: '#FFFFFF', desc: 'Ikan buntal putih salju favorit kolektor Snowcap.' },
    { name: 'Colossal Squid', rarity: 'Legendary', minKg: 85.0, maxKg: 260.0, val: 195, time: 'Night', weather: 'Foggy', bait: 'squid', color: '#8C3B4A', accent: '#F2C1C9', desc: 'Cumi kolosal palung es, butuh kontrol tinggi.' },
    { name: 'Frost Whale', rarity: 'Legendary', minKg: 260.0, maxKg: 780.0, val: 118, season: 'Winter', bait: 'fish_head', color: '#5A89AD', accent: '#EDF6FC', desc: 'Paus muda bermahkota es yang sangat megah.' },
    { name: 'Permafrost Snapper', rarity: 'Legendary', minKg: 18.0, maxKg: 54.0, val: 340, bait: 'weird_algae', color: '#61A4C7', accent: '#FFF3B0', desc: 'Kakap purba yang terawetkan sempurna di air beku.' },
    { name: 'Glacial Manta', rarity: 'Legendary', minKg: 75.0, maxKg: 220.0, val: 210, weather: 'Storm', bait: 'coral', color: '#477FA3', accent: '#D6F3FF', desc: 'Manta biru pucat meluncur indah di bawah salju.' },
    { name: 'Iceberg Leviathan', rarity: 'Mythical', minKg: 180.0, maxKg: 490.0, val: 380, time: 'Night', bait: 'truffle_worm', color: '#4682A9', accent: '#E6FAFF', desc: 'Makhluk raksasa dari balik gletser yang menguji kelincahan Reel.' },
    { name: 'Frozen Sunfish', rarity: 'Mythical', minKg: 120.0, maxKg: 330.0, val: 420, weather: 'Aurora', bait: 'truffle_worm', color: '#7FB7D9', accent: '#B8F2E6', desc: 'Mola-mola raksasa berbalut kristal es bersinar.' },
    { name: 'Crystallized Narwhal', rarity: 'Mythical', minKg: 95.0, maxKg: 240.0, val: 490, time: 'Night', bait: 'night_shrimp', color: '#84B8D9', accent: '#FFF8DB', desc: 'Paus bertanduk kristal berkilau memantulkan aurora.' },
    { name: 'Nessie', rarity: 'Exotic', minKg: 210.0, maxKg: 580.0, val: 1180, weather: 'Aurora', bait: 'truffle_worm', color: '#2F6F7E', accent: '#A8F5E3', desc: 'Monster danau purba legendaris di perairan es tersembunyi.' },
  ],
  sunstone: [
    { name: 'Cracked Sunstone', rarity: 'Trash', minKg: 1.2, maxKg: 4.0, val: 12, color: '#B89B5E', accent: '#F2DF9F', desc: 'Pecahan batu matahari yang sudah kehilangan kilaunya.' },
    { name: 'Tangled Kelp', rarity: 'Trash', minKg: 0.7, maxKg: 2.2, val: 9, color: '#587846', accent: '#8EAD79', desc: 'Gulungan rumput laut tebal berbelit.' },
    { name: 'Goldfish', rarity: 'Common', minKg: 0.3, maxKg: 1.1, val: 95, bait: 'flakes', color: '#EB8C34', accent: '#FFE082', desc: 'Ikan mas cerah berkilau di laguna hangat Sunstone.' },
    { name: 'Amberjack', rarity: 'Common', minKg: 4.0, maxKg: 14.0, val: 65, bait: 'minnow', color: '#7D8E8C', accent: '#E0B963', desc: 'Ikan tangguh bertenaga sprint kencang.' },
    { name: 'Sweetfish', rarity: 'Common', minKg: 0.5, maxKg: 1.9, val: 88, bait: 'insect', color: '#8CA87A', accent: '#F0E699', desc: 'Ikan mungil berwarna zaitun keemasan.' },
    { name: 'Sunlit Wrasses', rarity: 'Common', minKg: 1.0, maxKg: 3.6, val: 86, time: 'Day', bait: 'shrimp', color: '#399E9A', accent: '#F2C14E', desc: 'Ikan wrasse berwarna cerah penunggu karang atas.' },
    { name: 'Sunburst Dory', rarity: 'Uncommon', minKg: 1.2, maxKg: 4.4, val: 132, time: 'Day', bait: 'coral', color: '#D4A838', accent: '#FFF4A3', desc: 'Ikan pipih memantulkan cahaya siang bak cermin.' },
    { name: 'Trumpet Snapper', rarity: 'Uncommon', minKg: 2.8, maxKg: 9.8, val: 114, bait: 'shrimp', color: '#C96E4B', accent: '#FAD0A5', desc: 'Kakap bergradasi jingga terbenam.' },
    { name: 'Golden Trevally', rarity: 'Uncommon', minKg: 4.5, maxKg: 16.0, val: 105, bait: 'minnow', color: '#D6B647', accent: '#3B4A54', desc: 'Ikan kuwe kuning bergaris gelap sangat lincah.' },
    { name: 'Arcane Loach', rarity: 'Uncommon', minKg: 0.9, maxKg: 3.2, val: 140, bait: 'worm', color: '#5A7EB5', accent: '#D6B8FF', desc: 'Ikan kecil terpengaruh energi sihir menara Merlin.' },
    { name: 'Radiant Goby', rarity: 'Uncommon', minKg: 0.6, maxKg: 2.0, val: 138, bait: 'insect', color: '#E08A48', accent: '#FFF2B2', desc: 'Goby mungil bercorak matahari terbit.' },
    { name: 'Crowned Bream', rarity: 'Unusual', minKg: 2.4, maxKg: 8.0, val: 165, bait: 'bagel', color: '#B59B5C', accent: '#FFF3B0', desc: 'Bream bermahkota jambul emas di kepalanya.' },
    { name: 'Sailfish', rarity: 'Unusual', minKg: 22.0, maxKg: 75.0, val: 120, time: 'Day', bait: 'minnow', color: '#36689E', accent: '#82C0E8', desc: 'Ikan layar tercepat di samudra dengan sirip megah.' },
    { name: 'Merlin Carp', rarity: 'Unusual', minKg: 5.0, maxKg: 17.0, val: 162, bait: 'weird_algae', color: '#5D4C9E', accent: '#F2D06B', desc: 'Karper ungu berbintik bintang di dekat gua Merlin.' },
    { name: 'Sunspot Ray', rarity: 'Unusual', minKg: 9.0, maxKg: 29.0, val: 152, bait: 'shrimp', color: '#C49A45', accent: '#FCE89D', desc: 'Ikan pari bertotol kuning cerah bagai sinar mentari.' },
    { name: 'Sunfish', rarity: 'Rare', minKg: 85.0, maxKg: 290.0, val: 125, time: 'Day', bait: 'squid', color: '#7D95A6', accent: '#F5DF99', desc: 'Mola-mola raksasa berjemur di permukaan Sunstone.' },
    { name: 'Tartaruga', rarity: 'Rare', minKg: 28.0, maxKg: 88.0, val: 170, bait: 'coral', color: '#4E825E', accent: '#D6B86E', desc: 'Penyu berlapis emas kuno yang tenang namun kuat.' },
    { name: 'Golden Seahorse', rarity: 'Rare', minKg: 0.8, maxKg: 2.8, val: 480, bait: 'shrimp', color: '#E6B83A', accent: '#FFF7C2', desc: 'Kuda laut emas kecil berharga fantastis.' },
    { name: 'Amber Barracuda', rarity: 'Rare', minKg: 8.5, maxKg: 28.0, val: 190, bait: 'fish_head', color: '#B87E35', accent: '#FFE699', desc: 'Barracuda berwarna madu pekat dengan sambaran tajam.' },
    { name: 'Solar Eel', rarity: 'Rare', minKg: 4.5, maxKg: 14.0, val: 245, time: 'Day', bait: 'night_shrimp', color: '#D97B29', accent: '#FFF176', desc: 'Belut terang yang menyukai puncak terik matahari.' },
    { name: 'Helios Marlin', rarity: 'Legendary', minKg: 65.0, maxKg: 195.0, val: 285, time: 'Day', weather: 'Clear', bait: 'fish_head', color: '#3B649E', accent: '#F7C948', desc: 'Marlin keemasan legendaris penarik kapal.' },
    { name: 'Astral Angler', rarity: 'Legendary', minKg: 11.0, maxKg: 34.0, val: 440, time: 'Night', bait: 'night_shrimp', color: '#453C80', accent: '#A8F5FF', desc: 'Pemancing bintang dengan lentera penuh konstelasi.' },
    { name: 'Gilded Lionfish', rarity: 'Legendary', minKg: 3.5, maxKg: 11.0, val: 540, bait: 'weird_algae', color: '#C9962E', accent: '#FFFFFF', desc: 'Ikan singa berlapis emas murni yang diburu kolektor.' },
    { name: 'Celestial Triggerfish', rarity: 'Legendary', minKg: 4.2, maxKg: 13.0, val: 520, bait: 'coral', color: '#4D7AC9', accent: '#FFE680', desc: 'Triggerfish biru safir yang hanya muncul di arus atas.' },
    { name: 'Ancient Sun Dragon', rarity: 'Mythical', minKg: 80.0, maxKg: 220.0, val: 480, time: 'Day', bait: 'truffle_worm', color: '#E09F3E', accent: '#FFF8C4', desc: 'Naga laut matahari yang muncul dengan kilau menyilaukan.' },
    { name: 'Grand Reef Guardian', rarity: 'Mythical', minKg: 110.0, maxKg: 310.0, val: 410, weather: 'Clear', bait: 'truffle_worm', color: '#2F8F9D', accent: '#F7D060', desc: 'Penjaga abadi perairan sekitar menara Merlin.' },
    { name: 'Radiant Manta', rarity: 'Mythical', minKg: 90.0, maxKg: 250.0, val: 450, weather: 'Aurora', bait: 'weird_algae', color: '#589ED6', accent: '#FBE88D', desc: 'Pari manta bercahaya keemasan saat langit berpendar.' },
    { name: 'Spectral Serpent', rarity: 'Exotic', minKg: 130.0, maxKg: 360.0, val: 1280, weather: 'Aurora', bait: 'truffle_worm', color: '#7F5AF0', accent: '#FFE66D', desc: 'Ular laut spektral penjelajah dimensi cahaya Sunstone.' },
  ],
  sovereignty: [
    { name: 'Stone Tablet', rarity: 'Trash', minKg: 3.5, maxKg: 9.0, val: 14, color: '#6E757A', accent: '#A5B0B8', desc: 'Pecahan prasasti batu tua dari kaki patung raksasa.' },
    { name: 'Iron Chain', rarity: 'Trash', minKg: 2.5, maxKg: 8.0, val: 12, color: '#4F565C', accent: '#8E979E', desc: 'Rantai jangkar besi karatan dari pelabuhan kuno.' },
    { name: 'Sovereign Dace', rarity: 'Common', minKg: 0.7, maxKg: 2.5, val: 98, bait: 'worm', color: '#788996', accent: '#D8E2E8', desc: 'Ikan ramping abu-perak di sekitar tangga Keeper’s Altar.' },
    { name: 'Marble Goby', rarity: 'Common', minKg: 1.5, maxKg: 5.5, val: 92, bait: 'insect', color: '#8A867C', accent: '#E0DCD1', desc: 'Goby bercorak marmer putih dan kelabu.' },
    { name: 'Monolith Bass', rarity: 'Common', minKg: 2.4, maxKg: 8.5, val: 90, bait: 'minnow', color: '#4F6E6E', accent: '#B6CFCB', desc: 'Bass kuat yang bersembunyi di balik pilar batu bawah air.' },
    { name: 'Altar Sardine', rarity: 'Common', minKg: 0.4, maxKg: 1.4, val: 96, bait: 'flakes', color: '#9EB5C4', accent: '#FFFFFF', desc: 'Sarden biru tua pengawal perairan monumen.' },
    { name: 'Slate Halibut', rarity: 'Uncommon', minKg: 7.0, maxKg: 24.0, val: 96, bait: 'squid', color: '#586773', accent: '#AEBEC9', desc: 'Halibut batu besar di dasar berpasir gelap.' },
    { name: 'Relic Snapper', rarity: 'Uncommon', minKg: 3.2, maxKg: 11.0, val: 126, bait: 'shrimp', color: '#467D8C', accent: '#D8C089', desc: 'Kakap bersisik ukiran geometris menyerupai simbol kuno.' },
    { name: 'Cryptic Eel', rarity: 'Uncommon', minKg: 2.5, maxKg: 9.0, val: 138, time: 'Night', bait: 'maggot', color: '#3E4C5E', accent: '#9AD4D6', desc: 'Belut gelap yang muncul saat energi Keeper’s Altar bangkit.' },
    { name: 'Silver Trout', rarity: 'Uncommon', minKg: 1.8, maxKg: 6.2, val: 134, bait: 'insect', color: '#A3B6C4', accent: '#F2F7FA', desc: 'Trout perak mengkilap di arus tenang teluk patung.' },
    { name: 'Keeper Minnow', rarity: 'Uncommon', minKg: 0.5, maxKg: 1.8, val: 145, bait: 'flakes', color: '#548C9C', accent: '#B8F2E6', desc: 'Ikan mungil berwarna cyan tipis seperti nyala altar.' },
    { name: 'Coelacanth', rarity: 'Unusual', minKg: 24.0, maxKg: 78.0, val: 135, time: 'Night', bait: 'squid', color: '#3C5973', accent: '#9FC5E8', desc: 'Fosil hidup purba yang bersembunyi di gua bawah patung.' },
    { name: 'Knight Fish', rarity: 'Unusual', minKg: 3.5, maxKg: 11.5, val: 175, bait: 'shrimp', color: '#7D8B99', accent: '#E6D399', desc: 'Ikan berlapis sisik keras menyerupai zirah ksatria.' },
    { name: 'Rune Tetra', rarity: 'Unusual', minKg: 0.6, maxKg: 2.1, val: 195, time: 'Night', bait: 'night_shrimp', color: '#5E68B8', accent: '#A8F5FF', desc: 'Ikan kecil bersimbol rune berkilau saat malam tiba.' },
    { name: 'Gargoyle Chimaera', rarity: 'Unusual', minKg: 6.5, maxKg: 21.0, val: 165, weather: 'Foggy', bait: 'minnow', color: '#5C646B', accent: '#C4CFD9', desc: 'Ikan bersirip sayap batu di perairan dalam monumen.' },
    { name: 'Sovereign Shark', rarity: 'Rare', minKg: 48.0, maxKg: 155.0, val: 155, bait: 'fish_head', color: '#45596B', accent: '#D8E3EC', desc: 'Hiu bermoncong kokoh pengawal perbatasan Statue.' },
    { name: 'Royal Sturgeon', rarity: 'Rare', minKg: 35.0, maxKg: 105.0, val: 175, bait: 'truffle_worm', color: '#526B7A', accent: '#F4D06F', desc: 'Sturgeon agung dengan garis punggung keemasan.' },
    { name: 'Altar Jelly', rarity: 'Rare', minKg: 2.4, maxKg: 7.5, val: 295, time: 'Night', bait: 'night_shrimp', color: '#52B69A', accent: '#D9ED92', desc: 'Ubur-ubur penjaga yang berdenyut serasi dengan altar sihir.' },
    { name: 'Chrono Ray', rarity: 'Rare', minKg: 18.0, maxKg: 58.0, val: 210, bait: 'coral', color: '#4E6B8A', accent: '#8CE0D6', desc: 'Pari tua berpola pusaran waktu di punggungnya.' },
    { name: 'Relic Angler', rarity: 'Rare', minKg: 5.5, maxKg: 16.5, val: 265, time: 'Night', bait: 'weird_algae', color: '#3A4A5E', accent: '#FFD166', desc: 'Ikan lentera penjaga ruang bawah tanah Altar.' },
    { name: 'Dunkleosteus', rarity: 'Legendary', minKg: 120.0, maxKg: 340.0, val: 235, bait: 'fish_head', color: '#5C544B', accent: '#D8C7B4', desc: 'Monster purba berperisai kepala batu yang sangat kuat!' },
    { name: 'Sawfish', rarity: 'Legendary', minKg: 75.0, maxKg: 220.0, val: 265, bait: 'squid', color: '#6E7F8A', accent: '#E2ECEF', desc: 'Ikan gergaji raksasa dengan ayunan senar agresif.' },
    { name: 'Eternal Koi', rarity: 'Legendary', minKg: 8.5, maxKg: 24.0, val: 520, time: 'Night', bait: 'weird_algae', color: '#457B9D', accent: '#F4E285', desc: 'Koi suci bertanda emas altar di dahinya.' },
    { name: 'Sovereign Leviathan', rarity: 'Legendary', minKg: 95.0, maxKg: 280.0, val: 270, weather: 'Storm', bait: 'truffle_worm', color: '#2F465C', accent: '#82D4CC', desc: 'Penjaga badai yang menggetarkan tiang monumen.' },
    { name: 'Crownbound Kraken', rarity: 'Mythical', minKg: 165.0, maxKg: 430.0, val: 410, time: 'Night', bait: 'truffle_worm', color: '#323E59', accent: '#A8F5E3', desc: 'Kraken kuno penjaga relik Keeper’s Altar.' },
    { name: 'Enchanted Phantom', rarity: 'Mythical', minKg: 28.0, maxKg: 78.0, val: 640, time: 'Night', bait: 'night_shrimp', color: '#6952B8', accent: '#B8F2E6', desc: 'Ikan bayangan transparan pembawa energi sihir murni.' },
    { name: 'Astral Coelacanth', rarity: 'Mythical', minKg: 55.0, maxKg: 145.0, val: 580, weather: 'Aurora', bait: 'weird_algae', color: '#395580', accent: '#FFF1A8', desc: 'Fosil hidup bercahaya bintang di langit aurora.' },
    { name: 'Sovereign Megalodon', rarity: 'Exotic', minKg: 380.0, maxKg: 920.0, val: 1120, time: 'Night', bait: 'truffle_worm', color: '#2D3A4A', accent: '#FF8E7A', desc: 'Megalodon raksasa bertubuh penuh bekas pertarungan kuno.' },
  ],
  desolate_deep: [
    { name: 'Abyssal Scrap', rarity: 'Trash', minKg: 2.0, maxKg: 6.0, val: 18, color: '#2E3A42', accent: '#627380', desc: 'Puing logam kapal selam kuno di palung laut dalam.' },
    { name: 'Deep Bone', rarity: 'Trash', minKg: 3.5, maxKg: 9.0, val: 20, color: '#8C8A7F', accent: '#C9C6B8', desc: 'Tulang belulang leviathan raksasa yang terdampar.' },
    { name: 'Blind Minnow', rarity: 'Common', minKg: 0.4, maxKg: 1.4, val: 130, bait: 'maggot', color: '#8E9AA3', accent: '#CBD6DE', desc: 'Ikan palung tanpa mata yang mengandalkan getaran air.' },
    { name: 'Twilight Goby', rarity: 'Common', minKg: 0.8, maxKg: 2.8, val: 124, bait: 'worm', color: '#46546E', accent: '#8CC0DE', desc: 'Ikan dasar gelap dengan titik bercahaya di ekornya.' },
    { name: 'Phantom Sardine', rarity: 'Common', minKg: 0.5, maxKg: 1.7, val: 128, bait: 'flakes', color: '#587A96', accent: '#BEE6FC', desc: 'Sarden tembus pandang penghuni batas cahaya.' },
    { name: 'Trench Snipe', rarity: 'Common', minKg: 1.6, maxKg: 5.5, val: 120, bait: 'minnow', color: '#415566', accent: '#9FC5E8', desc: 'Ikan ramping bermulut panjang pencari mangsa kecil.' },
    { name: 'Viperfish', rarity: 'Uncommon', minKg: 2.0, maxKg: 7.0, val: 175, bait: 'minnow', color: '#2E3C4F', accent: '#8CE0D6', desc: 'Ikan bertaring jarum panjang dari kegelapan abisal.' },
    { name: 'Lanternfish', rarity: 'Uncommon', minKg: 0.7, maxKg: 2.4, val: 185, bait: 'night_shrimp', color: '#39557A', accent: '#FFF1A8', desc: 'Ikan pemancar cahaya fotofor indah di sisi tubuhnya.' },
    { name: 'Fangtooth', rarity: 'Uncommon', minKg: 1.5, maxKg: 5.2, val: 180, bait: 'shrimp', color: '#3D313B', accent: '#E8A598', desc: 'Ikan kecil bergigi terbesar dibanding ukuran kepalanya.' },
    { name: 'Goblin Shark', rarity: 'Uncommon', minKg: 24.0, maxKg: 78.0, val: 118, bait: 'fish_head', color: '#B07B82', accent: '#E8C5CA', desc: 'Hiu rahang maju dengan moncong datar panjang.' },
    { name: 'Frilled Shark', rarity: 'Uncommon', minKg: 18.0, maxKg: 58.0, val: 132, bait: 'squid', color: '#4B444A', accent: '#9C8F99', desc: 'Fosil hidup mirip belut hiu dari palung terdalam.' },
    { name: 'Gulper Eel', rarity: 'Unusual', minKg: 6.5, maxKg: 22.0, val: 210, bait: 'squid', color: '#272C38', accent: '#FF85A1', desc: 'Belut pelikan dengan rahang melebar bak kantung besar.' },
    { name: 'Barbed Angler', rarity: 'Unusual', minKg: 5.0, maxKg: 17.0, val: 225, bait: 'night_shrimp', color: '#383245', accent: '#7CE8D8', desc: 'Anglerfish berduri dengan antena cahaya dingin.' },
    { name: 'Midnight Ray', rarity: 'Unusual', minKg: 16.0, maxKg: 48.0, val: 195, bait: 'coral', color: '#232F3E', accent: '#62A8E8', desc: 'Pari hitam legam dengan tepi sayap biru neon.' },
    { name: 'Oarfish Prime', rarity: 'Unusual', minKg: 45.0, maxKg: 145.0, val: 165, bait: 'squid', color: '#6E859E', accent: '#FF6B6B', desc: 'Varian laut dalam ikan pita dengan sirip berkilau.' },
    { name: 'Sea Mine', rarity: 'Rare', minKg: 35.0, maxKg: 85.0, val: 195, bait: 'magnet', color: '#454C54', accent: '#D98270', desc: 'Ranjau laut tua nonaktif yang bernilai logam tinggi.' },
    { name: 'Emperor Nautilus', rarity: 'Rare', minKg: 8.0, maxKg: 26.0, val: 295, bait: 'shrimp', color: '#B87D52', accent: '#F5E6CA', desc: 'Nautilus raksasa bercangkang spiral mutiara.' },
    { name: 'Crystal Jelly', rarity: 'Rare', minKg: 3.0, maxKg: 9.5, val: 360, bait: 'night_shrimp', color: '#6AD4E8', accent: '#FFFFFF', desc: 'Ubur-ubur kristal bening dengan tentakel bercahaya.' },
    { name: 'Void Barracuda', rarity: 'Rare', minKg: 15.0, maxKg: 46.0, val: 245, bait: 'fish_head', color: '#2B2F42', accent: '#A8F5E3', desc: 'Barracuda hitam palung dengan gerakan ekstrem.' },
    { name: 'Abyssal Coelacanth', rarity: 'Rare', minKg: 38.0, maxKg: 112.0, val: 215, bait: 'weird_algae', color: '#2E4766', accent: '#9BF6FF', desc: 'Penghuni palung tertua yang jarang sekali naik.' },
    { name: 'Phantom Megalodon', rarity: 'Legendary', minKg: 240.0, maxKg: 690.0, val: 310, time: 'Night', bait: 'fish_head', color: '#47597E', accent: '#A8F5FF', desc: 'Roh megalodon raksasa yang menghantui Mariana’s Veil.' },
    { name: 'Giant Squid', rarity: 'Legendary', minKg: 130.0, maxKg: 360.0, val: 280, bait: 'squid', color: '#8A2E3B', accent: '#F7C6CC', desc: 'Penguasa tentakel palung gelap berdaya tarik buas.' },
    { name: 'Abyssal Dragonfish', rarity: 'Legendary', minKg: 14.0, maxKg: 42.0, val: 580, bait: 'night_shrimp', color: '#1F2433', accent: '#FF5C8A', desc: 'Naga palung bertaring bercahaya merah delima.' },
    { name: 'Depths Chimaera', rarity: 'Legendary', minKg: 28.0, maxKg: 82.0, val: 420, bait: 'weird_algae', color: '#394D6E', accent: '#B8F2E6', desc: 'Hiu hantu berparas unik penunggu batas abisal.' },
    { name: 'Ancient Depth Serpent', rarity: 'Mythical', minKg: 185.0, maxKg: 480.0, val: 560, bait: 'truffle_worm', color: '#1E3F4D', accent: '#62F5D8', desc: 'Ular raksasa palung terdalam, ujian utama pengendalian Reel.' },
    { name: 'The Kraken', rarity: 'Mythical', minKg: 320.0, maxKg: 840.0, val: 490, weather: 'Storm', bait: 'truffle_worm', color: '#281E38', accent: '#FF708D', desc: 'Monster tentakel legendaris yang mengguncang laut dalam.' },
    { name: 'Spectral Leviathan', rarity: 'Mythical', minKg: 210.0, maxKg: 540.0, val: 620, weather: 'Aurora', bait: 'truffle_worm', color: '#394378', accent: '#9BF6FF', desc: 'Leviathan bercahaya spektral paling dicari di Desolate Deep.' },
    { name: 'Scylla', rarity: 'Exotic', minKg: 420.0, maxKg: 1150.0, val: 1450, time: 'Night', bait: 'truffle_worm', color: '#5E1B3B', accent: '#7CE8FF', desc: 'Puncak rantai samudra Fisch: naga hydra laut dalam berharga tak ternilai!' },
  ],
  forsaken_shores: [
    { name: 'Shattered Plank', rarity: 'Trash', minKg: 2.0, maxKg: 6.5, val: 11, color: '#6E4C36', accent: '#A67B5B', desc: 'Papan kapal bajak laut tua yang penuh teritip.' },
    { name: 'Corsair Herring', rarity: 'Common', minKg: 0.4, maxKg: 1.5, val: 72, bait: 'flakes', color: '#89A3B2', accent: '#E8EEF2', desc: 'Ikan haring perak berenang di sela bangkai kapal karam.' },
    { name: 'Buccaneer Bass', rarity: 'Common', minKg: 2.0, maxKg: 7.5, val: 68, bait: 'worm', color: '#527358', accent: '#D6BE7A', desc: 'Bass laut tangguh yang menghuni perairan berkarang tengkorak.' },
    { name: 'Cutlass Gar', rarity: 'Uncommon', minKg: 4.5, maxKg: 16.0, val: 94, bait: 'minnow', color: '#6B8596', accent: '#E5E7EB', desc: 'Ikan berhidung tajam bagai pedang bajak laut.' },
    { name: 'Shipwreck Eel', rarity: 'Uncommon', minKg: 3.2, maxKg: 11.5, val: 108, time: 'Night', bait: 'maggot', color: '#3E4A44', accent: '#D98270', desc: 'Belut gelap penghuni lambung kapal kayu karam.' },
    { name: 'Galleon Snapper', rarity: 'Unusual', minKg: 3.8, maxKg: 14.0, val: 138, bait: 'shrimp', color: '#B84A39', accent: '#F6C453', desc: 'Kakap merah berbintik koin emas dari harta karam.' },
    { name: 'Cannonball Puffer', rarity: 'Unusual', minKg: 2.5, maxKg: 8.5, val: 145, bait: 'shrimp', color: '#474F57', accent: '#F4A261', desc: 'Ikan buntal hitam bundar sekeras peluru meriam.' },
    { name: 'Reef Cutlassfish', rarity: 'Rare', minKg: 6.0, maxKg: 21.0, val: 210, bait: 'minnow', color: '#A5B4C2', accent: '#F7F6F1', desc: 'Ikan pita mengilap seperti bilah perak membelah ombak.' },
    { name: 'Blackbeard Shark', rarity: 'Rare', minKg: 42.0, maxKg: 135.0, val: 165, time: 'Night', bait: 'fish_head', color: '#28303B', accent: '#EAB308', desc: 'Hiu agresif berbercak sirip hitam khas Forsaken Shores.' },
    { name: 'Captain Goldfish', rarity: 'Legendary', minKg: 2.2, maxKg: 7.0, val: 780, time: 'Day', bait: 'weird_algae', color: '#F59E0B', accent: '#FEF08A', desc: 'Ikan mas legendaris bertanduk emas yang diburu para kapten kapal.' },
    { name: 'Cursed Pirate Ray', rarity: 'Mythical', minKg: 78.0, maxKg: 210.0, val: 380, weather: 'Storm', bait: 'truffle_worm', color: '#3B2848', accent: '#34D399', desc: 'Pari bayangan berpola peta bintang yang muncul saat badai.' },
    { name: 'Kraken Crown', rarity: 'Exotic', minKg: 160.0, maxKg: 440.0, val: 1250, weather: 'Aurora', bait: 'truffle_worm', color: '#7B3FE4', accent: '#FBBF24', desc: 'Relik hidup penguasa Forsaken Shores bertatahkan kilau emas.' },
  ],
  ancient_isle: [
    { name: 'Fossil Shell', rarity: 'Trash', minKg: 1.8, maxKg: 5.5, val: 15, color: '#8A7E6A', accent: '#D6CCB8', desc: 'Cangkang amonit tua terbawa ombak kawah purba.' },
    { name: 'Xiphactinus Fry', rarity: 'Common', minKg: 1.5, maxKg: 5.5, val: 95, bait: 'minnow', color: '#4B7888', accent: '#C8E2EA', desc: 'Ikan purba cepat bergigi kecil di pinggir atol meteor.' },
    { name: 'Trilobite', rarity: 'Common', minKg: 0.8, maxKg: 3.0, val: 112, bait: 'worm', color: '#7D6A52', accent: '#C9B294', desc: 'Arthropoda prasejarah bersegmen yang hidup di pasir kuno.' },
    { name: 'Birgeria', rarity: 'Uncommon', minKg: 5.0, maxKg: 18.0, val: 135, bait: 'squid', color: '#3F6E6E', accent: '#A6D8D4', desc: 'Predator Trias gesit bersirip ekor simetris.' },
    { name: 'Anomalocaris', rarity: 'Uncommon', minKg: 2.2, maxKg: 7.8, val: 165, bait: 'shrimp', color: '#B35C44', accent: '#F2C185', desc: 'Pemburu Kambrium dengan sirip beruas di sisi tubuhnya.' },
    { name: 'Helicoprion', rarity: 'Unusual', minKg: 38.0, maxKg: 120.0, val: 148, bait: 'fish_head', color: '#4A5D6E', accent: '#D9E4EC', desc: 'Hiu purba berrahang gergaji melingkar yang sangat ikonik.' },
    { name: 'Dunkleosteus Elder', rarity: 'Rare', minKg: 110.0, maxKg: 320.0, val: 215, bait: 'fish_head', color: '#5E5042', accent: '#E2C9A5', desc: 'Ikan lapis baja raksasa penjaga karang meteor Ancient Isle.' },
    { name: 'Leedsichthys', rarity: 'Rare', minKg: 240.0, maxKg: 680.0, val: 185, bait: 'coral', color: '#3D627A', accent: '#BDE0EE', desc: 'Salah satu ikan bertulang sejati terbesar sepanjang masa.' },
    { name: 'Plesiosaur', rarity: 'Legendary', minKg: 195.0, maxKg: 520.0, val: 340, time: 'Day', bait: 'squid', color: '#2F6F7E', accent: '#9BF6FF', desc: 'Reptil laut berleher panjang yang melesat keluar dari arus dalam.' },
    { name: 'Mosasaurus', rarity: 'Mythical', minKg: 340.0, maxKg: 890.0, val: 540, time: 'Day', weather: 'Clear', bait: 'truffle_worm', color: '#244A54', accent: '#F6C453', desc: 'Penguasa puncak samudra Kapur dengan kekuatan tarik dahsyat.' },
    { name: 'Meteor Leviathan', rarity: 'Mythical', minKg: 280.0, maxKg: 740.0, val: 620, weather: 'Aurora', bait: 'truffle_worm', color: '#39527A', accent: '#56F0B5', desc: 'Leviathan bercahaya batu meteor kuno.' },
    { name: 'Ancient Megalodon', rarity: 'Exotic', minKg: 520.0, maxKg: 1380.0, val: 1420, weather: 'Aurora', bait: 'truffle_worm', color: '#293545', accent: '#FF8E7A', desc: 'Raja predator prasejarah yang hanya ditemui pelaut ke Ancient Isle.' },
  ],
  the_depths: [
    { name: 'Crystal Shard', rarity: 'Trash', minKg: 1.5, maxKg: 4.5, val: 22, color: '#4B6B88', accent: '#A8F5FF', desc: 'Pecahan kristal laut dalam yang masih berpendar redup.' },
    { name: 'Crystal Carp', rarity: 'Common', minKg: 1.8, maxKg: 6.0, val: 142, bait: 'bagel', color: '#589EB5', accent: '#E0FBFC', desc: 'Ikan karper transparan penghuni atol kristal.' },
    { name: 'Luminescent Minnow', rarity: 'Common', minKg: 0.4, maxKg: 1.4, val: 155, bait: 'flakes', color: '#36B5A8', accent: '#A8F5E3', desc: 'Ikan kecil bercahaya biru-toska terang di air gelap.' },
    { name: 'Deep Nautilus', rarity: 'Uncommon', minKg: 3.5, maxKg: 12.0, val: 210, bait: 'shrimp', color: '#7D6E9E', accent: '#F2E6FF', desc: 'Moluska purba bercangkang kristal ungu lembut.' },
    { name: 'Nether Eel', rarity: 'Uncommon', minKg: 4.8, maxKg: 16.5, val: 198, time: 'Night', bait: 'maggot', color: '#312E59', accent: '#C084FC', desc: 'Belut cepat bercahaya lembayung di sekitar palung kristal.' },
    { name: 'Abyssal Flounder', rarity: 'Unusual', minKg: 4.0, maxKg: 14.0, val: 235, bait: 'worm', color: '#3D5570', accent: '#7CE8FF', desc: 'Ikan dasar gelap bermata bercahaya neon.' },
    { name: 'Mutated Shark', rarity: 'Rare', minKg: 65.0, maxKg: 190.0, val: 270, bait: 'fish_head', color: '#36415E', accent: '#56F0B5', desc: 'Hiu atol yang terinfusi energi kristal kedalaman.' },
    { name: 'Depths Angler', rarity: 'Rare', minKg: 8.5, maxKg: 26.0, val: 380, time: 'Night', bait: 'night_shrimp', color: '#222E47', accent: '#F6C453', desc: 'Pemancing kedalaman dengan antena lentera kristal kembar.' },
    { name: 'Sea Snake King', rarity: 'Legendary', minKg: 48.0, maxKg: 145.0, val: 560, bait: 'weird_algae', color: '#264F6B', accent: '#7CE8FF', desc: 'Ular laut gesit bermahkota kristal bercahaya.' },
    { name: 'Ancient Depth Kraken', rarity: 'Mythical', minKg: 260.0, maxKg: 680.0, val: 680, bait: 'truffle_worm', color: '#2A1D42', accent: '#A8F5E3', desc: 'Kraken penjaga pusaran kristal di utara samudra.' },
    { name: 'Crystalized Leviathan', rarity: 'Mythical', minKg: 310.0, maxKg: 810.0, val: 720, weather: 'Aurora', bait: 'truffle_worm', color: '#3E5E9E', accent: '#FF9EAA', desc: 'Leviathan berlapis kristal prismatik sangat langka.' },
    { name: 'Eternal Abyss Dragon', rarity: 'Exotic', minKg: 480.0, maxKg: 1280.0, val: 1580, time: 'Night', bait: 'truffle_worm', color: '#4C1D95', accent: '#56F0B5', desc: 'Naga kristal samudra dalam tertinggi yang menjadi buruan utama kapten Fisch.' },
  ],
};

function slugifyId(islandId: string, name: string): string {
  return `${islandId}__${name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`;
}

const GENERATED_ISLAND_SPECIES: FischSpecies[] = Object.entries(ISLAND_SPECIES_SEEDS).flatMap(
  ([islandId, seeds]) =>
    seeds.map((s) => {
      const meta = RARITY_DIFFICULTY[s.rarity];
      return {
        id: slugifyId(islandId, s.name),
        name: s.name,
        islandId,
        rarity: s.rarity,
        minKg: s.minKg,
        maxKg: s.maxKg,
        baseValuePerKg: s.val,
        xp: meta.xp,
        preferredTime: s.time,
        preferredWeather: s.weather,
        preferredSeason: s.season,
        preferredBait: s.bait,
        difficulty: meta.diff,
        progressSpeedMod: meta.mod,
        colorHex: s.color,
        accentHex: s.accent,
        description: s.desc,
      };
    })
);

export const UNIVERSAL_CRATE_SPECIES: FischSpecies[] = [
  {
    id: 'crate__bait_crate',
    name: 'Bait Crate',
    islandId: 'universal',
    rarity: 'Uncommon',
    minKg: 3.5,
    maxKg: 6.5,
    baseValuePerKg: 22,
    xp: 60,
    preferredBait: 'magnet',
    difficulty: 2.0,
    progressSpeedMod: 0.1,
    colorHex: '#9E7B4F',
    accentHex: '#E5CFA8',
    isCrate: true,
    description: 'Peti kayu berisi 4–7 umpan acak saat dibuka di Tas.',
  },
  {
    id: 'crate__quality_bait_crate',
    name: 'Quality Bait Crate',
    islandId: 'universal',
    rarity: 'Rare',
    minKg: 4.5,
    maxKg: 8.5,
    baseValuePerKg: 45,
    xp: 120,
    preferredBait: 'magnet',
    difficulty: 3.0,
    progressSpeedMod: 0.05,
    colorHex: '#3A7D7C',
    accentHex: '#F3D250',
    isCrate: true,
    description: 'Peti umpan bermutu tinggi berisi umpan Rare hingga Mythical!',
  },
  {
    id: 'crate__common_crate',
    name: 'Common Crate',
    islandId: 'universal',
    rarity: 'Uncommon',
    minKg: 5.0,
    maxKg: 10.0,
    baseValuePerKg: 26,
    xp: 55,
    preferredBait: 'magnet',
    difficulty: 2.2,
    progressSpeedMod: 0.08,
    colorHex: '#7A644B',
    accentHex: '#C7B99E',
    isCrate: true,
    description: 'Peti barang karam berisi bonus C$ dan umpan.',
  },
  {
    id: 'crate__coral_geode',
    name: 'Coral Geode',
    islandId: 'universal',
    rarity: 'Rare',
    minKg: 3.0,
    maxKg: 7.0,
    baseValuePerKg: 68,
    xp: 150,
    preferredBait: 'magnet',
    difficulty: 3.8,
    progressSpeedMod: -0.02,
    colorHex: '#C95D63',
    accentHex: '#A8F5E3',
    isCrate: true,
    description: 'Batu karang berongga berisi C$ melimpah & peluang Enchant Relic.',
  },
  {
    id: 'crate__volcanic_geode',
    name: 'Volcanic Geode',
    islandId: 'universal',
    rarity: 'Legendary',
    minKg: 4.0,
    maxKg: 9.0,
    baseValuePerKg: 110,
    xp: 260,
    preferredBait: 'magnet',
    difficulty: 4.8,
    progressSpeedMod: -0.08,
    colorHex: '#B84A39',
    accentHex: '#FFD166',
    isCrate: true,
    description: 'Geode panas berisi C$ besar, Truffle Worm, atau Relic sihir!',
  },
  {
    id: 'relic__enchant_relic',
    name: 'Enchant Relic',
    islandId: 'universal',
    rarity: 'Mythical',
    minKg: 1.5,
    maxKg: 3.0,
    baseValuePerKg: 1200,
    xp: 550,
    difficulty: 6.0,
    progressSpeedMod: -0.15,
    colorHex: '#7B3FE4',
    accentHex: '#A8F5FF',
    isRelic: true,
    description: 'Batu kristal kuno untuk memasang Enchant pada Rod di Keeper’s Altar saat malam!',
  },
];

export const FISCH_SPECIES: FischSpecies[] = [
  ...GENERATED_ISLAND_SPECIES,
  ...UNIVERSAL_CRATE_SPECIES,
];

export const FISCH_QUESTS: FischQuest[] = [
  {
    id: 'q_pierre_1',
    npcName: 'Pierre',
    npcRole: 'Penjaga Dermaga Moosewood',
    title: 'Langkah Pertama Pemancing',
    description: 'Tangkap 5 ikan apa saja di perairan Moosewood untuk membuktikan ketangkasan lemparanmu.',
    minLevel: 1,
    targetType: 'catch_count',
    targetValue: 5,
    requiredAmount: 5,
    rewardCredits: 350,
    rewardXp: 150,
    rewardBait: { baitId: 'worm', amount: 8 },
  },
  {
    id: 'q_phineas_1',
    npcName: 'Phineas',
    npcRole: 'Kolektor Umpan',
    title: 'Berburu Peti Umpan',
    description: 'Buka 2 peti (Bait Crate / Common Crate / Geode) dari tas inventarismu.',
    minLevel: 1,
    targetType: 'open_crates',
    targetValue: 2,
    requiredAmount: 2,
    rewardCredits: 500,
    rewardXp: 240,
    rewardBait: { baitId: 'magnet', amount: 5 },
  },
  {
    id: 'q_roslit_explorer',
    npcName: 'Mariner Cal',
    npcRole: 'Pelaut Roslit Bay',
    title: 'Eksplorasi Teluk Karang',
    description: 'Tangkap 8 ikan di Roslit Bay untuk membuka rahasia terumbu tropis.',
    minLevel: 2,
    targetType: 'island_catch',
    targetValue: 'roslit_bay',
    requiredAmount: 8,
    rewardCredits: 1200,
    rewardXp: 480,
    rewardCrate: { crateId: 'crate__quality_bait_crate', amount: 2 },
  },
  {
    id: 'q_orc_puffer',
    npcName: 'The Orc',
    npcRole: 'Pandai Besi Roslit',
    title: 'Tantangan Pufferfish Sang Orc',
    description: 'Tangkap 2 ekor Pufferfish di Roslit Bay untuk hadiah spesial Magma Rod tahan panas!',
    minLevel: 4,
    targetType: 'catch_species',
    targetValue: 'roslit_bay__pufferfish',
    requiredAmount: 2,
    rewardCredits: 2500,
    rewardXp: 900,
    rewardRodId: 'magma',
  },
  {
    id: 'q_agric_alligator',
    npcName: 'Agric',
    npcRole: 'Penjaga Mushgrove',
    title: 'Penguasa Rawa Jamur',
    description: 'Tangkap 1 Alligator di Mushgrove Swamp untuk mendapatkan Fungal Rod!',
    minLevel: 5,
    targetType: 'catch_species',
    targetValue: 'mushgrove__alligator',
    requiredAmount: 1,
    rewardCredits: 3200,
    rewardXp: 1100,
    rewardRodId: 'fungal',
  },
  {
    id: 'q_snowcap_rare',
    npcName: 'Kapten Boreal',
    npcRole: 'Penjelajah Snowcap',
    title: 'Pemburu Perairan Beku',
    description: 'Tangkap 10 ikan di Snowcap Island untuk mendapatkan suplai Truffle Worm.',
    minLevel: 9,
    targetType: 'island_catch',
    targetValue: 'snowcap',
    requiredAmount: 10,
    rewardCredits: 4800,
    rewardXp: 1800,
    rewardBait: { baitId: 'truffle_worm', amount: 4 },
  },
  {
    id: 'q_merlin_relic',
    npcName: 'Merlin',
    npcRole: 'Penyihir Sunstone',
    title: 'Panggilan Kristal Sihir',
    description: 'Tangkap 4 ikan berlabel Rare atau lebih tinggi di pulau mana pun.',
    minLevel: 10,
    targetType: 'catch_rarity',
    targetValue: 'Rare',
    requiredAmount: 4,
    rewardCredits: 6500,
    rewardXp: 2400,
    rewardRelics: 2,
  },
  {
    id: 'q_keeper_legend',
    npcName: 'The Keeper',
    npcRole: 'Penjaga Altar Kedaulatan',
    title: 'Ujian Sang Legenda',
    description: 'Tangkap 3 ikan Legendary atau lebih langka untuk mendapat berkah Enchant Relic.',
    minLevel: 15,
    targetType: 'catch_rarity',
    targetValue: 'Legendary',
    requiredAmount: 3,
    rewardCredits: 18000,
    rewardXp: 5200,
    rewardRelics: 4,
  },
  {
    id: 'q_submariner_deep',
    npcName: 'Submariner Vance',
    npcRole: 'Komandan Mariana’s Veil',
    title: 'Penakluk Palung Abyssal',
    description: 'Tangkap 12 penghuni Desolate Deep untuk membuktikan ketahanan di kedalaman ekstrem.',
    minLevel: 22,
    targetType: 'island_catch',
    targetValue: 'desolate_deep',
    requiredAmount: 12,
    rewardCredits: 45000,
    rewardXp: 12000,
    rewardRelics: 5,
    rewardBait: { baitId: 'truffle_worm', amount: 10 },
  },
  {
    id: 'q_shipwright_sail',
    npcName: 'Tukang Kapal',
    npcRole: 'Galangan Kapal Moosewood',
    title: 'Pelayaran ke Forsaken Shores',
    description: 'Naiki kapalmu dari dermaga dan tangkap 6 ikan di perairan pulau bajak laut Forsaken Shores.',
    minLevel: 6,
    targetType: 'island_catch',
    targetValue: 'forsaken_shores',
    requiredAmount: 6,
    rewardCredits: 3800,
    rewardXp: 1500,
    rewardCrate: { crateId: 'crate__quality_bait_crate', amount: 2 },
  },
  {
    id: 'q_ancient_fossil',
    npcName: 'Dr. Fin',
    npcRole: 'Arkeolog Ancient Isle',
    title: 'Ekspedisi Kawah Purba',
    description: 'Berlayar ke Ancient Isle dan tangkap 8 makhluk prasejarah dari kawah meteor.',
    minLevel: 12,
    targetType: 'island_catch',
    targetValue: 'ancient_isle',
    requiredAmount: 8,
    rewardCredits: 14000,
    rewardXp: 4200,
    rewardRelics: 3,
  },
  {
    id: 'q_depths_dragon',
    npcName: 'Penjaga Atol',
    npcRole: 'Suar The Depths',
    title: 'Pelaut Menuju Atol Kristal',
    description: 'Capai The Depths Atoll memakai kapal dan tangkap 8 ikan bercahaya dari sana.',
    minLevel: 18,
    targetType: 'island_catch',
    targetValue: 'the_depths',
    requiredAmount: 8,
    rewardCredits: 32000,
    rewardXp: 9000,
    rewardRelics: 4,
    rewardBait: { baitId: 'truffle_worm', amount: 8 },
  },
];
