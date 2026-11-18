import * as THREE from 'three';

export const WATER_BASE_Y = 0;

export type FischNpcRole = 'merchant' | 'appraiser' | 'angler' | 'merlin' | 'altar' | 'quest';

export interface FischNpcSpawn {
  id: string;
  role: FischNpcRole;
  name: string;
  subtitle: string;
  targetTab: 'shop' | 'altar' | 'quests';
  x: number;
  z: number;
  yaw: number;
  shirtHex: string;
  accentHex: string;
}

export const FISCH_NPC_SPAWNS: FischNpcSpawn[] = [
  {
    id: 'npc_merchant',
    role: 'merchant',
    name: 'The Merchant',
    subtitle: 'Jual Ikan & Toko Rod',
    targetTab: 'shop',
    x: -5.6,
    z: -1.8,
    yaw: 0.45,
    shirtHex: '#876B3A',
    accentHex: '#F6C453',
  },
  {
    id: 'npc_appraiser',
    role: 'appraiser',
    name: 'Appraiser',
    subtitle: 'Ukur Berat & Mutasi',
    targetTab: 'altar',
    x: -7.8,
    z: -6.4,
    yaw: 0.72,
    shirtHex: '#267472',
    accentHex: '#82AAA1',
  },
  {
    id: 'npc_angler',
    role: 'angler',
    name: 'The Angler',
    subtitle: 'Pesanan Ikan Harian',
    targetTab: 'quests',
    x: 4.8,
    z: -1.6,
    yaw: -0.45,
    shirtHex: '#2B6CB0',
    accentHex: '#63B3ED',
  },
  {
    id: 'npc_merlin',
    role: 'merlin',
    name: 'Merlin',
    subtitle: 'Relic & Luck Boost',
    targetTab: 'altar',
    x: 7.4,
    z: -6.2,
    yaw: -0.68,
    shirtHex: '#5B21B6',
    accentHex: '#B794F4',
  },
  {
    id: 'npc_altar',
    role: 'altar',
    name: "Keeper's Altar",
    subtitle: 'Enchant Rod (Malam)',
    targetTab: 'altar',
    x: 0,
    z: -9.6,
    yaw: 0,
    shirtHex: '#4C1D95',
    accentHex: '#C084FC',
  },
  {
    id: 'npc_quest',
    role: 'quest',
    name: 'Penjaga Pulau',
    subtitle: 'Misi Cerita Pulau',
    targetTab: 'quests',
    x: -2.9,
    z: 3.4,
    yaw: 1.1,
    shirtHex: '#2A7B4F',
    accentHex: '#5EC48B',
  },
];

// Deterministic GPU-matching ocean wave function (matches GLSL vertex displacement)
export function waterHeightAt(x: number, z: number, timeSec: number): number {
  return (
    Math.sin(x * 0.42 + timeSec * 1.65) * 0.13 +
    Math.cos(z * 0.36 - timeSec * 1.25) * 0.1 +
    Math.sin((x + z) * 0.22 + timeSec * 0.95) * 0.055
  );
}

export function isOnWoodenPier(x: number, z: number): boolean {
  // Main pier extending from plaza edge (z = -0.2) out over water (z = 11.4)
  if (Math.abs(x) <= 2.35 && z >= -0.2 && z <= 11.4) {
    return true;
  }
  // T-head fishing platform at end of pier
  if (Math.abs(x) <= 4.8 && z >= 8.4 && z <= 11.6) {
    return true;
  }
  return false;
}

export function getGroundHeightAt(islandId: string, x: number, z: number): number {
  if (isOnWoodenPier(x, z)) {
    return 0.96;
  }

  // Main island plaza & shoreline plateau centered around (0, -6.5)
  const dx = x / 13.5;
  const dz = (z + 6.5) / 9.2;
  const radial = Math.sqrt(dx * dx + dz * dz);

  if (radial <= 1.08) {
    const gentleSlope = Math.max(0, 1 - radial) * 0.45;
    const islandExtra =
      islandId === 'roslit_volcano'
        ? Math.max(0, 1 - Math.hypot(x / 10, (z + 11.5) / 6)) * 0.85
        : islandId === 'sunstone' || islandId === 'snowcap'
        ? Math.max(0, 1 - Math.hypot(x / 11, (z + 10) / 6)) * 0.55
        : 0;
    return 0.72 + gentleSlope + islandExtra;
  }

  // Shallow sand/shore transition
  if (radial <= 1.28) {
    const t = (radial - 1.08) / 0.2;
    return THREE.MathUtils.lerp(0.72, -0.35, t);
  }

  return -0.8;
}

export function isWalkablePosition(x: number, z: number): boolean {
  if (isOnWoodenPier(x, z)) return true;
  const dx = x / 13.2;
  const dz = (z + 6.5) / 8.8;
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
  // Slide along X or Z independently for smooth wall/edge sliding
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
  maxDistance = 3.2
): FischNpcSpawn | null {
  let closest: FischNpcSpawn | null = null;
  let bestDistSq = maxDistance * maxDistance;

  for (const npc of FISCH_NPC_SPAWNS) {
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

export function computeBobberTargetPosition(
  playerX: number,
  playerZ: number,
  playerYaw: number,
  castPower: number
): { x: number; z: number } {
  const dist = 5.5 + castPower * 10.5;
  const dirX = Math.sin(playerYaw);
  const dirZ = Math.cos(playerYaw);
  let targetX = playerX + dirX * dist;
  let targetZ = playerZ + dirZ * dist;

  // If the cast lands inland behind the shore, project forward out into open water (+Z)
  if (isWalkablePosition(targetX, targetZ) || targetZ < 1.2) {
    targetX = playerX + dirX * 4.5;
    targetZ = Math.max(12.2, playerZ + 7.5 + castPower * 7.5);
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
