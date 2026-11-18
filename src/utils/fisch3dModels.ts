import * as THREE from 'three';
import {
  AppraiserTableStyle,
  FischBoat,
  FischIsland,
  FischRod,
  FischSpecies,
  MerchantStallStyle,
  NpcHatStyle,
} from './fischData';
import {
  createGroundStoneTexture,
  createNameplateSprite,
  createRadialContactShadowTexture,
  createRobloxFaceTexture,
  createWoodPlankTexture,
  FischNpcSpawn,
  getGroundHeightAt,
  getIslandNpcSpawns,
  getNeighborHarborBeacons,
} from './fisch3dWorld';

export interface RobloxAnglerRig {
  root: THREE.Group;
  bodyPivot: THREE.Group;
  torsoGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  rodGroup: THREE.Group;
  rodTipAnchor: THREE.Object3D;
  rodShaftMat: THREE.MeshStandardMaterial;
  rodAccentMat: THREE.MeshStandardMaterial;
  rodFlexSegments: THREE.Mesh[];
  contactShadow: THREE.Mesh;
  dispose: () => void;
}

export interface NpcActorHandle {
  spawn: FischNpcSpawn;
  group: THREE.Group;
  hitboxMesh: THREE.Mesh;
  ringMesh: THREE.Mesh;
  ringMat: THREE.MeshBasicMaterial;
  crystalMesh?: THREE.Mesh;
  baseY: number;
}

export interface FischBoat3DHandle {
  root: THREE.Group;
  hullGroup: THREE.Group;
  seatAnchor: THREE.Object3D;
  wakeAnchor: THREE.Object3D;
  dispose: () => void;
}

export interface IslandEnvironmentHandle {
  group: THREE.Group;
  npcActors: NpcActorHandle[];
  auroraRibbon: THREE.Mesh;
  auroraMat: THREE.MeshBasicMaterial;
  starPoints: THREE.Points;
  lanternLights: THREE.PointLight[];
  lanternGlassMats: THREE.MeshStandardMaterial[];
  fishSchoolMesh: THREE.InstancedMesh;
  update: (timeSec: number, dt: number, isNight: boolean, auroraActive: boolean) => void;
  dispose: () => void;
}

export function disposeObject3DTree(root: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  root.traverse((obj) => {
    const anyObj = obj as THREE.Mesh & THREE.Sprite & THREE.Points & THREE.Line;
    if (anyObj.geometry) {
      geometries.add(anyObj.geometry);
    }
    if (anyObj.material) {
      const matList = Array.isArray(anyObj.material) ? anyObj.material : [anyObj.material];
      for (const m of matList) {
        materials.add(m);
        const std = m as THREE.MeshStandardMaterial & THREE.SpriteMaterial;
        if (std.map) textures.add(std.map);
        if (std.roughnessMap) textures.add(std.roughnessMap);
        if (std.normalMap) textures.add(std.normalMap);
        if (std.emissiveMap) textures.add(std.emissiveMap);
      }
    }
  });

  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
  textures.forEach((t) => t.dispose());
}

// ============================================================
// 1. Articulated Roblox-Style Angler Avatar + Dynamic 3D Rod
// ============================================================

export function createRobloxAnglerRig(initialRod: FischRod): RobloxAnglerRig {
  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const skinMat = new THREE.MeshStandardMaterial({
    color: '#F5CBA7',
    roughness: 0.62,
    metalness: 0.02,
  });
  const faceTex = createRobloxFaceTexture('player');
  const headFrontMat = new THREE.MeshStandardMaterial({
    map: faceTex,
    roughness: 0.58,
    metalness: 0.02,
  });
  const shirtMat = new THREE.MeshStandardMaterial({
    color: '#1D6664',
    roughness: 0.72,
    metalness: 0.05,
  });
  const vestMat = new THREE.MeshStandardMaterial({
    color: '#D97736',
    roughness: 0.65,
    metalness: 0.08,
  });
  const buckleMat = new THREE.MeshStandardMaterial({
    color: '#EAB308',
    roughness: 0.24,
    metalness: 0.85,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: '#1E3A5F',
    roughness: 0.78,
    metalness: 0.04,
  });
  const bootMat = new THREE.MeshStandardMaterial({
    color: '#1A242D',
    roughness: 0.88,
    metalness: 0.05,
  });
  const hatMat = new THREE.MeshStandardMaterial({
    color: '#C7B99E',
    roughness: 0.8,
    metalness: 0.04,
  });
  const hatBandMat = new THREE.MeshStandardMaterial({
    color: '#267472',
    roughness: 0.48,
    metalness: 0.15,
  });

  // Left & Right Legs (bottom-center pivot at hip y = 0.76, sole at y = 0)
  const makeLeg = (xOffset: number) => {
    const legPivot = new THREE.Group();
    legPivot.position.set(xOffset, 0.76, 0);
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.56, 0.36), pantsMat);
    upper.position.y = -0.28;
    upper.castShadow = true;
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.2, 0.4), bootMat);
    boot.position.set(0, -0.66, 0.02);
    boot.castShadow = true;
    legPivot.add(upper, boot);
    return legPivot;
  };
  const leftLegPivot = makeLeg(-0.2);
  const rightLegPivot = makeLeg(0.2);
  bodyPivot.add(leftLegPivot, rightLegPivot);

  // Torso Group (1.12 center, 0.74 tall)
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 1.14, 0);
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.76, 0.42), shirtMat);
  torso.castShadow = true;
  torsoGroup.add(torso);

  // Maritime life-vest harness + brass buckle
  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.5, 0.46), vestMat);
  vest.position.y = 0.06;
  vest.castShadow = true;
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.49), buckleMat);
  buckle.position.set(0, 0.02, 0.01);
  // Tackle backpack
  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.52, 0.22), hatMat);
  backpack.position.set(0, 0.04, -0.32);
  backpack.castShadow = true;
  torsoGroup.add(vest, buckle, backpack);
  bodyPivot.add(torsoGroup);

  // Head + Bucket Hat
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.82, 0);
  const headMats = [skinMat, skinMat, skinMat, skinMat, headFrontMat, skinMat];
  const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.58, 0.58), headMats);
  headMesh.castShadow = true;

  const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.56, 0.06, 16), hatMat);
  hatBrim.position.y = 0.26;
  hatBrim.castShadow = true;
  const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.37, 0.24, 16), hatMat);
  hatCrown.position.y = 0.39;
  hatCrown.castShadow = true;
  const hatBand = new THREE.Mesh(new THREE.CylinderGeometry(0.375, 0.375, 0.06, 16), hatBandMat);
  hatBand.position.y = 0.31;
  headGroup.add(headMesh, hatBrim, hatCrown, hatBand);
  bodyPivot.add(headGroup);

  // Left & Right Arms (pivoted at shoulder)
  const makeArm = (xOffset: number) => {
    const armPivot = new THREE.Group();
    armPivot.position.set(xOffset, 1.44, 0);
    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.46, 0.3), shirtMat);
    sleeve.position.y = -0.2;
    sleeve.castShadow = true;
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.28), skinMat);
    hand.position.y = -0.54;
    hand.castShadow = true;
    armPivot.add(sleeve, hand);
    return armPivot;
  };
  const leftArmPivot = makeArm(-0.56);
  const rightArmPivot = makeArm(0.56);
  bodyPivot.add(leftArmPivot, rightArmPivot);

  // 3D Fishing Rod attached to right hand
  const rodGroup = new THREE.Group();
  rodGroup.position.set(0, -0.58, 0.14);
  rodGroup.rotation.x = Math.PI * 0.26;
  rightArmPivot.add(rodGroup);

  const rodHandleMat = new THREE.MeshStandardMaterial({
    color: '#5C3A21',
    roughness: 0.85,
    metalness: 0.04,
  });
  const rodReelMat = new THREE.MeshStandardMaterial({
    color: '#D4AF37',
    roughness: 0.2,
    metalness: 0.88,
  });
  const rodShaftMat = new THREE.MeshStandardMaterial({
    color: initialRod.colorHex,
    roughness: 0.35,
    metalness: 0.28,
  });
  const rodAccentMat = new THREE.MeshStandardMaterial({
    color: initialRod.accentHex,
    emissive: initialRod.accentHex,
    emissiveIntensity: 0.25,
    roughness: 0.25,
    metalness: 0.65,
  });

  const handleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.46, 10), rodHandleMat);
  handleMesh.rotation.x = Math.PI / 2;
  handleMesh.position.z = 0.12;

  const reelBody = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 12), rodReelMat);
  reelBody.rotation.z = Math.PI / 2;
  reelBody.position.set(0.06, -0.05, 0.28);

  const rodFlexSegments: THREE.Mesh[] = [];
  let parentNode: THREE.Object3D = rodGroup;
  let lastZ = 0.35;
  for (let i = 0; i < 4; i += 1) {
    const segLen = 0.56;
    const rBottom = 0.036 - i * 0.0065;
    const rTop = 0.03 - i * 0.0065;
    const segPivot = new THREE.Group();
    segPivot.position.set(0, 0, lastZ);
    const segMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(rTop, rBottom, segLen, 8),
      rodShaftMat
    );
    segMesh.rotation.x = Math.PI / 2;
    segMesh.position.z = segLen * 0.5;
    segMesh.castShadow = true;

    const ringGuide = new THREE.Mesh(new THREE.TorusGeometry(rTop + 0.018, 0.007, 6, 12), rodAccentMat);
    ringGuide.position.set(0, -rTop - 0.012, segLen * 0.88);

    segPivot.add(segMesh, ringGuide);
    parentNode.add(segPivot);
    rodFlexSegments.push(segPivot as unknown as THREE.Mesh);
    parentNode = segPivot;
    lastZ = segLen;
  }

  const rodTipAnchor = new THREE.Object3D();
  rodTipAnchor.position.set(0, 0, 0.56);
  parentNode.add(rodTipAnchor);

  rodGroup.add(handleMesh, reelBody);

  // Soft contact shadow directly under player
  const shadowTex = createRadialContactShadowTexture();
  const contactShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.45, 1.45),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
    })
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.025;
  root.add(contactShadow);

  return {
    root,
    bodyPivot,
    torsoGroup,
    headGroup,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot,
    rightLegPivot,
    rodGroup,
    rodTipAnchor,
    rodShaftMat,
    rodAccentMat,
    rodFlexSegments,
    contactShadow,
    dispose: () => disposeObject3DTree(root),
  };
}

