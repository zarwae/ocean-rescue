import * as THREE from 'three';
import {
  AppraiserTableStyle,
  FISCH_ISLANDS,
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
  getAllWorldNpcSpawns,
  getGroundHeightAt,
  getGroundHeightAtWorld,
  getIslandLayout,
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
  nameplateSprite: THREE.Sprite;
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

export type ArchipelagoEnvironmentHandle = IslandEnvironmentHandle;

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

  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 1.14, 0);
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.76, 0.42), shirtMat);
  torso.castShadow = true;
  torsoGroup.add(torso);

  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.5, 0.46), vestMat);
  vest.position.y = 0.06;
  vest.castShadow = true;
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.49), buckleMat);
  buckle.position.set(0, 0.02, 0.01);
  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.52, 0.22), hatMat);
  backpack.position.set(0, 0.04, -0.32);
  backpack.castShadow = true;
  torsoGroup.add(vest, buckle, backpack);
  bodyPivot.add(torsoGroup);

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

  rig.bodyPivot.position.y = isSeated
    ? -0.35
    : isWalking
    ? Math.abs(Math.sin(timeSec * 10.5)) * 0.07
    : Math.sin(timeSec * 2.2) * 0.02;

  const shadowMat = rig.contactShadow.material as THREE.MeshBasicMaterial;
  shadowMat.opacity = isSeated ? 0 : isGrounded ? 0.48 : 0.2;

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
// 2. Interactive 3D NPCs (Shared Textures/Geos across Archipelago)
// ============================================================

interface SharedNpcResources {
  skinMat: THREE.MeshStandardMaterial;
  pantsMat: THREE.MeshStandardMaterial;
  timberMat: THREE.MeshStandardMaterial;
  whiteMat: THREE.MeshStandardMaterial;
  bronzeMat: THREE.MeshStandardMaterial;
  darkLeatherMat: THREE.MeshStandardMaterial;
  khakiMat: THREE.MeshStandardMaterial;
  stoneMat: THREE.MeshStandardMaterial;
  npcHeadFrontMat: THREE.MeshStandardMaterial;
  merlinHeadFrontMat: THREE.MeshStandardMaterial;
  legGeo: THREE.BoxGeometry;
  torsoGeo: THREE.BoxGeometry;
  sashGeo: THREE.BoxGeometry;
  armGeo: THREE.BoxGeometry;
  headGeo: THREE.BoxGeometry;
  hitboxGeo: THREE.BoxGeometry;
  ringGeo: THREE.RingGeometry;
}

function attachNpcHat(
  group: THREE.Group,
  hatStyle: NpcHatStyle | undefined,
  shirtMat: THREE.MeshStandardMaterial,
  accentMat: THREE.MeshStandardMaterial,
  res: SharedNpcResources
): void {
  switch (hatStyle) {
    case 'captain_cap': {
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.33, 0.2, 10), shirtMat);
      crown.position.set(0, 2.16, 0);
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.28), res.timberMat);
      visor.position.set(0, 2.08, 0.28);
      const badge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.06), accentMat);
      badge.position.set(0, 2.18, 0.34);
      group.add(crown, visor, badge);
      break;
    }
    case 'straw': {
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.6, 0.06, 12), accentMat);
      brim.position.set(0, 2.07, 0);
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.22, 12), accentMat);
      crown.position.set(0, 2.2, 0);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 12), shirtMat);
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
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.36, 10), accentMat);
      cap.position.set(0, 2.22, 0);
      const spotL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), res.whiteMat);
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
      const furTrim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.09, 6, 12), res.whiteMat);
      furTrim.position.set(0, 1.84, 0.24);
      group.add(hood, furTrim);
      break;
    }
    case 'sun_turban': {
      const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.14, 8, 12), accentMat);
      wrap.rotation.x = Math.PI / 2;
      wrap.position.set(0, 2.12, 0);
      const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), shirtMat);
      jewel.position.set(0, 2.16, 0.36);
      group.add(wrap, jewel);
      break;
    }
    case 'laurel': {
      const wreath = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.055, 6, 12), accentMat);
      wreath.rotation.x = Math.PI / 2 - 0.15;
      wreath.position.set(0, 2.08, 0);
      group.add(wreath);
      break;
    }
    case 'diving_helm': {
      const helm = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), res.bronzeMat);
      helm.position.set(0, 1.84, 0);
      const porthole = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 10), accentMat);
      porthole.rotation.x = Math.PI / 2;
      porthole.position.set(0, 1.84, 0.36);
      group.add(helm, porthole);
      break;
    }
    case 'tricorn': {
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.22, 8), res.darkLeatherMat);
      crown.position.set(0, 2.14, 0);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.06, 3), res.darkLeatherMat);
      brim.position.set(0, 2.06, 0);
      const trim = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.03, 3), accentMat);
      trim.position.set(0, 2.09, 0);
      group.add(crown, brim, trim);
      break;
    }
    case 'pith_helmet': {
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.54, 0.06, 12), res.khakiMat);
      brim.position.set(0, 2.08, 0);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), res.khakiMat);
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
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 0.16, 10), accentMat);
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

  const counter = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.92, 0.9), baseMat);
  counter.position.set(0, 0.46, 0);
  counter.castShadow = true;
  counter.receiveShadow = true;
  stall.add(counter);

  [-0.95, 0.95].forEach((px) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 2.4, 7), baseMat);
    post.position.set(px, 1.2, -0.3);
    stall.add(post);
  });

  if (style === 'ice_igloo') {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.25, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.5), roofMat);
    dome.position.set(0, 2.2, -0.15);
    stall.add(dome);
  } else if (style === 'sun_gazebo' || style === 'amber_pavilion') {
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.55, 0.82, 6), roofMat);
    roof.position.set(0, 2.65, -0.1);
    stall.add(roof);
  } else {
    const awning = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.16, 1.4), roofMat);
    awning.position.set(0, 2.38, -0.05);
    awning.rotation.x = 0.16;
    stall.add(awning);
  }

  const signGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), accentMat);
  signGem.position.set(0, 2.04, 0.5);
  const displayCrate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.46), accentMat);
  displayCrate.position.set(-0.55, 1.12, 0.06);
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

  const desk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.94, 8), baseMat);
  desk.position.set(0, 0.47, 0);
  desk.receiveShadow = true;
  table.add(desk);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 6, 14), accentMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, 0.95, 0);
  table.add(rim);

  let crystalGeo: THREE.BufferGeometry = new THREE.IcosahedronGeometry(0.22, 0);
  if (style === 'brass_scale' || style === 'solar_astrolabe' || style === 'chest_compass') {
    crystalGeo = new THREE.TorusGeometry(0.22, 0.05, 6, 12);
  } else if (style === 'frost_prism' || style === 'rune_lectern') {
    crystalGeo = new THREE.OctahedronGeometry(0.24, 0);
  } else if (style === 'abyssal_orb' || style === 'pearl_basin') {
    crystalGeo = new THREE.SphereGeometry(0.22, 10, 8);
  } else if (style === 'magma_anvil' || style === 'fossil_desk') {
    crystalGeo = new THREE.BoxGeometry(0.32, 0.22, 0.32);
  }

  const crystal = new THREE.Mesh(crystalGeo, accentMat);
  crystal.position.set(0, 1.3, 0);
  table.add(crystal);

  return { table, crystal };
}

