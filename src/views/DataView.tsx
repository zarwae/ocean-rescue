import React, { useState } from 'react';

interface ChartDataPoint {
  year: number;
  value: number;
  label?: string;
}

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

const PLASTIC_INFLUX: ChartDataPoint[] = [
  { year: 2000, value: 4.8 },
  { year: 2005, value: 6.2 },
  { year: 2010, value: 8.0 },
  { year: 2015, value: 9.6 },
  { year: 2020, value: 11.2 },
  { year: 2024, value: 12.8 },
  { year: 2030, value: 17.5, label: 'Proyeksi BaU' },
];

const MPA_COVERAGE: ChartDataPoint[] = [
  { year: 2000, value: 1.2 },
  { year: 2005, value: 2.1 },
  { year: 2010, value: 3.4 },
  { year: 2015, value: 5.8 },
  { year: 2020, value: 7.6 },
  { year: 2024, value: 8.3 },
  { year: 2030, value: 30.0, label: 'Target 30x30' },
];

const PH_TRENDS: ChartDataPoint[] = [
  { year: 1850, value: 8.25 },
  { year: 1950, value: 8.20 },
  { year: 1980, value: 8.17 },
  { year: 2000, value: 8.15 },
  { year: 2024, value: 8.14 },
  { year: 2050, value: 8.02, label: 'Skenario SSP2-4.5' },
];

const CHART_META = [
  {
    id: 'temp' as const,
    tabLabel: 'Suhu Permukaan Laut',
    stat: '+1,05°C',
    title: 'Tren Anomali Suhu Permukaan Laut Global (1980–2024)',
    source: 'Satuan: °C deviasi terhadap rata-rata abad ke-20 · Sumber: NOAA Climate.gov (2024)',
    interpretation:
      'Anomali suhu permukaan laut tahun 2024 telah melampaui +1.0°C di atas rata-rata historis abad ke-20. Setiap fraksi derajat kenaikan melipatgandakan kejadian gelombang panas laut (marine heatwaves) yang memicu pemutihan karang di Karibia, Great Barrier Reef, dan Kepulauan Nusantara.',
  },
  {
    id: 'plastic' as const,
    tabLabel: 'Kebocoran Plastik',
    stat: '12,8 Jt Ton/Thn',
    title: 'Laju Masuknya Sampah Plastik ke Samudra',
    source: 'Satuan: Juta Metrik Ton/Tahun · Sumber: UNEP & Jambeck et al., Science (2022)',
    interpretation:
      'Berdasarkan model UNEP, jika perjanjian plastik global tidak membatasi produksi polimer primer di hulu, aliran plastik ke laut diperkirakan melonjak menjadi 17,5 juta ton per tahun pada 2030.',
  },
  {
    id: 'mpa' as const,
    tabLabel: 'Kawasan Konservasi',
    stat: '8,3% / 30%',
    title: 'Kemajuan Cakupan Kawasan Konservasi Laut (MPA)',
    source: 'Satuan: Persen (%) Laut Terlindungi · Sumber: UNEP-WCMC Protected Planet (2024)',
    interpretation:
      'Meskipun meningkat dari 1,2% (2000) menjadi 8,3% (2024), dunia masih berjarak 21,7% dari komitmen Kunming-Montreal 30x30. Ratifikasi Perjanjian Laut Lepas (BBNJ) menjadi kunci perlindungan perairan internasional.',
  },
  {
    id: 'ph' as const,
    tabLabel: 'Kimiawi Samudra',
    stat: '8,14 pH',
    title: 'Penurunan pH Permukaan Samudra & Pengasaman Laut',
    source: 'Satuan: Skala Logaritmik pH · Sumber: IPCC AR6 Ocean & Cryosphere Special Report (2023)',
    interpretation:
      'Penurunan pH dari 8.25 menjadi 8.14 mewakili peningkatan 30% keasaman samudra. Pada skenario emisi sedang (SSP2-4.5), pH diproyeksikan turun ke 8.02 pada 2050 dan mengganggu pembentukan cangkang larva laut.',
  },
];

