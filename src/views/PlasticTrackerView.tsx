import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Globe2,
  Map as MapIcon,
  Navigation,
  RefreshCw,
  Play,
  Pause,
} from 'lucide-react';
import {
  ACCUMULATION_ZONES,
  MARINE_PROTECTED_AREAS,
  OBSERVATION_STATIONS,
  OCEAN_REGIONS,
  PLASTIC_HEATMAP_POINTS,
  PLASTIC_JOURNEY_ORIGINS,
  buildBaselineStationCurrents,
  fetchLiveOceanCurrents,
  LiveStationCurrent,
  OceanRegionId,
  TrackerLayerId,
} from '../data/plasticTrackerData';
import { GlobeSelection, PlasticGlobe3D } from '../components/PlasticGlobe3D';
import { PlasticMap2D } from '../components/PlasticMap2D';
import { soundEffects } from '../utils/soundEffects';
import { ThemeMode } from '../hooks/useTheme';

interface PlasticTrackerViewProps {
  onAwardXp?: (xp: number, reason: string) => void;
  theme?: ThemeMode;
}

const LAYER_META: {
  id: TrackerLayerId;
  label: string;
  dotColor: string;
}[] = [
  { id: 'heatmap', label: 'Heatmap Historis', dotColor: 'bg-[#F4727E]' },
  { id: 'zones', label: '5 Zona Gyre', dotColor: 'bg-[#FBBF24]' },
  { id: 'currents', label: 'Arus Samudra', dotColor: 'bg-[#38BDF8]' },
  { id: 'stations', label: 'Stasiun Riset', dotColor: 'bg-[#FEF08A]' },
  { id: 'mpa', label: 'Kawasan Konservasi', dotColor: 'bg-[#34D399]' },
];

