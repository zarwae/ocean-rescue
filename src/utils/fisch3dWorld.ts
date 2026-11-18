import * as THREE from 'three';
import {
  AppraiserTableStyle,
  FISCH_ISLANDS,
  FischIsland,
  ISLAND_NPC_PERSONAS,
  MerchantStallStyle,
  NpcHatStyle,
} from './fischData';

export const WATER_BASE_Y = 0;

export type FischNpcRole =
  | 'merchant'
  | 'appraiser'
  | 'angler'
  | 'merlin'
  | 'altar'
  | 'quest'
  | 'shipwright';

export interface FischNpcSpawn {
  id: string;
  islandId: string;
  role: FischNpcRole;
  name: string;
  subtitle: string;
  dialogue: string;
  targetTab: 'merchant' | 'appraiser' | 'angler' | 'quest' | 'merlin' | 'altar' | 'shipwright';
  x: number;
  z: number;
  yaw: number;
  shirtHex: string;
  accentHex: string;
  hatStyle?: NpcHatStyle;
  stallStyle?: MerchantStallStyle;
  tableStyle?: AppraiserTableStyle;
}

export interface IslandLobe {
  lx: number;
  lz: number;
  rx: number;
  rz: number;
  height: number;
  sides?: number;
  tint?: 'primary' | 'secondary' | 'stone' | 'crater';
  hillPeak?: number;
  craterDepth?: number;
  craterRimRadius?: number;
}

export interface IslandBridge {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  width: number;
  y1: number;
  y2: number;
  arch?: number;
  style: 'wood' | 'bamboo' | 'stone' | 'obsidian' | 'crystal';
}

export interface IslandPierSpec {
  startZ: number;
  endZ: number;
  width: number;
  headWidth: number;
  headDepth: number;
  elevation: number;
  style: 'wood' | 'bamboo' | 'stone' | 'steel' | 'obsidian';
  mooredOffsetX: number;
  mooredOffsetZ: number;
}

export interface IslandNpcLocalPlacement {
  role: FischNpcRole;
  lx: number;
  lz: number;
  localYaw: number;
}

export interface FischIslandLayout {
  id: string;
  dockAngle: number;
  activeRadius: number;
  lobes: IslandLobe[];
  bridges: IslandBridge[];
  pier: IslandPierSpec;
  npcs: IslandNpcLocalPlacement[];
}

