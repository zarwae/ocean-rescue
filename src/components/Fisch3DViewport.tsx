import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  FISCH_ISLANDS,
  FischBoat,
  FischIsland,
  FischRod,
  FischSpecies,
  FischTimeOfDay,
  FischWeather,
  RARITY_COLORS,
} from '../utils/fischData';
import { FischPhase } from '../utils/fischRenderer';
import {
  clampPlayerWorldPosition,
  computeBobberTargetPosition,
  findActiveIslandAt,
  findNearestDisembarkPoint,
  findNearestNpc,
  FischNpcSpawn,
  getAllWorldNpcSpawns,
  getGroundHeightAtWorld,
  getIslandDockSpawn,
  resolveBoatWorldPosition,
  waterHeightAt,
} from '../utils/fisch3dWorld';
import {
  animateRobloxAngler,
  buildArchipelagoEnvironment,
  createBoatModel,
  createBobberGroup,
  createCaughtFish3D,
  createRobloxAnglerRig,
  disposeObject3DTree,
  FischBoat3DHandle,
  IslandEnvironmentHandle,
  RobloxAnglerRig,
} from '../utils/fisch3dModels';
import { Gamepad2, MessageCircle, ArrowUp, Anchor, Ship, Maximize2, Minimize2 } from 'lucide-react';
import type { ThemeMode } from '../hooks/useTheme';

export interface FischMutableEngineState {
  phase: FischPhase;
  castPower: number;
  castDir: 1 | -1;
  perfectCast: boolean;
  bobberProgress: number;
  waitRemaining: number;
  biteRemaining: number;
  shakeCount: number;
  hookedSpecies: FischSpecies | null;
  reelBarCenter: number;
  reelBarVel: number;
  reelBarWidth: number;
  reelFishPos: number;
  reelFishTarget: number;
  reelFishTimer: number;
  reelProgress: number;
  reelGrace: number;
  holdingInput: boolean;
}

export interface CatchVisualTrigger {
  id: number;
  species: FischSpecies;
  mutationColorHex: string | null;
  isGiant: boolean;
  lineSnapped?: boolean;
}

interface ShakeTarget {
  id: number;
  xPercent: number;
  yPercent: number;
}

interface CompassReadout {
  targetName: string;
  distanceM: number;
  arrowAngleDeg: number;
  accentHex: string;
  isPinnedTarget: boolean;
}