export const DataView: React.FC = () => {
  const [activeChart, setActiveChart] = useState<'temp' | 'plastic' | 'mpa' | 'ph'>('temp');
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);

  const currentMeta = CHART_META.find((c) => c.id === activeChart) || CHART_META[0];

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] pt-28 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <header className="space-y-3 max-w-3xl">
          <div className="text-[11px] font-medium tracking-[0.22em] text-[var(--accent-teal)] uppercase">
            Data Ilmiah Resmi · SDG 14
          </div>
          <h1 className="font-display font-light text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight">
            Visualisasi Data Kelautan Resmi
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Tren historis dan proyeksi ilmiah dari NOAA, UNEP, IPCC, dan Protected Planet untuk memantau kesehatan samudra global.
          </p>
        </header>

        {/* Underline Dataset Switcher */}
        <div className="flex items-center gap-7 overflow-x-auto border-b border-[var(--border-hairline)]">
          {CHART_META.map((item) => {
            const active = activeChart === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveChart(item.id);
                  setHoveredPoint(null);
                }}
                className={`pb-3.5 text-left transition-colors whitespace-nowrap shrink-0 cursor-pointer relative ${
                  active
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className="text-sm font-medium">{item.tabLabel}</span>
                <span className="ml-2 text-xs tabular-nums text-[var(--accent-teal)]">{item.stat}</span>
                {active && (
                  <span className="absolute bottom-0 inset-x-0 h-[1.5px] bg-[var(--accent-teal)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Open Canvas Chart Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="font-display font-light text-2xl sm:text-3xl text-[var(--text-primary)]">
                {currentMeta.title}
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">{currentMeta.source}</p>
            </div>

            {hoveredPoint && (
              <div className="text-xs text-[var(--accent-teal)] font-medium tabular-nums">
                Tahun {hoveredPoint.year}:{' '}
                <strong className="text-[var(--text-primary)]">{hoveredPoint.value}</strong>
                {hoveredPoint.label && ` (${hoveredPoint.label})`}
              </div>
            )}
          </div>

          {/* Responsive Theme-Aware SVG Chart */}
          <div className="h-72 sm:h-80 w-full relative pt-4">
            {activeChart === 'temp' && (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 240">
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-coral)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--accent-coral)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {[0, 0.3, 0.6, 0.9, 1.2].map((val, idx) => {
                  const y = 200 - (val / 1.2) * 180;
                  return (
                    <g key={idx}>
                      <line x1="40" y1={y} x2="580" y2={y} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                      <text x="32" y={y + 4} fill="var(--text-muted)" fontSize="9.5" textAnchor="end" fontFamily="'DM Sans', sans-serif">
                        +{val}°
                      </text>
                    </g>
                  );
                })}

                <path
                  d={`M 50 200 ${SST_TRENDS.map((pt, i) => {
                    const x = 50 + (i / (SST_TRENDS.length - 1)) * 520;
                    const y = 200 - (pt.value / 1.2) * 180;
                    return `L ${x} ${y}`;
                  }).join(' ')} L 570 200 Z`}
                  fill="url(#tempGradient)"
                />

                <path
                  d={SST_TRENDS.map((pt, i) => {
                    const x = 50 + (i / (SST_TRENDS.length - 1)) * 520;
                    const y = 200 - (pt.value / 1.2) * 180;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="var(--accent-coral)"
                  strokeWidth="2.5"
                />

                {SST_TRENDS.map((pt, i) => {
                  const x = 50 + (i / (SST_TRENDS.length - 1)) * 520;
                  const y = 200 - (pt.value / 1.2) * 180;
                  return (
                    <g
                      key={i}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <circle cx={x} cy={y} r="5" fill="var(--bg-canvas)" stroke="var(--accent-coral)" strokeWidth="2.2" />
                      <text x={x} y="220" fill="var(--text-muted)" fontSize="9.5" textAnchor="middle" fontFamily="'DM Sans', sans-serif">
                        {pt.year}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            {activeChart === 'plastic' && (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 240">
                {[0, 5, 10, 15, 20].map((val, idx) => {
                  const y = 200 - (val / 20) * 180;
                  return (
                    <g key={idx}>
                      <line x1="40" y1={y} x2="580" y2={y} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                      <text x="32" y={y + 4} fill="var(--text-muted)" fontSize="9.5" textAnchor="end" fontFamily="'DM Sans', sans-serif">
                        {val}M
                      </text>
                    </g>
                  );
                })}

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
                        fill={isProjected ? 'var(--accent-coral)' : 'var(--accent-teal)'}
                        opacity={isProjected ? 0.78 : 0.88}
                      />
                      <text x={x + 19} y={y - 7} fill="var(--text-primary)" fontSize="10" textAnchor="middle" fontFamily="'DM Sans', sans-serif" fontWeight="600">
                        {pt.value}
                      </text>
                      <text x={x + 19} y="220" fill="var(--text-muted)" fontSize="9.5" textAnchor="middle" fontFamily="'DM Sans', sans-serif">
                        {pt.year}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            {activeChart === 'mpa' && (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 240">
                <line x1="40" y1="35" x2="580" y2="35" stroke="var(--accent-teal)" strokeWidth="1.5" strokeDasharray="5 4" />
                <text x="580" y="28" fill="var(--accent-teal)" fontSize="9.5" textAnchor="end" fontFamily="'DM Sans', sans-serif" fontWeight="600">
                  Target Global 30x30 (30% Kawasan Lindung)
                </text>

                {[0, 10, 20, 30].map((val, idx) => {
                  const y = 200 - (val / 32) * 175;
                  return (
                    <g key={idx}>
                      <line x1="40" y1={y} x2="580" y2={y} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                      <text x="32" y={y + 4} fill="var(--text-muted)" fontSize="9.5" textAnchor="end" fontFamily="'DM Sans', sans-serif">
                        {val}%
                      </text>
                    </g>
                  );
                })}

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
                        fill={isTarget ? 'var(--accent-sand)' : 'var(--accent-teal)'}
                        opacity={isTarget ? 0.85 : 0.78}
                      />
                      <text x={x + 19} y={y - 7} fill="var(--text-primary)" fontSize="10" textAnchor="middle" fontFamily="'DM Sans', sans-serif" fontWeight="600">
                        {pt.value}%
                      </text>
                      <text x={x + 19} y="220" fill="var(--text-muted)" fontSize="9.5" textAnchor="middle" fontFamily="'DM Sans', sans-serif">
                        {pt.year}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            {activeChart === 'ph' && (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 240">
                {[8.0, 8.1, 8.2, 8.3].map((val, idx) => {
                  const y = 200 - ((val - 7.95) / 0.35) * 175;
                  return (
                    <g key={idx}>
                      <line x1="40" y1={y} x2="580" y2={y} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                      <text x="32" y={y + 4} fill="var(--text-muted)" fontSize="9.5" textAnchor="end" fontFamily="'DM Sans', sans-serif">
                        pH {val.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                <path
                  d={PH_TRENDS.map((pt, i) => {
                    const x = 60 + (i / (PH_TRENDS.length - 1)) * 500;
                    const y = 200 - ((pt.value - 7.95) / 0.35) * 175;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="var(--accent-sand)"
                  strokeWidth="2.8"
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
                      <circle cx={x} cy={y} r="5" fill="var(--bg-canvas)" stroke="var(--accent-sand)" strokeWidth="2.4" />
                      <text x={x} y={y - 10} fill="var(--text-primary)" fontSize="10" textAnchor="middle" fontFamily="'DM Sans', sans-serif" fontWeight="600">
                        {pt.value}
                      </text>
                      <text x={x} y="220" fill="var(--text-muted)" fontSize="9.5" textAnchor="middle" fontFamily="'DM Sans', sans-serif">
                        {pt.year}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          {/* Unboxed Ecological Interpretation */}
          <div className="pt-6 border-t border-[var(--border-hairline)] space-y-2 max-w-3xl">
            <h3 className="font-display font-light text-xl text-[var(--text-primary)]">
              Interpretasi Ekologis
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {currentMeta.interpretation}
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};