export const FISCH_ISLAND_LAYOUTS: Record<string, FischIslandLayout> = {
  moosewood: {
    id: 'moosewood',
    dockAngle: 0,
    activeRadius: 27,
    lobes: [
      { lx: 0, lz: -7.2, rx: 14.5, rz: 9.8, height: 0.78, sides: 28, tint: 'primary', hillPeak: 0.32 },
      { lx: -11.2, lz: -11.8, rx: 6.2, rz: 5.8, height: 1.38, sides: 16, tint: 'secondary', hillPeak: 0.2 },
      { lx: 11.2, lz: -10.2, rx: 6.4, rz: 6.0, height: 1.08, sides: 16, tint: 'secondary' },
      { lx: 0, lz: -15.0, rx: 5.8, rz: 4.5, height: 1.04, sides: 8, tint: 'stone' },
    ],
    bridges: [
      { x1: -5.8, z1: -9.4, x2: -9.6, z2: -10.8, width: 2.5, y1: 0.92, y2: 1.42, style: 'wood' },
      { x1: 5.8, z1: -8.6, x2: 9.4, z2: -9.6, width: 2.5, y1: 0.9, y2: 1.08, style: 'wood' },
    ],
    pier: {
      startZ: 1.5,
      endZ: 14.6,
      width: 4.8,
      headWidth: 11.6,
      headDepth: 3.4,
      elevation: 0.96,
      style: 'wood',
      mooredOffsetX: -8.4,
      mooredOffsetZ: 13.4,
    },
    npcs: [
      { role: 'merchant', lx: -8.6, lz: -2.8, localYaw: 0.45 },
      { role: 'appraiser', lx: 8.6, lz: -3.0, localYaw: -0.45 },
      { role: 'angler', lx: -3.8, lz: 11.8, localYaw: 0.6 },
      { role: 'quest', lx: -4.2, lz: -1.8, localYaw: 0.9 },
      { role: 'merlin', lx: 11.2, lz: -11.2, localYaw: -0.75 },
      { role: 'altar', lx: 0, lz: -15.4, localYaw: 0 },
      { role: 'shipwright', lx: 4.2, lz: 13.0, localYaw: -0.85 },
    ],
  },

  roslit_bay: {
    id: 'roslit_bay',
    dockAngle: 0.65,
    activeRadius: 27,
    // Horseshoe Coral Atoll framing an open water lagoon bridged across the middle
    lobes: [
      { lx: 0, lz: -1.4, rx: 8.6, rz: 4.4, height: 0.74, sides: 22, tint: 'primary' },
      { lx: -9.8, lz: -8.6, rx: 5.2, rz: 8.2, height: 0.86, sides: 18, tint: 'primary', hillPeak: 0.25 },
      { lx: 9.8, lz: -8.6, rx: 5.2, rz: 8.2, height: 0.86, sides: 18, tint: 'primary', hillPeak: 0.25 },
      { lx: 0, lz: -16.4, rx: 8.4, rz: 4.2, height: 1.05, sides: 18, tint: 'secondary', hillPeak: 0.22 },
    ],
    bridges: [
      { x1: -5.4, z1: -9.2, x2: 5.4, z2: -9.2, width: 2.8, y1: 0.92, y2: 0.92, arch: 0.9, style: 'bamboo' },
    ],
    pier: {
      startZ: 2.0,
      endZ: 14.0,
      width: 4.4,
      headWidth: 10.6,
      headDepth: 3.2,
      elevation: 0.94,
      style: 'bamboo',
      mooredOffsetX: -7.8,
      mooredOffsetZ: 12.8,
    },
    npcs: [
      { role: 'merchant', lx: 9.8, lz: -6.8, localYaw: -1.25 },
      { role: 'appraiser', lx: -9.8, lz: -6.8, localYaw: 1.25 },
      { role: 'angler', lx: -4.2, lz: -1.6, localYaw: 0.35 },
      { role: 'quest', lx: 4.4, lz: -1.6, localYaw: -0.35 },
      { role: 'merlin', lx: 5.2, lz: -16.2, localYaw: -0.45 },
      { role: 'altar', lx: -3.8, lz: -16.6, localYaw: 0.25 },
      { role: 'shipwright', lx: 3.8, lz: 12.5, localYaw: -0.9 },
    ],
  },

  mushgrove: {
    id: 'mushgrove',
    dockAngle: Math.PI + 0.6,
    activeRadius: 27,
    // 4 Separate Muddy Swamp Islets linked by elevated boardwalk bridges over swamp water
    lobes: [
      { lx: 0, lz: -3.0, rx: 7.0, rz: 5.0, height: 0.72, sides: 16, tint: 'primary' },
      { lx: -9.8, lz: -10.6, rx: 6.2, rz: 5.6, height: 0.85, sides: 14, tint: 'secondary', hillPeak: 0.2 },
      { lx: 9.8, lz: -10.6, rx: 6.2, rz: 5.6, height: 0.85, sides: 14, tint: 'secondary', hillPeak: 0.2 },
      { lx: 0, lz: -17.2, rx: 6.4, rz: 4.6, height: 0.98, sides: 14, tint: 'stone', hillPeak: 0.18 },
    ],
    bridges: [
      { x1: -2.2, z1: -5.4, x2: -6.6, z2: -8.6, width: 2.5, y1: 0.74, y2: 0.86, arch: 0.32, style: 'wood' },
      { x1: 2.2, z1: -5.4, x2: 6.6, z2: -8.6, width: 2.5, y1: 0.74, y2: 0.86, arch: 0.32, style: 'wood' },
      { x1: -6.4, z1: -13.2, x2: -3.2, z2: -15.6, width: 2.4, y1: 0.86, y2: 0.98, arch: 0.25, style: 'wood' },
      { x1: 6.4, z1: -13.2, x2: 3.2, z2: -15.6, width: 2.4, y1: 0.86, y2: 0.98, arch: 0.25, style: 'wood' },
    ],
    pier: {
      startZ: 1.2,
      endZ: 13.8,
      width: 4.3,
      headWidth: 10.2,
      headDepth: 3.1,
      elevation: 0.94,
      style: 'wood',
      mooredOffsetX: -7.5,
      mooredOffsetZ: 12.6,
    },
    npcs: [
      { role: 'merchant', lx: 10.2, lz: -10.6, localYaw: -1.1 },
      { role: 'appraiser', lx: -10.2, lz: -10.6, localYaw: 1.1 },
      { role: 'angler', lx: -3.8, lz: -2.6, localYaw: 0.45 },
      { role: 'quest', lx: 3.8, lz: -2.6, localYaw: -0.45 },
      { role: 'merlin', lx: 3.2, lz: -17.0, localYaw: -0.3 },
      { role: 'altar', lx: -2.6, lz: -17.4, localYaw: 0.25 },
      { role: 'shipwright', lx: 3.6, lz: 12.2, localYaw: -0.95 },
    ],
  },

  sunstone: {
    id: 'sunstone',
    dockAngle: -Math.PI / 2,
    activeRadius: 27,
    // 3-Tier Stepped Octagonal Golden Citadel culminating in Merlin's Tower Summit
    lobes: [
      { lx: 0, lz: -3.2, rx: 11.4, rz: 5.8, height: 0.82, sides: 8, tint: 'primary' },
      { lx: 0, lz: -10.6, rx: 10.2, rz: 5.6, height: 1.65, sides: 8, tint: 'secondary' },
      { lx: 0, lz: -17.8, rx: 7.4, rz: 4.8, height: 2.52, sides: 8, tint: 'stone' },
    ],
    bridges: [
      { x1: 0, z1: -5.4, x2: 0, z2: -8.6, width: 4.4, y1: 0.84, y2: 1.66, style: 'stone' },
      { x1: 0, z1: -12.6, x2: 0, z2: -15.6, width: 3.8, y1: 1.66, y2: 2.52, style: 'stone' },
    ],
    pier: {
      startZ: 1.8,
      endZ: 13.8,
      width: 5.0,
      headWidth: 11.2,
      headDepth: 3.2,
      elevation: 0.96,
      style: 'stone',
      mooredOffsetX: -8.2,
      mooredOffsetZ: 12.6,
    },
    npcs: [
      { role: 'merchant', lx: -6.8, lz: -3.2, localYaw: 0.65 },
      { role: 'appraiser', lx: 6.8, lz: -3.2, localYaw: -0.65 },
      { role: 'angler', lx: -6.2, lz: -10.5, localYaw: 0.55 },
      { role: 'quest', lx: 6.2, lz: -10.5, localYaw: -0.55 },
      { role: 'merlin', lx: 3.4, lz: -17.4, localYaw: -0.4 },
      { role: 'altar', lx: -3.4, lz: -17.6, localYaw: 0.35 },
      { role: 'shipwright', lx: 4.0, lz: 12.2, localYaw: -0.85 },
    ],
  },

  forsaken_shores: {
    id: 'forsaken_shores',
    dockAngle: Math.PI / 2,
    activeRadius: 27,
    // Twin-Claw Skull Cove enclosing sunken pirate waters + rope bridge
    lobes: [
      { lx: 0, lz: -2.4, rx: 8.6, rz: 4.8, height: 0.76, sides: 18, tint: 'primary' },
      { lx: -9.6, lz: -10.4, rx: 6.2, rz: 7.4, height: 1.24, sides: 14, tint: 'stone', hillPeak: 0.35 },
      { lx: 9.6, lz: -10.2, rx: 6.0, rz: 7.2, height: 1.05, sides: 14, tint: 'secondary', hillPeak: 0.24 },
    ],
    bridges: [
      { x1: -5.4, z1: -10.4, x2: 5.4, z2: -10.4, width: 2.6, y1: 1.18, y2: 1.08, arch: 0.68, style: 'wood' },
    ],
    pier: {
      startZ: 1.6,
      endZ: 14.4,
      width: 4.5,
      headWidth: 10.8,
      headDepth: 3.2,
      elevation: 0.94,
      style: 'wood',
      mooredOffsetX: -8.0,
      mooredOffsetZ: 13.0,
    },
    npcs: [
      { role: 'merchant', lx: 9.4, lz: -8.6, localYaw: -0.95 },
      { role: 'appraiser', lx: -9.4, lz: -8.2, localYaw: 0.95 },
      { role: 'angler', lx: -4.2, lz: -2.6, localYaw: 0.35 },
      { role: 'quest', lx: 4.4, lz: -2.6, localYaw: -0.35 },
      { role: 'merlin', lx: 9.6, lz: -14.2, localYaw: -0.5 },
      { role: 'altar', lx: -9.6, lz: -14.5, localYaw: 0.45 },
      { role: 'shipwright', lx: 4.0, lz: 12.8, localYaw: -0.85 },
    ],
  },

  snowcap: {
    id: 'snowcap',
    dockAngle: -0.65,
    activeRadius: 27,
    // Twin-Peak Glacial Fjord with elevated snow shelves & high skybridge
    lobes: [
      { lx: 0, lz: -4.2, rx: 12.6, rz: 6.0, height: 0.84, sides: 6, tint: 'primary' },
      { lx: -8.6, lz: -13.4, rx: 6.6, rz: 5.8, height: 1.72, sides: 6, tint: 'secondary', hillPeak: 0.28 },
      { lx: 8.6, lz: -13.4, rx: 6.6, rz: 5.8, height: 1.56, sides: 6, tint: 'secondary', hillPeak: 0.25 },
    ],
    bridges: [
      { x1: -5.4, z1: -6.8, x2: -7.4, z2: -10.8, width: 3.2, y1: 0.86, y2: 1.72, style: 'stone' },
      { x1: 5.4, z1: -6.8, x2: 7.4, z2: -10.8, width: 3.2, y1: 0.86, y2: 1.56, style: 'stone' },
      { x1: -3.8, z1: -13.8, x2: 3.8, z2: -13.8, width: 2.6, y1: 1.72, y2: 1.58, arch: 0.72, style: 'crystal' },
    ],
    pier: {
      startZ: 1.2,
      endZ: 14.0,
      width: 4.6,
      headWidth: 10.8,
      headDepth: 3.2,
      elevation: 0.96,
      style: 'wood',
      mooredOffsetX: -7.8,
      mooredOffsetZ: 12.6,
    },
    npcs: [
      { role: 'merchant', lx: -7.8, lz: -4.2, localYaw: 0.75 },
      { role: 'appraiser', lx: 7.8, lz: -4.2, localYaw: -0.75 },
      { role: 'angler', lx: -3.8, lz: 11.4, localYaw: 0.5 },
      { role: 'quest', lx: 0, lz: -4.5, localYaw: 0 },
      { role: 'merlin', lx: 8.8, lz: -14.2, localYaw: -0.6 },
      { role: 'altar', lx: -8.8, lz: -14.2, localYaw: 0.6 },
      { role: 'shipwright', lx: 3.9, lz: 12.4, localYaw: -0.9 },
    ],
  },

  roslit_volcano: {
    id: 'roslit_volcano',
    dockAngle: -Math.PI / 2,
    activeRadius: 27,
    // Split Basalt Caldera with molten lava gorge bridged by obsidian arch
    lobes: [
      { lx: -6.8, lz: -6.8, rx: 6.4, rz: 7.8, height: 0.94, sides: 6, tint: 'primary' },
      { lx: 6.8, lz: -6.8, rx: 6.4, rz: 7.8, height: 1.12, sides: 6, tint: 'primary' },
      { lx: 0, lz: -15.8, rx: 9.8, rz: 4.8, height: 1.66, sides: 6, tint: 'stone', hillPeak: 0.28 },
    ],
    bridges: [
      { x1: -2.4, z1: -5.8, x2: 2.4, z2: -5.8, width: 3.0, y1: 0.96, y2: 1.12, arch: 0.78, style: 'obsidian' },
      { x1: -4.8, z1: -11.6, x2: -2.5, z2: -13.8, width: 3.0, y1: 0.96, y2: 1.66, style: 'obsidian' },
      { x1: 4.8, z1: -11.6, x2: 2.5, z2: -13.8, width: 3.0, y1: 1.12, y2: 1.66, style: 'obsidian' },
      { x1: -4.5, z1: 0.2, x2: 0, z2: 1.4, width: 3.4, y1: 0.96, y2: 0.96, style: 'obsidian' },
    ],
    pier: {
      startZ: 0.8,
      endZ: 14.0,
      width: 4.8,
      headWidth: 11.2,
      headDepth: 3.2,
      elevation: 0.96,
      style: 'obsidian',
      mooredOffsetX: -8.0,
      mooredOffsetZ: 12.6,
    },
    npcs: [
      { role: 'merchant', lx: 7.2, lz: -6.8, localYaw: -0.95 },
      { role: 'appraiser', lx: -7.2, lz: -6.8, localYaw: 0.95 },
      { role: 'angler', lx: -5.2, lz: -2.2, localYaw: 0.45 },
      { role: 'quest', lx: 5.2, lz: -2.2, localYaw: -0.45 },
      { role: 'merlin', lx: 5.2, lz: -15.8, localYaw: -0.5 },
      { role: 'altar', lx: 0, lz: -16.4, localYaw: 0 },
      { role: 'shipwright', lx: 4.0, lz: 12.5, localYaw: -0.85 },
    ],
  },

  sovereignty: {
    id: 'sovereignty',
    dockAngle: 0,
    activeRadius: 28,
    // Grand Octagonal Marble Acropolis + Elevated Amphitheater
    lobes: [
      { lx: 0, lz: -5.2, rx: 12.8, rz: 7.4, height: 0.88, sides: 8, tint: 'primary' },
      { lx: 0, lz: -14.4, rx: 9.8, rz: 6.4, height: 1.72, sides: 8, tint: 'stone' },
    ],
    bridges: [
      { x1: 0, z1: -8.6, x2: 0, z2: -11.6, width: 4.6, y1: 0.88, y2: 1.72, style: 'stone' },
    ],
    pier: {
      startZ: 1.5,
      endZ: 14.8,
      width: 5.6,
      headWidth: 12.4,
      headDepth: 3.4,
      elevation: 0.96,
      style: 'stone',
      mooredOffsetX: -8.6,
      mooredOffsetZ: 13.4,
    },
    npcs: [
      { role: 'merchant', lx: -8.4, lz: -4.2, localYaw: 0.7 },
      { role: 'appraiser', lx: 8.4, lz: -4.2, localYaw: -0.7 },
      { role: 'angler', lx: -4.2, lz: 12.2, localYaw: 0.55 },
      { role: 'quest', lx: -4.2, lz: -1.8, localYaw: 0.6 },
      { role: 'merlin', lx: 5.6, lz: -14.0, localYaw: -0.5 },
      { role: 'altar', lx: 0, lz: -14.4, localYaw: 0 },
      { role: 'shipwright', lx: 4.5, lz: 13.0, localYaw: -0.85 },
    ],
  },

  desolate_deep: {
    id: 'desolate_deep',
    dockAngle: Math.PI / 2,
    activeRadius: 27,
    // Industrial Abyssal Research Crescent with Steel Deck & Outer Ridge Spokes
    lobes: [
      { lx: 0, lz: -6.2, rx: 10.6, rz: 6.6, height: 0.88, sides: 8, tint: 'stone' },
      { lx: -10.8, lz: -11.8, rx: 5.4, rz: 5.6, height: 1.15, sides: 10, tint: 'primary', hillPeak: 0.22 },
      { lx: 10.8, lz: -11.8, rx: 5.4, rz: 5.6, height: 1.15, sides: 10, tint: 'primary', hillPeak: 0.22 },
      { lx: 0, lz: -16.8, rx: 6.2, rz: 4.2, height: 1.38, sides: 8, tint: 'secondary' },
    ],
    bridges: [
      { x1: -5.4, z1: -8.8, x2: -8.2, z2: -10.2, width: 2.6, y1: 0.9, y2: 1.15, style: 'obsidian' },
      { x1: 5.4, z1: -8.8, x2: 8.2, z2: -10.2, width: 2.6, y1: 0.9, y2: 1.15, style: 'obsidian' },
      { x1: 0, z1: -10.6, x2: 0, z2: -14.6, width: 3.0, y1: 0.9, y2: 1.38, style: 'obsidian' },
    ],
    pier: {
      startZ: 0.2,
      endZ: 14.2,
      width: 4.6,
      headWidth: 11.4,
      headDepth: 3.4,
      elevation: 0.96,
      style: 'steel',
      mooredOffsetX: -8.2,
      mooredOffsetZ: 12.8,
    },
    npcs: [
      { role: 'merchant', lx: -6.4, lz: -4.8, localYaw: 0.7 },
      { role: 'appraiser', lx: 6.4, lz: -4.8, localYaw: -0.7 },
      { role: 'angler', lx: -10.6, lz: -11.6, localYaw: 0.9 },
      { role: 'quest', lx: 10.6, lz: -11.6, localYaw: -0.9 },
      { role: 'merlin', lx: 3.4, lz: -16.8, localYaw: -0.35 },
      { role: 'altar', lx: -2.8, lz: -17.0, localYaw: 0.3 },
      { role: 'shipwright', lx: 4.2, lz: 12.6, localYaw: -0.85 },
    ],
  },

  ancient_isle: {
    id: 'ancient_isle',
    dockAngle: Math.PI - 0.55,
    activeRadius: 27,
    // Meteor Crater Ring surrounding a Sunken Emerald Meteor Basin
    lobes: [
      { lx: 0, lz: -2.2, rx: 8.8, rz: 4.6, height: 0.78, sides: 18, tint: 'primary' },
      { lx: -9.4, lz: -10.6, rx: 5.2, rz: 7.4, height: 1.42, sides: 12, tint: 'stone', hillPeak: 0.25 },
      { lx: 9.4, lz: -10.6, rx: 5.2, rz: 7.4, height: 1.42, sides: 12, tint: 'stone', hillPeak: 0.25 },
      { lx: 0, lz: -17.0, rx: 8.8, rz: 4.4, height: 1.56, sides: 14, tint: 'secondary', hillPeak: 0.22 },
      { lx: 0, lz: -10.4, rx: 6.8, rz: 5.2, height: 0.48, sides: 24, tint: 'crater' },
    ],
    bridges: [
      { x1: 0, z1: -4.6, x2: 0, z2: -7.8, width: 3.4, y1: 0.78, y2: 0.48, style: 'stone' },
      { x1: -6.4, z1: -4.8, x2: -8.2, z2: -7.8, width: 2.8, y1: 0.78, y2: 1.42, style: 'stone' },
      { x1: 6.4, z1: -4.8, x2: 8.2, z2: -7.8, width: 2.8, y1: 0.78, y2: 1.42, style: 'stone' },
    ],
    pier: {
      startZ: 1.8,
      endZ: 14.0,
      width: 4.5,
      headWidth: 10.6,
      headDepth: 3.2,
      elevation: 0.94,
      style: 'stone',
      mooredOffsetX: -7.8,
      mooredOffsetZ: 12.6,
    },
    npcs: [
      { role: 'merchant', lx: 8.8, lz: -10.2, localYaw: -1.1 },
      { role: 'appraiser', lx: -8.8, lz: -10.2, localYaw: 1.1 },
      { role: 'angler', lx: -4.4, lz: -2.0, localYaw: 0.4 },
      { role: 'quest', lx: 4.4, lz: -2.0, localYaw: -0.4 },
      { role: 'merlin', lx: 4.6, lz: -17.0, localYaw: -0.45 },
      { role: 'altar', lx: -4.6, lz: -17.0, localYaw: 0.45 },
      { role: 'shipwright', lx: 3.8, lz: 12.4, localYaw: -0.85 },
    ],
  },

  the_depths: {
    id: 'the_depths',
    dockAngle: Math.PI,
    activeRadius: 27,
    // Shattered Crystal Sanctum with 2 outer Floating Shard Islets + Crystal Bridges
    lobes: [
      { lx: 0, lz: -6.6, rx: 9.2, rz: 6.8, height: 0.92, sides: 8, tint: 'stone' },
      { lx: -12.6, lz: -10.4, rx: 4.6, rz: 4.6, height: 1.18, sides: 6, tint: 'secondary' },
      { lx: 12.6, lz: -10.4, rx: 4.6, rz: 4.6, height: 1.18, sides: 6, tint: 'secondary' },
      { lx: 0, lz: -17.0, rx: 6.4, rz: 4.6, height: 1.56, sides: 8, tint: 'primary' },
    ],
    bridges: [
      { x1: -6.4, z1: -8.4, x2: -9.8, z2: -9.8, width: 2.6, y1: 0.94, y2: 1.18, arch: 0.42, style: 'crystal' },
      { x1: 6.4, z1: -8.4, x2: 9.8, z2: -9.8, width: 2.6, y1: 0.94, y2: 1.18, arch: 0.42, style: 'crystal' },
      { x1: 0, z1: -11.4, x2: 0, z2: -14.4, width: 3.2, y1: 0.94, y2: 1.56, style: 'crystal' },
    ],
    pier: {
      startZ: -0.4,
      endZ: 14.2,
      width: 4.8,
      headWidth: 11.2,
      headDepth: 3.2,
      elevation: 0.96,
      style: 'obsidian',
      mooredOffsetX: -8.0,
      mooredOffsetZ: 12.8,
    },
    npcs: [
      { role: 'merchant', lx: 12.6, lz: -10.2, localYaw: -1.1 },
      { role: 'appraiser', lx: -12.6, lz: -10.2, localYaw: 1.1 },
      { role: 'angler', lx: -5.4, lz: -5.4, localYaw: 0.55 },
      { role: 'quest', lx: 5.4, lz: -5.4, localYaw: -0.55 },
      { role: 'merlin', lx: 3.2, lz: -17.0, localYaw: -0.35 },
      { role: 'altar', lx: -3.0, lz: -17.2, localYaw: 0.35 },
      { role: 'shipwright', lx: 4.0, lz: 12.6, localYaw: -0.85 },
    ],
  },
};

