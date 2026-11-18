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

const BASE_NPC_SPAWNS: FischNpcSpawn[] = [
  {
    id: 'npc_merchant',
    role: 'merchant',
    name: 'Pak Marlow',
    subtitle: 'Pedagang Dermaga Moosewood',
    dialogue: 'Bawa hasil pancingmu untuk ditukar dengan C$ atau tingkatkan joran dan umpanmu di sini.',
    targetTab: 'merchant',
    x: -10.6,
    z: -2.4,
    yaw: 0.45,
    shirtHex: '#876B3A',
    accentHex: '#F6C453',
    hatStyle: 'captain_cap',
    stallStyle: 'timber_awning',
  },
  {
    id: 'npc_appraiser',
    role: 'appraiser',
    name: 'Nona Clara',
    subtitle: 'Ahli Timbang Moosewood',
    dialogue: 'Timbangan saya siap menguji bobot dan peluang Mutasi atau Shiny ikan tangkapanmu.',
    targetTab: 'appraiser',
    x: -13.8,
    z: -10.2,
    yaw: 0.68,
    shirtHex: '#267472',
    accentHex: '#82AAA1',
    hatStyle: 'straw',
    tableStyle: 'brass_scale',
  },
  {
    id: 'npc_angler',
    role: 'angler',
    name: 'The Angler',
    subtitle: 'Pesanan Ikan Harian',
    dialogue: 'Aku punya daftar tangkapan harian segar dengan bayaran C$ serta paket umpan langka!',
    targetTab: 'angler',
    x: 10.2,
    z: -2.2,
    yaw: -0.48,
    shirtHex: '#2B6CB0',
    accentHex: '#63B3ED',
    hatStyle: 'captain_cap',
  },
  {
    id: 'npc_merlin',
    role: 'merlin',
    name: 'Merlin',
    subtitle: 'Relic, Totem & Luck Boost',
    dialogue: 'Sihir kuno kepulauan ini bisa membangkitkan keberuntunganmu dengan Enchant Relic dan Totem.',
    targetTab: 'merlin',
    x: 13.8,
    z: -10.0,
    yaw: -0.68,
    shirtHex: '#5B21B6',
    accentHex: '#B794F4',
  },
  {
    id: 'npc_altar',
    role: 'altar',
    name: "Keeper's Altar",
    subtitle: 'Enchant Rod (Malam)',
    dialogue: 'Saat langit gelap turun, persembahkan 1 Enchant Relic untuk memberkati joranmu.',
    targetTab: 'altar',
    x: 0,
    z: -17.6,
    yaw: 0,
    shirtHex: '#4C1D95',
    accentHex: '#C084FC',
  },
  {
    id: 'npc_quest',
    role: 'quest',
    name: 'Penjaga Pulau',
    subtitle: 'Misi Cerita Nusantara',
    dialogue: 'Selesaikan ekspedisi pulau untuk membuka joran legendaris dan bonus C$ berlimpah!',
    targetTab: 'quest',
    x: -4.4,
    z: 3.4,
    yaw: 0.95,
    shirtHex: '#2A7B4F',
    accentHex: '#5EC48B',
    hatStyle: 'straw',
  },
  {
    id: 'npc_shipwright',
    role: 'shipwright',
    name: 'Tukang Kapal',
    subtitle: 'Galangan & Beli Kapal',
    dialogue: 'Ingin berlayar ke pulau lain? Naik kapal di sisi kiri dermaga [B] atau upgrade armada kapalmu di sini!',
    targetTab: 'shipwright',
    x: 5.0,
    z: 14.3,
    yaw: -0.82,
    shirtHex: '#9A442C',
    accentHex: '#FBBF24',
    hatStyle: 'captain_cap',
  },
];

export const FISCH_NPC_SPAWNS: FischNpcSpawn[] = BASE_NPC_SPAWNS;