export function animateRobloxAngler(
  rig: RobloxAnglerRig,
  params: {
    timeSec: number;
    moveSpeedRatio: number;
    isGrounded: boolean;
    isSeated?: boolean;
    phase: 'idle' | 'charging' | 'casting' | 'waiting' | 'biting' | 'reeling';
    castPower: number;
    celebratingTimer: number;
    reelOnTarget: boolean;
  }
): void {
  const { timeSec, moveSpeedRatio, isGrounded, isSeated = false, phase, castPower, celebratingTimer, reelOnTarget } = params;

  const isWalking = !isSeated && moveSpeedRatio > 0.06 && isGrounded;
  const walkSwing = isWalking ? Math.sin(timeSec * 10.5) * 0.65 * moveSpeedRatio : 0;

  // Legs
  if (isSeated) {
    rig.leftLegPivot.rotation.x = -1.32;
    rig.rightLegPivot.rotation.x = -1.32;
  } else if (!isGrounded) {
    rig.leftLegPivot.rotation.x = 0.35;
    rig.rightLegPivot.rotation.x = -0.25;
  } else {
    rig.leftLegPivot.rotation.x = walkSwing;
    rig.rightLegPivot.rotation.x = -walkSwing;
  }

  // Body subtle bob
  rig.bodyPivot.position.y = isSeated
    ? -0.35
    : isWalking
    ? Math.abs(Math.sin(timeSec * 10.5)) * 0.07
    : Math.sin(timeSec * 2.2) * 0.02;

  // Contact shadow fade on jump / when seated inside boat
  const shadowMat = rig.contactShadow.material as THREE.MeshBasicMaterial;
  shadowMat.opacity = isSeated ? 0 : isGrounded ? 0.48 : 0.2;

  // Arms & Rod flex based on fishing state
  let targetRightArmX = -walkSwing * 0.85;
  let targetLeftArmX = walkSwing * 0.85;
  let targetLeftArmZ = 0.06;
  let rodPitch = Math.PI * 0.25;
  let rodBend = 0.03;

  if (celebratingTimer > 0) {
    targetLeftArmX = -2.45;
    targetRightArmX = -2.45;
    targetLeftArmZ = 0.35;
    rodPitch = 0.3;
  } else if (phase === 'charging') {
    targetRightArmX = -1.35 - castPower * 0.55;
    rodPitch = 0.25;
    rodBend = 0.05;
  } else if (phase === 'casting') {
    targetRightArmX = 0.65;
    rodPitch = 0.65;
    rodBend = 0.08;
  } else if (phase === 'waiting') {
    targetRightArmX = -0.58 + Math.sin(timeSec * 2.0) * 0.04;
    rodPitch = 0.48;
    rodBend = 0.05;
  } else if (phase === 'biting') {
    targetRightArmX = -0.45 + Math.sin(timeSec * 24) * 0.14;
    rodPitch = 0.62;
    rodBend = 0.2;
  } else if (phase === 'reeling') {
    const tug = Math.sin(timeSec * (reelOnTarget ? 10 : 18)) * 0.12;
    targetRightArmX = -0.82 + tug;
    targetLeftArmX = -0.65 - tug * 0.5;
    rodPitch = 0.52;
    rodBend = reelOnTarget ? 0.17 : 0.24;
  } else {
    targetRightArmX = -0.18 + walkSwing * 0.7;
  }

  rig.rightArmPivot.rotation.x = THREE.MathUtils.lerp(rig.rightArmPivot.rotation.x, targetRightArmX, 0.22);
  rig.leftArmPivot.rotation.x = THREE.MathUtils.lerp(rig.leftArmPivot.rotation.x, targetLeftArmX, 0.22);
  rig.leftArmPivot.rotation.z = THREE.MathUtils.lerp(rig.leftArmPivot.rotation.z, targetLeftArmZ, 0.2);
  rig.rodGroup.rotation.x = THREE.MathUtils.lerp(rig.rodGroup.rotation.x, rodPitch, 0.22);

  for (let i = 0; i < rig.rodFlexSegments.length; i += 1) {
    rig.rodFlexSegments[i].rotation.x = THREE.MathUtils.lerp(
      rig.rodFlexSegments[i].rotation.x,
      rodBend * (i + 1) * 0.45,
      0.22
    );
  }
}

// ============================================================
// 2. Interactive 3D NPCs, Island Headgear, Custom Stalls & Keeper's Altar
// ============================================================

function attachNpcHat(
  group: THREE.Group,
  hatStyle: NpcHatStyle | undefined,
  shirtMat: THREE.MeshStandardMaterial,
  accentMat: THREE.MeshStandardMaterial
): void {
  const timberMat = new THREE.MeshStandardMaterial({ color: '#5C3A21', roughness: 0.85 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.75 });

  switch (hatStyle) {
    case 'captain_cap': {
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.33, 0.2, 12), shirtMat);
      crown.position.set(0, 2.16, 0);
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.28), timberMat);
      visor.position.set(0, 2.08, 0.28);
      const badge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.06), accentMat);
      badge.position.set(0, 2.18, 0.34);
      group.add(crown, visor, badge);
      break;
    }
    case 'straw': {
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.6, 0.06, 16), accentMat);
      brim.position.set(0, 2.07, 0);
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.22, 14), accentMat);
      crown.position.set(0, 2.2, 0);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 14), shirtMat);
      band.position.set(0, 2.12, 0);
      group.add(brim, crown, band);
      break;
    }
    case 'coral_crown': {
      [-0.18, 0, 0.18].forEach((hx, idx) => {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.36 + (idx === 1 ? 0.12 : 0), 6), accentMat);
        horn.position.set(hx, 2.2, 0.12);
        horn.rotation.z = -hx * 1.1;
        group.add(horn);
      });
      break;
    }
    case 'mushroom_cap': {
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.36, 12), accentMat);
      cap.position.set(0, 2.22, 0);
      const spotL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), whiteMat);
      spotL.position.set(-0.22, 2.24, 0.18);
      const spotR = spotL.clone();
      spotR.position.set(0.2, 2.26, 0.16);
      group.add(cap, spotL, spotR);
      break;
    }
    case 'forge_visor': {
      const dome = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.26, 0.64), shirtMat);
      dome.position.set(0, 2.12, 0);
      const visorGlow = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.08), accentMat);
      visorGlow.position.set(0, 1.9, 0.31);
      group.add(dome, visorGlow);
      break;
    }
    case 'fur_hood': {
      const hood = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.64, 0.62), shirtMat);
      hood.position.set(0, 1.84, -0.04);
      const furTrim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.09, 8, 14), whiteMat);
      furTrim.position.set(0, 1.84, 0.24);
      group.add(hood, furTrim);
      break;
    }
    case 'sun_turban': {
      const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.14, 10, 16), accentMat);
      wrap.rotation.x = Math.PI / 2;
      wrap.position.set(0, 2.12, 0);
      const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), shirtMat);
      jewel.position.set(0, 2.16, 0.36);
      group.add(wrap, jewel);
      break;
    }
    case 'laurel': {
      const wreath = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.055, 8, 16), accentMat);
      wreath.rotation.x = Math.PI / 2 - 0.15;
      wreath.position.set(0, 2.08, 0);
      group.add(wreath);
      break;
    }
    case 'diving_helm': {
      const bronzeMat = new THREE.MeshStandardMaterial({ color: '#B48A3E', roughness: 0.28, metalness: 0.85 });
      const helm = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), bronzeMat);
      helm.position.set(0, 1.84, 0);
      const porthole = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 12), accentMat);
      porthole.rotation.x = Math.PI / 2;
      porthole.position.set(0, 1.84, 0.36);
      group.add(helm, porthole);
      break;
    }
    case 'tricorn': {
      const darkLeather = new THREE.MeshStandardMaterial({ color: '#291D18', roughness: 0.78 });
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.22, 8), darkLeather);
      crown.position.set(0, 2.14, 0);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.06, 3), darkLeather);
      brim.position.set(0, 2.06, 0);
      const trim = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.03, 3), accentMat);
      trim.position.set(0, 2.09, 0);
      group.add(crown, brim, trim);
      break;
    }
    case 'pith_helmet': {
      const khaki = new THREE.MeshStandardMaterial({ color: '#D6C7A2', roughness: 0.78 });
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.54, 0.06, 14), khaki);
      brim.position.set(0, 2.08, 0);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), khaki);
      dome.position.set(0, 2.08, 0);
      group.add(brim, dome);
      break;
    }
    case 'abyss_hood': {
      const cowl = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.62, 8), shirtMat);
      cowl.position.set(0, 2.18, -0.02);
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), accentMat);
      gem.position.set(0, 2.12, 0.34);
      group.add(cowl, gem);
      break;
    }
    default: {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 0.16, 12), accentMat);
      cap.position.set(0, 2.1, 0);
      group.add(cap);
    }
  }
}