export function getIslandLayout(islandId: string): FischIslandLayout {
  return FISCH_ISLAND_LAYOUTS[islandId] ?? FISCH_ISLAND_LAYOUTS.moosewood;
}

export function getIslandCenter(islandId: string): { x: number; z: number } {
  const isl = FISCH_ISLANDS.find((i) => i.id === islandId) ?? FISCH_ISLANDS[0];
  return isl.worldCoords;
}

export function islandLocalToWorld(
  islandId: string,
  lx: number,
  lz: number
): { x: number; z: number } {
  const center = getIslandCenter(islandId);
  const { dockAngle } = getIslandLayout(islandId);
  const c = Math.cos(dockAngle);
  const s = Math.sin(dockAngle);
  return {
    x: center.x + lx * c + lz * s,
    z: center.z - lx * s + lz * c,
  };
}

export function worldToIslandLocal(
  islandId: string,
  wx: number,
  wz: number
): { lx: number; lz: number } {
  const center = getIslandCenter(islandId);
  const { dockAngle } = getIslandLayout(islandId);
  const dx = wx - center.x;
  const dz = wz - center.z;
  const c = Math.cos(dockAngle);
  const s = Math.sin(dockAngle);
  return {
    lx: dx * c - dz * s,
    lz: dx * s + dz * c,
  };
}