function createNpcActorShared(
  spawn: FischNpcSpawn,
  isNight: boolean,
  res: SharedNpcResources
): NpcActorHandle {
  const group = new THREE.Group();
  const baseY = getGroundHeightAtWorld(spawn.x, spawn.z);
  group.position.set(spawn.x, baseY, spawn.z);
  group.rotation.y = spawn.yaw;

  let crystalMesh: THREE.Mesh | undefined;

  if (spawn.role === 'altar') {
    const runeMat = new THREE.MeshStandardMaterial({
      color: '#7B3FE4',
      emissive: '#7B3FE4',
      emissiveIntensity: isNight ? 1.45 : 0.45,
      roughness: 0.28,
      metalness: 0.45,
    });
    const baseStep = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 2.05, 0.36, 8), res.stoneMat);
    baseStep.position.y = 0.18;
    baseStep.receiveShadow = true;

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1.15, 1.38, 8), res.stoneMat);
    plinth.position.y = 1.05;
    plinth.castShadow = true;

    const runeRing = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.065, 6, 18), runeMat);
    runeRing.rotation.x = Math.PI / 2;
    runeRing.position.y = 1.8;

    crystalMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.48, 0), runeMat);
    crystalMesh.position.y = 2.55;
    crystalMesh.castShadow = true;

    group.add(baseStep, plinth, runeRing, crystalMesh);
  } else {
    const shirtMat = new THREE.MeshStandardMaterial({
      color: spawn.shirtHex,
      roughness: 0.72,
      metalness: 0.08,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: spawn.accentHex,
      emissive: spawn.role === 'merlin' || spawn.role === 'appraiser' ? spawn.accentHex : '#000000',
      emissiveIntensity: spawn.role === 'merlin' ? 0.45 : spawn.role === 'appraiser' ? 0.28 : 0,
      roughness: 0.3,
      metalness: 0.35,
    });

    const legL = new THREE.Mesh(res.legGeo, res.pantsMat);
    legL.position.set(-0.18, 0.36, 0);
    legL.castShadow = true;
    const legR = new THREE.Mesh(res.legGeo, res.pantsMat);
    legR.position.set(0.18, 0.36, 0);
    legR.castShadow = true;

    const torso = new THREE.Mesh(res.torsoGeo, shirtMat);
    torso.position.set(0, 1.1, 0);
    torso.castShadow = true;

    const sash = new THREE.Mesh(res.sashGeo, accentMat);
    sash.position.set(0, 0.96, 0);

    const armL = new THREE.Mesh(res.armGeo, shirtMat);
    armL.position.set(-0.52, 1.1, 0);
    const armR = new THREE.Mesh(res.armGeo, shirtMat);
    armR.position.set(0.52, 1.1, 0);

    const headFront = spawn.role === 'merlin' ? res.merlinHeadFrontMat : res.npcHeadFrontMat;
    const head = new THREE.Mesh(res.headGeo, [
      res.skinMat,
      res.skinMat,
      res.skinMat,
      res.skinMat,
      headFront,
      res.skinMat,
    ]);
    head.position.set(0, 1.78, 0);
    head.castShadow = true;

    group.add(legL, legR, torso, sash, armL, armR, head);

    if (spawn.role === 'merlin') {
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.06, 12), shirtMat);
      brim.position.set(0, 2.07, 0);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.66, 10), shirtMat);
      cone.position.set(0, 2.4, 0);
      const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.85, 6), res.timberMat);
      staff.position.set(0.66, 0.92, 0.2);
      crystalMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), accentMat);
      crystalMesh.position.set(0.66, 1.94, 0.2);
      group.add(brim, cone, staff, crystalMesh);
    } else if (spawn.role === 'merchant') {
      attachNpcHat(group, spawn.hatStyle, shirtMat, accentMat, res);
      const stall = buildMerchantStall(spawn.stallStyle, accentMat);
      stall.position.set(-1.65, 0, -0.2);
      group.add(stall);
    } else if (spawn.role === 'appraiser') {
      attachNpcHat(group, spawn.hatStyle, shirtMat, accentMat, res);
      const { table, crystal } = buildAppraiserTable(spawn.tableStyle, accentMat);
      table.position.set(1.15, 0, 0.35);
      crystalMesh = crystal;
      group.add(table);
    } else {
      attachNpcHat(group, spawn.hatStyle, shirtMat, accentMat, res);
    }
  }

  const nameplateSprite = createNameplateSprite(spawn.name, spawn.subtitle, spawn.accentHex);
  nameplateSprite.position.set(0, spawn.role === 'altar' ? 3.55 : 2.95, 0);
  group.add(nameplateSprite);

  const ringMat = new THREE.MeshBasicMaterial({
    color: spawn.accentHex,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ringMesh = new THREE.Mesh(res.ringGeo, ringMat);
  ringMesh.rotation.x = -Math.PI / 2;
  ringMesh.position.y = 0.04;
  group.add(ringMesh);

  const hitboxMesh = new THREE.Mesh(res.hitboxGeo, new THREE.MeshBasicMaterial({ visible: false }));
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
    nameplateSprite,
    crystalMesh,
    baseY,
  };
}

// ============================================================
// 3. Bobber, Caught Fish & 4 Drivable Boats
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

  const baseHull = new THREE.Mesh(new THREE.BoxGeometry(width, 0.56, length * 0.76), hullMat);
  baseHull.position.y = 0.24;
  baseHull.castShadow = true;
  baseHull.receiveShadow = true;
  hullGroup.add(baseHull);

  const bow = new THREE.Mesh(new THREE.ConeGeometry(width * 0.52, length * 0.34, 4), hullMat);
  bow.rotation.x = Math.PI / 2;
  bow.rotation.y = Math.PI / 4;
  bow.scale.set(1.0, 1.0, 0.54);
  bow.position.set(0, 0.28, length * 0.48);
  bow.castShadow = true;
  hullGroup.add(bow);

  const railL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, length * 0.76), accentMat);
  railL.position.set(-width * 0.46, 0.62, 0);
  const railR = railL.clone();
  railR.position.x = width * 0.46;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(width * 0.82, 0.08, length * 0.72), trimMat);
  deck.position.set(0, 0.54, 0);
  hullGroup.add(railL, railR, deck);

  const bowLantern = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.18), lanternGlowMat);
  bowLantern.position.set(0, 0.78, length * 0.45);
  hullGroup.add(bowLantern);

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
// 4. Seamless Open-World Archipelago Environment (All 11 Islands Loaded Live)
// ============================================================

function addPineTree(
  parent: THREE.Group,
  x: number,
  y: number,
  z: number,
  scale: number,
  trunkMat: THREE.Material,
  leafMat: THREE.Material,
  snowTopMat?: THREE.Material
): void {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * scale, 0.28 * scale, 2.1 * scale, 6), trunkMat);
  trunk.position.set(x, y + 1.0 * scale, z);
  trunk.castShadow = true;
  const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.3 * scale, 2.0 * scale, 7), leafMat);
  c1.position.set(x, y + 2.4 * scale, z);
  c1.castShadow = true;
  const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.95 * scale, 1.6 * scale, 7), snowTopMat ?? leafMat);
  c2.position.set(x, y + 3.45 * scale, z);
  c2.castShadow = true;
  parent.add(trunk, c1, c2);
}

function addPalmTree(
  parent: THREE.Group,
  x: number,
  y: number,
  z: number,
  tiltX: number,
  tiltZ: number,
  scale: number,
  trunkMat: THREE.Material,
  frondMat: THREE.Material
): void {
  const palm = new THREE.Group();
  palm.position.set(x, y, z);
  let curY = 0;
  let curX = 0;
  let curZ = 0;
  for (let s = 0; s < 4; s += 1) {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.24 * scale, 1.05 * scale, 6), trunkMat);
    curX += tiltX * s * 0.22 * scale;
    curZ += tiltZ * s * 0.22 * scale;
    curY += 0.9 * scale;
    seg.position.set(curX, curY - 0.45 * scale, curZ);
    seg.rotation.z = -tiltX * 0.22;
    seg.rotation.x = tiltZ * 0.22;
    seg.castShadow = true;
    palm.add(seg);
  }
  const crownCenter = new THREE.Group();
  crownCenter.position.set(curX, curY, curZ);
  for (let f = 0; f < 5; f += 1) {
    const frond = new THREE.Mesh(new THREE.BoxGeometry(0.45 * scale, 0.08 * scale, 2.1 * scale), frondMat);
    const ang = (f / 5) * Math.PI * 2;
    frond.position.set(Math.cos(ang) * 0.95 * scale, 0.1 * scale, Math.sin(ang) * 0.95 * scale);
    frond.rotation.y = -ang + Math.PI / 2;
    frond.rotation.x = 0.28;
    frond.castShadow = true;
    crownCenter.add(frond);
  }
  palm.add(crownCenter);
  parent.add(palm);
}