function buildMerchantStall(
  style: MerchantStallStyle | undefined,
  accentMat: THREE.MeshStandardMaterial
): THREE.Group {
  const stall = new THREE.Group();
  const baseMat = new THREE.MeshStandardMaterial({
    color:
      style === 'lava_forge'
        ? '#2A1D1B'
        : style === 'ice_igloo'
        ? '#E0F2FE'
        : style === 'marble_arch'
        ? '#CBD5E1'
        : style === 'crystal_shrine'
        ? '#1E293B'
        : '#7C5333',
    roughness: style === 'ice_igloo' ? 0.35 : 0.85,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    color:
      style === 'coral_tiki'
        ? '#D97706'
        : style === 'moss_booth'
        ? '#166534'
        : style === 'lava_forge'
        ? '#7C2D12'
        : style === 'ice_igloo'
        ? '#7DD3FC'
        : style === 'sun_gazebo'
        ? '#F59E0B'
        : style === 'marble_arch'
        ? '#E2E8F0'
        : style === 'bathysphere_counter'
        ? '#0E7490'
        : style === 'pirate_bar'
        ? '#451A03'
        : style === 'amber_pavilion'
        ? '#065F46'
        : style === 'crystal_shrine'
        ? '#312E81'
        : '#267472',
    roughness: 0.65,
  });

  // Counter Base
  const counter = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.92, 0.95), baseMat);
  counter.position.set(0, 0.46, 0);
  counter.castShadow = true;
  counter.receiveShadow = true;
  stall.add(counter);

  // Corner Support Posts
  [-0.98, 0.98].forEach((px) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 2.45, 8), baseMat);
    post.position.set(px, 1.22, -0.32);
    post.castShadow = true;
    stall.add(post);
  });

  // Biome-specific Roof / Canopy
  if (style === 'ice_igloo') {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.3, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), roofMat);
    dome.position.set(0, 2.25, -0.15);
    stall.add(dome);
  } else if (style === 'sun_gazebo' || style === 'amber_pavilion') {
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.65, 0.85, 6), roofMat);
    roof.position.set(0, 2.7, -0.1);
    roof.castShadow = true;
    stall.add(roof);
  } else {
    const awning = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.16, 1.45), roofMat);
    awning.position.set(0, 2.42, -0.05);
    awning.rotation.x = 0.16;
    awning.castShadow = true;
    stall.add(awning);
  }

  // Hanging Trade Emblem & Counter Prop
  const signGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), accentMat);
  signGem.position.set(0, 2.08, 0.52);
  const displayCrate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.42, 0.5), accentMat);
  displayCrate.position.set(-0.6, 1.13, 0.08);
  stall.add(signGem, displayCrate);

  return stall;
}

function buildAppraiserTable(
  style: AppraiserTableStyle | undefined,
  accentMat: THREE.MeshStandardMaterial
): { table: THREE.Group; crystal: THREE.Mesh } {
  const table = new THREE.Group();
  const baseMat = new THREE.MeshStandardMaterial({
    color:
      style === 'magma_anvil'
        ? '#291C1B'
        : style === 'frost_prism'
        ? '#93C5FD'
        : style === 'solar_astrolabe'
        ? '#92400E'
        : '#3F4A59',
    roughness: 0.72,
    metalness: style === 'brass_scale' || style === 'solar_astrolabe' ? 0.45 : 0.12,
  });

  const desk = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.62, 0.96, 10), baseMat);
  desk.position.set(0, 0.48, 0);
  desk.castShadow = true;
  desk.receiveShadow = true;
  table.add(desk);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.05, 8, 18), accentMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, 0.97, 0);
  table.add(rim);

  let crystalGeo: THREE.BufferGeometry = new THREE.IcosahedronGeometry(0.24, 0);
  if (style === 'brass_scale' || style === 'solar_astrolabe' || style === 'chest_compass') {
    crystalGeo = new THREE.TorusGeometry(0.24, 0.05, 8, 16);
  } else if (style === 'frost_prism' || style === 'rune_lectern') {
    crystalGeo = new THREE.OctahedronGeometry(0.26, 0);
  } else if (style === 'abyssal_orb' || style === 'pearl_basin') {
    crystalGeo = new THREE.SphereGeometry(0.24, 12, 10);
  } else if (style === 'magma_anvil' || style === 'fossil_desk') {
    crystalGeo = new THREE.BoxGeometry(0.34, 0.24, 0.34);
  }

  const crystal = new THREE.Mesh(crystalGeo, accentMat);
  crystal.position.set(0, 1.32, 0);
  crystal.castShadow = true;
  table.add(crystal);

  return { table, crystal };
}

