import React from 'react';
import { ThemeMode } from '../hooks/useTheme';

interface OceanEcosystemBackdropProps {
  backgroundTheme: string;
  currentDirection: 1 | -1;
  levelNumber: number;
  theme?: ThemeMode;
}

const LIGHT_OCEAN_GRADIENTS: Record<number, string> = {
  1: 'from-[#E2F3F1] via-[#A6D7D4] to-[#478D90]',
  2: 'from-[#DDF0EE] via-[#92CCC8] to-[#3B7F85]',
  3: 'from-[#D7ECEE] via-[#83C0C7] to-[#32717E]',
  4: 'from-[#CFE6EC] via-[#75B4C2] to-[#295E72]',
  5: 'from-[#C8DFEA] via-[#66A4B8] to-[#214D63]',
};

export const OceanEcosystemBackdrop: React.FC<OceanEcosystemBackdropProps> = ({
  backgroundTheme,
  currentDirection,
  levelNumber,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const isDeepZone = levelNumber >= 4;
  const activeGradient = isDark
    ? backgroundTheme
    : LIGHT_OCEAN_GRADIENTS[levelNumber] || LIGHT_OCEAN_GRADIENTS[1];

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* 1. Dynamic Ocean Depth Column Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${activeGradient} transition-colors duration-500`} />

      {/* 2. Surface Horizon & Shimmering Waterline (Boat Patrol Zone) */}
      <div
        className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${
          isDark
            ? 'from-[#9ED3CA]/22 via-[#367D7B]/10 to-transparent'
            : 'from-white/55 via-[#B9E6E2]/25 to-transparent'
        }`}
      />
      <svg
        viewBox="0 0 1200 72"
        preserveAspectRatio="none"
        className={`absolute inset-x-0 top-10 w-full h-12 ${isDark ? 'opacity-45' : 'opacity-65'}`}
      >
        <path
          d="M0 36 Q150 22 300 36 T600 36 T900 36 T1200 36 L1200 72 L0 72 Z"
          fill="url(#surfaceWaveGrad)"
        />
        <path
          d="M0 36 Q150 22 300 36 T600 36 T900 36 T1200 36"
          stroke={isDark ? '#9ED3CA' : '#FFFFFF'}
          strokeOpacity={isDark ? 0.45 : 0.72}
          strokeWidth="1.8"
          fill="none"
        />
        <path
          d="M0 44 Q180 32 360 44 T720 44 T1080 44 T1200 44"
          stroke={isDark ? '#82AAA1' : '#267472'}
          strokeOpacity={isDark ? 0.25 : 0.35}
          strokeWidth="1.2"
          fill="none"
        />
        <defs>
          <linearGradient id="surfaceWaveGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#82AAA1' : '#FFFFFF'} stopOpacity={isDark ? 0.16 : 0.32} />
            <stop offset="100%" stopColor={isDark ? '#091C25' : '#478D90'} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* 3. Volumetric Sunlight Shafts Penetrating Depth */}
      <div
        className={`absolute -top-8 left-[14%] w-44 h-[78%] bg-gradient-to-b ${
          isDark ? 'from-[#EDEBE3]/14 via-[#82AAA1]/6' : 'from-white/45 via-[#D5F3F0]/18'
        } to-transparent blur-xl transform -rotate-12 ${
          isDeepZone && isDark ? 'opacity-30' : 'opacity-80'
        }`}
      />
      <div
        className={`absolute -top-12 left-[46%] w-56 h-[82%] bg-gradient-to-b ${
          isDark ? 'from-[#9ED3CA]/12 via-[#367D7B]/6' : 'from-white/40 via-[#CBEAE7]/18'
        } to-transparent blur-2xl transform -rotate-6 ${
          isDeepZone && isDark ? 'opacity-25' : 'opacity-75'
        }`}
      />
      <div
        className={`absolute -top-8 right-[12%] w-36 h-[74%] bg-gradient-to-b ${
          isDark ? 'from-[#EDEBE3]/10 via-[#82AAA1]/5' : 'from-white/38 via-[#D5F3F0]/15'
        } to-transparent blur-xl transform rotate-6 ${
          isDeepZone && isDark ? 'opacity-20' : 'opacity-70'
        }`}
      />

      {/* 4. Ocean Current Flow Streamlines (Visualizing Drift Direction) */}
      <svg
        viewBox="0 0 1000 400"
        preserveAspectRatio="none"
        className={`absolute inset-0 w-full h-full ${isDark ? 'opacity-25' : 'opacity-35'} ${
          currentDirection === -1 ? '-scale-x-100' : ''
        }`}
      >
        <path
          d="M40 120 Q260 100 480 124 T960 118"
          stroke={isDark ? '#82AAA1' : '#13484E'}
          strokeWidth="1.2"
          strokeDasharray="10 14"
          fill="none"
          className="animate-current-flow"
        />
        <path
          d="M-20 205 Q220 225 520 198 T980 212"
          stroke={isDark ? '#9ED3CA' : '#1D6664'}
          strokeWidth="1"
          strokeDasharray="7 16"
          fill="none"
          className="animate-current-flow"
        />
        <path
          d="M60 290 Q320 272 600 296 T990 282"
          stroke={isDark ? '#82AAA1' : '#13484E'}
          strokeWidth="1.1"
          strokeDasharray="12 18"
          fill="none"
          className="animate-current-flow"
        />
      </svg>

      {/* 5. Distant Ambient Fish Schools & Marine Snow */}
      <div className="marine-snow-layer absolute inset-0 opacity-35" />
      <svg
        viewBox="0 0 1200 460"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full opacity-28"
      >
        {/* Distant Schooling Silhouettes */}
        <g className="animate-reef-swim" fill={isDark ? '#82AAA1' : '#154D54'} fillOpacity="0.42">
          <path d="M160 165 Q172 159 182 165 Q172 171 160 165 L154 160 L154 170 Z" />
          <path d="M185 154 Q195 149 203 154 Q195 159 185 154 L180 150 L180 158 Z" />
          <path d="M192 174 Q201 169 210 174 Q201 179 192 174 L187 170 L187 178 Z" />
          <path d="M214 162 Q222 158 229 162 Q222 166 214 162 L210 159 L210 165 Z" />
        </g>

        <g className="animate-reef-swim [animation-delay:-4s]" fill={isDark ? '#9ED3CA' : '#1D6664'} fillOpacity="0.34">
          <path d="M840 225 Q830 220 822 225 Q830 230 840 225 L846 221 L846 229 Z" />
          <path d="M862 214 Q852 209 844 214 Q852 219 862 214 L868 210 L868 218 Z" />
          <path d="M876 232 Q867 228 859 232 Q867 236 876 232 L881 229 L881 235 Z" />
        </g>
      </svg>

      {/* 6. Seabed Rising Micro-Bubbles */}
      <div className="absolute bottom-8 left-[18%] w-2 h-2 rounded-full bg-white/55 dark:bg-[#9ED3CA]/45 animate-bubble-rise" />
      <div className="absolute bottom-10 left-[44%] w-1.5 h-1.5 rounded-full bg-white/50 dark:bg-[#EDEBE3]/40 animate-bubble-rise [animation-delay:-2.3s]" />
      <div className="absolute bottom-7 left-[76%] w-2 h-2 rounded-full bg-white/55 dark:bg-[#82AAA1]/45 animate-bubble-rise [animation-delay:-4.1s]" />

      {/* 7. Detailed Layered Coral Reef & Kelp Seabed Ecosystem */}
      <svg
        viewBox="0 0 1200 220"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 bottom-0 w-full h-44 sm:h-52"
      >
        <defs>
          <linearGradient id="seabedFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#123847' : '#2C7278'} stopOpacity="0.6" />
            <stop offset="100%" stopColor={isDark ? '#051016' : '#194A53'} stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="seabedNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#0E2D3B' : '#235E66'} stopOpacity="0.92" />
            <stop offset="100%" stopColor={isDark ? '#030B10' : '#143E46'} stopOpacity="1" />
          </linearGradient>
          <linearGradient id="kelpGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#1D6664" />
            <stop offset="100%" stopColor={isDark ? '#82AAA1' : '#4E9A94'} stopOpacity="0.88" />
          </linearGradient>
          <linearGradient id="coralCoralGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#8A483E" />
            <stop offset="100%" stopColor="#D98270" stopOpacity="0.92" />
          </linearGradient>
          <linearGradient id="coralSandGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#6D5836" />
            <stop offset="100%" stopColor="#C7B99E" stopOpacity="0.88" />
          </linearGradient>
        </defs>

        {/* Distant Reef Ridge Silhouette */}
        <path
          d="M0 165 Q120 120 260 150 T540 138 T850 152 T1100 132 L1200 148 L1200 220 L0 220 Z"
          fill="url(#seabedFar)"
        />

        {/* Swaying Giant Kelp & Seagrass Clusters (Left & Right Reef Edges) */}
        <g className="animate-sway origin-bottom">
          <path d="M72 205 C62 160, 86 125, 68 78 C84 102, 86 146, 80 205 Z" fill="url(#kelpGrad)" fillOpacity="0.65" />
          <path d="M92 208 C108 165, 86 118, 102 68 C88 100, 82 148, 86 208 Z" fill="url(#kelpGrad)" fillOpacity="0.5" />
          <path d="M114 210 C124 176, 114 142, 128 112 C112 135, 108 172, 108 210 Z" fill="url(#kelpGrad)" fillOpacity="0.45" />
        </g>

        <g className="animate-sway origin-bottom [animation-delay:-3s]">
          <path d="M1070 206 C1058 158, 1084 114, 1068 64 C1084 96, 1086 144, 1078 206 Z" fill="url(#kelpGrad)" fillOpacity="0.6" />
          <path d="M1094 210 C1110 168, 1090 126, 1106 84 C1092 112, 1086 154, 1088 210 Z" fill="url(#kelpGrad)" fillOpacity="0.5" />
          <path d="M1118 212 C1132 182, 1122 146, 1138 118 C1120 142, 1112 178, 1112 212 Z" fill="url(#kelpGrad)" fillOpacity="0.45" />
        </g>

        {/* Midground Swaying Seagrass */}
        <g className="animate-sway origin-bottom [animation-delay:-1.7s]" fill="#367D7B" fillOpacity="0.48">
          <path d="M365 205 Q352 170 368 140 Q366 172 374 205 Z" />
          <path d="M378 205 Q390 166 378 134 Q374 168 386 205 Z" />
          <path d="M770 208 Q758 174 774 145 Q772 175 778 208 Z" />
          <path d="M784 208 Q798 170 784 138 Q778 172 792 208 Z" />
        </g>

        {/* Branching Staghorn Coral Formations */}
        <g stroke="url(#coralCoralGrad)" strokeLinecap="round" fill="none">
          <path d="M195 202 L195 162 M195 178 L174 150 M174 150 L165 135 M174 150 L185 136 M195 168 L216 142 M216 142 L226 128 M216 142 L206 126" strokeWidth="6" />
          <path d="M895 204 L895 168 M895 182 L875 156 M875 156 L866 142 M895 174 L916 148 M916 148 L926 135" strokeWidth="5.5" />
        </g>

        {/* Sand-Gold Sea Fan & Branching Tubes */}
        <g stroke="url(#coralSandGrad)" strokeLinecap="round" fill="none" opacity="0.82">
          <path d="M510 206 L510 176 M510 186 L494 164 M510 180 L526 158 M494 164 L486 152 M526 158 L534 146" strokeWidth="4.5" />
          <path d="M655 208 L655 182 M645 208 L642 188 M665 208 L668 186" strokeWidth="6.5" />
        </g>

        {/* Sculpted Brain Coral Mounds */}
        <ellipse cx="290" cy="196" rx="34" ry="20" fill="#23575C" stroke="#82AAA1" strokeOpacity="0.35" strokeWidth="1.2" />
        <path d="M268 194 Q282 186 294 195 T314 193" stroke="#82AAA1" strokeOpacity="0.45" strokeWidth="1.4" fill="none" />
        <ellipse cx="985" cy="198" rx="38" ry="22" fill="#2A4F5A" stroke="#C7B99E" strokeOpacity="0.3" strokeWidth="1.2" />
        <path d="M960 196 Q976 187 992 197 T1012 194" stroke="#C7B99E" strokeOpacity="0.4" strokeWidth="1.4" fill="none" />

        {/* Glowing Teal Anemone Tentacles */}
        <g stroke="#82AAA1" strokeOpacity="0.65" strokeWidth="2.4" strokeLinecap="round" fill="none">
          <path d="M432 202 Q424 185 418 176" />
          <path d="M438 202 Q436 183 434 172" />
          <path d="M444 202 Q448 183 452 173" />
          <path d="M450 202 Q458 186 465 178" />
        </g>

        {/* Foreground Seabed Sandy Terrace & Reef Boulders */}
        <path
          d="M0 196 Q160 182 320 198 T680 192 T980 200 L1200 188 L1200 220 L0 220 Z"
          fill="url(#seabedNear)"
        />
        <ellipse cx="145" cy="208" rx="45" ry="12" fill="#0B232E" />
        <ellipse cx="590" cy="210" rx="58" ry="14" fill="#0B232E" />
        <ellipse cx="835" cy="208" rx="42" ry="11" fill="#091C25" />
      </svg>
    </div>
  );
};
