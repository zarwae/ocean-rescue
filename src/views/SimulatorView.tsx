import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Thermometer,
  Trash2,
  Droplet,
  Anchor,
} from 'lucide-react';
import { calculateSimulation, SimulatorParams, SimulationResult } from '../utils/simulatorRules';
import { soundEffects } from '../utils/soundEffects';
import { SimulatorAquarium } from '../components/SimulatorAquarium';
import { ThemeMode } from '../hooks/useTheme';

interface SimulatorViewProps {
  onAwardXp?: (xp: number, reason: string) => void;
  theme?: ThemeMode;
}

const PRESET_SCENARIOS = {
  healthy: {
    name: '1950 Alami',
    waterTemp: 26.0,
    plasticPollution: 5,
    acidification: 8.18,
    fishingPressure: 12,
  },
  present: {
    name: '2026 Saat Ini',
    waterTemp: 28.5,
    plasticPollution: 38,
    acidification: 8.05,
    fishingPressure: 55,
  },
  crisis: {
    name: 'Krisis RCP 8.5',
    waterTemp: 32.0,
    plasticPollution: 85,
    acidification: 7.75,
    fishingPressure: 90,
  },
  restoration: {
    name: 'Restorasi 30×30',
    waterTemp: 26.8,
    plasticPollution: 12,
    acidification: 8.14,
    fishingPressure: 20,
  },
};

export const SimulatorView: React.FC<SimulatorViewProps> = ({ onAwardXp, theme = 'dark' }) => {
  const [params, setParams] = useState<SimulatorParams>({
    waterTemp: 27.2,
    plasticPollution: 25,
    acidification: 8.1,
    fishingPressure: 35,
  });

  const simResult: SimulationResult = useMemo(() => {
    return calculateSimulation(params);
  }, [params]);

  const handleReset = () => {
    setParams(PRESET_SCENARIOS.healthy);
    soundEffects.playBubblePop();
  };

  const handleApplyPreset = (presetKey: keyof typeof PRESET_SCENARIOS) => {
    setParams(PRESET_SCENARIOS[presetKey]);
    soundEffects.playBubblePop();
    if (onAwardXp) {
      onAwardXp(15, `Menjalankan skenario ${PRESET_SCENARIOS[presetKey].name}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] pt-28 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header & Minimal Preset Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-hairline)]">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-[var(--accent-teal)] font-semibold block">
              Model Sensitivitas Biosfer Laut
            </span>
            <h1 className="font-display text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight">
              Simulator Ekosistem Samudra
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Uji respons terumbu karang dan populasi ikan terhadap suhu laut, limbah plastik, pengasaman, dan tekanan tangkap.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            {(Object.keys(PRESET_SCENARIOS) as (keyof typeof PRESET_SCENARIOS)[]).map((key) => (
              <button
                key={key}
                onClick={() => handleApplyPreset(key)}
                className="font-medium text-[var(--text-secondary)] hover:text-[var(--accent-teal)] transition-colors cursor-pointer"
              >
                {PRESET_SCENARIOS[key].name}
              </button>
            ))}
          </div>
        </div>

        {/* TWO-ZONE SANDBOX LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT: Rich Aquarium Diorama + Open Metrics (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <SimulatorAquarium params={params} simResult={simResult} theme={theme} />

            {/* Open 4-Column Typographic KPI Strip (Zero Boxes) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
              <div>
                <div className="text-[11px] text-[var(--text-muted)]">Kesehatan Karang</div>
                <div className="text-2xl font-display text-[var(--accent-teal)] tabular-nums mt-0.5">
                  {simResult.coralHealth}%
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--text-muted)]">Biodiversitas</div>
                <div className="text-2xl font-display text-[var(--text-primary)] tabular-nums mt-0.5">
                  {simResult.biodiversityIndex}%
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--text-muted)]">Stres Termal</div>
                <div className={`text-2xl font-display tabular-nums mt-0.5 ${simResult.thermalStressDegreeDays > 4 ? 'text-[var(--accent-coral)]' : 'text-[var(--accent-teal)]'}`}>
                  {simResult.thermalStressDegreeDays} DHD
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--text-muted)]">Saturasi Aragonit</div>
                <div className={`text-2xl font-display tabular-nums mt-0.5 ${params.acidification < 8.0 ? 'text-[var(--accent-coral)]' : 'text-[var(--accent-teal)]'}`}>
                  {((params.acidification - 7.0) * 3.4).toFixed(1)} Ω
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Unboxed Parameter Sliders (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
              <h3 className="font-display text-xl text-[var(--text-primary)]">Parameter Ekosistem</h3>
              <button
                onClick={handleReset}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-teal)] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="divide-y divide-[var(--border-hairline)]">
              <div className="py-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-[var(--accent-coral)]" />
                    Suhu Permukaan Laut
                  </span>
                  <span className={`font-semibold tabular-nums ${params.waterTemp > 29 ? 'text-[var(--accent-coral)]' : 'text-[var(--accent-teal)]'}`}>
                    {params.waterTemp.toFixed(1)} °C
                  </span>
                </div>
                <input
                  type="range"
                  min="24.0"
                  max="33.0"
                  step="0.1"
                  value={params.waterTemp}
                  onChange={(e) => setParams({ ...params, waterTemp: parseFloat(e.target.value) })}
                  className="w-full accent-[#367D7B] cursor-pointer"
                />
              </div>

              <div className="py-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
                    Konsentrasi Plastik
                  </span>
                  <span className="font-semibold text-[var(--accent-teal)] tabular-nums">
                    {params.plasticPollution} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={params.plasticPollution}
                  onChange={(e) => setParams({ ...params, plasticPollution: parseInt(e.target.value, 10) })}
                  className="w-full accent-[#367D7B] cursor-pointer"
                />
              </div>

              <div className="py-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
                    Keasaman Air Laut (pH)
                  </span>
                  <span className={`font-semibold tabular-nums ${params.acidification < 8.0 ? 'text-[var(--accent-coral)]' : 'text-[var(--accent-teal)]'}`}>
                    pH {params.acidification.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="7.60"
                  max="8.25"
                  step="0.01"
                  value={params.acidification}
                  onChange={(e) => setParams({ ...params, acidification: parseFloat(e.target.value) })}
                  className="w-full accent-[#367D7B] cursor-pointer"
                />
              </div>

              <div className="py-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium flex items-center gap-1.5">
                    <Anchor className="w-3.5 h-3.5 text-[var(--accent-sand)]" />
                    Tekanan Penangkapan Ikan
                  </span>
                  <span className="font-semibold text-[var(--accent-sand)] tabular-nums">
                    {params.fishingPressure}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={params.fishingPressure}
                  onChange={(e) => setParams({ ...params, fishingPressure: parseInt(e.target.value, 10) })}
                  className="w-full accent-[#367D7B] cursor-pointer"
                />
              </div>
            </div>

            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed pt-2">
              Mengacu pada model NOAA Coral Reef Watch Degree Heating Weeks dan proyeksi saturasi aragonit IPCC AR6.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