export function createNpcActor(
  spawn: FischNpcSpawn,
  islandId: string,
  isNight: boolean
): NpcActorHandle {
  const group = new THREE.Group();
  const baseY = getGroundHeightAt(islandId, spawn.x, spawn.z);
  group.position.set(spawn.x, baseY, spawn.z);
  group.rotation.y = spawn.yaw;

  let crystalMesh: THREE.Mesh | undefined;

  if (spawn.role === 'altar') {
    // Keeper's Altar Monument (Stone pedestal + rune steps + floating purple crystal)
    const stoneMat = new THREE.MeshStandardMaterial({
      color: '#3F4A59',
      roughness: 0.86,
      metalness: 0.12,
    });
    const runeMat = new THREE.MeshStandardMaterial({
      color: '#7B3FE4',
      emissive: '#7B3FE4',
      emissiveIntensity: isNight ? 1.45 : 0.4,
      roughness: 0.28,
      metalness: 0.45,
    });
    const baseStep = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.2, 0.38, 8), stoneMat);
    baseStep.position.y = 0.19;
    baseStep.receiveShadow = true;
    baseStep.castShadow = true;

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.25, 1.45, 8), stoneMat);
    plinth.position.y = 1.1;
    plinth.castShadow = true;

    const runeRing = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.07, 8, 24), runeMat);
    runeRing.rotation.x = Math.PI / 2;
    runeRing.position.y = 1.88;

    crystalMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), runeMat);
    crystalMesh.position.y = 2.65;
    crystalMesh.castShadow = true;

    group.add(baseStep, plinth, runeRing, crystalMesh);
  } else {
    // Stylized Roblox NPC Character + Island-Specific Headwear & Custom Stall/Workstation
    const skinMat = new THREE.MeshStandardMaterial({ color: '#FAD7A0', roughness: 0.62 });
    const faceTex = createRobloxFaceTexture(spawn.role === 'merlin' ? 'merlin' : 'npc');
    const headFrontMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.58 });
    const shirtMat = new THREE.MeshStandardMaterial({
      color: spawn.shirtHex,
      roughness: 0.72,
      metalness: 0.08,
    });
    const pantsMat = new THREE.MeshStandardMaterial({ color: '#243447', roughness: 0.8 });
    const accentMat = new THREE.MeshStandardMaterial({
      color: spawn.accentHex,
      emissive: spawn.role === 'merlin' || spawn.role === 'appraiser' ? spawn.accentHex : '#000000',
      emissiveIntensity: spawn.role === 'merlin' ? 0.45 : spawn.role === 'appraiser' ? 0.28 : 0,
      roughness: 0.3,
      metalness: 0.35,
    });

    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.72, 0.34), pantsMat);
    legL.position.set(-0.18, 0.36, 0);
    legL.castShadow = true;
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.72, 0.34), pantsMat);
    legR.position.set(0.18, 0.36, 0);
    legR.castShadow = true;

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.74, 0.4), shirtMat);
    torso.position.set(0, 1.1, 0);
    torso.castShadow = true;

    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.22, 0.43), accentMat);
    sash.position.set(0, 0.96, 0);

    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.68, 0.28), shirtMat);
    armL.position.set(-0.52, 1.1, 0);
    armL.castShadow = true;
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.68, 0.28), shirtMat);
    armR.position.set(0.52, 1.1, 0);
    armR.castShadow = true;

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.56, 0.56), [
      skinMat,
      skinMat,
      skinMat,
      skinMat,
      headFrontMat,
      skinMat,
    ]);
    head.position.set(0, 1.78, 0);
    head.castShadow = true;

    group.add(legL, legR, torso, sash, armL, armR, head);

    if (spawn.role === 'merlin') {
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.54, 0.06, 14), shirtMat);
      brim.position.set(0, 2.07, 0);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.68, 12), shirtMat);
      cone.position.set(0, 2.42, 0);
      const staff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.9, 8),
        new THREE.MeshStandardMaterial({ color: '#5C3A21', roughness: 0.8 })
      );
      staff.position.set(0.68, 0.95, 0.2);
      crystalMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), accentMat);
      crystalMesh.position.set(0.68, 1.96, 0.2);
      group.add(brim, cone, staff, crystalMesh);
    } else if (spawn.role === 'merchant') {
      attachNpcHat(group, spawn.hatStyle, shirtMat, accentMat);
      const stall = buildMerchantStall(spawn.stallStyle, accentMat);
      stall.position.set(-1.75, 0, -0.2);
      group.add(stall);
    } else if (spawn.role === 'appraiser') {
      attachNpcHat(group, spawn.hatStyle, shirtMat, accentMat);
      const { table, crystal } = buildAppraiserTable(spawn.tableStyle, accentMat);
      table.position.set(1.2, 0, 0.35);
      crystalMesh = crystal;
      group.add(table);
    } else {
      attachNpcHat(group, spawn.hatStyle, shirtMat, accentMat);
    }
  }

  // Nameplate Sprite
  const sprite = createNameplateSprite(spawn.name, spawn.subtitle, spawn.accentHex);
  sprite.position.set(0, spawn.role === 'altar' ? 3.7 : 2.95, 0);
  group.add(sprite);

  // Subtle ground ring highlight
  const ringMat = new THREE.MeshBasicMaterial({
    color: spawn.accentHex,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ringMesh = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.22, 24), ringMat);
  ringMesh.rotation.x = -Math.PI / 2;
  ringMesh.position.y = 0.04;
  group.add(ringMesh);

  // Dedicated Layer 1 Simplified Hitbox for fast Raycasting
  const hitboxMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 3.2, 2.0),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitboxMesh.position.y = 1.45;
  hitboxMesh.layers.set(1);
  hitboxMesh.userData = { npcId: spawn.id, targetTab: spawn.targetTab, npcName: spawn.name };
  group.add(hitboxMesh);

  return {
    spawn,
    group,
    hitboxMesh,
    ringMesh,
    ringMat,
    crystalMesh,
    baseY,
  };
}

// ============================================================
// 3. Bobber & Caught Fish 3D Models
// ============================================================

export function createBobberGroup(): THREE.Group {
  const g = new THREE.Group();
  const topHalf = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({ color: '#EF4444', roughness: 0.35, metalness: 0.1 })
  );
  const bottomHalf = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 8, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({ color: '#F7F6F1', roughness: 0.4, metalness: 0.05 })
  );
  const pin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.24, 6),
    new THREE.MeshStandardMaterial({ color: '#EAB308', roughness: 0.25, metalness: 0.8 })
  );
  pin.position.y = 0.16;
  g.add(topHalf, bottomHalf, pin);
  return g;
}

export function createCaughtFish3D(
  species: FischSpecies,
  overrideColorHex: string | null,
  isGiant: boolean
): THREE.Group {
  const g = new THREE.Group();
  const scale = isGiant ? 1.55 : species.maxKg > 150 ? 1.25 : 0.92;

  const bodyMat = new THREE.MeshStandardMaterial({
    color: overrideColorHex ?? species.colorHex,
    roughness: 0.3,
    metalness: 0.18,
  });
  const finMat = new THREE.MeshStandardMaterial({
    color: species.accentHex,
    roughness: 0.4,
    metalness: 0.12,
  });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 10), bodyMat);
  body.scale.set(0.65, 0.85, 1.65);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.46, 4), finMat);
  tail.rotation.x = Math.PI / 2;
  tail.scale.set(0.22, 1, 1);
  tail.position.z = -0.62;

  const dorsal = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 4), finMat);
  dorsal.position.set(0, 0.3, -0.05);
  dorsal.rotation.x = -0.35;

  const eyeMat = new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.1 });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyeMat);
  eyeL.position.set(-0.16, 0.08, 0.34);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.16;

  g.add(body, tail, dorsal, eyeL, eyeR);
  g.scale.setScalar(scale);
  return g;
}

// ============================================================
// 3B. 4 Drivable Roblox-Style 3D Boats (Rowboat -> Galleon)
// ============================================================