function isOnLocalPier(layout: FischIslandLayout, lx: number, lz: number): boolean {
  const { pier } = layout;
  if (Math.abs(lx) <= pier.width * 0.5 && lz >= pier.startZ && lz <= pier.endZ) {
    return true;
  }
  const headCenterZ = pier.endZ - pier.headDepth * 0.45;
  if (
    Math.abs(lx) <= pier.headWidth * 0.5 &&
    lz >= headCenterZ - pier.headDepth * 0.5 &&
    lz <= headCenterZ + pier.headDepth * 0.5
  ) {
    return true;
  }
  return false;
}

function sampleBridgeHeight(bridge: IslandBridge, lx: number, lz: number): number | null {
  const dx = bridge.x2 - bridge.x1;
  const dz = bridge.z2 - bridge.z1;
  const lenSq = dx * dx + dz * dz;
  if (lenSq <= 0.0001) return null;
  const tRaw = ((lx - bridge.x1) * dx + (lz - bridge.z1) * dz) / lenSq;
  if (tRaw < -0.04 || tRaw > 1.04) return null;
  const t = Math.max(0, Math.min(1, tRaw));
  const projX = bridge.x1 + dx * t;
  const projZ = bridge.z1 + dz * t;
  const perp = Math.hypot(lx - projX, lz - projZ);
  if (perp > bridge.width * 0.52) return null;
  const arch = bridge.arch ? Math.sin(t * Math.PI) * bridge.arch : 0;
  return THREE.MathUtils.lerp(bridge.y1, bridge.y2, t) + arch;
}