export function getIslandNpcSpawns(islandId: string): FischNpcSpawn[] {
  const persona = ISLAND_NPC_PERSONAS[islandId] ?? ISLAND_NPC_PERSONAS.moosewood;
  return BASE_NPC_SPAWNS.map((npc) => {
    if (npc.role === 'merchant') {
      return {
        ...npc,
        name: persona.merchant.name,
        subtitle: persona.merchant.subtitle,
        dialogue: persona.merchant.dialogue,
        shirtHex: persona.merchant.shirtHex,
        accentHex: persona.merchant.accentHex,
        hatStyle: persona.merchant.hatStyle,
        stallStyle: persona.merchant.stallStyle,
      };
    }
    if (npc.role === 'appraiser') {
      return {
        ...npc,
        name: persona.appraiser.name,
        subtitle: persona.appraiser.subtitle,
        dialogue: persona.appraiser.dialogue,
        shirtHex: persona.appraiser.shirtHex,
        accentHex: persona.appraiser.accentHex,
        hatStyle: persona.appraiser.hatStyle,
        tableStyle: persona.appraiser.tableStyle,
      };
    }
    return npc;
  });
}

export const DEFAULT_MOORED_BOAT_POS = { x: -9.6, z: 15.0, yaw: 0 };

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

export function isOnWoodenPier(x: number, z: number): boolean {
  // Extended main pier from plaza edge (z = 1.2) out over water (z = 16.4)
  if (Math.abs(x) <= 2.75 && z >= 1.2 && z <= 16.4) {
    return true;
  }
  // Wide T-head harbor dock at end of pier
  if (Math.abs(x) <= 6.8 && z >= 13.0 && z <= 16.6) {
    return true;
  }
  return false;
}

export function getGroundHeightAt(islandId: string, x: number, z: number): number {
  if (isOnWoodenPier(x, z)) {
    return 0.96;
  }

  // Enlarged island plaza & tiered shoreline plateau centered around (0, -9.5)
  const dx = x / 22.0;
  const dz = (z + 9.5) / 14.8;
  const radial = Math.sqrt(dx * dx + dz * dz);

  if (radial <= 1.06) {
    const gentleSlope = Math.max(0, 1 - radial) * 0.65;
    const islandExtra =
      islandId === 'roslit_volcano'
        ? Math.max(0, 1 - Math.hypot(x / 14, (z + 15.5) / 8)) * 1.05
        : islandId === 'sunstone' || islandId === 'snowcap' || islandId === 'sovereignty'
        ? Math.max(0, 1 - Math.hypot(x / 15, (z + 14) / 8)) * 0.68
        : 0;
    return 0.74 + gentleSlope + islandExtra;
  }

  // Shallow sandy/rocky coastal reef slope
  if (radial <= 1.28) {
    const t = (radial - 1.06) / 0.22;
    return THREE.MathUtils.lerp(0.74, -0.38, t);
  }

  return -0.8;
}

export function isWalkablePosition(x: number, z: number): boolean {
  if (isOnWoodenPier(x, z)) return true;
  const dx = x / 21.8;
  const dz = (z + 9.5) / 14.6;
  return dx * dx + dz * dz <= 1.02;
}

export function clampPlayerPosition(
  islandId: string,
  prevX: number,
  prevZ: number,
  nextX: number,
  nextZ: number
): { x: number; z: number; groundY: number } {
  if (isWalkablePosition(nextX, nextZ)) {
    return {
      x: nextX,
      z: nextZ,
      groundY: getGroundHeightAt(islandId, nextX, nextZ),
    };
  }
  if (isWalkablePosition(nextX, prevZ)) {
    return {
      x: nextX,
      z: prevZ,
      groundY: getGroundHeightAt(islandId, nextX, prevZ),
    };
  }
  if (isWalkablePosition(prevX, nextZ)) {
    return {
      x: prevX,
      z: nextZ,
      groundY: getGroundHeightAt(islandId, prevX, nextZ),
    };
  }
  return {
    x: prevX,
    z: prevZ,
    groundY: getGroundHeightAt(islandId, prevX, prevZ),
  };
}

