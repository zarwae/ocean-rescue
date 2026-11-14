import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Timer,
  Flame,
  RotateCcw,
  Play,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  GAME_LEVELS,
  LevelConfig,
  DebrisObject,
  calculateClickOutcome,
  calculateGameAccuracy,
  calculateXpFromGame,
} from '../utils/gameRules';
import { soundEffects } from '../utils/soundEffects';

interface GameViewProps {
  onAwardXp: (xp: number, reason: string) => void;
  onRecordGame: (score: number, xpEarned: number) => void;
}

const ITEM_DEFINITIONS = [
  {
    type: 'bottle',
    name: 'Botol Plastik PET',
    isDebris: true,
    points: 20,
    renderIcon: (
      <svg viewBox="0 0 40 70" fill="none" className="w-full h-full drop-shadow-md">
        <rect x="14" y="2" width="12" height="6" rx="2" fill="#82AAA1" />
        <rect x="16" y="8" width="8" height="4" fill="#17485A" />
        <path d="M10 18 C10 12, 30 12, 30 18 L32 58 C32 64, 8 64, 8 58 Z" fill="#C7B99E" fillOpacity="0.65" stroke="#82AAA1" strokeWidth="1.5" />
        <path d="M12 25 L28 25 L27 45 L13 45 Z" fill="#367D7B" fillOpacity="0.45" />
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
        <path d="M15 15 C15 5, 25 5, 25 15 L25 22 L35 22 L35 15 C35 5, 45 5, 45 15 L48 50 C48 55, 12 55, 12 50 Z" fill="#EDEBE3" fillOpacity="0.6" stroke="#C7B99E" strokeWidth="1.5" />
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
        <rect x="5" y="5" width="40" height="30" rx="3" fill="#D98270" fillOpacity="0.85" stroke="#EDEBE3" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: 'net',
    name: 'Jaring Hantu',
    isDebris: true,
    points: 40,
    renderIcon: (
      <svg viewBox="0 0 70 70" fill="none" className="w-full h-full drop-shadow-lg">
        <path d="M10 20 Q35 10 60 20 Q55 55 35 60 Q15 55 10 20 Z" fill="#17485A" fillOpacity="0.4" stroke="#82AAA1" strokeWidth="1.5" />
        <path d="M15 25 L55 50 M15 45 L55 20 M25 15 L45 60 M45 15 L25 60" stroke="#C7B99E" strokeWidth="1.2" />
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
        <rect x="8" y="6" width="24" height="42" rx="4" fill="#D98270" stroke="#EDEBE3" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: 'turtle',
    name: 'Penyu Hijau Dilindungi',
    isDebris: false,
    points: 0,
    renderIcon: (
      <svg viewBox="0 0 70 60" fill="none" className="w-full h-full drop-shadow-xl">
        <ellipse cx="35" cy="30" rx="18" ry="14" fill="#367D7B" stroke="#82AAA1" strokeWidth="2" />
        <circle cx="55" cy="30" r="7" fill="#82AAA1" stroke="#EDEBE3" strokeWidth="1.2" />
        <path d="M22 20 C14 10, 8 16, 18 24 Z" fill="#82AAA1" />
        <path d="M48 20 C56 10, 62 16, 52 24 Z" fill="#82AAA1" />
        <path d="M22 40 C14 50, 8 44, 18 36 Z" fill="#82AAA1" />
        <path d="M48 40 C56 50, 62 44, 52 36 Z" fill="#82AAA1" />
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
        <path d="M15 20 C25 8, 48 10, 52 20 C48 30, 25 32, 15 20 Z" fill="#D98270" stroke="#EDEBE3" strokeWidth="1.5" />
        <path d="M15 20 L5 12 L5 28 Z" fill="#D98270" stroke="#EDEBE3" strokeWidth="1" />
        <path d="M28 10 Q32 20 28 30 M40 12 Q44 20 40 28" stroke="#EDEBE3" strokeWidth="3" strokeLinecap="round" />
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
        <path d="M30 55 L30 35 M30 35 C20 30, 15 20, 18 10 M30 35 C40 30, 45 20, 42 10" stroke="#367D7B" strokeWidth="4" strokeLinecap="round" />
        <circle cx="18" cy="10" r="4" fill="#82AAA1" />
        <circle cx="42" cy="10" r="4" fill="#82AAA1" />
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

  const scoreRef = useRef(score);
  const correctHitsRef = useRef(correctHits);
  const wrongHitsRef = useRef(wrongHits);
  const currentLevelRef = useRef(currentLevel);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { correctHitsRef.current = correctHits; }, [correctHits]);
  useEffect(() => { wrongHitsRef.current = wrongHits; }, [wrongHits]);
  useEffect(() => { currentLevelRef.current = currentLevel; }, [currentLevel]);

  const spawnObject = () => {
    const isWildlife = Math.random() < 0.28;
    const candidates = ITEM_DEFINITIONS.filter((d) => (isWildlife ? !d.isDebris : d.isDebris));
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];

    const newObj: DebrisObject = {
      id: `${Date.now()}-${Math.random()}`,
      name: chosen.name,
      isDebris: chosen.isDebris,
      points: chosen.points,
      type: chosen.type as DebrisObject['type'],
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
          colors: ['#82AAA1', '#367D7B', '#D98270', '#C7B99E'],
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
      if (outcome.newCombo > 2) soundEffects.playChime(outcome.newCombo);
    } else {
      setWrongHits((p) => {
        const next = p + 1;
        wrongHitsRef.current = next;
        return next;
      });
      soundEffects.playWarning();
    }

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

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] pt-28 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Clean Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[var(--border-hairline)]">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-[var(--accent-teal)] font-semibold block">
              Mini-Game Konservasi · Level {currentLevel.level}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl text-[var(--text-primary)]">
              Ocean Cleanup: Penjaga Kedalaman
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Angkat sampah plastik yang hanyut. Hindari menyentuh penyu, ikan karang, dan terumbu hidup.
            </p>
          </div>
          <span className="text-xs font-medium text-[var(--accent-sand)] shrink-0">
            {currentLevel.name}
          </span>
        </div>

        {/* BORDERLESS AQUARIUM STAGE */}
        <div className="relative rounded-2xl bg-[#091C25] text-[#EDEBE3] shadow-2xl overflow-hidden min-h-[540px] flex flex-col justify-between select-none">
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#17485A]/45 via-[#102B38]/75 to-[#061116]" />
            <div className="absolute bottom-0 inset-x-0 h-16 flex justify-around opacity-30 text-[#367D7B]">
              <div className="w-10 h-14 bg-gradient-to-t from-[#367D7B] to-transparent rounded-t-full animate-sway" />
              <div className="w-12 h-16 bg-gradient-to-t from-[#17485A] to-transparent rounded-t-full animate-sway" />
              <div className="w-8 h-12 bg-gradient-to-t from-[#367D7B] to-transparent rounded-t-full animate-sway" />
            </div>
          </div>

          {/* Clean Top HUD Bar */}
          <div className="relative z-20 px-5 py-3.5 flex items-center justify-between gap-4 bg-[#061116]/75 backdrop-blur-md text-xs">
            <div className="flex items-center gap-4 tabular-nums">
              <span>
                Skor: <strong className={score >= currentLevel.targetScore ? 'text-[#82AAA1]' : 'text-[#EDEBE3]'}>{score}</strong>
                <span className="text-[#8FA3AC]"> / {currentLevel.targetScore}</span>
              </span>
              {score >= currentLevel.targetScore && (
                <button
                  onClick={finishGame}
                  className="inline-flex items-center gap-1 text-[#82AAA1] hover:underline font-semibold cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Klaim Menang</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-5 tabular-nums">
              <span className="flex items-center gap-1 text-[#C7B99E]">
                <Flame className="w-3.5 h-3.5 text-[#D98270]" />
                {combo}×
              </span>
              <span className="hidden sm:inline text-[#8FA3AC]">Akurasi {accuracyPercent}%</span>
              <span className={`flex items-center gap-1 font-semibold ${timeLeft <= 10 ? 'text-[#D98270]' : 'text-[#82AAA1]'}`}>
                <Timer className="w-3.5 h-3.5" />
                {String(timeLeft).padStart(2, '0')}s
              </span>
            </div>
          </div>

          {/* PLAY AREA */}
          <div ref={playAreaRef} className="relative z-10 flex-1 min-h-[400px] p-4 overflow-hidden">
            <AnimatePresence>
              {floatingFeedback && (
                <motion.div
                  key={floatingFeedback.id}
                  initial={{ opacity: 1, y: 0, scale: 0.8 }}
                  animate={{ opacity: 0, y: -45, scale: 1.15 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75 }}
                  className={`absolute z-30 pointer-events-none font-display font-bold text-xs px-3 py-1 rounded-full shadow-xl whitespace-nowrap ${
                    floatingFeedback.isCorrect
                      ? 'bg-[#367D7B] text-[#EDEBE3]'
                      : 'bg-[#D98270] text-[#061116]'
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

            {/* MENU */}
            {gameState === 'menu' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-lg mx-auto">
                <div className="space-y-2">
                  <h3 className="font-display text-2xl sm:text-3xl text-[#EDEBE3]">
                    Siap Membersihkan Kedalaman?
                  </h3>
                  <p className="text-xs text-[#98ACB5] leading-relaxed">
                    Klik botol, kresek, dan jaring hantu. Jangan sentuh penyu, ikan karang, atau koral hidup!
                  </p>
                </div>

                {/* Unboxed Underline Level Switcher */}
                <div className="flex flex-wrap items-center justify-center gap-4 border-b border-[#EDEBE3]/15 pb-3">
                  {GAME_LEVELS.map((lvl, idx) => (
                    <button
                      key={lvl.level}
                      onClick={() => setCurrentLevelIndex(idx)}
                      className={`text-xs transition-colors cursor-pointer pb-1 ${
                        currentLevelIndex === idx
                          ? 'text-[#82AAA1] font-semibold border-b-2 border-[#82AAA1]'
                          : 'text-[#8FA3AC] hover:text-[#EDEBE3]'
                      }`}
                    >
                      Lvl {lvl.level} · {lvl.name.split(' ')[0]}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => startLevel(currentLevelIndex)}
                  className="px-8 py-3 rounded-full bg-[#367D7B] hover:bg-[#82AAA1] text-[#EDEBE3] hover:text-[#061116] font-semibold text-xs tracking-wide transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Mulai Level {currentLevel.level}</span>
                </button>
              </div>
            )}

            {/* PLAYING */}
            {gameState === 'playing' && (
              <div className="relative w-full h-full min-h-[360px]">
                {activeObjects.map((obj) => {
                  const def = ITEM_DEFINITIONS.find((d) => d.type === obj.type) || ITEM_DEFINITIONS[0];
                  return (
                    <motion.button
                      key={obj.id}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1, y: [0, -8, 4, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      onClick={(e) => handleObjectClick(obj, e)}
                      style={{
                        position: 'absolute',
                        left: `${obj.x}%`,
                        top: `${obj.y}%`,
                        width: `${obj.size}px`,
                        height: `${obj.size}px`,
                      }}
                      className="cursor-pointer transform hover:scale-110 active:scale-95 transition-transform p-1 flex flex-col items-center justify-center focus:outline-none"
                      title={def.name}
                    >
                      <div className="w-full h-full">{def.renderIcon}</div>
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-1 whitespace-nowrap ${
                          def.isDebris
                            ? 'bg-[#061116]/80 text-[#82AAA1]'
                            : 'bg-[#D98270]/90 text-[#061116]'
                        }`}
                      >
                        {def.isDebris ? `+${def.points}` : 'Dilindungi'}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* LEVEL CLEAR */}
            {gameState === 'levelclear' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5 max-w-md mx-auto">
                <Trophy className="w-10 h-10 text-[#C7B99E]" />
                <div className="space-y-1">
                  <h3 className="font-display text-2xl text-[#EDEBE3]">
                    Level {currentLevel.level} Selesai!
                  </h3>
                  <p className="text-xs text-[#98ACB5]">
                    Skor {score} · Akurasi {accuracyPercent}% · +{calculateXpFromGame(score, accuracyPercent, currentLevel.level)} XP
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => startLevel(currentLevelIndex)}
                    className="px-5 py-2.5 rounded-full bg-[#EDEBE3]/10 text-xs text-[#EDEBE3] flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ulangi</span>
                  </button>
                  {currentLevelIndex < GAME_LEVELS.length - 1 ? (
                    <button
                      onClick={() => startLevel(currentLevelIndex + 1)}
                      className="px-6 py-2.5 rounded-full bg-[#367D7B] hover:bg-[#82AAA1] text-[#EDEBE3] hover:text-[#061116] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Level Berikutnya</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setGameState('menu')}
                      className="px-6 py-2.5 rounded-full bg-[#367D7B] text-[#EDEBE3] text-xs font-semibold cursor-pointer"
                    >
                      Selesai
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* GAME OVER */}
            {gameState === 'gameover' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5 max-w-md mx-auto">
                <ShieldAlert className="w-10 h-10 text-[#D98270]" />
                <div className="space-y-1">
                  <h3 className="font-display text-2xl text-[#EDEBE3]">Target Belum Tercapai</h3>
                  <p className="text-xs text-[#98ACB5]">
                    Skor {score} / target {currentLevel.targetScore}. Jaga combo dan hindari satwa laut!
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGameState('menu')}
                    className="px-5 py-2.5 rounded-full bg-[#EDEBE3]/10 text-xs text-[#EDEBE3] cursor-pointer"
                  >
                    Menu
                  </button>
                  <button
                    onClick={() => startLevel(currentLevelIndex)}
                    className="px-6 py-2.5 rounded-full bg-[#EDEBE3] text-[#061116] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Coba Lagi</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 px-5 py-2.5 bg-[#061116]/75 flex items-center justify-between text-[11px] text-[#8FA3AC]">
            <span>Zona: {currentLevel.depthName}</span>
            <span>Jaga combo streak untuk poin ekstra</span>
          </div>
        </div>
      </div>
    </div>
  );
};
