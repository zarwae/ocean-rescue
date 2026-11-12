import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Compass, 
  ArrowRight, 
  ShieldAlert, 
  Waves, 
  Fish, 
  Trash2, 
  Sparkles,
  Droplets,
  Anchor,
  Flame
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { ImageWithFallback } from './ImageWithFallback';

gsap.registerPlugin(ScrollTrigger);

interface UnderwaterDescentProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const UnderwaterDescent: React.FC<UnderwaterDescentProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinWrapperRef = useRef<HTMLDivElement | null>(null);

  // Depth meter state for user-friendly HUD
  const [currentDepth, setCurrentDepth] = useState<number>(0);
  const [activeStage, setActiveStage] = useState<number>(1);

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const pinWrapper = pinWrapperRef.current;
      if (!pinWrapper) return;

      // Master ScrollTrigger timeline with scrub
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=3500',
          pin: pinWrapper,
          scrub: 1,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            // Map scroll progress to depth (0m to 850m and back to 30m for hope)
            if (p < 0.2) {
              setCurrentDepth(Math.round(p * 150)); // 0 - 30m
              setActiveStage(1);
            } else if (p < 0.4) {
              setCurrentDepth(Math.round(30 + (p - 0.2) * 400)); // 30 - 110m
              setActiveStage(2);
            } else if (p < 0.6) {
              setCurrentDepth(Math.round(110 + (p - 0.4) * 1500)); // 110 - 410m
              setActiveStage(3);
            } else if (p < 0.75) {
              setCurrentDepth(Math.round(410 + (p - 0.6) * 1800)); // 410 - 680m
              setActiveStage(4);
            } else if (p < 0.9) {
              setCurrentDepth(Math.round(680 + (p - 0.75) * 1200)); // 680 - 860m
              setActiveStage(5);
            } else {
              setCurrentDepth(Math.round(860 - (p - 0.9) * 8000)); // ascending to shallow reef ~60m
              setActiveStage(6);
            }
          },
        },
      });

      // Ambient lighting & background color shifting from turquoise sunlit surface to abyss navy
      tl.to('.descent-bg-ambient', {
        backgroundColor: '#071E29', // Stage 2
        duration: 1,
      })
      .to('.descent-bg-ambient', {
        backgroundColor: '#04131B', // Stage 3 deep
        duration: 1,
      })
      .to('.descent-bg-ambient', {
        backgroundColor: '#020A0F', // Stage 4 crisis
        duration: 1,
      })
      .to('.descent-bg-ambient', {
        backgroundColor: '#061922', // Stage 6 hope return
        duration: 1,
      });

      // STAGE 1 -> STAGE 2
      // Fade out Stage 1, animate sunlight beam fading, fish school swimming in
      tl.to('.stage-1-content', { opacity: 0, y: -40, duration: 0.8 }, 0.2)
        .to('.sunlight-rays', { opacity: 0.2, scaleY: 0.6, duration: 1 }, 0.2)
        .fromTo('.stage-2-content', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8 }, 0.3)
        .fromTo('.fish-school-1', { x: '-120%' }, { x: '130%', duration: 1.5, ease: 'none' }, 0.25)
        .fromTo('.fish-school-2', { x: '120%' }, { x: '-130%', duration: 1.8, ease: 'none' }, 0.28)
        .to('.coral-silhouette', { y: '-15%', opacity: 0.9, duration: 1 }, 0.3);

      // STAGE 2 -> STAGE 3 (Deep Ocean)
      tl.to('.stage-2-content', { opacity: 0, y: -40, duration: 0.8 }, 1.2)
        .to('.coral-silhouette', { opacity: 0.1, y: '20%', duration: 0.8 }, 1.2)
        .fromTo('.stage-3-content', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8 }, 1.3)
        .fromTo('.marine-snow', { opacity: 0 }, { opacity: 0.85, duration: 0.8 }, 1.2)
        .fromTo('.manta-silhouette', { x: '140%', y: '10%', scale: 0.9 }, { x: '-140%', y: '-10%', scale: 1.1, duration: 2, ease: 'none' }, 1.3);

      // STAGE 3 -> STAGE 4 (The Crisis - Plastic Debris Enters)
      tl.to('.stage-3-content', { opacity: 0, y: -40, duration: 0.8 }, 2.2)
        .fromTo('.stage-4-content', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.8 }, 2.3)
        .fromTo('.plastic-bag-float', { y: '-80px', x: '-40px', rotation: -15, opacity: 0 }, { y: '160px', x: '50px', rotation: 25, opacity: 0.75, duration: 1.8 }, 2.2)
        .fromTo('.ghost-net-float', { y: '120px', x: '60px', opacity: 0 }, { y: '-100px', x: '-40px', opacity: 0.65, duration: 2 }, 2.3);

      // STAGE 4 -> STAGE 5 (The Reality - 5 Threats Dossier)
      tl.to('.stage-4-content', { opacity: 0, y: -30, duration: 0.8 }, 3.3)
        .fromTo('.stage-5-content', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9 }, 3.4)
        .to('.plastic-bag-float, .ghost-net-float', { opacity: 0.15, duration: 0.8 }, 3.3);

      // STAGE 5 -> STAGE 6 (The Hope & Guardian Call)
      tl.to('.stage-5-content', { opacity: 0, y: -30, duration: 0.8 }, 4.4)
        .fromTo('.stage-6-content', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.9 }, 4.5)
        .fromTo('.sunlight-rays-hope', { opacity: 0, scaleY: 0.5 }, { opacity: 0.6, scaleY: 1, duration: 1 }, 4.5)
        .fromTo('.healthy-reef-silhouette', { y: '60px', opacity: 0 }, { y: '0px', opacity: 0.85, duration: 1 }, 4.5);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative w-full bg-[#04131B] text-[#F1F4F2]"
      aria-label="The Underwater Descent Interactive Scroll Experience"
    >
      {/* Pinned Viewport Container */}
      <div 
        ref={pinWrapperRef}
        className="descent-bg-ambient relative w-full h-screen overflow-hidden flex flex-col justify-between transition-colors duration-500"
      >
        {/* Layer 1: Atmospheric Sunlight Caustics (Top) */}
        <div 
          className="sunlight-rays absolute inset-0 pointer-events-none opacity-40 z-0 origin-top transition-transform"
          style={{
            background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(22, 217, 193, 0.25) 0%, rgba(11, 53, 69, 0.1) 60%, transparent 100%)',
          }}
        />

        {/* Ambient Marine Snow / Floating Micro-particles */}
        <div className="marine-snow absolute inset-0 pointer-events-none opacity-30 z-0 marine-snow-layer" />

        {/* Layer 2: Moving Silhouettes & Fauna (Parallax) */}
        <div className="absolute inset-0 pointer-events-none z-1 overflow-hidden">
          
          {/* Fish School 1 (Shallow Swimming Left to Right) */}
          <div className="fish-school-1 absolute top-[28%] left-0 w-80 h-24 text-teal-300/40">
            <svg viewBox="0 0 320 90" fill="currentColor" className="w-full h-full opacity-60">
              <path d="M40 20c8-4 18-3 26 2-4-8-12-12-20-10-4 1-6 8-6 8zM90 35c10-5 22-4 32 3-5-10-15-14-25-12-5 1-7 9-7 9zM150 15c9-4 20-3 28 2-4-9-13-13-22-11-4 1-6 9-6 9zM210 40c11-5 24-4 34 3-6-10-16-15-27-13-5 1-7 10-7 10zM60 65c9-4 20-3 28 2-4-9-13-13-22-11-4 1-6 9-6 9z" />
            </svg>
          </div>

          {/* Fish School 2 (Deeper Swimming Right to Left) */}
          <div className="fish-school-2 absolute top-[42%] right-0 w-96 h-28 text-cyan-200/30">
            <svg viewBox="0 0 320 90" fill="currentColor" className="w-full h-full opacity-50 scale-x-[-1]">
              <path d="M50 25c10-5 22-4 32 3-5-10-15-14-25-12-5 1-7 9-7 9zM120 45c11-5 24-4 34 3-6-10-16-15-27-13-5 1-7 10-7 10zM190 20c9-4 20-3 28 2-4-9-13-13-22-11-4 1-6 9-6 9zM260 55c10-5 22-4 32 3-5-10-15-14-25-12-5 1-7 9-7 9z" />
            </svg>
          </div>

          {/* Majestic Manta Ray Silhouette (Stage 3 Deep Ocean) */}
          <div className="manta-silhouette absolute top-[35%] right-0 w-[420px] h-[220px] text-teal-400/20">
            <svg viewBox="0 0 400 200" fill="currentColor" className="w-full h-full filter blur-[0.5px]">
              <path d="M200 40 C 260 40, 370 70, 395 110 C 340 100, 280 115, 240 140 C 220 152, 210 170, 202 195 C 198 170, 188 152, 168 140 C 128 115, 68 100, 5 110 C 30 70, 140 40, 200 40 Z" />
            </svg>
          </div>

          {/* Plastic Ghost Net & Bag (Stage 4 Crisis) */}
          <div className="plastic-bag-float absolute top-[40%] left-[20%] w-32 h-32 text-rose-300/35 pointer-events-none">
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full opacity-60">
              <path d="M30 20 C 35 10, 65 10, 70 20 C 75 30, 85 45, 80 80 C 70 90, 30 90, 20 80 C 15 45, 25 30, 30 20 Z" />
              <path d="M40 20 C 40 30, 60 30, 60 20" />
            </svg>
          </div>

          <div className="ghost-net-float absolute top-[30%] right-[18%] w-48 h-48 text-rose-400/30 pointer-events-none">
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" className="w-full h-full opacity-50">
              <path d="M10 20 L90 20 M10 40 L90 40 M10 60 L90 60 M10 80 L90 80 M20 10 L20 90 M40 10 L40 90 M60 10 L60 90 M80 10 L80 90" />
            </svg>
          </div>

          {/* Coral Bottom Silhouette */}
          <div className="coral-silhouette absolute bottom-0 inset-x-0 h-44 text-[#0B3545]/40 flex items-end">
            <svg viewBox="0 0 1440 180" fill="currentColor" className="w-full h-full">
              <path d="M0,180 C80,120 160,150 240,110 C320,70 380,140 460,95 C540,50 620,130 700,90 C780,50 860,120 940,80 C1020,40 1100,110 1180,75 C1260,40 1340,90 1440,60 L1440,180 L0,180 Z" />
            </svg>
          </div>

          {/* Healthy Coral Reef Silhouette (Stage 6 Hope) */}
          <div className="healthy-reef-silhouette absolute bottom-0 inset-x-0 h-52 text-[#16D9C1]/20 flex items-end opacity-0">
            <svg viewBox="0 0 1440 200" fill="currentColor" className="w-full h-full">
              <path d="M0,200 C100,130 180,160 270,120 C360,80 430,150 520,100 C610,50 700,140 790,95 C880,50 970,130 1060,85 C1150,40 1240,120 1330,80 C1380,60 1410,90 1440,70 L1440,200 L0,200 Z" />
            </svg>
          </div>

          {/* Stage 6 Hope Sunlight Beams */}
          <div 
            className="sunlight-rays-hope absolute inset-0 pointer-events-none opacity-0 z-0 origin-top"
            style={{
              background: 'radial-gradient(ellipse 90% 70% at 50% 0%, rgba(22, 217, 193, 0.35) 0%, rgba(11, 53, 69, 0.15) 70%, transparent 100%)',
            }}
          />

        </div>

        {/* Top Floating HUD: Depth Telemetry & Stage Progress Indicator */}
        <div className="relative z-20 px-6 sm:px-12 pt-24 pb-4 flex items-center justify-between text-xs font-mono text-[#8299A8] border-b border-white/[0.06] backdrop-blur-[2px]">
          {/* Left: Depth Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#16D9C1] animate-pulse" />
            <span className="text-[#F1F4F2] font-semibold text-sm tabular-nums">
              {currentDepth} Meter Kedalaman
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-[#16D9C1] font-normal">
              {currentDepth < 50 ? 'Zona Epipelagik (Sunlit Zone)' :
               currentDepth < 200 ? 'Zona Fotik Dangkal' :
               currentDepth < 700 ? 'Zona Mesopelagik (Twilight)' : 'Zona Batipelagik (Midnight)'}
            </span>
          </div>

          {/* Right: Stage Stepper */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">
              Tahap {activeStage} / 6
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map((stg) => (
                <div
                  key={stg}
                  className={`w-4 h-1 rounded-full transition-all duration-300 ${
                    stg === activeStage 
                      ? 'bg-[#16D9C1] w-6' 
                      : stg < activeStage 
                      ? 'bg-white/40' 
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center: Stage Content Layer (Absolute Centered with Transitions) */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 max-w-5xl mx-auto w-full">
          
          {/* STAGE 1: THE SURFACE */}
          <div className="stage-1-content absolute inset-x-4 max-w-3xl mx-auto text-center space-y-5">
            <span className="text-xs font-mono text-[#16D9C1] tracking-widest uppercase block">
              Tahap 01 · Permukaan Samudra (The Surface)
            </span>
            <h2 className="font-display font-light text-4xl sm:text-6xl text-white tracking-tight leading-tight">
              Di mana cahaya matahari menembus keheningan biru.
            </h2>
            <p className="text-sm sm:text-base text-[#8299A8] max-w-xl mx-auto font-light leading-relaxed">
              Permukaan laut menyerap energi matahari bumi, menaungi plankton penghasil oksigen terpenting dan menggerakkan sirkulasi arus termohalin global.
            </p>
            <div className="pt-4 flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
              <span className="animate-bounce">↓ Gulir ke bawah untuk menyelam lebih dalam</span>
            </div>
          </div>

          {/* STAGE 2: SHALLOW WATER & REEF BIOTA */}
          <div className="stage-2-content absolute inset-x-4 max-w-3xl mx-auto text-center space-y-5 opacity-0">
            <span className="text-xs font-mono text-[#16D9C1] tracking-widest uppercase block">
              Tahap 02 · Perairan Dangkal Tropis (Shallow Water)
            </span>
            <h2 className="font-display font-light text-4xl sm:text-6xl text-white tracking-tight leading-tight">
              Kubah terumbu karang berdenyut dengan kehidupan.
            </h2>
            <p className="text-sm sm:text-base text-[#8299A8] max-w-xl mx-auto font-light leading-relaxed">
              Di kedalaman 15 hingga 30 meter, ribuan kawanan ikan tropis berenang melintasi struktur karang purba yang menopang seperempat biota samudra dunia.
            </p>
            <div className="flex items-center justify-center gap-6 text-xs font-mono text-teal-300/80 pt-2">
              <span>Bioma: Terumbu Fotik</span>
              <span>·</span>
              <span>Biodiversitas: 25% Spesies Laut</span>
            </div>
          </div>

          {/* STAGE 3: DEEP OCEAN */}
          <div className="stage-3-content absolute inset-x-4 max-w-3xl mx-auto text-center space-y-5 opacity-0">
            <span className="text-xs font-mono text-[#70D9D0] tracking-widest uppercase block">
              Tahap 03 · Samudra Dalam & Pelagik (Deep Ocean)
            </span>
            <h2 className="font-display font-light text-4xl sm:text-6xl text-white tracking-tight leading-tight">
              Cahaya meredup. Ruang pengembara raksasa dimulai.
            </h2>
            <p className="text-sm sm:text-base text-[#8299A8] max-w-xl mx-auto font-light leading-relaxed">
              Memasuki zona remang-remang (twilight zone), sinar matahari melemah hingga 99%. Salju laut melayang turun memberi makan ikan paus, hiu, dan pari manta samudera.
            </p>
            <div className="flex items-center justify-center gap-6 text-xs font-mono text-cyan-300/80 pt-2">
              <span>Sinar Matahari Tersisa: &lt; 1%</span>
              <span>·</span>
              <span>Tekanan Air: 20–40 Atmosfer</span>
            </div>
          </div>

          {/* STAGE 4: THE CRISIS */}
          <div className="stage-4-content absolute inset-x-4 max-w-3xl mx-auto text-center space-y-5 opacity-0">
            <span className="text-xs font-mono text-rose-400 tracking-widest uppercase block">
              Tahap 04 · Jejak Rusak Manusia (The Crisis)
            </span>
            <h2 className="font-display font-light text-4xl sm:text-6xl text-white tracking-tight leading-tight text-balance">
              &ldquo;An entire world is disappearing beneath the surface.&rdquo;
            </h2>
            <p className="text-sm sm:text-base text-rose-200/80 max-w-xl mx-auto font-light leading-relaxed">
              Jaring hantu hanyut menjerat penyu, kantong plastik mengambang disangka ubur-ubur, dan sampah polimer menumpuk di palung terdalam bumi tanpa pernah membusuk.
            </p>
            <div className="pt-2">
              <span className="px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                11.000.000+ Ton Plastik Masuk Samudra Setiap Tahun
              </span>
            </div>
          </div>

          {/* STAGE 5: THE REALITY (5 SCIENTIFIC THREATS DOSSIER) */}
          <div className="stage-5-content absolute inset-x-4 max-w-4xl mx-auto space-y-6 opacity-0">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono text-rose-400 tracking-widest uppercase block">
                Tahap 05 · Realitas Ilmiah Terverifikasi (The Reality)
              </span>
              <h2 className="font-display font-light text-3xl sm:text-5xl text-white tracking-tight">
                Lima Ancaman Utama Ekosistem Laut
              </h2>
            </div>

            {/* Scientific 5-Column Editorial Pill/Divider Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block">01 · Plastik</span>
                <h4 className="font-display font-medium text-sm text-white">11 Juta Ton/Th</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">Meracuni 90% burung laut & 52% penyu via mikroplastik.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block">02 · Overfishing</span>
                <h4 className="font-display font-medium text-sm text-white">35.4% Terkuras</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">Populasi hiu puncak anjlok 70% akibat pukat & perburuan sirip.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block">03 · Bleaching</span>
                <h4 className="font-display font-medium text-sm text-white">50% Karang Hilang</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">Gelombang panas laut memutus alga Zooxanthellae.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block">04 · Acidification</span>
                <h4 className="font-display font-medium text-sm text-white">+30% Keasaman</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">Penurunan pH melarutkan cangkang aragonit larva kerang.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block">05 · Habitat</span>
                <h4 className="font-display font-medium text-sm text-white">35% Mangrove Musnah</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">Alih fungsi pesisir merusak nursery ground generasi bahari.</p>
              </div>
            </div>

            <div className="flex justify-center pt-1">
              <button
                onClick={() => onNavigate('crisis')}
                className="inline-flex items-center gap-2 text-xs text-[#16D9C1] hover:underline font-mono cursor-pointer"
              >
                <span>Buka Bab Investigasi Krisis Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* STAGE 6: THE HOPE */}
          <div className="stage-6-content absolute inset-x-4 max-w-3xl mx-auto text-center space-y-6 opacity-0">
            <span className="text-xs font-mono text-[#16D9C1] tracking-widest uppercase block">
              Tahap 06 · Harapan & Restorasi (The Hope)
            </span>
            <h2 className="font-display font-light text-4xl sm:text-6xl text-white tracking-tight leading-tight text-balance">
              &ldquo;The future of our oceans is still in our hands.&rdquo;
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-light leading-relaxed">
              Sains kelautan membuktikan bahwa jika kita menghentikan perburuan liar, membentuk 30% Kawasan Konservasi Laut (MPA), dan menghentikan plastik di hulu, ekosistem samudra memiliki resiliensi biologis luar biasa untuk pulih.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('missions')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#16D9C1] hover:bg-[#70D9D0] text-[#04131B] font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#16D9C1]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Become an Ocean Guardian</span>
              </button>
              <button
                onClick={() => onNavigate('simulator')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.12] hover:border-white/30 text-white font-medium text-xs tracking-wider uppercase transition-all cursor-pointer"
              >
                Eksperimen Simulator Ekosistem
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Ambient Strip */}
        <div className="relative z-20 px-6 sm:px-12 py-3 flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-white/[0.06] backdrop-blur-[2px]">
          <span>Eksplorasi Kedalaman Interaktif · GSAP ScrollTrigger</span>
          <span className="hidden sm:inline">Rujukan Data: NOAA, UNEP & IPCC</span>
        </div>

      </div>
    </section>
  );
};
