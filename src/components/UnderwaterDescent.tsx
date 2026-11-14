import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Compass, Globe2 } from 'lucide-react';
import { ActiveTab } from './Navbar';
import abyssImg from '../assets/images/abyss_twilight_zone_1794530081646.jpg';
import plasticImg from '../assets/images/plastic_ocean_drift_1794530081643.jpg';

import { ThemeMode } from '../hooks/useTheme';

gsap.registerPlugin(ScrollTrigger);

interface UnderwaterDescentProps {
  onNavigate: (tab: ActiveTab) => void;
  theme?: ThemeMode;
}

const DESCENT_STAGES = [
  {
    stage: 1,
    depthRange: '0 – 30 m',
    zone: 'Zona Epipelagik · Permukaan Sunlit',
    title: 'Di mana cahaya menembus keheningan samudra.',
    body: 'Lapisan teratas laut menyerap energi matahari, menjadi tempat fitoplankton memproduksi lebih dari separuh oksigen bumi sekaligus menggerakkan arus permukaan global.',
  },
  {
    stage: 2,
    depthRange: '30 – 200 m',
    zone: 'Terumbu Fotik · Jantung Keanekaragaman',
    title: 'Seperempat kehidupan laut bertumpu pada terumbu yang rapuh.',
    body: 'Meskipun menutupi kurang dari 0,1% dasar samudra, terumbu karang dan padang lamun pesisir menopang jutaan spesies ikan, penyu, dan organisme pembibitan bahari.',
  },
  {
    stage: 3,
    depthRange: '200 – 1.000 m',
    zone: 'Zona Mesopelagik · Twilight Samudra',
    title: 'Cahaya memudar. Migrasi raksasa pelagik dimulai.',
    body: 'Kurang dari satu persen sinar matahari tersisa. Salju laut turun perlahan melewati pari manta, paus, dan biota zona senja yang mengandalkan keseimbangan rantai makanan.',
  },
  {
    stage: 4,
    depthRange: '1.000 – 2.500 m',
    zone: 'Tekanan Antropogenik · Jejak Plastik Abadi',
    title: 'Di kedalaman sunyi sekalipun, limbah polimer tetap ditemukan.',
    body: 'Lebih dari 11 juta metrik ton plastik mengalir ke laut setiap tahun—terpecah menjadi mikroplastik, tersapu arus lintas samudra, hingga mengendap di sedimen laut dalam.',
  },
  {
    stage: 5,
    depthRange: 'Target 30×30',
    zone: 'Restorasi Sains · Harapan Masa Depan',
    title: 'Ekosistem laut memiliki daya pulih luar biasa jika kita bertindak.',
    body: 'Melalui pengurangan plastik di hulu, pelacakan arus berbasis data, dan perluasan Kawasan Konservasi Laut (MPA) hingga 30%, samudra dapat kembali bernapas.',
  },
];