interface Fisch3DViewportProps {
  theme: ThemeMode;
  island: FischIsland;
  rod: FischRod;
  boat: FischBoat;
  timeOfDay: FischTimeOfDay;
  weather: FischWeather;
  auroraActive: boolean;
  phase: FischPhase;
  engineRef: React.MutableRefObject<FischMutableEngineState>;
  shakeTarget: ShakeTarget | null;
  lastCatchVisual: CatchVisualTrigger | null;
  compassTargetIslandId?: string | null;
  teleportRequest?: { islandId: string; id: number } | null;
  onStepFishing: (dt: number, emitSplash: (x: number, y: number, z: number) => void) => void;
  onBeginCastOrReel: () => void;
  onReleaseInput: () => void;
  onTriggerShake: () => void;
  onInteractNpc: (npc: FischNpcSpawn) => void;
  onEnterIsland: (islandId: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  statusBanner: string | null;
  hudTopLeft?: React.ReactNode;
  hudTopRight?: React.ReactNode;
  children?: React.ReactNode;
}

// Reusable module-scope math objects (Zero GC churn in animation loop)
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _vec3C = new THREE.Vector3();
const _ndc = new THREE.Vector2();
const _targetBg = new THREE.Color();
const _waterColor = new THREE.Color();
const _sunColor = new THREE.Color();
const _hemiSky = new THREE.Color();
const _hemiGround = new THREE.Color();

export const Fisch3DViewport: React.FC<Fisch3DViewportProps> = ({
  theme,
  island,
  rod,
  boat,
  timeOfDay,
  weather,
  auroraActive,
  phase,
  engineRef,
  shakeTarget,
  lastCatchVisual,
  compassTargetIslandId = null,
  teleportRequest = null,
  onStepFishing,
  onBeginCastOrReel,
  onReleaseInput,
  onTriggerShake,
  onInteractNpc,
  onEnterIsland,
  isFullscreen = false,
  onToggleFullscreen,
  statusBanner,
  hudTopLeft,
  hudTopRight,
  children,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [nearestNpc, setNearestNpc] = useState<FischNpcSpawn | null>(null);
  const [compassReadout, setCompassReadout] = useState<CompassReadout | null>(null);
  const [inBoat, setInBoat] = useState(false);
  const [nearBoat, setNearBoat] = useState(true);
  const [nearDockForDisembark, setNearDockForDisembark] = useState(true);
  const [showVirtualPad, setShowVirtualPad] = useState<boolean>(true);
  const [webglLost, setWebglLost] = useState(false);

  // Reel HUD live DOM refs (updated directly in rAF for crisp 60fps without React re-renders)
  const castFillRef = useRef<HTMLDivElement | null>(null);
  const reelBarRef = useRef<HTMLDivElement | null>(null);
  const reelFishRef = useRef<HTMLDivElement | null>(null);
  const reelProgRef = useRef<HTMLDivElement | null>(null);
  const joystickKnobRef = useRef<HTMLDivElement | null>(null);

  // Input & Mutable World Refs
  const keysRef = useRef<Record<string, boolean>>({});
  const joystickVecRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const jumpQueuedRef = useRef(false);
  const splashQueueRef = useRef<Array<{ x: number; y: number; z: number }>>([]);

  // Sync latest React props to refs inside the single-mount Three.js loop
  const propsRef = useRef({
    theme,
    island,
    rod,
    boat,
    timeOfDay,
    weather,
    auroraActive,
    compassTargetIslandId,
    onStepFishing,
    onBeginCastOrReel,
    onReleaseInput,
    onTriggerShake,
    onInteractNpc,
    onEnterIsland,
  });
  propsRef.current = {
    theme,
    island,
    rod,
    boat,
    timeOfDay,
    weather,
    auroraActive,
    compassTargetIslandId,
    onStepFishing,
    onBeginCastOrReel,
    onReleaseInput,
    onTriggerShake,
    onInteractNpc,
    onEnterIsland,
  };

  // Player, Boat & Camera spatial state initialized cleanly on the current island's dock
  const spatialRef = useRef((() => {
    const initialSpawn = getIslandDockSpawn(island.id);
    return {
      px: initialSpawn.px,
      py: initialSpawn.py,
      pz: initialSpawn.pz,
      vy: 0,
      yaw: initialSpawn.yaw,
      isGrounded: true,
      inBoat: false,
      bx: initialSpawn.bx,
      bz: initialSpawn.bz,
      bYaw: initialSpawn.bYaw,
      bSpeed: 0,
      wakeTimer: 0,
      camYaw: initialSpawn.yaw,
      camPitch: 0.42,
      camDist: 9.6,
      bobberStart: new THREE.Vector3(initialSpawn.px, 1.5, initialSpawn.pz),
      bobberTarget: new THREE.Vector3(initialSpawn.px, 0, initialSpawn.pz + 9),
      celebratingTimer: 0,
      lastIslandId: island.id,
      lastTeleportId: 0,
      lastCatchId: 0,
    };
  })());

  const toggleBoatBoarding = (forceReturnDock = false) => {
    if (engineRef.current.phase !== 'idle') return;
    const sp = spatialRef.current;
    if (forceReturnDock) {
      const dockSpawn = getIslandDockSpawn(propsRef.current.island.id);
      sp.inBoat = false;
      sp.bx = dockSpawn.bx;
      sp.bz = dockSpawn.bz;
      sp.bYaw = dockSpawn.bYaw;
      sp.bSpeed = 0;
      sp.px = dockSpawn.px;
      sp.pz = dockSpawn.pz;
      sp.py = dockSpawn.py;
      sp.yaw = dockSpawn.yaw;
      sp.vy = 0;
      sp.isGrounded = true;
      setInBoat(false);
      return;
    }

    if (!sp.inBoat) {
      const distBoat = Math.hypot(sp.px - sp.bx, sp.pz - sp.bz);
      if (distBoat <= 8.5) {
        sp.inBoat = true;
        sp.bSpeed = 0;
        sp.yaw = sp.bYaw;
        setInBoat(true);
      }
    } else {
      const landPoint = findNearestDisembarkPoint(sp.bx, sp.bz, 11.5);
      if (landPoint) {
        sp.inBoat = false;
        sp.bSpeed = 0;
        sp.px = landPoint.x;
        sp.pz = landPoint.z;
        sp.py = landPoint.groundY;
        sp.vy = 0;
        sp.isGrounded = true;
        setInBoat(false);
        if (landPoint.islandId !== propsRef.current.island.id) {
          propsRef.current.onEnterIsland(landPoint.islandId);
        }
      }
    }
  };
  const toggleBoatRef = useRef(toggleBoatBoarding);
  toggleBoatRef.current = toggleBoatBoarding;

  // Trigger catch celebration 3D fish leap when lastCatchVisual changes
  const pendingCatchMeshRef = useRef<CatchVisualTrigger | null>(null);
  useEffect(() => {
    if (lastCatchVisual && lastCatchVisual.id !== spatialRef.current.lastCatchId) {
      spatialRef.current.lastCatchId = lastCatchVisual.id;
      if (!lastCatchVisual.lineSnapped) {
        spatialRef.current.celebratingTimer = 1.9;
        pendingCatchMeshRef.current = lastCatchVisual;
      }
    }
  }, [lastCatchVisual]);

  // Direct instant move to an already-loaded island dock via Map Pop-up ("Pergi Langsung")
  useEffect(() => {
    if (teleportRequest && teleportRequest.id !== spatialRef.current.lastTeleportId) {
      spatialRef.current.lastTeleportId = teleportRequest.id;
      const targetSpawn = getIslandDockSpawn(teleportRequest.islandId);
      const sp = spatialRef.current;
      sp.lastIslandId = teleportRequest.islandId;
      sp.inBoat = false;
      sp.bx = targetSpawn.bx;
      sp.bz = targetSpawn.bz;
      sp.bYaw = targetSpawn.bYaw;
      sp.bSpeed = 0;
      sp.px = targetSpawn.px;
      sp.pz = targetSpawn.pz;
      sp.py = targetSpawn.py;
      sp.vy = 0;
      sp.yaw = targetSpawn.yaw;
      sp.camYaw = targetSpawn.yaw;
      sp.isGrounded = true;
      setInBoat(false);
    }
  }, [teleportRequest]);

  // Keyboard Listeners (WASD/Arrows move, Space jumps or reels, F casts/reels, E shakes/talks, B boards/disembarks boat)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }
      keysRef.current[e.code] = true;

      const phaseNow = engineRef.current.phase;
      if (e.code === 'Space') {
        e.preventDefault();
        if (phaseNow === 'reeling') {
          propsRef.current.onBeginCastOrReel();
        } else if (phaseNow === 'idle' && !spatialRef.current.inBoat) {
          jumpQueuedRef.current = true;
        }
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        propsRef.current.onBeginCastOrReel();
      } else if (e.code === 'KeyB') {
        if (phaseNow === 'idle') {
          e.preventDefault();
          toggleBoatRef.current(false);
        }
      } else if (e.code === 'KeyE') {
        if (phaseNow === 'waiting') {
          e.preventDefault();
          propsRef.current.onTriggerShake();
        } else if (phaseNow === 'idle' && !spatialRef.current.inBoat) {
          const near = findNearestNpc(spatialRef.current.px, spatialRef.current.pz, 3.6, getAllWorldNpcSpawns());
          if (near) {
            e.preventDefault();
            propsRef.current.onInteractNpc(near);
          }
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
      if (e.code === 'KeyF') {
        propsRef.current.onReleaseInput();
      } else if (e.code === 'Space' && engineRef.current.phase === 'reeling') {
        propsRef.current.onReleaseInput();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [engineRef]);

  // Main Three.js Scene Lifecycle (Mounted once on [])
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 480;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    const onContextLost = (ev: Event) => {
      ev.preventDefault();
      setWebglLost(true);
    };
    const onContextRestored = () => {
      setWebglLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#8ED1D4');
    scene.fog = new THREE.FogExp2('#8ED1D4', 0.0058);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(56, width / height, 0.25, 420);

    // 3-Point Warm/Cool Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#BCE8F7', '#174A57', 0.85);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#FFF3D6', 1.75);
    sunLight.position.set(22, 32, 18);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 2;
    sunLight.shadow.camera.far = 96;
    const d = 34;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);
    scene.add(sunLight.target);

    const rimLight = new THREE.DirectionalLight('#7DD3FC', 0.55);
    rimLight.position.set(-18, 14, -20);
    scene.add(rimLight);

    // Animated PBR Ocean Plane spanning entire 11-Island Open-World Archipelago
    const waterGeo = new THREE.PlaneGeometry(520, 520, isSoftwareGl ? 68 : 120, isSoftwareGl ? 68 : 120);
    const waterMat = new THREE.MeshStandardMaterial({
      color: '#2B8E94',
      roughness: 0.16,
      metalness: 0.25,
      flatShading: false,
    });
    waterMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      waterMat.userData.shader = shader;
      shader.vertexShader =
        `uniform float uTime;\nvarying float vWaveHeight;\n` +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
          #include <begin_vertex>
          float wx = position.x;
          float wz = -position.y;
          float wave = sin(wx * 0.42 + uTime * 1.65) * 0.13
                     + cos(wz * 0.36 - uTime * 1.25) * 0.10
                     + sin((wx + wz) * 0.22 + uTime * 0.95) * 0.055;
          transformed.z += wave;
          vWaveHeight = wave;
          `
        );
      shader.fragmentShader =
        `varying float vWaveHeight;\n` +
        shader.fragmentShader.replace(
          '#include <color_fragment>',
          `
          #include <color_fragment>
          float crest = smoothstep(0.11, 0.27, vWaveHeight);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.96, 0.98), crest * 0.38);
          `
        );
    };
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = 0;
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);

    // Build ALL 11 Archipelago Islands Live in One Continuous Open World!
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const islandHandle: IslandEnvironmentHandle = buildArchipelagoEnvironment(
      propsRef.current.theme === 'dark',
      maxAniso,
      isSoftwareGl
    );
    scene.add(islandHandle.group);

    const anglerRig: RobloxAnglerRig = createRobloxAnglerRig(propsRef.current.rod);
    anglerRig.root.position.set(spatialRef.current.px, spatialRef.current.py, spatialRef.current.pz);
    scene.add(anglerRig.root);
    let activeRodId = propsRef.current.rod.id;

    // 3D Drivable Boat moored beside the pier
    let activeBoatId = propsRef.current.boat.id;
    let boatHandle: FischBoat3DHandle = createBoatModel(propsRef.current.boat);
    boatHandle.root.position.set(spatialRef.current.bx, 0, spatialRef.current.bz);
    boatHandle.root.rotation.y = spatialRef.current.bYaw;
    scene.add(boatHandle.root);

    // Cast Aim Target Reticle Ring on ocean surface
    const aimRingMat = new THREE.MeshBasicMaterial({
      color: '#5EC48B',
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const aimRingMesh = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.68, 28), aimRingMat);
    aimRingMesh.rotation.x = -Math.PI / 2;
    scene.add(aimRingMesh);

    // 3D Bobber + Fishing Line
    const bobberGroup = createBobberGroup();
    bobberGroup.visible = false;
    scene.add(bobberGroup);

    const linePts = Array.from({ length: 14 }, () => new THREE.Vector3());
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
    const lineMat = new THREE.LineBasicMaterial({ color: '#F1F5F9', transparent: true, opacity: 0.9 });
    const fishingLine = new THREE.Line(lineGeo, lineMat);
    fishingLine.frustumCulled = false;
    fishingLine.visible = false;
    scene.add(fishingLine);

    // Pool of 6 Splash Ripples
    const splashPool = Array.from({ length: 6 }, () => {
      const mat = new THREE.MeshBasicMaterial({
        color: '#E0F2FE',
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.42, 24), mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.visible = false;
      scene.add(mesh);
      return { mesh, mat, age: 99, maxAge: 0.9 };
    });

    // Rain streak lines
    const rainCount = isSoftwareGl ? 60 : 120;
    const rainPos = new Float32Array(rainCount * 6);
    for (let i = 0; i < rainCount; i += 1) {
      const rx = ((i * 71) % 44) - 22;
      const ry = ((i * 23) % 18) + 1;
      const rz = ((i * 53) % 44) - 16;
      rainPos[i * 6] = rx;
      rainPos[i * 6 + 1] = ry;
      rainPos[i * 6 + 2] = rz;
      rainPos[i * 6 + 3] = rx - 0.15;
      rainPos[i * 6 + 4] = ry - 0.85;
      rainPos[i * 6 + 5] = rz;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.LineBasicMaterial({ color: '#CBD5E1', transparent: true, opacity: 0 });
    const rainLines = new THREE.LineSegments(rainGeo, rainMat);
    scene.add(rainLines);

    // Leaping Caught Fish 3D Handle
    let caughtFishGroup: THREE.Group | null = null;

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycaster for clicking 3D NPCs (Layer 1)
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);

    // Pointer Orbit & Tap-to-Interact Controls
    const activePointers = new Map<number, { x: number; y: number }>();
    let dragStart = { x: 0, y: 0, moved: 0, pointerId: -1 };
    let lastPinchDist = 0;

    const onPointerDown = (e: PointerEvent) => {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (activePointers.size === 1) {
        dragStart = { x: e.clientX, y: e.clientY, moved: 0, pointerId: e.pointerId };
      } else if (activePointers.size === 2) {
        const pts = Array.from(activePointers.values());
        lastPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!activePointers.has(e.pointerId)) return;
      const prev = activePointers.get(e.pointerId)!;
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.size === 1 && dragStart.pointerId === e.pointerId) {
        dragStart.moved += Math.hypot(dx, dy);
        spatialRef.current.camYaw -= dx * 0.0068;
        spatialRef.current.camPitch = THREE.MathUtils.clamp(
          spatialRef.current.camPitch + dy * 0.0052,
          0.12,
          1.15
        );
      } else if (activePointers.size === 2) {
        const pts = Array.from(activePointers.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (lastPinchDist > 0) {
          spatialRef.current.camDist = THREE.MathUtils.clamp(
            spatialRef.current.camDist - (dist - lastPinchDist) * 0.025,
            5.2,
            17.5
          );
        }
        lastPinchDist = dist;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (activePointers.size === 1 && dragStart.pointerId === e.pointerId && dragStart.moved < 8) {
        // Quick tap on canvas: check 3D NPC raycast first!
        const rect = renderer.domElement.getBoundingClientRect();
        _ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        _ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(_ndc, camera);
        const hitboxes = islandHandle.npcActors.map((a) => a.hitboxMesh);
        const hits = raycaster.intersectObjects(hitboxes, false);
        if (hits.length > 0) {
          const hitId = hits[0].object.userData.npcId as string;
          const actor = islandHandle.npcActors.find((a) => a.spawn.id === hitId);
          if (actor) {
            propsRef.current.onInteractNpc(actor.spawn);
          }
        }
      }
      activePointers.delete(e.pointerId);
      if (activePointers.size < 2) lastPinchDist = 0;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spatialRef.current.camDist = THREE.MathUtils.clamp(
        spatialRef.current.camDist + e.deltaY * 0.006,
        5.2,
        17.5
      );
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 900;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    // Software WebGL loop pacer + Clock
    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();
    let elapsedTotal = 0;
    let lastNearCheck = 0;
    let lastNearestId: string | null = null;
    let prevPhase: FischPhase = engineRef.current.phase;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const emitSplash = (sx: number, sy: number, sz: number) => {
      const slot = splashPool.find((p) => p.age >= p.maxAge) ?? splashPool[0];
      slot.age = 0;
      slot.mesh.position.set(sx, sy + 0.08, sz);
      slot.mesh.scale.setScalar(0.6);
      slot.mesh.visible = true;
    };

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(0.05, clock.getDelta());
      elapsedTotal += dt;

      const curProps = propsRef.current;
      const sp = spatialRef.current;
      const eng = engineRef.current;

      // 1. Update Sun Shadow Frustum & Ambient Rain Anchor cleanly around Player across open world
      sunLight.position.set(sp.px + 22, 32, sp.pz + 18);
      sunLight.target.position.set(sp.px, 0, sp.pz);
      sunLight.target.updateMatrixWorld();
      rainLines.position.set(sp.px, 0, sp.pz);

      // 2. Update 3D Rod material colors if equipped rod changed & rebuild 3D Boat if boat changed
      if (activeRodId !== curProps.rod.id) {
        activeRodId = curProps.rod.id;
        anglerRig.rodShaftMat.color.set(curProps.rod.colorHex);
        anglerRig.rodAccentMat.color.set(curProps.rod.accentHex);
        anglerRig.rodAccentMat.emissive.set(curProps.rod.accentHex);
      }

      if (activeBoatId !== curProps.boat.id) {
        activeBoatId = curProps.boat.id;
        scene.remove(boatHandle.root);
        boatHandle.dispose();
        boatHandle = createBoatModel(curProps.boat);
        boatHandle.root.position.set(sp.bx, 0, sp.bz);
        boatHandle.root.rotation.y = sp.bYaw;
        scene.add(boatHandle.root);
      }

      // 3. Dynamic Atmosphere Sync (Theme + Day/Night + Weather + Island Colors)
      const isNight = curProps.timeOfDay === 'Night';
      const isDarkSky = curProps.theme === 'dark' || isNight;
      const skyHex = isDarkSky ? curProps.island.skyTopDark : curProps.island.skyBottomLight;
      const waterHex = isDarkSky ? curProps.island.waterTopDark : curProps.island.waterTopLight;

      _targetBg.set(skyHex);
      if (curProps.weather === 'Storm') _targetBg.multiplyScalar(0.65);
      (scene.background as THREE.Color).lerp(_targetBg, 0.08);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(scene.background as THREE.Color);
        const targetDensity = curProps.weather === 'Foggy' ? 0.022 : curProps.weather === 'Storm' ? 0.014 : 0.0058;
        scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, targetDensity, 0.06);
      }

      _waterColor.set(waterHex);
      waterMat.color.lerp(_waterColor, 0.08);
      if (waterMat.userData.shader) {
        waterMat.userData.shader.uniforms.uTime.value = elapsedTotal;
      }

      _sunColor.set(isNight ? '#93C5FD' : '#FFF1D0');
      sunLight.color.lerp(_sunColor, 0.08);
      sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, isNight ? 0.85 : 1.75, 0.08);
      _hemiSky.set(isNight ? '#1E3A5F' : '#BAE6FD');
      _hemiGround.set(waterHex);
      hemiLight.color.lerp(_hemiSky, 0.08);
      hemiLight.groundColor.lerp(_hemiGround, 0.08);
      hemiLight.intensity = THREE.MathUtils.lerp(hemiLight.intensity, isNight ? 0.65 : 0.9, 0.08);

      // 4. Avatar & Drivable 3D Boat WASD + Joystick Movement & Jump Physics
      let inX = joystickVecRef.current.x;
      let inY = joystickVecRef.current.y;
      const keys = keysRef.current;
      if (keys['KeyW'] || keys['ArrowUp']) inY += 1;
      if (keys['KeyS'] || keys['ArrowDown']) inY -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) inX += 1;
      if (keys['KeyA'] || keys['ArrowLeft']) inX -= 1;

      const mag = Math.hypot(inX, inY);
      const canMove = eng.phase === 'idle';
      let moveRatio = 0;

      if (sp.inBoat) {
        // Drive 3D Boat across the open sea!
        if (canMove && mag > 0.08) {
          const nx = inX / Math.max(1, mag);
          const ny = inY / Math.max(1, mag);
          moveRatio = Math.min(1, mag);

          const sinC = Math.sin(sp.camYaw);
          const cosC = Math.cos(sp.camYaw);
          const worldDirX = -sinC * ny + cosC * nx;
          const worldDirZ = -cosC * ny - sinC * nx;

          const desiredYaw = Math.atan2(worldDirX, worldDirZ);
          let diffYaw = desiredYaw - sp.bYaw;
          while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
          while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;
          sp.bYaw += diffYaw * Math.min(1, dt * (curProps.boat.turnSpeed * 2.2));

          const boatSpeed = curProps.boat.speed * moveRatio;
          sp.bSpeed = THREE.MathUtils.lerp(sp.bSpeed, boatSpeed, Math.min(1, dt * 5));
          const resolved = resolveBoatWorldPosition(
            sp.bx,
            sp.bz,
            sp.bx + Math.sin(sp.bYaw) * sp.bSpeed * dt,
            sp.bz + Math.cos(sp.bYaw) * sp.bSpeed * dt
          );
          sp.bx = resolved.x;
          sp.bz = resolved.z;

          sp.wakeTimer += dt;
          if (sp.wakeTimer > 0.19) {
            sp.wakeTimer = 0;
            boatHandle.wakeAnchor.getWorldPosition(_vec3C);
            emitSplash(_vec3C.x, waterHeightAt(_vec3C.x, _vec3C.z, elapsedTotal), _vec3C.z);
          }
        } else {
          sp.bSpeed = THREE.MathUtils.lerp(sp.bSpeed, 0, Math.min(1, dt * 4));
        }

        // Gentle ocean bobbing & pitch/roll
        const boatWaveY = waterHeightAt(sp.bx, sp.bz, elapsedTotal);
        boatHandle.root.position.set(sp.bx, boatWaveY - 0.08, sp.bz);
        boatHandle.root.rotation.y = sp.bYaw;
        boatHandle.hullGroup.rotation.x = Math.sin(elapsedTotal * 2.0 + sp.bx * 0.2) * 0.035 - (sp.bSpeed / 25) * 0.04;
        boatHandle.hullGroup.rotation.z = Math.cos(elapsedTotal * 1.7 + sp.bz * 0.2) * 0.04;

        // Place angler seated cleanly at boat's seatAnchor
        boatHandle.seatAnchor.getWorldPosition(_vec3C);
        sp.px = _vec3C.x;
        sp.py = _vec3C.y;
        sp.pz = _vec3C.z;
        sp.yaw = sp.bYaw;
        sp.isGrounded = true;
      } else {
        // Idle moored boat still gently bobs on the waves
        const mooredY = waterHeightAt(sp.bx, sp.bz, elapsedTotal);
        boatHandle.root.position.set(sp.bx, mooredY - 0.08, sp.bz);
        boatHandle.root.rotation.y = sp.bYaw;
        boatHandle.hullGroup.rotation.x = Math.sin(elapsedTotal * 1.8) * 0.025;
        boatHandle.hullGroup.rotation.z = Math.cos(elapsedTotal * 1.5) * 0.03;

        if (canMove && mag > 0.08) {
          const nx = inX / Math.max(1, mag);
          const ny = inY / Math.max(1, mag);
          moveRatio = Math.min(1, mag);

          const sinC = Math.sin(sp.camYaw);
          const cosC = Math.cos(sp.camYaw);
          const worldDirX = -sinC * ny + cosC * nx;
          const worldDirZ = -cosC * ny - sinC * nx;

          const speed = 6.2 * moveRatio;
          const clamped = clampPlayerWorldPosition(
            sp.px,
            sp.pz,
            sp.px + worldDirX * speed * dt,
            sp.pz + worldDirZ * speed * dt
          );
          sp.px = clamped.x;
          sp.pz = clamped.z;

          const desiredYaw = Math.atan2(worldDirX, worldDirZ);
          let diffYaw = desiredYaw - sp.yaw;
          while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
          while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;
          sp.yaw += diffYaw * Math.min(1, dt * 14);
        }

        // Jump & Gravity
        if (jumpQueuedRef.current && sp.isGrounded && canMove) {
          sp.vy = 7.2;
          sp.isGrounded = false;
        }
        jumpQueuedRef.current = false;

        const groundY = getGroundHeightAtWorld(sp.px, sp.pz);
        if (!sp.isGrounded || sp.py > groundY + 0.02) {
          sp.vy -= 21 * dt;
          sp.py += sp.vy * dt;
          if (sp.py <= groundY) {
            sp.py = groundY;
            sp.vy = 0;
            sp.isGrounded = true;
          }
        } else {
          sp.py = THREE.MathUtils.lerp(sp.py, groundY, 0.35);
          sp.isGrounded = true;
        }
      }

      anglerRig.root.position.set(sp.px, sp.py, sp.pz);
      anglerRig.root.rotation.y = sp.yaw;

      // Update Cast Aim Reticle Ring on ocean surface (strictly along avatar facing yaw)
      const showAimRing = eng.phase === 'idle' || eng.phase === 'charging';
      aimRingMesh.visible = showAimRing;
      if (showAimRing) {
        const previewPower = eng.phase === 'charging' ? eng.castPower : 0.65;
        const aimPos = computeBobberTargetPosition(sp.px, sp.pz, sp.yaw, previewPower);
        const aimWaterY = waterHeightAt(aimPos.x, aimPos.z, elapsedTotal);
        aimRingMesh.position.set(aimPos.x, aimWaterY + 0.06, aimPos.z);
        const pulse = 1 + Math.sin(elapsedTotal * 5) * 0.08;
        aimRingMesh.scale.setScalar(eng.phase === 'charging' ? pulse * 1.25 : 0.9);
        aimRingMat.color.set(
          eng.phase === 'charging' && eng.castPower >= 0.78 && eng.castPower <= 0.94
            ? '#F6C453'
            : eng.phase === 'charging'
            ? '#5EC48B'
            : '#82AAA1'
        );
        aimRingMat.opacity = eng.phase === 'charging' ? 0.78 : 0.35;
      }

      // 5. Step Fisch Fishing State Machine
      curProps.onStepFishing(dt, emitSplash);

      if (prevPhase !== eng.phase) {
        if (eng.phase === 'casting') {
          anglerRig.rodTipAnchor.getWorldPosition(sp.bobberStart);
          const target = computeBobberTargetPosition(sp.px, sp.pz, sp.yaw, eng.castPower);
          sp.bobberTarget.set(target.x, 0, target.z);
          // Never snap or invert sp.yaw — avatar strictly faces their aimed cast direction!
        }
        prevPhase = eng.phase;
      }

      // Process any queued splashes (e.g., from Shake clicks)
      while (splashQueueRef.current.length > 0) {
        const s = splashQueueRef.current.shift()!;
        emitSplash(s.x, s.y, s.z);
      }

      if (sp.celebratingTimer > 0) {
        sp.celebratingTimer = Math.max(0, sp.celebratingTimer - dt);
      }

      // 6. Animate Roblox Rig & Update 3D Bobber + Fishing Line
      const isOnTarget =
        eng.phase === 'reeling' &&
        Math.abs(eng.reelFishPos - eng.reelBarCenter) <= eng.reelBarWidth / 2 + 0.018;

      animateRobloxAngler(anglerRig, {
        timeSec: elapsedTotal,
        moveSpeedRatio: sp.inBoat ? 0 : moveRatio,
        isGrounded: sp.isGrounded,
        isSeated: sp.inBoat,
        phase: eng.phase,
        castPower: eng.castPower,
        celebratingTimer: sp.celebratingTimer,
        reelOnTarget: isOnTarget,
      });

      const showLine =
        eng.phase === 'casting' ||
        eng.phase === 'waiting' ||
        eng.phase === 'biting' ||
        eng.phase === 'reeling';

      bobberGroup.visible = showLine;
      fishingLine.visible = showLine;

      if (showLine) {
        anglerRig.rodTipAnchor.getWorldPosition(_vec3A);
        if (eng.phase === 'casting') {
          const p = eng.bobberProgress;
          const arcY = Math.sin(p * Math.PI) * (2.6 + eng.castPower * 2.1);
          bobberGroup.position.lerpVectors(sp.bobberStart, sp.bobberTarget, p);
          bobberGroup.position.y += arcY;
        } else {
          const waveY = waterHeightAt(sp.bobberTarget.x, sp.bobberTarget.z, elapsedTotal);
          const jitterX =
            eng.phase === 'biting' || eng.phase === 'reeling'
              ? Math.sin(elapsedTotal * 16) * 0.25
              : 0;
          const sinkY = eng.phase === 'biting' ? -0.18 : eng.phase === 'reeling' ? -0.12 : 0;
          bobberGroup.position.set(
            sp.bobberTarget.x + jitterX,
            waveY + sinkY,
            sp.bobberTarget.z
          );
          bobberGroup.rotation.z = Math.sin(elapsedTotal * 2.5) * 0.14;
        }

        // Update 14-point fishing line curve
        const linePositions = lineGeo.attributes.position as THREE.BufferAttribute;
        const sag = eng.phase === 'waiting' ? 0.55 : eng.phase === 'casting' ? 0.8 : 0.1;
        for (let i = 0; i < 14; i += 1) {
          const t = i / 13;
          _vec3B.lerpVectors(_vec3A, bobberGroup.position, t);
          _vec3B.y -= Math.sin(t * Math.PI) * sag;
          linePositions.setXYZ(i, _vec3B.x, _vec3B.y, _vec3B.z);
        }
        linePositions.needsUpdate = true;
      }

      // 7. Caught 3D Fish Leap Animation
      if (pendingCatchMeshRef.current) {
        const trig = pendingCatchMeshRef.current;
        pendingCatchMeshRef.current = null;
        if (caughtFishGroup) {
          scene.remove(caughtFishGroup);
          disposeObject3DTree(caughtFishGroup);
        }
        caughtFishGroup = createCaughtFish3D(trig.species, trig.mutationColorHex, trig.isGiant);
        caughtFishGroup.position.copy(sp.bobberTarget);
        scene.add(caughtFishGroup);
      }
      if (caughtFishGroup) {
        if (sp.celebratingTimer > 0) {
          const t = 1 - sp.celebratingTimer / 1.9;
          const liftY = sp.py + 2.9 + Math.sin(Math.min(1, t * 1.4) * Math.PI) * 1.1;
          _vec3C.set(sp.px, liftY, sp.pz);
          caughtFishGroup.position.lerp(_vec3C, Math.min(1, dt * 6.5));
          caughtFishGroup.rotation.y += dt * 3.2;
          caughtFishGroup.rotation.z = Math.sin(elapsedTotal * 6) * 0.15;
        } else {
          scene.remove(caughtFishGroup);
          disposeObject3DTree(caughtFishGroup);
          caughtFishGroup = null;
        }
      }

      // 8. Splash Ripples & Rain Particles
      for (const s of splashPool) {
        if (s.age < s.maxAge) {
          s.age += dt;
          const prog = s.age / s.maxAge;
          s.mesh.scale.setScalar(0.6 + prog * 3.4);
          s.mat.opacity = Math.max(0, (1 - prog) * 0.72);
          if (s.age >= s.maxAge) s.mesh.visible = false;
        }
      }

      const raining = curProps.weather === 'Rain' || curProps.weather === 'Storm';
      rainMat.opacity = THREE.MathUtils.lerp(rainMat.opacity, raining ? 0.42 : 0, 0.08);
      if (raining) {
        const rAttr = rainGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < rainCount; i += 1) {
          let yTop = rAttr.getY(i * 2) - dt * 16;
          if (yTop < 0) yTop += 18;
          rAttr.setY(i * 2, yTop);
          rAttr.setY(i * 2 + 1, yTop - 0.85);
        }
        rAttr.needsUpdate = true;
      }

      // 9. Update Island Animations (Underwater fish, Aurora, Lanterns) & Nearest NPC check
      islandHandle.update(elapsedTotal, dt, isNight, curProps.auroraActive);

      if (elapsedTotal - lastNearCheck > 0.12) {
        lastNearCheck = elapsedTotal;

        // 9A. Auto-detect seamless island entry without scene reload!
        const activeIsl = findActiveIslandAt(sp.px, sp.pz, curProps.island.id);
        if (activeIsl.id !== curProps.island.id) {
          curProps.onEnterIsland(activeIsl.id);
        }

        // 9B. Distance-cull NPC nameplates & highlight nearest interactive NPC
        const spawns = getAllWorldNpcSpawns();
        const near = sp.inBoat ? null : findNearestNpc(sp.px, sp.pz, 3.6, spawns);
        for (const actor of islandHandle.npcActors) {
          const isHot = near?.id === actor.spawn.id;
          actor.ringMat.opacity = isHot ? 0.85 : 0.28;
          actor.ringMesh.scale.setScalar(isHot ? 1.18 : 1.0);
          const dSq = (actor.spawn.x - sp.px) ** 2 + (actor.spawn.z - sp.pz) ** 2;
          actor.nameplateSprite.visible = dSq <= 44 * 44;
        }
        if ((near?.id ?? null) !== lastNearestId) {
          lastNearestId = near?.id ?? null;
          setNearestNpc(near);
        }

        const isNearBoat = !sp.inBoat && Math.hypot(sp.px - sp.bx, sp.pz - sp.bz) <= 8.5;
        setNearBoat((prev) => (prev !== isNearBoat ? isNearBoat : prev));

        const canDisembarkAnywhere = sp.inBoat ? Boolean(findNearestDisembarkPoint(sp.bx, sp.bz, 11.5)) : false;
        setNearDockForDisembark((prev) => (prev !== canDisembarkAnywhere ? canDisembarkAnywhere : prev));

        // 9C. Open-World Live Sailing Compass Readout
        const pinnedId = curProps.compassTargetIslandId;
        if (sp.inBoat || pinnedId) {
          let targetIsland = pinnedId
            ? FISCH_ISLANDS.find((isl) => isl.id === pinnedId) ?? null
            : null;
          const isPinnedTarget = Boolean(targetIsland && targetIsland.id !== curProps.island.id);
          if (!isPinnedTarget) targetIsland = null;

          if (!targetIsland && sp.inBoat) {
            let bestDist = Infinity;
            const refX = sp.bx;
            const refZ = sp.bz;
            for (const isl of FISCH_ISLANDS) {
              if (isl.id === curProps.island.id) continue;
              const d = Math.hypot(isl.worldCoords.x - refX, isl.worldCoords.z - refZ);
              if (d < bestDist) {
                bestDist = d;
                targetIsland = isl;
              }
            }
          }

          if (targetIsland) {
            const refX = sp.inBoat ? sp.bx : sp.px;
            const refZ = sp.inBoat ? sp.bz : sp.pz;
            const dx = targetIsland.worldCoords.x - refX;
            const dz = targetIsland.worldCoords.z - refZ;
            const distM = Math.round(Math.hypot(dx, dz));
            const cosC = Math.cos(sp.camYaw);
            const sinC = Math.sin(sp.camYaw);
            const dotRight = dx * cosC - dz * sinC;
            const dotForward = -dx * sinC - dz * cosC;
            const arrowAngleDeg = (Math.atan2(dotRight, dotForward) * 180) / Math.PI;
            setCompassReadout({
              targetName: targetIsland.name,
              distanceM: distM,
              arrowAngleDeg,
              accentHex: targetIsland.accentHex,
              isPinnedTarget,
            });
          } else {
            setCompassReadout(null);
          }
        } else {
          setCompassReadout(null);
        }
      }

      // 10. Direct 60fps DOM updates for Cast Power Bar & Fisch Reel Bar
      if (castFillRef.current && eng.phase === 'charging') {
        castFillRef.current.style.width = `${Math.round(eng.castPower * 100)}%`;
      }
      if (reelBarRef.current && reelFishRef.current && reelProgRef.current && eng.phase === 'reeling') {
        const leftPct = (eng.reelBarCenter - eng.reelBarWidth / 2) * 100;
        reelBarRef.current.style.left = `${leftPct}%`;
        reelBarRef.current.style.width = `${eng.reelBarWidth * 100}%`;
        reelBarRef.current.style.backgroundColor = isOnTarget ? '#F7F6F1' : '#FCA5A5';
        reelFishRef.current.style.left = `${eng.reelFishPos * 100}%`;
        reelProgRef.current.style.width = `${Math.round(eng.reelProgress * 100)}%`;
      }

      // 11. Smooth Damped Third-Person Roblox Camera
      const focusX = sp.px;
      const focusY = sp.py + 1.85;
      const focusZ = sp.pz;
      const horiz = Math.cos(sp.camPitch) * sp.camDist;
      const vert = Math.sin(sp.camPitch) * sp.camDist;
      const desiredCamX = focusX + Math.sin(sp.camYaw) * horiz;
      const desiredCamY = Math.max(0.8, focusY + vert);
      const desiredCamZ = focusZ + Math.cos(sp.camYaw) * horiz;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredCamX, 11, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredCamY, 11, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredCamZ, 11, dt);
      camera.lookAt(focusX, focusY - 0.15, focusZ);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      frameId = window.setTimeout(tick, 16);
    } else {
      frameId = window.requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      islandHandle.dispose();
      anglerRig.dispose();
      boatHandle.dispose();
      aimRingMesh.geometry.dispose();
      aimRingMat.dispose();
      disposeObject3DTree(bobberGroup);
      if (caughtFishGroup) disposeObject3DTree(caughtFishGroup);
      waterGeo.dispose();
      waterMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      rainGeo.dispose();
      rainMat.dispose();
      splashPool.forEach((s) => {
        s.mesh.geometry.dispose();
        s.mat.dispose();
      });
      envRT.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [engineRef]);

  // Trigger 3D splash from outside (e.g. Shake button)
  useEffect(() => {
    if (phase === 'waiting' && engineRef.current.shakeCount > 0) {
      splashQueueRef.current.push({
        x: spatialRef.current.bobberTarget.x,
        y: 0,
        z: spatialRef.current.bobberTarget.z,
      });
    }
  }, [phase, shakeTarget, engineRef]);

  // Virtual Analog Joystick Multi-Touch Handlers (Bottom-Left)
  const joyPointerIdRef = useRef<number | null>(null);
  const joyOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const updateJoystickFromPointer = (clientX: number, clientY: number) => {
    const maxRadius = 34;
    const dx = clientX - joyOriginRef.current.x;
    const dy = -(clientY - joyOriginRef.current.y); // up = +Y
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(maxRadius, dist);
    const angle = Math.atan2(dy, dx);
    const nx = dist > 2 ? (Math.cos(angle) * clampedDist) / maxRadius : 0;
    const ny = dist > 2 ? (Math.sin(angle) * clampedDist) / maxRadius : 0;
    joystickVecRef.current = { x: nx, y: ny };
    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = `translate(${nx * maxRadius}px, ${-ny * maxRadius}px)`;
    }
  };

  const resetJoystick = () => {
    joyPointerIdRef.current = null;
    joystickVecRef.current = { x: 0, y: 0 };
    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = 'translate(0px, 0px)';
    }
  };

  const hookedSpecies = engineRef.current.hookedSpecies;
  const hookedColor = hookedSpecies
    ? theme === 'dark'
      ? RARITY_COLORS[hookedSpecies.rarity].dark
      : RARITY_COLORS[hookedSpecies.rarity].light
    : '#82AAA1';

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#081A24] select-none ${
        isFullscreen ? 'h-full flex-1' : 'h-[540px] sm:h-[640px]'
      }`}
    >
      {/* Dedicated Isolated WebGL Mount Container */}
      <div ref={mountRef} className="w-full h-full" />

      {webglLost && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#061116]/90 text-[#EDEBE3] text-sm font-semibold">
          Memulihkan konteks grafis 3D...
        </div>
      )}