export function buildArchipelagoEnvironment(
  isDarkMode: boolean,
  maxAnisotropy: number,
  isSoftwareGl: boolean
): ArchipelagoEnvironmentHandle {
  const group = new THREE.Group();

  // Shared Textures & Pier Materials
  const woodTex = createWoodPlankTexture(maxAnisotropy);
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.82, metalness: 0.04 });
  const darkTimberMat = new THREE.MeshStandardMaterial({ color: '#4A311E', roughness: 0.88, metalness: 0.04 });
  const bambooMat = new THREE.MeshStandardMaterial({ color: '#C5A059', roughness: 0.72, metalness: 0.05 });
  const stonePierMat = new THREE.MeshStandardMaterial({ color: '#9BA3AD', roughness: 0.82, metalness: 0.08 });
  const steelPierMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.45, metalness: 0.65 });
  const obsidianPierMat = new THREE.MeshStandardMaterial({ color: '#1E1B2E', roughness: 0.68, metalness: 0.25 });
  const crystalBridgeMat = new THREE.MeshStandardMaterial({
    color: '#38BDF8',
    emissive: '#0284C7',
    emissiveIntensity: 0.72,
    roughness: 0.2,
    metalness: 0.2,
  });

  const brassMat = new THREE.MeshStandardMaterial({ color: '#B48A3E', roughness: 0.28, metalness: 0.82 });
  const bollardCapMat = new THREE.MeshStandardMaterial({ color: '#9CA3AF', roughness: 0.3, metalness: 0.75 });
  const sharedLanternGlassMat = new THREE.MeshStandardMaterial({
    color: '#FDE68A',
    emissive: '#F59E0B',
    emissiveIntensity: isDarkMode ? 1.55 : 0.45,
    roughness: 0.2,
  });
  const lanternGlassMats: THREE.MeshStandardMaterial[] = [sharedLanternGlassMat];

  // Shared NPC resources (prevents creating 77 duplicate textures/geos)
  const npcFaceTex = createRobloxFaceTexture('npc');
  const merlinFaceTex = createRobloxFaceTexture('merlin');
  const sharedNpcRes: SharedNpcResources = {
    skinMat: new THREE.MeshStandardMaterial({ color: '#FAD7A0', roughness: 0.62 }),
    pantsMat: new THREE.MeshStandardMaterial({ color: '#243447', roughness: 0.8 }),
    timberMat: darkTimberMat,
    whiteMat: new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.75 }),
    bronzeMat: brassMat,
    darkLeatherMat: new THREE.MeshStandardMaterial({ color: '#291D18', roughness: 0.78 }),
    khakiMat: new THREE.MeshStandardMaterial({ color: '#D6C7A2', roughness: 0.78 }),
    stoneMat: new THREE.MeshStandardMaterial({ color: '#3F4A59', roughness: 0.86, metalness: 0.12 }),
    npcHeadFrontMat: new THREE.MeshStandardMaterial({ map: npcFaceTex, roughness: 0.58 }),
    merlinHeadFrontMat: new THREE.MeshStandardMaterial({ map: merlinFaceTex, roughness: 0.58 }),
    legGeo: new THREE.BoxGeometry(0.32, 0.72, 0.34),
    torsoGeo: new THREE.BoxGeometry(0.74, 0.74, 0.4),
    sashGeo: new THREE.BoxGeometry(0.78, 0.22, 0.43),
    armGeo: new THREE.BoxGeometry(0.25, 0.68, 0.28),
    headGeo: new THREE.BoxGeometry(0.56, 0.56, 0.56),
    hitboxGeo: new THREE.BoxGeometry(2.0, 3.2, 2.0),
    ringGeo: new THREE.RingGeometry(0.95, 1.22, 20),
  };

  // Two lightweight hero PointLights kept near center harbor / Moosewood
  const lanternLights: THREE.PointLight[] = [];
  const pt1 = new THREE.PointLight('#FBBF24', isDarkMode ? 2.6 : 0.6, 28, 1.4);
  pt1.position.set(0, 3.2, 13);
  const pt2 = new THREE.PointLight('#FBBF24', isDarkMode ? 2.2 : 0.45, 28, 1.4);
  pt2.position.set(0, 3.2, -7);
  group.add(pt1, pt2);
  lanternLights.push(pt1, pt2);

  // Biome Palettes for the 11 Islands
  const groundPalette: Record<
    string,
    { primary: [string, string]; secondary: string; stone: string; shelf: string }
  > = {
    moosewood: { primary: ['#4A7A58', '#386144'], secondary: '#3A6647', stone: '#9A968A', shelf: '#D5C398' },
    roslit_bay: { primary: ['#E3CFA0', '#CCB47E'], secondary: '#558F6A', stone: '#B5ADA0', shelf: '#F1E2BC' },
    mushgrove: { primary: ['#395948', '#284033'], secondary: '#2E4C3E', stone: '#4B5B53', shelf: '#2A3F35' },
    roslit_volcano: { primary: ['#332220', '#1E1413'], secondary: '#241716', stone: '#47312E', shelf: '#1B1110' },
    snowcap: { primary: ['#E2F0F7', '#C3DFEE'], secondary: '#CFE6F4', stone: '#9FB6C8', shelf: '#A2C4D9' },
    sunstone: { primary: ['#DFB56A', '#C29548'], secondary: '#D1A04D', stone: '#C49A52', shelf: '#E8CFA0' },
    sovereignty: { primary: ['#7E8B98', '#626F7C'], secondary: '#9AA7B5', stone: '#CBD5E1', shelf: '#6B7A88' },
    desolate_deep: { primary: ['#1A2836', '#101B26'], secondary: '#223648', stone: '#334155', shelf: '#0F1B26' },
    forsaken_shores: { primary: ['#6E5443', '#4E392C'], secondary: '#574133', stone: '#524943', shelf: '#8F765D' },
    ancient_isle: { primary: ['#7F7A54', '#635E3D'], secondary: '#4C734B', stone: '#6D6857', shelf: '#A39773' },
    the_depths: { primary: ['#1E3349', '#122132'], secondary: '#283E5A', stone: '#19293D', shelf: '#132030' },
  };

  const trunkMat = new THREE.MeshStandardMaterial({ color: '#6B4423', roughness: 0.88 });
  const spinningCrystals: Array<{ mesh: THREE.Object3D; baseY: number; speed: number }> = [];
  const lighthouseRotators: THREE.Object3D[] = [];
  const dynamicFishCenters: Array<{ x: number; z: number; radius: number }> = [];

  // Shared Pilings/Rock/Buoy geometries
  const pilingGeo = new THREE.CylinderGeometry(0.18, 0.21, 3.8, 7);
  const lanternPostGeo = new THREE.CylinderGeometry(0.055, 0.075, 1.15, 6);
  const lanternGlobeGeo = new THREE.BoxGeometry(0.22, 0.28, 0.22);
  const lanternCapGeo = new THREE.ConeGeometry(0.22, 0.14, 4);

  // Build ALL 11 Uniquely Shaped & Detailed Islands Simultaneously!
  for (const island of FISCH_ISLANDS) {
    const layout = getIslandLayout(island.id);
    const pal = groundPalette[island.id] ?? groundPalette.moosewood;

    const primaryTex = createGroundStoneTexture(pal.primary[0], pal.primary[1], maxAnisotropy);
    const primaryMat = new THREE.MeshStandardMaterial({
      map: primaryTex,
      roughness: island.id === 'snowcap' ? 0.45 : 0.88,
      metalness: 0.04,
    });
    const secondaryMat = new THREE.MeshStandardMaterial({
      color: pal.secondary,
      roughness: island.id === 'snowcap' ? 0.4 : 0.86,
      metalness: 0.05,
    });
    const stoneMat = new THREE.MeshStandardMaterial({
      color: pal.stone,
      roughness: island.id === 'sovereignty' ? 0.55 : 0.85,
      metalness: 0.08,
    });
    const shelfMat = new THREE.MeshStandardMaterial({
      color: pal.shelf,
      roughness: 0.9,
      metalness: 0.02,
    });
    const craterMat = new THREE.MeshStandardMaterial({
      color: '#1C362B',
      emissive: '#064E3B',
      emissiveIntensity: 0.28,
      roughness: 0.78,
    });

    const islGroup = new THREE.Group();
    islGroup.position.set(island.worldCoords.x, 0, island.worldCoords.z);
    islGroup.rotation.y = layout.dockAngle;

    // 1. Multi-Lobe Unique Island Geometry
    for (const lobe of layout.lobes) {
      const mat =
        lobe.tint === 'stone'
          ? stoneMat
          : lobe.tint === 'secondary'
          ? secondaryMat
          : lobe.tint === 'crater'
          ? craterMat
          : primaryMat;

      const cylH = lobe.height + 1.8;
      const sides = lobe.sides ?? 20;
      const body = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.12, cylH, sides), mat);
      body.scale.set(lobe.rx, 1, lobe.rz);
      body.position.set(lobe.lx, (lobe.height - 1.8) * 0.5, lobe.lz);
      body.receiveShadow = true;
      islGroup.add(body);

      if (lobe.tint !== 'crater') {
        const shelfH = 1.4;
        const shelf = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.15, shelfH, sides), shelfMat);
        shelf.scale.set(lobe.rx * 1.18, 1, lobe.rz * 1.18);
        shelf.position.set(lobe.lx, -0.64, lobe.lz);
        shelf.receiveShadow = true;
        islGroup.add(shelf);
      }

      if (lobe.hillPeak && lobe.hillPeak > 0) {
        const mound = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.88, lobe.hillPeak, sides), mat);
        mound.scale.set(lobe.rx, 1, lobe.rz);
        mound.position.set(lobe.lx, lobe.height + lobe.hillPeak * 0.45, lobe.lz);
        mound.receiveShadow = true;
        islGroup.add(mound);
      }
    }

    // 2. Bridges, Elevated Ramps & Boardwalks
    for (const br of layout.bridges) {
      const brMat =
        br.style === 'bamboo'
          ? bambooMat
          : br.style === 'stone'
          ? stonePierMat
          : br.style === 'obsidian'
          ? obsidianPierMat
          : br.style === 'crystal'
          ? crystalBridgeMat
          : woodMat;
      const railMat =
        br.style === 'crystal' ? crystalBridgeMat : br.style === 'stone' ? stoneMat : darkTimberMat;

      const dx = br.x2 - br.x1;
      const dz = br.z2 - br.z1;
      const len = Math.hypot(dx, dz);
      const yaw = Math.atan2(dx, dz);
      const segs = br.arch || Math.abs(br.y2 - br.y1) > 0.08 ? 6 : 2;

      for (let i = 0; i < segs; i += 1) {
        const t0 = i / segs;
        const t1 = (i + 1) / segs;
        const tm = (t0 + t1) * 0.5;
        const y0 = THREE.MathUtils.lerp(br.y1, br.y2, t0) + (br.arch ? Math.sin(t0 * Math.PI) * br.arch : 0);
        const y1 = THREE.MathUtils.lerp(br.y1, br.y2, t1) + (br.arch ? Math.sin(t1 * Math.PI) * br.arch : 0);
        const ym = (y0 + y1) * 0.5;
        const segLen = (len / segs) + 0.18;
        const slopePitch = Math.atan2(y1 - y0, len / segs);

        const plank = new THREE.Mesh(new THREE.BoxGeometry(br.width, 0.2, segLen), brMat);
        plank.position.set(br.x1 + dx * tm, ym - 0.1, br.z1 + dz * tm);
        plank.rotation.order = 'YXZ';
        plank.rotation.y = yaw;
        plank.rotation.x = -slopePitch;
        plank.receiveShadow = true;
        plank.castShadow = true;
        islGroup.add(plank);

        // Bridge side posts at endpoints & middle
        if (i === 0 || i === segs - 1 || i === Math.floor(segs / 2)) {
          const perpX = Math.cos(yaw) * (br.width * 0.48);
          const perpZ = -Math.sin(yaw) * (br.width * 0.48);
          [-1, 1].forEach((side) => {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.85, 6), railMat);
            post.position.set(br.x1 + dx * tm + perpX * side, ym + 0.4, br.z1 + dz * tm + perpZ * side);
            islGroup.add(post);
          });
        }
      }
    }

    // 3. Unique Island Pier, T-Head Dock, Pilings & Lanterns
    const { pier } = layout;
    const pierDeckMat =
      pier.style === 'bamboo'
        ? bambooMat
        : pier.style === 'stone'
        ? stonePierMat
        : pier.style === 'steel'
        ? steelPierMat
        : pier.style === 'obsidian'
        ? obsidianPierMat
        : woodMat;
    const pierLen = pier.endZ - pier.startZ;
    const pierMidZ = (pier.startZ + pier.endZ) * 0.5;
    const headCenterZ = pier.endZ - pier.headDepth * 0.45;

    const mainPierMesh = new THREE.Mesh(
      new THREE.BoxGeometry(pier.width, 0.24, pierLen),
      pierDeckMat
    );
    mainPierMesh.position.set(0, pier.elevation - 0.12, pierMidZ);
    mainPierMesh.receiveShadow = true;
    mainPierMesh.castShadow = true;

    const headPierMesh = new THREE.Mesh(
      new THREE.BoxGeometry(pier.headWidth, 0.24, pier.headDepth),
      pierDeckMat
    );
    headPierMesh.position.set(0, pier.elevation - 0.12, headCenterZ);
    headPierMesh.receiveShadow = true;
    headPierMesh.castShadow = true;
    islGroup.add(mainPierMesh, headPierMesh);

    // Pier Pilings & Dock Bollards
    const pHalfW = pier.width * 0.46;
    const hHalfW = pier.headWidth * 0.46;
    const pierPosts: Array<[number, number]> = [
      [-pHalfW, pier.startZ + 1.5],
      [pHalfW, pier.startZ + 1.5],
      [-pHalfW, (pier.startZ + headCenterZ) * 0.5],
      [pHalfW, (pier.startZ + headCenterZ) * 0.5],
      [-hHalfW, headCenterZ - pier.headDepth * 0.42],
      [hHalfW, headCenterZ - pier.headDepth * 0.42],
      [-hHalfW, pier.endZ - 0.25],
      [hHalfW, pier.endZ - 0.25],
    ];
    for (const [px, pz] of pierPosts) {
      const piling = new THREE.Mesh(pilingGeo, darkTimberMat);
      piling.position.set(px, -0.75, pz);
      islGroup.add(piling);
    }

    // Pier Corner Lanterns (shared emissive material)
    const lanternSpots: Array<[number, number]> = [
      [-hHalfW, pier.endZ - 0.3],
      [hHalfW, pier.endZ - 0.3],
    ];
    for (const [lx, lz] of lanternSpots) {
      const post = new THREE.Mesh(lanternPostGeo, darkTimberMat);
      post.position.set(lx, pier.elevation + 0.55, lz);
      const globe = new THREE.Mesh(lanternGlobeGeo, sharedLanternGlassMat);
      globe.position.set(lx, pier.elevation + 1.18, lz);
      const cap = new THREE.Mesh(lanternCapGeo, brassMat);
      cap.position.set(lx, pier.elevation + 1.38, lz);
      cap.rotation.y = Math.PI / 4;
      islGroup.add(post, globe, cap);
    }

    // Harbor Welcome Beacon Arch on pier neck + island harbor nameplate sprite!
    const harborGatePostL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.13, 3.0, 7),
      pier.style === 'stone' ? stoneMat : darkTimberMat
    );
    harborGatePostL.position.set(-pHalfW, pier.elevation + 1.4, pier.startZ + 1.2);
    const harborGatePostR = harborGatePostL.clone();
    harborGatePostR.position.x = pHalfW;
    const harborBeam = new THREE.Mesh(
      new THREE.BoxGeometry(pier.width + 0.4, 0.28, 0.32),
      new THREE.MeshStandardMaterial({ color: island.accentHex, roughness: 0.45 })
    );
    harborBeam.position.set(0, pier.elevation + 2.85, pier.startZ + 1.2);
    islGroup.add(harborGatePostL, harborGatePostR, harborBeam);

    const harborBanner = createNameplateSprite(island.name, island.subtitle, island.accentHex);
    harborBanner.scale.set(6.8, 2.0, 1);
    harborBanner.position.set(0, 7.6, 8.2);
    islGroup.add(harborBanner);

    // Record world coordinate around pier tip for ambient fish schools
    const dockTipWorld = new THREE.Vector3(0, 0, pier.endZ + 4)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), layout.dockAngle)
      .add(new THREE.Vector3(island.worldCoords.x, 0, island.worldCoords.z));
    dynamicFishCenters.push({ x: dockTipWorld.x, z: dockTipWorld.z, radius: 6.5 });

    // 4. Bespoke High-Detail Procedural Island Architecture & Landmarks
    if (island.id === 'moosewood') {
      // Striped Coastal Lighthouse on West Bluff (-11.2, -11.8, h=1.38)
      const lhBaseY = getGroundHeightAt('moosewood', -11.2, -11.8);
      const redMat = new THREE.MeshStandardMaterial({ color: '#DC2626', roughness: 0.58 });
      const whiteMat = new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.55 });
      const lhFoot = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.4, 0.8, 12), stoneMat);
      lhFoot.position.set(-11.2, lhBaseY + 0.35, -11.8);
      islGroup.add(lhFoot);

      for (let band = 0; band < 5; band += 1) {
        const rb = 1.65 - band * 0.12;
        const rt = 1.53 - band * 0.12;
        const seg = new THREE.Mesh(
          new THREE.CylinderGeometry(rt, rb, 1.55, 12),
          band % 2 === 0 ? whiteMat : redMat
        );
        seg.position.set(-11.2, lhBaseY + 1.45 + band * 1.5, -11.8);
        seg.castShadow = true;
        islGroup.add(seg);
      }
      const gallery = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.25, 0.35, 12), darkTimberMat);
      gallery.position.set(-11.2, lhBaseY + 8.6, -11.8);
      const beaconRoom = new THREE.Mesh(
        new THREE.CylinderGeometry(0.92, 0.92, 1.2, 10),
        new THREE.MeshStandardMaterial({ color: '#FEF08A', emissive: '#F59E0B', emissiveIntensity: 1.5 })
      );
      beaconRoom.position.set(-11.2, lhBaseY + 9.3, -11.8);
      const lhCap = new THREE.Mesh(new THREE.ConeGeometry(1.35, 1.35, 12), redMat);
      lhCap.position.set(-11.2, lhBaseY + 10.55, -11.8);
      const beamRotor = new THREE.Group();
      beamRotor.position.set(-11.2, lhBaseY + 9.3, -11.8);
      const lightCone = new THREE.Mesh(
        new THREE.ConeGeometry(1.2, 6.2, 8, 1, true),
        new THREE.MeshBasicMaterial({ color: '#FEF08A', transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide })
      );
      lightCone.rotation.z = Math.PI / 2;
      lightCone.position.x = 3.2;
      beamRotor.add(lightCone);
      lighthouseRotators.push(beamRotor);
      islGroup.add(gallery, beaconRoom, lhCap, beamRotor);

      // East Boathouse Cabin on East Terrace (11.2, -10.2, h=1.08)
      const cabY = getGroundHeightAt('moosewood', 11.8, -8.2);
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.7, 3.4), new THREE.MeshStandardMaterial({ color: '#B08968', roughness: 0.84 }));
      cabin.position.set(11.8, cabY + 1.3, -8.2);
      cabin.castShadow = true;
      const cabRoof = new THREE.Mesh(new THREE.ConeGeometry(3.35, 1.85, 4), redMat);
      cabRoof.rotation.y = Math.PI / 4;
      cabRoof.position.set(11.8, cabY + 3.55, -8.2);
      const winGlow = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 3.46), sharedLanternGlassMat);
      winGlow.position.set(11.8, cabY + 1.45, -8.2);
      islGroup.add(cabin, cabRoof, winGlow);

      // Pine Trees across Moosewood edges
      const mwLeaf = new THREE.MeshStandardMaterial({ color: '#236B4E', roughness: 0.78 });
      [
        [-8.2, -16.0, 1.25],
        [-5.4, -13.8, 1.05],
        [7.6, -15.6, 1.2],
        [14.2, -13.6, 1.15],
        [-13.5, -7.4, 1.1],
        [4.8, -16.8, 1.1],
      ].forEach(([tx, tz, ts]) => addPineTree(islGroup, tx, getGroundHeightAt('moosewood', tx, tz), tz, ts, trunkMat, mwLeaf));
    } else if (island.id === 'roslit_bay') {
      const palmLeafMat = new THREE.MeshStandardMaterial({ color: '#2E9E6B', roughness: 0.72 });
      [
        [-10.8, -4.5, -0.45, 0.25, 1.15],
        [-11.2, -12.8, -0.5, -0.35, 1.25],
        [10.8, -4.2, 0.48, 0.22, 1.18],
        [11.0, -13.0, 0.52, -0.3, 1.28],
        [-5.2, -17.8, -0.3, -0.45, 1.1],
        [5.4, -17.6, 0.35, -0.42, 1.2],
      ].forEach(([px, pz, rx, rz, ps]) =>
        addPalmTree(islGroup, px, getGroundHeightAt('roslit_bay', px, pz), pz, rx, rz, ps, trunkMat, palmLeafMat)
      );

      // Vibrant Coral Reef Clusters framing the inner turquoise lagoon
      const coralColors = ['#FB7185', '#2DD4BF', '#FBBF24', '#C084FC'];
      [
        [-4.2, -12.6, 0],
        [4.2, -12.4, 1],
        [-6.4, -6.2, 2],
        [6.4, -6.2, 3],
        [0, -18.5, 0],
      ].forEach(([cx, cz, ci]) => {
        const cMat = new THREE.MeshStandardMaterial({ color: coralColors[ci % coralColors.length], roughness: 0.45 });
        const brain = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 0), cMat);
        brain.position.set(cx, 0.35, cz);
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.4, 5), cMat);
        horn.position.set(cx + 0.5, 0.85, cz - 0.2);
        horn.rotation.z = -0.35;
        islGroup.add(brain, horn);
      });
    } else if (island.id === 'mushgrove') {
      // Giant Bioluminescent Swamp Mushrooms + Lilypads across the 4 muddy islets
      const stemMat = new THREE.MeshStandardMaterial({ color: '#D6D3D1', roughness: 0.82 });
      const glowCaps = [
        new THREE.MeshStandardMaterial({ color: '#10B981', emissive: '#059669', emissiveIntensity: 0.85, roughness: 0.4 }),
        new THREE.MeshStandardMaterial({ color: '#2DD4BF', emissive: '#0D9488', emissiveIntensity: 0.85, roughness: 0.4 }),
      ];
      [
        [-12.2, -10.4, 1.45, 0],
        [-10.2, -14.0, 1.8, 1],
        [12.4, -10.2, 1.5, 1],
        [10.4, -14.2, 1.75, 0],
        [-4.2, -18.8, 2.0, 0],
        [4.2, -18.6, 1.85, 1],
        [-5.2, -5.0, 1.15, 1],
        [5.2, -5.0, 1.15, 0],
      ].forEach(([mx, mz, ms, ci]) => {
        const my = getGroundHeightAt('mushgrove', mx, mz);
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.26 * ms, 0.4 * ms, 2.7 * ms, 7), stemMat);
        stalk.position.set(mx, my + 1.3 * ms, mz);
        stalk.castShadow = true;
        const cap = new THREE.Mesh(new THREE.ConeGeometry(1.55 * ms, 1.05 * ms, 9), glowCaps[ci % 2]);
        cap.position.set(mx, my + 2.7 * ms, mz);
        islGroup.add(stalk, cap);
      });

      // Swamp Lilypads floating in the water channels between the islets
      const padMat = new THREE.MeshStandardMaterial({ color: '#15803D', roughness: 0.68 });
      [
        [0, -10.8],
        [-3.4, -11.2],
        [3.4, -11.0],
        [-6.8, -3.5],
        [6.8, -3.5],
      ].forEach(([lx, lz]) => {
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.08, 10), padMat);
        pad.position.set(lx, 0.08, lz);
        islGroup.add(pad);
      });
    } else if (island.id === 'sunstone') {
      // Merlin's Tall Octagonal Wizard Tower atop Tier 3 Summit (0, -19.8) + Orbiting Astrolabe Rings!
      const baseY = getGroundHeightAt('sunstone', 0, -19.2);
      const goldWallMat = new THREE.MeshStandardMaterial({ color: '#D9A952', roughness: 0.65, metalness: 0.15 });
      const wizRoofMat = new THREE.MeshStandardMaterial({ color: '#4C1D95', roughness: 0.42, metalness: 0.25 });
      const glowGoldMat = new THREE.MeshStandardMaterial({
        color: '#FDE047',
        emissive: '#F59E0B',
        emissiveIntensity: 1.1,
        metalness: 0.75,
        roughness: 0.2,
      });

      const towerBody = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.7, 8.8, 8), goldWallMat);
      towerBody.position.set(0, baseY + 4.3, -19.5);
      towerBody.castShadow = true;
      const wizSpire = new THREE.Mesh(new THREE.ConeGeometry(2.75, 4.2, 8), wizRoofMat);
      wizSpire.position.set(0, baseY + 10.6, -19.5);
      wizSpire.castShadow = true;

      const gyroRing1 = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.14, 8, 20), glowGoldMat);
      gyroRing1.position.set(0, baseY + 8.6, -19.5);
      const gyroRing2 = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.12, 8, 18), glowGoldMat);
      gyroRing2.position.set(0, baseY + 8.6, -19.5);
      gyroRing2.rotation.x = Math.PI / 3;
      spinningCrystals.push(
        { mesh: gyroRing1, baseY: baseY + 8.6, speed: 0.85 },
        { mesh: gyroRing2, baseY: baseY + 8.6, speed: -1.1 }
      );
      islGroup.add(towerBody, wizSpire, gyroRing1, gyroRing2);

      // Ceremonial Sun Pillars flanking Tier 1 & Tier 2
      [-8.5, 8.5].forEach((px) => {
        const obelisk = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 4.4, 6), goldWallMat);
        obelisk.position.set(px, 2.9, -10.5);
        const sunCap = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), glowGoldMat);
        sunCap.position.set(px, 5.4, -10.5);
        islGroup.add(obelisk, sunCap);
      });
    } else if (island.id === 'forsaken_shores') {
      // Giant Stone Skull Monolith on West Peninsula + Half-Sunken Wrecked Pirate Galleon in Cove!
      const skullMat = new THREE.MeshStandardMaterial({ color: '#4B443E', roughness: 0.9 });
      const emberMat = new THREE.MeshStandardMaterial({ color: '#F97316', emissive: '#EA580C', emissiveIntensity: 1.6 });
      const skY = getGroundHeightAt('forsaken_shores', -10.5, -13.2);
      const cranium = new THREE.Mesh(new THREE.DodecahedronGeometry(3.8, 0), skullMat);
      cranium.position.set(-10.5, skY + 3.2, -13.6);
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), emberMat);
      eyeL.position.set(-11.8, skY + 3.4, -10.4);
      const eyeR = eyeL.clone();
      eyeR.position.x = -9.2;
      islGroup.add(cranium, eyeL, eyeR);

      // Half-Sunken Wrecked Pirate Galleon resting in the northern cove water (0, -16.8)!
      const wreck = new THREE.Group();
      wreck.position.set(0, 0.6, -17.0);
      wreck.rotation.z = 0.28;
      wreck.rotation.x = -0.18;
      const wreckHull = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 8.8), darkTimberMat);
      wreckHull.castShadow = true;
      const brokenMast1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 7.6, 7), darkTimberMat);
      brokenMast1.position.set(0, 4.2, -1.2);
      brokenMast1.rotation.z = 0.14;
      const brokenMast2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 5.5, 7), darkTimberMat);
      brokenMast2.position.set(0, 3.0, 2.0);
      brokenMast2.rotation.x = -0.22;
      const tatteredSail = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 2.4, 0.1),
        new THREE.MeshStandardMaterial({ color: '#D6CFC2', roughness: 0.9 })
      );
      tatteredSail.position.set(0, 5.0, -1.1);
      wreck.add(wreckHull, brokenMast1, brokenMast2, tatteredSail);
      islGroup.add(wreck);

      // Brass Harbor Cannons on East Headland & South Sandspit
      const cannonMat = new THREE.MeshStandardMaterial({ color: '#1F2937', roughness: 0.35, metalness: 0.72 });
      [
        [8.5, -5.0, -0.4],
        [-6.2, -1.5, 0.35],
      ].forEach(([cx, cz, ry]) => {
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.34, 1.9, 8), cannonMat);
        barrel.position.set(cx, getGroundHeightAt('forsaken_shores', cx, cz) + 0.55, cz);
        barrel.rotation.x = Math.PI / 2 - 0.2;
        barrel.rotation.z = ry;
        islGroup.add(barrel);
      });
    } else if (island.id === 'snowcap') {
      // Translucent Glacier Spires + Frozen Waterfall + Cozy Glowing Igloo + Snow Pines
      const iceMat = new THREE.MeshStandardMaterial({ color: '#93C5FD', roughness: 0.14, metalness: 0.24 });
      const snowMat = new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.55 });
      const pineMat = new THREE.MeshStandardMaterial({ color: '#1E5245', roughness: 0.8 });

      [
        [-11.8, -16.0, 2.8, 8.8],
        [-7.0, -17.6, 2.2, 6.8],
        [11.5, -15.8, 3.1, 9.6],
        [6.8, -17.4, 2.4, 7.2],
      ].forEach(([ix, iz, r, h]) => {
        const y = getGroundHeightAt('snowcap', ix, iz);
        const spire = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), iceMat);
        spire.position.set(ix, y + h * 0.44, iz);
        spire.castShadow = true;
        islGroup.add(spire);
      });

      // Frozen Waterfall Cascade in center north cliff
      const icefall = new THREE.Mesh(new THREE.BoxGeometry(3.2, 5.2, 1.4), iceMat);
      icefall.position.set(0, 2.2, -18.5);
      icefall.rotation.x = 0.22;
      islGroup.add(icefall);

      // Snow Igloo Cabin
      const igY = getGroundHeightAt('snowcap', -10.5, -4.6);
      const igloo = new THREE.Mesh(new THREE.SphereGeometry(2.1, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), snowMat);
      igloo.position.set(-10.5, igY, -4.6);
      const igDoorGlow = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 0.8), sharedLanternGlassMat);
      igDoorGlow.position.set(-9.4, igY + 0.5, -3.5);
      islGroup.add(igloo, igDoorGlow);

      [
        [9.8, -5.2, 1.15],
        [12.2, -12.0, 1.25],
        [-11.6, -11.5, 1.2],
      ].forEach(([tx, tz, ts]) => addPineTree(islGroup, tx, getGroundHeightAt('snowcap', tx, tz), tz, ts, trunkMat, pineMat, snowMat));
    } else if (island.id === 'roslit_volcano') {
      // Caldera Mountain Cone + Molten Lava River down the Central Gorge + Basalt Columns
      const lavaMat = new THREE.MeshStandardMaterial({
        color: '#EA580C',
        emissive: '#F97316',
        emissiveIntensity: 1.7,
        roughness: 0.25,
      });
      const basaltMat = new THREE.MeshStandardMaterial({ color: '#1F1413', roughness: 0.92 });

      const cone = new THREE.Mesh(new THREE.ConeGeometry(10.5, 14.2, 12, 1, true), basaltMat);
      cone.position.set(0, 7.6, -22.5);
      const craterLava = new THREE.Mesh(new THREE.CircleGeometry(3.8, 12), lavaMat);
      craterLava.rotation.x = -Math.PI / 2;
      craterLava.position.set(0, 14.0, -22.5);

      // Glowing Lava River flowing between West & East Crags under the obsidian arch bridge!
      const lavaStream = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.22, 14.5), lavaMat);
      lavaStream.position.set(0, 0.16, -7.2);
      islGroup.add(cone, craterLava, lavaStream);

      // Hexagonal Basalt Columns & Glow Vents
      [
        [-10.2, -11.5, 4.6],
        [-11.0, -8.5, 3.8],
        [10.2, -11.5, 4.8],
        [11.0, -8.2, 3.6],
      ].forEach(([bx, bz, bh]) => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.25, bh, 6), basaltMat);
        col.position.set(bx, getGroundHeightAt('roslit_volcano', bx, bz) + bh * 0.45, bz);
        islGroup.add(col);
      });
    } else if (island.id === 'sovereignty') {
      // Colossal Statue of Sovereignty holding a Giant Golden Trident + Fluted Marble Columns!
      const marbleMat = new THREE.MeshStandardMaterial({ color: '#CBD5E1', roughness: 0.56, metalness: 0.1 });
      const goldMat = new THREE.MeshStandardMaterial({
        color: '#F59E0B',
        emissive: '#D97706',
        emissiveIntensity: 0.35,
        roughness: 0.22,
        metalness: 0.85,
      });
      const stY = getGroundHeightAt('sovereignty', 0, -18.5);
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.4, 4.2), marbleMat);
      plinth.position.set(0, stY + 1.1, -18.8);
      const torso = new THREE.Mesh(new THREE.BoxGeometry(3.0, 5.8, 2.0), marbleMat);
      torso.position.set(0, stY + 5.1, -18.8);
      const head = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.75, 1.65), marbleMat);
      head.position.set(0, stY + 8.85, -18.8);
      const crown = new THREE.Mesh(new THREE.ConeGeometry(1.35, 1.5, 5), goldMat);
      crown.position.set(0, stY + 10.45, -18.8);
      const tridentShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 11.4, 8), goldMat);
      tridentShaft.position.set(2.5, stY + 6.4, -18.0);
      const tridentBar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.22, 0.22), goldMat);
      tridentBar.position.set(2.5, stY + 11.4, -18.0);
      [-0.75, 0, 0.75].forEach((tx) => {
        const prong = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.25, 5), goldMat);
        prong.position.set(2.5 + tx, stY + 12.1, -18.0);
        islGroup.add(prong);
      });
      islGroup.add(plinth, torso, head, crown, tridentShaft, tridentBar);

      // Semicircle of 8 Classical Marble Columns
      [
        [-9.2, -6.4, 4.4],
        [-9.2, -10.6, 4.8],
        [9.2, -6.4, 4.4],
        [9.2, -10.6, 4.8],
        [-7.2, -15.6, 5.2],
        [7.2, -15.6, 5.2],
      ].forEach(([cx, cz, ch]) => {
        const cy = getGroundHeightAt('sovereignty', cx, cz);
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, ch, 10), marbleMat);
        col.position.set(cx, cy + ch * 0.48, cz);
        col.castShadow = true;
        islGroup.add(col);
      });
    } else if (island.id === 'desolate_deep') {
      // Moored Yellow Research Submarine + Steel A-Frame Gantry Crane + Bathysphere + Smoker Vents
      const subMat = new THREE.MeshStandardMaterial({ color: '#EAB308', roughness: 0.3, metalness: 0.55 });
      const cyanGlow = new THREE.MeshStandardMaterial({
        color: '#22D3EE',
        emissive: '#06B6D4',
        emissiveIntensity: 1.55,
        roughness: 0.18,
      });
      const subHull = new THREE.Mesh(new THREE.CapsuleGeometry(1.25, 4.4, 6, 10), subMat);
      subHull.rotation.z = Math.PI / 2;
      subHull.position.set(9.2, 0.45, 7.6);
      const subTower = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.65, 1.35, 8), subMat);
      subTower.position.set(9.2, 1.65, 7.6);
      const subPort = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 8), cyanGlow);
      subPort.position.set(7.0, 0.55, 7.6);
      islGroup.add(subHull, subTower, subPort);

      // Steel A-Frame Crane + Suspended Bathysphere
      const craneY = getGroundHeightAt('desolate_deep', -4.2, -1.5);
      const legA = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 6.2, 6), steelPierMat);
      legA.position.set(-4.8, craneY + 2.8, -1.5);
      legA.rotation.z = -0.18;
      const legB = legA.clone();
      legB.position.x = -3.4;
      legB.rotation.z = 0.18;
      const boom = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 4.6), steelPierMat);
      boom.position.set(-4.1, craneY + 5.7, 0.2);
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.95, 10, 10), subMat);
      sphere.position.set(-4.1, craneY + 2.4, 2.1);
      islGroup.add(legA, legB, boom, sphere);

      // Hydrothermal Smoker Vents on West & East Ridges
      [
        [-12.2, -13.6],
        [12.2, -13.6],
      ].forEach(([hx, hz]) => {
        const hy = getGroundHeightAt('desolate_deep', hx, hz);
        const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 1.35, 4.6, 7), steelPierMat);
        vent.position.set(hx, hy + 2.2, hz);
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), cyanGlow);
        orb.position.set(hx, hy + 4.6, hz);
        islGroup.add(vent, orb);
      });
    } else if (island.id === 'ancient_isle') {
      // Sunken Emerald Meteorite Crystal + Giant Arching Leviathan Ribcage + Ruined Monoliths!
      const meteorMat = new THREE.MeshStandardMaterial({
        color: '#34D399',
        emissive: '#10B981',
        emissiveIntensity: 1.5,
        roughness: 0.2,
      });
      const boneMat = new THREE.MeshStandardMaterial({ color: '#E7E0CE', roughness: 0.78 });
      const ruinMat = new THREE.MeshStandardMaterial({ color: '#6E6656', roughness: 0.88 });

      const meteor = new THREE.Mesh(new THREE.OctahedronGeometry(2.8, 0), meteorMat);
      meteor.position.set(0, 2.2, -10.5);
      meteor.rotation.set(0.32, 0.4, 0.22);
      spinningCrystals.push({ mesh: meteor, baseY: 2.2, speed: 0.35 });
      islGroup.add(meteor);

      // Arched Prehistoric Leviathan Rib Bones curving over the crater!
      [-4.2, -2.0, 2.0, 4.2].forEach((rx, idx) => {
        const rib = new THREE.Mesh(new THREE.TorusGeometry(4.8, 0.34, 6, 12, Math.PI * 0.65), boneMat);
        rib.position.set(rx * 1.1, 0.8, -14.5 + (idx % 2) * 1.6);
        rib.rotation.y = Math.PI / 2;
        rib.rotation.z = 0.2;
        islGroup.add(rib);
      });

      // Ancient Monoliths on West & East Crater Rim
      [
        [-11.2, -13.6, 0.14],
        [11.2, -13.6, -0.14],
      ].forEach(([px, pz, rz]) => {
        const py = getGroundHeightAt('ancient_isle', px, pz);
        const pil = new THREE.Mesh(new THREE.BoxGeometry(1.6, 5.8, 1.6), ruinMat);
        pil.position.set(px, py + 2.7, pz);
        pil.rotation.z = rz;
        islGroup.add(pil);
      });
    } else if (island.id === 'the_depths') {
      // Faceted Cyan-Violet Crystal Cathedral + Abyssal Torii Gate Arches!
      const cyanCrystal = new THREE.MeshStandardMaterial({
        color: '#38BDF8',
        emissive: '#0284C7',
        emissiveIntensity: 1.5,
        roughness: 0.16,
      });
      const violetCrystal = new THREE.MeshStandardMaterial({
        color: '#A78BFA',
        emissive: '#7C3AED',
        emissiveIntensity: 1.35,
        roughness: 0.18,
      });

      [
        [0, -19.2, 2.4, 10.6, 0],
        [-3.6, -18.2, 1.5, 7.2, 1],
        [3.6, -18.2, 1.5, 7.2, 1],
        [-14.2, -11.5, 1.4, 6.2, 0],
        [14.2, -11.5, 1.4, 6.2, 1],
      ].forEach(([cx, cz, cr, ch, ci]) => {
        const cy = getGroundHeightAt('the_depths', cx, cz);
        const spire = new THREE.Mesh(
          new THREE.OctahedronGeometry(cr, 0),
          ci === 0 ? cyanCrystal : violetCrystal
        );
        spire.scale.set(0.75, ch / (cr * 2), 0.75);
        spire.position.set(cx, cy + ch * 0.42, cz);
        islGroup.add(spire);
      });

      // Abyssal Torii Gate framing bridge to Cathedral
      const gateY = getGroundHeightAt('the_depths', 0, -14.0);
      [-2.2, 2.2].forEach((gx) => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 4.4, 8), obsidianPierMat);
        pillar.position.set(gx, gateY + 2.1, -13.6);
        islGroup.add(pillar);
      });
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.42, 0.55), cyanCrystal);
      lintel.position.set(0, gateY + 4.3, -13.6);
      islGroup.add(lintel);
    }

    // Coastal perimeter rocks around each island
    const rockMat = new THREE.MeshStandardMaterial({
      color: pal.stone,
      roughness: island.id === 'snowcap' ? 0.32 : 0.88,
    });
    const rockGeo = new THREE.DodecahedronGeometry(1.0, 0);
    for (let r = 0; r < 8; r += 1) {
      const ang = (r / 8) * Math.PI * 2 + 0.35;
      // Leave pier corridor (+Z) clear of rocks
      if (Math.sin(ang) > 0.65) continue;
      const dist = 16.5 + (r % 3) * 2.2;
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(Math.cos(ang) * dist, 0.15, Math.sin(ang) * dist - 7.5);
      const sx = 1.0 + (r % 3) * 0.45;
      rock.scale.set(sx, 0.85 + (r % 2) * 0.5, sx * 0.9);
      rock.rotation.set(0.2 * r, ang, 0.15 * r);
      islGroup.add(rock);
    }

    group.add(islGroup);
  }

  // Open-Sea Shipping Lane Channel Buoys between islands
  const seaBuoys: Array<[number, number, string]> = [
    [-25, 22, '#F97316'],
    [28, 12, '#34D399'],
    [-26, -34, '#7DD3FC'],
    [26, -32, '#10B981'],
    [82, 4, '#FB923C'],
    [-90, -14, '#22D3EE'],
    [28, 72, '#38BDF8'],
  ];
  const buoyBodyMat = new THREE.MeshStandardMaterial({ color: '#DC2626', roughness: 0.55 });
  for (const [bx, bz, hex] of seaBuoys) {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.78, 0.75, 8), buoyBodyMat);
    base.position.set(bx, 0.18, bz);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.85, 6), bollardCapMat);
    pole.position.set(bx, 0.75, bz);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 8, 8),
      new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: 1.6 })
    );
    bulb.position.set(bx, 1.25, bz);
    group.add(base, pole, bulb);
  }

  // Instanced Soaring Seagulls across the Archipelago (22 gulls)
  const gullGeo = new THREE.BoxGeometry(1.15, 0.06, 0.25);
  const gullMat = new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.65 });
  const gullCount = 22;
  const gullInst = new THREE.InstancedMesh(gullGeo, gullMat, gullCount);
  gullInst.frustumCulled = false;
  const gullData = Array.from({ length: gullCount }, (_, i) => {
    const home = FISCH_ISLANDS[i % FISCH_ISLANDS.length].worldCoords;
    return {
      cx: home.x,
      cz: home.z,
      radius: 14 + (i % 3) * 7,
      speed: 0.22 + (i % 4) * 0.05,
      height: 14 + (i % 4) * 2.5,
      phase: (i / gullCount) * Math.PI * 2,
    };
  });
  group.add(gullInst);

  // Instanced Underwater Swimming Fish Schools distributed around island harbors (55 fish)
  const fishBodyGeo = new THREE.ConeGeometry(0.24, 0.9, 6);
  fishBodyGeo.rotateX(Math.PI / 2);
  const fishMat = new THREE.MeshStandardMaterial({ color: '#82AAA1', roughness: 0.3, metalness: 0.25 });
  const fishCount = 55;
  const fishSchoolMesh = new THREE.InstancedMesh(fishBodyGeo, fishMat, fishCount);
  fishSchoolMesh.frustumCulled = false;
  const schoolColors = ['#5EC48B', '#63B3ED', '#F6C453', '#82AAA1', '#E87EA1'];
  const fishData = Array.from({ length: fishCount }, (_, i) => {
    const center = dynamicFishCenters[i % dynamicFishCenters.length];
    return {
      cx: center.x,
      cz: center.z,
      radius: center.radius + (i % 4) * 2.2,
      speed: (0.28 + (i % 3) * 0.1) * (i % 2 === 0 ? 1 : -1),
      phase: (i / fishCount) * Math.PI * 2,
      depth: -0.42 - (i % 3) * 0.32,
      scale: 0.72 + (i % 4) * 0.2,
    };
  });
  for (let i = 0; i < fishCount; i += 1) {
    fishSchoolMesh.setColorAt(i, new THREE.Color(schoolColors[i % schoolColors.length]));
  }
  if (fishSchoolMesh.instanceColor) fishSchoolMesh.instanceColor.needsUpdate = true;
  group.add(fishSchoolMesh);

  // Starfield Dome for Night & Aurora
  const starCount = isSoftwareGl ? 160 : 320;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    const theta = ((i * 137.5) % 360) * (Math.PI / 180);
    const phi = 0.14 + ((i * 29) % 75) * 0.012;
    const rad = 210;
    starPositions[i * 3] = Math.cos(theta) * Math.cos(phi) * rad;
    starPositions[i * 3 + 1] = Math.sin(phi) * rad + 12;
    starPositions[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * rad;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: '#F8FAFC',
    size: 1.3,
    transparent: true,
    opacity: isDarkMode ? 0.85 : 0.0,
    depthWrite: false,
  });
  const starPoints = new THREE.Points(starGeo, starMat);
  group.add(starPoints);

  // Aurora Borealis Curved Sky Ribbon spanning across Archipelago Sky
  const auroraGeo = new THREE.PlaneGeometry(190, 20, 28, 4);
  const posAttr = auroraGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i += 1) {
    const px = posAttr.getX(i);
    posAttr.setZ(i, Math.sin(px * 0.045) * 18);
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
  auroraRibbon.position.set(0, 42, -95);
  auroraRibbon.rotation.x = 0.16;
  group.add(auroraRibbon);

  // Spawn ALL 77 Island-Specific Interactive 3D NPCs across All 11 Islands!
  const allSpawns = getAllWorldNpcSpawns();
  const npcActors = allSpawns.map((spawn) => {
    const actor = createNpcActorShared(spawn, isDarkMode, sharedNpcRes);
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
        const fx = fd.cx + Math.cos(ang) * fd.radius * 1.15;
        const fz = fd.cz + Math.sin(ang) * fd.radius * 0.85;
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
          gd.cx + Math.cos(ang) * gd.radius,
          gd.height + Math.sin(timeSec * 3.8 + i) * 0.45,
          gd.cz + Math.sin(ang) * gd.radius
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
            (actor.spawn.role === 'altar' ? 2.55 : actor.spawn.role === 'merlin' ? 1.94 : 1.3) +
            Math.sin(timeSec * 2.4) * 0.09;
        }
      }

      for (const c of spinningCrystals) {
        c.mesh.rotation.y = timeSec * c.speed;
        c.mesh.position.y = c.baseY + Math.sin(timeSec * 1.8) * 0.14;
      }

      for (const rot of lighthouseRotators) {
        rot.rotation.y = timeSec * 0.75;
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
      sharedLanternGlassMat.emissiveIntensity = isNight ? 1.6 : 0.38;
    },
    dispose: () => {
      disposeObject3DTree(group);
    },
  };
}

// Backward-compatible alias for any callers importing buildIslandEnvironment
export function buildIslandEnvironment(
  _island: FischIsland,
  isDarkMode: boolean,
  maxAnisotropy: number,
  isSoftwareGl: boolean
): IslandEnvironmentHandle {
  return buildArchipelagoEnvironment(isDarkMode, maxAnisotropy, isSoftwareGl);
}
