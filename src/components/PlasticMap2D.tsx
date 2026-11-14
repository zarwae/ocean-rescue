import React, { useEffect, useMemo, useRef, useState } from 'react';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import countriesAtlas from 'world-atlas/countries-50m.json';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import {
  ACCUMULATION_ZONES,
  MARINE_PROTECTED_AREAS,
  OBSERVATION_STATIONS,
  OCEAN_CURRENT_CIRCUITS,
  PLASTIC_HEATMAP_POINTS,
  LiveStationCurrent,
  OceanRegion,
  OceanRegionId,
  PlasticJourneyOrigin,
  TrackerLayerId,
} from '../data/plasticTrackerData';
import { latLngToSvgXY } from '../utils/plasticTrackerHelpers';
import { GlobeSelection } from './PlasticGlobe3D';
import { ThemeMode } from '../hooks/useTheme';

interface PlasticMap2DProps {
  activeLayers: Record<TrackerLayerId, boolean>;
  selectedRegion: OceanRegion;
  selectedItem: GlobeSelection | null;
  liveCurrents: Record<string, LiveStationCurrent>;
  journeyOrigin: PlasticJourneyOrigin | null;
  journeyPlaying: boolean;
  onSelect: (selection: GlobeSelection) => void;
  theme?: ThemeMode;
}

const MAP_W = 1200;
const MAP_H = 600;

const REGION_CAMERA_PRESETS: Record<OceanRegionId, { zoom: number; lat: number; lng: number }> = {
  all: { zoom: 1.12, lat: 5, lng: 0 },
  pacific: { zoom: 1.75, lat: 18, lng: -150 },
  atlantic: { zoom: 2.15, lat: 16, lng: -36 },
  indian: { zoom: 2.25, lat: -10, lng: 84 },
  southern: { zoom: 1.85, lat: -56, lng: 18 },
  arctic: { zoom: 2.35, lat: 72, lng: 10 },
};

const BASIN_WATERMARKS: { label: string; lat: number; lng: number }[] = [
  { label: 'NORTH PACIFIC OCEAN', lat: 24, lng: -155 },
  { label: 'SOUTH PACIFIC OCEAN', lat: -24, lng: -130 },
  { label: 'NORTH ATLANTIC', lat: 28, lng: -44 },
  { label: 'SOUTH ATLANTIC', lat: -25, lng: -18 },
  { label: 'INDIAN OCEAN', lat: -18, lng: 76 },
  { label: 'SOUTHERN OCEAN', lat: -60, lng: 35 },
  { label: 'ARCTIC OCEAN', lat: 76, lng: 0 },
];

const BATHYMETRIC_LAGOONS: { lat: number; lng: number; rx: number; ry: number; fill: string; opacity: number }[] = [
  { lat: -2, lng: 122, rx: 95, ry: 48, fill: '#2DD4BF', opacity: 0.22 }, // Coral Triangle
  { lat: 18, lng: -76, rx: 68, ry: 34, fill: '#2DD4BF', opacity: 0.19 }, // Caribbean Lagoon
  { lat: -18, lng: 149, rx: 58, ry: 30, fill: '#5EEAD4', opacity: 0.2 }, // Coral Sea / GBR
  { lat: 10, lng: 68, rx: 72, ry: 46, fill: '#1E6478', opacity: 0.26 }, // Arabian Basin
  { lat: 16, lng: 145, rx: 24, ry: 72, fill: '#041118', opacity: 0.44 }, // Mariana Trench
  { lat: 24, lng: -44, rx: 30, ry: 105, fill: '#1E6478', opacity: 0.22 }, // Mid-Atlantic Ridge
  { lat: -10, lng: 105, rx: 52, ry: 20, fill: '#041118', opacity: 0.36 }, // Java Trench
];

