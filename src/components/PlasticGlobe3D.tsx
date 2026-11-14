import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import countriesAtlas from 'world-atlas/countries-50m.json';
import {
  ACCUMULATION_ZONES,
  MARINE_PROTECTED_AREAS,
  OBSERVATION_STATIONS,
  OCEAN_CURRENT_CIRCUITS,
  PLASTIC_HEATMAP_POINTS,
  LiveStationCurrent,
  OceanRegion,
  PlasticJourneyOrigin,
  TrackerLayerId,
} from '../data/plasticTrackerData';
import { buildSphericalArcPoints, latLngToVector3 } from '../utils/plasticTrackerHelpers';
import { ThemeMode } from '../hooks/useTheme';

export type GlobeSelection =
  | { kind: 'zone'; id: string }
  | { kind: 'station'; id: string }
  | { kind: 'mpa'; id: string }
  | { kind: 'heatmap'; id: string };

interface PlasticGlobe3DProps {
  activeLayers: Record<TrackerLayerId, boolean>;
  selectedRegion: OceanRegion;
  selectedItem: GlobeSelection | null;
  liveCurrents: Record<string, LiveStationCurrent>;
  journeyOrigin: PlasticJourneyOrigin | null;
  journeyPlaying: boolean;
  onSelect: (selection: GlobeSelection) => void;
  onWebGLFallback: () => void;
  theme?: ThemeMode;
}

const GLOBE_RADIUS = 1.0;

// Prominent bathymetric oceanic basins & sunlit coral shelf pockets for natural underwater depth variation
const BATHYMETRIC_FEATURES: { lat: number; lng: number; rx: number; ry: number; color: string; alpha: number }[] = [
  // Sunlit Coral Triangle & Indo-Pacific Warm Pool
  { lat: -2, lng: 122, rx: 145, ry: 78, color: '#2DD4BF', alpha: 0.22 },
  { lat: 18, lng: -76, rx: 105, ry: 55, color: '#2DD4BF', alpha: 0.19 }, // Caribbean Reef Lagoon
  { lat: -18, lng: 149, rx: 88, ry: 48, color: '#5EEAD4', alpha: 0.20 }, // Coral Sea / Great Barrier Reef
  { lat: 10, lng: 68, rx: 110, ry: 75, color: '#1E6478', alpha: 0.25 }, // Arabian / Indian basin
  // Deep Ocean Abyssal Trenches & Mid-Ocean Ridges
  { lat: 16, lng: 145, rx: 45, ry: 120, color: '#04121A', alpha: 0.42 }, // Mariana Trench
  { lat: 24, lng: -44, rx: 52, ry: 170, color: '#1B596C', alpha: 0.24 }, // Mid-Atlantic Ridge glow
  { lat: -26, lng: -114, rx: 60, ry: 145, color: '#174E60', alpha: 0.22 }, // East Pacific Rise
  { lat: -10, lng: 105, rx: 85, ry: 32, color: '#04121A', alpha: 0.36 }, // Java Trench
];