export const PlasticTrackerView: React.FC<PlasticTrackerViewProps> = ({
  onAwardXp,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const [trackerMode, setTrackerMode] = useState<'tracker' | 'journey'>('tracker');
  const [selectedRegionId, setSelectedRegionId] = useState<OceanRegionId>('all');

  const [activeLayers, setActiveLayers] = useState<Record<TrackerLayerId, boolean>>({
    heatmap: true,
    zones: true,
    currents: true,
    stations: true,
    mpa: true,
  });

  const [selectedItem, setSelectedItem] = useState<GlobeSelection | null>({
    kind: 'zone',
    id: 'gpgp',
  });

  const [liveCurrents, setLiveCurrents] = useState<Record<string, LiveStationCurrent>>(() =>
    buildBaselineStationCurrents()
  );
  const [isLiveCurrents, setIsLiveCurrents] = useState(false);
  const [currentsFetchedAt, setCurrentsFetchedAt] = useState<string>('Memuat...');
  const [isFetchingCurrents, setIsFetchingCurrents] = useState(false);

  const [selectedOriginId, setSelectedOriginId] = useState<string>(PLASTIC_JOURNEY_ORIGINS[0].id);
  const [journeyPlaying, setJourneyPlaying] = useState<boolean>(true);
  const [xpAwardedOnce, setXpAwardedOnce] = useState<boolean>(false);

  const loadLiveCurrents = async () => {
    setIsFetchingCurrents(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7500);
    const res = await fetchLiveOceanCurrents(controller.signal);
    clearTimeout(timer);
    setLiveCurrents(res.currents);
    setIsLiveCurrents(res.isLive);
    setCurrentsFetchedAt(res.fetchedAt);
    setIsFetchingCurrents(false);
  };

  useEffect(() => {
    loadLiveCurrents();
  }, []);

  const selectedRegion = useMemo(
    () => OCEAN_REGIONS.find((r) => r.id === selectedRegionId) || OCEAN_REGIONS[0],
    [selectedRegionId]
  );

  const activeJourneyOrigin = useMemo(
    () =>
      trackerMode === 'journey'
        ? PLASTIC_JOURNEY_ORIGINS.find((o) => o.id === selectedOriginId) || PLASTIC_JOURNEY_ORIGINS[0]
        : null,
    [trackerMode, selectedOriginId]
  );

  const toggleLayer = (id: TrackerLayerId) => {
    soundEffects.playBubblePop();
    setActiveLayers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectRegion = (regionId: OceanRegionId) => {
    soundEffects.playBubblePop();
    setSelectedRegionId(regionId);
    const matchingZone = ACCUMULATION_ZONES.find((z) => z.region === regionId);
    if (matchingZone) {
      setSelectedItem({ kind: 'zone', id: matchingZone.id });
    } else {
      const matchingStation = OBSERVATION_STATIONS.find((s) => s.region === regionId);
      if (matchingStation) {
        setSelectedItem({ kind: 'station', id: matchingStation.id });
      }
    }
  };

  const handleSelectMarker = (sel: GlobeSelection) => {
    soundEffects.playBubblePop();
    setSelectedItem(sel);
  };

  const handleWebGLFallback = useCallback(() => {
    setWebglUnavailable(true);
    setViewMode('2d');
  }, []);

  const handleSwitchToJourney = () => {
    soundEffects.playBubblePop();
    setTrackerMode('journey');
    if (onAwardXp && !xpAwardedOnce) {
      onAwardXp(20, 'Menjalankan Simulasi Perjalanan Plastik di Samudra');
      setXpAwardedOnce(true);
    }
  };

  const formatCoords = (lat: number, lng: number) => {
    const latStr = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'LU' : 'LS'}`;
    const lngStr = `${Math.abs(lng).toFixed(2)}° ${lng >= 0 ? 'BT' : 'BB'}`;
    return `${latStr}, ${lngStr}`;
  };

  const selectedZone =
    selectedItem?.kind === 'zone'
      ? ACCUMULATION_ZONES.find((z) => z.id === selectedItem.id) || null
      : null;
  const selectedStation =
    selectedItem?.kind === 'station'
      ? OBSERVATION_STATIONS.find((s) => s.id === selectedItem.id) || null
      : null;
  const selectedMpa =
    selectedItem?.kind === 'mpa'
      ? MARINE_PROTECTED_AREAS.find((m) => m.id === selectedItem.id) || null
      : null;
  const selectedHeat =
    selectedItem?.kind === 'heatmap'
      ? PLASTIC_HEATMAP_POINTS.find((h) => h.id === selectedItem.id) || null
      : null;

  const activeStationLive = selectedStation ? liveCurrents[selectedStation.id] : null;

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] pt-28 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-[1380px] mx-auto space-y-8">
        {/* Clean Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[var(--border-hairline)]">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-[var(--accent-teal)] font-semibold block">
              Observatorium Samudra Global · SDG 14.1
            </span>
            <h1 className="font-display text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight">
              Global Ocean Plastic Tracker
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Pantau sebaran historis mikroplastik permukaan, lima pusaran gyre, kawasan lindung, serta arus permukaan Open-Meteo Marine.
            </p>
          </div>

          {/* Minimal Segmented Controls (No Border Noise) */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="inline-flex p-1 rounded-full bg-[var(--bg-surface)]">
              <button
                onClick={() => setTrackerMode('tracker')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  trackerMode === 'tracker'
                    ? 'bg-[#367D7B] text-[#EDEBE3]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Peta &amp; Data
              </button>
              <button
                onClick={handleSwitchToJourney}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  trackerMode === 'journey'
                    ? 'bg-[#D98270] text-[#061116] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Journey of Plastic
              </button>
            </div>

            <div className="inline-flex p-1 rounded-full bg-[var(--bg-surface)]">
              <button
                onClick={() => {
                  if (!webglUnavailable) setViewMode('3d');
                }}
                disabled={webglUnavailable}
                className={`px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40 ${
                  viewMode === '3d' && !webglUnavailable
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>3D Globe</span>
              </button>
              <button
                onClick={() => setViewMode('2d')}
                className={`px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  viewMode === '2d' || webglUnavailable
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>2D Peta</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clean Underline Basin Filter Strip */}
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-none border-b border-[var(--border-hairline)]">
          {OCEAN_REGIONS.map((region) => {
            const active = selectedRegionId === region.id;
            return (
              <button
                key={region.id}
                onClick={() => handleSelectRegion(region.id)}
                className={`pb-3 text-xs sm:text-sm whitespace-nowrap cursor-pointer border-b-2 -mb-px transition-colors ${
                  active
                    ? 'border-[var(--accent-teal)] text-[var(--text-primary)] font-semibold'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {region.indonesianName}
              </button>
            );
          })}
        </div>

        {/* SPLIT OBSERVATORY CONSOLE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: 3D Globe / 2D Map Stage (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div
              className={`relative rounded-2xl overflow-hidden transition-colors duration-500 ${
                isLight
                  ? 'bg-gradient-to-b from-[#DCEFF5] via-[#CBE7EF] to-[#B6DBE6] text-[#0B2530] shadow-xl border border-[#0B1E27]/10'
                  : 'bg-gradient-to-b from-[#0D3A4D] via-[#082230] to-[#05151E] text-[#EDEBE3] shadow-2xl border border-white/10'
              }`}
            >
              {/* Subtle Simulator-style Sunlit Surface Glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-32 z-10"
                style={{
                  background: isLight
                    ? 'radial-gradient(ellipse at top, rgba(255,255,255,0.45), transparent 70%)'
                    : 'radial-gradient(ellipse at top, rgba(45,212,191,0.16), transparent 70%)',
                }}
              />

              {/* Floating Top Liquid Glass HUD */}
              <div className="pointer-events-none absolute top-3.5 inset-x-3.5 z-20 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="liquid-glass-hud pointer-events-auto px-3.5 py-1.5 rounded-full flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isLight
                        ? 'bg-[#0D9488] shadow-[0_0_6px_rgba(13,148,136,0.5)]'
                        : 'bg-[#2DD4BF] shadow-[0_0_8px_#2DD4BF]'
                    }`}
                  />
                  <span className={isLight ? 'text-[#284B57]' : 'text-[#BAE6FD]'}>
                    <strong className={isLight ? 'text-[#0B2530] font-semibold' : 'text-white font-medium'}>
                      {selectedRegion.name}
                    </strong>{' '}
                    ·{' '}
                    <span className={`tabular-nums ${isLight ? 'text-[#0F766E] font-medium' : 'text-[#5EEAD4]'}`}>
                      {selectedRegion.surfaceAreaMillionKm2} juta km²
                    </span>
                  </span>
                </div>

                <div className="liquid-glass-hud pointer-events-auto px-3 py-1 rounded-full flex items-center gap-2 tabular-nums">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isLiveCurrents
                        ? isLight
                          ? 'bg-[#059669]'
                          : 'bg-[#34D399]'
                        : isLight
                        ? 'bg-[#D97706]'
                        : 'bg-[#FBBF24]'
                    }`}
                  />
                  <span
                    className={
                      isLiveCurrents
                        ? isLight
                          ? 'text-[#047857] font-medium'
                          : 'text-[#A7F3D0]'
                        : isLight
                        ? 'text-[#B45309] font-medium'
                        : 'text-[#FDE68A]'
                    }
                  >
                    Arus: {isLiveCurrents ? 'Open-Meteo Live' : 'Baseline'} ({currentsFetchedAt})
                  </span>
                  <button
                    onClick={loadLiveCurrents}
                    disabled={isFetchingCurrents}
                    className={`p-1 cursor-pointer disabled:opacity-40 transition-colors ${
                      isLight ? 'text-[#0369A1] hover:text-[#0B2530]' : 'text-[#BAE6FD] hover:text-white'
                    }`}
                    title="Segarkan Data Arus Open-Meteo"
                    aria-label="Segarkan Data Arus"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingCurrents ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Full-bleed 3D / 2D Ocean Stage */}
              <div className="relative h-[500px] sm:h-[560px]">
                {viewMode === '3d' && !webglUnavailable ? (
                  <PlasticGlobe3D
                    activeLayers={activeLayers}
                    selectedRegion={selectedRegion}
                    selectedItem={selectedItem}
                    liveCurrents={liveCurrents}
                    journeyOrigin={activeJourneyOrigin}
                    journeyPlaying={journeyPlaying}
                    onSelect={handleSelectMarker}
                    onWebGLFallback={handleWebGLFallback}
                    theme={theme}
                  />
                ) : (
                  <PlasticMap2D
                    activeLayers={activeLayers}
                    selectedRegion={selectedRegion}
                    selectedItem={selectedItem}
                    liveCurrents={liveCurrents}
                    journeyOrigin={activeJourneyOrigin}
                    journeyPlaying={journeyPlaying}
                    onSelect={handleSelectMarker}
                    theme={theme}
                  />
                )}
              </div>

              {/* Floating Bottom Liquid Glass Hint Strip */}
              <div className="pointer-events-none absolute bottom-3 inset-x-3.5 z-20 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div
                  className={`liquid-glass-hud pointer-events-auto px-3.5 py-1.5 rounded-full ${
                    isLight ? 'text-[#284B57]' : 'text-[#BAE6FD]/90'
                  }`}
                >
                  {viewMode === '3d' && !webglUnavailable
                    ? 'Seret untuk memutar globe · Gulir untuk zoom · Klik penanda untuk inspeksi'
                    : 'Seret untuk menggeser peta · Gulir / +/- untuk zoom · Klik penanda untuk detail'}
                </div>
                <div
                  className={`liquid-glass-hud pointer-events-auto px-3 py-1.5 rounded-full font-medium tabular-nums ${
                    isLight ? 'text-[#0F766E]' : 'text-[#5EEAD4]'
                  }`}
                >
                  {OBSERVATION_STATIONS.length} Stasiun · {ACCUMULATION_ZONES.length} Gyre ·{' '}
                  {MARINE_PROTECTED_AREAS.length} MPA
                </div>
              </div>
            </div>

            {/* Unboxed Inline Layer Switch Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {LAYER_META.map((layer) => {
                  const isOn = activeLayers[layer.id];
                  return (
                    <button
                      key={layer.id}
                      onClick={() => toggleLayer(layer.id)}
                      className={`inline-flex items-center gap-2 text-xs transition-opacity cursor-pointer ${
                        isOn
                          ? 'text-[var(--text-primary)] font-medium opacity-100'
                          : 'text-[var(--text-muted)] line-through opacity-55 hover:opacity-85'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${layer.dotColor}`} />
                      <span>{layer.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                <span>Rendah</span>
                <div className="w-20 h-1.5 rounded-full bg-gradient-to-r from-[#2DD4BF] via-[#FBBF24] to-[#F4727E]" />
                <span>Tinggi</span>
              </div>
            </div>

            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Sumber data: Open-Meteo Marine API &amp; kompilasi survei historis NOAA, NASA Earthdata, Copernicus Marine, UNESCO-IOC, GOOS, Lebreton et al., serta Eriksen et al.
            </p>
          </div>

          {/* RIGHT: Unboxed Scientific Telemetry / Journey Readout (4 cols) */}
          <div className="lg:col-span-4 space-y-6 lg:pl-4">
            {trackerMode === 'journey' ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[var(--accent-coral)] font-semibold block">
                      Simulasi Arus Hanyut
                    </span>
                    <h2 className="font-display text-2xl text-[var(--text-primary)]">
                      The Journey of Plastic
                    </h2>
                  </div>

                  <button
                    onClick={() => setJourneyPlaying((p) => !p)}
                    className="px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] text-xs font-medium text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer"
                  >
                    {journeyPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-[var(--accent-coral)]" />
                        <span>Jeda</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
                        <span>Putar</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] pb-1">
                    Titik Asal Pesisir / Muara
                  </div>
                  <div className="divide-y divide-[var(--border-hairline)]">
                    {PLASTIC_JOURNEY_ORIGINS.map((origin) => {
                      const active = origin.id === selectedOriginId;
                      return (
                        <button
                          key={origin.id}
                          onClick={() => {
                            soundEffects.playBubblePop();
                            setSelectedOriginId(origin.id);
                          }}
                          className={`w-full text-left py-2.5 px-2 transition-colors cursor-pointer rounded-md ${
                            active
                              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          <div className="text-xs">{origin.name}</div>
                          <div className="text-[11px] text-[var(--accent-sand)] mt-0.5">
                            {origin.countryOrCoast} &rarr; {origin.targetZoneName}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {activeJourneyOrigin && (
                  <div className="space-y-3 pt-3 border-t border-[var(--border-hairline)] text-xs">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[var(--text-muted)]">Estimasi Waktu Hanyut</span>
                      <span className="font-semibold text-[var(--text-primary)] tabular-nums">
                        {activeJourneyOrigin.estimatedTransitMonths}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[var(--text-muted)]">Koordinat Asal</span>
                      <span className="text-[var(--accent-sand)] tabular-nums">
                        {formatCoords(activeJourneyOrigin.startLat, activeJourneyOrigin.startLng)}
                      </span>
                    </div>
                    <div className="pt-1">
                      <span className="text-[11px] text-[var(--accent-teal)] font-semibold block mb-0.5">
                        Koridor Arus Penggerak
                      </span>
                      <div className="text-[var(--text-primary)]">{activeJourneyOrigin.primaryCurrentPath}</div>
                    </div>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      {activeJourneyOrigin.ecologicalRiskSummary}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed italic">
                      {activeJourneyOrigin.methodologyNote}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Basin Overview */}
                <div className="pb-4 border-b border-[var(--border-hairline)] space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[var(--accent-sand)] font-semibold">
                    <span>Cekungan Fokus</span>
                    <span className="tabular-nums">{selectedRegion.surfaceAreaMillionKm2} juta km²</span>
                  </div>
                  <h2 className="font-display text-xl text-[var(--text-primary)]">
                    {selectedRegion.indonesianName}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {selectedRegion.summary}
                  </p>
                </div>

                {/* Selected Zone */}
                {selectedZone && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="uppercase tracking-wider text-[var(--accent-coral)] font-semibold">
                        Zona Akumulasi Gyre
                      </span>
                      <span className="text-[var(--text-muted)] tabular-nums">
                        {formatCoords(selectedZone.lat, selectedZone.lng)}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl text-[var(--text-primary)] leading-snug">
                      {selectedZone.indonesianName}
                    </h3>

                    <dl className="divide-y divide-[var(--border-hairline)] text-xs border-y border-[var(--border-hairline)]">
                      <div className="py-2.5 flex items-center justify-between">
                        <dt className="text-[var(--text-secondary)]">Konsentrasi Permukaan</dt>
                        <dd className="font-semibold text-[var(--accent-coral)] tabular-nums">
                          ~{selectedZone.surfaceConcentrationItemsPerKm2.toLocaleString('id-ID')} item/km²
                        </dd>
                      </div>
                      <div className="py-2.5 flex items-center justify-between">
                        <dt className="text-[var(--text-secondary)]">Estimasi Massa</dt>
                        <dd className="font-semibold text-[var(--text-primary)] tabular-nums">
                          ~{selectedZone.estimatedSurfaceMassMetricTons.toLocaleString('id-ID')} ton
                        </dd>
                      </div>
                      <div className="py-2.5 flex items-center justify-between">
                        <dt className="text-[var(--text-secondary)]">Luas Sebaran</dt>
                        <dd className="font-semibold text-[var(--accent-sand)] tabular-nums">
                          ~{selectedZone.approxFootprintKm2.toLocaleString('id-ID')} km²
                        </dd>
                      </div>
                    </dl>

                    <div className="text-xs space-y-2">
                      <div>
                        <span className="text-[11px] font-semibold text-[var(--accent-teal)] block">
                          Polimer Dominan
                        </span>
                        <span className="text-[var(--text-primary)]">{selectedZone.dominantPolymerMix}</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        {selectedZone.scientificNote}
                      </p>
                      <div className="text-[11px] text-[var(--text-muted)] pt-2">
                        Survei: {selectedZone.surveyPeriod} · {selectedZone.attribution}
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Station */}
                {selectedStation && activeStationLive && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="uppercase tracking-wider text-[var(--accent-teal)] font-semibold">
                        {activeStationLive.provenance === 'LIVE_OBSERVATION'
                          ? 'Stasiun · Open-Meteo Live'
                          : 'Stasiun · Baseline Klimatologi'}
                      </span>
                      <span className="text-[var(--text-muted)] tabular-nums">
                        {formatCoords(selectedStation.lat, selectedStation.lng)}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl text-[var(--text-primary)] leading-snug">
                      {selectedStation.name}
                    </h3>

                    <dl className="divide-y divide-[var(--border-hairline)] text-xs border-y border-[var(--border-hairline)]">
                      <div className="py-2.5 flex items-center justify-between">
                        <dt className="text-[var(--text-secondary)]">Kecepatan Arus</dt>
                        <dd className="font-semibold text-[var(--accent-teal)] tabular-nums">
                          {activeStationLive.velocityMs} m/s ({activeStationLive.velocityKmh} km/jam)
                        </dd>
                      </div>
                      <div className="py-2.5 flex items-center justify-between">
                        <dt className="text-[var(--text-secondary)]">Arah Aliran</dt>
                        <dd className="font-semibold text-[var(--text-primary)] tabular-nums flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-[var(--accent-sand)]" />
                          <span>
                            {activeStationLive.directionDeg}° ({activeStationLive.compassBearing})
                          </span>
                        </dd>
                      </div>
                    </dl>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {selectedStation.microplasticIndexNote}
                    </p>
                    <div className="text-[11px] text-[var(--text-muted)] space-y-0.5">
                      <div>Metode: {selectedStation.measurementMethod}</div>
                      <div>Agensi: {selectedStation.agency}</div>
                    </div>
                  </div>
                )}

                {/* Selected MPA */}
                {selectedMpa && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="uppercase tracking-wider text-[var(--accent-teal)] font-semibold">
                        Kawasan Konservasi (MPA)
                      </span>
                      <span className="text-[var(--text-muted)] tabular-nums">
                        {formatCoords(selectedMpa.lat, selectedMpa.lng)}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl text-[var(--text-primary)] leading-snug">
                      {selectedMpa.name}
                    </h3>

                    <dl className="divide-y divide-[var(--border-hairline)] text-xs border-y border-[var(--border-hairline)]">
                      <div className="py-2.5 flex items-center justify-between">
                        <dt className="text-[var(--text-secondary)]">Luas Perlindungan</dt>
                        <dd className="font-semibold text-[var(--accent-teal)] tabular-nums">
                          {selectedMpa.protectedAreaKm2.toLocaleString('id-ID')} km²
                        </dd>
                      </div>
                      <div className="py-2.5 flex items-center justify-between">
                        <dt className="text-[var(--text-secondary)]">Tahun Penetapan</dt>
                        <dd className="font-semibold text-[var(--text-primary)] tabular-nums">
                          {selectedMpa.yearEstablished}
                        </dd>
                      </div>
                    </dl>

                    <div className="text-xs space-y-1.5">
                      <div className="text-[var(--accent-sand)] font-medium">{selectedMpa.designation}</div>
                      <p className="text-[var(--text-secondary)] leading-relaxed">
                        Spesies Dilindungi: {selectedMpa.keyProtectedSpecies}
                      </p>
                      <div className="text-[11px] text-[var(--text-muted)] pt-1">
                        Rujukan: {selectedMpa.attribution}
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Heatmap Point */}
                {selectedHeat && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="uppercase tracking-wider text-[var(--accent-sand)] font-semibold">
                        Kepadatan Survei Historis
                      </span>
                      <span className="text-[var(--text-muted)] tabular-nums">
                        {formatCoords(selectedHeat.lat, selectedHeat.lng)}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl text-[var(--text-primary)] leading-snug">
                      {selectedHeat.label}
                    </h3>

                    <div className="py-2.5 border-y border-[var(--border-hairline)] flex items-center justify-between text-xs">
                      <span className="text-[var(--text-secondary)]">Estimasi Konsentrasi</span>
                      <span className="font-semibold text-[var(--accent-coral)] tabular-nums">
                        ~{selectedHeat.estimatedItemsPerKm2.toLocaleString('id-ID')} item/km²
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Rata-rata kepadatan partikel plastik mengapung berdasarkan kompilasi survei jaring neuston dan model oseanografi.
                    </p>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      Basis Survei: {selectedHeat.surveyBasis}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