function ringToPathD(ring: number[][]): string {
  return (
    ring
      .map(([lng, lat], i) => {
        const { x, y } = latLngToSvgXY(lat, lng, MAP_W, MAP_H);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ') + ' Z'
  );
}

function buildSplitPolylineSegments(
  waypoints: [number, number][]
): { points: string; coords: { x: number; y: number }[] }[] {
  if (waypoints.length < 2) return [];
  const segments: { x: number; y: number }[][] = [[]];

  waypoints.forEach(([lat, lng], idx) => {
    const pt = latLngToSvgXY(lat, lng, MAP_W, MAP_H);
    if (idx > 0) {
      const prevLng = waypoints[idx - 1][1];
      if (Math.abs(lng - prevLng) > 180) {
        segments.push([pt]);
        return;
      }
    }
    segments[segments.length - 1].push(pt);
  });

  return segments
    .filter((seg) => seg.length >= 2)
    .map((seg) => ({
      coords: seg,
      points: seg.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
    }));
}

function clampPanForZoom(rawX: number, rawY: number, z: number): { x: number; y: number } {
  const maxPanX = ((z - 1) * MAP_W) / 2;
  const maxPanY = ((z - 1) * MAP_H) / 2;
  return {
    x: Math.max(-maxPanX, Math.min(maxPanX, rawX)),
    y: Math.max(-maxPanY, Math.min(maxPanY, rawY)),
  };
}

function panFromLatLng(lat: number, lng: number, z: number): { x: number; y: number } {
  const { x, y } = latLngToSvgXY(lat, lng, MAP_W, MAP_H);
  const rawX = (MAP_W / 2 - x) * z;
  const rawY = (MAP_H / 2 - y) * z;
  return clampPanForZoom(rawX, rawY, z);
}

export const PlasticMap2D: React.FC<PlasticMap2DProps> = ({
  activeLayers,
  selectedRegion,
  selectedItem,
  liveCurrents,
  journeyOrigin,
  journeyPlaying,
  onSelect,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const initialPreset = REGION_CAMERA_PRESETS[selectedRegion.id] || REGION_CAMERA_PRESETS.all;
  const [zoom, setZoom] = useState(initialPreset.zoom);
  const [pan, setPan] = useState(() =>
    panFromLatLng(initialPreset.lat, initialPreset.lng, initialPreset.zoom)
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });
  const [hoverInfo, setHoverInfo] = useState<{ title: string; detail: string } | null>(null);
  const [driftProgress, setDriftProgress] = useState(0);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const preset = REGION_CAMERA_PRESETS[selectedRegion.id] || REGION_CAMERA_PRESETS.all;
    setZoom(preset.zoom);
    setPan(panFromLatLng(preset.lat, preset.lng, preset.zoom));
  }, [selectedRegion]);

  useEffect(() => {
    if (!journeyOrigin) return;
    const midIdx = Math.floor(journeyOrigin.waypoints.length / 2);
    const [midLat, midLng] = journeyOrigin.waypoints[midIdx] || [
      journeyOrigin.startLat,
      journeyOrigin.startLng,
    ];
    const z = 1.95;
    setZoom(z);
    setPan(panFromLatLng(midLat, midLng, z));
    setDriftProgress(0);
  }, [journeyOrigin]);

  useEffect(() => {
    if (!journeyOrigin || !journeyPlaying) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      setDriftProgress((prev) => (prev + dt * 0.14) % 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [journeyOrigin, journeyPlaying]);

  const { landPaths, countryPaths } = useMemo(() => {
    const topology = countriesAtlas as unknown as Topology<{
      land: GeometryCollection;
      countries: GeometryCollection;
    }>;
    const landGeo = feature(topology, topology.objects.land);
    const countriesGeo = feature(topology, topology.objects.countries);

    const extractPaths = (geo: ReturnType<typeof feature>) => {
      const out: string[] = [];
      const pushPoly = (rings: number[][][]) => {
        rings.forEach((r) => out.push(ringToPathD(r)));
      };
      if (geo.type === 'FeatureCollection') {
        geo.features.forEach((f) => {
          if (!f.geometry) return;
          if (f.geometry.type === 'Polygon') pushPoly(f.geometry.coordinates);
          else if (f.geometry.type === 'MultiPolygon')
            f.geometry.coordinates.forEach((p: number[][][]) => pushPoly(p));
        });
      }
      return out;
    };

    return {
      landPaths: extractPaths(landGeo),
      countryPaths: extractPaths(countriesGeo),
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    const rect = svgRef.current?.getBoundingClientRect();
    const scaleX = rect ? MAP_W / rect.width : 1;
    const scaleY = rect ? MAP_H / rect.height : 1;
    const rawX = (e.clientX - dragOrigin.x) * scaleX;
    const rawY = (e.clientY - dragOrigin.y) * scaleY;
    setPan(clampPanForZoom(rawX, rawY, zoom));
  };

  const handlePointerUp = () => setIsDragging(false);

  const adjustZoom = (delta: number) => {
    setZoom((prev) => {
      const next = Math.max(1.0, Math.min(4.2, Number((prev + delta).toFixed(2))));
      setPan((curPan) => {
        const ratio = next / prev;
        return clampPanForZoom(curPan.x * ratio, curPan.y * ratio, next);
      });
      return next;
    });
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.3 : -0.3;
    adjustZoom(delta);
  };

  const resetView = () => {
    const preset = REGION_CAMERA_PRESETS[selectedRegion.id] || REGION_CAMERA_PRESETS.all;
    setZoom(preset.zoom);
    setPan(panFromLatLng(preset.lat, preset.lng, preset.zoom));
  };

  const driftPacketPos = useMemo(() => {
    if (!journeyOrigin || journeyOrigin.waypoints.length < 2) return null;
    const pts = journeyOrigin.waypoints.map(([lat, lng]) => latLngToSvgXY(lat, lng, MAP_W, MAP_H));
    const idxFloat = driftProgress * (pts.length - 1);
    const i0 = Math.floor(idxFloat);
    const i1 = Math.min(pts.length - 1, i0 + 1);
    const alpha = idxFloat - i0;
    if (Math.abs(pts[i1].x - pts[i0].x) > MAP_W * 0.45) {
      return pts[i1];
    }
    return {
      x: pts[i0].x + (pts[i1].x - pts[i0].x) * alpha,
      y: pts[i0].y + (pts[i1].y - pts[i0].y) * alpha,
    };
  }, [journeyOrigin, driftProgress]);

  const invScale = 1 / Math.pow(zoom, 0.55);

  return (
    <div
      className={`relative w-full h-full min-h-[480px] sm:min-h-[540px] flex items-center justify-center overflow-hidden select-none transition-colors duration-500 ${
        isLight ? 'bg-[#CBE6EE]' : 'bg-[#061822]'
      }`}
    >
      {/* Liquid Glass Zoom Controls positioned clear of top & bottom HUD bars */}
      <div className="liquid-glass-hud absolute right-3.5 bottom-14 z-20 flex flex-col gap-1 rounded-2xl p-1">
        <button
          onClick={() => adjustZoom(0.45)}
          className={`p-1.5 cursor-pointer rounded-xl transition-colors ${
            isLight ? 'text-[#0369A1] hover:text-[#0B2530]' : 'text-[#BAE6FD] hover:text-white'
          }`}
          aria-label="Perbesar Peta"
          title="Perbesar (Zoom In)"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <div
          className={`text-[10px] text-center font-semibold tabular-nums py-0.5 border-y ${
            isLight ? 'text-[#0F766E] border-[#0B1E27]/12' : 'text-[#5EEAD4] border-white/10'
          }`}
        >
          {zoom.toFixed(1)}×
        </div>
        <button
          onClick={() => adjustZoom(-0.45)}
          className={`p-1.5 cursor-pointer rounded-xl transition-colors ${
            isLight ? 'text-[#0369A1] hover:text-[#0B2530]' : 'text-[#BAE6FD] hover:text-white'
          }`}
          aria-label="Perkecil Peta"
          title="Perkecil (Zoom Out)"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={resetView}
          className={`p-1.5 cursor-pointer border-t rounded-b-xl transition-colors ${
            isLight
              ? 'text-[#0369A1] hover:text-[#0B2530] border-[#0B1E27]/12'
              : 'text-[#BAE6FD] hover:text-white border-white/10'
          }`}
          aria-label="Reset Posisi Peta"
          title="Reset Fokus Wilayah"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Liquid Glass Hover Quick Telemetry Chip */}
      {hoverInfo && (
        <div className="liquid-glass-hud absolute top-14 left-3.5 z-20 pointer-events-none px-3.5 py-2 rounded-2xl max-w-xs">
          <div className={`text-xs font-semibold truncate ${isLight ? 'text-[#0B2530]' : 'text-white'}`}>
            {hoverInfo.title}
          </div>
          <div className={`text-[10px] ${isLight ? 'text-[#0F766E]' : 'text-[#5EEAD4]'}`}>
            {hoverInfo.detail}
          </div>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        preserveAspectRatio="xMidYMid meet"
        className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('[data-interactive-marker="true"]')) return;
          const rect = svgRef.current?.getBoundingClientRect();
          const scaleX = rect ? MAP_W / rect.width : 1;
          const scaleY = rect ? MAP_H / rect.height : 1;
          setIsDragging(true);
          setDragOrigin({ x: e.clientX - pan.x / scaleX, y: e.clientY - pan.y / scaleY });
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        role="img"
        aria-label="Peta Proyeksi 2D Sampah Plastik dan Arus Samudra Dunia"
      >
        <defs>
          {/* Simulator-aligned Multi-Depth Oceanic Gradient */}
          <linearGradient id="bathymetryBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isLight ? '#7CB7C7' : '#071B26'} />
            <stop offset="18%" stopColor={isLight ? '#90CAD8' : '#0C2F3F'} />
            <stop offset="38%" stopColor={isLight ? '#A8DCE2' : '#134A5E'} />
            <stop offset="50%" stopColor={isLight ? '#C0EAEC' : '#1B6075'} />
            <stop offset="62%" stopColor={isLight ? '#A8DCE2' : '#134A5E'} />
            <stop offset="82%" stopColor={isLight ? '#90CAD8' : '#0C2F3F'} />
            <stop offset="100%" stopColor={isLight ? '#7CB7C7' : '#071B26'} />
          </linearGradient>

          {/* Natural Landmass Terrain Gradient */}
          <linearGradient id="landTerrain" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isLight ? '#D4E2DC' : '#2C5052'} />
            <stop offset="28%" stopColor={isLight ? '#95BA9B' : '#1E4F46'} />
            <stop offset="50%" stopColor={isLight ? '#A6C792' : '#275B48'} />
            <stop offset="74%" stopColor={isLight ? '#94B89B' : '#1F4B45'} />
            <stop offset="100%" stopColor={isLight ? '#DCE6E2' : '#355459'} />
          </linearGradient>

          {/* Sunlit Caustic Glow */}
          <radialGradient id="equatorialSunGlow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={isLight ? '#FFFFFF' : '#2DD4BF'} stopOpacity={isLight ? '0.32' : '0.16'} />
            <stop offset="60%" stopColor={isLight ? '#5EEAD4' : '#0E3546'} stopOpacity={isLight ? '0.12' : '0.06'} />
            <stop offset="100%" stopColor={isLight ? '#A8DCE2' : '#061822'} stopOpacity="0" />
          </radialGradient>

          {/* Vivid Multi-Tone Plastic Heatmap Plumes */}
          <radialGradient id="heatHigh" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isLight ? '#E11D48' : '#F4727E'} stopOpacity={isLight ? '0.72' : '0.78'} />
            <stop offset="40%" stopColor="#F59E0B" stopOpacity={isLight ? '0.45' : '0.46'} />
            <stop offset="76%" stopColor="#14B8A6" stopOpacity={isLight ? '0.2' : '0.20'} />
            <stop offset="100%" stopColor="#17485A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heatMed" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity={isLight ? '0.58' : '0.60'} />
            <stop offset="52%" stopColor="#14B8A6" stopOpacity={isLight ? '0.26' : '0.28'} />
            <stop offset="100%" stopColor="#17485A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heatLow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#14B8A6" stopOpacity={isLight ? '0.42' : '0.42'} />
            <stop offset="65%" stopColor="#0EA5E9" stopOpacity={isLight ? '0.18' : '0.16'} />
            <stop offset="100%" stopColor="#17485A" stopOpacity="0" />
          </radialGradient>

          <marker
            id="arrowWarm"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="5.5"
            markerHeight="5.5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill={isLight ? '#D97706' : '#FBBF24'} fillOpacity="0.95" />
          </marker>
          <marker
            id="arrowCold"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="5.5"
            markerHeight="5.5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill={isLight ? '#0284C7' : '#38BDF8'} fillOpacity="0.95" />
          </marker>
        </defs>

        <g
          transform={`translate(${MAP_W / 2 + pan.x}, ${MAP_H / 2 + pan.y}) scale(${zoom}) translate(${
            -MAP_W / 2
          }, ${-MAP_H / 2})`}
          style={{
            transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* Rich Oceanic Depth Column Canvas */}
          <rect x={0} y={0} width={MAP_W} height={MAP_H} fill="url(#bathymetryBg)" />
          <ellipse cx={MAP_W * 0.52} cy={MAP_H * 0.5} rx={MAP_W * 0.46} ry={MAP_H * 0.34} fill="url(#equatorialSunGlow)" />

          {/* Bathymetric Lagoon Basins & Abyssal Trenches */}
          <g pointerEvents="none">
            {BATHYMETRIC_LAGOONS.map((b, i) => {
              const { x, y } = latLngToSvgXY(b.lat, b.lng, MAP_W, MAP_H);
              const lightColor = b.fill === '#041118' ? '#4C899E' : '#5EEAD4';
              return (
                <ellipse
                  key={`bathy-${i}`}
                  cx={x}
                  cy={y}
                  rx={b.rx}
                  ry={b.ry}
                  fill={isLight ? lightColor : b.fill}
                  fillOpacity={isLight ? b.opacity * 0.78 : b.opacity}
                />
              );
            })}
          </g>

          {/* Subtle Ocean Current Caustic Wave Ribbons */}
          <g
            fill="none"
            stroke={isLight ? '#FFFFFF' : '#5EEAD4'}
            strokeOpacity={isLight ? 0.25 : 0.07}
            strokeWidth={0.9 * invScale}
          >
            {[0.22, 0.34, 0.46, 0.58, 0.72].map((ratio, idx) => (
              <path
                key={`caustic-${idx}`}
                d={`M 0 ${MAP_H * ratio} Q ${MAP_W * 0.25} ${MAP_H * (ratio - 0.02)}, ${MAP_W * 0.5} ${
                  MAP_H * ratio
                } T ${MAP_W} ${MAP_H * ratio}`}
              />
            ))}
          </g>

          {/* Graticules + Degree Labels */}
          {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lng) => {
            const { x } = latLngToSvgXY(0, lng, MAP_W, MAP_H);
            const major = lng % 60 === 0;
            return (
              <g key={`lng-${lng}`}>
                <line
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={MAP_H}
                  stroke={
                    isLight
                      ? major
                        ? 'rgba(15, 70, 82, 0.16)'
                        : 'rgba(15, 70, 82, 0.07)'
                      : major
                      ? 'rgba(103, 232, 249, 0.16)'
                      : 'rgba(103, 232, 249, 0.06)'
                  }
                  strokeWidth={major ? 0.8 * invScale : 0.45 * invScale}
                />
                {major && lng !== 0 && (
                  <text
                    x={x + 4 * invScale}
                    y={MAP_H - 12}
                    fill={isLight ? 'rgba(15, 70, 82, 0.55)' : 'rgba(165, 243, 252, 0.45)'}
                    fontSize={8 * invScale}
                    fontFamily="'DM Sans', sans-serif"
                  >
                    {Math.abs(lng)}°{lng > 0 ? 'E' : 'W'}
                  </text>
                )}
              </g>
            );
          })}
          {[-60, -30, 0, 30, 60].map((lat) => {
            const { y } = latLngToSvgXY(lat, 0, MAP_W, MAP_H);
            return (
              <g key={`lat-${lat}`}>
                <line
                  x1={0}
                  y1={y}
                  x2={MAP_W}
                  y2={y}
                  stroke={
                    isLight
                      ? lat === 0
                        ? 'rgba(180, 83, 9, 0.34)'
                        : 'rgba(15, 70, 82, 0.14)'
                      : lat === 0
                      ? 'rgba(251, 191, 36, 0.26)'
                      : 'rgba(103, 232, 249, 0.11)'
                  }
                  strokeWidth={(lat === 0 ? 1.0 : 0.7) * invScale}
                  strokeDasharray={lat === 0 ? undefined : '4 4'}
                />
                <text
                  x={10}
                  y={y - 4 * invScale}
                  fill={
                    isLight
                      ? lat === 0
                        ? 'rgba(180, 83, 9, 0.72)'
                        : 'rgba(15, 70, 82, 0.55)'
                      : lat === 0
                      ? 'rgba(253, 224, 71, 0.65)'
                      : 'rgba(165, 243, 252, 0.45)'
                  }
                  fontSize={8 * invScale}
                  fontFamily="'DM Sans', sans-serif"
                >
                  {lat === 0 ? '0° EQUATOR' : `${Math.abs(lat)}°${lat > 0 ? 'N' : 'S'}`}
                </text>
              </g>
            );
          })}

          {/* Ocean Basin Cartographic Watermarks */}
          <g pointerEvents="none">
            {BASIN_WATERMARKS.map((bw) => {
              const { x, y } = latLngToSvgXY(bw.lat, bw.lng, MAP_W, MAP_H);
              return (
                <text
                  key={bw.label}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fill={isLight ? 'rgba(15, 70, 82, 0.34)' : 'rgba(153, 246, 228, 0.24)'}
                  fontSize={9.5 * invScale}
                  letterSpacing={2.2 * invScale}
                  fontFamily="'DM Sans', sans-serif"
                >
                  {bw.label}
                </text>
              );
            })}
          </g>

          {/* Dual-Layer Turquoise Shallow Continental Shelf & Lagoon Rim */}
          <g
            fill="none"
            stroke={isLight ? '#5EEAD4' : '#2DD4BF'}
            strokeOpacity={isLight ? 0.35 : 0.16}
            strokeWidth={8.5 * invScale}
            strokeLinejoin="round"
          >
            {landPaths.map((d, i) => (
              <path key={`shelf-outer-${i}`} d={d} />
            ))}
          </g>
          <g
            fill="none"
            stroke={isLight ? '#99F6E4' : '#5EEAD4'}
            strokeOpacity={isLight ? 0.55 : 0.28}
            strokeWidth={3.6 * invScale}
            strokeLinejoin="round"
          >
            {landPaths.map((d, i) => (
              <path key={`shelf-inner-${i}`} d={d} />
            ))}
          </g>

          {/* World Landmasses + National Borders (1:50m Natural Emerald-Sage Terrain) */}
          <g
            fill="url(#landTerrain)"
            stroke={isLight ? 'rgba(15, 70, 82, 0.22)' : 'rgba(167, 243, 208, 0.16)'}
            strokeWidth={0.45 * invScale}
          >
            {countryPaths.map((d, i) => (
              <path key={`country-${i}`} d={d} />
            ))}
          </g>
          <g
            fill="none"
            stroke={isLight ? 'rgba(14, 116, 144, 0.62)' : 'rgba(103, 232, 249, 0.65)'}
            strokeWidth={0.95 * invScale}
            strokeLinejoin="round"
          >
            {landPaths.map((d, i) => (
              <path key={`coast-${i}`} d={d} />
            ))}
          </g>

          {/* Layer 1: Historical Plastic Concentration Heatmap */}
          {activeLayers.heatmap &&
            PLASTIC_HEATMAP_POINTS.map((pt) => {
              const { x, y } = latLngToSvgXY(pt.lat, pt.lng, MAP_W, MAP_H);
              const r = 25 + pt.intensity * 38;
              const gradId =
                pt.intensity >= 0.8
                  ? 'url(#heatHigh)'
                  : pt.intensity >= 0.55
                  ? 'url(#heatMed)'
                  : 'url(#heatLow)';
              return (
                <circle
                  key={pt.id}
                  cx={x}
                  cy={y}
                  r={r}
                  fill={gradId}
                  data-interactive-marker="true"
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setHoverInfo({
                      title: pt.label,
                      detail: `~${pt.estimatedItemsPerKm2.toLocaleString('id-ID')} item/km² (Historis)`,
                    })
                  }
                  onMouseLeave={() => setHoverInfo(null)}
                  onClick={() => onSelect({ kind: 'heatmap', id: pt.id })}
                />
              );
            })}

          {/* Layer 3: Glowing Dual-Tone Ocean Current Circuits with Directional Arrows */}
          {activeLayers.currents &&
            OCEAN_CURRENT_CIRCUITS.map((circuit) =>
              buildSplitPolylineSegments(circuit.waypoints).map((seg, idx, arr) => {
                const isWarm = circuit.type === 'warm';
                const glowStroke = isLight
                  ? isWarm
                    ? '#F97316'
                    : '#0284C7'
                  : isWarm
                  ? '#FB7185'
                  : '#38BDF8';
                const coreStroke = isLight
                  ? isWarm
                    ? '#D97706'
                    : '#0369A1'
                  : isWarm
                  ? '#FBBF24'
                  : '#2DD4BF';
                return (
                  <g key={`${circuit.id}-${idx}`}>
                    <polyline
                      points={seg.points}
                      fill="none"
                      stroke={glowStroke}
                      strokeOpacity={isLight ? 0.2 : 0.22}
                      strokeWidth={4.2 * invScale}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points={seg.points}
                      fill="none"
                      stroke={coreStroke}
                      strokeOpacity={0.88}
                      strokeWidth={1.7 * invScale}
                      strokeDasharray={`${5.5 * invScale} ${4 * invScale}`}
                      markerEnd={
                        idx === arr.length - 1
                          ? isWarm
                            ? 'url(#arrowWarm)'
                            : 'url(#arrowCold)'
                          : undefined
                      }
                      className="animate-current-flow"
                    />
                  </g>
                );
              })
            )}

          {/* Layer 2: 5 Subtropical Accumulation Gyres (Swirling Multi-Ring Vortexes + Debris Specs) */}
          {activeLayers.zones &&
            ACCUMULATION_ZONES.map((zone) => {
              const { x, y } = latLngToSvgXY(zone.lat, zone.lng, MAP_W, MAP_H);
              const isSel = selectedItem?.kind === 'zone' && selectedItem.id === zone.id;
              const outerR = (isSel ? 29 : 23) * Math.max(0.75, invScale);
              const midR = (isSel ? 19 : 14.5) * Math.max(0.75, invScale);
              const labelColor = isSel
                ? isLight
                  ? '#0B2530'
                  : '#FFFFFF'
                : isLight
                ? '#BE123C'
                : '#FBBF24';
              return (
                <g
                  key={zone.id}
                  data-interactive-marker="true"
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setHoverInfo({
                      title: zone.indonesianName,
                      detail: `~${zone.surfaceConcentrationItemsPerKm2.toLocaleString('id-ID')} item/km² · ~${zone.estimatedSurfaceMassMetricTons.toLocaleString('id-ID')} ton`,
                    })
                  }
                  onMouseLeave={() => setHoverInfo(null)}
                  onClick={() => onSelect({ kind: 'zone', id: zone.id })}
                >
                  {/* Outer amber swirl ring */}
                  <circle
                    cx={x}
                    cy={y}
                    r={outerR}
                    fill={isLight ? '#E11D48' : '#F4727E'}
                    fillOpacity={0.14}
                    stroke={isLight ? '#D97706' : '#FBBF24'}
                    strokeOpacity={isSel ? 0.95 : 0.65}
                    strokeWidth={(isSel ? 1.5 : 1.0) * invScale}
                    strokeDasharray={`${4 * invScale} ${3 * invScale}`}
                  />
                  {/* Inner coral vortex ring */}
                  <circle
                    cx={x}
                    cy={y}
                    r={midR}
                    fill="none"
                    stroke={isLight ? '#E11D48' : '#F4727E'}
                    strokeOpacity={isSel ? 0.98 : 0.82}
                    strokeWidth={(isSel ? 1.8 : 1.2) * invScale}
                    strokeDasharray={`${6 * invScale} ${2.5 * invScale}`}
                  />
                  {/* Tiny orbiting debris flecks */}
                  <circle
                    cx={x + midR * 0.78}
                    cy={y - midR * 0.55}
                    r={1.6 * invScale}
                    fill={isLight ? '#0284C7' : '#67E8F9'}
                    opacity={0.9}
                  />
                  <circle
                    cx={x - midR * 0.72}
                    cy={y + midR * 0.62}
                    r={1.4 * invScale}
                    fill={isLight ? '#D97706' : '#FDE047'}
                    opacity={0.9}
                  />
                  {/* Core beacon */}
                  <circle
                    cx={x}
                    cy={y}
                    r={(isSel ? 6 : 4.5) * invScale}
                    fill={isSel ? '#FFFFFF' : isLight ? '#E11D48' : '#F4727E'}
                    stroke={isLight ? '#0F172A' : '#061822'}
                    strokeWidth={1.2 * invScale}
                  />
                  <text
                    x={x}
                    y={y - outerR - 4 * invScale}
                    textAnchor="middle"
                    fill={labelColor}
                    fontSize={8.5 * invScale}
                    fontFamily="'DM Sans', sans-serif"
                    fontWeight="700"
                  >
                    {zone.id.toUpperCase()}
                  </text>
                </g>
              );
            })}

          {/* Layer 5: Marine Protected Areas (Emerald-Mint Sanctuary Shields) */}
          {activeLayers.mpa &&
            MARINE_PROTECTED_AREAS.map((mpa) => {
              const { x, y } = latLngToSvgXY(mpa.lat, mpa.lng, MAP_W, MAP_H);
              const isSel = selectedItem?.kind === 'mpa' && selectedItem.id === mpa.id;
              const size = 12 * invScale;
              const emerald = isLight ? '#059669' : '#34D399';
              return (
                <g
                  key={mpa.id}
                  data-interactive-marker="true"
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setHoverInfo({
                      title: mpa.name,
                      detail: `MPA · ${mpa.protectedAreaKm2.toLocaleString('id-ID')} km²`,
                    })
                  }
                  onMouseLeave={() => setHoverInfo(null)}
                  onClick={() => onSelect({ kind: 'mpa', id: mpa.id })}
                >
                  <circle cx={x} cy={y} r={size * 0.85} fill={emerald} fillOpacity={0.18} />
                  <rect
                    x={x - size / 2}
                    y={y - size / 2}
                    width={size}
                    height={size}
                    rx={3 * invScale}
                    fill={isLight ? '#10B981' : '#2DD4BF'}
                    fillOpacity={0.28}
                    stroke={isSel ? (isLight ? '#0B2530' : '#FFFFFF') : emerald}
                    strokeWidth={(isSel ? 1.9 : 1.2) * invScale}
                  />
                  <circle cx={x} cy={y} r={2.4 * invScale} fill={emerald} />
                </g>
              );
            })}

          {/* Layer 4: Observation Stations (Sky-Cyan + Sun-Gold Buoy Beacons) */}
          {activeLayers.stations &&
            OBSERVATION_STATIONS.map((st) => {
              const { x, y } = latLngToSvgXY(st.lat, st.lng, MAP_W, MAP_H);
              const isSel = selectedItem?.kind === 'station' && selectedItem.id === st.id;
              const cur = liveCurrents[st.id];
              const ringColor = isLight ? '#0284C7' : '#38BDF8';
              return (
                <g
                  key={st.id}
                  data-interactive-marker="true"
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setHoverInfo({
                      title: st.name,
                      detail: cur
                        ? `Arus ${cur.velocityMs} m/s (${cur.compassBearing}) · ${cur.provenance === 'LIVE_OBSERVATION' ? 'Live' : 'Baseline'}`
                        : st.agency,
                    })
                  }
                  onMouseLeave={() => setHoverInfo(null)}
                  onClick={() => onSelect({ kind: 'station', id: st.id })}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={(isSel ? 9 : 6.5) * invScale}
                    fill={ringColor}
                    fillOpacity={0.22}
                    stroke={ringColor}
                    strokeOpacity={0.75}
                    strokeWidth={0.9 * invScale}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={(isSel ? 5.2 : 3.6) * invScale}
                    fill={isSel ? '#FFFFFF' : isLight ? '#F59E0B' : '#FEF08A'}
                    stroke={isLight ? '#0F172A' : '#061822'}
                    strokeWidth={1.1 * invScale}
                  />
                  {isSel && (
                    <text
                      x={x}
                      y={y + 14 * invScale}
                      textAnchor="middle"
                      fill={isLight ? '#0B2530' : '#FFFFFF'}
                      fontSize={8.5 * invScale}
                      fontFamily="'DM Sans', sans-serif"
                      fontWeight="600"
                    >
                      {st.name.split(' ').slice(0, 2).join(' ')}
                    </text>
                  )}
                </g>
              );
            })}

          {/* Simulation Mode: The Journey of Plastic */}
          {journeyOrigin &&
            buildSplitPolylineSegments(journeyOrigin.waypoints).map((seg, idx, arr) => (
              <g key={`journey-${journeyOrigin.id}-${idx}`}>
                <polyline
                  points={seg.points}
                  fill="none"
                  stroke="#FBBF24"
                  strokeOpacity={0.28}
                  strokeWidth={5.5 * invScale}
                  strokeLinecap="round"
                />
                <polyline
                  points={seg.points}
                  fill="none"
                  stroke="#F4727E"
                  strokeWidth={2.5 * invScale}
                  strokeDasharray={`${6 * invScale} ${4 * invScale}`}
                  markerEnd={idx === arr.length - 1 ? 'url(#arrowWarm)' : undefined}
                  className={journeyPlaying ? 'animate-current-flow' : ''}
                />
              </g>
            ))}

          {journeyOrigin &&
            (() => {
              const start = latLngToSvgXY(journeyOrigin.startLat, journeyOrigin.startLng, MAP_W, MAP_H);
              return (
                <g>
                  <circle
                    cx={start.x}
                    cy={start.y}
                    r={6.5 * invScale}
                    fill="#FBBF24"
                    stroke="#061822"
                    strokeWidth={1.5 * invScale}
                  />
                  {driftPacketPos && (
                    <>
                      <circle
                        cx={driftPacketPos.x}
                        cy={driftPacketPos.y}
                        r={10 * invScale}
                        fill="#F4727E"
                        fillOpacity={0.28}
                      />
                      <circle
                        cx={driftPacketPos.x}
                        cy={driftPacketPos.y}
                        r={4.5 * invScale}
                        fill="#FFFFFF"
                        stroke="#F4727E"
                        strokeWidth={1.6 * invScale}
                      />
                    </>
                  )}
                </g>
              );
            })()}
        </g>
      </svg>
    </div>
  );
};