export const UnderwaterDescent: React.FC<UnderwaterDescentProps> = ({ onNavigate, theme = 'dark' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinWrapperRef = useRef<HTMLDivElement | null>(null);
  const [currentDepth, setCurrentDepth] = useState(0);
  const [activeStage, setActiveStage] = useState(1);

  useEffect(() => {
    const isLight = theme === 'light';
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const pinWrapper = pinWrapperRef.current;
      const container = containerRef.current;
      if (!pinWrapper || !container) return;

      gsap.set(pinWrapper, {
        backgroundColor: isLight ? '#F7F6F1' : '#102B38',
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: '+=2800',
          pin: pinWrapper,
          scrub: 0.45,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            setCurrentDepth(Math.round(p * 2400));
            const st = Math.min(5, Math.max(1, Math.floor(p * 5) + 1));
            setActiveStage(st);
          },
        },
      });

      tl.to(pinWrapper, { backgroundColor: isLight ? '#EEF3F1' : '#091C25', duration: 1.5 }, 0)
        .to(pinWrapper, { backgroundColor: isLight ? '#E2ECE9' : '#061116', duration: 2 }, 1.5)
        .to(pinWrapper, { backgroundColor: isLight ? '#ECEAE1' : '#091C25', duration: 1 }, 3.8);

      tl.to('.descent-stage-1', { opacity: 0, y: -32, duration: 0.6 }, 0.7)
        .fromTo('.descent-stage-2', { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.6 }, 0.85)
        .to('.descent-sunlight', { opacity: 0.14, duration: 0.9 }, 0.8)

        .to('.descent-stage-2', { opacity: 0, y: -32, duration: 0.6 }, 1.7)
        .fromTo('.descent-stage-3', { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.6 }, 1.85)
        .fromTo('.descent-twilight-bg', { opacity: 0 }, { opacity: isLight ? 0.14 : 0.36, duration: 0.8 }, 1.75)

        .to('.descent-stage-3', { opacity: 0, y: -32, duration: 0.6 }, 2.7)
        .to('.descent-twilight-bg', { opacity: 0.06, duration: 0.6 }, 2.7)
        .fromTo('.descent-plastic-bg', { opacity: 0, scale: 1.05 }, { opacity: isLight ? 0.14 : 0.34, scale: 1, duration: 0.8 }, 2.75)
        .fromTo('.descent-stage-4', { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.6 }, 2.85)

        .to('.descent-stage-4', { opacity: 0, y: -32, duration: 0.6 }, 3.7)
        .to('.descent-plastic-bg', { opacity: 0.08, duration: 0.6 }, 3.7)
        .fromTo('.descent-stage-5', { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.65 }, 3.85);
    });

    const rafId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(rafId);
      mm.revert();
    };
  }, [theme]);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-300"
      aria-label="Penyelaman Kedalaman Samudra"
    >
      {/* DESKTOP PINNED CINEMATIC DESCENT (>= 1024px) */}
      <div
        ref={pinWrapperRef}
        className="hidden lg:flex relative w-full h-screen overflow-hidden flex-col justify-between bg-[var(--bg-canvas)] dark:bg-[#102B38]"
      >
        <div
          className="descent-sunlight absolute inset-0 pointer-events-none opacity-45"
          style={{
            background:
              theme === 'light'
                ? 'radial-gradient(ellipse 85% 55% at 50% -10%, rgba(29, 102, 100, 0.12) 0%, rgba(130, 170, 161, 0.14) 55%, transparent 100%)'
                : 'radial-gradient(ellipse 85% 55% at 50% -10%, rgba(237, 235, 227, 0.14) 0%, rgba(54, 125, 123, 0.16) 55%, transparent 100%)',
          }}
        />
        <img
          src={abyssImg}
          alt=""
          aria-hidden="true"
          className="descent-twilight-bg absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none mix-blend-multiply dark:mix-blend-lighten"
        />
        <img
          src={plasticImg}
          alt=""
          aria-hidden="true"
          className="descent-plastic-bg absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-canvas)]/45 via-transparent to-[var(--bg-canvas)]/70 pointer-events-none" />

        {/* Quiet Top Depth Indicator */}
        <div className="relative z-20 px-12 pt-24 pb-4 flex items-center justify-between text-xs border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-3">
            <Compass className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
            <span className="text-[var(--text-primary)] font-medium tabular-nums">
              {currentDepth.toLocaleString('id-ID')} m Kedalaman
            </span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-[var(--accent-sand)]">
              {DESCENT_STAGES[activeStage - 1]?.zone}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
              Babak {activeStage} / 5
            </span>
            <div className="flex gap-1.5">
              {DESCENT_STAGES.map((st) => (
                <div
                  key={st.stage}
                  className={`h-1 rounded-sm transition-all duration-300 ${
                    st.stage === activeStage
                      ? 'w-7 bg-[var(--text-primary)]'
                      : st.stage < activeStage
                      ? 'w-4 bg-[var(--accent-teal)]/60'
                      : 'w-4 bg-[var(--border-strong)]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center Narrative Stage Stack */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-12 max-w-4xl mx-auto w-full">
          {DESCENT_STAGES.map((item, idx) => (
            <div
              key={item.stage}
              className={`descent-stage-${item.stage} absolute inset-x-8 max-w-3xl mx-auto text-center space-y-5 ${
                idx === 0 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--accent-sand)]">
                {item.depthRange} · {item.zone}
              </div>
              <h2 className="font-display text-4xl xl:text-5xl text-[var(--text-primary)] tracking-tight leading-[1.12] text-balance">
                {item.title}
              </h2>
              <p className="text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                {item.body}
              </p>

              {item.stage === 4 && (
                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('tracker')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D98270] text-[#061116] font-semibold text-xs tracking-wide hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Globe2 className="w-4 h-4" />
                    <span>Lacak Peta Sebaran Plastik Global</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {item.stage === 5 && (
                <div className="pt-2 flex items-center justify-center gap-4">
                  <button
                    onClick={() => onNavigate('missions')}
                    className="px-6 py-2.5 rounded-full bg-[#367D7B] hover:bg-[#267472] text-[#EDEBE3] font-semibold text-xs tracking-wide transition-colors cursor-pointer"
                  >
                    Mulai Aksi Konservasi
                  </button>
                  <button
                    onClick={() => onNavigate('simulator')}
                    className="px-5 py-2.5 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Uji Simulator Ekosistem
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="relative z-20 px-12 py-3.5 flex items-center justify-between text-[11px] text-[var(--text-muted)] border-t border-[var(--border-hairline)]">
          <span>Penyelaman Vertikal Kolom Air Samudra</span>
          <span>Gulir terus untuk menuruni lapisan kedalaman</span>
        </div>
      </div>

      {/* MOBILE / TABLET CLEAN UNBOXED FLOW */}
      <div className="lg:hidden bg-[var(--bg-surface)] text-[var(--text-primary)] px-4 sm:px-6 py-16 space-y-6 transition-colors duration-300">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs uppercase tracking-widest text-[var(--accent-sand)]">
            Profil Vertikal Samudra
          </span>
          <h2 className="font-display text-3xl text-[var(--text-primary)] tracking-tight">
            Dari Permukaan Sunlit ke Kedalaman Abisal
          </h2>
        </div>

        <div className="divide-y divide-[var(--border-hairline)] border-t border-[var(--border-hairline)]">
          {DESCENT_STAGES.map((item) => (
            <div key={item.stage} className="py-5 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[var(--accent-teal)] tabular-nums">
                <span>{item.zone}</span>
                <span className="text-[var(--accent-sand)]">{item.depthRange}</span>
              </div>
              <h3 className="font-display text-xl text-[var(--text-primary)] leading-snug">{item.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('tracker')}
            className="px-5 py-2.5 rounded-full bg-[#367D7B] text-[#EDEBE3] text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Globe2 className="w-4 h-4" />
            <span>Buka Plastic Tracker</span>
          </button>
          <button
            onClick={() => onNavigate('missions')}
            className="px-5 py-2.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-medium cursor-pointer"
          >
            Mulai Aksi Nyata
          </button>
        </div>
      </div>
    </section>
  );
};
