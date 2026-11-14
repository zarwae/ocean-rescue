import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Timer,
  Flame,
  RotateCcw,
  Play,
  ShieldAlert,
  ArrowRight,
  Anchor,
  Waves,
  Heart,
  Sparkles,
  Zap,
  Skull,
  Fish,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  GAME_LEVELS,
  LevelConfig,
  DebrisObject,
  FishingBoat,
  HazardProjectile,
  LevelBoss,
  calculateClickOutcome,
  calculateBoatClickOutcome,
  calculateBoatEscapePenalty,
  calculateHazardParryOutcome,
  calculateBossClickOutcome,
  calculateGameAccuracy,
  calculateXpFromGame,
} from '../utils/gameRules';
import { soundEffects } from '../utils/soundEffects';
import { OceanEcosystemBackdrop } from '../components/OceanEcosystemBackdrop';
import { renderEnemySprite, renderHazardSprite, renderCompanionSprite } from '../components/GameSprites';
import { FeedingFrenzyGame } from '../components/FeedingFrenzyGame';
import { ThemeMode } from '../hooks/useTheme';

interface GameViewProps {
  onAwardXp: (xp: number, reason: string) => void;
  onRecordGame: (score: number, xpEarned: number) => void;
  theme?: ThemeMode;
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
        <path
          d="M10 18 C10 12, 30 12, 30 18 L32 58 C32 64, 8 64, 8 58 Z"
          fill="#C7B99E"
          fillOpacity="0.7"
          stroke="#82AAA1"
          strokeWidth="1.5"
        />
        <path d="M12 25 L28 25 L27 45 L13 45 Z" fill="#367D7B" fillOpacity="0.55" />
        <path d="M14 19 L14 55" stroke="#EDEBE3" strokeOpacity="0.45" strokeWidth="1.2" strokeLinecap="round" />
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
        <path
          d="M15 15 C15 5, 25 5, 25 15 L25 22 L35 22 L35 15 C35 5, 45 5, 45 15 L48 50 C48 55, 12 55, 12 50 Z"
          fill="#EDEBE3"
          fillOpacity="0.65"
          stroke="#C7B99E"
          strokeWidth="1.5"
        />
        <path d="M20 30 Q30 34 40 29 M19 41 Q30 45 41 40" stroke="#82AAA1" strokeOpacity="0.55" strokeWidth="1.2" />
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
        <rect x="5" y="5" width="40" height="30" rx="3" fill="#D98270" fillOpacity="0.88" stroke="#EDEBE3" strokeWidth="1.5" />
        <path d="M10 14 L40 14 M10 24 L30 24" stroke="#EDEBE3" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
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
        <path
          d="M10 20 Q35 10 60 20 Q55 55 35 60 Q15 55 10 20 Z"
          fill="#17485A"
          fillOpacity="0.48"
          stroke="#82AAA1"
          strokeWidth="1.5"
        />
        <path
          d="M15 25 L55 50 M15 45 L55 20 M25 15 L45 60 M45 15 L25 60"
          stroke="#C7B99E"
          strokeWidth="1.3"
        />
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
        <ellipse cx="20" cy="8" rx="10" ry="2.5" fill="#C7B99E" />
        <path d="M11 22 L29 22 M11 32 L29 32" stroke="#EDEBE3" strokeOpacity="0.5" strokeWidth="1.4" />
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
        <path d="M27 25 L43 25 L45 30 L43 35 L27 35 L25 30 Z" stroke="#C7B99E" strokeOpacity="0.5" strokeWidth="1" fill="none" />
        <circle cx="55" cy="30" r="7" fill="#82AAA1" stroke="#EDEBE3" strokeWidth="1.2" />
        <circle cx="57.5" cy="28" r="1.3" fill="#061116" />
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
      <svg viewBox="0 0 64 42" fill="none" className="w-full h-full drop-shadow-md">
        <path d="M16 21 C26 9, 50 11, 55 21 C50 31, 26 33, 16 21 Z" fill="#D98270" stroke="#EDEBE3" strokeWidth="1.5" />
        <path d="M16 21 L5 12 L7 21 L5 30 Z" fill="#D98270" stroke="#EDEBE3" strokeWidth="1.1" />
        <path d="M29 11 Q33 21 29 31 M41 13 Q45 21 41 29" stroke="#EDEBE3" strokeWidth="3" strokeLinecap="round" />
        <circle cx="48.5" cy="18.5" r="1.5" fill="#061116" />
      </svg>
    ),
  },
  {
    type: 'dolphin',
    name: 'Lumba-Lumba Pelagik',
    isDebris: false,
    points: 0,
    renderIcon: (
      <svg viewBox="0 0 76 42" fill="none" className="w-full h-full drop-shadow-lg">
        <path
          d="M14 23 C24 11, 46 9, 64 19 C67 21, 69 22, 65 24 C54 26, 36 27, 20 26 L10 31 L14 24 L8 17 Z"
          fill="#82AAA1"
          stroke="#EDEBE3"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M35 12 L31 4 L42 12 Z" fill="#367D7B" stroke="#EDEBE3" strokeWidth="1.1" strokeLinejoin="round" />
        <circle cx="57" cy="19" r="1.4" fill="#061116" />
      </svg>
    ),
  },
];

