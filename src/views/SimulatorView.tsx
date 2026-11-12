import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  RotateCcw, 
  Sliders, 
  Thermometer, 
  Trash2, 
  Droplet, 
  Anchor
} from 'lucide-react';
import { calculateSimulation, SimulatorParams, SimulationResult } from '../utils/simulatorRules';
import { soundEffects } from '../utils/soundEffects';

interface SimulatorViewProps {
  onAwardXp?: (xp: number, reason: string) => void;
}

const PRESET_SCENARIOS = {
  healthy: {
    name: 'Laut Alami 1950 (Ideal)',
    waterTemp: 26.0,
    plasticPollution: 5,
    acidification: 8.18,
    fishingPressure: 12,
  },
  present: {
    name: 'Kondisi 2026 (Moderat)',
    waterTemp: 28.5,
    plasticPollution: 38,
    acidification: 8.05,
    fishingPressure: 55,
  },
  crisis: {
    name: 'Krisis RCP 8.5 (Ekstrem)',
    waterTemp: 32.0,
    plasticPollution: 85,
    acidification: 7.75,
    fishingPressure: 90,
  },
  restoration: {
    name: 'Restorasi 30x30 (Target)',
    waterTemp: 26.8,
    plasticPollution: 12,
    acidification: 8.14,
    fishingPressure: 20,
  },
};

