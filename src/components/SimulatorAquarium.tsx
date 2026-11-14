import React from 'react';
import { SimulationResult, SimulatorParams } from '../utils/simulatorRules';
import { ThemeMode } from '../hooks/useTheme';

interface SimulatorAquariumProps {
  params: SimulatorParams;
  simResult: SimulationResult;
  theme?: ThemeMode;
}

interface FishPlacement {
  x: number;
  y: number;
  scale: number;
  dir: 1 | -1;
  species: 'clown' | 'tang' | 'chromis' | 'angel';
  delay: number;
  duration: number;
}

const FISH_ROSTER: FishPlacement[] = [
  { x: 145, y: 155, scale: 0.92, dir: 1, species: 'tang', delay: 0, duration: 8.5 },
  { x: 520, y: 185, scale: 0.85, dir: -1, species: 'angel', delay: -2.2, duration: 9.8 },
  { x: 310, y: 235, scale: 0.78, dir: 1, species: 'clown', delay: -1.4, duration: 7.2 },
  { x: 640, y: 120, scale: 0.68, dir: -1, species: 'chromis', delay: -3.5, duration: 6.8 },
  { x: 225, y: 285, scale: 0.74, dir: 1, species: 'clown', delay: -4.1, duration: 7.9 },
  { x: 430, y: 110, scale: 0.65, dir: 1, species: 'chromis', delay: -0.9, duration: 6.4 },
  { x: 585, y: 265, scale: 0.86, dir: -1, species: 'tang', delay: -2.9, duration: 9.1 },
  { x: 95, y: 220, scale: 0.7, dir: 1, species: 'chromis', delay: -5.0, duration: 7.4 },
  { x: 380, y: 300, scale: 0.8, dir: -1, species: 'angel', delay: -1.7, duration: 10.2 },
  { x: 690, y: 215, scale: 0.72, dir: -1, species: 'clown', delay: -3.8, duration: 8.0 },
  { x: 255, y: 130, scale: 0.64, dir: 1, species: 'chromis', delay: -2.0, duration: 6.9 },
  { x: 485, y: 325, scale: 0.76, dir: 1, species: 'tang', delay: -4.6, duration: 8.8 },
];

const DEBRIS_ITEMS = [
  { x: 190, y: 105, rot: 28, type: 'bottle' as const },
  { x: 470, y: 145, rot: -14, type: 'bag' as const },
  { x: 335, y: 85, rot: 42, type: 'net' as const },
  { x: 615, y: 175, rot: -32, type: 'bottle' as const },
  { x: 125, y: 245, rot: 18, type: 'bag' as const },
  { x: 530, y: 245, rot: -24, type: 'net' as const },
  { x: 270, y: 205, rot: 55, type: 'bottle' as const },
  { x: 660, y: 95, rot: 12, type: 'bag' as const },
  { x: 410, y: 275, rot: -45, type: 'net' as const },
  { x: 155, y: 165, rot: -20, type: 'bottle' as const },
];

const BUBBLE_COLUMNS = [
  { cx: 88, cy: 365, r: 3.2, delay: '0s', dur: '6.2s' },
  { cx: 96, cy: 340, r: 2.1, delay: '-2.1s', dur: '5.4s' },
  { cx: 210, cy: 380, r: 2.8, delay: '-1.3s', dur: '6.8s' },
  { cx: 222, cy: 350, r: 1.9, delay: '-3.7s', dur: '5.1s' },
  { cx: 560, cy: 360, r: 3.0, delay: '-0.8s', dur: '6.5s' },
  { cx: 685, cy: 345, r: 2.4, delay: '-2.9s', dur: '5.8s' },
];

