import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Trophy, 
  Timer, 
  Flame, 
  RotateCcw, 
  Play, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  ArrowRight,
  Sparkles,
  Waves
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  GAME_LEVELS, 
  LevelConfig, 
  DebrisObject, 
  calculateClickOutcome, 
  calculateGameAccuracy, 
  calculateXpFromGame 
} from '../utils/gameRules';
import { soundEffects } from '../utils/soundEffects';

interface GameViewProps {
  onAwardXp: (xp: number, reason: string) => void;
  onRecordGame: (score: number, xpEarned: number) => void;
}

// High-fidelity SVG items (No plain emojis!)
const ITEM_DEFINITIONS = [
  {
    type: 'bottle',
    name: 'Botol Plastik PET',
    isDebris: true,
    points: 20,
    renderIcon: (
      <svg viewBox="0 0 40 70" fill="none" className="w-full h-full drop-shadow-md">
        <rect x="14" y="2" width="12" height="6" rx="2" fill="#35C6C0" />
        <rect x="16" y="8" width="8" height="4" fill="#0B526B" />
        <path d="M10 18 C10 12, 30 12, 30 18 L32 58 C32 64, 8 64, 8 58 Z" fill="#9DE3D7" fillOpacity="0.75" stroke="#35C6C0" strokeWidth="1.5" />
        <path d="M12 25 L28 25 L27 45 L13 45 Z" fill="#087F8C" fillOpacity="0.4" />
        <line x1="14" y1="20" x2="14" y2="54" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    type: 'bag',
    name: 'Kantong Kresek Plastik',
    isDebris: true,
    points: 25,
    renderIcon: (
      <svg viewBox="0 0 60 60" fill="none" className="w-full h-full drop-shadow-md">
        <path d="M15 15 C15 5, 25 5, 25 15 L25 22 L35 22 L35 15 C35 5, 45 5, 45 15 L48 50 C48 55, 12 55, 12 50 Z" fill="#F4F7F5" fillOpacity="0.6" stroke="#9DE3D7" strokeWidth="1.5" />
        <ellipse cx="30" cy="35" rx="12" ry="10" fill="#35C6C0" fillOpacity="0.2" />
        <path d="M18 28 Q30 35 42 28" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.7" />
      </svg>
    ),
  },
  {
    type: 'wrapper',
    name: 'Kemasan Sachet Plastik',
    isDebris: true,
    points: 15,
    renderIcon: (
      <svg viewBox="0 0 50 40" fill="none" className="w-full h-full drop-shadow-md">
        <rect x="5" y="5" width="40" height="30" rx="3" fill="#FF806B" fillOpacity="0.75" stroke="#E8DCC7" strokeWidth="1.5" />
        <path d="M5 8 L45 8 M5 32 L45 32" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="25" cy="20" r="6" fill="#0B526B" fillOpacity="0.5" />
      </svg>
    ),
  },
  {
    type: 'net',
    name: 'Jaring Hantu (Ghost Net)',
    isDebris: true,
    points: 40,
    renderIcon: (
      <svg viewBox="0 0 70 70" fill="none" className="w-full h-full drop-shadow-lg">
        <path d="M10 20 Q35 10 60 20 Q55 55 35 60 Q15 55 10 20 Z" fill="#087F8C" fillOpacity="0.3" stroke="#35C6C0" strokeWidth="1.5" />
        <path d="M15 25 L55 50 M15 45 L55 20 M25 15 L45 60 M45 15 L25 60" stroke="#9DE3D7" strokeWidth="1" strokeOpacity="0.8" />
        <circle cx="15" cy="25" r="3" fill="#E8DCC7" />
        <circle cx="55" cy="50" r="3" fill="#E8DCC7" />
        <circle cx="35" cy="60" r="3" fill="#E8DCC7" />
      </svg>
    ),
  },
  {
    type: 'can',
    name: 'Kaleng Alumunium',
    isDebris: true,
    points: 20,
    renderIcon: (
      <svg viewBox="0 0 40 55" fill="none" className="w-full h-full drop-shadow-md">
        <rect x="8" y="6" width="24" height="42" rx="4" fill="#FF806B" stroke="#F4F7F5" strokeWidth="1.5" />
        <ellipse cx="20" cy="7" rx="10" ry="3" fill="#E8DCC7" />
        <ellipse cx="20" cy="47" rx="10" ry="3" fill="#0A2435" />
        <line x1="12" y1="18" x2="28" y2="35" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.5" />
      </svg>
    ),
  },
  // PROTECTED WILDLIFE & CORALS (DO NOT CLICK!)
  {
    type: 'turtle',
    name: 'Penyu Hijau Dilindungi',
    isDebris: false,
    points: 0,
    renderIcon: (
      <svg viewBox="0 0 70 60" fill="none" className="w-full h-full drop-shadow-xl animate-pulse">
        <ellipse cx="35" cy="30" rx="18" ry="14" fill="#087F8C" stroke="#9DE3D7" strokeWidth="2" />
        <circle cx="55" cy="30" r="7" fill="#35C6C0" stroke="#9DE3D7" strokeWidth="1.5" />
        <path d="M22 20 C14 10, 8 16, 18 24 Z" fill="#35C6C0" />
        <path d="M48 20 C56 10, 62 16, 52 24 Z" fill="#35C6C0" />
        <path d="M22 40 C14 50, 8 44, 18 36 Z" fill="#35C6C0" />
        <path d="M48 40 C56 50, 62 44, 52 36 Z" fill="#35C6C0" />
        <circle cx="56" cy="28" r="1.5" fill="#031019" />
      </svg>
    ),
  },
  {
    type: 'fish',
    name: 'Ikan Karang Badut',
    isDebris: false,
    points: 0,
    renderIcon: (
      <svg viewBox="0 0 60 40" fill="none" className="w-full h-full drop-shadow-md">
        <path d="M15 20 C25 8, 48 10, 52 20 C48 30, 25 32, 15 20 Z" fill="#FF806B" stroke="#F4F7F5" strokeWidth="1.5" />
        <path d="M15 20 L5 12 L5 28 Z" fill="#FF806B" stroke="#F4F7F5" strokeWidth="1" />
        <path d="M28 10 Q32 20 28 30 M40 12 Q44 20 40 28" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <circle cx="48" cy="18" r="2" fill="#031019" />
      </svg>
    ),
  },
  {
    type: 'coral',
    name: 'Koloni Karang Hidup',
    isDebris: false,
    points: 0,
    renderIcon: (
      <svg viewBox="0 0 60 60" fill="none" className="w-full h-full drop-shadow-lg">
        <path d="M30 55 L30 35 M30 35 C20 30, 15 20, 18 10 M30 35 C40 30, 45 20, 42 10 M25 25 C15 25, 10 32, 8 28 M35 25 C45 25, 50 32, 52 28" stroke="#35C6C0" strokeWidth="4" strokeLinecap="round" />
        <circle cx="18" cy="10" r="4" fill="#9DE3D7" />
        <circle cx="42" cy="10" r="4" fill="#9DE3D7" />
        <circle cx="8" cy="28" r="3" fill="#E8DCC7" />
        <circle cx="52" cy="28" r="3" fill="#E8DCC7" />
      </svg>
    ),
  },
];

export const GameView: React.FC<GameViewProps> = ({ onAwardXp, onRecordGame }) => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover' | 'levelclear'>('menu');
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [correctHits, setCorrectHits] = useState(0);
  const [wrongHits, setWrongHits] = useState(0);
  const [activeObjects, setActiveObjects] = useState<DebrisObject[]>([]);
  const [floatingFeedback, setFloatingFeedback] = useState<{ id: string; text: string; x: number; y: number; isCorrect: boolean } | null>(null);

  const currentLevel: LevelConfig = GAME_LEVELS[currentLevelIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const spawnRef = useRef<NodeJS.Timeout | null>(null);
  const playAreaRef = useRef<HTMLDivElement | null>(null);

  // Ref mirrors to prevent stale closure bugs when timer expires
  const scoreRef = useRef(score);
  const correctHitsRef = useRef(correctHits);
  const wrongHitsRef = useRef(wrongHits);
  const currentLevelRef = useRef(currentLevel);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    correctHitsRef.current = correctHits;
  }, [correctHits]);

  useEffect(() => {
    wrongHitsRef.current = wrongHits;
  }, [wrongHits]);

  useEffect(() => {
    currentLevelRef.current = currentLevel;
  }, [currentLevel]);

  const spawnObject = () => {
    const isWildlife = Math.random() < 0.28;
    const candidates = ITEM_DEFINITIONS.filter((d) => (isWildlife ? !d.isDebris : d.isDebris));
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];

    const newObj: DebrisObject = {
      id: `${Date.now()}-${Math.random()}`,
      name: chosen.name,
      isDebris: chosen.isDebris,
      points: chosen.points,
      type: chosen.type as any,
      x: Math.floor(Math.random() * 75) + 12,
      y: Math.floor(Math.random() * 65) + 18,
      speedX: (Math.random() - 0.5) * 1.5 * currentLevel.debrisSpeedMultiplier,
      speedY: (Math.random() - 0.5) * 1.5 * currentLevel.debrisSpeedMultiplier,
      size: chosen.isDebris ? 54 : 64,
    };

    setActiveObjects((prev) => [...prev.slice(-8), newObj]);
  };

  const startLevel = (levelIdx: number) => {
    setCurrentLevelIndex(levelIdx);
    const lvl = GAME_LEVELS[levelIdx];
    currentLevelRef.current = lvl;
    scoreRef.current = 0;
    correctHitsRef.current = 0;
    wrongHitsRef.current = 0;
    setTimeLeft(lvl.durationSeconds);
    setScore(0);
    setCombo(0);
    setCorrectHits(0);
    setWrongHits(0);
    setActiveObjects([]);
    setFloatingFeedback(null);
    setGameState('playing');
    soundEffects.playBubblePop();
  };

  // Timer tick interval: ONLY decrements timeLeft, never calls finishGame directly inside updater
  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    spawnRef.current = setInterval(() => {
      spawnObject();
    }, currentLevel.spawnIntervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [gameState, currentLevelIndex]);

  // Clean, non-stale trigger when timeLeft reaches 0
  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
      finishGame();
    }
  }, [timeLeft, gameState]);

  const finishGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);

    const finalScore = scoreRef.current;
    const finalLevel = currentLevelRef.current;
    const accuracy = calculateGameAccuracy(correctHitsRef.current, wrongHitsRef.current);
    const xp = calculateXpFromGame(finalScore, accuracy, finalLevel.level);
    const isTargetMet = finalScore >= finalLevel.targetScore;

    onAwardXp(xp, `Menyelesaikan Game Ocean Cleanup Level ${finalLevel.level}`);
    onRecordGame(finalScore, xp);

    if (isTargetMet) {
      soundEffects.playFanfare();
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#35C6C0', '#9DE3D7', '#FF806B', '#E8DCC7'],
        });
      } catch {}
      setGameState('levelclear');
    } else {
      setGameState('gameover');
    }
  };

  const handleObjectClick = (obj: DebrisObject, e: React.MouseEvent) => {
    if (gameState !== 'playing') return;

    const outcome = calculateClickOutcome(obj, combo);
    setScore((prev) => {
      const nextScore = Math.max(0, prev + outcome.scoreDelta);
      scoreRef.current = nextScore;
      return nextScore;
    });
    setCombo(outcome.newCombo);

    if (outcome.isCorrect) {
      setCorrectHits((p) => {
        const next = p + 1;
        correctHitsRef.current = next;
        return next;
      });
      soundEffects.playBubblePop();
      if (outcome.newCombo > 2) {
        soundEffects.playChime(outcome.newCombo);
      }
    } else {
      setWrongHits((p) => {
        const next = p + 1;
        wrongHitsRef.current = next;
        return next;
      });
      soundEffects.playWarning();
    }

    // Measure relative to playAreaRef to stay contained within aquarium tank
    if (playAreaRef.current) {
      const playRect = playAreaRef.current.getBoundingClientRect();
      const clickRect = e.currentTarget.getBoundingClientRect();
      const relX = Math.max(40, Math.min(playRect.width - 40, clickRect.left - playRect.left + clickRect.width / 2));
      const relY = Math.max(40, Math.min(playRect.height - 40, clickRect.top - playRect.top));

      setFloatingFeedback({
        id: `${Date.now()}`,
        text: outcome.message,
        x: relX,
        y: relY,
        isCorrect: outcome.isCorrect,
      });
    }

    setActiveObjects((prev) => prev.filter((o) => o.id !== obj.id));
  };

  const accuracyPercent = calculateGameAccuracy(correctHits, wrongHits);
  const targetProgress = Math.min(100, Math.round((score / currentLevel.targetScore) * 100));

  return (
    <div className="min-h-screen bg-[#040D14] text-[#F4F7F5] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-teal-400 font-medium">
              <Gamepad2 className="w-4 h-4" />
              <span>Simulasi Interaktif · Pembersihan Sampah Laut</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-white">
              Game Ocean Cleanup: Penjaga Kedalaman
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Pilih dan angkat sampah plastik yang mengapung di lautan. Lindungi fauna dan karang hidup dari sentuhan!
            </p>
          </div>

          <div className="text-xs font-mono text-teal-300 bg-white/[0.04] px-3.5 py-1.5 rounded-lg border border-white/[0.1]">
            Level {currentLevel.level}: {currentLevel.name}
          </div>
        </div>

        {/* GAME CONTAINER TANK */}
        <div className="relative rounded-2xl border border-white/[0.1] bg-[#02080D] shadow-2xl overflow-hidden min-h-[540px] flex flex-col justify-between select-none">
          
          {/* Animated Aquarium Background Layers */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Water Caustic Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#087F8C]/25 via-[#0A2435]/60 to-[#031019]" />
            
            {/* Subtle Sunrays */}
            <div className="absolute -top-12 left-1/4 w-72 h-96 bg-gradient-to-b from-[#35C6C0]/20 to-transparent blur-2xl transform -rotate-12" />
            <div className="absolute -top-12 right-1/4 w-80 h-96 bg-gradient-to-b from-[#9DE3D7]/15 to-transparent blur-2xl transform rotate-15" />

            {/* Rising Bubbles Stream */}
            <div className="absolute bottom-0 left-10 w-2 h-2 rounded-full bg-[#35C6C0]/40 animate-bounce duration-1000" />
            <div className="absolute bottom-0 left-1/3 w-3 h-3 rounded-full bg-[#9DE3D7]/30 animate-pulse duration-700" />
            <div className="absolute bottom-0 right-1/4 w-2 h-2 rounded-full bg-[#35C6C0]/40 animate-bounce duration-900" />

            {/* Swaying Seaweed along the seafloor */}
            <div className="absolute bottom-0 inset-x-0 h-16 flex justify-around opacity-30 text-[#087F8C]">
              <div className="w-10 h-14 bg-gradient-to-t from-[#087F8C] to-transparent rounded-t-full transform -rotate-6 animate-sway" />
              <div className="w-12 h-16 bg-gradient-to-t from-[#0B526B] to-transparent rounded-t-full transform rotate-12 animate-sway" />
              <div className="w-8 h-12 bg-gradient-to-t from-[#087F8C] to-transparent rounded-t-full transform -rotate-3 animate-sway" />
              <div className="w-14 h-16 bg-gradient-to-t from-[#0B526B] to-transparent rounded-t-full transform rotate-6 animate-sway" />
            </div>
          </div>

          {/* TOP HUD (SCORE, TARGET, COMBO, TIMER) */}
          <div className="relative z-20 p-3 sm:p-5 flex items-center justify-between gap-2 sm:gap-4 border-b border-white/[0.08] bg-[#02080D]/85 backdrop-blur-md">
            
            {/* Score & Target */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Skor / Target
                </span>
                <div className="text-lg sm:text-2xl font-display font-medium text-white tabular-nums whitespace-nowrap">
                  <span className={score >= currentLevel.targetScore ? 'text-teal-300' : ''}>{score}</span>
                  <span className="text-xs text-slate-500 font-normal ml-1">/ {currentLevel.targetScore}</span>
                </div>
              </div>

              {/* Target Mini Bar */}
              <div className="w-16 sm:w-28 h-2 rounded-full bg-white/[0.06] border border-white/[0.08] overflow-hidden hidden sm:block shrink-0">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-300 transition-all duration-300"
                  style={{ width: `${targetProgress}%` }}
                />
              </div>
            </div>

            {/* Middle: Target Met Badge & Combo */}
            <div className="flex items-center gap-2 shrink-0">
              {score >= currentLevel.targetScore ? (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-xs font-mono font-medium whitespace-nowrap shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Target Tercapai</span>
                  </div>

                  {/* Optional Quick Finish button once target is met */}
                  <button
                    onClick={finishGame}
                    className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 text-[10px] font-semibold font-mono tracking-wide shadow-sm transition-all cursor-pointer whitespace-nowrap"
                    title="Target sudah tercapai! Anda dapat menyelesaikan level sekarang atau terus mengumpulkan poin."
                  >
                    <span>Klaim Menang</span>
                  </button>
                </div>
              ) : null}

              {/* Combo Streak */}
              <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono shrink-0 whitespace-nowrap">
                <Flame className={`w-3.5 h-3.5 ${combo > 2 ? 'text-rose-400 animate-bounce' : 'text-slate-500'}`} />
                <span className={combo > 1 ? 'text-rose-400 font-medium' : 'text-slate-400'}>
                  {combo}x
                </span>
              </div>
            </div>

            {/* Right: Accuracy & Countdown Timer */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Accuracy (desktop only) */}
              <div className="hidden md:flex flex-col text-right shrink-0">
                <span className="text-[10px] font-mono text-[#70858E] uppercase">Akurasi</span>
                <span className="text-sm font-mono font-bold text-[#9DE3D7] tabular-nums">{accuracyPercent}%</span>
              </div>

              {/* Countdown Timer with fixed width, no wrap, no overlap */}
              <div 
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-mono font-bold shrink-0 min-w-[76px] sm:min-w-[84px] whitespace-nowrap tabular-nums transition-colors ${
                  timeLeft <= 10 
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-sm'
                    : 'bg-white/[0.04] border-white/[0.08] text-cyan-300'
                }`}
                title={`Sisa waktu: ${timeLeft} detik`}
              >
                <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>{String(timeLeft).padStart(2, '0')}s</span>
              </div>
            </div>

          </div>

          {/* MAIN ACTIVE PLAY AREA */}
          <div ref={playAreaRef} className="relative z-10 flex-1 min-h-[380px] p-4 overflow-hidden">
            
            {/* FLOATING SCORE POP EFFECT (Contained inside playAreaRef so it never overlaps HUD) */}
            <AnimatePresence>
              {floatingFeedback && (
                <motion.div
                  key={floatingFeedback.id}
                  initial={{ opacity: 1, y: 0, scale: 0.8 }}
                  animate={{ opacity: 0, y: -45, scale: 1.15 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75 }}
                  className={`absolute z-30 pointer-events-none font-display font-extrabold text-xs sm:text-sm px-3 py-1 rounded-full shadow-xl whitespace-nowrap ${
                    floatingFeedback.isCorrect
                      ? 'bg-[#35C6C0] text-[#031019]'
                      : 'bg-[#FF806B] text-white'
                  }`}
                  style={{ 
                    left: `${floatingFeedback.x}px`, 
                    top: `${floatingFeedback.y}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {floatingFeedback.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* A. MENU STATE (LEVEL SELECTOR) */}
            {gameState === 'menu' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-xl mx-auto my-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#087F8C]/20 border border-[#35C6C0]/40 flex items-center justify-center text-[#35C6C0]">
                  <Waves className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-2xl text-[#F4F7F5]">
                    Siap Menyelam dan Membersihkan Laut?
                  </h3>
                  <p className="text-xs text-[#A8BAC1] leading-relaxed">
                    Klik atau sentuh botol, kantong kresek, dan jaring hantu. Hindari menyentuh penyu laut, ikan karang, atau koral hidup agar ekosistem tidak terganggu!
                  </p>
                </div>

                {/* Level selector list */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
                  {GAME_LEVELS.map((lvl, idx) => (
                    <button
                      key={lvl.level}
                      onClick={() => setCurrentLevelIndex(idx)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        currentLevelIndex === idx
                          ? 'bg-white text-slate-950 font-medium border-white shadow-sm'
                          : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-[10px] font-mono uppercase">Level {lvl.level}</div>
                      <div className="text-xs truncate">{lvl.name.split(' ')[0]}</div>
                      <div className="text-[9px] opacity-75">{lvl.targetScore} pts</div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => startLevel(currentLevelIndex)}
                  className="px-8 py-3.5 rounded-full bg-[#35C6C0] text-[#031019] font-bold text-xs uppercase tracking-wider hover:bg-[#9DE3D7] transition-all shadow-xl shadow-[#35C6C0]/25 flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Mulai Menyelam (Level {currentLevel.level})</span>
                </button>
              </div>
            )}

            {/* B. PLAYING STATE: FLOATING INTERACTIVE GRAPHIC OBJECTS */}
            {gameState === 'playing' && (
              <div className="relative w-full h-full min-h-[360px]">
                {activeObjects.map((obj) => {
                  const def = ITEM_DEFINITIONS.find((d) => d.type === obj.type) || ITEM_DEFINITIONS[0];
                  return (
                    <motion.button
                      key={obj.id}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        y: [0, -8, 4, 0],
                        rotate: [0, 4, -4, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      onClick={(e) => handleObjectClick(obj, e)}
                      style={{
                        position: 'absolute',
                        left: `${obj.x}%`,
                        top: `${obj.y}%`,
                        width: `${obj.size}px`,
                        height: `${obj.size}px`,
                      }}
                      className="cursor-pointer transform hover:scale-110 active:scale-95 transition-transform p-1 rounded-2xl group flex flex-col items-center justify-center focus:outline-none"
                      title={def.name}
                    >
                      <div className="w-full h-full">
                        {def.renderIcon}
                      </div>

                      {/* Quiet Identifier Tag */}
                      <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-full mt-1 whitespace-nowrap shadow-md ${
                        def.isDebris 
                          ? 'bg-[#031019]/90 text-[#35C6C0] border border-[#35C6C0]/40'
                          : 'bg-[#FF806B]/20 text-[#FF806B] border border-[#FF806B]/50'
                      }`}>
                        {def.isDebris ? `+${def.points}` : 'DILINDUNGI!'}
                      </span>
                    </motion.button>
                  );
                })}

                {activeObjects.length === 0 && (
                  <div className="h-full flex items-center justify-center text-xs text-[#70858E] font-mono">
                    Mengintai kedalaman samudra... Sampah baru akan segera hanyut...
                  </div>
                )}
              </div>
            )}

            {/* C. LEVEL CLEAR STATE */}
            {gameState === 'levelclear' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5 max-w-md mx-auto my-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#35C6C0]/20 border border-[#35C6C0] flex items-center justify-center text-[#35C6C0]">
                  <Trophy className="w-8 h-8 text-amber-300" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-mono text-[#35C6C0] uppercase tracking-wider">
                    MISI SELESAI DENGAN SUKSES!
                  </div>
                  <h3 className="font-display font-bold text-2xl text-[#F4F7F5]">
                    Level {currentLevel.level} Dituntaskan!
                  </h3>
                  <p className="text-xs text-[#A8BAC1]">
                    Anda berhasil memungut sampah laut berbahaya tanpa merusak terumbu dan fauna dilindungi.
                  </p>
                </div>

                {/* Score Stats Board */}
                <div className="grid grid-cols-3 gap-2 w-full p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Total Skor</div>
                    <div className="text-lg font-display font-light text-cyan-300 tabular-nums">{score}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Akurasi</div>
                    <div className="text-lg font-display font-light text-white tabular-nums">{accuracyPercent}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">XP Bonus</div>
                    <div className="text-lg font-display font-light text-amber-300 tabular-nums">
                      +{calculateXpFromGame(score, accuracyPercent, currentLevel.level)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full">
                  <button
                    onClick={() => startLevel(currentLevelIndex)}
                    className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/20 text-xs font-medium text-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ulangi</span>
                  </button>

                  {currentLevelIndex < GAME_LEVELS.length - 1 ? (
                    <button
                      onClick={() => startLevel(currentLevelIndex + 1)}
                      className="flex-1 py-3 rounded-full bg-[#35C6C0] text-[#031019] text-xs font-bold uppercase tracking-wider hover:bg-[#9DE3D7] flex items-center justify-center gap-2 shadow-lg shadow-[#35C6C0]/20 cursor-pointer"
                    >
                      <span>Level Berikutnya</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setGameState('menu')}
                      className="flex-1 py-3 rounded-full bg-[#35C6C0] text-[#031019] text-xs font-bold uppercase tracking-wider hover:bg-[#9DE3D7] cursor-pointer"
                    >
                      Kembali ke Menu
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* D. GAME OVER STATE */}
            {gameState === 'gameover' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5 max-w-md mx-auto my-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#FF806B]/20 border border-[#FF806B] flex items-center justify-center text-[#FF806B]">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-2xl text-[#F4F7F5]">
                    Target Belum Tercapai
                  </h3>
                  <p className="text-xs text-[#A8BAC1]">
                    Skor akhir ({score}) belum memenuhi ambang target ({currentLevel.targetScore}). Jaga combo dan hindari menyentuh satwa laut!
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full pt-2">
                  <button
                    onClick={() => setGameState('menu')}
                    className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 cursor-pointer transition-colors"
                  >
                    Menu Utama
                  </button>
                  <button
                    onClick={() => startLevel(currentLevelIndex)}
                    className="flex-1 py-3 rounded-xl bg-white text-slate-950 text-xs font-medium uppercase tracking-wider hover:bg-cyan-100 flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Coba Lagi</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* BOTTOM GAME FOOTER INFO */}
          <div className="relative z-10 px-5 py-3 border-t border-white/[0.06] bg-[#02080D]/90 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 font-mono gap-1">
            <span>Zona: {currentLevel.depthName}</span>
            <span>Tips: Jaga combo streak untuk melipatgandakan perolehan poin</span>
          </div>

        </div>

      </div>
    </div>
  );
};