export function createBoatModel(boat: FischBoat): FischBoat3DHandle {
  const root = new THREE.Group();
  const hullGroup = new THREE.Group();
  root.add(hullGroup);

  const hullMat = new THREE.MeshStandardMaterial({
    color: boat.colorHex,
    roughness: boat.hullStyle === 'speedboat' ? 0.32 : 0.72,
    metalness: boat.hullStyle === 'trawler' ? 0.45 : 0.12,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: boat.accentHex,
    roughness: 0.42,
    metalness: 0.22,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: '#4A311E',
    roughness: 0.85,
  });
  const lanternGlowMat = new THREE.MeshStandardMaterial({
    color: '#FDE68A',
    emissive: '#F59E0B',
    emissiveIntensity: 1.3,
    roughness: 0.2,
  });

  const isGalleon = boat.hullStyle === 'galleon';
  const isTrawler = boat.hullStyle === 'trawler';
  const isSpeedboat = boat.hullStyle === 'speedboat';

  const length = isGalleon ? 5.6 : isTrawler ? 4.8 : isSpeedboat ? 4.1 : 3.5;
  const width = isGalleon ? 2.25 : isTrawler ? 2.0 : isSpeedboat ? 1.65 : 1.5;

  // Main deck hull
  const baseHull = new THREE.Mesh(new THREE.BoxGeometry(width, 0.56, length * 0.76), hullMat);
  baseHull.position.y = 0.24;
  baseHull.castShadow = true;
  baseHull.receiveShadow = true;
  hullGroup.add(baseHull);

  // Pointed bow wedge (+Z forward)
  const bow = new THREE.Mesh(new THREE.ConeGeometry(width * 0.52, length * 0.34, 4), hullMat);
  bow.rotation.x = Math.PI / 2;
  bow.rotation.y = Math.PI / 4;
  bow.scale.set(1.0, 1.0, 0.54);
  bow.position.set(0, 0.28, length * 0.48);
  bow.castShadow = true;
  hullGroup.add(bow);

  // Gunwale side rails & Deck inlay
  const railL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, length * 0.76), accentMat);
  railL.position.set(-width * 0.46, 0.62, 0);
  const railR = railL.clone();
  railR.position.x = width * 0.46;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(width * 0.82, 0.08, length * 0.72), trimMat);
  deck.position.set(0, 0.54, 0);
  hullGroup.add(railL, railR, deck);

  // Bow beacon lantern
  const bowLantern = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.18), lanternGlowMat);
  bowLantern.position.set(0, 0.78, length * 0.45);
  hullGroup.add(bowLantern);

  // Boat-class superstructures
  if (isSpeedboat) {
    const windshield = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.8, 0.38, 0.08),
      new THREE.MeshStandardMaterial({ color: '#BAE6FD', roughness: 0.12, metalness: 0.35 })
    );
    windshield.position.set(0, 0.82, 0.72);
    windshield.rotation.x = -0.4;
    const motor = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.52, 0.55),
      new THREE.MeshStandardMaterial({ color: '#1F2937', roughness: 0.35, metalness: 0.7 })
    );
    motor.position.set(0, 0.48, -length * 0.42);
    hullGroup.add(windshield, motor);
  } else if (isTrawler) {
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(width * 0.72, 1.15, 1.35), accentMat);
    cabin.position.set(0, 1.1, 0.78);
    cabin.castShadow = true;
    const windowStrip = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.74, 0.34, 0.9),
      new THREE.MeshStandardMaterial({ color: '#38BDF8', emissive: '#0284C7', emissiveIntensity: 0.35, roughness: 0.15 })
    );
    windowStrip.position.set(0, 1.32, 0.82);
    const smokestack = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.9, 10), hullMat);
    smokestack.position.set(0.35, 1.85, 0.55);
    hullGroup.add(cabin, windowStrip, smokestack);
  } else if (isGalleon) {
    const sternDeck = new THREE.Mesh(new THREE.BoxGeometry(width * 0.92, 0.5, 1.4), trimMat);
    sternDeck.position.set(0, 0.78, -length * 0.25);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 4.2, 8), trimMat);
    mast.position.set(0, 2.55, 0.3);
    mast.castShadow = true;
    const sail = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 1.9, 0.08),
      new THREE.MeshStandardMaterial({ color: '#F7F6F1', roughness: 0.85 })
    );
    sail.position.set(0, 3.05, 0.38);
    const crowNest = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.3, 8), accentMat);
    crowNest.position.set(0, 4.3, 0.3);
    hullGroup.add(sternDeck, mast, sail, crowNest);
  } else {
    // Starter Rowboat cross bench + side oars
    const bench = new THREE.Mesh(new THREE.BoxGeometry(width * 0.85, 0.1, 0.42), accentMat);
    bench.position.set(0, 0.62, 0);
    const oarL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.8, 6), accentMat);
    oarL.rotation.z = Math.PI / 2 - 0.15;
    oarL.position.set(-width * 0.58, 0.58, 0.15);
    const oarR = oarL.clone();
    oarR.rotation.z = -(Math.PI / 2 - 0.15);
    oarR.position.x = width * 0.58;
    hullGroup.add(bench, oarL, oarR);
  }

  // Bench seat anchor where angler rig sits comfortably
  const seatAnchor = new THREE.Object3D();
  seatAnchor.position.set(0, isGalleon ? 1.02 : 0.68, isTrawler ? -0.45 : isGalleon ? -0.75 : -0.15);
  hullGroup.add(seatAnchor);

  const wakeAnchor = new THREE.Object3D();
  wakeAnchor.position.set(0, 0.05, -length * 0.48);
  hullGroup.add(wakeAnchor);

  return {
    root,
    hullGroup,
    seatAnchor,
    wakeAnchor,
    dispose: () => disposeObject3DTree(root),
  };
}

// ============================================================
// 4. 11 Distinct Island Dioramas + Outpost Isles + Seagulls + Aurora
// ============================================================

