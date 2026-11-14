import React from 'react';
import { Globe2, ArrowUpRight } from 'lucide-react';
import { ActiveTab } from './Navbar';

interface FooterProps {
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAquaChat: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onOpenAquaChat }) => {
  return (
    <footer className="bg-[var(--bg-surface)] text-[var(--text-secondary)] border-t border-[var(--border-hairline)] pt-16 pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[var(--border-hairline)]">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <svg
                viewBox="0 0 28 28"
                fill="none"
                className="w-8 h-8 shrink-0 text-[var(--accent-teal)]"
                aria-hidden="true"
              >
                <circle cx="14" cy="14" r="11.5" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.2" />
                <path
                  d="M5.5 15.5C8.5 12.8 11.2 12.8 14 15.2C16.8 17.6 19.5 17.4 22.5 14.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <path
                  d="M8 19C10.5 17.4 12.8 17.4 15 19C17 20.4 19 20.2 21 18.6"
                  stroke="var(--accent-sand)"
                  strokeOpacity="0.8"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <circle cx="14" cy="8.5" r="1.35" fill="var(--accent-sand)" />
              </svg>
              <div className="flex flex-col">
                <div className="flex items-center gap-2.5">
                  <span className="font-display font-semibold text-lg tracking-tight text-[var(--text-primary)] whitespace-nowrap">
                    Ocean Rescue
                  </span>
                  <span className="h-3.5 w-px bg-[var(--border-strong)]" aria-hidden="true" />
                  <span className="text-[10px] font-sans font-semibold tracking-[0.22em] uppercase text-[var(--accent-sand)] whitespace-nowrap">
                    SDG 14
                  </span>
                </div>
                <span className="text-[11px] font-sans tracking-[0.06em] text-[var(--text-muted)] mt-0.5">
                  Life Below Water
                </span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm">
              &ldquo;The ocean is not ours to destroy. It is ours to protect.&rdquo; Platform edukasi dan konservasi laut berbasis sains untuk menghubungkan data samudra dengan aksi nyata.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
              <span className="text-[var(--accent-teal)] font-medium">UN SDG 14</span>
              <span aria-hidden="true">·</span>
              <span>Science-Based Baseline</span>
              <span aria-hidden="true">·</span>
              <span>Non-Commercial Education</span>
            </div>
          </div>

          {/* Eksplorasi Sains */}
          <div>
            <h4 className="font-display font-medium text-sm text-[var(--text-primary)] mb-3.5">
              Jelajahi Sains
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('tracker')}
                  className="hover:text-[var(--text-primary)] transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Global Plastic Tracker</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('crisis')}
                  className="hover:text-[var(--text-primary)] transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Krisis Ekosistem Laut</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('explorer')}
                  className="hover:text-[var(--text-primary)] transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Museum Biota Samudra</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('news')}
                  className="hover:text-[var(--text-primary)] transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Berita Kelautan</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('knowledge')}
                  className="hover:text-[var(--text-primary)] transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Pustaka Artikel Sains</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('data')}
                  className="hover:text-[var(--text-primary)] transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Grafik &amp; Visualisasi Data</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
            </ul>
          </div>

          {/* Interaktivitas */}
          <div>
            <h4 className="font-display font-medium text-sm text-[var(--text-primary)] mb-3.5">
              Laboratorium &amp; Game
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('simulator')}
                  className="hover:text-[var(--text-primary)] transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Simulator Ekosistem</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('game')}
                  className="hover:text-[var(--text-primary)] transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Ocean Cleanup Mini-Game</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAquaChat}
                  className="hover:text-[var(--text-primary)] transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Aqua AI Riset Kelautan</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('quiz')}
                  className="hover:text-[var(--text-primary)] transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Tantangan Kuis Sains</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
            </ul>
          </div>

          {/* Aksi & Sumber Ilmiah */}
          <div>
            <h4 className="font-display font-medium text-sm text-[var(--text-primary)] mb-3.5">
              Aksi &amp; Rujukan
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('missions')}
                  className="hover:text-[var(--text-primary)] transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Misi Konservasi Siswa</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('calculator')}
                  className="hover:text-[var(--text-primary)] transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Kalkulator Jejak Plastik</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('dashboard')}
                  className="hover:text-[var(--text-primary)] transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Passport &amp; Pencapaian</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li className="pt-2 text-[11px] text-[var(--text-muted)] leading-relaxed">
                Rujukan: NOAA, NASA Earthdata, Copernicus Marine, UNESCO-IOC, GOOS, Open-Meteo, UNEP, IPCC.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Integrity */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-4">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-[var(--accent-teal)]" />
            <span>Dedicated to United Nations Sustainable Development Goal 14 — Life Below Water.</span>
          </div>

          <div className="flex items-center gap-1">
            <span>Untuk kelestarian biosfer samudra bumi.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