function drawGeoRingToCanvas(
  ctx: CanvasRenderingContext2D,
  ring: number[][],
  w: number,
  h: number
) {
  ring.forEach(([lng, lat], idx) => {
    const x = ((lng + 180) / 360) * w;
    const y = ((90 - lat) / 180) * h;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
}

function createBaseOceanTexture(theme: ThemeMode): THREE.CanvasTexture {
  const isLight = theme === 'light';
  const w = 2048;
  const h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // 1. Multi-depth Oceanic Column Gradient (Daylight Cerulean-Turquoise vs Abyssal Bioluminescent Teal)
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
  if (isLight) {
    oceanGrad.addColorStop(0.0, '#7BB6C7');
    oceanGrad.addColorStop(0.16, '#90CAD8');
    oceanGrad.addColorStop(0.35, '#A7DCE3');
    oceanGrad.addColorStop(0.5, '#C0EAEC');
    oceanGrad.addColorStop(0.65, '#A7DCE3');
    oceanGrad.addColorStop(0.84, '#90CAD8');
    oceanGrad.addColorStop(1.0, '#7BB6C7');
  } else {
    oceanGrad.addColorStop(0.0, '#071B26');
    oceanGrad.addColorStop(0.16, '#0C2F3F');
    oceanGrad.addColorStop(0.35, '#13495D');
    oceanGrad.addColorStop(0.5, '#1A5E73');
    oceanGrad.addColorStop(0.65, '#13495D');
    oceanGrad.addColorStop(0.84, '#0C2F3F');
    oceanGrad.addColorStop(1.0, '#071B26');
  }
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Subtle submarine bathymetric basins, mid-ocean ridges & deep ocean trenches
  BATHYMETRIC_FEATURES.forEach((feat) => {
    const cx = ((feat.lng + 180) / 360) * w;
    const cy = ((90 - feat.lat) / 180) * h;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(feat.rx, feat.ry));
    const fillCol = isLight
      ? feat.color === '#04121A'
        ? '#4B889E'
        : '#5EEAD4'
      : feat.color;
    ctx.save();
    ctx.globalAlpha = isLight ? feat.alpha * 0.78 : feat.alpha;
    ctx.translate(cx, cy);
    ctx.scale(1, feat.ry / feat.rx);
    grad.addColorStop(0, fillCol);
    grad.addColorStop(0.65, fillCol);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, feat.rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 3. Delicate bathymetric wave / depth shimmer bands across equatorial & mid-latitude seas
  ctx.save();
  ctx.strokeStyle = isLight ? 'rgba(255, 255, 255, 0.24)' : 'rgba(94, 234, 212, 0.055)';
  ctx.lineWidth = 1.2;
  for (let row = 0; row < 14; row++) {
    const baseY = h * (0.16 + row * 0.05);
    ctx.beginPath();
    for (let x = 0; x <= w; x += 24) {
      const waveY = baseY + Math.sin((x / w) * Math.PI * 8 + row * 0.9) * 9;
      if (x === 0) ctx.moveTo(x, waveY);
      else ctx.lineTo(x, waveY);
    }
    ctx.stroke();
  }
  ctx.restore();

  // 4. Refined oceanic graticules (15 deg intervals)
  ctx.strokeStyle = isLight ? 'rgba(15, 70, 82, 0.13)' : 'rgba(103, 232, 249, 0.09)';
  ctx.lineWidth = 1;
  for (let lng = -165; lng <= 180; lng += 15) {
    const x = ((lng + 180) / 360) * w;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let lat = -75; lat <= 75; lat += 15) {
    const y = ((90 - lat) / 180) * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  // Sunlit equator line
  ctx.strokeStyle = isLight ? 'rgba(180, 83, 9, 0.34)' : 'rgba(251, 191, 36, 0.22)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();

  // 5. Render detailed 1:50m coastlines & natural landmasses from world-atlas TopoJSON
  const topology = countriesAtlas as unknown as Topology<{
    land: GeometryCollection;
    countries: GeometryCollection;
  }>;
  const landGeo = feature(topology, topology.objects.land);
  const countriesGeo = feature(topology, topology.objects.countries);

  const drawPolygon = (rings: number[][][], fill: boolean, stroke: boolean) => {
    ctx.beginPath();
    rings.forEach((ring) => drawGeoRingToCanvas(ctx, ring, w, h));
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  };

  const drawAllLandStrokes = (strokeStyle: string, lineWidth: number) => {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    if (landGeo.type === 'FeatureCollection') {
      landGeo.features.forEach((f) => {
        if (!f.geometry) return;
        if (f.geometry.type === 'Polygon') {
          drawPolygon(f.geometry.coordinates, false, true);
        } else if (f.geometry.type === 'MultiPolygon') {
          f.geometry.coordinates.forEach((poly: number[][][]) => drawPolygon(poly, false, true));
        }
      });
    }
  };

  drawAllLandStrokes(isLight ? 'rgba(94, 234, 212, 0.36)' : 'rgba(45, 212, 191, 0.16)', 12.0);
  drawAllLandStrokes(isLight ? 'rgba(153, 246, 228, 0.56)' : 'rgba(94, 234, 212, 0.28)', 5.2);

  // Landmass terrain gradient + subtle country hairlines
  const landGrad = ctx.createLinearGradient(0, 0, 0, h);
  if (isLight) {
    landGrad.addColorStop(0.0, '#D4E2DC');
    landGrad.addColorStop(0.25, '#95BA9B');
    landGrad.addColorStop(0.5, '#A6C792');
    landGrad.addColorStop(0.75, '#94B89B');
    landGrad.addColorStop(1.0, '#DCE6E2');
  } else {
    landGrad.addColorStop(0.0, '#2C5052');
    landGrad.addColorStop(0.25, '#1E4F46');
    landGrad.addColorStop(0.5, '#265947');
    landGrad.addColorStop(0.75, '#1F4B45');
    landGrad.addColorStop(1.0, '#355459');
  }

  ctx.fillStyle = landGrad;
  ctx.strokeStyle = isLight ? 'rgba(15, 70, 82, 0.22)' : 'rgba(167, 243, 208, 0.16)';
  ctx.lineWidth = 0.75;
  if (countriesGeo.type === 'FeatureCollection') {
    countriesGeo.features.forEach((f) => {
      if (!f.geometry) return;
      if (f.geometry.type === 'Polygon') {
        drawPolygon(f.geometry.coordinates, true, true);
      } else if (f.geometry.type === 'MultiPolygon') {
        f.geometry.coordinates.forEach((poly: number[][][]) => drawPolygon(poly, true, true));
      }
    });
  }

  // Sunlit aqua shoreline edge
  drawAllLandStrokes(isLight ? 'rgba(14, 116, 144, 0.65)' : 'rgba(103, 232, 249, 0.72)', 1.6);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createHeatmapTexture(): THREE.CanvasTexture {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);

  PLASTIC_HEATMAP_POINTS.forEach((pt) => {
    const cx = ((pt.lng + 180) / 360) * w;
    const cy = ((90 - pt.lat) / 180) * h;
    const radius = 42 + pt.intensity * 58;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    if (pt.intensity >= 0.8) {
      grad.addColorStop(0, 'rgba(244, 114, 126, 0.80)'); // Coral rose peak
      grad.addColorStop(0.38, 'rgba(251, 191, 36, 0.52)'); // Sunlit amber gold
      grad.addColorStop(0.72, 'rgba(45, 212, 191, 0.24)'); // Lagoon turquoise dispersion
      grad.addColorStop(1, 'rgba(23, 72, 90, 0)');
    } else if (pt.intensity >= 0.55) {
      grad.addColorStop(0, 'rgba(251, 191, 36, 0.64)');
      grad.addColorStop(0.48, 'rgba(45, 212, 191, 0.34)');
      grad.addColorStop(1, 'rgba(23, 72, 90, 0)');
    } else {
      grad.addColorStop(0, 'rgba(45, 212, 191, 0.48)');
      grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.22)');
      grad.addColorStop(1, 'rgba(23, 72, 90, 0)');
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Handle antimeridian wrap around canvas edges cleanly
    if (cx - radius < 0) {
      ctx.beginPath();
      ctx.arc(cx + w, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (cx + radius > w) {
      ctx.beginPath();
      ctx.arc(cx - w, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export const PlasticGlobe3D: React.FC<PlasticGlobe3DProps> = ({
  activeLayers,
  selectedRegion,
  selectedItem,
  liveCurrents,
  journeyOrigin,
  journeyPlaying,
  onSelect,
  onWebGLFallback,
  theme = 'dark',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const layersRef = useRef(activeLayers);
  const selectedItemRef = useRef(selectedItem);
  const onSelectRef = useRef(onSelect);
  const onWebGLFallbackRef = useRef(onWebGLFallback);
  const journeyOriginRef = useRef(journeyOrigin);
  const journeyPlayingRef = useRef(journeyPlaying);
  const themeRef = useRef<ThemeMode>(theme);

  layersRef.current = activeLayers;
  selectedItemRef.current = selectedItem;
  onSelectRef.current = onSelect;
  onWebGLFallbackRef.current = onWebGLFallback;
  journeyOriginRef.current = journeyOrigin;
  journeyPlayingRef.current = journeyPlaying;
  themeRef.current = theme;

  const heatmapMeshRef = useRef<THREE.Mesh | null>(null);
  const zonesGroupRef = useRef<THREE.Group | null>(null);
  const currentsGroupRef = useRef<THREE.Group | null>(null);
  const stationsGroupRef = useRef<THREE.Group | null>(null);
  const mpaGroupRef = useRef<THREE.Group | null>(null);
  const journeyGroupRef = useRef<THREE.Group | null>(null);
  const cameraTargetDirRef = useRef<THREE.Vector3 | null>(null);
  const cameraTargetDistRef = useRef<number | null>(null);
  const markerMeshesRef = useRef<THREE.Mesh[]>([]);
  const journeyCurveRef = useRef<THREE.Vector3[]>([]);
  const journeyParticleRef = useRef<THREE.Mesh | null>(null);

  // Refs for seamless Light/Dark mode updates without tearing down WebGL context
  const earthMatRef = useRef<THREE.MeshPhongMaterial | null>(null);
  const baseTexRef = useRef<THREE.CanvasTexture | null>(null);
  const starsMatRef = useRef<THREE.PointsMaterial | null>(null);
  const atmoInnerMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const atmoOuterMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const themedLineMatsRef = useRef<{ mat: THREE.LineBasicMaterial; lightHex: number; darkHex: number }[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 520;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'default',
      });
    } catch {
      onWebGLFallbackRef.current();
      return;
    }

    const gl = renderer.getContext();
    if (!gl) {
      renderer.dispose();
      onWebGLFallbackRef.current();
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      onWebGLFallbackRef.current();
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    const initialPos = latLngToVector3(16, -150, 2.75);
    camera.position.copy(initialPos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 1.55;
    controls.maxDistance = 4.2;
    controls.rotateSpeed = 0.55;
    controls.zoomSpeed = 0.75;

    // Sunlit oceanic illumination matching SimulatorAquarium water columns
    scene.add(new THREE.AmbientLight(0xdff7f4, 1.25));
    const keyLight = new THREE.DirectionalLight(0xfff7e6, 1.35);
    keyLight.position.set(4, 3.2, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.95);
    rimLight.position.set(-4.5, -2.2, -3);
    scene.add(rimLight);
    const aquaFill = new THREE.DirectionalLight(0x2dd4bf, 0.55);
    aquaFill.position.set(0, -4, 3);
    scene.add(aquaFill);

    const initialIsLight = themeRef.current === 'light';

    // Subtle Starfield / Sky atmospheric motes around globe
    const starPositions: number[] = [];
    for (let i = 0; i < 240; i++) {
      const r = 4.8 + Math.random() * 5.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: initialIsLight ? 0x0284c7 : 0x99f6e4,
      size: 0.028,
      transparent: true,
      opacity: initialIsLight ? 0.16 : 0.48,
    });
    const starsPoints = new THREE.Points(starsGeo, starsMat);
    starsMatRef.current = starsMat;
    scene.add(starsPoints);

    // Base Earth Sphere with richer oceanic specular sheen
    const baseTex = createBaseOceanTexture(themeRef.current);
    baseTexRef.current = baseTex;
    const earthGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 72, 72);
    const earthMat = new THREE.MeshPhongMaterial({
      map: baseTex,
      specular: new THREE.Color(initialIsLight ? 0x38bdf8 : 0x2dd4bf),
      shininess: 22,
    });
    earthMatRef.current = earthMat;
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);

    // Dual-layer Atmosphere Rim Halo (Inner bright cyan + Outer deep teal glow)
    const atmoInnerGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.032, 48, 48);
    const atmoInnerMat = new THREE.MeshBasicMaterial({
      color: initialIsLight ? 0x0ea5e9 : 0x38bdf8,
      transparent: true,
      opacity: initialIsLight ? 0.09 : 0.11,
      side: THREE.BackSide,
    });
    atmoInnerMatRef.current = atmoInnerMat;
    scene.add(new THREE.Mesh(atmoInnerGeo, atmoInnerMat));

    const atmoOuterGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.075, 48, 48);
    const atmoOuterMat = new THREE.MeshBasicMaterial({
      color: initialIsLight ? 0x38bdf8 : 0x2dd4bf,
      transparent: true,
      opacity: initialIsLight ? 0.05 : 0.06,
      side: THREE.BackSide,
    });
    atmoOuterMatRef.current = atmoOuterMat;
    scene.add(new THREE.Mesh(atmoOuterGeo, atmoOuterMat));

    // Layer 1: Microplastic Heatmap Concentric Shell
    const heatTex = createHeatmapTexture();
    const heatGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.006, 64, 64);
    const heatMat = new THREE.MeshBasicMaterial({
      map: heatTex,
      transparent: true,
      depthWrite: false,
    });
    const heatMesh = new THREE.Mesh(heatGeo, heatMat);
    heatMesh.visible = layersRef.current.heatmap;
    scene.add(heatMesh);
    heatmapMeshRef.current = heatMesh;

    const clickableMarkers: THREE.Mesh[] = [];

    // Layer 2: 5 Subtropical Accumulation Gyres (Multi-Ring Swirling Vortex Spirals + Floating Debris Flecks)
    const zonesGroup = new THREE.Group();
    zonesGroup.visible = layersRef.current.zones;
    const swirlingVortexNodes: { group: THREE.Group; speed: number }[] = [];

    ACCUMULATION_ZONES.forEach((zone, idx) => {
      const pos = latLngToVector3(zone.lat, zone.lng, GLOBE_RADIUS * 1.016);
      const normal = pos.clone().normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

      // Local vortex assembly oriented tangent to the globe surface
      const vortexPivot = new THREE.Group();
      vortexPivot.position.copy(pos);
      vortexPivot.quaternion.copy(quat);

      // Outer turquoise-gold dispersal halo
      const outerRing = new THREE.Mesh(
        new THREE.RingGeometry(0.088, 0.106, 40),
        new THREE.MeshBasicMaterial({
          color: 0xfbbf24,
          transparent: true,
          opacity: 0.42,
          side: THREE.DoubleSide,
        })
      );
      vortexPivot.add(outerRing);

      // Inner vibrant coral ring
      const innerRing = new THREE.Mesh(
        new THREE.RingGeometry(0.05, 0.068, 36),
        new THREE.MeshBasicMaterial({
          color: 0xf4727e,
          transparent: true,
          opacity: 0.82,
          side: THREE.DoubleSide,
        })
      );
      vortexPivot.add(innerRing);

      // Rotating spiral arms + microplastic flecks
      const spinGroup = new THREE.Group();
      for (let arm = 0; arm < 3; arm++) {
        const baseAngle = (arm * Math.PI * 2) / 3;
        const spiralPts: THREE.Vector3[] = [];
        for (let step = 0; step <= 12; step++) {
          const t = step / 12;
          const r = 0.025 + t * 0.072;
          const a = baseAngle + t * 1.9;
          spiralPts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0.002));
        }
        const spiralGeo = new THREE.BufferGeometry().setFromPoints(spiralPts);
        const spiralMat = new THREE.LineBasicMaterial({
          color: arm % 2 === 0 ? 0xfbbf24 : 0xf4727e,
          transparent: true,
          opacity: 0.72,
        });
        spinGroup.add(new THREE.Line(spiralGeo, spiralMat));

        // Tiny drifting plastic speck at spiral tip
        const tipPt = spiralPts[spiralPts.length - 2];
        const speck = new THREE.Mesh(
          new THREE.BoxGeometry(0.009, 0.006, 0.004),
          new THREE.MeshBasicMaterial({ color: arm === 0 ? 0x38bdf8 : 0xfef08a })
        );
        speck.position.copy(tipPt);
        spinGroup.add(speck);
      }
      vortexPivot.add(spinGroup);
      swirlingVortexNodes.push({
        group: spinGroup,
        speed: zone.lat >= 0 ? 0.55 + idx * 0.05 : -(0.55 + idx * 0.05),
      });

      zonesGroup.add(vortexPivot);

      // Interactive glowing center marker
      const markerGeo = new THREE.SphereGeometry(0.025, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0xf4727e });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(pos);
      marker.userData = {
        selection: { kind: 'zone', id: zone.id } as GlobeSelection,
        baseColor: 0xf4727e,
      };
      zonesGroup.add(marker);
      clickableMarkers.push(marker);
    });
    scene.add(zonesGroup);
    zonesGroupRef.current = zonesGroup;

    // Layer 3: Glowing Ocean Current Circuits + Vivid Drifting Flow Packets
    const currentsGroup = new THREE.Group();
    currentsGroup.visible = layersRef.current.currents;
    const currentParticles: { mesh: THREE.Mesh; curve: THREE.Vector3[]; t: number; speed: number }[] = [];
    const themedLines: { mat: THREE.LineBasicMaterial; lightHex: number; darkHex: number }[] = [];

    OCEAN_CURRENT_CIRCUITS.forEach((circuit) => {
      const pts = buildSphericalArcPoints(circuit.waypoints, GLOBE_RADIUS * 1.013, 18);
      if (pts.length < 2) return;

      const isWarm = circuit.type === 'warm';
      const darkPrimary = isWarm ? 0xf59e0b : 0x2dd4bf;
      const lightPrimary = isWarm ? 0xd97706 : 0x0284c7;
      const packetColor = isWarm ? 0xfef08a : 0x67e8f9;

      // Primary glowing current streamline
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({
        color: initialIsLight ? lightPrimary : darkPrimary,
        transparent: true,
        opacity: 0.82,
      });
      themedLines.push({ mat: lineMat, lightHex: lightPrimary, darkHex: darkPrimary });
      currentsGroup.add(new THREE.Line(lineGeo, lineMat));

      // Subtle lifted parallel twin streamline for visual richness
      const liftedPts = buildSphericalArcPoints(circuit.waypoints, GLOBE_RADIUS * 1.017, 18);
      const auraGeo = new THREE.BufferGeometry().setFromPoints(liftedPts);
      const auraDark = isWarm ? 0xfb7185 : 0x38bdf8;
      const auraLight = isWarm ? 0xf97316 : 0x0369a1;
      const auraMat = new THREE.LineBasicMaterial({
        color: initialIsLight ? auraLight : auraDark,
        transparent: true,
        opacity: 0.34,
      });
      themedLines.push({ mat: auraMat, lightHex: auraLight, darkHex: auraDark });
      currentsGroup.add(new THREE.Line(auraGeo, auraMat));

      // Animated bioluminescent flow particles along current direction
      for (let k = 0; k < 4; k++) {
        const pGeo = new THREE.SphereGeometry(0.011, 10, 10);
        const pMat = new THREE.MeshBasicMaterial({ color: packetColor });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        currentsGroup.add(pMesh);
        currentParticles.push({
          mesh: pMesh,
          curve: pts,
          t: k / 4,
          speed: 0.08 + circuit.baselineVelocityMs * 0.055,
        });
      }
    });
    themedLineMatsRef.current = themedLines;
    scene.add(currentsGroup);
    currentsGroupRef.current = currentsGroup;

    // Layer 4: Observation Stations (Crisp Sky-Cyan Beacon Buoys with Outer Ring)
    const stationsGroup = new THREE.Group();
    stationsGroup.visible = layersRef.current.stations;
    OBSERVATION_STATIONS.forEach((st) => {
      const pos = latLngToVector3(st.lat, st.lng, GLOBE_RADIUS * 1.019);
      const normal = pos.clone().normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

      // Outer luminous sky-cyan buoy halo
      const haloRing = new THREE.Mesh(
        new THREE.RingGeometry(0.024, 0.034, 24),
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.75,
          side: THREE.DoubleSide,
        })
      );
      haloRing.position.copy(pos);
      haloRing.quaternion.copy(quat);
      stationsGroup.add(haloRing);

      const stGeo = new THREE.SphereGeometry(0.017, 14, 14);
      const stMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const marker = new THREE.Mesh(stGeo, stMat);
      marker.position.copy(pos);
      marker.userData = {
        selection: { kind: 'station', id: st.id } as GlobeSelection,
        baseColor: 0xfef08a,
      };
      stationsGroup.add(marker);
      clickableMarkers.push(marker);
    });
    scene.add(stationsGroup);
    stationsGroupRef.current = stationsGroup;

    // Layer 5: Marine Protected Areas (Emerald-Aqua Sanctuary Shields)
    const mpaGroup = new THREE.Group();
    mpaGroup.visible = layersRef.current.mpa;
    MARINE_PROTECTED_AREAS.forEach((mpa) => {
      const pos = latLngToVector3(mpa.lat, mpa.lng, GLOBE_RADIUS * 1.015);
      const normal = pos.clone().normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

      // Emerald outer sanctuary ring + teal inner ring
      const outerShield = new THREE.Mesh(
        new THREE.RingGeometry(0.036, 0.048, 28),
        new THREE.MeshBasicMaterial({
          color: 0x34d399,
          transparent: true,
          opacity: 0.82,
          side: THREE.DoubleSide,
        })
      );
      outerShield.position.copy(pos);
      outerShield.quaternion.copy(quat);
      mpaGroup.add(outerShield);

      const innerFill = new THREE.Mesh(
        new THREE.CircleGeometry(0.032, 24),
        new THREE.MeshBasicMaterial({
          color: 0x2dd4bf,
          transparent: true,
          opacity: 0.24,
          side: THREE.DoubleSide,
        })
      );
      innerFill.position.copy(pos);
      innerFill.quaternion.copy(quat);
      mpaGroup.add(innerFill);

      const mGeo = new THREE.SphereGeometry(0.015, 12, 12);
      const mMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
      const marker = new THREE.Mesh(mGeo, mMat);
      marker.position.copy(pos);
      marker.userData = {
        selection: { kind: 'mpa', id: mpa.id } as GlobeSelection,
        baseColor: 0x34d399,
      };
      mpaGroup.add(marker);
      clickableMarkers.push(marker);
    });
    scene.add(mpaGroup);
    mpaGroupRef.current = mpaGroup;

    markerMeshesRef.current = clickableMarkers;

    // Journey of Plastic group (populated dynamically)
    const journeyGroup = new THREE.Group();
    scene.add(journeyGroup);
    journeyGroupRef.current = journeyGroup;

    // Raycasting interaction
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
      cameraTargetDirRef.current = null;
      cameraTargetDistRef.current = null;
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.hypot(dx, dy) > 6) return;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const visibleClickables = markerMeshesRef.current.filter((m) => m.parent?.visible !== false);
      const intersects = raycaster.intersectObjects(visibleClickables, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const sel = hit.userData.selection as GlobeSelection | undefined;
        if (sel) {
          onSelectRef.current(sel);
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const visibleClickables = markerMeshesRef.current.filter((m) => m.parent?.visible !== false);
      const intersects = raycaster.intersectObjects(visibleClickables, false);
      renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    // ResizeObserver scheduled via rAF + updateStyle=false
    let resizeRafId = 0;
    let lastWidth = Math.round(width);
    let lastHeight = Math.round(height);
    const ro = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (!entry) return;
      const w = Math.max(200, Math.round(entry.contentRect.width));
      const h = Math.max(260, Math.round(entry.contentRect.height));
      if (w === lastWidth && h === lastHeight) return;
      lastWidth = w;
      lastHeight = h;

      if (resizeRafId) cancelAnimationFrame(resizeRafId);
      resizeRafId = requestAnimationFrame(() => {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      });
    });
    ro.observe(container);

    let rafId = 0;
    const clock = new THREE.Clock();
    let journeyT = 0;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);

      if (cameraTargetDirRef.current && cameraTargetDistRef.current) {
        const desiredPos = cameraTargetDirRef.current.clone().multiplyScalar(cameraTargetDistRef.current);
        camera.position.lerp(desiredPos, 0.065);
        if (camera.position.distanceTo(desiredPos) < 0.03) {
          cameraTargetDirRef.current = null;
          cameraTargetDistRef.current = null;
        }
      }

      if (!prefersReduced) {
        starsPoints.rotation.y += dt * 0.008;

        if (zonesGroup.visible) {
          swirlingVortexNodes.forEach((node) => {
            node.group.rotation.z += dt * node.speed;
          });
        }

        if (currentsGroup.visible) {
          currentParticles.forEach((cp) => {
            cp.t = (cp.t + dt * cp.speed) % 1;
            const idxFloat = cp.t * (cp.curve.length - 1);
            const idx0 = Math.floor(idxFloat);
            const idx1 = Math.min(cp.curve.length - 1, idx0 + 1);
            const alpha = idxFloat - idx0;
            cp.mesh.position.lerpVectors(cp.curve[idx0], cp.curve[idx1], alpha);
          });
        }
      }

      if (
        journeyOriginRef.current &&
        journeyCurveRef.current.length > 1 &&
        journeyParticleRef.current
      ) {
        if (!prefersReduced && journeyPlayingRef.current) {
          journeyT = (journeyT + dt * 0.16) % 1;
        }
        const pts = journeyCurveRef.current;
        const idxFloat = journeyT * (pts.length - 1);
        const idx0 = Math.floor(idxFloat);
        const idx1 = Math.min(pts.length - 1, idx0 + 1);
        journeyParticleRef.current.position.lerpVectors(pts[idx0], pts[idx1], idxFloat - idx0);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      if (resizeRafId) cancelAnimationFrame(resizeRafId);
      ro.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      controls.dispose();

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });

      baseTexRef.current?.dispose();
      baseTexRef.current = null;
      earthMatRef.current = null;
      starsMatRef.current = null;
      atmoInnerMatRef.current = null;
      atmoOuterMatRef.current = null;
      themedLineMatsRef.current = [];
      heatTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Seamlessly swap 3D Globe Earth texture, atmospheric rim, & currents when Light/Dark theme toggles
  useEffect(() => {
    const earthMat = earthMatRef.current;
    if (!earthMat) return;
    const isLight = theme === 'light';

    const nextTex = createBaseOceanTexture(theme);
    const prevTex = baseTexRef.current;
    earthMat.map = nextTex;
    earthMat.specular.setHex(isLight ? 0x38bdf8 : 0x2dd4bf);
    earthMat.needsUpdate = true;
    baseTexRef.current = nextTex;
    if (prevTex && prevTex !== nextTex) {
      prevTex.dispose();
    }

    if (starsMatRef.current) {
      starsMatRef.current.color.setHex(isLight ? 0x0284c7 : 0x99f6e4);
      starsMatRef.current.opacity = isLight ? 0.16 : 0.48;
    }
    if (atmoInnerMatRef.current) {
      atmoInnerMatRef.current.color.setHex(isLight ? 0x0ea5e9 : 0x38bdf8);
      atmoInnerMatRef.current.opacity = isLight ? 0.09 : 0.11;
    }
    if (atmoOuterMatRef.current) {
      atmoOuterMatRef.current.color.setHex(isLight ? 0x38bdf8 : 0x2dd4bf);
      atmoOuterMatRef.current.opacity = isLight ? 0.05 : 0.06;
    }
    themedLineMatsRef.current.forEach(({ mat, lightHex, darkHex }) => {
      mat.color.setHex(isLight ? lightHex : darkHex);
    });
  }, [theme]);

  useEffect(() => {
    if (heatmapMeshRef.current) heatmapMeshRef.current.visible = activeLayers.heatmap;
    if (zonesGroupRef.current) zonesGroupRef.current.visible = activeLayers.zones;
    if (currentsGroupRef.current) currentsGroupRef.current.visible = activeLayers.currents;
    if (stationsGroupRef.current) stationsGroupRef.current.visible = activeLayers.stations;
    if (mpaGroupRef.current) mpaGroupRef.current.visible = activeLayers.mpa;
  }, [activeLayers]);

  useEffect(() => {
    markerMeshesRef.current.forEach((m) => {
      const sel = m.userData.selection as GlobeSelection | undefined;
      const baseColor = m.userData.baseColor as number;
      const isMatch =
        sel && selectedItem && sel.kind === selectedItem.kind && sel.id === selectedItem.id;
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.color.setHex(isMatch ? 0xffffff : baseColor);
      m.scale.setScalar(isMatch ? 1.6 : 1.0);
    });
  }, [selectedItem, liveCurrents]);

  useEffect(() => {
    const dir = latLngToVector3(selectedRegion.centerLat, selectedRegion.centerLng, 1).normalize();
    cameraTargetDirRef.current = dir;
    cameraTargetDistRef.current = selectedRegion.id === 'all' ? 2.85 : 2.25;
  }, [selectedRegion]);

  useEffect(() => {
    const group = journeyGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    }
    journeyCurveRef.current = [];
    journeyParticleRef.current = null;

    if (!journeyOrigin) return;

    const pts = buildSphericalArcPoints(journeyOrigin.waypoints, GLOBE_RADIUS * 1.024, 24);
    journeyCurveRef.current = pts;

    if (pts.length > 1) {
      // Glowing Coral-Amber Trajectory Arc
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({ color: 0xf4727e });
      group.add(new THREE.Line(lineGeo, lineMat));

      const glowPts = buildSphericalArcPoints(journeyOrigin.waypoints, GLOBE_RADIUS * 1.029, 24);
      const glowGeo = new THREE.BufferGeometry().setFromPoints(glowPts);
      const glowMat = new THREE.LineBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.55,
      });
      group.add(new THREE.Line(glowGeo, glowMat));

      // Glowing origin beacon
      const startMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.026, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
      );
      startMesh.position.copy(pts[0]);
      group.add(startMesh);

      // Moving simulated drift packet (bright pearl + coral core)
      const packetMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      packetMesh.position.copy(pts[0]);
      group.add(packetMesh);
      journeyParticleRef.current = packetMesh;

      const midPt = pts[Math.floor(pts.length * 0.45)].clone().normalize();
      cameraTargetDirRef.current = midPt;
      cameraTargetDistRef.current = 2.25;
    }
  }, [journeyOrigin]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[480px] sm:min-h-[540px] select-none overflow-hidden"
      aria-label="Interactive 3D Ocean Plastic Globe"
    />
  );
};