function sampleLobeHeight(lobe: IslandLobe, lx: number, lz: number, includeShelf = false): number | null {
  const margin = includeShelf ? 1.24 : 1.01;
  const nx = (lx - lobe.lx) / lobe.rx;
  const nz = (lz - lobe.lz) / lobe.rz;
  const radial = Math.hypot(nx, nz);
  if (radial > margin) return null;
  if (radial <= 1.01) {
    const hill = lobe.hillPeak ? Math.max(0, 1 - radial) * lobe.hillPeak : 0;
    return lobe.height + hill;
  }
  const t = (radial - 1.01) / 0.23;
  return THREE.MathUtils.lerp(lobe.height, -0.4, t);
}

export function isOnWoodenPier(x: number, z: number, islandId = 'moosewood'): boolean {
  const layout = getIslandLayout(islandId);
  return isOnLocalPier(layout, x, z);
}

export function getGroundHeightAt(islandId: string, lx: number, lz: number): number {
  const layout = getIslandLayout(islandId);
  let bestHeight = -Infinity;

  if (isOnLocalPier(layout, lx, lz)) {
    bestHeight = Math.max(bestHeight, layout.pier.elevation);
  }

  for (const br of layout.bridges) {
    const h = sampleBridgeHeight(br, lx, lz);
    if (h !== null) {
      bestHeight = Math.max(bestHeight, h);
    }
  }

  for (const lobe of layout.lobes) {
    const h = sampleLobeHeight(lobe, lx, lz, true);
    if (h !== null) {
      bestHeight = Math.max(bestHeight, h);
    }
  }

  return bestHeight > -Infinity ? bestHeight : -0.8;
}

export function isWalkablePosition(lx: number, lz: number, islandId = 'moosewood'): boolean {
  const layout = getIslandLayout(islandId);
  if (isOnLocalPier(layout, lx, lz)) return true;
  for (const br of layout.bridges) {
    if (sampleBridgeHeight(br, lx, lz) !== null) return true;
  }
  for (const lobe of layout.lobes) {
    const nx = (lx - lobe.lx) / lobe.rx;
    const nz = (lz - lobe.lz) / lobe.rz;
    if (nx * nx + nz * nz <= 1.01) return true;
  }
  return false;
}

export function findActiveIslandAt(
  wx: number,
  wz: number,
  fallbackId = 'moosewood'
): FischIsland {
  let closest: FischIsland =
    FISCH_ISLANDS.find((i) => i.id === fallbackId) ?? FISCH_ISLANDS[0];
  let bestDistSq = Infinity;

  for (const isl of FISCH_ISLANDS) {
    const dx = wx - isl.worldCoords.x;
    const dz = wz - isl.worldCoords.z;
    const d2 = dx * dx + dz * dz;
    const layout = getIslandLayout(isl.id);
    if (d2 <= layout.activeRadius * layout.activeRadius && d2 < bestDistSq) {
      bestDistSq = d2;
      closest = isl;
    }
  }
  return closest;
}

export function findNearestIslandCenter(wx: number, wz: number): { island: FischIsland; dist: number } {
  let bestIsl = FISCH_ISLANDS[0];
  let bestD2 = Infinity;
  for (const isl of FISCH_ISLANDS) {
    const d2 = (wx - isl.worldCoords.x) ** 2 + (wz - isl.worldCoords.z) ** 2;
    if (d2 < bestD2) {
      bestD2 = d2;
      bestIsl = isl;
    }
  }
  return { island: bestIsl, dist: Math.sqrt(bestD2) };
}