export function buildIslandEnvironment(
  island: FischIsland,
  isDarkMode: boolean,
  maxAnisotropy: number,
  isSoftwareGl: boolean
): IslandEnvironmentHandle {
  const group = new THREE.Group();

  const woodTex = createWoodPlankTexture(maxAnisotropy);
  const groundPalette: Record<string, [string, string]> = {
    moosewood: ['#4A7A58', '#386144'],
    roslit_bay: ['#D7C397', '#C2A978'],
    mushgrove: ['#3B5E4F', '#294238'],
    roslit_volcano: ['#3D2926', '#241816'],
    snowcap: ['#DCEBF4', '#B8D4E6'],
    sunstone: ['#D6A95C', '#B6873D'],
    sovereignty: ['#7F8E9B', '#61707D'],
    desolate_deep: ['#1C2B3B', '#111C28'],
    forsaken_shores: ['#6E5443', '#4E392C'],
    ancient_isle: ['#8A7C58', '#6B5E3E'],
    the_depths: ['#22384F', '#142336'],
  };
  const [gBase, gAccent] = groundPalette[island.id] ?? groundPalette.moosewood;
  const groundTex = createGroundStoneTexture(gBase, gAccent, maxAnisotropy);

  const groundMat = new THREE.MeshStandardMaterial({
    map: groundTex,
    roughness: island.id === 'snowcap' ? 0.55 : 0.88,
    metalness: 0.04,
  });
  const sandMat = new THREE.MeshStandardMaterial({
    color: island.id === 'roslit_volcano' ? '#2A1D1B' : island.id === 'snowcap' ? '#A8C5D9' : '#D5C398',
    roughness: 0.9,
    metalness: 0.02,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    map: woodTex,
    roughness: 0.82,
    metalness: 0.04,
  });
  const darkTimberMat = new THREE.MeshStandardMaterial({
    color: '#4A311E',
    roughness: 0.88,
    metalness: 0.04,
  });

  // Expanded Main Island Plateau (~2.6x walkable area)
  const islandTop = new THREE.Mesh(new THREE.CylinderGeometry(21.8, 25.0, 2.5, 36), groundMat);
  islandTop.scale.set(1.06, 1, 0.72);
  islandTop.position.set(0, -0.38, -9.5);
  islandTop.receiveShadow = true;
  group.add(islandTop);

  // Outer Coastal Reef Shelf
  const shoreRing = new THREE.Mesh(new THREE.CylinderGeometry(25.2, 29.8, 1.6, 36), sandMat);
  shoreRing.scale.set(1.08, 1, 0.76);
  shoreRing.position.set(0, -0.96, -9.5);
  shoreRing.receiveShadow = true;
  group.add(shoreRing);

  // Cobblestone Plaza Center & Boardwalk Paths connecting pier to NPCs
  const pathMat = new THREE.MeshStandardMaterial({
    color: island.id === 'roslit_volcano' ? '#4B3632' : island.id === 'snowcap' ? '#CBD5E1' : '#A89F91',
    roughness: 0.9,
  });
  const centralPlaza = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 6.0, 0.14, 24), pathMat);
  centralPlaza.position.set(0, 1.02, -4.0);
  centralPlaza.receiveShadow = true;
  const spineWalk = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 16.5), pathMat);
  spineWalk.position.set(0, 1.02, -8.2);
  spineWalk.receiveShadow = true;
  const crossWalk = new THREE.Mesh(new THREE.BoxGeometry(24.0, 0.12, 2.6), pathMat);
  crossWalk.position.set(0, 0.98, -3.5);
  crossWalk.receiveShadow = true;
  group.add(centralPlaza, spineWalk, crossWalk);

  // Extended Wooden Pier Deck + Wide T-Head Harbor Dock (y = 0.96 top)
  const pierMain = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.24, 15.2), woodMat);
  pierMain.position.set(0, 0.84, 8.8);
  pierMain.receiveShadow = true;
  pierMain.castShadow = true;
  const pierHead = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.24, 3.6), woodMat);
  pierHead.position.set(0, 0.84, 14.8);
  pierHead.receiveShadow = true;
  pierHead.castShadow = true;
  group.add(pierMain, pierHead);

  // Pier Pilings & Bollards
  const pilingPositions: Array<[number, number]> = [
    [-2.5, 2.2],
    [2.5, 2.2],
    [-2.5, 6.8],
    [2.5, 6.8],
    [-2.5, 11.4],
    [2.5, 11.4],
    [-6.3, 13.2],
    [6.3, 13.2],
    [-6.3, 16.3],
    [6.3, 16.3],
    [-2.4, 16.3],
    [2.4, 16.3],
  ];
  const pilingGeo = new THREE.CylinderGeometry(0.22, 0.24, 4.4, 8);
  const bollardCapMat = new THREE.MeshStandardMaterial({ color: '#9CA3AF', roughness: 0.3, metalness: 0.75 });

  for (const [px, pz] of pilingPositions) {
    const piling = new THREE.Mesh(pilingGeo, darkTimberMat);
    piling.position.set(px, -0.55, pz);
    piling.castShadow = true;
    group.add(piling);
  }

  // Brass Dock Lanterns (only 2 PointLights total for mobile/iPad efficiency)
  const lanternLights: THREE.PointLight[] = [];
  const lanternGlassMats: THREE.MeshStandardMaterial[] = [];
  const lanternCoords: Array<[number, number, number]> = [
    [-6.3, 1.55, 16.3],
    [6.3, 1.55, 16.3],
    [-2.5, 1.55, 3.6],
    [2.5, 1.55, 3.6],
    [-7.5, 1.4, -3.5],
    [7.5, 1.4, -3.5],
  ];
  const brassMat = new THREE.MeshStandardMaterial({ color: '#B48A3E', roughness: 0.28, metalness: 0.82 });

  lanternCoords.forEach(([lx, ly, lz], idx) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.2, 8), darkTimberMat);
    post.position.set(lx, ly - 0.1, lz);
    const glassMat = new THREE.MeshStandardMaterial({
      color: '#FDE68A',
      emissive: '#F59E0B',
      emissiveIntensity: isDarkMode ? 1.4 : 0.4,
      roughness: 0.2,
    });
    lanternGlassMats.push(glassMat);
    const globe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.3, 0.24), glassMat);
    globe.position.set(lx, ly + 0.55, lz);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.16, 4), brassMat);
    cap.position.set(lx, ly + 0.76, lz);
    cap.rotation.y = Math.PI / 4;
    group.add(post, globe, cap);

    if (idx < 2) {
      const pt = new THREE.PointLight('#FBBF24', isDarkMode ? 2.8 : 0.65, 22, 1.5);
      pt.position.set(lx, ly + 0.65, lz);
      group.add(pt);
      lanternLights.push(pt);
    }
  });

  // Island-Specific Rocks & Sea Stacks (32 InstancedMesh outside walking plaza)
  const dummy = new THREE.Object3D();
  const rockGeo = new THREE.DodecahedronGeometry(1.0, 0);
  const rockColor =
    island.id === 'roslit_volcano'
      ? '#291D1B'
      : island.id === 'snowcap'
      ? '#93C5FD'
      : island.id === 'sunstone'
      ? '#C29243'
      : island.id === 'desolate_deep'
      ? '#1E293B'
      : '#5C6975';
  const rockMat = new THREE.MeshStandardMaterial({
    color: rockColor,
    roughness: island.id === 'snowcap' ? 0.28 : 0.88,
    metalness: island.id === 'snowcap' ? 0.1 : 0.06,
  });

  const rockInst = new THREE.InstancedMesh(rockGeo, rockMat, 32);
  for (let i = 0; i < 32; i += 1) {
    const angle = (i / 32) * Math.PI * 2;
    const dist = i < 18 ? 24.5 + (i % 3) * 2.5 : 32 + (i % 4) * 4.5;
    const rx = Math.cos(angle) * dist * 1.15;
    const rz = Math.sin(angle) * dist * 0.85 - 9.0;
    if (rz > 8 && Math.abs(rx) < 12) {
      dummy.position.set(rx + (rx >= 0 ? 15 : -15), -0.4, rz);
    } else {
      dummy.position.set(rx, i < 18 ? 0.45 : -0.35, rz);
    }
    const sx = 1.2 + ((i * 17) % 10) * 0.22;
    const sy = 0.9 + ((i * 13) % 10) * 0.34;
    dummy.scale.set(sx, sy, sx * 0.9);
    dummy.rotation.set(0.1 * i, angle, 0.08 * i);
    dummy.updateMatrix();
    rockInst.setMatrixAt(i, dummy.matrix);
    rockInst.setColorAt(i, new THREE.Color(rockColor).offsetHSL(0, 0, ((i % 3) - 1) * 0.05));
  }
  rockInst.instanceMatrix.needsUpdate = true;
  if (rockInst.instanceColor) rockInst.instanceColor.needsUpdate = true;
  rockInst.computeBoundingSphere();
  group.add(rockInst);

  // Island Signature Multi-Part Landmarks & Scenery
  if (island.silhouetteType === 'volcano') {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(12.5, 16.0, 16, 1, true),
      new THREE.MeshStandardMaterial({ color: '#2B1B1A', roughness: 0.92, side: THREE.DoubleSide })
    );
    cone.position.set(0, 7.2, -29.0);
    const lavaMat = new THREE.MeshStandardMaterial({
      color: '#EA580C',
      emissive: '#F97316',
      emissiveIntensity: 1.65,
      roughness: 0.28,
    });
    const lavaPool = new THREE.Mesh(new THREE.CircleGeometry(4.8, 16), lavaMat);
    lavaPool.rotation.x = -Math.PI / 2;
    lavaPool.position.set(0, 14.5, -29.0);
    // Obsidian vents around the perimeter
    [-16, 16].forEach((vx) => {
      const vent = new THREE.Mesh(new THREE.ConeGeometry(2.2, 4.8, 6), new THREE.MeshStandardMaterial({ color: '#1F1413', roughness: 0.9 }));
      vent.position.set(vx, 2.4, -14.5);
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 8), lavaMat);
      glow.position.set(vx, 4.7, -14.5);
      group.add(vent, glow);
    });
    group.add(cone, lavaPool);
  } else if (island.silhouetteType === 'swamp') {
    const stemMat = new THREE.MeshStandardMaterial({ color: '#D6D3D1', roughness: 0.8 });
    const capMat = new THREE.MeshStandardMaterial({
      color: '#10B981',
      emissive: '#059669',
      emissiveIntensity: 0.78,
      roughness: 0.42,
    });
    [
      [-17.5, -14.5, 1.7],
      [17.5, -14.2, 1.55],
      [-9.5, -21.2, 2.0],
      [9.8, -20.8, 1.85],
      [-19.0, -4.8, 1.25],
      [18.8, -5.2, 1.3],
    ].forEach(([mx, mz, ms]) => {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.32 * ms, 0.48 * ms, 3.2 * ms, 8), stemMat);
      stem.position.set(mx, 1.7 * ms, mz);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(1.75 * ms, 1.2 * ms, 10), capMat);
      cap.position.set(mx, 3.4 * ms, mz);
      group.add(stem, cap);
    });
  } else if (island.silhouetteType === 'ice') {
    const iceMat = new THREE.MeshStandardMaterial({ color: '#BAE6FD', roughness: 0.16, metalness: 0.18 });
    [
      [-16.5, -15.5, 3.4, 8.5],
      [16.8, -15.2, 3.0, 7.8],
      [-5.5, -21.8, 4.4, 11.2],
      [6.5, -21.2, 3.9, 9.8],
      [-19.2, -5.0, 2.2, 5.8],
      [19.0, -5.5, 2.3, 6.2],
    ].forEach(([ix, iz, r, h]) => {
      const spire = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), iceMat);
      spire.position.set(ix, h * 0.44, iz);
      group.add(spire);
    });
  } else if (island.silhouetteType === 'statue') {
    const marbleMat = new THREE.MeshStandardMaterial({ color: '#94A3B8', roughness: 0.62, metalness: 0.12 });
    const goldMat = new THREE.MeshStandardMaterial({
      color: '#F59E0B',
      emissive: '#D97706',
      emissiveIntensity: 0.35,
      roughness: 0.24,
      metalness: 0.85,
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(6.2, 2.6, 4.8), marbleMat);
    base.position.set(0, 1.8, -22.5);
    const torsoS = new THREE.Mesh(new THREE.BoxGeometry(3.2, 6.2, 2.2), marbleMat);
    torsoS.position.set(0, 6.0, -22.5);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.6, 5), goldMat);
    crown.position.set(0, 9.8, -22.5);
    const tridentShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 10.6, 8), goldMat);
    tridentShaft.position.set(2.6, 6.8, -21.8);
    // Flanking marble columns
    [-12, -7, 7, 12].forEach((cx) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.52, 4.6, 10), marbleMat);
      col.position.set(cx, 3.1, -18.5);
      group.add(col);
    });
    group.add(base, torsoS, crown, tridentShaft);
  } else if (island.silhouetteType === 'abyss') {
    const subMat = new THREE.MeshStandardMaterial({ color: '#EAB308', roughness: 0.32, metalness: 0.55 });
    const cyanGlow = new THREE.MeshStandardMaterial({
      color: '#22D3EE',
      emissive: '#06B6D4',
      emissiveIntensity: 1.5,
      roughness: 0.2,
    });
    const hull = new THREE.Mesh(new THREE.CapsuleGeometry(1.3, 4.2, 6, 12), subMat);
    hull.rotation.z = Math.PI / 2;
    hull.position.set(11.5, 0.45, 7.2);
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.68, 1.3, 10), subMat);
    tower.position.set(11.5, 1.65, 7.2);
    const porthole = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 10), cyanGlow);
    porthole.position.set(9.3, 0.55, 7.2);
    // Hydrothermal chimney vents behind Altar
    [-9, 9].forEach((hx) => {
      const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.4, 5.2, 8), new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.9 }));
      ch.position.set(hx, 3.0, -19.5);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.75, 10, 10), cyanGlow);
      cap.position.set(hx, 5.6, -19.5);
      group.add(ch, cap);
    });
    group.add(hull, tower, porthole);
  } else if (island.silhouetteType === 'forsaken') {
    const skullMat = new THREE.MeshStandardMaterial({ color: '#4B443E', roughness: 0.9 });
    const emberMat = new THREE.MeshStandardMaterial({ color: '#F97316', emissive: '#EA580C', emissiveIntensity: 1.45 });
    const skullRock = new THREE.Mesh(new THREE.DodecahedronGeometry(4.6, 0), skullMat);
    skullRock.position.set(0, 4.2, -21.5);
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.62, 8, 8), emberMat);
    eyeL.position.set(-1.5, 4.4, -17.6);
    const eyeR = eyeL.clone();
    eyeR.position.x = 1.5;
    // Shipwreck masts
    [-14.5, 14.5].forEach((mx, idx) => {
      const mastPole = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 9.2, 8), darkTimberMat);
      mastPole.position.set(mx, 4.2, -14.5);
      mastPole.rotation.z = idx === 0 ? 0.24 : -0.18;
      group.add(mastPole);
    });
    group.add(skullRock, eyeL, eyeR);
  } else if (island.silhouetteType === 'ancient') {
    const stoneMat = new THREE.MeshStandardMaterial({ color: '#6E6656', roughness: 0.88 });
    const meteorMat = new THREE.MeshStandardMaterial({ color: '#34D399', emissive: '#10B981', emissiveIntensity: 1.4, roughness: 0.22 });
    const meteor = new THREE.Mesh(new THREE.OctahedronGeometry(3.6, 0), meteorMat);
    meteor.position.set(0, 4.6, -21.8);
    [-11.5, 11.5].forEach((px, idx) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 6.4 + idx * 1.1, 1.8), stoneMat);
      pillar.position.set(px, 3.3, -18.5);
      pillar.rotation.z = idx === 0 ? 0.14 : -0.15;
      group.add(pillar);
    });
    group.add(meteor);
  } else if (island.silhouetteType === 'depths') {
    const basaltMat = new THREE.MeshStandardMaterial({ color: '#172336', roughness: 0.88 });
    const crystalGlowMat = new THREE.MeshStandardMaterial({ color: '#38BDF8', emissive: '#0284C7', emissiveIntensity: 1.5, roughness: 0.16 });
    [
      [-11.5, -18.5, 1.6, 7.2],
      [0, -22.2, 2.3, 10.2],
      [11.8, -18.0, 1.7, 7.5],
      [-17.2, -9.2, 1.1, 4.8],
      [17.2, -9.2, 1.1, 4.8],
    ].forEach(([cx, cz, cr, ch]) => {
      const base = new THREE.Mesh(new THREE.ConeGeometry(cr * 1.45, 2.6, 6), basaltMat);
      base.position.set(cx, 1.4, cz);
      const spire = new THREE.Mesh(new THREE.OctahedronGeometry(cr, 0), crystalGlowMat);
      spire.scale.set(0.75, ch / (cr * 2), 0.75);
      spire.position.set(cx, 2.4 + ch * 0.36, cz);
      group.add(base, spire);
    });
  } else {
    // Rich Scenic Groves, Boathouse & Coastal Lighthouse (Moosewood, Roslit Bay, Sunstone)
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#6B4423', roughness: 0.88 });
    const leafHex =
      island.silhouetteType === 'coral'
        ? '#2E9E6B'
        : island.silhouetteType === 'sunstone'
        ? '#B89B38'
        : '#236B4E';
    const leafMat = new THREE.MeshStandardMaterial({ color: leafHex, roughness: 0.78 });

    const treeSpots: Array<[number, number, number]> = [
      [-17.5, -14.8, 1.3],
      [-12.4, -19.6, 1.15],
      [12.8, -19.4, 1.35],
      [17.4, -14.6, 1.2],
      [-18.4, -5.5, 1.05],
      [18.2, -5.8, 1.2],
      [-7.2, -20.8, 1.1],
      [7.4, -20.6, 1.15],
    ];
    for (const [tx, tz, ts] of treeSpots) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28 * ts, 0.38 * ts, 2.8 * ts, 7), trunkMat);
      trunk.position.set(tx, 1.7 * ts, tz);
      trunk.castShadow = true;
      const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.55 * ts, 2.3 * ts, 7), leafMat);
      c1.position.set(tx, 3.4 * ts, tz);
      c1.castShadow = true;
      const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.1 * ts, 1.8 * ts, 7), leafMat);
      c2.position.set(tx, 4.65 * ts, tz);
      c2.castShadow = true;
      group.add(trunk, c1, c2);
    }

    // Coastal Cabin & Landmark Tower
    const wallMat = new THREE.MeshStandardMaterial({ color: '#B08968', roughness: 0.85 });
    const roofMat = new THREE.MeshStandardMaterial({ color: island.accentHex, roughness: 0.62 });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.9, 3.4), wallMat);
    cabin.position.set(16.8, 2.2, -1.8);
    cabin.castShadow = true;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.75, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(16.8, 4.5, -1.8);
    roof.castShadow = true;
    group.add(cabin, roof);

    // Harbor Lighthouse / Sun Obelisk on NW ridge
    const towerMat = new THREE.MeshStandardMaterial({ color: '#F1F5F9', roughness: 0.65 });
    const lighthouse = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.55, 8.6, 12), towerMat);
    lighthouse.position.set(-16.5, 5.0, -16.5);
    lighthouse.castShadow = true;
    const beaconGlow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 1.0, 12),
      new THREE.MeshStandardMaterial({ color: '#FDE68A', emissive: '#F59E0B', emissiveIntensity: 1.4 })
    );
    beaconGlow.position.set(-16.5, 9.6, -16.5);
    const capDome = new THREE.Mesh(new THREE.ConeGeometry(1.25, 1.2, 12), roofMat);
    capDome.position.set(-16.5, 10.7, -16.5);
    group.add(lighthouse, beaconGlow, capDome);
  }

  // Harbor Detail Props: Mooring Barrels & Crates on wide T-Dock
  const crateMat = new THREE.MeshStandardMaterial({ color: '#8C623E', roughness: 0.86 });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.78, 10), crateMat);
  barrel.position.set(-5.6, 1.35, 15.6);
  const crateSmall = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.7), crateMat);
  crateSmall.position.set(3.5, 1.26, 15.8);
  group.add(barrel, crateSmall);

  // Sea Route Channel Buoys near central harbor lanes
  const buoyCoords: Array<[number, number, string]> = [
    [-20, 26, '#F97316'],
    [20, 26, '#34D399'],
    [0, 34, '#38BDF8'],
  ];
  for (const [bx, bz, bHex] of buoyCoords) {
    const buoyBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.75, 0.75, 10),
      new THREE.MeshStandardMaterial({ color: '#DC2626', roughness: 0.55 })
    );
    buoyBase.position.set(bx, 0.18, bz);
    const buoyTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 8, 8),
      new THREE.MeshStandardMaterial({ color: bHex, emissive: bHex, emissiveIntensity: 1.6 })
    );
    buoyTop.position.set(bx, 1.15, bz);
    const buoyPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.8, 6), bollardCapMat);
    buoyPole.position.set(bx, 0.72, bz);
    group.add(buoyBase, buoyPole, buoyTop);
  }

  // Render ALL 10 Sailable Destination Neighbor Islands across the Archipelago Ocean!
  const neighborHarbors = getNeighborHarborBeacons(island.id);
  for (const beacon of neighborHarbors) {
    const harborGroup = new THREE.Group();
    harborGroup.position.set(beacon.x, 0, beacon.z);

    const baseIsland = new THREE.Mesh(
      new THREE.CylinderGeometry(6.8, 9.2, 2.4, 16),
      new THREE.MeshStandardMaterial({
        color:
          beacon.silhouetteType === 'volcano'
            ? '#3D2926'
            : beacon.silhouetteType === 'ice'
            ? '#CFE4F2'
            : beacon.silhouetteType === 'swamp'
            ? '#3B5E4F'
            : beacon.silhouetteType === 'forsaken'
            ? '#5C4435'
            : '#6E7A69',
        roughness: 0.86,
      })
    );
    baseIsland.position.y = -0.1;
    harborGroup.add(baseIsland);

    // Mini harbor pier pointing toward sea center
    const miniPier = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.22, 4.6), woodMat);
    miniPier.position.set(0, 0.82, 6.2);
    const pierBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 8, 8),
      new THREE.MeshStandardMaterial({ color: beacon.accentHex, emissive: beacon.accentHex, emissiveIntensity: 1.5 })
    );
    pierBeacon.position.set(0, 1.65, 8.2);
    harborGroup.add(miniPier, pierBeacon);

    const landmark = new THREE.Mesh(
      beacon.silhouetteType === 'ancient' || beacon.silhouetteType === 'statue'
        ? new THREE.OctahedronGeometry(2.8, 0)
        : beacon.silhouetteType === 'volcano' || beacon.silhouetteType === 'depths'
        ? new THREE.ConeGeometry(3.2, 6.8, 6)
        : new THREE.CylinderGeometry(1.5, 2.2, 5.4, 8),
      new THREE.MeshStandardMaterial({
        color: beacon.accentHex,
        emissive: beacon.accentHex,
        emissiveIntensity: 0.42,
        roughness: 0.35,
      })
    );
    landmark.position.y = 3.2;
    harborGroup.add(landmark);

    const harborLabel = createNameplateSprite(beacon.name, 'Labuhkan dgn Kapal [E]', beacon.accentHex);
    harborLabel.scale.set(7.2, 2.15, 1);
    harborLabel.position.set(0, 8.2, 0);
    harborGroup.add(harborLabel);

    group.add(harborGroup);
  }

  // Soaring Seagulls overhead (12 InstancedMesh gulls)
  const gullGeo = new THREE.BoxGeometry(1.1, 0.06, 0.24);
  const gullMat = new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.65 });
  const gullCount = 12;
  const gullInst = new THREE.InstancedMesh(gullGeo, gullMat, gullCount);
  gullInst.frustumCulled = false;
  const gullData = Array.from({ length: gullCount }, (_, i) => ({
    radius: 18 + (i % 4) * 9,
    speed: 0.2 + (i % 3) * 0.06,
    height: 13 + (i % 4) * 2.5,
    phase: (i / gullCount) * Math.PI * 2,
  }));
  group.add(gullInst);

  // Instanced Underwater Swimming Fish School (34 instances)
  const fishBodyGeo = new THREE.ConeGeometry(0.24, 0.9, 6);
  fishBodyGeo.rotateX(Math.PI / 2);
  const fishMat = new THREE.MeshStandardMaterial({
    color: '#82AAA1',
    roughness: 0.3,
    metalness: 0.25,
  });
  const fishCount = 34;
  const fishSchoolMesh = new THREE.InstancedMesh(fishBodyGeo, fishMat, fishCount);
  fishSchoolMesh.frustumCulled = false;
  const fishData = Array.from({ length: fishCount }, (_, i) => ({
    radius: 9.5 + (i % 5) * 3.8,
    speed: (0.26 + (i % 4) * 0.1) * (i % 2 === 0 ? 1 : -1),
    phase: (i / fishCount) * Math.PI * 2,
    depth: -0.45 - (i % 3) * 0.35,
    scale: 0.72 + (i % 4) * 0.22,
  }));
  const schoolColors = ['#5EC48B', '#63B3ED', '#F6C453', '#82AAA1', '#E87EA1'];
  for (let i = 0; i < fishCount; i += 1) {
    fishSchoolMesh.setColorAt(i, new THREE.Color(schoolColors[i % schoolColors.length]));
  }
  if (fishSchoolMesh.instanceColor) fishSchoolMesh.instanceColor.needsUpdate = true;
  group.add(fishSchoolMesh);

  // Starfield for Night & Aurora
  const starCount = isSoftwareGl ? 140 : 280;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    const theta = ((i * 137.5) % 360) * (Math.PI / 180);
    const phi = 0.18 + ((i * 29) % 75) * 0.012;
    const rad = 115;
    starPositions[i * 3] = Math.cos(theta) * Math.cos(phi) * rad;
    starPositions[i * 3 + 1] = Math.sin(phi) * rad + 8;
    starPositions[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * rad;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: '#F8FAFC',
    size: 0.85,
    transparent: true,
    opacity: isDarkMode ? 0.85 : 0.0,
    depthWrite: false,
  });
  const starPoints = new THREE.Points(starGeo, starMat);
  group.add(starPoints);

  // Aurora Borealis Curved Ribbon
  const auroraGeo = new THREE.PlaneGeometry(98, 14, 24, 4);
  const posAttr = auroraGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i += 1) {
    const px = posAttr.getX(i);
    posAttr.setZ(i, Math.sin(px * 0.08) * 10.5);
  }
  auroraGeo.computeVertexNormals();
  const auroraMat = new THREE.MeshBasicMaterial({
    color: '#34D399',
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const auroraRibbon = new THREE.Mesh(auroraGeo, auroraMat);
  auroraRibbon.position.set(0, 30, -45);
  auroraRibbon.rotation.x = 0.18;
  group.add(auroraRibbon);

  // Build All 7 Island-Specific Interactive 3D NPCs
  const islandNpcSpawns = getIslandNpcSpawns(island.id);
  const npcActors = islandNpcSpawns.map((spawn) => {
    const actor = createNpcActor(spawn, island.id, isDarkMode);
    group.add(actor.group);
    return actor;
  });

  const fishDummy = new THREE.Object3D();

  return {
    group,
    npcActors,
    auroraRibbon,
    auroraMat,
    starPoints,
    lanternLights,
    lanternGlassMats,
    fishSchoolMesh,
    update: (timeSec, _dt, isNight, auroraActive) => {
      for (let i = 0; i < fishCount; i += 1) {
        const fd = fishData[i];
        const ang = fd.phase + timeSec * fd.speed * 0.25;
        const fx = Math.cos(ang) * fd.radius * 1.25;
        const fz = 16.5 + Math.sin(ang) * fd.radius * 0.75;
        fishDummy.position.set(fx, fd.depth + Math.sin(timeSec * 2 + i) * 0.08, fz);
        fishDummy.rotation.set(0, -ang + (fd.speed > 0 ? 0 : Math.PI), 0);
        fishDummy.scale.setScalar(fd.scale);
        fishDummy.updateMatrix();
        fishSchoolMesh.setMatrixAt(i, fishDummy.matrix);
      }
      fishSchoolMesh.instanceMatrix.needsUpdate = true;

      for (let i = 0; i < gullCount; i += 1) {
        const gd = gullData[i];
        const ang = gd.phase + timeSec * gd.speed;
        fishDummy.position.set(
          Math.cos(ang) * gd.radius,
          gd.height + Math.sin(timeSec * 3.8 + i) * 0.45,
          Math.sin(ang) * gd.radius
        );
        fishDummy.rotation.set(Math.sin(timeSec * 6.5 + i) * 0.25, -ang, 0);
        fishDummy.scale.setScalar(1);
        fishDummy.updateMatrix();
        gullInst.setMatrixAt(i, fishDummy.matrix);
      }
      gullInst.instanceMatrix.needsUpdate = true;

      for (const actor of npcActors) {
        if (actor.crystalMesh) {
          actor.crystalMesh.rotation.y = timeSec * 1.25;
          actor.crystalMesh.position.y =
            (actor.spawn.role === 'altar' ? 2.65 : actor.spawn.role === 'merlin' ? 1.96 : 1.32) +
            Math.sin(timeSec * 2.4) * 0.09;
        }
      }

      starMat.opacity = THREE.MathUtils.lerp(starMat.opacity, isNight || auroraActive ? 0.85 : 0, 0.06);
      const targetAuroraOp = auroraActive ? 0.42 + Math.sin(timeSec * 1.6) * 0.12 : 0;
      auroraMat.opacity = THREE.MathUtils.lerp(auroraMat.opacity, targetAuroraOp, 0.06);
      if (auroraActive) {
        auroraMat.color.setHSL((0.42 + Math.sin(timeSec * 0.35) * 0.14) % 1, 0.85, 0.62);
      }

      const targetLantern = isNight ? 3.2 : 0.45;
      for (const l of lanternLights) {
        l.intensity = THREE.MathUtils.lerp(l.intensity, targetLantern, 0.08);
      }
      for (const m of lanternGlassMats) {
        m.emissiveIntensity = isNight ? 1.6 : 0.35;
      }
    },
    dispose: () => {
      disposeObject3DTree(group);
    },
  };
}
