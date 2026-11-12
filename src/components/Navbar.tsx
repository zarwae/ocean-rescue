import React, { useState, useEffect } from 'react';
import { 
  Waves, 
  Menu, 
  X, 
  Volume2, 
  VolumeX, 
  AlertTriangle,
  Compass,
  Activity,
  Gamepad2,
  CheckSquare,
  Sparkles
} from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

export type ActiveTab = 
  | 'home'
  | 'crisis'
  | 'explorer'
  | 'simulator'
  | 'game'
  | 'aqua-ai'
  | 'knowledge'
  | 'calculator'
  | 'missions'
  | 'dashboard'
  | 'quiz'
  | 'data';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  levelTitle: string;
  levelNumber: number;
  totalXp: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  levelTitle,
  levelNumber,
  totalXp,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSound = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    soundEffects.isMuted = newState;
    if (!newState) {
      soundEffects.playBubblePop();
    }
  };

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const primaryNavItems: { tab: ActiveTab; label: string }[] = [
    { tab: 'home', label: 'Beranda' },
    { tab: 'crisis', label: 'Krisis Laut' },
    { tab: 'explorer', label: 'Biota Samudra' },
    { tab: 'simulator', label: 'Simulator' },
    { tab: 'game', label: 'Game Bersih' },
    { tab: 'missions', label: 'Aksi Nyata' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#040D14]/90 backdrop-blur-xl border-b border-white/[0.07] py-3.5 shadow-lg shadow-black/20' 
          : 'bg-gradient-to-b from-[#02080D]/90 via-[#040D14]/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8">
          
          {/* Zone 1: Single Wordmark Brand */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded-lg group shrink-0"
            aria-label="OCEAN RESCUE Home"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400 group-hover:border-teal-400/60 transition-colors">
              <Waves className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-medium text-lg tracking-tight text-slate-100 whitespace-nowrap">
                Ocean Rescue
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono text-teal-400/80">
                SDG 14
              </span>
            </div>
          </button>

          {/* Zone 2: Clean, Concise Nav Links with Subtle Hover */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium" aria-label="Main Navigation">
            {primaryNavItems.map(({ tab, label }) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => handleNavClick(tab)}
                  className={`relative py-1 whitespace-nowrap transition-colors cursor-pointer ${
                    isActive 
                      ? 'text-teal-300 font-semibold' 
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <span>{label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-300 rounded-full" />
                  )}
                </button>
              );
            })}

            {/* Subtle More Hub button */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`py-1 text-sm whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'text-teal-300 font-semibold' 
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Dashboard
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action + Quiet Audio & XP Info */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {/* Audio Ambient Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg text-slate-400 hover:text-teal-300 hover:bg-white/[0.04] transition-colors focus-visible:outline-none"
              title={isMuted ? 'Nyalakan Audio Kelautan' : 'Bisukan Suara'}
              aria-label={isMuted ? 'Nyalakan Audio' : 'Bisukan Suara'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
            </button>

            {/* Discreet XP Indicator */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 cursor-pointer flex items-center gap-1.5"
              title="Buka profil dan pencapaian"
            >
              <span className="text-slate-500">Lvl {levelNumber}</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-teal-300 tabular-nums">{totalXp} XP</span>
            </button>

            {/* Single Primary Action Button */}
            <button
              onClick={() => handleNavClick('missions')}
              className="px-4 py-2 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold text-xs tracking-wide shadow-sm shadow-teal-500/20 transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              Mulai Aksi
            </button>
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-2 text-slate-400 hover:text-teal-300"
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-200 hover:text-white"
              aria-label="Buka Menu Navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#040D14]/98 border-b border-white/[0.08] px-4 pt-3 pb-6 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between py-3 border-b border-white/[0.08] mb-3">
            <div className="text-xs font-mono text-slate-400">
              Level {levelNumber} · <span className="text-teal-400 font-semibold">{totalXp} XP</span>
            </div>
            <button
              onClick={() => handleNavClick('dashboard')}
              className="text-xs text-teal-400 font-medium"
            >
              Lihat Profil →
            </button>
          </div>

          <div className="space-y-1">
            {primaryNavItems.map(({ tab, label }) => (
              <button
                key={tab}
                onClick={() => handleNavClick(tab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left ${
                  activeTab === tab 
                    ? 'text-teal-300 bg-white/[0.05] font-semibold' 
                    : 'text-slate-300 hover:bg-white/[0.03]'
                }`}
              >
                <span>{label}</span>
              </button>
            ))}

            <div className="pt-3 border-t border-white/[0.08] mt-3 space-y-1">
              <button
                onClick={() => handleNavClick('knowledge')}
                className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Pustaka Artikel Sains
              </button>
              <button
                onClick={() => handleNavClick('calculator')}
                className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Kalkulator Jejak Plastik
              </button>
              <button
                onClick={() => handleNavClick('aqua-ai')}
                className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Aqua AI Marine Assistant
              </button>
              <button
                onClick={() => handleNavClick('quiz')}
                className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Kuis Pengetahuan Samudra
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
