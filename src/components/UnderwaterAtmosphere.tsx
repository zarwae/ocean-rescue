import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowUp, Volume2, VolumeX, Compass } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface UnderwaterAtmosphereProps {
  isMuted: boolean;
  onToggleSound: () => void;
}

export const UnderwaterAtmosphere: React.FC<UnderwaterAtmosphereProps> = ({
  isMuted,
  onToggleSound,
}) => {
  const { scrollY, scrollYProgress } = useScroll();
  const [depthMeters, setDepthMeters] = useState(0);
  const [zoneName, setZoneName] = useState('Zona Epipelagik (Fotik)');

  useEffect(() => {
    return scrollYProgress.on('change', (latest) => {
      // Map scroll progress 0 -> 1 to depth 0 -> 4,200 meters
      const depth = Math.round(latest * 4200);
      setDepthMeters(depth);

      if (depth < 200) {
        setZoneName('Zona Epipelagik (Permukaan Sunlit)');
      } else if (depth < 1000) {
        setZoneName('Zona Mesopelagik (Twilight / Senja)');
      } else if (depth < 4000) {
        setZoneName('Zona Batipelagik (Midnight / Gelap)');
      } else {
        setZoneName('Zona Abisal & Palung Hadal');
      }
    });
  }, [scrollYProgress]);

  // Ambient ray opacity fades as we go deeper
  const rayOpacity = useTransform(scrollYProgress, [0, 0.35], [0.45, 0.05]);

  const scrollToTop = () => {
    soundEffects.playBubblePop();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* FIXED AMBIENT UNDERWATER LAYERS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Dynamic Sun Rays from Ocean Surface */}
        <motion.div
          style={{ opacity: rayOpacity }}
          className="absolute -top-32 left-1/4 w-[600px] h-[900px] bg-gradient-to-b from-[#35C6C0]/25 via-[#087F8C]/10 to-transparent blur-3xl transform -rotate-12 transform-gpu"
        />
        <motion.div
          style={{ opacity: rayOpacity }}
          className="absolute -top-40 right-1/4 w-[700px] h-[1000px] bg-gradient-to-b from-[#9DE3D7]/20 via-[#0B526B]/15 to-transparent blur-3xl transform rotate-15 transform-gpu"
        />

        {/* Ambient Marine Snow / Tiny Bubbles */}
        <div className="absolute inset-0 opacity-40">
          <div className="marine-snow-layer w-full h-full" />
        </div>

        {/* GLIDING MARINE SILHOUETTES */}
        {/* 1. Manta Ray Gliding at Mid-Depth */}
        <motion.div
          initial={{ x: '-120%', y: '25%', opacity: 0 }}
          animate={{
            x: ['-20%', '120%'],
            y: ['25%', '30%', '22%'],
            opacity: [0, 0.18, 0.22, 0.18, 0],
          }}
          transition={{
            duration: 38,
            repeat: Infinity,
            ease: 'linear',
            delay: 4,
          }}
          className="absolute w-48 h-32 text-[#35C6C0]/25 pointer-events-none transform -rotate-6"
        >
          <svg viewBox="0 0 160 100" fill="currentColor" className="w-full h-full drop-shadow-lg">
            <path d="M80 15 C55 35, 10 45, 0 60 C25 65, 55 58, 80 50 C105 58, 135 65, 160 60 C150 45, 105 35, 80 15 Z M80 50 Q80 85 78 98 Q80 100 82 98 Q80 85 80 50 Z" />
          </svg>
        </motion.div>

        {/* 2. Sea Turtle Gliding Peacefully */}
        <motion.div
          initial={{ x: '120%', y: '60%', opacity: 0 }}
          animate={{
            x: ['120%', '-30%'],
            y: ['60%', '55%', '62%'],
            opacity: [0, 0.15, 0.25, 0.15, 0],
          }}
          transition={{
            duration: 45,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 14,
          }}
          className="absolute w-36 h-28 text-[#9DE3D7]/20 pointer-events-none transform rotate-12"
        >
          <svg viewBox="0 0 100 80" fill="currentColor" className="w-full h-full drop-shadow-md">
            <ellipse cx="50" cy="42" rx="24" ry="18" />
            <circle cx="50" cy="18" r="8" />
            <path d="M30 35 C15 25, 10 15, 20 18 C28 20, 32 30, 34 38 Z" />
            <path d="M70 35 C85 25, 90 15, 80 18 C72 20, 68 30, 66 38 Z" />
            <path d="M35 55 C25 65, 22 72, 28 70 C34 68, 38 60, 40 54 Z" />
            <path d="M65 55 C75 65, 78 72, 72 70 C66 68, 62 60, 60 54 Z" />
          </svg>
        </motion.div>

        {/* 3. Small Fish School darting */}
        <motion.div
          initial={{ x: '-50%', y: '82%', opacity: 0 }}
          animate={{
            x: ['-50%', '130%'],
            y: ['82%', '78%', '84%'],
            opacity: [0, 0.2, 0.28, 0.1, 0],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: 'linear',
            delay: 8,
          }}
          className="absolute w-56 h-20 text-[#35C6C0]/20 pointer-events-none"
        >
          <svg viewBox="0 0 120 40" fill="currentColor" className="w-full h-full">
            <path d="M10 15 Q20 10 30 15 Q20 20 10 15 Z M25 15 L20 12 L20 18 Z" transform="scale(0.8)" />
            <path d="M25 8 Q35 3 45 8 Q35 13 25 8 Z M40 8 L35 5 L35 11 Z" transform="scale(0.7)" />
            <path d="M18 25 Q28 20 38 25 Q28 30 18 25 Z M33 25 L28 22 L28 28 Z" transform="scale(0.75)" />
            <path d="M50 18 Q60 13 70 18 Q60 23 50 18 Z M65 18 L60 15 L60 21 Z" transform="scale(0.85)" />
            <path d="M40 30 Q50 25 60 30 Q50 35 40 30 Z M55 30 L50 27 L50 33 Z" transform="scale(0.65)" />
          </svg>
        </motion.div>
      </div>

      {/* FLOATING UNDERWATER HUD (DEPTH & AUDIO INDICATOR) */}
      <aside aria-label="Ocean Explorer HUD" className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        {/* Compact Depth Gauge */}
        <div className="hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#02080D]/90 backdrop-blur-md border border-white/[0.08] text-xs font-mono shadow-xl shadow-black/40">
          <div className="flex items-center gap-1.5 text-teal-400">
            <Compass className="w-3.5 h-3.5 animate-spin [animation-duration:16s]" />
            <span className="font-medium tracking-wide tabular-nums">{depthMeters.toLocaleString()} m</span>
          </div>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="text-slate-400 text-[11px] truncate max-w-[170px]">
            {zoneName}
          </span>
        </div>

        {/* Audio Ambient Control */}
        <button
          onClick={onToggleSound}
          className={`p-2.5 rounded-xl border backdrop-blur-md transition-all shadow-lg ${
            isMuted
              ? 'bg-[#02080D]/90 border-white/[0.08] text-slate-500 hover:text-slate-200'
              : 'bg-teal-500/10 border-teal-500/30 text-teal-300 hover:bg-teal-500/20'
          }`}
          title={isMuted ? 'Nyalakan Audio Kelautan' : 'Bisukan Suara'}
          aria-label={isMuted ? 'Nyalakan Audio' : 'Bisukan Suara'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Surface Quick-Jump */}
        {depthMeters > 300 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={scrollToTop}
            className="p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-slate-300 hover:text-white hover:bg-white/[0.1] transition-all shadow-lg cursor-pointer"
            title="Kembali ke Permukaan Laut"
            aria-label="Kembali ke Permukaan"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </aside>
    </>
  );
};