export function findNearestNpc(
  x: number,
  z: number,
  maxDistance = 3.6,
  spawns: FischNpcSpawn[] = FISCH_NPC_SPAWNS
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

export function isBoatBlocked(
  x: number,
  z: number,
  activeIslandId = 'moosewood'
): boolean {
  // World ocean bounds inside 440x440 water plane
  if (Math.abs(x) > 195 || z < -160 || z > 175) return true;
  // Main wooden pier + mooring clearance
  if (Math.abs(x) <= 4.0 && z >= 0 && z <= 17.8) return true;
  if (Math.abs(x) <= 7.8 && z >= 11.8 && z <= 18.0) return true;
  // Main enlarged island plateau ellipse with boat hull margin
  const dx = x / 24.4;
  const dz = (z + 9.5) / 17.4;
  if (dx * dx + dz * dz <= 1.0) return true;
  // Neighbor harbor island core collision cylinders
  const beacons = getNeighborHarborBeacons(activeIslandId);
  for (const beacon of beacons) {
    if (Math.hypot(x - beacon.x, z - beacon.z) < 8.6) {
      return true;
    }
  }
  return false;
}

export function resolveBoatPosition(
  prevX: number,
  prevZ: number,
  nextX: number,
  nextZ: number,
  activeIslandId = 'moosewood'
): { x: number; z: number } {
  if (!isBoatBlocked(nextX, nextZ, activeIslandId)) return { x: nextX, z: nextZ };
  if (!isBoatBlocked(nextX, prevZ, activeIslandId)) return { x: nextX, z: prevZ };
  if (!isBoatBlocked(prevX, nextZ, activeIslandId)) return { x: prevX, z: nextZ };
  return { x: prevX, z: prevZ };
}

export function findNearestHarborBeacon(
  x: number,
  z: number,
  activeIslandId = 'moosewood',
  maxDistance = 17.5
): FischHarborBeacon | null {
  let closest: FischHarborBeacon | null = null;
  let bestD2 = maxDistance * maxDistance;
  const beacons = getNeighborHarborBeacons(activeIslandId);
  for (const b of beacons) {
    const d2 = (b.x - x) * (b.x - x) + (b.z - z) * (b.z - z);
    if (d2 <= bestD2) {
      bestD2 = d2;
      closest = b;
    }
  }
  return closest;
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

  // If the cast distance happens to land over island/pier terrain, extend along the SAME ray until hitting open water
  while (isWalkablePosition(targetX, targetZ) && dist < 44) {
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

    // Subtle wood grain streaks
    ctx.strokeStyle = 'rgba(55, 32, 16, 0.24)';
    ctx.lineWidth = 1.2;
    for (let g = 0; g < 6; g += 1) {
      const gy = y + 4 + ((g * 5 + row * 3) % (plankHeight - 6));
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.bezierCurveTo(85, gy + (g % 2 === 0 ? 2 : -2), 170, gy + (g % 2 === 0 ? -2 : 2), 256, gy);
      ctx.stroke();
    }

    // Plank seam
    ctx.fillStyle = '#3E2514';
    ctx.fillRect(0, y, 256, 2);

    // Vertical seam staggered
    const jointX = ((row * 97 + 44) % 210) + 20;
    ctx.fillRect(jointX, y, 2, plankHeight);

    // Nail heads
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

  // Subtle stylized Roblox grass/stone speckles
  for (let i = 0; i < 180; i += 1) {
    const x = ((i * 73) % 256);
    const y = ((i * 137) % 256);
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
  tex.repeat.set(5, 5);
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

  // Classic friendly Roblox eyes
  ctx.fillStyle = '#18222D';
  ctx.beginPath();
  ctx.ellipse(44, 52, 6, 9, 0, 0, Math.PI * 2);
  ctx.ellipse(84, 52, 6, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(46, 48, 2.2, 0, Math.PI * 2);
  ctx.arc(86, 48, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = variant === 'merlin' ? '#CBD5E1' : '#3B2C1D';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(35, 36);
  ctx.lineTo(52, 34);
  ctx.moveTo(76, 34);
  ctx.lineTo(93, 36);
  ctx.stroke();

  // Smile
  ctx.strokeStyle = '#18222D';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(64, 68, 19, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  // Merlin beard accent
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

  // Rounded dark maritime plate
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