export const SimulatorView: React.FC<SimulatorViewProps> = ({ onAwardXp }) => {
  const [params, setParams] = useState<SimulatorParams>({
    waterTemp: 27.2,
    plasticPollution: 25,
    acidification: 8.10,
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

  // Water clarity & coral colors based on simulation metrics
  const isBleached = simResult.coralHealth < 45;
  const isCriticalBleached = simResult.coralHealth < 25;
  const coralColor = isCriticalBleached ? '#E2E8F0' : isBleached ? '#CBD5E1' : '#2DD4BF';
  const coralSecondaryColor = isCriticalBleached ? '#94A3B8' : isBleached ? '#E2E8F0' : '#FB7185';

  // Visible fish count scaled by fishing pressure and biodiversity
  const fishCount = Math.max(1, Math.round((simResult.biodiversityIndex / 100) * 12 * (1 - params.fishingPressure / 120)));

  // Plastic debris count scaled by plasticPollution
  const debrisCount = Math.min(10, Math.floor(params.plasticPollution / 12));

  // Water haze styling
  const waterTurbidity = Math.min(0.65, (params.plasticPollution / 100) * 0.45 + (params.waterTemp > 29 ? 0.2 : 0));

  return (
    <div className="min-h-screen bg-[#040D14] text-[#F1F5F9] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Controls bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs text-teal-400 font-medium">
              <Activity className="w-3.5 h-3.5" />
              <span>Model Sensitivitas Biosfer Laut</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl text-white tracking-tight">
              Simulator Ekosistem Samudra Raya
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Laboratorium interaktif untuk menguji respons terumbu karang, populasi ikan pelagik, dan keanekaragaman hayati terhadap perubahan suhu, limbah plastik, dan pengasaman samudra.
            </p>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleApplyPreset('healthy')}
              className="px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.1] hover:border-teal-400/50 hover:bg-white/[0.06] text-xs font-medium text-teal-300 transition-all cursor-pointer"
            >
              1950 Alami
            </button>
            <button
              onClick={() => handleApplyPreset('present')}
              className="px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.1] hover:border-white/30 text-xs font-medium text-slate-300 transition-all cursor-pointer"
            >
              2026 Tren Saat Ini
            </button>
            <button
              onClick={() => handleApplyPreset('crisis')}
              className="px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.1] hover:border-rose-400/50 text-xs font-medium text-rose-300 transition-all cursor-pointer"
            >
              Krisis RCP 8.5
            </button>
            <button
              onClick={() => handleApplyPreset('restoration')}
              className="px-3.5 py-1.5 rounded-lg bg-teal-400/10 border border-teal-400/30 hover:bg-teal-400/20 text-xs font-medium text-teal-300 transition-all cursor-pointer"
            >
              Restorasi 30x30
            </button>
          </div>
        </div>

        {/* MAIN SIMULATION INTERFACE: Left (Aquarium Viewport) & Right (Parameters) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Living Interactive Aquarium Viewport (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#02070D] shadow-2xl h-[440px] sm:h-[500px] flex flex-col justify-between p-6 select-none">
              
              {/* Dynamic Water Column Background */}
              <div 
                className="absolute inset-0 pointer-events-none transition-all duration-700"
                style={{
                  background: isCriticalBleached 
                    ? 'linear-gradient(to bottom, #091D26, #040E14, #02070A)'
                    : params.waterTemp > 30 
                    ? 'linear-gradient(to bottom, #0A2E3B, #071F2B, #031017)'
                    : 'linear-gradient(to bottom, #0D4E5B, #0A323F, #02080D)'
                }}
              />

              {/* Murky Water Turbidity Overlay */}
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-700"
                style={{
                  backgroundColor: '#304238',
                  opacity: waterTurbidity,
                }}
              />

              {/* LIVE SIMULATED REEF SVG ECOSYSTEM */}
              <div className="absolute inset-0 pointer-events-none z-1">
                <svg viewBox="0 0 600 450" preserveAspectRatio="none" className="w-full h-full">
                  {/* Seafloor Sand & Rock Formations */}
                  <path d="M0 450 L0 390 Q150 420 300 380 Q450 410 600 395 L600 450 Z" fill="#02090F" />

                  {/* Dynamic Branching Corals */}
                  <g className="transition-all duration-1000">
                    <path
                      d="M70 410 L70 330 C60 300, 30 290, 20 260 M70 330 C80 290, 100 270, 90 230 M60 350 C40 330, 35 310, 45 280 M75 360 C95 340, 110 320, 105 290"
                      stroke={coralColor}
                      strokeWidth="9"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M500 410 L490 320 C475 290, 440 280, 430 250 M490 320 C510 280, 540 260, 530 220 M480 340 C460 320, 450 300, 465 270"
                      stroke={coralSecondaryColor}
                      strokeWidth="10"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <ellipse cx="280" cy="400" rx="45" ry="26" fill={coralColor} fillOpacity="0.8" />
                  </g>

                  {/* Swaying Soft Sea Anemones */}
                  <path
                    d="M170 410 C160 370, 150 350, 160 330 M175 410 C180 370, 190 350, 185 330 M180 410 C175 360, 170 340, 175 320"
                    stroke={isBleached ? '#CBD5E1' : '#99F6E4'}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="animate-sway"
                  />

                  {/* Dynamic Fish Schools */}
                  {Array.from({ length: fishCount }).map((_, i) => {
                    const yPos = 80 + (i * 26) % 240;
                    return (
                      <g
                        key={`fish-${i}`}
                        className="transition-all duration-700"
                        style={{
                          transform: `translate(${50 + (i * 45) % 460}px, ${yPos}px)`,
                        }}
                      >
                        <path
                          d="M0 0 C12 -6, 26 -4, 30 0 C26 4, 12 6, 0 0 Z M28 0 L36 -5 L36 5 Z"
                          fill={i % 2 === 0 ? '#2DD4BF' : '#FB7185'}
                          className="animate-pulse"
                          style={{ animationDuration: `${2 + (i % 3)}s` }}
                        />
                      </g>
                    );
                  })}

                  {/* Visible Plastic Debris */}
                  {Array.from({ length: debrisCount }).map((_, i) => {
                    const posX = 90 + (i * 55) % 440;
                    const posY = 60 + (i * 38) % 220;
                    return (
                      <g
                        key={`debris-${i}`}
                        style={{
                          transform: `translate(${posX}px, ${posY}px)`,
                          animationDuration: `${4 + (i % 2) * 2}s`,
                        }}
                        className="animate-bounce"
                      >
                        {i % 2 === 0 ? (
                          <rect x="0" y="0" width="8" height="18" rx="2" fill="#E2E8F0" fillOpacity="0.6" stroke="#94A3B8" strokeWidth="1" transform="rotate(25)" />
                        ) : (
                          <polygon points="0,0 12,3 8,14 2,10" fill="#F8FAFC" fillOpacity="0.5" stroke="#CBD5E1" strokeWidth="1" />
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* TOP HUD: Health Status & Alert */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-[#02080D]/85 backdrop-blur-md border border-white/[0.1] flex items-center gap-2">
                  <span className="font-mono text-xs font-medium text-slate-200 tabular-nums">
                    Skor Kesehatan: <span className="text-teal-300 font-bold">{simResult.overallHealthScore}/100</span>
                  </span>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-[#02080D]/85 backdrop-blur-md border border-white/[0.1] text-[11px] font-mono">
                  <span className="text-slate-400">Status Pemutihan: </span>
                  <span className={`font-medium ${
                    simResult.bleachingRisk.includes('Massal') || simResult.bleachingRisk.includes('Kritis')
                      ? 'text-rose-400'
                      : 'text-teal-300'
                  }`}>
                    {simResult.bleachingRisk}
                  </span>
                </div>
              </div>

              {/* BOTTOM HUD: Ecological Consequence Explanation */}
              <div className="relative z-10 p-4 rounded-xl bg-[#02080D]/90 backdrop-blur-md border border-white/[0.08] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-teal-400 font-medium">Analisis Status Ekologis:</span>
                  <span className="text-slate-400">Rantai Makanan: {simResult.trophicCollapseRisk}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {simResult.statusDescription}
                </p>
                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 font-mono border-t border-white/[0.06]">
                  <span>Suhu: {params.waterTemp.toFixed(1)}°C · pH: {params.acidification.toFixed(2)}</span>
                  <span>Populasi Ikan Aktif: ~{fishCount * 8}%</span>
                </div>
              </div>

            </div>

            {/* 4 SCIENTIFIC METRIC GAUGES with Soft Hairlines */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-500">Kesehatan Karang</div>
                <div className="text-xl font-display font-medium text-teal-300 tabular-nums">
                  {simResult.coralHealth}%
                </div>
                <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div 
                    className="h-full bg-teal-400 transition-all duration-300"
                    style={{ width: `${simResult.coralHealth}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-500">Biodiversitas</div>
                <div className="text-xl font-display font-medium text-emerald-300 tabular-nums">
                  {simResult.biodiversityIndex}%
                </div>
                <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-300"
                    style={{ width: `${simResult.biodiversityIndex}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-500">Stres Termal</div>
                <div className={`text-xl font-display font-medium tabular-nums ${simResult.thermalStressDegreeDays > 4 ? 'text-rose-400' : 'text-teal-300'}`}>
                  {simResult.thermalStressDegreeDays} DHD
                </div>
                <div className="text-[9px] text-slate-500">Ambang NOAA: &gt;4 DHD</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-500">Kejenuhan Aragonit</div>
                <div className={`text-xl font-display font-medium tabular-nums ${params.acidification < 8.0 ? 'text-rose-400' : 'text-teal-300'}`}>
                  {((params.acidification - 7.0) * 3.4).toFixed(1)} Ω
                </div>
                <div className="text-[9px] text-slate-500">Ambang Kalsifikasi: 3.0 Ω</div>
              </div>

            </div>

          </div>

          {/* RIGHT: PARAMETER CONTROLS & SCIENTIFIC SLIDERS (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] shadow-xl space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-400" />
                  <h3 className="font-display font-medium text-base text-white">
                    Kontrol Parameter Ekosistem
                  </h3>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs font-mono text-slate-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
                  title="Kembalikan ke Kondisi Alami 1950"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* 1. Water Temp Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-medium flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                    Suhu Permukaan Laut (SST)
                  </span>
                  <span className={`font-mono font-medium tabular-nums ${params.waterTemp > 29 ? 'text-rose-400' : 'text-teal-300'}`}>
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
                  className="w-full accent-teal-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>24.0°C (Dingin)</span>
                  <span>28.0°C (Batas Termal)</span>
                  <span>33.0°C (Mematikan)</span>
                </div>
              </div>

              {/* 2. Plastic Pollution Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-medium flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-teal-400" />
                    Konsentrasi Polusi Plastik
                  </span>
                  <span className="font-mono font-medium text-teal-300 tabular-nums">
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
                  className="w-full accent-teal-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 (Bebas Sampah)</span>
                  <span>50 (Limbah Pesisir)</span>
                  <span>100 (Sup Plastik)</span>
                </div>
              </div>

              {/* 3. Ocean Acidification Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-medium flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-teal-400" />
                    Keasaman Air Laut (Skala pH)
                  </span>
                  <span className={`font-mono font-medium tabular-nums ${params.acidification < 8.0 ? 'text-rose-400' : 'text-teal-300'}`}>
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
                  className="w-full accent-teal-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>pH 7.60 (Korosif)</span>
                  <span>pH 8.10 (Saat Ini)</span>
                  <span>pH 8.25 (Pra-Industri)</span>
                </div>
              </div>

              {/* 4. Fishing Pressure Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-medium flex items-center gap-1.5">
                    <Anchor className="w-3.5 h-3.5 text-amber-300" />
                    Tekanan Penangkapan Ikan (Overfishing)
                  </span>
                  <span className="font-mono font-medium text-amber-300 tabular-nums">
                    {params.fishingPressure}% Kapasitas
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={params.fishingPressure}
                  onChange={(e) => setParams({ ...params, fishingPressure: parseInt(e.target.value, 10) })}
                  className="w-full accent-teal-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0% (Zona Konservasi)</span>
                  <span>50% (Batas Maksimal)</span>
                  <span>100% (Kolaps Stok)</span>
                </div>
              </div>

              {/* Scientific Methodology Note */}
              <div className="pt-3 border-t border-white/[0.08] text-[11px] text-slate-500 leading-relaxed">
                <span className="text-teal-400 font-medium">Validitas Ilmiah: </span>
                Model sensitivitas ini mengacu pada formula NOAA Coral Reef Watch Degree Heating Weeks (DHW/DHD) dan proyeksi aragonite saturation IPCC AR6.
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
