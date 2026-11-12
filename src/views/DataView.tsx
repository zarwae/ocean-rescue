import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Layers, 
  PieChart, 
  ShieldCheck, 
  Info,
  Calendar,
  ExternalLink,
  Filter
} from 'lucide-react';

interface ChartDataPoint {
  year: number;
  value: number;
  label?: string;
}

// 1. Sea Surface Temperature Anomaly (°C above baseline 1901-2000) - NOAA Climate.gov
const SST_TRENDS: ChartDataPoint[] = [
  { year: 1980, value: 0.12 },
  { year: 1985, value: 0.16 },
  { year: 1990, value: 0.24 },
  { year: 1995, value: 0.31 },
  { year: 2000, value: 0.39 },
  { year: 2005, value: 0.52 },
  { year: 2010, value: 0.61 },
  { year: 2015, value: 0.74 },
  { year: 2020, value: 0.88 },
  { year: 2024, value: 1.05 },
];

// 2. Global Plastic Influx into Oceans (Million Metric Tons/Year) - UNEP & Jambeck et al.
const PLASTIC_INFLUX: ChartDataPoint[] = [
  { year: 2000, value: 4.8 },
  { year: 2005, value: 6.2 },
  { year: 2010, value: 8.0 },
  { year: 2015, value: 9.6 },
  { year: 2020, value: 11.2 },
  { year: 2024, value: 12.8 },
  { year: 2030, value: 17.5, label: 'Proyeksi BaU' },
];

// 3. Global MPA (Marine Protected Area) Coverage (%) vs 30x30 Kunming-Montreal Target
const MPA_COVERAGE: ChartDataPoint[] = [
  { year: 2000, value: 1.2 },
  { year: 2005, value: 2.1 },
  { year: 2010, value: 3.4 },
  { year: 2015, value: 5.8 },
  { year: 2020, value: 7.6 },
  { year: 2024, value: 8.3 },
  { year: 2030, value: 30.0, label: 'Target 30x30' },
];

// 4. Ocean Surface pH (Historical & IPCC Projections)
const PH_TRENDS: ChartDataPoint[] = [
  { year: 1850, value: 8.25 },
  { year: 1950, value: 8.20 },
  { year: 1980, value: 8.17 },
  { year: 2000, value: 8.15 },
  { year: 2024, value: 8.14 },
  { year: 2050, value: 8.02, label: 'Skenario SSP2-4.5' },
];