export function getGroundHeightAtWorld(wx: number, wz: number): number {
  let bestHeight = -0.8;
  for (const isl of FISCH_ISLANDS) {
    const layout = getIslandLayout(isl.id);
    if (Math.hypot(wx - isl.worldCoords.x, wz - isl.worldCoords.z) > layout.activeRadius + 4) {
      continue;
    }
    const { lx, lz } = worldToIslandLocal(isl.id, wx, wz);
    const h = getGroundHeightAt(isl.id, lx, lz);
    if (h > bestHeight) bestHeight = h;
  }
  return bestHeight;
}

export function isWalkableWorldPosition(wx: number, wz: number): boolean {
  for (const isl of FISCH_ISLANDS) {
    const layout = getIslandLayout(isl.id);
    if (Math.hypot(wx - isl.worldCoords.x, wz - isl.worldCoords.z) > layout.activeRadius + 2) {
      continue;
    }
    const { lx, lz } = worldToIslandLocal(isl.id, wx, wz);
    if (isWalkablePosition(lx, lz, isl.id)) return true;
  }
  return false;
}

export function clampPlayerPosition(
  islandId: string,
  prevX: number,
  prevZ: number,
  nextX: number,
  nextZ: number
): { x: number; z: number; groundY: number } {
  if (isWalkablePosition(nextX, nextZ, islandId)) {
    return { x: nextX, z: nextZ, groundY: getGroundHeightAt(islandId, nextX, nextZ) };
  }
  if (isWalkablePosition(nextX, prevZ, islandId)) {
    return { x: nextX, z: prevZ, groundY: getGroundHeightAt(islandId, nextX, prevZ) };
  }
  if (isWalkablePosition(prevX, nextZ, islandId)) {
    return { x: prevX, z: nextZ, groundY: getGroundHeightAt(islandId, prevX, nextZ) };
  }
  return { x: prevX, z: prevZ, groundY: getGroundHeightAt(islandId, prevX, prevZ) };
}

export function clampPlayerWorldPosition(
  prevX: number,
  prevZ: number,
  nextX: number,
  nextZ: number
): { x: number; z: number; groundY: number } {
  if (isWalkableWorldPosition(nextX, nextZ)) {
    return { x: nextX, z: nextZ, groundY: getGroundHeightAtWorld(nextX, nextZ) };
  }
  if (isWalkableWorldPosition(nextX, prevZ)) {
    return { x: nextX, z: prevZ, groundY: getGroundHeightAtWorld(nextX, prevZ) };
  }
  if (isWalkableWorldPosition(prevX, nextZ)) {
    return { x: prevX, z: nextZ, groundY: getGroundHeightAtWorld(prevX, nextZ) };
  }
  return { x: prevX, z: prevZ, groundY: getGroundHeightAtWorld(prevX, prevZ) };
}

function buildNpcFromPlacement(
  islandId: string,
  placement: IslandNpcLocalPlacement
): FischNpcSpawn {
  const persona = ISLAND_NPC_PERSONAS[islandId] ?? ISLAND_NPC_PERSONAS.moosewood;
  const layout = getIslandLayout(islandId);
  const worldPos = islandLocalToWorld(islandId, placement.lx, placement.lz);
  const worldYaw = placement.localYaw + layout.dockAngle;

  switch (placement.role) {
    case 'merchant':
      return {
        id: `${islandId}_npc_merchant`,
        islandId,
        role: 'merchant',
        name: persona.merchant.name,
        subtitle: persona.merchant.subtitle,
        dialogue: persona.merchant.dialogue,
        targetTab: 'merchant',
        x: worldPos.x,
        z: worldPos.z,
        yaw: worldYaw,
        shirtHex: persona.merchant.shirtHex,
        accentHex: persona.merchant.accentHex,
        hatStyle: persona.merchant.hatStyle,
        stallStyle: persona.merchant.stallStyle,
      };
    case 'appraiser':
      return {
        id: `${islandId}_npc_appraiser`,
        islandId,
        role: 'appraiser',
        name: persona.appraiser.name,
        subtitle: persona.appraiser.subtitle,
        dialogue: persona.appraiser.dialogue,
        targetTab: 'appraiser',
        x: worldPos.x,
        z: worldPos.z,
        yaw: worldYaw,
        shirtHex: persona.appraiser.shirtHex,
        accentHex: persona.appraiser.accentHex,
        hatStyle: persona.appraiser.hatStyle,
        tableStyle: persona.appraiser.tableStyle,
      };
    case 'angler':
      return {
        id: `${islandId}_npc_angler`,
        islandId,
        role: 'angler',
        name: 'The Angler',
        subtitle: 'Pesanan Ikan Harian',
        dialogue: 'Aku punya daftar tangkapan harian segar dengan bayaran C$ serta paket umpan langka!',
        targetTab: 'angler',
        x: worldPos.x,
        z: worldPos.z,
        yaw: worldYaw,
        shirtHex: '#2B6CB0',
        accentHex: '#63B3ED',
        hatStyle: 'captain_cap',
      };
    case 'merlin':
      return {
        id: `${islandId}_npc_merlin`,
        islandId,
        role: 'merlin',
        name: 'Merlin',
        subtitle: 'Relic, Totem & Luck Boost',
        dialogue: 'Sihir kuno kepulauan ini bisa membangkitkan keberuntunganmu dengan Enchant Relic dan Totem.',
        targetTab: 'merlin',
        x: worldPos.x,
        z: worldPos.z,
        yaw: worldYaw,
        shirtHex: '#5B21B6',
        accentHex: '#B794F4',
      };
    case 'altar':
      return {
        id: `${islandId}_npc_altar`,
        islandId,
        role: 'altar',
        name: "Keeper's Altar",
        subtitle: 'Enchant Rod (Malam)',
        dialogue: 'Saat langit gelap turun, persembahkan 1 Enchant Relic untuk memberkati joranmu.',
        targetTab: 'altar',
        x: worldPos.x,
        z: worldPos.z,
        yaw: worldYaw,
        shirtHex: '#4C1D95',
        accentHex: '#C084FC',
      };
    case 'quest':
      return {
        id: `${islandId}_npc_quest`,
        islandId,
        role: 'quest',
        name: 'Penjaga Pulau',
        subtitle: 'Misi Cerita Nusantara',
        dialogue: 'Selesaikan ekspedisi pulau untuk membuka joran legendaris dan bonus C$ berlimpah!',
        targetTab: 'quest',
        x: worldPos.x,
        z: worldPos.z,
        yaw: worldYaw,
        shirtHex: '#2A7B4F',
        accentHex: '#5EC48B',
        hatStyle: 'straw',
      };
    case 'shipwright':
      return {
        id: `${islandId}_npc_shipwright`,
        islandId,
        role: 'shipwright',
        name: 'Tukang Kapal',
        subtitle: 'Galangan & Beli Kapal',
        dialogue: 'Ingin berlayar cepat ke pulau lain? Naik kapal di sisi dermaga [B] atau upgrade armada kapalmu di sini!',
        targetTab: 'shipwright',
        x: worldPos.x,
        z: worldPos.z,
        yaw: worldYaw,
        shirtHex: '#9A442C',
        accentHex: '#FBBF24',
        hatStyle: 'captain_cap',
      };
  }
}