const RenderDetailedFish: React.FC<{
  fish: FishPlacement;
  idx: number;
  stressed: boolean;
}> = ({ fish, idx, stressed }) => {
  const opacity = stressed ? 0.72 : 0.96;

  return (
    <g transform={`translate(${fish.x}, ${fish.y})`}>
      <g
        className="animate-reef-swim"
        style={{
          animationDelay: `${fish.delay}s`,
          animationDuration: `${fish.duration}s`,
        }}
      >
        <g transform={`scale(${fish.dir * fish.scale}, ${fish.scale})`} opacity={opacity}>
          {fish.species === 'clown' && (
            <g>
              {/* Caudal Tail Fin */}
              <path d="M-24 0 C-33 -9, -37 -6, -34 0 C-37 6, -33 9, -24 0 Z" fill="#E96D3A" stroke="#1E1B18" strokeWidth="0.9" />
              {/* Dorsal Fins */}
              <path d="M-12 -11 C-6 -19, 4 -18, 8 -10 Z" fill="#F28544" stroke="#1E1B18" strokeWidth="0.8" />
              <path d="M-20 -7 C-17 -13, -12 -12, -11 -8 Z" fill="#E96D3A" stroke="#1E1B18" strokeWidth="0.8" />
              {/* Ventral Fin */}
              <path d="M-10 10 C-6 16, 0 15, 2 9 Z" fill="#E96D3A" stroke="#1E1B18" strokeWidth="0.8" />
              {/* Body */}
              <path
                d="M-25 0 C-22 -11, -4 -14, 14 -9 C22 -6, 26 -2, 26 0 C26 2, 22 6, 14 9 C-4 14, -22 11, -25 0 Z"
                fill={`url(#clownGrad-${idx})`}
                stroke="#1E1B18"
                strokeWidth="0.9"
              />
              {/* Crisp White Clownfish Bands */}
              <path d="M7 -11 C10 -4, 10 4, 7 11 L12 9.5 C15 3.5, 15 -3.5, 12 -9.5 Z" fill="#F8FAFC" stroke="#1E1B18" strokeWidth="0.7" />
              <path d="M-6 -12.5 C-2 -5, -2 5, -6 12.5 L-1 12.2 C3 4.5, 3 -4.5, -1 -12.2 Z" fill="#F8FAFC" stroke="#1E1B18" strokeWidth="0.7" />
              <path d="M-19 -6.5 C-17 -2, -17 2, -19 6.5 L-16 8 C-14 3, -14 -3, -16 -8 Z" fill="#F8FAFC" stroke="#1E1B18" strokeWidth="0.7" />
              {/* Pectoral Fin */}
              <path d="M1 2 C-6 0, -8 7, -1 8 C3 8, 5 4, 1 2 Z" fill="#FB923C" fillOpacity="0.9" stroke="#1E1B18" strokeWidth="0.7" />
              {/* Eye */}
              <circle cx="18" cy="-2" r="2.2" fill="#0F172A" />
              <circle cx="18.7" cy="-2.7" r="0.75" fill="#FFFFFF" />
            </g>
          )}

          {fish.species === 'tang' && (
            <g>
              {/* Yellow Forked Tail */}
              <path d="M-23 0 L-36 -11 C-32 -4, -32 4, -36 11 Z" fill="#FACC15" stroke="#0F172A" strokeWidth="0.8" />
              {/* Dorsal & Anal Crest */}
              <path d="M-19 -6 C-12 -18, 6 -19, 14 -10 L-19 -6 Z" fill="#1E40AF" />
              <path d="M-18 6 C-11 17, 4 17, 11 9 L-18 6 Z" fill="#2563EB" />
              {/* Oval Tang Body */}
              <path
                d="M-24 0 C-20 -13, -2 -16, 15 -10 C23 -6, 28 -1, 28 0 C28 1, 23 6, 15 10 C-2 16, -20 13, -24 0 Z"
                fill={`url(#tangGrad-${idx})`}
              />
              {/* Dark Palette Saddle Mark */}
              <path
                d="M-21 -3 C-10 -12, 4 -12, 13 -5 C6 -2, -4 3, -17 2 Z"
                fill="#0F172A"
                fillOpacity="0.72"
              />
              {/* Yellow Caudal Spine */}
              <line x1="-22" y1="0" x2="-15" y2="0" stroke="#FDE047" strokeWidth="2.2" strokeLinecap="round" />
              {/* Pectoral Fin */}
              <path d="M2 2 C-5 1, -7 8, 0 9 C4 8, 5 4, 2 2 Z" fill="#FDE047" fillOpacity="0.85" />
              {/* Eye */}
              <circle cx="18" cy="-2.2" r="2.2" fill="#FFFFFF" />
              <circle cx="18.4" cy="-2.2" r="1.3" fill="#0F172A" />
              <circle cx="18.9" cy="-2.8" r="0.5" fill="#FFFFFF" />
            </g>
          )}

          {fish.species === 'chromis' && (
            <g>
              {/* Swallowtail Caudal */}
              <path d="M-18 0 L-31 -10 L-24 0 L-31 10 Z" fill="#5EEAD4" fillOpacity="0.85" />
              {/* Slender Dorsal */}
              <path d="M-12 -5 C-5 -12, 6 -11, 10 -4 Z" fill="#2DD4BF" fillOpacity="0.85" />
              {/* Streamlined Reef Fusilier Body */}
              <path
                d="M-19 0 C-14 -8, 4 -9, 19 -3 C23 -1, 24 0, 24 0 C24 0, 23 1, 19 3 C4 9, -14 8, -19 0 Z"
                fill={`url(#chromisGrad-${idx})`}
              />
              {/* Metallic Neon Lateral Line */}
              <path d="M-15 -1 C-4 -3, 8 -3, 16 -1" stroke="#A7F3D0" strokeWidth="1.2" fill="none" strokeOpacity="0.8" />
              {/* Pectoral */}
              <path d="M3 2 L-4 6 L1 7 Z" fill="#99F6E4" fillOpacity="0.7" />
              {/* Eye */}
              <circle cx="16.5" cy="-1.2" r="1.7" fill="#061116" />
              <circle cx="17" cy="-1.7" r="0.6" fill="#FFFFFF" />
            </g>
          )}

          {fish.species === 'angel' && (
            <g>
              {/* Streaming Dorsal Filament (Moorish Idol / Bannerfish style) */}
              <path
                d="M-4 -14 C-14 -28, -28 -32, -38 -27 C-27 -27, -15 -22, -9 -11 Z"
                fill="#F8FAFC"
                fillOpacity="0.92"
              />
              <path d="M-20 0 L-31 -9 C-28 -3, -28 3, -31 9 Z" fill="#0F172A" />
              {/* Tall Triangular Body */}
              <path
                d="M-21 0 C-17 -14, -4 -17, 7 -13 C16 -8, 25 -1, 28 0 C25 1, 16 8, 7 13 C-4 17, -17 14, -21 0 Z"
                fill="#F8FAFC"
                stroke="#0F172A"
                strokeWidth="0.7"
              />
              {/* Bold Dark Vertical Bands */}
              <path d="M4 -13.5 C8 -4, 8 4, 4 13.5 L-2 14.2 C1 4, 1 -4, -2 -14.2 Z" fill="#0F172A" />
              <path d="M-11 -11.5 C-8 -3, -8 3, -11 11.5 L-17 7.5 C-15 2, -15 -2, -17 -7.5 Z" fill="#0F172A" />
              {/* Warm Golden Saddle Accent */}
              <path d="M-2 -14 C-5 -6, -5 6, -2 14 L-8 12.8 C-10 4, -10 -4, -8 -12.8 Z" fill="#FBBF24" fillOpacity="0.92" />
              {/* Pelvic & Anal Fins */}
              <path d="M0 13 L-9 21 L-4 13 Z" fill="#0F172A" />
              {/* Eye */}
              <circle cx="15" cy="-2" r="2" fill="#0F172A" />
              <circle cx="15.5" cy="-2.5" r="0.65" fill="#FFFFFF" />
            </g>
          )}
        </g>
      </g>
    </g>
  );
};