      {/* Floating Top HUD Row (Top-Left Player Info + Controls Hint, Top-Center Compass, Top-Right Corner Icons) */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-start justify-between gap-2 pointer-events-none">
        <div className="flex flex-col items-start gap-1.5 max-w-[66%] pointer-events-auto">
          {hudTopLeft}
          <div className="px-2.5 py-1 rounded-lg bg-[#F7F6F1]/92 dark:bg-[#061116]/90 border border-[#0B1E27]/15 dark:border-[#82AAA1]/28 text-[11px] shadow-md">
            {phase === 'idle' && inBoat && (
              <span>
                <strong>Di Kapal ({boat.name})</strong> · WASD/Joystick berlayar ·{' '}
                <strong className="text-[#1D6664] dark:text-[#82AAA1]">Lempar [F]</strong> atau labuhkan di dermaga pulau lain!
              </span>
            )}
            {phase === 'idle' && !inBoat && (
              <span>
                <strong>WASD / Joystick</strong> jalan · Klik NPC / <strong>[E]</strong> · <strong>[B]</strong> naik kapal · tahan{' '}
                <strong className="text-[#1D6664] dark:text-[#82AAA1]">[F]</strong> lempar
              </span>
            )}
            {phase === 'charging' && (
              <span className="text-[#1D6664] dark:text-[#5EC48B] font-semibold">
                Lepas di zona hijau untuk Perfect Cast! (Mengikuti arah hadap karakter)
              </span>
            )}
            {phase === 'casting' && <span>Melempar kail ke laut {island.name}...</span>}
            {phase === 'waiting' && (
              <span>
                Menunggu sambaran · Klik <strong>Shake!</strong> atau tekan <strong>E</strong>!
              </span>
            )}
            {phase === 'biting' && (
              <span className="text-[#876B3A] dark:text-[#F6C453] font-bold">
                SAMBARAN! Bersiap menahan bar Reel!
              </span>
            )}
            {phase === 'reeling' && (
              <span className="text-[#1D6664] dark:text-[#82AAA1] font-semibold">
                Tahan &amp; Lepas Spasi / F / Tombol Tarik agar bar putih tepat di atas ikan!
              </span>
            )}
          </div>
        </div>

        {/* Top-Right Compact Corner Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-1.5 pointer-events-auto">
          {hudTopRight}

          <button
            type="button"
            onClick={() => setShowVirtualPad((v) => !v)}
            className="px-2.5 py-1.5 rounded-lg bg-[#F7F6F1]/95 dark:bg-[#061116]/92 border border-[#0B1E27]/15 dark:border-[#82AAA1]/28 text-[11px] font-semibold flex items-center gap-1.5 shadow-md cursor-pointer hover:border-[#267472]"
            title="Tampilkan / Sembunyikan Kontrol Sentuh iPad"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-[#1D6664] dark:text-[#82AAA1]" />
            <span className="hidden lg:inline">{showVirtualPad ? 'Sentuh' : 'Sentuh: OFF'}</span>
          </button>

          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="px-2.5 py-1.5 rounded-lg bg-[#F7F6F1]/95 dark:bg-[#061116]/92 border border-[#0B1E27]/15 dark:border-[#82AAA1]/28 text-[11px] font-semibold flex items-center gap-1.5 shadow-md cursor-pointer hover:border-[#267472]"
              title={isFullscreen ? 'Keluar Layar Penuh (Esc)' : 'Layar Penuh'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5 text-[#1D6664] dark:text-[#82AAA1]" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 text-[#1D6664] dark:text-[#82AAA1]" />
              )}
              <span className="hidden sm:inline">{isFullscreen ? 'Keluar' : 'Fullscreen'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Sailing Compass Banner (Top-Center when Sailing or Target Pinned) */}
      {compassReadout && (
        <div className="absolute top-16 sm:top-14 left-1/2 -translate-x-1/2 z-10 pointer-events-none px-3.5 py-1.5 rounded-xl bg-[#071722]/92 text-[#F7F6F1] border border-[#82AAA1]/45 shadow-xl flex items-center gap-2.5 text-xs tabular-nums">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center border"
            style={{ borderColor: compassReadout.accentHex }}
          >
            <ArrowUp
              className="w-3.5 h-3.5 transition-transform duration-150"
              style={{
                color: compassReadout.accentHex,
                transform: `rotate(${Math.round(compassReadout.arrowAngleDeg)}deg)`,
              }}
            />
          </div>
          <div className="leading-tight">
            <div className="text-[10px] uppercase tracking-wider text-[#98ACB5]">
              {compassReadout.isPinnedTarget ? 'Target Kompas' : 'Pelabuhan Terdekat'}
            </div>
            <div className="font-semibold">
              {compassReadout.targetName} · <span className="text-[#F6C453]">{compassReadout.distanceM} m</span>
            </div>
          </div>
        </div>
      )}

      {/* Clickable Shake Prompt during Waiting */}
      {phase === 'waiting' && shakeTarget && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onTriggerShake();
          }}
          style={{
            left: `${shakeTarget.xPercent}%`,
            top: `${shakeTarget.yPercent}%`,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute z-20 px-4 py-2 rounded-lg bg-[#F7F6F1] dark:bg-[#061116] text-[#0B1E27] dark:text-[#EDEBE3] border-2 border-[#267472] dark:border-[#82AAA1] font-display font-bold text-xs shadow-xl hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          Shake! [E]
        </button>
      )}

      {/* Cast Power Bar Overlay */}
      {phase === 'charging' && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 w-56 sm:w-64 rounded-xl bg-[#F7F6F1]/95 dark:bg-[#061116]/95 border border-[#0B1E27]/20 dark:border-[#82AAA1]/35 p-2.5 shadow-xl pointer-events-none">
          <div className="text-[11px] font-bold text-center mb-1.5">DAYA LEMPAR</div>
          <div className="relative h-3.5 rounded-md bg-[#DCE6E4] dark:bg-[#102B38] overflow-hidden">
            {/* Perfect zone 78-94% */}
            <div
              className="absolute top-0 bottom-0 bg-[#5EC48B]/40"
              style={{ left: '78%', width: '16%' }}
            />
            <div
              ref={castFillRef}
              className="h-full bg-[#267472] dark:bg-[#82AAA1]"
              style={{ width: '10%' }}
            />
          </div>
        </div>
      )}

      {/* Authentic Fisch Horizontal Reel Minigame Bar */}
      {phase === 'reeling' && (
        <div
          onPointerDown={(e) => {
            e.stopPropagation();
            onBeginCastOrReel();
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            onReleaseInput();
          }}
          onPointerCancel={() => onReleaseInput()}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[min(460px,76vw)] rounded-xl bg-[#071722]/94 text-[#F7F6F1] border border-[#82AAA1]/45 p-3 shadow-2xl cursor-pointer"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
            <span>REEL MINIGAME · Sentuh / Tahan Spasi</span>
            {hookedSpecies && (
              <span style={{ color: hookedColor }}>
                {hookedSpecies.rarity} (Dif {hookedSpecies.difficulty}/10)
              </span>
            )}
          </div>

          {/* Reel Track */}
          <div className="relative h-7 rounded-lg bg-[#0D2B38] border border-[#82AAA1]/30 overflow-hidden mb-2">
            {/* White Control Bar */}
            <div
              ref={reelBarRef}
              className="absolute top-1 bottom-1 rounded-md shadow"
              style={{ left: '36%', width: '28%', backgroundColor: '#F7F6F1' }}
            />
            {/* Darting Fish Marker */}
            <div
              ref={reelFishRef}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-3.5 rounded-sm border border-[#071722]"
              style={{ left: '50%', backgroundColor: hookedColor }}
            />
          </div>

          {/* Progress Bar */}
          <div className="h-2 rounded-full bg-[#102B38] overflow-hidden">
            <div
              ref={reelProgRef}
              className="h-full bg-[#5EC48B]"
              style={{ width: '25%' }}
            />
          </div>
        </div>
      )}

      {/* Bottom-Left iPad Virtual Analog Joystick */}
      {showVirtualPad && (
        <div
          onPointerDown={(e) => {
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
            const rect = e.currentTarget.getBoundingClientRect();
            joyPointerIdRef.current = e.pointerId;
            joyOriginRef.current = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            };
            updateJoystickFromPointer(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (joyPointerIdRef.current !== e.pointerId) return;
            e.stopPropagation();
            updateJoystickFromPointer(e.clientX, e.clientY);
          }}
          onPointerUp={(e) => {
            if (joyPointerIdRef.current === e.pointerId) {
              e.stopPropagation();
              resetJoystick();
            }
          }}
          onPointerCancel={(e) => {
            if (joyPointerIdRef.current === e.pointerId) resetJoystick();
          }}
          className="absolute bottom-4 left-4 z-20 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#061116]/65 border-2 border-[#EDEBE3]/30 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
          aria-label="Analog Joystick Bergerak"
        >
          <div className="w-10 h-10 rounded-full border border-[#EDEBE3]/20 pointer-events-none flex items-center justify-center">
            <div
              ref={joystickKnobRef}
              className="w-10 h-10 rounded-full bg-[#F7F6F1]/90 border-2 border-[#267472] shadow-lg pointer-events-none"
            />
          </div>
        </div>
      )}

      {/* Bottom-Right Roblox Action Cluster (Talk/Board Boat + Jump + Cast/Reel) */}
      {showVirtualPad && (
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2">
          <div className="flex flex-wrap items-center justify-end gap-2">

            {nearestNpc && !inBoat && phase === 'idle' && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onInteractNpc(nearestNpc);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#876B3A] hover:bg-[#6E562D] text-[#F7F6F1] border border-[#F6C453]/60 text-xs font-bold flex items-center gap-1.5 shadow-xl cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Bicara: {nearestNpc.name} [E]</span>
              </button>
            )}

            {phase === 'idle' && !inBoat && nearBoat && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBoatBoarding(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#1E3A5F] hover:bg-[#274B7A] text-[#F7F6F1] border border-[#63B3ED]/70 text-xs font-bold flex items-center gap-1.5 shadow-xl cursor-pointer"
              >
                <Ship className="w-3.5 h-3.5" />
                <span>Naik Kapal [B]</span>
              </button>
            )}

            {phase === 'idle' && inBoat && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBoatBoarding(!nearDockForDisembark);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#1E3A5F] hover:bg-[#274B7A] text-[#F7F6F1] border border-[#63B3ED]/70 text-xs font-bold flex items-center gap-1.5 shadow-xl cursor-pointer"
              >
                <Ship className="w-3.5 h-3.5" />
                <span>{nearDockForDisembark ? 'Turun ke Dermaga [B]' : 'Pulang ke Dermaga'}</span>
              </button>
            )}

            {phase === 'idle' && !inBoat && (
              <button
                type="button"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  jumpQueuedRef.current = true;
                }}
                className="w-12 h-12 rounded-xl bg-[#061116]/82 hover:bg-[#0E2632] text-[#F7F6F1] border border-[#EDEBE3]/30 flex flex-col items-center justify-center text-[10px] font-bold shadow-lg cursor-pointer active:scale-95"
                title="Lompat (Spasi)"
              >
                <ArrowUp className="w-4 h-4" />
                <span>Lompat</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              if (phase === 'waiting') {
                onTriggerShake();
              } else {
                onBeginCastOrReel();
              }
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              onReleaseInput();
            }}
            onPointerCancel={() => onReleaseInput()}
            onPointerLeave={() => {
              if (phase === 'charging' || phase === 'reeling') onReleaseInput();
            }}
            className={`px-4 py-3 rounded-xl font-display font-bold text-xs sm:text-sm flex items-center gap-2 shadow-2xl border-2 cursor-pointer active:scale-95 transition-transform ${
              phase === 'reeling'
                ? 'bg-[#2A7B4F] border-[#5EC48B] text-[#F7F6F1]'
                : phase === 'waiting'
                ? 'bg-[#876B3A] border-[#F6C453] text-[#F7F6F1]'
                : 'bg-[#267472] hover:bg-[#1D6664] border-[#82AAA1] text-[#F7F6F1]'
            }`}
          >
            <Anchor className="w-4 h-4" />
            <span>
              {phase === 'reeling'
                ? 'TAHAN TARIK!'
                : phase === 'waiting'
                ? 'SHAKE! [E]'
                : phase === 'charging'
                ? 'LEPAS KAIL!'
                : 'LEMPAR [F]'}
            </span>
          </button>
        </div>
      )}

      {/* Status Banner */}
      {statusBanner && phase !== 'reeling' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4 py-2 rounded-xl bg-[#0B1E27]/94 dark:bg-[#EDEBE3]/95 text-[#F7F6F1] dark:text-[#061116] text-xs font-semibold shadow-xl whitespace-nowrap max-w-[85%] truncate">
          {statusBanner}
        </div>
      )}

      {/* Extra Overlays (Catch Showcase Card, etc.) */}
      {children}
    </div>
  );
};
