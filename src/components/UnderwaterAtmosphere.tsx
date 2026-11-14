import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

export const UnderwaterAtmosphere: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    return scrollYProgress.on('change', (latest) => {
      setShowBackToTop(latest > 0.25);
    });
  }, [scrollYProgress]);

  const rayOpacity = useTransform(scrollYProgress, [0, 0.4], [0.24, 0.04]);

  const scrollToTop = () => {
    soundEffects.playBubblePop();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* FIXED NATURAL UNDERWATER ATMOSPHERE (Dark mode focused, ultra-subtle in Light mode) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-15 dark:opacity-100 transition-opacity duration-300" aria-hidden="true">
        <motion.div
          style={{ opacity: rayOpacity }}
          className="absolute -top-36 left-1/4 w-[580px] h-[860px] bg-gradient-to-b from-[#82AAA1]/15 via-[#17485A]/10 to-transparent blur-3xl transform -rotate-12 transform-gpu"
        />
        <motion.div
          style={{ opacity: rayOpacity }}
          className="absolute -top-44 right-1/4 w-[660px] h-[940px] bg-gradient-to-b from-[#EDEBE3]/8 via-[#102B38]/12 to-transparent blur-3xl transform rotate-12 transform-gpu"
        />

        <div className="absolute inset-0 opacity-30">
          <div className="marine-snow-layer w-full h-full" />
        </div>
      </div>

      {/* QUIET BACK-TO-SURFACE BUTTON ON DEEP SCROLL */}
      {showBackToTop && (
        <aside aria-label="Navigasi Permukaan" className="fixed bottom-5 right-5 z-40">
          <motion.button
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            onClick={scrollToTop}
            className="liquid-glass-pill p-2.5 rounded-full text-[var(--accent-teal)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            title="Kembali ke Permukaan Laut"
            aria-label="Kembali ke Permukaan"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        </aside>
      )}
    </>
  );
};