export function getIslandNpcSpawns(islandId: string): FischNpcSpawn[] {
  const layout = getIslandLayout(islandId);
  return layout.npcs.map((placement) => buildNpcFromPlacement(islandId, placement));
}

let cachedAllWorldNpcSpawns: FischNpcSpawn[] | null = null;
export function getAllWorldNpcSpawns(): FischNpcSpawn[] {
  if (!cachedAllWorldNpcSpawns) {
    cachedAllWorldNpcSpawns = FISCH_ISLANDS.flatMap((isl) => getIslandNpcSpawns(isl.id));
  }
  return cachedAllWorldNpcSpawns;
}

export const FISCH_NPC_SPAWNS: FischNpcSpawn[] = getIslandNpcSpawns('moosewood');

export function getIslandDockSpawn(islandId: string): {
  px: number;
  py: number;
  pz: number;
  yaw: number;
  bx: number;
  bz: number;
  bYaw: number;
} {
  const layout = getIslandLayout(islandId);
  const playerLocalZ = layout.pier.endZ - 3.8;
  const playerWorld = islandLocalToWorld(islandId, 0, playerLocalZ);
  const boatWorld = islandLocalToWorld(
    islandId,
    layout.pier.mooredOffsetX,
    layout.pier.mooredOffsetZ
  );
  return {
    px: playerWorld.x,
    py: layout.pier.elevation,
    pz: playerWorld.z,
    yaw: layout.dockAngle,
    bx: boatWorld.x,
    bz: boatWorld.z,
    bYaw: layout.dockAngle,
  };
}

export const DEFAULT_MOORED_BOAT_POS = (() => {
  const s = getIslandDockSpawn('moosewood');
  return { x: s.bx, z: s.bz, yaw: s.bYaw };
})();

export interface FischHarborBeacon {
  islandId: string;
  name: string;
  subtitle: string;
  x: number;
  z: number;
  accentHex: string;
  silhouetteType: FischIsland['silhouetteType'];
}

export function getNeighborHarborBeacons(activeIslandId: string): FischHarborBeacon[] {
  const origin = FISCH_ISLANDS.find((i) => i.id === activeIslandId) ?? FISCH_ISLANDS[0];
  return FISCH_ISLANDS.filter((isl) => isl.id !== origin.id).map((isl) => ({
    islandId: isl.id,
    name: isl.name,
    subtitle: isl.subtitle,
    x: isl.worldCoords.x - origin.worldCoords.x,
    z: isl.worldCoords.z - origin.worldCoords.z,
    accentHex: isl.accentHex,
    silhouetteType: isl.silhouetteType,
  }));
}

export const FISCH_OUTPOST_BEACONS: FischHarborBeacon[] = getNeighborHarborBeacons('moosewood');

// Deterministic GPU-matching ocean wave function (matches GLSL vertex displacement)
export function waterHeightAt(x: number, z: number, timeSec: number): number {
  return (
    Math.sin(x * 0.42 + timeSec * 1.65) * 0.13 +
    Math.cos(z * 0.36 - timeSec * 1.25) * 0.1 +
    Math.sin((x + z) * 0.22 + timeSec * 0.95) * 0.055
  );
}

export function findNearestNpc(
  x: number,
  z: number,
  maxDistance = 3.6,
  spawns: FischNpcSpawn[] = getAllWorldNpcSpawns()
): FischNpcSpawn | null {
  let closest: FischNpcSpawn | null = null;
  let bestDistSq = maxDistance * maxDistance;

  for (const npc of spawns) {
    const dx = npc.x - x;
    const dz = npc.z - z;
    const d2 = dx * dx + dz * dz;
    if (d2 <= bestDistSq) {
      bestDistSq = d2;
      closest = npc;
    }
  }
  return closest;
}

function isBoatBlockedLocal(layout: FischIslandLayout, lx: number, lz: number): boolean {
  const { pier } = layout;
  // Pier + T-head clearance with boat hull padding
  if (Math.abs(lx) <= pier.width * 0.5 + 1.3 && lz >= pier.startZ - 0.8 && lz <= pier.endZ + 1.2) {
    return true;
  }
  const headCenterZ = pier.endZ - pier.headDepth * 0.45;
  if (
    Math.abs(lx) <= pier.headWidth * 0.5 + 1.3 &&
    lz >= headCenterZ - pier.headDepth * 0.5 - 1.2 &&
    lz <= headCenterZ + pier.headDepth * 0.5 + 1.2
  ) {
    return true;
  }

  for (const lobe of layout.lobes) {
    const nx = (lx - lobe.lx) / (lobe.rx + 2.1);
    const nz = (lz - lobe.lz) / (lobe.rz + 2.1);
    if (nx * nx + nz * nz <= 1.0) return true;
  }

  return false;
}

export function isBoatBlockedWorld(wx: number, wz: number): boolean {
  // World ocean bounds inside 520x520 water plane
  if (Math.abs(wx) > 228 || wz < -185 || wz > 195) return true;
  for (const isl of FISCH_ISLANDS) {
    const layout = getIslandLayout(isl.id);
    if (Math.hypot(wx - isl.worldCoords.x, wz - isl.worldCoords.z) > layout.activeRadius + 5) {
      continue;
    }
    const { lx, lz } = worldToIslandLocal(isl.id, wx, wz);
    if (isBoatBlockedLocal(layout, lx, lz)) return true;
  }
  return false;
}

export function resolveBoatWorldPosition(
  prevX: number,
  prevZ: number,
  nextX: number,
  nextZ: number
): { x: number; z: number } {
  if (!isBoatBlockedWorld(nextX, nextZ)) return { x: nextX, z: nextZ };
  if (!isBoatBlockedWorld(nextX, prevZ)) return { x: nextX, z: prevZ };
  if (!isBoatBlockedWorld(prevX, nextZ)) return { x: prevX, z: nextZ };
  return { x: prevX, z: prevZ };
}