export const DataView: React.FC = () => {
  const [activeChart, setActiveChart] = useState<'temp' | 'plastic' | 'mpa' | 'ph'>('temp');
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);

  return (
    <div className="min-h-screen bg-[#02080D] text-slate-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="space-y-3 max-w-3xl pb-6 border-b border-white/[0.08]">
          <div className="text-[11px] font-mono tracking-widest text-cyan-400/90 uppercase">
            Data Ilmiah Resmi & Indikator Historis · SDG 14
          </div>
          <h1 className="font-display font-light text-3xl sm:text-5xl text-white tracking-tight">
            Visualisasi Data Kelautan Resmi
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Eksplorasi tren historis dan proyeksi ilmiah dari data resmi NOAA, UNEP, IPCC, dan Protected Planet untuk mengukur kemajuan target SDG 14: Life Below Water.
          </p>
        </div>

        {/* Chart Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <button
            onClick={() => setActiveChart('temp')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              activeChart === 'temp'
                ? 'bg-white/[0.05] border-rose-400/40'
                : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            <div className="text-[10px] font-mono text-rose-400 uppercase tracking-wider">Suhu Permukaan Laut (SST)</div>
            <div className="font-display font-light text-sm text-white mt-1">Anomali Pemanasan</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5 tabular-nums">+1.05°C di 2024</div>
          </button>

          <button
            onClick={() => setActiveChart('plastic')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              activeChart === 'plastic'
                ? 'bg-white/[0.05] border-cyan-400/40'
                : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Kebocoran Plastik</div>
            <div className="font-display font-light text-sm text-white mt-1">Limbah Masuk Laut</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5 tabular-nums">12.8 Juta Ton/Tahun</div>
          </button>

          <button
            onClick={() => setActiveChart('mpa')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              activeChart === 'mpa'
                ? 'bg-white/[0.05] border-teal-400/40'
                : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            <div className="text-[10px] font-mono text-teal-400 uppercase tracking-wider">Kawasan Konservasi</div>
            <div className="font-display font-light text-sm text-white mt-1">Target 30x30 MPA</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5 tabular-nums">8.3% dari Target 30%</div>
          </button>

          <button
            onClick={() => setActiveChart('ph')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              activeChart === 'ph'
                ? 'bg-white/[0.05] border-amber-400/40'
                : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            <div className="text-[10px] font-mono text-amber-300 uppercase tracking-wider">Kimiawi Samudra</div>
            <div className="font-display font-light text-sm text-white mt-1">Penurunan Derajat pH</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5 tabular-nums">8.25 &rarr; 8.14 pH</div>
          </button>

        </div>

        {/* ACTIVE CHART DISPLAY CONTAINER */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md space-y-6">
          
          {/* Chart Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.06] gap-2">
            <div>
              <h2 className="font-display font-light text-xl sm:text-2xl text-white">
                {activeChart === 'temp' && 'Tren Anomali Suhu Permukaan Laut Global (1980 - 2024)'}
                {activeChart === 'plastic' && 'Laju Masuknya Sampah Plastik ke Samudra (Juta Metrik Ton/Tahun)'}
                {activeChart === 'mpa' && 'Kemajuan Cakupan Kawasan Konservasi Laut (MPA) Menuju Target 30x30'}
                {activeChart === 'ph' && 'Penurunan pH Permukaan Samudra & Proyeksi Pengasaman Laut (IPCC)'}
              </h2>
              <div className="text-xs text-slate-500 font-mono mt-1">
                {activeChart === 'temp' && 'Satuan: °C deviasi terhadap rata-rata abad ke-20 • Sumber: NOAA Climate.gov (2024)'}
                {activeChart === 'plastic' && 'Satuan: Juta Metrik Ton/Tahun • Sumber: UNEP & Jambeck et al., Science (2022)'}
                {activeChart === 'mpa' && 'Satuan: Persen (%) Permukaan Laut Terlindungi • Sumber: UNEP-WCMC Protected Planet (2024)'}
                {activeChart === 'ph' && 'Satuan: Skala Logaritmik pH • Sumber: IPCC AR6 Ocean & Cryosphere Special Report (2023)'}
              </div>
            </div>

            {hoveredPoint && (
              <div className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/20 text-xs font-mono text-cyan-300">
                Tahun {hoveredPoint.year}: <strong className="text-white">{hoveredPoint.value}</strong>
                {hoveredPoint.label && ` (${hoveredPoint.label})`}
              </div>
            )}
          </div>

          {/* SVG Responsive Chart Renderer */}
          <div className="h-72 sm:h-80 w-full relative pt-4">
            {activeChart === 'temp' && (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 240">
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF806B" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#FF806B" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid horizontal lines */}
                {[0, 0.3, 0.6, 0.9, 1.2].map((val, idx) => {
                  const y = 200 - (val / 1.2) * 180;
                  return (
                    <g key={idx}>
                      <line x1="40" y1={y} x2="580" y2={y} stroke="#0A2435" strokeDasharray="3 3" />
                      <text x="32" y={y + 4} fill="#70858E" fontSize="9" textAnchor="end" fontFamily="monospace">
                        +{val}°
                      </text>
                    </g>
                  );
                })}

                {/* Area fill */}
                <path
                  d={`M 50 200 ${SST_TRENDS.map((pt, i) => {
                    const x = 50 + (i / (SST_TRENDS.length - 1)) * 520;
                    const y = 200 - (pt.value / 1.2) * 180;
                    return `L ${x} ${y}`;
                  }).join(' ')} L 570 200 Z`}
                  fill="url(#tempGradient)"
                />

                {/* Line */}
                <path
                  d={SST_TRENDS.map((pt, i) => {
                    const x = 50 + (i / (SST_TRENDS.length - 1)) * 520;
                    const y = 200 - (pt.value / 1.2) * 180;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#FF806B"
                  strokeWidth="2.5"
                />

                {/* Data Points */}
                {SST_TRENDS.map((pt, i) => {
                  const x = 50 + (i / (SST_TRENDS.length - 1)) * 520;
                  const y = 200 - (pt.value / 1.2) * 180;
                  return (
                    <g 
                      key={i} 
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <circle cx={x} cy={y} r="5" fill="#031019" stroke="#FF806B" strokeWidth="2" />
                      <text x={x} y="220" fill="#70858E" fontSize="9" textAnchor="middle" fontFamily="monospace">
                        {pt.year}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            {activeChart === 'plastic' && (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 240">
                <defs>
                  <linearGradient id="plasticBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#35C6C0" />
                    <stop offset="100%" stopColor="#087F8C" />
                  </linearGradient>
                </defs>

                {/* Grid */}
                {[0, 5, 10, 15, 20].map((val, idx) => {
                  const y = 200 - (val / 20) * 180;
                  return (
                    <g key={idx}>
                      <line x1="40" y1={y} x2="580" y2={y} stroke="#0A2435" strokeDasharray="3 3" />
                      <text x="32" y={y + 4} fill="#70858E" fontSize="9" textAnchor="end" fontFamily="monospace">
                        {val}M
                      </text>
                    </g>
                  );
                })}

                {/* Bars */}
                {PLASTIC_INFLUX.map((pt, i) => {
                  const x = 60 + i * 75;
                  const height = (pt.value / 20) * 180;
                  const y = 200 - height;
                  const isProjected = pt.year > 2024;

                  return (
                    <g 
                      key={i}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <rect
                        x={x}
                        y={y}
                        width="38"
                        height={height}
                        rx="6"
                        fill={isProjected ? '#FF806B' : 'url(#plasticBar)'}
                        opacity={isProjected ? 0.7 : 0.9}
                      />
                      <text x={x + 19} y={y - 6} fill="#F4F7F5" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                        {pt.value}
                      </text>
                      <text x={x + 19} y="220" fill="#70858E" fontSize="9" textAnchor="middle" fontFamily="monospace">
                        {pt.year}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            {activeChart === 'mpa' && (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 240">
                <defs>
                  <linearGradient id="mpaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9DE3D7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#9DE3D7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* 30% Target Horizontal Milestone Line */}
                <line x1="40" y1="35" x2="580" y2="35" stroke="#35C6C0" strokeWidth="1.5" strokeDasharray="5 4" />
                <text x="580" y="28" fill="#35C6C0" fontSize="9" textAnchor="end" fontFamily="monospace" fontWeight="bold">
                  ★ Target Komitmen Global 30x30 (30% Kawasan Lindung)
                </text>

                {/* Grid */}
                {[0, 10, 20, 30].map((val, idx) => {
                  const y = 200 - (val / 32) * 175;
                  return (
                    <g key={idx}>
                      <line x1="40" y1={y} x2="580" y2={y} stroke="#0A2435" strokeDasharray="3 3" />
                      <text x="32" y={y + 4} fill="#70858E" fontSize="9" textAnchor="end" fontFamily="monospace">
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {/* Stepped progress */}
                {MPA_COVERAGE.map((pt, i) => {
                  const x = 60 + i * 75;
                  const height = (pt.value / 32) * 175;
                  const y = 200 - height;
                  const isTarget = pt.year === 2030;

                  return (
                    <g 
                      key={i}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <rect
                        x={x}
                        y={y}
                        width="38"
                        height={height}
                        rx="6"
                        fill={isTarget ? '#35C6C0' : '#087F8C'}
                        opacity={isTarget ? 0.9 : 0.75}
                      />
                      <text x={x + 19} y={y - 6} fill="#F4F7F5" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                        {pt.value}%
                      </text>
                      <text x={x + 19} y="220" fill="#70858E" fontSize="9" textAnchor="middle" fontFamily="monospace">
                        {pt.year}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            {activeChart === 'ph' && (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 240">
                {/* Grid */}
                {[8.0, 8.1, 8.2, 8.3].map((val, idx) => {
                  const y = 200 - ((val - 7.95) / 0.35) * 175;
                  return (
                    <g key={idx}>
                      <line x1="40" y1={y} x2="580" y2={y} stroke="#0A2435" strokeDasharray="3 3" />
                      <text x="32" y={y + 4} fill="#70858E" fontSize="9" textAnchor="end" fontFamily="monospace">
                        pH {val.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Line */}
                <path
                  d={PH_TRENDS.map((pt, i) => {
                    const x = 60 + (i / (PH_TRENDS.length - 1)) * 500;
                    const y = 200 - ((pt.value - 7.95) / 0.35) * 175;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="3"
                />

                {PH_TRENDS.map((pt, i) => {
                  const x = 60 + (i / (PH_TRENDS.length - 1)) * 500;
                  const y = 200 - ((pt.value - 7.95) / 0.35) * 175;
                  return (
                    <g 
                      key={i}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <circle cx={x} cy={y} r="5" fill="#031019" stroke="#F59E0B" strokeWidth="2.5" />
                      <text x={x} y={y - 10} fill="#F4F7F5" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                        {pt.value}
                      </text>
                      <text x={x} y="220" fill="#70858E" fontSize="9" textAnchor="middle" fontFamily="monospace">
                        {pt.year}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          {/* Scientific Interpretation & Context */}
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs leading-relaxed">
            <h4 className="font-light text-white font-display text-base">
              Interpretasi Analisis Ekologis
            </h4>
            {activeChart === 'temp' && (
              <p className="text-[#A8BAC1]">
                Anomali suhu permukaan laut tahun 2024 telah melampaui +1.0°C di atas rata-rata historis abad ke-20. Setiap fraksi derajat kenaikan melipatgandakan kejadian gelombang panas laut (marine heatwaves) yang memicu pemutihan karang di Karibia, Great Barrier Reef, dan Kepulauan Nusantara.
              </p>
            )}
            {activeChart === 'plastic' && (
              <p className="text-[#A8BAC1]">
                Berdasarkan model UNEP, jika perjanjian plastik global (Global Plastics Treaty) tidak meratifikasi batas produksi polimer primer di hulu, aliran plastik ke laut diperkirakan melonjak menjadi 17,5 juta ton pada tahun 2030, melebihi total biomassa ikan komersial di banyak teluk.
              </p>
            )}
            {activeChart === 'mpa' && (
              <p className="text-[#A8BAC1]">
                Meskipun terdapat kemajuan dari 1,2% (tahun 2000) menjadi 8,3% (tahun 2024), dunia masih berjarak 21,7% dari komitmen Kunming-Montreal 30x30. Ratifikasi Perjanjian Laut Lepas (BBNJ) menjadi kunci utama untuk melindungi kawasan samudra internasional.
              </p>
            )}
            {activeChart === 'ph' && (
              <p className="text-[#A8BAC1]">
                Penurunan pH dari 8.25 menjadi 8.14 mewakili peningkatan 30% keasaman samudra. Pada skenario emisi sedang (SSP2-4.5), pH diproyeksikan merosot hingga 8.02 pada 2050, yang akan menurunkan saturasi aragonit di bawah ambang batas yang dibutuhkan larva kerang untuk hidup.
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
