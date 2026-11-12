import React from 'react';
import { Waves, Heart, Globe2, ArrowUpRight } from 'lucide-react';
import { ActiveTab } from './Navbar';

interface FooterProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="bg-[#02080D] text-slate-400 border-t border-white/[0.06] pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/[0.06]">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400">
                <Waves className="w-4 h-4" />
              </div>
              <div>
                <span className="font-display font-medium text-lg tracking-tight text-white block">
                  Ocean Rescue
                </span>
                <span className="text-[11px] block font-mono text-slate-500">
                  SDG 14: Life Below Water
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              &ldquo;The ocean is not ours to destroy. It is ours to protect.&rdquo; Platform edukasi dan konservasi laut interaktif berbasis sains untuk menghubungkan data dengan aksi nyata generasi muda.
            </p>

            {/* Clean unboxed metadata (No pill capsules) */}
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
              <span className="text-teal-400/90">UN SDG 14 Partner</span>
              <span aria-hidden="true">·</span>
              <span>Science-Based Data</span>
              <span aria-hidden="true">·</span>
              <span>Zero-Commercial</span>
            </div>
          </div>

          {/* Eksplorasi Sains */}
          <div>
            <h4 className="font-display font-medium text-sm text-slate-200 mb-3.5">
              Jelajahi Sains
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button 
                  onClick={() => onSelectTab('crisis')} 
                  className="hover:text-teal-300 transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Krisis Ekosistem Laut</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectTab('explorer')} 
                  className="hover:text-teal-300 transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Museum Spesies Laut</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectTab('knowledge')} 
                  className="hover:text-teal-300 transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Pustaka Artikel Sains</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectTab('data')} 
                  className="hover:text-teal-300 transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Grafik & Visualisasi Data</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
            </ul>
          </div>

          {/* Interaktivitas */}
          <div>
            <h4 className="font-display font-medium text-sm text-slate-200 mb-3.5">
              Pengalaman Interaktif
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button 
                  onClick={() => onSelectTab('simulator')} 
                  className="hover:text-teal-300 transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Simulator Ekosistem</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectTab('game')} 
                  className="hover:text-teal-300 transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Ocean Cleanup Mini-Game</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectTab('aqua-ai')} 
                  className="hover:text-teal-300 transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Aqua AI Marine Assistant</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectTab('quiz')} 
                  className="hover:text-teal-300 transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Tantangan Kuis Pengetahuan</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
            </ul>
          </div>

          {/* Aksi & Sumber Ilmiah */}
          <div>
            <h4 className="font-display font-medium text-sm text-slate-200 mb-3.5">
              Aksi & Sumber Riset
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button 
                  onClick={() => onSelectTab('missions')} 
                  className="hover:text-teal-300 transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Misi Konservasi Siswa</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectTab('calculator')} 
                  className="hover:text-teal-300 transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Kalkulator Jejak Plastik</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectTab('dashboard')} 
                  className="hover:text-teal-300 transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>Passport & Pencapaian</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </button>
              </li>
              <li className="pt-2 text-[11px] text-slate-500">
                Rujukan data: NOAA, UNESCO-IOC, UNEP, IPCC, IUCN, FAO.
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits & Integrity */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-teal-400" />
            <span>Dedicated to United Nations Sustainable Development Goal 14 — Life Below Water.</span>
          </div>

          <div className="flex items-center gap-1">
            <span>Dibuat untuk kelestarian biosfer samudra bumi.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