export const GameView: React.FC<GameViewProps> = ({ onAwardXp, onRecordGame, theme = 'dark' }) => {
  const [selectedArcadeMode, setSelectedArcadeMode] = useState<'frenzy' | 'cleanup'>('frenzy');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover' | 'levelclear'>('menu');
  const [battlePhase, setBattlePhase] = useState<'clearing' | 'boss'>('clearing');
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [combo, setCombo] = useState(0);
  const [correctHits, setCorrectHits] = useState(0);
  const [wrongHits, setWrongHits] = useState(0);
  const [enemiesRepelled, setEnemiesRepelled] = useState(0);
  const [companionEnergy, setCompanionEnergy] = useState(0);
  const [damageFlash, setDamageFlash] = useState(false);
  const [defeatReason, setDefeatReason] = useState<'hp' | 'timeout'>('timeout');
  const [ultimateBanner, setUltimateBanner] = useState<string | null>(null);
  const [bossAnnouncement, setBossAnnouncement] = useState<string | null>(null);

  const [activeObjects, setActiveObjects] = useState<DebrisObject[]>([]);
  const [activeBoats, setActiveBoats] = useState<FishingBoat[]>([]);
  const [activeHazards, setActiveHazards] = useState<HazardProjectile[]>([]);
  const [activeBoss, setActiveBoss] = useState<LevelBoss | null>(null);
  const [floatingFeedback, setFloatingFeedback] = useState<{
    id: string;
    text: string;
    x: number;
    y: number;
    isCorrect: boolean;
  } | null>(null);

  const currentLevel: LevelConfig = GAME_LEVELS[currentLevelIndex];
  const currentDirection: 1 | -1 = currentLevel.level % 2 === 1 ? 1 : -1;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const boatSpawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firstBoatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const playAreaRef = useRef<HTMLDivElement | null>(null);

  // Live mutable physics stores
  const objectsRef = useRef<DebrisObject[]>([]);
  const boatsRef = useRef<FishingBoat[]>([]);
  const hazardsRef = useRef<HazardProjectile[]>([]);
  const bossRef = useRef<LevelBoss | null>(null);
  const companionPosRef = useRef({ x: 18, y: 66, vx: 11, facing: 1 as 1 | -1, assistTimer: 2.5, surgeUntil: 0 });

  const objDomRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const objSpriteRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const boatDomRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const boatCableRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const boatBarRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const hazardDomRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const hazardRingRefs = useRef<Map<string, SVGCircleElement>>(new Map());
  const bossDomRef = useRef<HTMLButtonElement | null>(null);
  const companionDomRef = useRef<HTMLDivElement | null>(null);
  const companionSpriteRef = useRef<HTMLDivElement | null>(null);

  const scoreRef = useRef(score);
  const hpRef = useRef(playerHp);
  const comboRef = useRef(combo);
  const energyRef = useRef(companionEnergy);
  const correctHitsRef = useRef(correctHits);
  const wrongHitsRef = useRef(wrongHits);
  const currentLevelRef = useRef(currentLevel);
  const currentDirRef = useRef<1 | -1>(currentDirection);
  const gameStateRef = useRef(gameState);
  const battlePhaseRef = useRef(battlePhase);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { hpRef.current = playerHp; }, [playerHp]);
  useEffect(() => { comboRef.current = combo; }, [combo]);
  useEffect(() => { energyRef.current = companionEnergy; }, [companionEnergy]);
  useEffect(() => { correctHitsRef.current = correctHits; }, [correctHits]);
  useEffect(() => { wrongHitsRef.current = wrongHits; }, [wrongHits]);
  useEffect(() => { currentLevelRef.current = currentLevel; }, [currentLevel]);
  useEffect(() => { currentDirRef.current = currentDirection; }, [currentDirection]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { battlePhaseRef.current = battlePhase; }, [battlePhase]);

  const showFeedbackAt = useCallback((text: string, x: number, y: number, isCorrect: boolean) => {
    setFloatingFeedback({
      id: `${Date.now()}-${Math.random()}`,
      text,
      x,
      y,
      isCorrect,
    });
  }, []);

  const addCompanionEnergy = useCallback((delta: number) => {
    const next = Math.min(100, energyRef.current + delta);
    energyRef.current = next;
    setCompanionEnergy(next);
  }, []);

  const clearAllTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
    if (boatSpawnRef.current) clearInterval(boatSpawnRef.current);
    if (firstBoatTimerRef.current) clearTimeout(firstBoatTimerRef.current);
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    timerRef.current = null;
    spawnRef.current = null;
    boatSpawnRef.current = null;
    firstBoatTimerRef.current = null;
    rafRef.current = null;
  }, []);

  const finishGame = useCallback(
    (outcome: 'victory' | 'hp' | 'timeout') => {
      if (gameStateRef.current !== 'playing') return;
      clearAllTimers();

      const finalScore = scoreRef.current;
      const finalLevel = currentLevelRef.current;
      const accuracy = calculateGameAccuracy(correctHitsRef.current, wrongHitsRef.current);
      const bossBonusXp = outcome === 'victory' ? finalLevel.level * 30 : 0;
      const xp = calculateXpFromGame(finalScore, accuracy, finalLevel.level) + bossBonusXp;

      onAwardXp(
        xp,
        outcome === 'victory'
          ? `Mengalahkan Bos ${finalLevel.enemy.bossName} (Level ${finalLevel.level})`
          : `Bermain Ocean Cleanup Level ${finalLevel.level}`
      );
      onRecordGame(finalScore, xp);

      if (outcome === 'victory') {
        soundEffects.playFanfare();
        try {
          confetti({
            particleCount: 105,
            spread: 85,
            origin: { y: 0.58 },
            colors: ['#82AAA1', '#367D7B', '#D98270', '#C7B99E'],
          });
        } catch {}
        gameStateRef.current = 'levelclear';
        setGameState('levelclear');
      } else {
        setDefeatReason(outcome === 'hp' ? 'hp' : 'timeout');
        gameStateRef.current = 'gameover';
        setGameState('gameover');
      }
    },
    [clearAllTimers, onAwardXp, onRecordGame]
  );

  const damagePlayer = useCallback(
    (amount: number, msg: string, xPx: number, yPx: number) => {
      const nextHp = Math.max(0, hpRef.current - amount);
      hpRef.current = nextHp;
      setPlayerHp(nextHp);
      setDamageFlash(true);
      setTimeout(() => setDamageFlash(false), 320);
      soundEffects.playPlayerHit();
      wrongHitsRef.current += 1;
      setWrongHits((p) => p + 1);
      showFeedbackAt(msg, xPx, yPx, false);

      if (nextHp <= 0) {
        finishGame('hp');
      }
    },
    [finishGame, showFeedbackAt]
  );

  const spawnHazardFrom = useCallback((originX: number, originY: number, isBossVolley = false) => {
    const lvl = currentLevelRef.current;
    const newHazard: HazardProjectile = {
      id: `haz-${Date.now()}-${Math.random()}`,
      kind: lvl.enemy.hazardKind,
      name: lvl.enemy.hazardName,
      x: Math.max(10, Math.min(90, originX)),
      y: originY,
      vx: (Math.random() - 0.5) * (isBossVolley ? 18 : 11),
      vy: 9 + Math.random() * 6 + lvl.level * 1.4,
      damage: lvl.enemy.hazardDamage,
      fuse: 0,
      fuseDurationSec: Math.max(2.3, 3.4 - lvl.level * 0.18),
      phase: Math.random() * Math.PI * 2,
    };

    const next = [...hazardsRef.current.slice(-5), newHazard];
    hazardsRef.current = next;
    setActiveHazards(next);
  }, []);

  const spawnObject = useCallback((forcedType?: 'net', forcedX?: number, forcedY?: number) => {
    const lvl = currentLevelRef.current;
    const dir = currentDirRef.current;
    const isWildlife = forcedType ? false : Math.random() < 0.32;
    const candidates = ITEM_DEFINITIONS.filter((d) =>
      forcedType ? d.type === forcedType : isWildlife ? !d.isDebris : d.isDebris
    );
    const chosen = candidates[Math.floor(Math.random() * candidates.length)] || ITEM_DEFINITIONS[0];

    const swimFacing: 1 | -1 = isWildlife ? (Math.random() < 0.5 ? 1 : -1) : dir;
    const startX = forcedX !== undefined ? forcedX : swimFacing === 1 ? -8 : 108;
    const baseY =
      forcedY !== undefined
        ? forcedY
        : isWildlife
        ? 28 + Math.random() * 50
        : 24 + Math.random() * 54;

    const baseSpeed = isWildlife
      ? (13 + Math.random() * 9) * (0.9 + (lvl.debrisSpeedMultiplier - 1) * 0.45)
      : (8.5 + Math.random() * 6.5) * lvl.debrisSpeedMultiplier;

    const newObj: DebrisObject = {
      id: `${Date.now()}-${Math.random()}`,
      name: chosen.name,
      isDebris: chosen.isDebris,
      points: chosen.points,
      type: chosen.type as DebrisObject['type'],
      x: startX,
      y: baseY,
      baseY,
      phase: Math.random() * Math.PI * 2,
      rotation: chosen.isDebris ? (Math.random() - 0.5) * 28 : 0,
      rotSpeed: chosen.isDebris ? (Math.random() - 0.5) * 26 : 0,
      facing: swimFacing,
      speedX: swimFacing * baseSpeed,
      speedY: 0,
      size: chosen.isDebris ? 54 : 66,
    };

    const trimmed = [...objectsRef.current.slice(-9), newObj];
    objectsRef.current = trimmed;
    setActiveObjects(trimmed);
  }, []);

  const spawnEnemyUnit = useCallback(() => {
    if (battlePhaseRef.current === 'boss' || boatsRef.current.length >= 2) return;
    const lvl = currentLevelRef.current;
    const enterFromLeft = Math.random() < 0.5;
    const maxClicks = lvl.level >= 3 ? 4 : 3;

    const newEnemy: FishingBoat = {
      id: `enemy-${Date.now()}-${Math.random()}`,
      kind: lvl.enemy.kind,
      name: lvl.enemy.name,
      x: enterFromLeft ? -14 : 114,
      targetX: 20 + Math.random() * 60,
      facing: enterFromLeft ? 1 : -1,
      clicksRemaining: maxClicks,
      maxClicks,
      netProgress: 0,
      attackCooldown: 2.2,
      status: 'approaching',
      hitTick: 0,
    };

    soundEffects.playBoatAlert();
    const next = [...boatsRef.current, newEnemy];
    boatsRef.current = next;
    setActiveBoats(next);
  }, []);

  const enterBossPhase = useCallback(() => {
    if (battlePhaseRef.current === 'boss' || gameStateRef.current !== 'playing') return;
    const lvl = currentLevelRef.current;

    battlePhaseRef.current = 'boss';
    setBattlePhase('boss');

    // Extend battle timer so the player always has exciting time to duel the Boss with their Companion
    setTimeLeft((prev) => prev + 25);

    const newBoss: LevelBoss = {
      id: `boss-lvl-${lvl.level}`,
      kind: lvl.enemy.kind,
      name: lvl.enemy.bossName,
      title: lvl.enemy.bossTitle,
      x: 50,
      y: 22,
      vx: 14 + lvl.level * 2.5,
      hp: lvl.enemy.bossMaxHp,
      maxHp: lvl.enemy.bossMaxHp,
      stunRemaining: 0,
      attackTimer: 2.0,
      hitFlashUntil: 0,
    };

    bossRef.current = newBoss;
    setActiveBoss(newBoss);
    setBossAnnouncement(`BOS MUNCUL: ${lvl.enemy.bossName} (${lvl.enemy.bossTitle})`);
    setTimeout(() => setBossAnnouncement(null), 2600);
    soundEffects.playBossEntry();
  }, []);

  // Automatically trigger Boss Climax as soon as score hits targetScore
  useEffect(() => {
    if (gameState === 'playing' && battlePhase === 'clearing' && score >= currentLevel.targetScore) {
      enterBossPhase();
    }
  }, [score, gameState, battlePhase, currentLevel.targetScore, enterBossPhase]);

  const triggerCompanionUltimate = useCallback(() => {
    if (gameStateRef.current !== 'playing' || energyRef.current < 100) return;

    const lvl = currentLevelRef.current;
    const comp = lvl.companion;

    energyRef.current = 0;
    setCompanionEnergy(0);
    companionPosRef.current.surgeUntil = performance.now() + 900;
    soundEffects.playCompanionUltimate();

    setUltimateBanner(`${comp.name}: ${comp.skillName}!`);
    setTimeout(() => setUltimateBanner(null), 1300);

    // Bonus Score & Heal Perk
    if (comp.bonusScore > 0) {
      setScore((prev) => {
        const next = prev + comp.bonusScore;
        scoreRef.current = next;
        return next;
      });
    }
    if (comp.healPlayerHp > 0) {
      const healedHp = Math.min(100, hpRef.current + comp.healPlayerHp);
      hpRef.current = healedHp;
      setPlayerHp(healedHp);
    }

    // Clear all active hazard projectiles if companion perk supports it
    if (comp.clearsHazards && hazardsRef.current.length > 0) {
      hazardsRef.current = [];
      setActiveHazards([]);
    }

    const playRect = playAreaRef.current?.getBoundingClientRect();
    const cx = (playRect?.width || 800) * 0.5;
    const cy = (playRect?.height || 400) * 0.35;

    if (bossRef.current) {
      const nextBossHp = Math.max(0, bossRef.current.hp - comp.ultimateDamage);
      bossRef.current = {
        ...bossRef.current,
        hp: nextBossHp,
        stunRemaining: Math.max(bossRef.current.stunRemaining, comp.stunsBossSeconds),
        hitFlashUntil: performance.now() + 350,
      };
      setActiveBoss({ ...bossRef.current });
      showFeedbackAt(`-${comp.ultimateDamage} JURUS ${comp.name.toUpperCase()}!`, cx, cy, true);

      if (nextBossHp <= 0) {
        setTimeout(() => finishGame('victory'), 350);
      }
    } else {
      // Used during Clearing Phase: clears all regular enemies + gives points!
      if (boatsRef.current.length > 0) {
        const repelledCount = boatsRef.current.filter((b) => b.status !== 'fleeing').length;
        const clearedBoats = boatsRef.current.map((b) => ({
          ...b,
          clicksRemaining: 0,
          status: 'fleeing' as const,
          facing: (b.x < 50 ? -1 : 1) as 1 | -1,
        }));
        boatsRef.current = clearedBoats;
        setActiveBoats(clearedBoats);
        setEnemiesRepelled((p) => p + repelledCount);
      }
      setScore((prev) => {
        const next = prev + 60;
        scoreRef.current = next;
        return next;
      });
      showFeedbackAt(`${comp.skillName}! +60 Poin`, cx, cy, true);
    }
  }, [finishGame, showFeedbackAt]);

  // Spacebar shortcut for Companion Ultimate
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameStateRef.current === 'playing' && energyRef.current >= 100) {
        e.preventDefault();
        triggerCompanionUltimate();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [triggerCompanionUltimate]);

  const startLevel = (levelIdx: number) => {
    clearAllTimers();
    setCurrentLevelIndex(levelIdx);
    const lvl = GAME_LEVELS[levelIdx];
    currentLevelRef.current = lvl;
    currentDirRef.current = lvl.level % 2 === 1 ? 1 : -1;

    scoreRef.current = 0;
    hpRef.current = 100;
    comboRef.current = 0;
    energyRef.current = 20; // Start with 20% companion charge
    correctHitsRef.current = 0;
    wrongHitsRef.current = 0;

    objectsRef.current = [];
    boatsRef.current = [];
    hazardsRef.current = [];
    bossRef.current = null;
    companionPosRef.current = { x: 18, y: 66, vx: 12, facing: 1, assistTimer: 2.5, surgeUntil: 0 };

    setTimeLeft(lvl.durationSeconds);
    setScore(0);
    setPlayerHp(100);
    setCombo(0);
    setCompanionEnergy(20);
    setCorrectHits(0);
    setWrongHits(0);
    setEnemiesRepelled(0);
    setDamageFlash(false);
    setUltimateBanner(null);
    setBossAnnouncement(null);
    setActiveObjects([]);
    setActiveBoats([]);
    setActiveHazards([]);
    setActiveBoss(null);
    setFloatingFeedback(null);

    battlePhaseRef.current = 'clearing';
    setBattlePhase('clearing');
    gameStateRef.current = 'playing';
    setGameState('playing');
    soundEffects.playBubblePop();

    setTimeout(() => {
      if (gameStateRef.current === 'playing') {
        spawnObject();
        spawnObject();
      }
    }, 150);
  };

  useEffect(() => {
    if (gameState !== 'playing') {
      clearAllTimers();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    spawnRef.current = setInterval(() => {
      spawnObject();
    }, currentLevel.spawnIntervalMs);

    const enemyIntervalMs = Math.max(5200, 9000 - currentLevel.level * 700);
    firstBoatTimerRef.current = setTimeout(() => {
      if (gameStateRef.current === 'playing' && battlePhaseRef.current === 'clearing') {
        spawnEnemyUnit();
      }
    }, 3600);
    boatSpawnRef.current = setInterval(() => {
      spawnEnemyUnit();
    }, enemyIntervalMs);

    let lastTime = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const elapsedSec = now / 1000;
      const playRect = playAreaRef.current?.getBoundingClientRect();
      const stageWidth = playRect?.width || 900;
      const stageHeight = playRect?.height || 430;
      const lvl = currentLevelRef.current;

      // 1. Debris & Protected Wildlife Physics
      let shouldSyncObjects = false;
      const survivingObjects: DebrisObject[] = [];
      for (const obj of objectsRef.current) {
        obj.x += obj.speedX * dt;
        const phase = obj.phase ?? 0;
        const baseY = obj.baseY ?? obj.y;

        if (obj.isDebris) {
          obj.y = Math.max(20, Math.min(82, baseY + Math.sin(elapsedSec * 2.1 + phase) * 3.4));
          obj.rotation = (obj.rotation ?? 0) + (obj.rotSpeed ?? 12) * dt;
        } else {
          obj.y = Math.max(22, Math.min(80, baseY + Math.sin(elapsedSec * 3.2 + phase) * 4.5));
        }

        if (obj.x < -14 || obj.x > 114) {
          shouldSyncObjects = true;
          continue;
        }

        survivingObjects.push(obj);
        const btnEl = objDomRefs.current.get(obj.id);
        if (btnEl) {
          btnEl.style.transform = `translate3d(${((obj.x / 100) * stageWidth).toFixed(1)}px, ${((obj.y / 100) * stageHeight).toFixed(1)}px, 0) translate(-50%, -50%)`;
        }
        const spriteEl = objSpriteRefs.current.get(obj.id);
        if (spriteEl) {
          if (obj.isDebris) {
            spriteEl.style.transform = `rotate(${(obj.rotation ?? 0).toFixed(1)}deg)`;
          } else {
            const swimWiggle = Math.sin(elapsedSec * 7.5 + phase) * 3.5;
            spriteEl.style.transform = `scaleX(${obj.facing === -1 ? -1 : 1}) rotate(${swimWiggle.toFixed(1)}deg)`;
          }
        }
      }
      if (shouldSyncObjects) {
        objectsRef.current = survivingObjects;
        setActiveObjects(survivingObjects);
      }

      // 2. Level-Specific Regular Enemies & Hazard Launching
      let shouldSyncBoats = false;
      const survivingBoats: FishingBoat[] = [];
      for (const boat of boatsRef.current) {
        if (boat.status === 'approaching') {
          const dir = boat.targetX >= boat.x ? 1 : -1;
          boat.facing = dir;
          boat.x += dir * 19 * dt;
          if (Math.abs(boat.targetX - boat.x) <= 1.4) {
            boat.x = boat.targetX;
            boat.status = 'fishing';
          }
        } else if (boat.status === 'fishing') {
          const dropSpeed = 10.5 + lvl.level * 1.4;
          boat.netProgress = Math.min(100, boat.netProgress + dropSpeed * dt);
          boat.attackCooldown -= dt;

          if (boat.attackCooldown <= 0) {
            boat.attackCooldown = Math.max(2.6, 4.1 - lvl.level * 0.25);
            spawnHazardFrom(boat.x, 16, false);
          }

          if (boat.netProgress >= 100) {
            boat.status = 'fleeing';
            boat.facing = boat.x < 50 ? -1 : 1;
            const penalty = calculateBoatEscapePenalty();
            setScore((prev) => {
              const next = Math.max(0, prev + penalty.scoreDelta);
              scoreRef.current = next;
              return next;
            });
            comboRef.current = penalty.newCombo;
            setCombo(penalty.newCombo);
            spawnObject('net', boat.x, 32);
            damagePlayer(
              Math.round(lvl.enemy.hazardDamage * 0.9),
              penalty.message,
              Math.max(90, Math.min(stageWidth - 90, (boat.x / 100) * stageWidth)),
              72
            );
            shouldSyncBoats = true;
          }
        } else if (boat.status === 'fleeing') {
          boat.x += boat.facing * 40 * dt;
        }

        if (boat.x < -18 || boat.x > 118) {
          shouldSyncBoats = true;
          continue;
        }
        survivingBoats.push(boat);

        const boatEl = boatDomRefs.current.get(boat.id);
        if (boatEl) {
          const bobY = Math.sin(elapsedSec * 3.4 + boat.targetX) * 2.5;
          boatEl.style.transform = `translate3d(${((boat.x / 100) * stageWidth).toFixed(1)}px, ${bobY.toFixed(1)}px, 0) translate(-50%, 0)`;
        }
        const cableEl = boatCableRefs.current.get(boat.id);
        if (cableEl) {
          cableEl.style.height = `${(boat.status === 'fishing' ? 16 + (boat.netProgress / 100) * 130 : 8).toFixed(1)}px`;
          cableEl.style.opacity = boat.status === 'fishing' ? '1' : '0';
        }
        const barEl = boatBarRefs.current.get(boat.id);
        if (barEl) {
          barEl.style.width = `${Math.min(100, boat.netProgress).toFixed(1)}%`;
        }
      }
      if (shouldSyncBoats) {
        boatsRef.current = survivingBoats;
        setActiveBoats(survivingBoats);
      }

      // 3. Hazard Projectiles Physics & Countdown Fuse
      let shouldSyncHazards = false;
      const survivingHazards: HazardProjectile[] = [];
      for (const haz of hazardsRef.current) {
        haz.x = Math.max(8, Math.min(92, haz.x + haz.vx * dt));
        haz.y = Math.max(14, Math.min(82, haz.y + haz.vy * dt));
        haz.fuse += (100 / haz.fuseDurationSec) * dt;

        if (haz.fuse >= 100) {
          shouldSyncHazards = true;
          damagePlayer(
            haz.damage,
            `-${haz.damage} HP! Terkena ${haz.name}!`,
            (haz.x / 100) * stageWidth,
            (haz.y / 100) * stageHeight
          );
          continue;
        }

        survivingHazards.push(haz);
        const hazEl = hazardDomRefs.current.get(haz.id);
        if (hazEl) {
          const wobble = Math.sin(elapsedSec * 8 + haz.phase) * 3;
          hazEl.style.transform = `translate3d(${((haz.x / 100) * stageWidth).toFixed(1)}px, ${((haz.y / 100) * stageHeight).toFixed(1)}px, 0) translate(-50%, -50%) rotate(${wobble.toFixed(1)}deg)`;
        }
        const ringEl = hazardRingRefs.current.get(haz.id);
        if (ringEl) {
          const circumference = 125.6;
          ringEl.style.strokeDashoffset = `${(circumference * (1 - haz.fuse / 100)).toFixed(1)}`;
        }
      }
      if (shouldSyncHazards) {
        hazardsRef.current = survivingHazards;
        setActiveHazards(survivingHazards);
      }

      // 4. Climax Boss Patrol & Attack Loop
      const boss = bossRef.current;
      if (boss && battlePhaseRef.current === 'boss') {
        let bossStateChanged = false;

        if (boss.stunRemaining > 0) {
          boss.stunRemaining = Math.max(0, boss.stunRemaining - dt);
          if (boss.stunRemaining === 0) bossStateChanged = true;
        } else {
          boss.x += boss.vx * dt;
          if (boss.x >= 82) {
            boss.x = 82;
            boss.vx = -Math.abs(boss.vx);
          } else if (boss.x <= 18) {
            boss.x = 18;
            boss.vx = Math.abs(boss.vx);
          }

          boss.attackTimer -= dt;
          if (boss.attackTimer <= 0) {
            boss.attackTimer = lvl.enemy.bossAttackIntervalMs / 1000;
            spawnHazardFrom(boss.x, boss.y + 8, true);
            if (lvl.level >= 4) {
              spawnHazardFrom(boss.x + (Math.random() > 0.5 ? 10 : -10), boss.y + 8, true);
            }
          }
        }

        if (bossDomRef.current) {
          const bossBob = Math.sin(elapsedSec * 2.5) * 4;
          bossDomRef.current.style.transform = `translate3d(${((boss.x / 100) * stageWidth).toFixed(1)}px, ${(((boss.y / 100) * stageHeight) + bossBob).toFixed(1)}px, 0) translate(-50%, -50%)`;
        }
        if (bossStateChanged) {
          setActiveBoss({ ...boss });
        }
      }

      // 5. Swimming Ocean Companion AI (Patrol + Autonomous Boss Assist!)
      const comp = companionPosRef.current;
      const isSurging = now < comp.surgeUntil;
      const compTargetX =
        isSurging && bossRef.current
          ? bossRef.current.x
          : bossRef.current
          ? Math.max(14, Math.min(86, bossRef.current.x + Math.sin(elapsedSec * 1.1) * 24))
          : 50 + Math.sin(elapsedSec * 0.75) * 34;
      const compTargetY = isSurging && bossRef.current ? bossRef.current.y + 6 : 64 + Math.cos(elapsedSec * 1.4) * 11;

      const compDx = compTargetX - comp.x;
      const compDy = compTargetY - comp.y;
      comp.x += compDx * (isSurging ? 6.5 : 1.7) * dt;
      comp.y += compDy * (isSurging ? 6.5 : 2.1) * dt;
      if (Math.abs(compDx) > 0.5) {
        comp.facing = compDx >= 0 ? 1 : -1;
      }

      comp.assistTimer -= dt;
      if (comp.assistTimer <= 0) {
        comp.assistTimer = 3.0;
        if (bossRef.current && bossRef.current.hp > 0) {
          const dmg = lvl.companion.passiveDamage;
          const nextHp = Math.max(0, bossRef.current.hp - dmg);
          bossRef.current = { ...bossRef.current, hp: nextHp, hitFlashUntil: now + 180 };
          setActiveBoss({ ...bossRef.current });
          showFeedbackAt(
            `${lvl.companion.name} bantu serang! -${dmg}`,
            (bossRef.current.x / 100) * stageWidth,
            (bossRef.current.y / 100) * stageHeight + 18,
            true
          );
          if (nextHp <= 0) {
            finishGame('victory');
          }
        }
      }

      if (companionDomRef.current) {
        companionDomRef.current.style.transform = `translate3d(${((comp.x / 100) * stageWidth).toFixed(1)}px, ${((comp.y / 100) * stageHeight).toFixed(1)}px, 0) translate(-50%, -50%)`;
      }
      if (companionSpriteRef.current) {
        const compTilt = Math.sin(elapsedSec * 6.5) * 4;
        const compScale = isSurging ? 1.28 : 1;
        companionSpriteRef.current.style.transform = `scaleX(${comp.facing}) rotate(${compTilt.toFixed(1)}deg) scale(${compScale})`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => clearAllTimers();
  }, [
    gameState,
    currentLevelIndex,
    currentLevel.spawnIntervalMs,
    currentLevel.level,
    clearAllTimers,
    spawnObject,
    spawnEnemyUnit,
    spawnHazardFrom,
    damagePlayer,
    finishGame,
    showFeedbackAt,
  ]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 0) {
      finishGame('timeout');
    }
  }, [timeLeft, gameState, finishGame]);

  const handleObjectClick = (obj: DebrisObject, e: React.MouseEvent) => {
    if (gameState !== 'playing') return;

    const outcome = calculateClickOutcome(obj, comboRef.current);
    setScore((prev) => {
      const next = Math.max(0, prev + outcome.scoreDelta);
      scoreRef.current = next;
      return next;
    });
    comboRef.current = outcome.newCombo;
    setCombo(outcome.newCombo);

    if (outcome.isCorrect) {
      correctHitsRef.current += 1;
      setCorrectHits((p) => p + 1);
      addCompanionEnergy(14);
      soundEffects.playBubblePop();
      if (outcome.newCombo > 2) soundEffects.playChime(outcome.newCombo);
    } else {
      wrongHitsRef.current += 1;
      setWrongHits((p) => p + 1);
      soundEffects.playWarning();
    }

    if (playAreaRef.current) {
      const playRect = playAreaRef.current.getBoundingClientRect();
      const clickRect = e.currentTarget.getBoundingClientRect();
      const relX = Math.max(60, Math.min(playRect.width - 60, clickRect.left - playRect.left + clickRect.width / 2));
      const relY = Math.max(40, Math.min(playRect.height - 40, clickRect.top - playRect.top));
      showFeedbackAt(outcome.message, relX, relY, outcome.isCorrect);
    }

    const filtered = objectsRef.current.filter((o) => o.id !== obj.id);
    objectsRef.current = filtered;
    setActiveObjects(filtered);
  };

  const handleEnemyClick = (boat: FishingBoat, e: React.MouseEvent) => {
    if (gameState !== 'playing' || boat.status === 'fleeing') return;

    const outcome = calculateBoatClickOutcome(
      boat.clicksRemaining,
      currentLevelRef.current.level,
      comboRef.current
    );

    setScore((prev) => {
      const next = Math.max(0, prev + outcome.scoreDelta);
      scoreRef.current = next;
      return next;
    });
    comboRef.current = outcome.newCombo;
    setCombo(outcome.newCombo);
    soundEffects.playBoatRepelTap();
    addCompanionEnergy(outcome.repelled ? 24 : 8);

    const updatedBoats = boatsRef.current.map((b) => {
      if (b.id !== boat.id) return b;
      return {
        ...b,
        clicksRemaining: outcome.nextClicksRemaining,
        netProgress: Math.max(0, b.netProgress - 16),
        status: outcome.repelled ? ('fleeing' as const) : b.status,
        facing: outcome.repelled ? ((b.x < 50 ? -1 : 1) as 1 | -1) : b.facing,
        hitTick: b.hitTick + 1,
      };
    });

    if (outcome.repelled) {
      correctHitsRef.current += 1;
      setCorrectHits((p) => p + 1);
      setEnemiesRepelled((p) => p + 1);
      soundEffects.playChime(outcome.newCombo + 2);
    }

    if (playAreaRef.current) {
      const playRect = playAreaRef.current.getBoundingClientRect();
      const clickRect = e.currentTarget.getBoundingClientRect();
      const relX = Math.max(70, Math.min(playRect.width - 70, clickRect.left - playRect.left + clickRect.width / 2));
      const relY = Math.max(46, clickRect.bottom - playRect.top);
      showFeedbackAt(outcome.message, relX, relY, true);
    }

    boatsRef.current = updatedBoats;
    setActiveBoats(updatedBoats);
  };

  const handleHazardParry = (hazard: HazardProjectile, e: React.MouseEvent) => {
    if (gameState !== 'playing') return;
    const outcome = calculateHazardParryOutcome(comboRef.current);

    setScore((prev) => {
      const next = prev + outcome.scoreDelta;
      scoreRef.current = next;
      return next;
    });
    comboRef.current = outcome.newCombo;
    setCombo(outcome.newCombo);
    correctHitsRef.current += 1;
    setCorrectHits((p) => p + 1);
    addCompanionEnergy(outcome.energyGain);
    soundEffects.playParry();

    if (playAreaRef.current) {
      const playRect = playAreaRef.current.getBoundingClientRect();
      const clickRect = e.currentTarget.getBoundingClientRect();
      const relX = Math.max(60, Math.min(playRect.width - 60, clickRect.left - playRect.left + clickRect.width / 2));
      const relY = Math.max(40, Math.min(playRect.height - 40, clickRect.top - playRect.top));
      showFeedbackAt(outcome.message, relX, relY, true);
    }

    const filtered = hazardsRef.current.filter((h) => h.id !== hazard.id);
    hazardsRef.current = filtered;
    setActiveHazards(filtered);
  };

  const handleBossClick = (e: React.MouseEvent) => {
    if (gameState !== 'playing' || !bossRef.current) return;
    const outcome = calculateBossClickOutcome(bossRef.current.hp, 14);
    soundEffects.playBossHit();
    addCompanionEnergy(outcome.energyGain);

    setScore((prev) => {
      const next = prev + 15;
      scoreRef.current = next;
      return next;
    });

    const updatedBoss: LevelBoss = {
      ...bossRef.current,
      hp: outcome.nextHp,
      hitFlashUntil: performance.now() + 140,
    };
    bossRef.current = updatedBoss;
    setActiveBoss(updatedBoss);

    if (playAreaRef.current) {
      const playRect = playAreaRef.current.getBoundingClientRect();
      const clickRect = e.currentTarget.getBoundingClientRect();
      const relX = Math.max(60, Math.min(playRect.width - 60, clickRect.left - playRect.left + clickRect.width / 2));
      const relY = Math.max(40, Math.min(playRect.height - 40, clickRect.bottom - playRect.top));
      showFeedbackAt(outcome.defeated ? `BOS KALAH!` : `-14 DMG`, relX, relY, true);
    }

    if (outcome.defeated) {
      finishGame('victory');
    }
  };

  const accuracyPercent = calculateGameAccuracy(correctHits, wrongHits);

  const handleSwitchArcadeMode = (nextMode: 'frenzy' | 'cleanup') => {
    if (nextMode === selectedArcadeMode) return;
    soundEffects.playBubblePop();
    clearAllTimers();
    setGameState('menu');
    setSelectedArcadeMode(nextMode);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] pt-28 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Clean Editorial Header + Dual-Game Hub Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-[var(--border-hairline)]">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-[var(--accent-teal)] font-semibold block">
              {selectedArcadeMode === 'frenzy'
                ? 'Arkade Ekologi Laut · Feeding Frenzy'
                : `Mini-Game Konservasi · Level ${currentLevel.level}`}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl text-[var(--text-primary)]">
              {selectedArcadeMode === 'frenzy'
                ? 'Feeding Frenzy: Rantai Samudra'
                : 'Ocean Cleanup: Penjaga Kedalaman'}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {selectedArcadeMode === 'frenzy'
                ? 'Makan ikan lebih kecil untuk berevolusi menjadi predator puncak, hindari pemangsa besar, dan raih mutiara dasar laut.'
                : `Serok sampah hanyut, tangkis serangan musuh demi jaga HP, dan bertarung bersama ${currentLevel.companion.name} melawan bos level!`}
            </p>
          </div>

          {/* Segmented Dual-Mode Selector */}
          <div
            className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shrink-0 self-start lg:self-auto"
            role="tablist"
            aria-label="Pilih Mode Permainan"
          >
            <button
              role="tab"
              aria-selected={selectedArcadeMode === 'frenzy'}
              onClick={() => handleSwitchArcadeMode('frenzy')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                selectedArcadeMode === 'frenzy'
                  ? 'bg-[#367D7B] text-[#EDEBE3] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Fish className="w-3.5 h-3.5" />
              <span>Feeding Frenzy</span>
            </button>
            <button
              role="tab"
              aria-selected={selectedArcadeMode === 'cleanup'}
              onClick={() => handleSwitchArcadeMode('cleanup')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                selectedArcadeMode === 'cleanup'
                  ? 'bg-[#367D7B] text-[#EDEBE3] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Ocean Cleanup</span>
            </button>
          </div>
        </div>

        {selectedArcadeMode === 'frenzy' ? (
          <FeedingFrenzyGame onAwardXp={onAwardXp} onRecordGame={onRecordGame} theme={theme} />
        ) : (
        /* BORDERLESS AQUARIUM STAGE WITH SKIMMER NET CURSOR */
        <div
          data-cursor-mode="net"
          className={`relative rounded-2xl bg-[#E5F2F0] dark:bg-[#091C25] text-[#0B1E27] dark:text-[#EDEBE3] border border-[#0B1E27]/12 dark:border-[#82AAA1]/15 shadow-2xl overflow-hidden min-h-[590px] flex flex-col justify-between select-none transition-all duration-300 ${
            damageFlash ? 'ring-4 ring-inset ring-[#B84F3C]/85 dark:ring-[#D98270]/85' : ''
          }`}
        >
          {/* Detailed Layered Underwater Ecosystem Backdrop */}
          <OceanEcosystemBackdrop
            backgroundTheme={currentLevel.backgroundTheme}
            currentDirection={currentDirection}
            levelNumber={currentLevel.level}
            theme={theme}
          />

          {/* Clean Top HUD Bar */}
          <div className="relative z-20 px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3 bg-[#F7F6F1]/92 dark:bg-[#061116]/80 backdrop-blur-md text-xs border-b border-[#0B1E27]/10 dark:border-[#82AAA1]/15">
            {/* Left: Player HP & Score */}
            <div className="flex flex-wrap items-center gap-4 tabular-nums">
              <div className="flex items-center gap-2" title="Health Penjaga Laut">
                <Heart
                  className={`w-3.5 h-3.5 ${
                    playerHp <= 35
                      ? 'text-[#B84F3C] fill-[#B84F3C] dark:text-[#D98270] dark:fill-[#D98270]'
                      : 'text-[#1D6664] fill-[#1D6664]/25 dark:text-[#82AAA1] dark:fill-[#82AAA1]/30'
                  }`}
                />
                <span
                  className={
                    playerHp <= 35
                      ? 'text-[#B84F3C] dark:text-[#D98270] font-semibold'
                      : 'text-[#0B1E27] dark:text-[#EDEBE3] font-medium'
                  }
                >
                  HP {playerHp}
                </span>
                <div className="w-16 h-1.5 rounded-full bg-[#DCE6E4] dark:bg-[#102B38] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      playerHp <= 35
                        ? 'bg-[#B84F3C] dark:bg-[#D98270]'
                        : 'bg-[#1D6664] dark:bg-[#82AAA1]'
                    }`}
                    style={{ width: `${playerHp}%` }}
                  />
                </div>
              </div>

              <span>
                Skor:{' '}
                <strong
                  className={
                    score >= currentLevel.targetScore
                      ? 'text-[#1D6664] dark:text-[#82AAA1]'
                      : 'text-[#0B1E27] dark:text-[#EDEBE3]'
                  }
                >
                  {score}
                </strong>
                <span className="text-[#425B66] dark:text-[#8FA3AC]"> / {currentLevel.targetScore}</span>
              </span>
            </div>

            {/* Right: Phase / Current / Combo / Timer */}
            <div className="flex items-center gap-4 tabular-nums">
              {battlePhase === 'boss' && gameState === 'playing' && (
                <span className="flex items-center gap-1 text-[#B84F3C] dark:text-[#D98270] font-semibold">
                  <Skull className="w-3.5 h-3.5" />
                  <span>Fase Bos</span>
                </span>
              )}
              {battlePhase === 'clearing' && activeBoats.some((b) => b.status === 'fishing') && (
                <span className="hidden sm:flex items-center gap-1 text-[#B84F3C] dark:text-[#D98270] font-semibold">
                  <Anchor className="w-3.5 h-3.5" />
                  <span>{currentLevel.enemy.name}!</span>
                </span>
              )}
              <span className="hidden md:flex items-center gap-1 text-[#1D6664] dark:text-[#82AAA1]">
                <Waves className="w-3.5 h-3.5" />
                <span>{currentDirection === 1 ? '→' : '←'}</span>
              </span>
              <span className="flex items-center gap-1 text-[#876B3A] dark:text-[#C7B99E]">
                <Flame className="w-3.5 h-3.5 text-[#B84F3C] dark:text-[#D98270]" />
                {combo}×
              </span>
              <span
                className={`flex items-center gap-1 font-semibold ${
                  timeLeft <= 10
                    ? 'text-[#B84F3C] dark:text-[#D98270]'
                    : 'text-[#1D6664] dark:text-[#82AAA1]'
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                {String(timeLeft).padStart(2, '0')}s
              </span>
            </div>
          </div>

          {/* Boss HP Header Strip during Boss Phase */}
          {gameState === 'playing' && activeBoss && (
            <div className="relative z-20 px-5 py-2 bg-[#FDF2F0]/92 dark:bg-[#1A0D10]/80 border-b border-[#B84F3C]/25 dark:border-[#D98270]/35 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Skull className="w-4 h-4 text-[#B84F3C] dark:text-[#D98270]" />
                <span className="font-display font-semibold text-[#0B1E27] dark:text-[#EDEBE3]">
                  BOS: {activeBoss.name}
                </span>
                <span className="text-[#425B66] dark:text-[#98ACB5] hidden sm:inline">· {activeBoss.title}</span>
                {activeBoss.stunRemaining > 0 && (
                  <span className="text-[#1D6664] dark:text-[#9ED3CA] font-semibold">
                    (Beku {activeBoss.stunRemaining.toFixed(1)}s)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5 flex-1 max-w-xs tabular-nums">
                <div className="flex-1 h-2 rounded-full bg-[#ECEAE1] dark:bg-[#091C25] overflow-hidden border border-[#B84F3C]/30 dark:border-[#D98270]/30">
                  <div
                    className="h-full bg-gradient-to-r from-[#B84F3C] to-[#876B3A] dark:from-[#D98270] dark:to-[#C7B99E] transition-all duration-150"
                    style={{ width: `${Math.max(0, (activeBoss.hp / activeBoss.maxHp) * 100)}%` }}
                  />
                </div>
                <span className="text-[#B84F3C] dark:text-[#D98270] font-semibold">
                  {activeBoss.hp}/{activeBoss.maxHp}
                </span>
              </div>
            </div>
          )}

          {/* PLAY AREA */}
          <div ref={playAreaRef} className="relative z-10 flex-1 min-h-[430px] p-4 overflow-hidden">
            {/* Boss Entry & Ultimate Banners */}
            <AnimatePresence>
              {bossAnnouncement && (
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none px-4 py-1.5 rounded-full bg-[#D98270] text-[#061116] font-display font-bold text-xs shadow-xl whitespace-nowrap"
                >
                  {bossAnnouncement}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {ultimateBanner && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1.05 }}
                  exit={{ opacity: 0, scale: 1.15 }}
                  className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center bg-[#367D7B]/20 backdrop-blur-[1px]"
                >
                  <div className="px-6 py-3 rounded-2xl bg-white/94 dark:bg-[#061116]/90 border border-[#1D6664]/45 dark:border-[#82AAA1]/60 text-center space-y-1 shadow-2xl">
                    <div className="text-[11px] uppercase tracking-widest text-[#876B3A] dark:text-[#C7B99E] font-semibold">
                      Serangan Companion
                    </div>
                    <div className="font-display text-xl text-[#1D6664] dark:text-[#82AAA1]">{ultimateBanner}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {floatingFeedback && (
                <motion.div
                  key={floatingFeedback.id}
                  initial={{ opacity: 1, y: 0, scale: 0.85 }}
                  animate={{ opacity: 0, y: -42, scale: 1.08 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className={`absolute z-30 pointer-events-none font-display font-bold text-xs px-3 py-1 rounded-full shadow-xl whitespace-nowrap ${
                    floatingFeedback.isCorrect
                      ? 'bg-[#267472] dark:bg-[#367D7B] text-[#EDEBE3]'
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
              <div className="h-full min-h-[395px] flex flex-col items-center justify-center text-center p-5 sm:p-7 space-y-5 max-w-2xl mx-auto rounded-2xl bg-[#F7F6F1]/76 dark:bg-transparent backdrop-blur-sm dark:backdrop-blur-none transition-colors">
                <div className="space-y-2">
                  <h3 className="font-display text-2xl sm:text-3xl text-[#0B1E27] dark:text-[#EDEBE3]">
                    Siap Membersihkan &amp; Melawan Bos Zona?
                  </h3>
                  <p className="text-xs text-[#425B66] dark:text-[#98ACB5] leading-relaxed max-w-lg mx-auto">
                    Serok sampah yang hanyut terbawa arus, tangkis proyektil serangan musuh untuk menjaga HP Penjaga, lalu duet bersama <em>Companion</em> untuk menjatuhkan Bos di akhir setiap level!
                  </p>
                </div>

                {/* Unboxed Underline Level Switcher */}
                <div className="flex flex-wrap items-center justify-center gap-4 border-b border-[#0B1E27]/15 dark:border-[#EDEBE3]/15 pb-3">
                  {GAME_LEVELS.map((lvl, idx) => (
                    <button
                      key={lvl.level}
                      onClick={() => setCurrentLevelIndex(idx)}
                      className={`text-xs transition-colors cursor-pointer pb-1 ${
                        currentLevelIndex === idx
                          ? 'text-[#1D6664] border-[#1D6664] dark:text-[#82AAA1] dark:border-[#82AAA1] font-semibold border-b-2'
                          : 'text-[#425B66] hover:text-[#0B1E27] dark:text-[#8FA3AC] dark:hover:text-[#EDEBE3]'
                      }`}
                    >
                      Lvl {lvl.level} · {lvl.companion.name}
                    </button>
                  ))}
                </div>

                {/* Level Enemy & Companion Briefing Strip */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left bg-white/90 dark:bg-[#061116]/65 border border-[#0B1E27]/12 dark:border-[#82AAA1]/20 rounded-xl p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 shrink-0 flex items-center justify-center">
                      {renderEnemySprite(currentLevel.enemy.kind, true)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-[#B84F3C] dark:text-[#D98270] font-semibold">
                        Musuh &amp; Bos Level {currentLevel.level}
                      </div>
                      <div className="text-xs font-semibold text-[#0B1E27] dark:text-[#EDEBE3] truncate">
                        {currentLevel.enemy.bossName}
                      </div>
                      <div className="text-[11px] text-[#425B66] dark:text-[#98ACB5] truncate">
                        Patroli: {currentLevel.enemy.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:border-l sm:border-[#0B1E27]/12 dark:sm:border-[#82AAA1]/15 sm:pl-3">
                    <div className="w-14 h-12 shrink-0 flex items-center justify-center">
                      {renderCompanionSprite(currentLevel.companion.id)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-[#1D6664] dark:text-[#82AAA1] font-semibold">
                        Companion Penolong
                      </div>
                      <div className="text-xs font-semibold text-[#0B1E27] dark:text-[#EDEBE3] truncate">
                        {currentLevel.companion.name} · {currentLevel.companion.skillName}
                      </div>
                      <div className="text-[11px] text-[#425B66] dark:text-[#98ACB5] truncate">
                        {currentLevel.companion.skillDescription}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => startLevel(currentLevelIndex)}
                  className="px-8 py-3 rounded-full bg-[#267472] hover:bg-[#1D6664] text-[#F7F6F1] dark:bg-[#367D7B] dark:hover:bg-[#82AAA1] dark:text-[#EDEBE3] dark:hover:text-[#061116] font-semibold text-xs tracking-wide transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Mulai Level {currentLevel.level}</span>
                </button>
              </div>
            )}

            {/* PLAYING */}
            {gameState === 'playing' && (
              <div className="relative w-full h-full min-h-[410px]">
                {/* Active Swimming Companion Ally */}
                <div
                  ref={(el) => {
                    companionDomRef.current = el;
                    if (el && !el.dataset.initPos) {
                      el.dataset.initPos = '1';
                      const w = playAreaRef.current?.clientWidth || 900;
                      const h = playAreaRef.current?.clientHeight || 410;
                      const c = companionPosRef.current;
                      el.style.transform = `translate3d(${((c.x / 100) * w).toFixed(1)}px, ${((c.y / 100) * h).toFixed(1)}px, 0) translate(-50%, -50%)`;
                    }
                  }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                  }}
                  className="z-10 pointer-events-none flex flex-col items-center will-change-transform"
                >
                  <div
                    ref={companionSpriteRef}
                    className="w-16 h-12 will-change-transform"
                  >
                    {renderCompanionSprite(currentLevel.companion.id)}
                  </div>
                  <span className="text-[9px] font-semibold text-[#9ED3CA] bg-[#061116]/75 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    {currentLevel.companion.name}
                  </span>
                </div>

                {/* Climax Boss Entity */}
                {activeBoss && (
                  <button
                    ref={(el) => {
                      bossDomRef.current = el;
                      if (el && !el.dataset.initPos) {
                        el.dataset.initPos = '1';
                        const w = playAreaRef.current?.clientWidth || 900;
                        const h = playAreaRef.current?.clientHeight || 410;
                        el.style.transform = `translate3d(${((activeBoss.x / 100) * w).toFixed(1)}px, ${((activeBoss.y / 100) * h).toFixed(1)}px, 0) translate(-50%, -50%)`;
                      }
                    }}
                    onClick={handleBossClick}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                    }}
                    className="group z-20 cursor-pointer focus:outline-none will-change-transform"
                    title={`Klik berulang untuk menyerang ${activeBoss.name}!`}
                  >
                    <div className="flex flex-col items-center transition-transform duration-100 group-hover:scale-105 group-active:scale-95">
                      <div className="mb-1 px-2.5 py-0.5 rounded-full bg-[#D98270]/90 text-[#061116] text-[10px] font-bold whitespace-nowrap shadow">
                        Serang Bos! (-14 HP)
                      </div>
                      <div className="w-36 h-20">{renderEnemySprite(activeBoss.kind, true)}</div>
                    </div>
                  </button>
                )}

                {/* Surface Patrol Zone: Level-Specific Regular Enemies */}
                {activeBoats.map((boat) => (
                  <button
                    key={boat.id}
                    ref={(el) => {
                      if (el) {
                        if (!el.dataset.initPos) {
                          el.dataset.initPos = '1';
                          const w = playAreaRef.current?.clientWidth || 900;
                          el.style.transform = `translate3d(${((boat.x / 100) * w).toFixed(1)}px, 0px, 0) translate(-50%, 0)`;
                        }
                        boatDomRefs.current.set(boat.id, el);
                      } else {
                        boatDomRefs.current.delete(boat.id);
                      }
                    }}
                    onClick={(e) => handleEnemyClick(boat, e)}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '6px',
                    }}
                    className={`group z-20 flex flex-col items-center cursor-pointer focus:outline-none transition-opacity will-change-transform ${
                      boat.status === 'fleeing' ? 'opacity-70 pointer-events-none' : ''
                    }`}
                    title={`Klik berulang untuk mengusir ${boat.name}!`}
                  >
                    {boat.status !== 'fleeing' && (
                      <div className="mb-1 flex flex-col items-center gap-1 bg-[#061116]/85 px-2 py-1 rounded-lg border border-[#D98270]/45 shadow-md">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#D98270] whitespace-nowrap">
                          <span>{boat.name}</span>
                          <span className="flex items-center gap-0.5">
                            {Array.from({ length: boat.maxClicks }).map((_, idx) => (
                              <span
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  idx < boat.clicksRemaining ? 'bg-[#D98270]' : 'bg-[#8FA3AC]/30'
                                }`}
                              />
                            ))}
                          </span>
                        </div>
                        <div className="w-20 h-1 rounded-full bg-[#102B38] overflow-hidden">
                          <div
                            ref={(el) => {
                              if (el) boatBarRefs.current.set(boat.id, el);
                              else boatBarRefs.current.delete(boat.id);
                            }}
                            className="h-full bg-[#D98270]"
                            style={{ width: `${boat.netProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div
                      className={`w-28 h-14 transition-transform duration-100 group-hover:scale-105 group-active:scale-95 ${
                        boat.facing === -1 ? '-scale-x-100' : ''
                      }`}
                    >
                      {renderEnemySprite(boat.kind, false)}
                    </div>

                    <div
                      ref={(el) => {
                        if (el) boatCableRefs.current.set(boat.id, el);
                        else boatCableRefs.current.delete(boat.id);
                      }}
                      className="w-12 flex flex-col items-center pointer-events-none opacity-0 transition-opacity duration-200"
                      style={{ height: '16px' }}
                    >
                      <div className="w-px flex-1 bg-gradient-to-b from-[#C7B99E] to-[#D98270]" />
                      <svg viewBox="0 0 40 28" fill="none" className="w-9 h-6 shrink-0">
                        <path
                          d="M4 4 L36 4 L29 24 C24 27, 16 27, 11 24 Z"
                          fill="#D98270"
                          fillOpacity="0.32"
                          stroke="#D98270"
                          strokeWidth="1.4"
                        />
                        <path d="M12 4 L15 24 M20 4 L20 26 M28 4 L25 24 M7 13 L33 13" stroke="#EDEBE3" strokeOpacity="0.5" strokeWidth="0.9" />
                      </svg>
                    </div>
                  </button>
                ))}

                {/* Incoming Hazard Projectiles (Click to Parry!) */}
                {activeHazards.map((haz) => (
                  <button
                    key={haz.id}
                    ref={(el) => {
                      if (el) {
                        if (!el.dataset.initPos) {
                          el.dataset.initPos = '1';
                          const w = playAreaRef.current?.clientWidth || 900;
                          const h = playAreaRef.current?.clientHeight || 410;
                          el.style.transform = `translate3d(${((haz.x / 100) * w).toFixed(1)}px, ${((haz.y / 100) * h).toFixed(1)}px, 0) translate(-50%, -50%)`;
                        }
                        hazardDomRefs.current.set(haz.id, el);
                      } else {
                        hazardDomRefs.current.delete(haz.id);
                      }
                    }}
                    onClick={(e) => handleHazardParry(haz, e)}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                    }}
                    className="group z-[25] w-14 h-14 cursor-pointer focus:outline-none will-change-transform"
                    title={`Klik cepat untuk menangkis ${haz.name}!`}
                  >
                    <div className="relative w-full h-full flex items-center justify-center transition-transform duration-100 group-hover:scale-[1.15] group-active:scale-90">
                      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" stroke="#D98270" strokeOpacity="0.25" strokeWidth="3" fill="none" />
                        <circle
                          ref={(el) => {
                            if (el) hazardRingRefs.current.set(haz.id, el);
                            else hazardRingRefs.current.delete(haz.id);
                          }}
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="#D98270"
                          strokeWidth="3"
                          strokeDasharray="125.6"
                          strokeDashoffset="125.6"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                      <div className="w-8 h-8">{renderHazardSprite(haz.kind)}</div>
                    </div>
                  </button>
                ))}

                {/* Water Column: Swimming Marine Wildlife & Current-Drifting Debris */}
                {activeObjects.map((obj) => {
                  const def = ITEM_DEFINITIONS.find((d) => d.type === obj.type) || ITEM_DEFINITIONS[0];
                  return (
                    <button
                      key={obj.id}
                      ref={(el) => {
                        if (el) {
                          if (!el.dataset.initPos) {
                            el.dataset.initPos = '1';
                            const w = playAreaRef.current?.clientWidth || 900;
                            const h = playAreaRef.current?.clientHeight || 410;
                            el.style.transform = `translate3d(${((obj.x / 100) * w).toFixed(1)}px, ${((obj.y / 100) * h).toFixed(1)}px, 0) translate(-50%, -50%)`;
                          }
                          objDomRefs.current.set(obj.id, el);
                        } else {
                          objDomRefs.current.delete(obj.id);
                        }
                      }}
                      onClick={(e) => handleObjectClick(obj, e)}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: `${obj.size}px`,
                        height: `${obj.size}px`,
                      }}
                      className="group z-10 cursor-pointer p-1 focus:outline-none will-change-transform"
                      title={def.name}
                    >
                      <div className="w-full h-full flex flex-col items-center justify-center transition-transform duration-150 group-hover:scale-110 group-active:scale-95">
                        <div
                          ref={(el) => {
                            if (el) objSpriteRefs.current.set(obj.id, el);
                            else objSpriteRefs.current.delete(obj.id);
                          }}
                          className="w-full h-full will-change-transform"
                        >
                          {def.renderIcon}
                        </div>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 whitespace-nowrap ${
                            def.isDebris
                              ? 'bg-[#061116]/85 text-[#82AAA1]'
                              : 'bg-[#D98270]/90 text-[#061116]'
                          }`}
                        >
                          {def.isDebris ? `+${def.points}` : 'Dilindungi'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* LEVEL CLEAR */}
            {gameState === 'levelclear' && (
              <div className="h-full min-h-[395px] flex flex-col items-center justify-center text-center p-6 space-y-5 max-w-md mx-auto rounded-2xl bg-[#F7F6F1]/82 dark:bg-transparent backdrop-blur-sm dark:backdrop-blur-none">
                <Trophy className="w-10 h-10 text-[#876B3A] dark:text-[#C7B99E]" />
                <div className="space-y-1">
                  <h3 className="font-display text-2xl text-[#0B1E27] dark:text-[#EDEBE3]">
                    Bos {currentLevel.enemy.bossName} Dikalahkan!
                  </h3>
                  <p className="text-xs text-[#425B66] dark:text-[#98ACB5]">
                    Skor {score} · Sisa HP {playerHp} · Akurasi {accuracyPercent}% · {enemiesRepelled} musuh diusir · +
                    {calculateXpFromGame(score, accuracyPercent, currentLevel.level) + currentLevel.level * 30} XP
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => startLevel(currentLevelIndex)}
                    className="px-5 py-2.5 rounded-full bg-[#ECEAE1] hover:bg-[#DFDDD2] text-[#0B1E27] dark:bg-[#EDEBE3]/10 dark:text-[#EDEBE3] text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ulangi</span>
                  </button>
                  {currentLevelIndex < GAME_LEVELS.length - 1 ? (
                    <button
                      onClick={() => startLevel(currentLevelIndex + 1)}
                      className="px-6 py-2.5 rounded-full bg-[#267472] hover:bg-[#1D6664] text-[#F7F6F1] dark:bg-[#367D7B] dark:hover:bg-[#82AAA1] dark:text-[#EDEBE3] dark:hover:text-[#061116] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Level Berikutnya</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setGameState('menu')}
                      className="px-6 py-2.5 rounded-full bg-[#267472] dark:bg-[#367D7B] text-[#EDEBE3] text-xs font-semibold cursor-pointer"
                    >
                      Selesai
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* GAME OVER */}
            {gameState === 'gameover' && (
              <div className="h-full min-h-[395px] flex flex-col items-center justify-center text-center p-6 space-y-5 max-w-md mx-auto rounded-2xl bg-[#F7F6F1]/82 dark:bg-transparent backdrop-blur-sm dark:backdrop-blur-none">
                <ShieldAlert className="w-10 h-10 text-[#B84F3C] dark:text-[#D98270]" />
                <div className="space-y-1">
                  <h3 className="font-display text-2xl text-[#0B1E27] dark:text-[#EDEBE3]">
                    {defeatReason === 'hp' ? 'Pertahanan Penjaga Tembus!' : 'Waktu Habis!'}
                  </h3>
                  <p className="text-xs text-[#425B66] dark:text-[#98ACB5]">
                    {defeatReason === 'hp'
                      ? 'Klik cepat proyektil bahaya sebelum mengenai terumbu dan mengurangi HP Anda.'
                      : `Skor ${score} / target ${currentLevel.targetScore}. Serok sampah lebih cepat & gunakan jurus ${currentLevel.companion.name}!`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGameState('menu')}
                    className="px-5 py-2.5 rounded-full bg-[#ECEAE1] hover:bg-[#DFDDD2] text-[#0B1E27] dark:bg-[#EDEBE3]/10 dark:text-[#EDEBE3] text-xs cursor-pointer"
                  >
                    Menu
                  </button>
                  <button
                    onClick={() => startLevel(currentLevelIndex)}
                    className="px-6 py-2.5 rounded-full bg-[#0B1E27] text-[#F7F6F1] dark:bg-[#EDEBE3] dark:text-[#061116] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Coba Lagi</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Companion Action Skill Bar (Visible during Active Play) */}
          {gameState === 'playing' && (
            <div className="relative z-20 px-4 sm:px-5 py-2.5 bg-[#F7F6F1]/94 dark:bg-[#061116]/85 border-t border-[#0B1E27]/10 dark:border-[#82AAA1]/15 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-7 shrink-0">{renderCompanionSprite(currentLevel.companion.id)}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#0B1E27] dark:text-[#EDEBE3]">{currentLevel.companion.name}</span>
                    <span className="text-[#1D6664] dark:text-[#82AAA1] tabular-nums">{companionEnergy}%</span>
                  </div>
                  <div className="w-32 sm:w-44 h-1.5 rounded-full bg-[#DCE6E4] dark:bg-[#102B38] overflow-hidden mt-1">
                    <div
                      className={`h-full transition-all duration-200 ${
                        companionEnergy >= 100
                          ? 'bg-[#876B3A] dark:bg-[#C7B99E]'
                          : 'bg-[#1D6664] dark:bg-[#367D7B]'
                      }`}
                      style={{ width: `${companionEnergy}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={triggerCompanionUltimate}
                disabled={companionEnergy < 100}
                className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  companionEnergy >= 100
                    ? 'bg-[#876B3A] hover:bg-[#6E562D] text-[#F7F6F1] dark:bg-[#C7B99E] dark:hover:bg-[#EDEBE3] dark:text-[#061116] shadow-lg'
                    : 'bg-[#ECEAE1] text-[#5F7782] dark:bg-[#102B38] dark:text-[#7C929C] cursor-not-allowed'
                }`}
              >
                {companionEnergy >= 100 ? <Zap className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>
                  {companionEnergy >= 100
                    ? `Aktifkan ${currentLevel.companion.skillName} [Spasi]`
                    : `Isi Energi (${currentLevel.companion.skillName})`}
                </span>
              </button>
            </div>
          )}

          <div className="relative z-10 px-5 py-2 bg-[#F7F6F1]/95 dark:bg-[#061116]/90 border-t border-[#0B1E27]/10 dark:border-transparent flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#425B66] dark:text-[#8FA3AC]">
            <span>Zona: {currentLevel.depthName}</span>
            <span>Musuh diusir: {enemiesRepelled} · Klik proyektil untuk menangkis</span>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
