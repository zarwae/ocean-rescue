import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Volume2,
  VolumeX,
  Compass,
  ChevronDown,
  BookOpen,
  Calculator,
  BarChart3,
  HelpCircle,
  Bot,
  Gamepad2,
  CheckSquare,
  User,
  ArrowUpRight,
  Sun,
  Moon,
} from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { ThemeMode } from '../hooks/useTheme';

export type ActiveTab =
  | 'home'
  | 'crisis'
  | 'explorer'
  | 'tracker'
  | 'simulator'
  | 'game'
  | 'knowledge'
  | 'calculator'
  | 'missions'
  | 'dashboard'
  | 'quiz'
  | 'data'
  | 'news';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAquaChat: () => void;
  levelTitle: string;
  levelNumber: number;
  totalXp: number;
  progressPercent: number;
  isMuted: boolean;
  onToggleSound: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAquaChat,
  levelTitle,
  levelNumber,
  totalXp,
  progressPercent,
  isMuted,
  onToggleSound,
  theme,
  onToggleTheme,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 28);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setExplorerOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExplorerOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    setExplorerOpen(false);
  };

  // Streamlined Core Nav Links
  const primaryNavItems: { tab: ActiveTab; label: string }[] = [
    { tab: 'home', label: 'Beranda' },
    { tab: 'crisis', label: 'Krisis Laut' },
    { tab: 'explorer', label: 'Biota Samudra' },
    { tab: 'tracker', label: 'Plastic Tracker' },
    { tab: 'simulator', label: 'Simulator' },
    { tab: 'news', label: 'Berita Laut' },
  ];

  // Everything else organized cleanly inside Explorer popover
  const secondaryHubItems: { tab: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'missions', label: 'Misi Aksi Nyata', icon: <CheckSquare className="w-3.5 h-3.5 text-[var(--accent-teal)]" /> },
    { tab: 'game', label: 'Game Bersih Laut', icon: <Gamepad2 className="w-3.5 h-3.5 text-[var(--accent-teal)]" /> },
    { tab: 'knowledge', label: 'Pustaka Riset Sains', icon: <BookOpen className="w-3.5 h-3.5 text-[var(--accent-teal)]" /> },
    { tab: 'data', label: 'Visualisasi Data Resmi', icon: <BarChart3 className="w-3.5 h-3.5 text-[var(--accent-teal)]" /> },
    { tab: 'calculator', label: 'Kalkulator Jejak Plastik', icon: <Calculator className="w-3.5 h-3.5 text-[var(--accent-sand)]" /> },
    { tab: 'quiz', label: 'Tantangan Kuis Sains', icon: <HelpCircle className="w-3.5 h-3.5 text-[var(--accent-teal)]" /> },
    { tab: 'dashboard', label: 'Explorer Passport', icon: <User className="w-3.5 h-3.5 text-[var(--accent-sand)]" /> },
  ];

  const isSecondaryActive = secondaryHubItems.some((item) => item.tab === activeTab);
  const overHero = activeTab === 'home' && !isScrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-0 shadow-none text-[var(--text-primary)] transition-[padding] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        overHero ? 'py-5' : 'py-3'
      }`}
    >
      {/* Layer 1: Hero Top-Fade Transparent Backdrop */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--bg-canvas)]/88 via-[var(--bg-canvas)]/45 to-transparent transition-opacity duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          overHero ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {/* Layer 2: Scrolled Liquid Glass Blue Backdrop */}
      <div
        aria-hidden="true"
        className={`liquid-glass pointer-events-none absolute inset-0 !border-x-0 !border-t-0 !shadow-none transition-opacity duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          overHero ? 'opacity-0' : 'opacity-100'
        }`}
      />

      <div className="relative z-10 max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 xl:gap-6">
          {/* Editorial Brand Lockup */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-teal)]/60 rounded-lg group shrink-0 cursor-pointer"
            aria-label="OCEAN RESCUE Home"
          >
            <svg
              viewBox="0 0 28 28"
              fill="none"
              className="w-7 h-7 shrink-0 transition-colors text-[var(--accent-teal)]"
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
                strokeOpacity="0.85"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle cx="14" cy="8.5" r="1.35" fill="var(--accent-sand)" />
            </svg>
            <div className="flex items-center gap-2.5">
              <span className="font-display font-semibold text-base sm:text-lg tracking-tight whitespace-nowrap text-[var(--text-primary)]">
                Ocean Rescue
              </span>
              <span
                className="hidden sm:inline-block h-3.5 w-px bg-[var(--border-strong)]"
                aria-hidden="true"
              />
              <span className="hidden sm:inline-block text-[10px] font-sans font-semibold tracking-[0.22em] uppercase whitespace-nowrap text-[var(--accent-sand)]">
                SDG 14
              </span>
            </div>
          </button>

          {/* Clean Single-Row Desktop Nav */}
          <nav
            className="hidden lg:flex items-center gap-5 xl:gap-7 text-[13px] font-medium"
            aria-label="Navigasi Utama"
          >
            {primaryNavItems.map(({ tab, label }) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    soundEffects.playBubblePop();
                    handleNavClick(tab);
                  }}
                  className={`relative py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[var(--text-primary)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-0 h-[1.5px] bg-[var(--accent-teal)]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Utility Zone: Theme Switch + Explorer Popover + Primary Action */}
          <div className="hidden lg:flex items-center gap-4 shrink-0" ref={popoverRef}>
            {/* Tactile Dark / Light Mode Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={theme === 'dark'}
              aria-label={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              title={theme === 'dark' ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
              onClick={() => {
                soundEffects.playBubblePop();
                onToggleTheme();
              }}
              className="liquid-glass-pill relative inline-flex h-7 w-[52px] shrink-0 cursor-pointer items-center justify-between rounded-full px-1.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-teal)]"
            >
              <Sun className={`w-3 h-3 transition-opacity ${theme === 'light' ? 'opacity-0' : 'opacity-45 text-[var(--text-muted)]'}`} />
              <Moon className={`w-3 h-3 transition-opacity ${theme === 'dark' ? 'opacity-0' : 'opacity-45 text-[var(--text-muted)]'}`} />
              <span
                className={`absolute left-0.5 flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-transform duration-200 ${
                  theme === 'dark'
                    ? 'translate-x-6 bg-[#17485A] text-[#EDEBE3]'
                    : 'translate-x-0 bg-[#FFFFFF] text-[#876B3A]'
                }`}
              >
                {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              </span>
            </button>

            {/* Unboxed Explorer Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setExplorerOpen((prev) => !prev)}
                aria-expanded={explorerOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1.5 py-1.5 text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  explorerOpen || isSecondaryActive
                    ? 'text-[var(--accent-teal)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Lainnya</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    explorerOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {explorerOpen && (
                <div className="liquid-glass absolute right-0 mt-3 w-72 rounded-2xl p-4 space-y-3 z-50 text-[var(--text-primary)]">
                  {/* Compact Progression Summary */}
                  <div className="space-y-2 pb-3 border-b border-[var(--border-hairline)]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[var(--accent-sand)]">
                        Level {levelNumber} · {levelTitle}
                      </span>
                      <span className="text-[var(--accent-teal)] font-semibold tabular-nums">
                        {totalXp.toLocaleString('id-ID')} XP
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#367D7B] transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleNavClick('dashboard')}
                        className="text-[11px] text-[var(--accent-teal)] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Passport Penjelajah</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={onToggleSound}
                        className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer whitespace-nowrap"
                      >
                        {isMuted ? (
                          <>
                            <VolumeX className="w-3 h-3 text-[var(--accent-coral)]" />
                            <span>Audio Mati</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-[var(--accent-teal)]" />
                            <span>Audio Aktif</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Secondary Labs & Resources */}
                  <div className="space-y-0.5">
                    {secondaryHubItems.map((item) => {
                      const active = activeTab === item.tab;
                      return (
                        <button
                          key={item.tab}
                          onClick={() => {
                            soundEffects.playBubblePop();
                            handleNavClick(item.tab);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                            active
                              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/60'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            {item.icon}
                            <span>{item.label}</span>
                          </span>
                          <ArrowUpRight className="w-3 h-3 opacity-40" />
                        </button>
                      );
                    })}
                    <button
                      onClick={() => {
                        soundEffects.playBubblePop();
                        setExplorerOpen(false);
                        onOpenAquaChat();
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/60 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <Bot className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
                        <span>Aqua AI Riset Kelautan</span>
                      </span>
                      <ArrowUpRight className="w-3 h-3 opacity-40" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                soundEffects.playBubblePop();
                handleNavClick('missions');
              }}
              className="px-4 py-2 rounded-full bg-[#367D7B] hover:bg-[#267472] text-[#EDEBE3] font-semibold text-xs tracking-wide transition-colors cursor-pointer whitespace-nowrap"
            >
              Aksi Nyata
            </button>
          </div>

          {/* Mobile / Tablet Compact Controls */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            {/* Compact Mobile Theme Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={theme === 'dark'}
              aria-label={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              onClick={() => {
                soundEffects.playBubblePop();
                onToggleTheme();
              }}
              className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-surface)] cursor-pointer"
              aria-label={mobileMenuOpen ? 'Tutup Menu Navigasi' : 'Buka Menu Navigasi'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Smooth Mobile / Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="relative z-10 lg:hidden bg-[var(--bg-elevated)] border-b border-[var(--border-hairline)] px-4 pt-3 pb-6 max-h-[85vh] overflow-y-auto shadow-2xl text-[var(--text-primary)]">
          <div className="flex items-center justify-between py-3 border-b border-[var(--border-hairline)] mb-3">
            <div className="text-xs text-[var(--accent-sand)]">
              Lvl {levelNumber} · {levelTitle} ·{' '}
              <span className="text-[var(--accent-teal)] font-semibold tabular-nums">{totalXp} XP</span>
            </div>
            <button
              onClick={onToggleSound}
              className="text-xs text-[var(--text-secondary)] flex items-center gap-1 cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isMuted ? 'Audio Mati' : 'Audio Aktif'}</span>
            </button>
          </div>

          <div className="space-y-1">
            {primaryNavItems.map(({ tab, label }) => (
              <button
                key={tab}
                onClick={() => {
                  soundEffects.playBubblePop();
                  handleNavClick(tab);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'text-[var(--accent-teal)] bg-[var(--bg-surface)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>{label}</span>
              </button>
            ))}

            <div className="pt-3 border-t border-[var(--border-hairline)] mt-3 space-y-1">
              <div className="px-3 py-1 text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
                Laboratorium &amp; Pustaka
              </div>
              {secondaryHubItems.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => {
                    soundEffects.playBubblePop();
                    handleNavClick(item.tab);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                    activeTab === item.tab
                      ? 'text-[var(--accent-teal)] bg-[var(--bg-surface)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  soundEffects.playBubblePop();
                  setMobileMenuOpen(false);
                  onOpenAquaChat();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
                <span>Aqua AI Riset Kelautan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
