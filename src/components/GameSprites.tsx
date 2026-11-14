import React from 'react';
import { CompanionKind, HazardKind, LevelEnemyKind } from '../utils/gameRules';

export const renderEnemySprite = (kind: LevelEnemyKind, isBoss: boolean = false) => {
  switch (kind) {
    case 'trawler':
      return (
        <svg viewBox="0 0 120 58" fill="none" className="w-full h-full drop-shadow-lg">
          {/* Trawler Hull */}
          <path
            d="M10 32 L106 32 L95 48 C90 52, 24 52, 18 48 Z"
            fill={isBoss ? '#7A2E26' : '#8A483E'}
            stroke="#EDEBE3"
            strokeWidth="1.6"
          />
          <path d="M16 38 L100 38" stroke="#C7B99E" strokeWidth="1.5" />
          {/* Cabin */}
          <rect x="46" y="13" width="28" height="19" rx="2.5" fill="#EDEBE3" fillOpacity="0.94" />
          <rect x="55" y="17" width="14" height="7" rx="1" fill="#091C25" />
          {isBoss && (
            <>
              <rect x="76" y="20" width="14" height="12" rx="1.5" fill="#C7B99E" />
              <circle cx="83" cy="26" r="2.2" fill="#D98270" />
            </>
          )}
          {/* Mast & Flag */}
          <path d="M58 3 L58 13" stroke="#C7B99E" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M58 4 L76 9 L58 14 Z" fill="#D98270" />
          <path d="M46 23 L18 11 L12 32" stroke="#C7B99E" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4 47 Q13 43 20 48" stroke="#9ED3CA" strokeOpacity="0.75" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );

    case 'plastic_barge':
      return (
        <svg viewBox="0 0 126 60" fill="none" className="w-full h-full drop-shadow-lg">
          {/* Flat Industrial Barge Hull */}
          <path
            d="M8 34 L118 34 L110 50 L16 50 Z"
            fill={isBoss ? '#4E392C' : '#6D5836'}
            stroke="#EDEBE3"
            strokeWidth="1.6"
          />
          <path d="M12 41 L114 41" stroke="#D98270" strokeWidth="2" strokeDasharray="6 4" />
          {/* Stacked Plastic Waste Crates & Barrels */}
          <rect x="20" y="20" width="18" height="14" rx="2" fill="#D98270" stroke="#EDEBE3" strokeWidth="1.2" />
          <rect x="41" y="17" width="20" height="17" rx="2" fill="#82AAA1" fillOpacity="0.85" stroke="#EDEBE3" strokeWidth="1.2" />
          <rect x="64" y="21" width="16" height="13" rx="2" fill="#C7B99E" stroke="#091C25" strokeWidth="1.1" />
          {isBoss && (
            <path d="M48 17 L48 5 L28 12" stroke="#C7B99E" strokeWidth="2.2" strokeLinecap="round" />
          )}
          {/* Bridge Tower */}
          <rect x="84" y="12" width="22" height="22" rx="2" fill="#EDEBE3" fillOpacity="0.9" />
          <rect x="88" y="16" width="12" height="6" rx="1" fill="#091C25" />
        </svg>
      );

    case 'oil_drone':
      return (
        <svg viewBox="0 0 118 60" fill="none" className="w-full h-full drop-shadow-xl">
          {/* Semi-submersible / Drilling Drone Frame */}
          <path
            d="M18 28 L100 28 L92 44 L26 44 Z"
            fill={isBoss ? '#222831' : '#1E313B'}
            stroke="#C7B99E"
            strokeWidth="1.6"
          />
          {/* Pontoons */}
          <rect x="14" y="42" width="30" height="8" rx="4" fill="#394B56" stroke="#EDEBE3" strokeWidth="1.1" />
          <rect x="74" y="42" width="30" height="8" rx="4" fill="#394B56" stroke="#EDEBE3" strokeWidth="1.1" />
          {/* Drilling Derrick Tower */}
          <path d="M50 28 L59 5 L68 28" stroke="#C7B99E" strokeWidth="2" strokeLinejoin="round" />
          <path d="M53 18 L65 18 M55 11 L63 11" stroke="#D98270" strokeWidth="1.6" />
          {/* Toxic Core Glow */}
          <circle cx="59" cy="35" r={isBoss ? 6 : 4.5} fill="#D98270" />
          <circle cx="59" cy="35" r="2.2" fill="#EDEBE3" />
        </svg>
      );

    case 'shark_ship':
      return (
        <svg viewBox="0 0 128 60" fill="none" className="w-full h-full drop-shadow-xl">
          {/* Sleek Armored Interceptor Hull */}
          <path
            d="M8 31 L118 28 L102 47 C90 50, 24 50, 14 44 Z"
            fill={isBoss ? '#2D3A46' : '#3E4E5E'}
            stroke="#EDEBE3"
            strokeWidth="1.6"
          />
          <path d="M18 37 L108 36" stroke="#D98270" strokeWidth="2" />
          {/* Armored Bridge */}
          <path d="M46 30 L54 12 L84 12 L90 30 Z" fill="#17232E" stroke="#C7B99E" strokeWidth="1.4" />
          <rect x="62" y="16" width="18" height="6" rx="1" fill="#D98270" />
          {/* Bow Harpoon Launcher */}
          <path d="M98 28 L118 20" stroke="#C7B99E" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M115 17 L122 19 L117 24 Z" fill="#D98270" />
          {isBoss && (
            <path d="M30 28 L30 14 L42 18" stroke="#D98270" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      );

    case 'abyss_dredger':
      return (
        <svg viewBox="0 0 132 66" fill="none" className="w-full h-full drop-shadow-2xl">
          {/* Deep-Sea Mechanical Dredger Leviathan */}
          <path
            d="M16 26 C30 12, 98 12, 114 26 L104 48 C88 56, 40 56, 24 48 Z"
            fill={isBoss ? '#160F1D' : '#1B2230'}
            stroke="#D98270"
            strokeWidth="1.8"
          />
          {/* Mechanical Claws & Cutter Head */}
          <path d="M24 42 L10 56 M104 42 L118 56" stroke="#C7B99E" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="10" cy="56" r="3.5" fill="#D98270" />
          <circle cx="118" cy="56" r="3.5" fill="#D98270" />
          {/* Reactor Eyes */}
          <circle cx="48" cy="30" r="4.5" fill="#D98270" />
          <circle cx="66" cy="27" r={isBoss ? 6.5 : 5} fill="#C7B99E" stroke="#D98270" strokeWidth="2" />
          <circle cx="84" cy="30" r="4.5" fill="#D98270" />
          {/* Toxic Exhaust Chimneys */}
          <rect x="42" y="8" width="8" height="10" rx="1.5" fill="#4E394B" stroke="#C7B99E" strokeWidth="1" />
          <rect x="82" y="8" width="8" height="10" rx="1.5" fill="#4E394B" stroke="#C7B99E" strokeWidth="1" />
        </svg>
      );
  }
};

export const renderHazardSprite = (kind: HazardKind) => {
  switch (kind) {
    case 'trap_net':
      return (
        <svg viewBox="0 0 44 44" fill="none" className="w-full h-full">
          <path
            d="M8 10 Q22 5 36 10 Q34 34 22 38 Q10 34 8 10 Z"
            fill="#D98270"
            fillOpacity="0.35"
            stroke="#D98270"
            strokeWidth="2"
          />
          <path d="M12 14 L32 30 M12 30 L32 14 M22 8 L22 36" stroke="#EDEBE3" strokeWidth="1.4" />
        </svg>
      );

    case 'toxic_barrel':
      return (
        <svg viewBox="0 0 44 44" fill="none" className="w-full h-full">
          <rect x="11" y="7" width="22" height="30" rx="4" fill="#D98270" stroke="#EDEBE3" strokeWidth="1.8" />
          <path d="M11 16 L33 16 M11 28 L33 28" stroke="#061116" strokeWidth="1.8" />
          <circle cx="22" cy="22" r="3.5" fill="#C7B99E" />
        </svg>
      );

    case 'oil_glob':
      return (
        <svg viewBox="0 0 44 44" fill="none" className="w-full h-full">
          <path
            d="M22 6 C30 14, 36 21, 34 29 C32 36, 12 36, 10 29 C8 21, 14 14, 22 6 Z"
            fill="#1A1E24"
            stroke="#D98270"
            strokeWidth="2.2"
          />
          <circle cx="19" cy="24" r="3" fill="#D98270" fillOpacity="0.85" />
          <circle cx="26" cy="28" r="1.6" fill="#C7B99E" />
        </svg>
      );

    case 'harpoon':
      return (
        <svg viewBox="0 0 48 44" fill="none" className="w-full h-full">
          <path d="M8 34 L36 10" stroke="#EDEBE3" strokeWidth="3" strokeLinecap="round" />
          <path d="M39 7 L36 18 L28 11 Z" fill="#D98270" stroke="#EDEBE3" strokeWidth="1.2" />
          <path d="M6 36 L14 34 L10 28 Z" fill="#C7B99E" />
        </svg>
      );

    case 'abyss_mine':
      return (
        <svg viewBox="0 0 44 44" fill="none" className="w-full h-full">
          <path
            d="M22 4 L22 40 M4 22 L40 22 M9 9 L35 35 M35 9 L9 35"
            stroke="#C7B99E"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="22" cy="22" r="10" fill="#2A1B2E" stroke="#D98270" strokeWidth="2.2" />
          <circle cx="22" cy="22" r="4" fill="#D98270" />
        </svg>
      );
  }
};

export const renderCompanionSprite = (id: CompanionKind) => {
  switch (id) {
    case 'nemo':
      return (
        <svg viewBox="0 0 72 48" fill="none" className="w-full h-full drop-shadow-[0_0_10px_rgba(217,130,112,0.5)]">
          {/* Clownfish facing RIGHT */}
          <path d="M18 24 L4 14 L8 24 L4 34 Z" fill="#E67A5B" stroke="#EDEBE3" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M32 13 Q37 4 44 13" fill="#E67A5B" stroke="#EDEBE3" strokeWidth="1.2" />
          <path
            d="M17 24 C27 9, 55 11, 63 24 C55 37, 27 39, 17 24 Z"
            fill="#E67A5B"
            stroke="#EDEBE3"
            strokeWidth="1.7"
          />
          {/* Iconic White Stripes */}
          <path d="M29 12 Q34 24 29 36" stroke="#EDEBE3" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M44 13 Q49 24 44 35" stroke="#EDEBE3" strokeWidth="4.2" strokeLinecap="round" />
          <circle cx="55.5" cy="21" r="2.2" fill="#061116" />
          <circle cx="56.2" cy="20.2" r="0.8" fill="#EDEBE3" />
        </svg>
      );

    case 'green_turtle':
      return (
        <svg viewBox="0 0 80 64" fill="none" className="w-full h-full drop-shadow-[0_0_10px_rgba(130,170,161,0.5)]">
          {/* Flippers */}
          <path d="M25 22 C16 10, 8 15, 20 26 Z" fill="#82AAA1" stroke="#EDEBE3" strokeWidth="1.1" />
          <path d="M48 21 C59 7, 68 14, 54 25 Z" fill="#82AAA1" stroke="#EDEBE3" strokeWidth="1.1" />
          <path d="M25 42 C16 54, 8 49, 20 38 Z" fill="#82AAA1" stroke="#EDEBE3" strokeWidth="1.1" />
          <path d="M48 43 C59 57, 68 50, 54 39 Z" fill="#82AAA1" stroke="#EDEBE3" strokeWidth="1.1" />
          {/* Shell & Head facing RIGHT */}
          <ellipse cx="38" cy="32" rx="20" ry="15" fill="#2A7A76" stroke="#9ED3CA" strokeWidth="2" />
          <path d="M28 26 L46 26 L50 32 L46 38 L28 38 L24 32 Z" stroke="#C7B99E" strokeWidth="1.3" fill="none" />
          <circle cx="63" cy="32" r="8" fill="#82AAA1" stroke="#EDEBE3" strokeWidth="1.4" />
          <circle cx="66" cy="29.5" r="1.6" fill="#061116" />
          <circle cx="66.5" cy="29" r="0.55" fill="#EDEBE3" />
        </svg>
      );

    case 'manta_ray':
      return (
        <svg viewBox="0 0 88 68" fill="none" className="w-full h-full drop-shadow-[0_0_12px_rgba(158,211,202,0.55)]">
          {/* Whip Tail */}
          <path d="M22 34 L2 34" stroke="#9ED3CA" strokeWidth="2.4" strokeLinecap="round" />
          {/* Sweeping Winged Manta Body facing RIGHT */}
          <path
            d="M68 27 L76 23 L70 30 C74 32, 74 36, 70 38 L76 45 L68 41 C56 49, 44 63, 32 62 C36 48, 30 40, 20 34 C30 28, 36 20, 32 6 C44 5, 56 19, 68 27 Z"
            fill="#1D6664"
            stroke="#9ED3CA"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M36 22 Q48 34 36 46" stroke="#C7B99E" strokeOpacity="0.7" strokeWidth="1.5" fill="none" />
          <circle cx="65" cy="29" r="1.6" fill="#EDEBE3" />
          <circle cx="65" cy="39" r="1.6" fill="#EDEBE3" />
        </svg>
      );

    case 'orca':
      return (
        <svg viewBox="0 0 96 58" fill="none" className="w-full h-full drop-shadow-[0_0_12px_rgba(237,235,227,0.4)]">
          {/* Dorsal Fin & Fluke */}
          <path d="M46 18 L39 3 L55 17 Z" fill="#0D202A" stroke="#9ED3CA" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M18 31 L4 21 L9 31 L4 41 Z" fill="#0D202A" stroke="#9ED3CA" strokeWidth="1.4" strokeLinejoin="round" />
          {/* Streamlined Killer Whale Body facing RIGHT */}
          <path
            d="M16 31 C28 14, 68 12, 88 28 C91 31, 88 37, 74 39 C54 42, 32 41, 16 31 Z"
            fill="#0D202A"
            stroke="#EDEBE3"
            strokeWidth="1.6"
          />
          {/* Classic Orca White Belly & Eye Patch */}
          <path d="M32 37 C50 40, 68 39, 82 34 C72 32, 54 32, 42 35 Z" fill="#EDEBE3" />
          <ellipse cx="71" cy="24" rx="6.5" ry="3" transform="rotate(-12 71 24)" fill="#EDEBE3" />
          <circle cx="79" cy="27" r="1.5" fill="#9ED3CA" />
        </svg>
      );

    case 'kraken':
      return (
        <svg viewBox="0 0 96 76" fill="none" className="w-full h-full drop-shadow-[0_0_15px_rgba(130,170,161,0.65)]">
          {/* Swirling Abyssal Tentacles trailing behind */}
          <path d="M36 30 C22 18, 12 12, 4 18" stroke="#367D7B" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M34 36 C18 32, 8 28, 3 34" stroke="#82AAA1" strokeWidth="4" strokeLinecap="round" />
          <path d="M34 42 C20 44, 10 49, 4 46" stroke="#367D7B" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M36 48 C24 58, 12 64, 6 58" stroke="#82AAA1" strokeWidth="3.8" strokeLinecap="round" />
          <path d="M44 50 C34 62, 24 70, 16 68" stroke="#C7B99E" strokeWidth="3" strokeLinecap="round" />
          {/* Armored Kraken Mantle facing RIGHT */}
          <path
            d="M36 38 C36 20, 56 12, 78 22 C92 28, 92 48, 78 54 C56 64, 36 56, 36 38 Z"
            fill="#1D5C5B"
            stroke="#9ED3CA"
            strokeWidth="2"
          />
          {/* Mantle Fins */}
          <path d="M74 20 L88 14 L84 26 Z" fill="#82AAA1" stroke="#EDEBE3" strokeWidth="1.1" />
          <path d="M74 56 L88 62 L84 50 Z" fill="#82AAA1" stroke="#EDEBE3" strokeWidth="1.1" />
          {/* Bioluminescent Eyes & Crown Markings */}
          <path d="M54 30 Q64 38 54 46" stroke="#C7B99E" strokeWidth="1.8" fill="none" />
          <circle cx="64" cy="31" r="3" fill="#EDEBE3" />
          <circle cx="65" cy="31" r="1.4" fill="#D98270" />
          <circle cx="64" cy="45" r="3" fill="#EDEBE3" />
          <circle cx="65" cy="45" r="1.4" fill="#D98270" />
        </svg>
      );
  }
};