export function resolveBoatPosition(
  prevX: number,
  prevZ: number,
  nextX: number,
  nextZ: number,
  _activeIslandId = 'moosewood'
): { x: number; z: number } {
  return resolveBoatWorldPosition(prevX, prevZ, nextX, nextZ);
}

export function findNearestDisembarkPoint(
  bx: number,
  bz: number,
  maxRadius = 11.5
): { x: number; z: number; groundY: number; islandId: string } | null {
  let bestPoint: { x: number; z: number; groundY: number; islandId: string } | null = null;
  let bestDistSq = maxRadius * maxRadius;

  for (const isl of FISCH_ISLANDS) {
    const layout = getIslandLayout(isl.id);
    if (Math.hypot(bx - isl.worldCoords.x, bz - isl.worldCoords.z) > layout.activeRadius + maxRadius) {
      continue;
    }
    const { lx, lz } = worldToIslandLocal(isl.id, bx, bz);

    // Sample radial ring around boat in local space to find closest walkable pier or shore point
    for (let r = 1.6; r <= maxRadius; r += 1.2) {
      for (let step = 0; step < 16; step += 1) {
        const ang = (step / 16) * Math.PI * 2;
        const testLx = lx + Math.cos(ang) * r;
        const testLz = lz + Math.sin(ang) * r;
        if (isWalkablePosition(testLx, testLz, isl.id)) {
          const wp = islandLocalToWorld(isl.id, testLx, testLz);
          const d2 = (wp.x - bx) ** 2 + (wp.z - bz) ** 2;
          if (d2 < bestDistSq) {
            bestDistSq = d2;
            bestPoint = {
              x: wp.x,
              z: wp.z,
              groundY: getGroundHeightAt(isl.id, testLx, testLz),
              islandId: isl.id,
            };
          }
        }
      }
      if (bestPoint) break;
    }
  }

  return bestPoint;
}

export function computeBobberTargetPosition(
  playerX: number,
  playerZ: number,
  playerYaw: number,
  castPower: number
): { x: number; z: number } {
  // Always cast strictly along the player's actual facing vector (sin(yaw), cos(yaw))
  const dirX = Math.sin(playerYaw);
  const dirZ = Math.cos(playerYaw);
  let dist = 5.5 + castPower * 10.5;
  let targetX = playerX + dirX * dist;
  let targetZ = playerZ + dirZ * dist;

  // If the cast distance happens to land over ANY island/bridge/pier terrain, extend along the SAME ray until hitting open water
  while (isWalkableWorldPosition(targetX, targetZ) && dist < 44) {
    dist += 1.5;
    targetX = playerX + dirX * dist;
    targetZ = playerZ + dirZ * dist;
  }

  return { x: targetX, z: targetZ };
}

// ============================================================
// Procedural Canvas Textures (Zero 404 External Assets)
// ============================================================

export function createWoodPlankTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8C623E';
  ctx.fillRect(0, 0, 256, 256);

  const plankHeight = 32;
  for (let row = 0; row < 8; row += 1) {
    const y = row * plankHeight;
    const shade = (row % 3) * 8 - 8;
    ctx.fillStyle = `rgb(${138 + shade}, ${96 + Math.round(shade * 0.7)}, ${60 + Math.round(shade * 0.5)})`;
    ctx.fillRect(0, y + 1, 256, plankHeight - 2);

    ctx.strokeStyle = 'rgba(55, 32, 16, 0.24)';
    ctx.lineWidth = 1.2;
    for (let g = 0; g < 6; g += 1) {
      const gy = y + 4 + ((g * 5 + row * 3) % (plankHeight - 6));
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.bezierCurveTo(85, gy + (g % 2 === 0 ? 2 : -2), 170, gy + (g % 2 === 0 ? -2 : 2), 256, gy);
      ctx.stroke();
    }

    ctx.fillStyle = '#3E2514';
    ctx.fillRect(0, y, 256, 2);

    const jointX = ((row * 97 + 44) % 210) + 20;
    ctx.fillRect(jointX, y, 2, plankHeight);

    ctx.fillStyle = '#2B2F36';
    ctx.fillRect(jointX - 6, y + 6, 3, 3);
    ctx.fillRect(jointX - 6, y + plankHeight - 9, 3, 3);
    ctx.fillRect(jointX + 5, y + 6, 3, 3);
    ctx.fillRect(jointX + 5, y + plankHeight - 9, 3, 3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 6);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createGroundStoneTexture(
  baseHex: string,
  accentHex: string,
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 180; i += 1) {
    const x = (i * 73) % 256;
    const y = (i * 137) % 256;
    const size = 4 + (i % 5) * 3;
    ctx.fillStyle = i % 3 === 0 ? accentHex : 'rgba(255,255,255,0.06)';
    ctx.globalAlpha = i % 3 === 0 ? 0.28 : 0.35;
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createRobloxFaceTexture(variant: 'player' | 'npc' | 'merlin'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = variant === 'merlin' ? '#F3D2B3' : '#FAD7A0';
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = '#18222D';
  ctx.beginPath();
  ctx.ellipse(44, 52, 6, 9, 0, 0, Math.PI * 2);
  ctx.ellipse(84, 52, 6, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(46, 48, 2.2, 0, Math.PI * 2);
  ctx.arc(86, 48, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = variant === 'merlin' ? '#CBD5E1' : '#3B2C1D';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(35, 36);
  ctx.lineTo(52, 34);
  ctx.moveTo(76, 34);
  ctx.lineTo(93, 36);
  ctx.stroke();

  ctx.strokeStyle = '#18222D';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(64, 68, 19, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  if (variant === 'merlin') {
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.moveTo(36, 90);
    ctx.lineTo(92, 90);
    ctx.lineTo(64, 126);
    ctx.closePath();
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createNameplateSprite(
  title: string,
  subtitle: string,
  accentHex: string
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 320, 96);

  ctx.fillStyle = 'rgba(7, 23, 34, 0.86)';
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(10, 10, 300, 76, 18);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#F7F6F1';
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
  ctx.fillText(title, 160, 44);

  ctx.fillStyle = accentHex;
  ctx.font = '600 18px system-ui, -apple-system, sans-serif';
  ctx.fillText(subtitle, 160, 72);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(2.8, 0.84, 1);
  return sprite;
}

export function createRadialContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
  grad.addColorStop(0, 'rgba(4, 12, 18, 0.55)');
  grad.addColorStop(0.65, 'rgba(4, 12, 18, 0.22)');
  grad.addColorStop(1, 'rgba(4, 12, 18, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