export const SimulatorAquarium: React.FC<SimulatorAquariumProps> = ({
  params,
  simResult,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const isBleached = simResult.coralHealth < 45;
  const isCriticalBleached = simResult.coralHealth < 25;

  // Responsive Ecological Palettes
  const coralTealMain = isCriticalBleached ? '#DCE4E8' : isBleached ? '#B8C9CE' : '#2CC4B3';
  const coralTealTip = isCriticalBleached ? '#F1F5F9' : isBleached ? '#E2E8F0' : '#99F6E4';
  const coralWarmMain = isCriticalBleached ? '#CFD8DD' : isBleached ? '#D6DFE3' : '#F4727E';
  const coralWarmTip = isCriticalBleached ? '#E2E8F0' : isBleached ? '#F1F5F9' : '#FECDD3';
  const brainCoralTone = isCriticalBleached ? '#CBD5E1' : isBleached ? '#C7D3D8' : '#E0A96D';
  const spongeTone = isCriticalBleached ? '#CBD5E1' : isBleached ? '#B6C6CC' : '#D98270';

  const kelpPrimary = isCriticalBleached ? '#94A39E' : isBleached ? '#6E9187' : isLight ? '#238F77' : '#2F9E84';
  const kelpSecondary = isCriticalBleached ? '#B2BFBA' : isBleached ? '#87A89E' : isLight ? '#38B899' : '#5FD3B3';
  const kelpStipe = isCriticalBleached ? '#647470' : isBleached ? '#4F6E66' : isLight ? '#155C4C' : '#1E6B59';

  const rawFishCount = Math.round(
    (simResult.biodiversityIndex / 100) * FISH_ROSTER.length * (1 - params.fishingPressure / 130)
  );
  const fishCount =
    simResult.overallHealthScore <= 5 || simResult.biodiversityIndex <= 5
      ? 0
      : Math.min(FISH_ROSTER.length, rawFishCount);
  const showTurtle = simResult.biodiversityIndex >= 60 && params.fishingPressure < 55;
  const debrisCount = Math.min(DEBRIS_ITEMS.length, Math.floor(params.plasticPollution / 10));
  const waterTurbidity = Math.min(
    0.62,
    (params.plasticPollution / 100) * 0.42 + (params.waterTemp > 29.2 ? 0.18 : 0)
  );

  const waterBackground = isLight
    ? isCriticalBleached
      ? 'linear-gradient(180deg, #CFE0E4 0%, #96B3BC 52%, #597682 100%)'
      : params.waterTemp > 30
      ? 'linear-gradient(180deg, #BEE5E7 0%, #76B8BF 52%, #397D88 100%)'
      : 'linear-gradient(180deg, #C7F2F4 0%, #6DD4DF 48%, #2496AB 100%)'
    : isCriticalBleached
    ? 'linear-gradient(180deg, #102A34 0%, #091B23 55%, #040D12 100%)'
    : params.waterTemp > 30
    ? 'linear-gradient(180deg, #194A54 0%, #0D2936 55%, #05131B 100%)'
    : 'linear-gradient(180deg, #1E6478 0%, #0E3546 50%, #061822 100%)';

  return (
    <div
      className={`relative rounded-2xl overflow-hidden h-[440px] sm:h-[490px] flex flex-col justify-between p-5 sm:p-6 select-none transition-colors duration-500 ${
        isLight
          ? 'bg-[#C7F2F4] text-[#0B2530] shadow-xl border border-[#0B1E27]/10'
          : 'bg-[#061116] text-[#EDEBE3] shadow-2xl border border-white/10'
      }`}
    >
      {/* Depth Water Column Gradient */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{ background: waterBackground }}
      />

      {/* Murky Turbidity Layer */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          backgroundColor: isLight ? '#788B72' : '#2E4337',
          opacity: isLight ? waterTurbidity * 0.85 : waterTurbidity,
        }}
      />

      {/* Rich Multi-Layered Reef Diorama SVG */}
      <div className="absolute inset-0 pointer-events-none">
        <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
          <defs>
            {/* Sunbeam Gradients */}
            <linearGradient id="sunRayGrad" x1="0" y1="0" x2="0.2" y2="1">
              <stop offset="0%" stopColor={isLight ? '#FFFFFF' : '#E6FAF7'} stopOpacity={isLight ? '0.42' : '0.26'} />
              <stop offset="55%" stopColor={isLight ? '#CCFBF1' : '#82AAA1'} stopOpacity={isLight ? '0.16' : '0.08'} />
              <stop offset="100%" stopColor={isLight ? '#2496AB' : '#061822'} stopOpacity="0" />
            </linearGradient>

            {/* Seabed Gradients */}
            <linearGradient id="farReefGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isLight ? '#48A5B5' : '#0A2936'} />
              <stop offset="100%" stopColor={isLight ? '#2D7F91' : '#051620'} />
            </linearGradient>
            <linearGradient id="midReefGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isLight ? '#368E9E' : '#0D3241'} />
              <stop offset="100%" stopColor={isLight ? '#1E6678' : '#05131C'} />
            </linearGradient>
            <linearGradient id="sandBedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isLight ? '#F2E5C9' : '#163F4C'} />
              <stop offset="45%" stopColor={isLight ? '#DECAA3' : '#0B222C'} />
              <stop offset="100%" stopColor={isLight ? '#C6B087' : '#040D13'} />
            </linearGradient>

            {/* Coral & Sponge Shading Gradients */}
            <linearGradient id="staghornGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={coralTealMain} stopOpacity="0.85" />
              <stop offset="100%" stopColor={coralTealTip} />
            </linearGradient>
            <linearGradient id="warmCoralGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={coralWarmMain} stopOpacity="0.88" />
              <stop offset="100%" stopColor={coralWarmTip} />
            </linearGradient>
            <radialGradient id="brainCoralGrad" cx="45%" cy="35%" r="60%">
              <stop offset="0%" stopColor={coralTealTip} stopOpacity="0.9" />
              <stop offset="55%" stopColor={brainCoralTone} />
              <stop offset="100%" stopColor="#1B3C46" />
            </radialGradient>

            {/* Kelp Blade Gradient */}
            <linearGradient id="kelpGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={kelpStipe} />
              <stop offset="60%" stopColor={kelpPrimary} />
              <stop offset="100%" stopColor={kelpSecondary} />
            </linearGradient>

            {/* Fish Dynamic Gradients */}
            {FISH_ROSTER.map((_, i) => (
              <React.Fragment key={`fish-defs-${i}`}>
                <linearGradient id={`clownGrad-${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FF7A2F" />
                  <stop offset="100%" stopColor="#D94E1F" />
                </linearGradient>
                <linearGradient id={`tangGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
                <linearGradient id={`chromisGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2DD4BF" />
                  <stop offset="60%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#E0F2FE" />
                </linearGradient>
              </React.Fragment>
            ))}
          </defs>

          {/* 1. WATER SURFACE RIPPLES & VOLUMETRIC CAUSTIC RAYS */}
          <path
            d="M0 16 Q100 6 200 16 T400 16 T600 16 T800 16 L800 0 L0 0 Z"
            fill={isLight ? '#FFFFFF' : '#C7F3ED'}
            fillOpacity={isLight ? '0.45' : '0.16'}
          />
          <polygon points="80,0 190,0 320,430 140,430" fill="url(#sunRayGrad)" />
          <polygon points="280,0 370,0 530,430 375,430" fill="url(#sunRayGrad)" opacity="0.85" />
          <polygon points="510,0 630,0 780,430 610,430" fill="url(#sunRayGrad)" opacity="0.65" />

          {/* 2. FAR BACKGROUND REEF SILHOUETTES */}
          <path
            d="M0 440 L0 330 Q90 300 185 340 Q270 370 365 318 Q470 280 570 335 Q675 375 800 315 L800 440 Z"
            fill="url(#farReefGrad)"
            opacity="0.72"
          />

          {/* 3. MID-GROUND REEF SHELF */}
          <path
            d="M0 460 L0 378 Q125 352 240 392 Q350 420 460 368 Q585 330 700 372 L800 356 L800 460 Z"
            fill="url(#midReefGrad)"
            opacity="0.9"
          />

          {/* 4. BACKGROUND GIANT KELP FOREST (Left & Right Clusters) */}
          <g className="animate-sway" style={{ transformOrigin: '80px 430px', animationDuration: '8s' }}>
            {/* Tall Stipe 1 */}
            <path d="M58 435 C52 365, 70 300, 56 225 C48 180, 62 140, 58 108" stroke={kelpStipe} strokeWidth="3.2" fill="none" />
            {/* Frond Blades along Stipe 1 */}
            <path d="M58 370 C36 355, 22 332, 34 316 C45 328, 52 346, 58 362 Z" fill="url(#kelpGrad)" opacity="0.88" />
            <path d="M60 325 C84 308, 102 288, 90 272 C78 286, 68 304, 60 318 Z" fill="url(#kelpGrad)" opacity="0.92" />
            <path d="M59 276 C32 258, 18 236, 30 220 C44 234, 52 252, 59 268 Z" fill="url(#kelpGrad)" opacity="0.85" />
            <path d="M56 224 C82 204, 98 184, 86 168 C74 182, 65 202, 56 216 Z" fill="url(#kelpGrad)" opacity="0.9" />
            <path d="M58 170 C35 152, 24 134, 36 118 C48 132, 54 148, 58 162 Z" fill="url(#kelpGrad)" opacity="0.86" />
            <path d="M58 122 C74 102, 82 86, 70 76 C62 88, 60 104, 58 116 Z" fill="url(#kelpGrad)" opacity="0.82" />
            {/* Gas Bladders (Pneumatocysts) */}
            <circle cx="53" cy="364" r="3" fill={kelpSecondary} />
            <circle cx="64" cy="320" r="3.2" fill={kelpSecondary} />
            <circle cx="54" cy="270" r="2.8" fill={kelpSecondary} />
            <circle cx="61" cy="218" r="2.9" fill={kelpSecondary} />

            {/* Tall Stipe 2 */}
            <path d="M96 440 C106 375, 86 305, 104 240 C112 204, 96 172, 102 146" stroke={kelpStipe} strokeWidth="2.8" fill="none" />
            <path d="M97 388 C118 370, 134 348, 122 334 C110 348, 102 366, 97 380 Z" fill="url(#kelpGrad)" opacity="0.82" />
            <path d="M95 335 C72 318, 60 295, 72 282 C84 296, 90 314, 95 328 Z" fill="url(#kelpGrad)" opacity="0.88" />
            <path d="M98 282 C122 264, 138 242, 126 228 C112 242, 105 262, 98 275 Z" fill="url(#kelpGrad)" opacity="0.85" />
            <path d="M101 232 C80 212, 68 190, 82 178 C92 192, 98 210, 101 224 Z" fill="url(#kelpGrad)" opacity="0.8" />
            <circle cx="101" cy="382" r="2.6" fill={kelpSecondary} />
            <circle cx="91" cy="330" r="2.8" fill={kelpSecondary} />
            <circle cx="103" cy="276" r="2.6" fill={kelpSecondary} />
          </g>

          {/* Right Kelp Cluster */}
          <g className="animate-sway" style={{ transformOrigin: '725px 430px', animationDuration: '9.2s', animationDelay: '-2.5s' }}>
            <path d="M726 435 C714 365, 738 295, 720 220 C710 182, 724 150, 718 124" stroke={kelpStipe} strokeWidth="3" fill="none" />
            <path d="M722 365 C696 346, 684 324, 696 310 C708 324, 716 342, 722 358 Z" fill="url(#kelpGrad)" opacity="0.85" />
            <path d="M725 314 C750 296, 766 274, 754 260 C742 274, 732 292, 725 306 Z" fill="url(#kelpGrad)" opacity="0.88" />
            <path d="M722 262 C698 242, 686 220, 698 206 C710 220, 716 240, 722 254 Z" fill="url(#kelpGrad)" opacity="0.82" />
            <path d="M720 206 C742 186, 756 166, 744 152 C732 166, 726 184, 720 198 Z" fill="url(#kelpGrad)" opacity="0.78" />
            <circle cx="717" cy="358" r="2.8" fill={kelpSecondary} />
            <circle cx="730" cy="308" r="2.8" fill={kelpSecondary} />
            <circle cx="717" cy="256" r="2.6" fill={kelpSecondary} />
          </g>

          {/* 5. DETAILED CORAL REEF ARCHITECTURES */}
          {/* Left Branching Staghorn Coral */}
          <g className="transition-colors duration-700">
            <path
              d="M150 426 L150 356 M150 388 C134 366, 120 348, 114 322 M150 374 C166 352, 182 332, 192 308 M132 355 C124 340, 125 326, 134 316 M172 342 C180 326, 178 310, 168 300 M150 356 C144 334, 148 314, 155 296"
              stroke="url(#staghornGrad)"
              strokeWidth="10.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Growing Tips Highlight */}
            <circle cx="114" cy="322" r="4" fill={coralTealTip} />
            <circle cx="192" cy="308" r="4" fill={coralTealTip} />
            <circle cx="134" cy="316" r="3.5" fill={coralTealTip} />
            <circle cx="168" cy="300" r="3.5" fill={coralTealTip} />
            <circle cx="155" cy="296" r="4" fill={coralTealTip} />
          </g>

          {/* Center-Left Luminous Brain Coral Dome with Labyrinth Grooves */}
          <g transform="translate(365, 405)">
            <path d="M-54 22 C-54 -22, 54 -22, 54 22 Z" fill="url(#brainCoralGrad)" />
            <g stroke="#08242E" strokeOpacity="0.48" strokeWidth="2.4" fill="none" strokeLinecap="round">
              <path d="M-38 14 C-32 4, -22 10, -16 2 C-10 -6, 2 -2, 8 -8" />
              <path d="M-28 2 C-20 -10, -6 -10, 0 -2 C6 6, 18 0, 26 -6" />
              <path d="M-8 14 C2 8, 14 14, 24 6 C32 0, 38 6, 42 14" />
              <path d="M12 -10 C20 -12, 32 -6, 36 2" />
            </g>
          </g>

          {/* Mid-Right Gorgonian Lacy Sea Fan */}
          <g
            className="animate-sway"
            style={{ transformOrigin: '545px 425px', animationDuration: '7.6s', animationDelay: '-1.5s' }}
          >
            <path
              d="M545 426 L545 362 M545 390 C526 372, 512 350, 508 326 M545 384 C564 366, 578 346, 582 322 M545 362 C536 338, 538 316, 546 298 M524 358 C520 342, 524 328, 532 314 M566 354 C570 338, 566 322, 558 308"
              stroke={coralWarmMain}
              strokeWidth="4.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M512 342 C530 334, 560 334, 578 342 M516 326 C534 318, 556 318, 574 326 M528 312 C540 306, 550 306, 562 312"
              stroke={coralWarmTip}
              strokeWidth="1.6"
              strokeOpacity="0.72"
              fill="none"
            />
          </g>

          {/* Right Tiered Table Coral & Tube Sponges */}
          <g>
            {/* Tall Tube Sponges */}
            <path d="M622 426 L618 332 C618 328, 634 328, 634 332 L638 426 Z" fill={spongeTone} />
            <ellipse cx="626" cy="332" rx="8" ry="3.2" fill="#1C0F14" />
            <path d="M645 426 L643 356 C643 353, 657 353, 657 356 L659 426 Z" fill={spongeTone} opacity="0.88" />
            <ellipse cx="650" cy="356" rx="7" ry="2.8" fill="#1C0F14" />

            {/* Tiered Table Coral Shelves */}
            <path d="M674 426 L674 385" stroke={coralWarmMain} strokeWidth="8" strokeLinecap="round" />
            <ellipse cx="674" cy="378" rx="44" ry="9" fill="url(#warmCoralGrad)" />
            <ellipse cx="674" cy="375" rx="34" ry="5" fill={coralWarmTip} fillOpacity="0.45" />
            <ellipse cx="645" cy="396" rx="28" ry="6.5" fill={coralWarmMain} />
          </g>

          {/* 6. LUSH FOREGROUND SEAGRASS MEADOWS */}
          <g className="animate-sway" style={{ transformOrigin: '260px 440px', animationDuration: '6.4s' }}>
            {[
              { x: 215, h: 78, curve: -18, w: 4.5, c: kelpPrimary },
              { x: 226, h: 96, curve: 14, w: 5, c: kelpSecondary },
              { x: 238, h: 84, curve: -12, w: 4.2, c: kelpPrimary },
              { x: 250, h: 108, curve: 18, w: 5.2, c: kelpSecondary },
              { x: 264, h: 92, curve: -15, w: 4.6, c: kelpPrimary },
              { x: 277, h: 76, curve: 12, w: 4, c: kelpSecondary },
              { x: 290, h: 68, curve: -10, w: 3.8, c: kelpPrimary },
            ].map((blade, idx) => (
              <path
                key={`sg-left-${idx}`}
                d={`M${blade.x} 446 Q${blade.x + blade.curve} ${446 - blade.h * 0.55} ${blade.x + blade.curve * 0.65} ${446 - blade.h}`}
                stroke={blade.c}
                strokeWidth={blade.w}
                strokeLinecap="round"
                fill="none"
                opacity="0.9"
              />
            ))}
          </g>

          <g className="animate-sway" style={{ transformOrigin: '465px 442px', animationDuration: '7.1s', animationDelay: '-3s' }}>
            {[
              { x: 438, h: 66, curve: -14, w: 4, c: kelpPrimary },
              { x: 450, h: 88, curve: 16, w: 4.6, c: kelpSecondary },
              { x: 463, h: 96, curve: -12, w: 4.8, c: kelpPrimary },
              { x: 476, h: 74, curve: 14, w: 4.2, c: kelpSecondary },
              { x: 488, h: 60, curve: -8, w: 3.6, c: kelpPrimary },
            ].map((blade, idx) => (
              <path
                key={`sg-mid-${idx}`}
                d={`M${blade.x} 448 Q${blade.x + blade.curve} ${448 - blade.h * 0.55} ${blade.x + blade.curve * 0.65} ${448 - blade.h}`}
                stroke={blade.c}
                strokeWidth={blade.w}
                strokeLinecap="round"
                fill="none"
                opacity="0.88"
              />
            ))}
          </g>

          {/* 7. FOREGROUND SCULPTED SANDY SEABED & CAUSTIC SHIMMER */}
          <path
            d="M0 500 L0 426 Q130 408 260 432 Q400 452 545 418 Q680 392 800 422 L800 500 Z"
            fill="url(#sandBedGrad)"
          />
          <path
            d="M40 456 Q160 442 290 462 Q430 478 580 446 Q690 428 770 442"
            stroke={isLight ? '#FFFFFF' : '#82AAA1'}
            strokeOpacity={isLight ? '0.42' : '0.18'}
            strokeWidth="1.8"
            fill="none"
          />
          {/* Pebbles & Shells on Seabed */}
          <ellipse cx="195" cy="452" rx="10" ry="4.5" fill={isLight ? '#B69D76' : '#1C4654'} />
          <ellipse cx="212" cy="456" rx="6" ry="3" fill={isLight ? '#CEB892' : '#255A6B'} />
          <ellipse cx="515" cy="445" rx="12" ry="5" fill={isLight ? '#A89069' : '#183C49'} />

          {/* 8. BONUS SERENE SEA TURTLE (Only appears in Thriving Waters) */}
          {showTurtle && (
            <g transform="translate(465, 86)">
              <g className="animate-reef-swim" style={{ animationDuration: '14s', animationDelay: '-3s' }}>
                <g transform="scale(-0.92, 0.92)" opacity="0.92">
                  {/* Back Flippers */}
                  <path d="M-24 6 C-34 10, -37 16, -29 17 C-22 17, -18 11, -18 7 Z" fill="#4D7C6F" />
                  {/* Front Flippers */}
                  <path d="M4 7 C-8 22, -20 26, -24 22 C-22 15, -10 8, -2 4 Z" fill="#5D9283" stroke="#1E3A34" strokeWidth="0.8" />
                  <path d="M10 -5 C16 -18, 22 -22, 26 -18 C24 -12, 18 -6, 13 -3 Z" fill="#457064" />
                  {/* Patterned Carapace Shell */}
                  <path
                    d="M-26 2 C-20 -12, 6 -15, 22 -3 C23 2, 16 9, 0 9 C-14 9, -24 6, -26 2 Z"
                    fill="#3D6B5E"
                    stroke="#1E3A34"
                    strokeWidth="1"
                  />
                  {/* Scute Highlights */}
                  <path d="M-14 1 L-4 -6 L8 -5 L14 1 L4 5 L-8 5 Z" fill="#C7B99E" fillOpacity="0.32" stroke="#1E3A34" strokeWidth="0.7" />
                  <path d="M-4 -6 L-2 -11 M8 -5 L10 -10 M-8 5 L-12 7" stroke="#1E3A34" strokeWidth="0.7" />
                  {/* Turtle Head & Eye */}
                  <path d="M20 -2 C28 -5, 36 -2, 36 3 C36 6, 30 8, 21 5 Z" fill="#6AA191" stroke="#1E3A34" strokeWidth="0.8" />
                  <circle cx="31" cy="1" r="1.4" fill="#0B1E27" />
                </g>
              </g>
            </g>
          )}

          {/* 9. DETAILED ANATOMICAL REEF FISH SCHOOL */}
          {FISH_ROSTER.slice(0, fishCount).map((fish, i) => (
            <RenderDetailedFish
              key={`detailed-fish-${i}`}
              fish={fish}
              idx={i}
              stressed={simResult.overallHealthScore < 45}
            />
          ))}

          {/* 10. RISING OXYGEN BUBBLES (When Ecosystem Breathes) */}
          {simResult.overallHealthScore > 30 &&
            BUBBLE_COLUMNS.map((b, idx) => (
              <g
                key={`bubble-${idx}`}
                className="animate-bubble-rise"
                style={{ animationDelay: b.delay, animationDuration: b.dur }}
              >
                <circle
                  cx={b.cx}
                  cy={b.cy}
                  r={b.r}
                  fill={isLight ? '#FFFFFF' : '#E6FAF7'}
                  fillOpacity={isLight ? '0.36' : '0.16'}
                  stroke={isLight ? '#0284C7' : '#C7F3ED'}
                  strokeOpacity={isLight ? '0.52' : '0.5'}
                  strokeWidth="0.8"
                />
                <circle cx={b.cx - b.r * 0.35} cy={b.cy - b.r * 0.35} r={b.r * 0.3} fill="#FFFFFF" fillOpacity="0.85" />
              </g>
            ))}

          {/* 11. DETAILED PLASTIC POLLUTION DEBRIS (Bottles, Ghost Nets, Bags) */}
          {DEBRIS_ITEMS.slice(0, debrisCount).map((item, i) => (
            <g key={`debris-item-${i}`} transform={`translate(${item.x}, ${item.y}) rotate(${item.rot})`}>
              {item.type === 'bottle' && (
                <g opacity="0.82">
                  <rect x="-3" y="-14" width="6" height="4" rx="1" fill="#D98270" />
                  <path
                    d="M-4 -10 L4 -10 L6 -5 L6 12 C6 14, -6 14, -6 12 L-6 -5 Z"
                    fill="#E2E8F0"
                    fillOpacity="0.52"
                    stroke={isLight ? '#1E293B' : '#F8FAFC'}
                    strokeOpacity={isLight ? '0.45' : '0.65'}
                    strokeWidth="0.9"
                  />
                  <rect x="-5.5" y="0" width="11" height="6" fill="#0284C7" fillOpacity="0.4" />
                  <line x1="-4" y1="-3" x2="4" y2="-3" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="0.8" />
                </g>
              )}
              {item.type === 'bag' && (
                <g opacity="0.72">
                  <path
                    d="M-8 -4 C-9 -12, -5 -13, -3 -5 M3 -5 C5 -13, 9 -12, 8 -4"
                    stroke={isLight ? '#1E293B' : '#F8FAFC'}
                    strokeOpacity={isLight ? '0.55' : '0.9'}
                    strokeWidth="1.3"
                    fill="none"
                  />
                  <path
                    d="M-10 -4 C-12 4, -10 14, -3 15 C2 16, 11 13, 10 3 C10 -1, 8 -4, 8 -4 Z"
                    fill="#F1F5F9"
                    fillOpacity="0.45"
                    stroke={isLight ? '#1E293B' : '#FFFFFF'}
                    strokeOpacity={isLight ? '0.48' : '0.55'}
                    strokeWidth="0.9"
                  />
                </g>
              )}
              {item.type === 'net' && (
                <g
                  opacity="0.72"
                  stroke={isLight ? '#334155' : '#CBD5E1'}
                  strokeWidth="1"
                  fill="none"
                >
                  <path d="M-14 -4 Q0 -10 14 -2 M-12 4 Q2 10 15 3 M-10 -8 L-4 10 M0 -9 L4 9 M10 -6 L11 8" />
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Floating Telemetry Readout */}
      <div className="relative z-10 flex items-center justify-between gap-2 text-xs">
        <span className="liquid-glass-hud px-3.5 py-1.5 rounded-full tabular-nums">
          Kesehatan:{' '}
          <strong className={isLight ? 'text-[#0F766E]' : 'text-[#82AAA1]'}>
            {simResult.overallHealthScore}/100
          </strong>
        </span>
        <span className="liquid-glass-hud px-3.5 py-1.5 rounded-full">
          Risiko Pemutihan:{' '}
          <strong
            className={
              simResult.bleachingRisk.includes('Massal') || simResult.bleachingRisk.includes('Kritis')
                ? isLight
                  ? 'text-[#BE123C]'
                  : 'text-[#D98270]'
                : isLight
                ? 'text-[#0F766E]'
                : 'text-[#82AAA1]'
            }
          >
            {simResult.bleachingRisk}
          </strong>
        </span>
      </div>

      {/* Bottom Ecosystem Status Note */}
      <div className="liquid-glass-hud relative z-10 p-4 rounded-2xl space-y-1 text-xs">
        <div
          className={`flex items-center justify-between font-medium ${
            isLight ? 'text-[#0F766E]' : 'text-[#82AAA1]'
          }`}
        >
          <span>Kondisi Ekosistem ({fishCount} Spesies Teramati)</span>
          <span className={isLight ? 'text-[#33515C]' : 'text-[#EDEBE3]/75'}>
            Rantai Makanan: {simResult.trophicCollapseRisk}
          </span>
        </div>
        <p className={isLight ? 'text-[#13333E] leading-relaxed' : 'text-[#EDEBE3]/88 leading-relaxed'}>
          {simResult.statusDescription}
        </p>
      </div>
    </div>
  );
};
