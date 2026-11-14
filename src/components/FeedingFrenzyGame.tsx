import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Trophy,
  Play,
  Pause,
  RotateCcw,
  Heart,
  Zap,
  Flame,
  Clock,
  Shield,
  Magnet,
  Snowflake,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  AlertTriangle,
  Check,
  Volume2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  BackdropKey,
  FF_STAGES,
  GameTier,
  PLAYABLE_FISH,
  PlayableFishConfig,
  PlayableFishId,
  PowerUpKind,
  SPECIES_CATALOG,
  SpeciesConfig,
  SpeciesId,
  StageConfig,
  TIME_ATTACK_DURATION_SEC,
  calculateFrenzyState,
  canPlayerEat,
  getGrowthProgress,
  getPlayerVisualRadius,
  isTargetDangerous,
} from '../utils/feedingFrenzyData';
import { FF_BACKDROP_URLS } from '../utils/feedingFrenzyBackdrops';
import {
  FloatingPopup,
  ParticleFX,
  drawBubbleCollectible,
  drawGiantClam,
  drawPlayableFish,
  drawSpeciesEntity,
  drawStageBackdrop,
} from '../utils/feedingFrenzyRenderer';
import { soundEffects } from '../utils/soundEffects';
import { calculateXpFromGame } from '../utils/gameRules';
import { ThemeMode } from '../hooks/useTheme';

type FFGameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'STAGE_CLEAR' | 'GAME_OVER';
type FFMode = 'campaign' | 'time_attack';

interface FeedingFrenzyGameProps {
  onAwardXp: (xp: number, reason: string) => void;
  onRecordGame: (score: number, xpEarned: number) => void;
  theme?: ThemeMode;
}

const LOGICAL_WIDTH = 1120;
const LOGICAL_HEIGHT = 620;

const STORAGE_UNLOCKED_KEY = 'ocean_rescue_ff_unlocked_stage_v1';
const STORAGE_BEST_CAMPAIGN_KEY = 'ocean_rescue_ff_best_campaign_v1';
const STORAGE_BEST_TIME_ATTACK_KEY = 'ocean_rescue_ff_best_ta_v1';

interface SimFish {
  id: number;
  speciesId: SpeciesId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  tailPhase: number;
  chompTimer: number;
  pufferTimer: number;
  pufferInflated: boolean;
  pufferProgress: number;
  stunTimer: number;
  isFromLeft: boolean;
}

interface SimClam {
  x: number;
  y: number;
  radius: number;
  age: number;
  duration: number;
  openProgress: number;
  isBlackPearl: boolean;
  pearlCollected: boolean;
  snapped: boolean;
}

interface SimPowerUp {
  id: number;
  x: number;
  y: number;
  vy: number;
  radius: number;
  kind: PowerUpKind;
}

interface SimAmbientBubble {
  x: number;
  y: number;
  r: number;
  vy: number;
  wobblePhase: number;
}

interface HudSnapshot {
  score: number;
  lives: number;
  growthPoints: number;
  tier: GameTier;
  growthPercent: number;
  tier1Marker: number;
  tier2Marker: number;
  dashEnergy: number;
  whipCooldownPct: number;
  frenzyMeter: number;
  frenzyMultiplier: 1 | 2 | 3 | 4;
  frenzyLabel: string;
  timeRemaining: number;
  fishEaten: number;
  pearlsCollected: number;
  maxCombo: number;
  speedBuffSec: number;
  magnetBuffSec: number;
  freezeBuffSec: number;
  hasShield: boolean;
  bannerText: string | null;
}

/**
 * Miniature animated canvas preview of a playable hero fish or species badge.
 */
const HeroCanvasPreview: React.FC<{ hero: PlayableFishConfig; active: boolean }> = ({
  hero,
  active,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const start = performance.now();

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = 128;
      const h = 76;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      drawPlayableFish(ctx, hero, {
        x: w * 0.5,
        y: h * 0.52 + Math.sin(t * 2.8) * 2.5,
        radius: 22,
        facing: 1,
        tilt: Math.sin(t * 2.4) * 0.06,
        tailPhase: t * (active ? 11 : 6.5),
        chompAmount: active ? Math.max(0, Math.sin(t * 5) * 0.35) : 0,
        lookAngle: 0,
        isDashing: false,
        hasShield: false,
        hasMagnet: false,
        isFrenzy: active,
        isInvulnerable: false,
        timeSec: t,
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [hero, active]);

  return <canvas ref={canvasRef} className="w-32 h-[76px] mx-auto block" />;
};

const SpeciesMiniCanvas: React.FC<{ species: SpeciesConfig; edible: boolean; danger: boolean }> = ({
  species,
  edible,
  danger,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = 52;
    const h = 30;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const previewRadius = species.tier === 1 ? 8 : species.tier === 2 ? 10 : species.tier === 3 ? 11.5 : 12.5;
    drawSpeciesEntity(ctx, species, {
      x: w * 0.52,
      y: h * 0.52,
      radius: previewRadius,
      facing: 1,
      tilt: 0,
      tailPhase: 0.7,
      chompAmount: danger ? 0.25 : 0,
      lookAngle: 0,
      isFrozen: false,
      isChasing: false,
      isFleeing: false,
      isEdibleHighlight: edible,
      isDangerous: danger,
      pufferInflateProgress: 0,
      timeSec: 0,
    });
  }, [species, edible, danger]);

  return <canvas ref={canvasRef} className="w-[52px] h-[30px] shrink-0" />;
};

export const FeedingFrenzyGame: React.FC<FeedingFrenzyGameProps> = ({
  onAwardXp,
  onRecordGame,
  theme = 'dark',
}) => {
  const [gameState, setGameState] = useState<FFGameState>('TITLE_MENU');
  const [mode, setMode] = useState<FFMode>('campaign');
  const [selectedHeroId, setSelectedHeroId] = useState<PlayableFishId>('andy');
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);

  const [unlockedStage, setUnlockedStage] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem(STORAGE_UNLOCKED_KEY) || '1');
      return Number.isFinite(saved) ? Math.max(1, Math.min(FF_STAGES.length, saved)) : 1;
    } catch {
      return 1;
    }
  });
  const [bestCampaignScore, setBestCampaignScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem(STORAGE_BEST_CAMPAIGN_KEY) || '0') || 0;
    } catch {
      return 0;
    }
  });
  const [bestTimeAttackScore, setBestTimeAttackScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem(STORAGE_BEST_TIME_ATTACK_KEY) || '0') || 0;
    } catch {
      return 0;
    }
  });

  const [hud, setHud] = useState<HudSnapshot>({
    score: 0,
    lives: 3,
    growthPoints: 0,
    tier: 1,
    growthPercent: 0,
    tier1Marker: 21,
    tier2Marker: 55,
    dashEnergy: 100,
    whipCooldownPct: 100,
    frenzyMeter: 0,
    frenzyMultiplier: 1,
    frenzyLabel: '1×',
    timeRemaining: TIME_ATTACK_DURATION_SEC,
    fishEaten: 0,
    pearlsCollected: 0,
    maxCombo: 0,
    speedBuffSec: 0,
    magnetBuffSec: 0,
    freezeBuffSec: 0,
    hasShield: false,
    bannerText: null,
  });

  const [endReason, setEndReason] = useState<'lives' | 'timeout' | 'cleared'>('cleared');
  const [lastXpAwarded, setLastXpAwarded] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const backdropImagesRef = useRef<Partial<Record<BackdropKey, HTMLImageElement>>>({});
  const gameStateRef = useRef<FFGameState>(gameState);
  gameStateRef.current = gameState;
  const themeRef = useRef<ThemeMode>(theme);
  themeRef.current = theme;

  const activeHero = PLAYABLE_FISH.find((h) => h.id === selectedHeroId) || PLAYABLE_FISH[0];
  const activeStage: StageConfig = FF_STAGES[selectedStageIdx] || FF_STAGES[0];

  // Mutable high-frequency simulation state inside refs (never causes 60fps React re-renders)
  const simRef = useRef({
    stageIdx: 0,
    mode: 'campaign' as FFMode,
    hero: PLAYABLE_FISH[0],
    player: {
      x: LOGICAL_WIDTH * 0.5,
      y: LOGICAL_HEIGHT * 0.5,
      vx: 0,
      vy: 0,
      targetX: LOGICAL_WIDTH * 0.5,
      targetY: LOGICAL_HEIGHT * 0.5,
      facing: 1 as 1 | -1,
      tilt: 0,
      tailPhase: 0,
      chompTimer: 0,
      radius: 19,
      tier: 1 as GameTier,
      growthPoints: 0,
      lives: 3,
      dashEnergy: 100,
      dashBoostTimer: 0,
      whipCooldown: 0,
      invulnerableTimer: 2.0,
      speedBuffTimer: 0,
      magnetBuffTimer: 0,
      freezeBuffTimer: 0,
      hasShield: false,
    },
    score: 0,
    fishEaten: 0,
    pearlsCollected: 0,
    frenzyMeter: 0,
    comboCount: 0,
    maxCombo: 0,
    wasFrenzyActive: false,
    timeRemaining: TIME_ATTACK_DURATION_SEC,
    evolutionCycles: 0,
    bannerText: null as string | null,
    bannerTimer: 0,
    fishes: [] as SimFish[],
    clam: null as SimClam | null,
    clamCooldown: 6,
    powerUps: [] as SimPowerUp[],
    powerUpCooldown: 7,
    particles: [] as ParticleFX[],
    popups: [] as FloatingPopup[],
    ambientBubbles: [] as SimAmbientBubble[],
    nextId: 1,
    spawnTimer: 0,
    keysPressed: new Set<string>(),
    lastHudSync: 0,
  });

  // Preload all 5 bespoke ecosystem backdrops cleanly
  useEffect(() => {
    (Object.keys(FF_BACKDROP_URLS) as BackdropKey[]).forEach((key) => {
      const img = new Image();
      img.src = FF_BACKDROP_URLS[key];
      backdropImagesRef.current[key] = img;
    });
  }, []);

  const syncHudImmediate = useCallback(() => {
    const s = simRef.current;
    const stageCfg = FF_STAGES[s.stageIdx] || FF_STAGES[0];
    const g = getGrowthProgress(s.player.growthPoints, stageCfg.growthThresholds);
    const frenzy = calculateFrenzyState(s.frenzyMeter);

    setHud({
      score: s.score,
      lives: s.player.lives,
      growthPoints: s.player.growthPoints,
      tier: g.tier,
      growthPercent: g.percent,
      tier1Marker: g.tier1MarkerPercent,
      tier2Marker: g.tier2MarkerPercent,
      dashEnergy: Math.round(s.player.dashEnergy),
      whipCooldownPct: Math.max(0, Math.min(100, Math.round(((2.8 - s.player.whipCooldown) / 2.8) * 100))),
      frenzyMeter: Math.round(s.frenzyMeter),
      frenzyMultiplier: frenzy.multiplier,
      frenzyLabel: frenzy.label,
      timeRemaining: Math.max(0, Math.ceil(s.timeRemaining)),
      fishEaten: s.fishEaten,
      pearlsCollected: s.pearlsCollected,
      maxCombo: s.maxCombo,
      speedBuffSec: Math.ceil(s.player.speedBuffTimer),
      magnetBuffSec: Math.ceil(s.player.magnetBuffTimer),
      freezeBuffSec: Math.ceil(s.player.freezeBuffTimer),
      hasShield: s.player.hasShield,
      bannerText: s.bannerTimer > 0 ? s.bannerText : null,
    });
  }, []);

  const showBanner = useCallback((text: string, duration = 2.2) => {
    simRef.current.bannerText = text;
    simRef.current.bannerTimer = duration;
  }, []);

  const spawnPopup = useCallback((x: number, y: number, text: string, color: string, scale = 1) => {
    simRef.current.popups.push({
      x,
      y,
      vy: -42,
      text,
      color,
      scale,
      life: 1.05,
      maxLife: 1.05,
    });
  }, []);

  const spawnBubbleBurst = useCallback((x: number, y: number, count: number, color = '#D4F6F4') => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 25 + Math.random() * 95;
      simRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 20,
        size: 2.5 + Math.random() * 5,
        alpha: 0.9,
        life: 0.45 + Math.random() * 0.45,
        maxLife: 0.9,
        color,
        kind: 'bubble',
      });
    }
  }, []);

  const pickStageSpecies = useCallback((stageCfg: StageConfig, forceSmall = false): SpeciesId => {
    const candidates = forceSmall
      ? stageCfg.spawnRates.filter((r) => SPECIES_CATALOG[r.id].tier <= 2)
      : stageCfg.spawnRates;
    const pool = candidates.length > 0 ? candidates : stageCfg.spawnRates;
    const total = pool.reduce((acc, item) => acc + item.weight, 0);
    let roll = Math.random() * total;
    for (const item of pool) {
      roll -= item.weight;
      if (roll <= 0) return item.id;
    }
    return pool[0].id;
  }, []);

  const createAiFish = useCallback(
    (stageCfg: StageConfig, speciesOverride?: SpeciesId, randomInterior = false): SimFish => {
      const s = simRef.current;
      const speciesId = speciesOverride ?? pickStageSpecies(stageCfg);
      const cfg = SPECIES_CATALOG[speciesId];
      const fromLeft = Math.random() > 0.5;
      const margin = cfg.baseRadius * 2.5 + 30;
      const x = randomInterior
        ? 90 + Math.random() * (LOGICAL_WIDTH - 180)
        : fromLeft
        ? -margin
        : LOGICAL_WIDTH + margin;
      const minY = speciesId === 'sea_mine' ? 160 : 62;
      const maxY = speciesId === 'sea_mine' ? LOGICAL_HEIGHT - 120 : LOGICAL_HEIGHT - 68;
      const y = minY + Math.random() * (maxY - minY);
      const speedVar = 0.85 + Math.random() * 0.35;
      const dir: 1 | -1 = fromLeft ? 1 : -1;

      return {
        id: s.nextId++,
        speciesId,
        x,
        y,
        vx: dir * cfg.baseSpeed * speedVar,
        vy: (Math.random() - 0.5) * 18,
        facing: dir,
        tailPhase: Math.random() * Math.PI * 2,
        chompTimer: 0,
        pufferTimer: Math.random() * 6,
        pufferInflated: false,
        pufferProgress: 0,
        stunTimer: 0,
        isFromLeft: fromLeft,
      };
    },
    [pickStageSpecies]
  );

  const startNewRun = useCallback(
    (stageIndex: number, runMode: FFMode) => {
      const heroCfg = PLAYABLE_FISH.find((h) => h.id === selectedHeroId) || PLAYABLE_FISH[0];
      const stageCfg = FF_STAGES[stageIndex] || FF_STAGES[0];
      const s = simRef.current;

      s.stageIdx = stageIndex;
      s.mode = runMode;
      s.hero = heroCfg;
      s.player = {
        x: LOGICAL_WIDTH * 0.5,
        y: LOGICAL_HEIGHT * 0.52,
        vx: 0,
        vy: 0,
        targetX: LOGICAL_WIDTH * 0.5,
        targetY: LOGICAL_HEIGHT * 0.52,
        facing: 1,
        tilt: 0,
        tailPhase: 0,
        chompTimer: 0,
        radius: getPlayerVisualRadius(0, stageCfg.growthThresholds),
        tier: 1,
        growthPoints: 0,
        lives: 3,
        dashEnergy: 100,
        dashBoostTimer: 0,
        whipCooldown: 0,
        invulnerableTimer: 2.2,
        speedBuffTimer: 0,
        magnetBuffTimer: 0,
        freezeBuffTimer: 0,
        hasShield: false,
      };
      s.score = 0;
      s.fishEaten = 0;
      s.pearlsCollected = 0;
      s.frenzyMeter = 0;
      s.comboCount = 0;
      s.maxCombo = 0;
      s.wasFrenzyActive = false;
      s.timeRemaining = TIME_ATTACK_DURATION_SEC;
      s.evolutionCycles = 0;
      s.bannerText =
        runMode === 'time_attack'
          ? 'TIME ATTACK 90s! Kejar FRENZY & +5s Gelembung!'
          : `STAGE ${stageCfg.id}: ${stageCfg.name}`;
      s.bannerTimer = 2.6;
      s.fishes = [];
      s.clam = null;
      s.clamCooldown = stageCfg.clamIntervalSec * 0.6;
      s.powerUps = [];
      s.powerUpCooldown = stageCfg.powerUpIntervalSec * 0.55;
      s.particles = [];
      s.popups = [];
      s.spawnTimer = 0.2;
      s.lastHudSync = 0;

      // Ambient rising ocean bubbles
      s.ambientBubbles = Array.from({ length: 24 }, () => ({
        x: Math.random() * LOGICAL_WIDTH,
        y: Math.random() * LOGICAL_HEIGHT,
        r: 1.5 + Math.random() * 3.5,
        vy: -18 - Math.random() * 28,
        wobblePhase: Math.random() * Math.PI * 2,
      }));

      // Initial welcoming reef population (plenty of Tier 1 prey near start!)
      for (let i = 0; i < 12; i++) {
        s.fishes.push(createAiFish(stageCfg, undefined, true));
      }
      for (let i = 0; i < 6; i++) {
        s.fishes.push(createAiFish(stageCfg, pickStageSpecies(stageCfg, true), true));
      }
      for (let h = 0; h < stageCfg.hazardCount; h++) {
        const hzKind: SpeciesId = stageCfg.id >= 4 && h % 2 === 1 ? 'sea_mine' : 'jellyfish';
        s.fishes.push(createAiFish(stageCfg, hzKind, true));
      }

      setSelectedStageIdx(stageIndex);
      setMode(runMode);
      setGameState('PLAYING');
      syncHudImmediate();
      soundEffects.playBubblePop();
    },
    [selectedHeroId, createAiFish, pickStageSpecies, syncHudImmediate]
  );

  const finishRun = useCallback(
    (reason: 'lives' | 'timeout' | 'cleared') => {
      const s = simRef.current;
      setEndReason(reason);
      setGameState(reason === 'cleared' ? 'STAGE_CLEAR' : 'GAME_OVER');
      syncHudImmediate();

      // Calculate XP & update Ocean Rescue profile + local high scores
      const accuracyProxy = Math.min(100, 65 + Math.min(35, s.maxCombo * 2));
      const xpEarned = Math.max(
        15,
        calculateXpFromGame(Math.round(s.score / 5), accuracyProxy, s.stageIdx + 1) +
          (reason === 'cleared' ? 45 : 10)
      );
      setLastXpAwarded(xpEarned);
      onAwardXp(
        xpEarned,
        reason === 'cleared'
          ? `Menaklukkan Feeding Frenzy Stage ${s.stageIdx + 1}`
          : 'Petualangan Feeding Frenzy'
      );
      onRecordGame(s.score, xpEarned);

      if (s.mode === 'campaign') {
        if (s.score > bestCampaignScore) {
          setBestCampaignScore(s.score);
          try {
            localStorage.setItem(STORAGE_BEST_CAMPAIGN_KEY, String(s.score));
          } catch {}
        }
        if (reason === 'cleared') {
          const nextUnlocked = Math.min(FF_STAGES.length, Math.max(unlockedStage, s.stageIdx + 2));
          if (nextUnlocked > unlockedStage) {
            setUnlockedStage(nextUnlocked);
            try {
              localStorage.setItem(STORAGE_UNLOCKED_KEY, String(nextUnlocked));
            } catch {}
          }
          soundEffects.playFanfare();
          try {
            confetti({
              particleCount: 90,
              spread: 75,
              origin: { y: 0.6 },
              colors: ['#82AAA1', '#C7B99E', '#367D7B', '#EDEBE3'],
            });
          } catch {}
        } else {
          soundEffects.playPlayerHit();
        }
      } else {
        if (s.score > bestTimeAttackScore) {
          setBestTimeAttackScore(s.score);
          try {
            localStorage.setItem(STORAGE_BEST_TIME_ATTACK_KEY, String(s.score));
          } catch {}
        }
        soundEffects.playFanfare();
      }
    },
    [
      bestCampaignScore,
      bestTimeAttackScore,
      unlockedStage,
      onAwardXp,
      onRecordGame,
      syncHudImmediate,
    ]
  );

  // Trigger Dash Boost (Left Click or Space)
  const triggerDash = useCallback(() => {
    if (gameStateRef.current !== 'PLAYING') return;
    const p = simRef.current.player;
    if (p.dashEnergy < 18) return;

    p.dashEnergy = Math.max(0, p.dashEnergy - 22);
    p.dashBoostTimer = 0.24;
    p.chompTimer = 0.24;
    soundEffects.playDash();
    spawnBubbleBurst(p.x - p.facing * p.radius, p.y, 7, '#CCF3F2');
  }, [spawnBubbleBurst]);

  // Trigger Tail Whip Suction Swirl (Right Click or Shift)
  const triggerTailWhip = useCallback(() => {
    if (gameStateRef.current !== 'PLAYING') return;
    const s = simRef.current;
    const p = s.player;
    if (p.whipCooldown > 0) return;

    p.whipCooldown = 2.8;
    p.chompTimer = 0.22;
    soundEffects.playTailWhip();

    const whipRadius = 175 * s.hero.whipRadiusMultiplier;
    s.particles.push({
      x: p.x,
      y: p.y,
      vx: 0,
      vy: 0,
      size: whipRadius,
      alpha: 0.85,
      life: 0.36,
      maxLife: 0.36,
      color: '#82E6D9',
      kind: 'ring',
    });

    // Pull edible prey inward and briefly disorient small predators!
    for (const f of s.fishes) {
      const cfg = SPECIES_CATALOG[f.speciesId];
      const dx = p.x - f.x;
      const dy = p.y - f.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1 && dist <= whipRadius) {
        if (canPlayerEat(p.tier, cfg.tier, f.speciesId, f.pufferInflated)) {
          f.x += dx * 0.48;
          f.y += dy * 0.48;
          f.stunTimer = 0.65;
        } else if (!cfg.isHazardOnly) {
          // Slight knockback nudge on medium predators
          f.x -= (dx / dist) * 32;
          f.y -= (dy / dist) * 32;
          f.stunTimer = 0.45;
        }
      }
    }
  }, []);

  // Keyboard shortcuts (WASD/Arrows fallback, Space Dash, Shift Tail Whip, Esc/P Pause)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (gameStateRef.current === 'PLAYING') {
          e.preventDefault();
          setGameState('PAUSED');
        } else if (gameStateRef.current === 'PAUSED') {
          e.preventDefault();
          setGameState('PLAYING');
        }
        return;
      }

      if (gameStateRef.current !== 'PLAYING') return;

      if (e.code === 'Space') {
        e.preventDefault();
        triggerDash();
        return;
      }
      if (e.key === 'Shift') {
        e.preventDefault();
        triggerTailWhip();
        return;
      }
      simRef.current.keysPressed.add(e.key.toLowerCase());
    };

    const onKeyUp = (e: KeyboardEvent) => {
      simRef.current.keysPressed.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [triggerDash, triggerTailWhip]);

  // Main 60fps Feeding Frenzy Simulation & Canvas Render Loop
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    const runStart = lastTime;

    const frame = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);
      const timeSec = (now - runStart) / 1000;

      const canvas = canvasRef.current;
      const s = simRef.current;
      const stageCfg = FF_STAGES[s.stageIdx] || FF_STAGES[0];

      if (gameStateRef.current === 'PLAYING') {
        const p = s.player;

        // Timers & stamina recovery
        if (s.bannerTimer > 0) s.bannerTimer = Math.max(0, s.bannerTimer - dt);
        if (p.chompTimer > 0) p.chompTimer = Math.max(0, p.chompTimer - dt);
        if (p.dashBoostTimer > 0) p.dashBoostTimer = Math.max(0, p.dashBoostTimer - dt);
        if (p.whipCooldown > 0) p.whipCooldown = Math.max(0, p.whipCooldown - dt);
        if (p.invulnerableTimer > 0) p.invulnerableTimer = Math.max(0, p.invulnerableTimer - dt);
        if (p.speedBuffTimer > 0) p.speedBuffTimer = Math.max(0, p.speedBuffTimer - dt);
        if (p.magnetBuffTimer > 0) p.magnetBuffTimer = Math.max(0, p.magnetBuffTimer - dt);
        if (p.freezeBuffTimer > 0) p.freezeBuffTimer = Math.max(0, p.freezeBuffTimer - dt);

        p.dashEnergy = Math.min(100, p.dashEnergy + 18 * s.hero.dashRecoveryBonus * dt);

        // Frenzy decay & state check
        if (s.frenzyMeter > 0) {
          s.frenzyMeter = Math.max(0, s.frenzyMeter - (12 / s.hero.frenzyDecayBonus) * dt);
          if (s.frenzyMeter <= 0) {
            s.comboCount = 0;
            s.wasFrenzyActive = false;
          }
        }
        const frenzyInfo = calculateFrenzyState(s.frenzyMeter);
        if (frenzyInfo.isFrenzyActive && !s.wasFrenzyActive) {
          s.wasFrenzyActive = true;
          soundEffects.playFrenzyTrigger();
          showBanner(`FEEDING FRENZY! ${frenzyInfo.multiplier}× SKOR`, 1.7);
        }

        // Time Attack countdown
        if (s.mode === 'time_attack') {
          s.timeRemaining -= dt;
          if (s.timeRemaining <= 0) {
            s.timeRemaining = 0;
            finishRun('timeout');
          }
        }

        // Keyboard directional nudging (cooperates seamlessly with cursor target)
        const keys = s.keysPressed;
        const kbSpeed = 480;
        let kbDx = 0;
        let kbDy = 0;
        if (keys.has('arrowleft') || keys.has('a')) kbDx -= 1;
        if (keys.has('arrowright') || keys.has('d')) kbDx += 1;
        if (keys.has('arrowup') || keys.has('w')) kbDy -= 1;
        if (keys.has('arrowdown') || keys.has('s')) kbDy += 1;
        if (kbDx !== 0 || kbDy !== 0) {
          const kbLen = Math.hypot(kbDx, kbDy);
          p.targetX = Math.max(24, Math.min(LOGICAL_WIDTH - 24, p.x + (kbDx / kbLen) * kbSpeed * 0.25));
          p.targetY = Math.max(40, Math.min(LOGICAL_HEIGHT - 36, p.y + (kbDy / kbLen) * kbSpeed * 0.25));
        }

        // Player Spring-Eased Swim Physics
        const dxToTarget = p.targetX - p.x;
        const dyToTarget = p.targetY - p.y;
        const distToTarget = Math.hypot(dxToTarget, dyToTarget);

        const speedMult =
          s.hero.speedStat *
          (p.dashBoostTimer > 0 ? 2.05 : 1) *
          (p.speedBuffTimer > 0 ? 1.42 : 1);

        if (distToTarget > 3) {
          const desiredVx = (dxToTarget / distToTarget) * Math.min(540 * speedMult, distToTarget * 10.5 * speedMult);
          const desiredVy = (dyToTarget / distToTarget) * Math.min(540 * speedMult, distToTarget * 10.5 * speedMult);
          const accel = p.dashBoostTimer > 0 ? 18 : 11;
          p.vx += (desiredVx - p.vx) * Math.min(1, accel * dt);
          p.vy += (desiredVy - p.vy) * Math.min(1, accel * dt);
        } else {
          p.vx *= Math.pow(0.08, dt);
          p.vy *= Math.pow(0.08, dt);
        }

        p.x = Math.max(p.radius + 10, Math.min(LOGICAL_WIDTH - p.radius - 10, p.x + p.vx * dt));
        p.y = Math.max(42, Math.min(LOGICAL_HEIGHT - p.radius - 12, p.y + p.vy * dt));

        if (Math.abs(dxToTarget) > 6) {
          p.facing = dxToTarget >= 0 ? 1 : -1;
        } else if (Math.abs(p.vx) > 22) {
          p.facing = p.vx >= 0 ? 1 : -1;
        }

        const speedMag = Math.hypot(p.vx, p.vy);
        const desiredTilt = Math.max(-0.42, Math.min(0.42, (p.vy / 440) * p.facing));
        p.tilt += (desiredTilt - p.tilt) * Math.min(1, 10 * dt);
        p.tailPhase += (5.2 + (speedMag / 55) * 3.8 + (p.dashBoostTimer > 0 ? 10 : 0)) * dt;

        // Ambient bubble column updates
        for (const b of s.ambientBubbles) {
          b.y += b.vy * dt;
          b.x += Math.sin(timeSec * 2 + b.wobblePhase) * 8 * dt;
          if (b.y < -12) {
            b.y = LOGICAL_HEIGHT + 12;
            b.x = Math.random() * LOGICAL_WIDTH;
          }
        }

        // Fish Spawner
        s.spawnTimer -= dt;
        if (s.spawnTimer <= 0 && s.fishes.length < stageCfg.maxActiveFish) {
          s.spawnTimer = 0.42 + Math.random() * 0.35;
          // Ensure plenty of edible prey are always present so player is never starved!
          const edibleCount = s.fishes.filter((f) => {
            const cfg = SPECIES_CATALOG[f.speciesId];
            return canPlayerEat(p.tier, cfg.tier, f.speciesId, f.pufferInflated);
          }).length;
          const forceSmall = edibleCount < 8;
          s.fishes.push(createAiFish(stageCfg, forceSmall ? pickStageSpecies(stageCfg, true) : undefined, false));
        }

        // Giant Clam Lifecycle
        if (!s.clam) {
          s.clamCooldown -= dt;
          if (s.clamCooldown <= 0) {
            s.clamCooldown = stageCfg.clamIntervalSec + Math.random() * 4;
            s.clam = {
              x: 150 + Math.random() * (LOGICAL_WIDTH - 300),
              y: LOGICAL_HEIGHT - 38,
              radius: 38,
              age: 0,
              duration: 7.5,
              openProgress: 0,
              isBlackPearl: Math.random() < 0.28,
              pearlCollected: false,
              snapped: false,
            };
          }
        } else {
          const clam = s.clam;
          clam.age += dt;
          if (clam.age < 1.0) {
            clam.openProgress = clam.age;
          } else if (clam.age < clam.duration - 0.65) {
            clam.openProgress = 1;
          } else if (clam.age < clam.duration) {
            clam.openProgress = Math.max(0, (clam.duration - clam.age) / 0.65);
          } else {
            s.clam = null;
          }

          if (s.clam) {
            const distToClam = Math.hypot(p.x - clam.x, p.y - (clam.y - 10));
            const isWarningClose = clam.age > clam.duration - 2.1 && clam.age < clam.duration - 0.65;

            // Collect Pearl while open!
            if (!clam.pearlCollected && clam.openProgress > 0.45 && distToClam < p.radius + 32) {
              clam.pearlCollected = true;
              s.pearlsCollected += 1;
              const bonusScore = (clam.isBlackPearl ? 600 : 250) * frenzyInfo.multiplier;
              const growthBoost = clam.isBlackPearl ? 65 : 28;
              s.score += bonusScore;
              p.growthPoints += growthBoost;
              if (clam.isBlackPearl) {
                s.frenzyMeter = 100;
              } else {
                s.frenzyMeter = Math.min(100, s.frenzyMeter + 26);
              }
              soundEffects.playPearlCollect(clam.isBlackPearl);
              spawnBubbleBurst(clam.x, clam.y - 14, 14, clam.isBlackPearl ? '#D5C4FF' : '#FFF7DA');
              spawnPopup(
                clam.x,
                clam.y - 34,
                clam.isBlackPearl ? `MUTIARA HITAM +${bonusScore}!` : `MUTIARA +${bonusScore}`,
                clam.isBlackPearl ? '#DFCDFF' : '#FFF6CC',
                1.25
              );
            }

            // Snap hazard when clam slams shut
            if (!clam.snapped && clam.age >= clam.duration - 0.55) {
              clam.snapped = true;
              if (distToClam < p.radius + 28 && p.invulnerableTimer <= 0) {
                if (p.hasShield) {
                  p.hasShield = false;
                  p.invulnerableTimer = 1.6;
                  soundEffects.playParry();
                  spawnBubbleBurst(p.x, p.y, 12, '#8CC9FF');
                  spawnPopup(p.x, p.y - 26, 'PERISAI PECAH!', '#8CC9FF', 1.1);
                } else {
                  p.lives -= 1;
                  p.invulnerableTimer = 2.6;
                  s.frenzyMeter = 0;
                  soundEffects.playPlayerHit();
                  spawnBubbleBurst(p.x, p.y, 14, '#D98270');
                  spawnPopup(p.x, p.y - 28, 'TERJEPIT TIRAM! -1❤', '#D98270', 1.15);
                  if (p.lives <= 0) finishRun('lives');
                }
              }
            }
          }
        }

        // Power-Up / Bonus Bubble Spawner & Collisions
        s.powerUpCooldown -= dt;
        if (s.powerUpCooldown <= 0) {
          s.powerUpCooldown = stageCfg.powerUpIntervalSec + Math.random() * 4;
          const kinds: PowerUpKind[] =
            s.mode === 'time_attack'
              ? ['speed', 'magnet', 'shield', 'freeze', 'star', 'time', 'time']
              : ['speed', 'magnet', 'shield', 'freeze', 'star'];
          const kind = kinds[Math.floor(Math.random() * kinds.length)];
          s.powerUps.push({
            id: s.nextId++,
            x: 90 + Math.random() * (LOGICAL_WIDTH - 180),
            y: LOGICAL_HEIGHT + 24,
            vy: -44 - Math.random() * 18,
            radius: 20,
            kind,
          });
        }

        const remainingPowerUps: SimPowerUp[] = [];
        for (const pu of s.powerUps) {
          pu.y += pu.vy * dt;
          pu.x += Math.sin(timeSec * 2 + pu.id) * 18 * dt;
          if (pu.y < -40) continue;

          const dist = Math.hypot(p.x - pu.x, p.y - pu.y);
          if (dist < p.radius + pu.radius) {
            soundEffects.playPowerUp();
            spawnBubbleBurst(pu.x, pu.y, 10, '#A5EFE5');
            if (pu.kind === 'speed') {
              p.speedBuffTimer = 7;
              spawnPopup(pu.x, pu.y - 20, 'TURBO ARUS!', '#F6C95E', 1.15);
            } else if (pu.kind === 'magnet') {
              p.magnetBuffTimer = 9;
              spawnPopup(pu.x, pu.y - 20, 'MAGNET MANGSA!', '#79E6D8', 1.15);
            } else if (pu.kind === 'shield') {
              p.hasShield = true;
              spawnPopup(pu.x, pu.y - 20, 'PERISAI GELEMBUNG!', '#8CC9FF', 1.15);
            } else if (pu.kind === 'freeze') {
              p.freezeBuffTimer = 6.5;
              spawnPopup(pu.x, pu.y - 20, 'ARUS BEKU!', '#BBE9FF', 1.15);
            } else if (pu.kind === 'star') {
              const starPts = 180 * frenzyInfo.multiplier;
              s.score += starPts;
              s.frenzyMeter = Math.min(100, s.frenzyMeter + 24);
              spawnPopup(pu.x, pu.y - 20, `BINTANG +${starPts}`, '#F5DA78', 1.2);
            } else if (pu.kind === 'time') {
              s.timeRemaining += 6;
              spawnPopup(pu.x, pu.y - 20, '+6 DETIK!', '#9AF0C2', 1.2);
            }
            continue;
          }
          remainingPowerUps.push(pu);
        }
        s.powerUps = remainingPowerUps;

        // AI Fish Updates + Food Chain Collisions
        const freezeFactor = p.freezeBuffTimer > 0 ? 0.28 : 1;
        const survivingFish: SimFish[] = [];

        for (const f of s.fishes) {
          const cfg = SPECIES_CATALOG[f.speciesId];
          if (f.chompTimer > 0) f.chompTimer = Math.max(0, f.chompTimer - dt);
          if (f.stunTimer > 0) f.stunTimer = Math.max(0, f.stunTimer - dt);

          // Pufferfish inflation cycle
          if (f.speciesId === 'pufferfish') {
            f.pufferTimer += dt * freezeFactor;
            const cycle = f.pufferTimer % 7.5;
            f.pufferInflated = cycle > 4.1 && cycle < 6.9;
            const targetInflate = f.pufferInflated ? 1 : 0;
            f.pufferProgress += (targetInflate - f.pufferProgress) * Math.min(1, 7 * dt);
          }

          const edible = canPlayerEat(p.tier, cfg.tier, f.speciesId, f.pufferInflated);
          const dangerous = isTargetDangerous(p.tier, cfg.tier, f.speciesId, f.pufferInflated);

          const dx = p.x - f.x;
          const dy = p.y - f.y;
          const dist = Math.hypot(dx, dy);

          let chasing = false;
          let fleeing = false;

          if (f.speciesId === 'jellyfish') {
            f.y += Math.sin(timeSec * 1.8 + f.id) * 28 * dt * freezeFactor;
            f.x += f.vx * 0.45 * dt * freezeFactor;
          } else if (f.speciesId === 'sea_mine') {
            f.x += f.vx * 0.4 * dt * freezeFactor;
            f.y += Math.sin(timeSec * 1.1 + f.id) * 14 * dt * freezeFactor;
          } else if (f.stunTimer <= 0) {
            if (p.magnetBuffTimer > 0 && edible && dist < 240 && dist > 1) {
              // Magnet pulls edible fish gracefully toward player
              f.x += (dx / dist) * 195 * dt;
              f.y += (dy / dist) * 195 * dt;
            } else if (dangerous && cfg.canChase && dist < 250 && p.invulnerableTimer <= 0 && p.freezeBuffTimer <= 0) {
              // Predator locks onto smaller player!
              chasing = true;
              const chaseSpeed = cfg.baseSpeed * 1.42;
              const targetVx = (dx / Math.max(1, dist)) * chaseSpeed;
              const targetVy = (dy / Math.max(1, dist)) * chaseSpeed;
              f.vx += (targetVx - f.vx) * Math.min(1, 3.6 * dt);
              f.vy += (targetVy - f.vy) * Math.min(1, 3.6 * dt);
              if (dist < 130) f.chompTimer = 0.2;
            } else if (edible && dist < 135 && f.speciesId !== 'pufferfish') {
              // Prey flees away from larger approaching player!
              fleeing = true;
              const fleeSpeed = cfg.baseSpeed * 1.48;
              const awayVx = (-dx / Math.max(1, dist)) * fleeSpeed;
              const awayVy = (-dy / Math.max(1, dist)) * fleeSpeed;
              f.vx += (awayVx - f.vx) * Math.min(1, 4.2 * dt);
              f.vy += (awayVy - f.vy) * Math.min(1, 4.2 * dt);
            } else {
              // Gentle organic cruising + wave oscillation
              const baseCruise = (f.isFromLeft ? 1 : -1) * cfg.baseSpeed;
              f.vx += (baseCruise - f.vx) * Math.min(1, 1.5 * dt);
              f.vy += Math.sin(timeSec * 1.9 + f.id) * 26 * dt;
            }

            f.x += f.vx * dt * freezeFactor;
            f.y += f.vy * dt * freezeFactor;
            f.y = Math.max(46, Math.min(LOGICAL_HEIGHT - 46, f.y));
            if (Math.abs(f.vx) > 8) {
              f.facing = f.vx >= 0 ? 1 : -1;
            }
          }

          f.tailPhase += (5 + (Math.hypot(f.vx, f.vy) / 55) * 3) * dt * freezeFactor;

          // Despawn outside horizontal bounds
          if (f.x < -170 || f.x > LOGICAL_WIDTH + 170) {
            continue;
          }

          // Hitbox check against Player
          const effectiveTargetRadius =
            f.speciesId === 'pufferfish' ? cfg.baseRadius * (1 + f.pufferProgress * 0.45) : cfg.baseRadius;
          const hitDist = p.radius * 0.92 + effectiveTargetRadius * 0.78;

          if (dist < hitDist) {
            if (edible) {
              // Player CHOMPS prey!
              p.chompTimer = 0.2;
              s.fishEaten += 1;
              s.comboCount += 1;
              s.maxCombo = Math.max(s.maxCombo, s.comboCount);
              s.frenzyMeter = Math.min(100, s.frenzyMeter + 17);

              const nextFrenzy = calculateFrenzyState(s.frenzyMeter);
              const pts = cfg.scoreValue * nextFrenzy.multiplier;
              s.score += pts;
              p.growthPoints += cfg.growthValue;

              soundEffects.playChomp(cfg.tier);
              spawnBubbleBurst(f.x, f.y, 6, '#E2F8F6');
              spawnPopup(
                f.x,
                f.y - 18,
                nextFrenzy.isFrenzyActive ? `+${pts} (${nextFrenzy.multiplier}×)` : `+${pts}`,
                nextFrenzy.isFrenzyActive ? '#F5DA78' : '#BCEBE3',
                nextFrenzy.isFrenzyActive ? 1.15 : 0.95
              );

              // Check Evolution & Stage Completion!
              const gAfter = getGrowthProgress(p.growthPoints, stageCfg.growthThresholds);
              p.radius = getPlayerVisualRadius(p.growthPoints, stageCfg.growthThresholds);
              if (gAfter.tier > p.tier) {
                p.tier = gAfter.tier;
                p.invulnerableTimer = Math.max(p.invulnerableTimer, 1.4);
                soundEffects.playGrowthUp();
                spawnBubbleBurst(p.x, p.y, 16, '#F5DA78');
                showBanner(
                  p.tier === 2 ? 'EVOLUSI! Ukuran SEDANG Terbuka!' : 'EVOLUSI APEX! Ukuran BESAR Terbuka!',
                  2.2
                );
              }

              if (p.growthPoints >= stageCfg.growthThresholds[2]) {
                if (s.mode === 'campaign') {
                  finishRun('cleared');
                } else {
                  // Time Attack Cycle Reset Bonus!
                  s.evolutionCycles += 1;
                  const cycleBonus = 900 * s.evolutionCycles;
                  s.score += cycleBonus;
                  p.growthPoints = 0;
                  p.tier = 1;
                  p.radius = getPlayerVisualRadius(0, stageCfg.growthThresholds);
                  p.invulnerableTimer = 2.0;
                  soundEffects.playGrowthUp();
                  showBanner(`SIKLUS PUNCAK #${s.evolutionCycles}! +${cycleBonus} BONUS`, 2.2);
                }
              }

              continue; // Fish eaten!
            } else if (dangerous && p.invulnerableTimer <= 0) {
              // Predator or hazard hits player!
              if (p.hasShield) {
                p.hasShield = false;
                p.invulnerableTimer = 1.6;
                f.stunTimer = 1.2;
                f.vx = -f.vx * 1.4;
                soundEffects.playParry();
                spawnBubbleBurst(p.x, p.y, 14, '#8CC9FF');
                spawnPopup(p.x, p.y - 26, 'TERLINDUNG PERISAI!', '#8CC9FF', 1.15);
              } else {
                p.lives -= 1;
                p.invulnerableTimer = 2.6;
                s.frenzyMeter = 0;
                s.comboCount = 0;
                s.wasFrenzyActive = false;
                f.chompTimer = 0.3;
                soundEffects.playPlayerHit();
                spawnBubbleBurst(p.x, p.y, 16, '#D98270');
                spawnPopup(
                  p.x,
                  p.y - 28,
                  f.speciesId === 'jellyfish'
                    ? 'SENGATAN UBUR-UBUR! -1❤'
                    : f.speciesId === 'sea_mine'
                    ? 'TERKENA RANJAU! -1❤'
                    : `DIMANGSA ${cfg.name.toUpperCase()}! -1❤`,
                  '#D98270',
                  1.15
                );
                if (p.lives <= 0) {
                  finishRun('lives');
                } else {
                  // Safe center respawn
                  p.x = LOGICAL_WIDTH * 0.5;
                  p.y = LOGICAL_HEIGHT * 0.5;
                  p.vx = 0;
                  p.vy = 0;
                }
              }
            }
          }

          // Store temporary render flags on object properties dynamically? Cleanly pass during draw!
          survivingFish.push(f);
        }
        s.fishes = survivingFish;

        // Particle Updates
        s.particles = s.particles.filter((pt) => {
          pt.life -= dt;
          if (pt.life <= 0) return false;
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          return true;
        });

        // Floating Popups
        s.popups = s.popups.filter((pop) => {
          pop.life -= dt;
          if (pop.life <= 0) return false;
          pop.y += pop.vy * dt;
          return true;
        });

        // Sync React HUD at ~15Hz
        if (now - s.lastHudSync > 65) {
          s.lastHudSync = now;
          syncHudImmediate();
        }
      }

      // RENDER TO HIGH-DPI CANVAS
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const targetW = LOGICAL_WIDTH * dpr;
          const targetH = LOGICAL_HEIGHT * dpr;
          if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW;
            canvas.height = targetH;
          }

          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

          const backdropImg = backdropImagesRef.current[stageCfg.backdropKey] || null;
          const frenzyInfo = calculateFrenzyState(s.frenzyMeter);

          drawStageBackdrop(
            ctx,
            LOGICAL_WIDTH,
            LOGICAL_HEIGHT,
            stageCfg,
            backdropImg,
            timeSec,
            frenzyInfo.isFrenzyActive && gameStateRef.current === 'PLAYING',
            s.player.freezeBuffTimer > 0 && gameStateRef.current === 'PLAYING',
            themeRef.current === 'dark'
          );

          // Ambient bubbles behind creatures
          ctx.save();
          for (const b of s.ambientBubbles) {
            ctx.strokeStyle = 'rgba(215, 248, 245, 0.36)';
            ctx.fillStyle = 'rgba(215, 248, 245, 0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();

          // Giant Clam on seabed
          if (s.clam) {
            const c = s.clam;
            drawGiantClam(ctx, {
              x: c.x,
              y: c.y,
              radius: c.radius,
              openProgress: c.openProgress,
              isBlackPearl: c.isBlackPearl,
              pearlCollected: c.pearlCollected,
              isWarningClose: c.age > c.duration - 2.1 && c.age < c.duration - 0.65,
              timeSec,
            });
          }

          // Power-Up Bubbles
          for (const pu of s.powerUps) {
            drawBubbleCollectible(ctx, {
              x: pu.x,
              y: pu.y,
              radius: pu.radius,
              kind: pu.kind,
              timeSec,
            });
          }

          // AI Marine Entities
          for (const f of s.fishes) {
            const cfg = SPECIES_CATALOG[f.speciesId];
            const edible = canPlayerEat(s.player.tier, cfg.tier, f.speciesId, f.pufferInflated);
            const dangerous = isTargetDangerous(s.player.tier, cfg.tier, f.speciesId, f.pufferInflated);
            const dist = Math.hypot(s.player.x - f.x, s.player.y - f.y);
            const chasing = dangerous && !!cfg.canChase && dist < 250 && s.player.freezeBuffTimer <= 0;
            const fleeing = edible && dist < 135 && f.speciesId !== 'pufferfish';

            drawSpeciesEntity(ctx, cfg, {
              x: f.x,
              y: f.y,
              radius: cfg.baseRadius,
              facing: f.facing,
              tilt: Math.max(-0.35, Math.min(0.35, (f.vy / 260) * f.facing)),
              tailPhase: f.tailPhase,
              chompAmount: Math.min(1, f.chompTimer * 4),
              lookAngle: 0,
              isFrozen: s.player.freezeBuffTimer > 0,
              isChasing: chasing,
              isFleeing: fleeing,
              isEdibleHighlight: s.player.magnetBuffTimer > 0 && edible && dist < 240,
              isDangerous: dangerous,
              pufferInflateProgress: f.pufferProgress,
              timeSec,
            });
          }

          // Player Fish (only drawn while actively in stage/paused/summary)
          if (gameStateRef.current !== 'TITLE_MENU') {
            drawPlayableFish(ctx, s.hero, {
              x: s.player.x,
              y: s.player.y,
              radius: s.player.radius,
              facing: s.player.facing,
              tilt: s.player.tilt,
              tailPhase: s.player.tailPhase,
              chompAmount: Math.min(1, s.player.chompTimer * 4.5),
              lookAngle: 0,
              isDashing: s.player.dashBoostTimer > 0,
              hasShield: s.player.hasShield,
              hasMagnet: s.player.magnetBuffTimer > 0,
              isFrenzy: frenzyInfo.isFrenzyActive,
              isInvulnerable: s.player.invulnerableTimer > 0,
              timeSec,
            });

            // Subtle aiming reticle at pointer position so mouse follow feels ultra-precise
            if (gameStateRef.current === 'PLAYING') {
              ctx.save();
              ctx.translate(s.player.targetX, s.player.targetY);
              ctx.strokeStyle = 'rgba(235, 248, 245, 0.55)';
              ctx.lineWidth = 1.4;
              ctx.beginPath();
              ctx.arc(0, 0, 8, 0, Math.PI * 2);
              ctx.stroke();
              ctx.fillStyle = 'rgba(235, 248, 245, 0.85)';
              ctx.beginPath();
              ctx.arc(0, 0, 2, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          }

          // Active FX Particles (bubbles & Tail Whip shockwave rings)
          for (const pt of s.particles) {
            const alphaRatio = Math.max(0, pt.life / pt.maxLife);
            ctx.save();
            ctx.globalAlpha = pt.alpha * alphaRatio;
            if (pt.kind === 'ring') {
              const r = pt.size * (1 - alphaRatio * 0.72);
              ctx.strokeStyle = pt.color;
              ctx.lineWidth = 3.5 * alphaRatio;
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
              ctx.stroke();
            } else {
              ctx.strokeStyle = pt.color;
              ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
            }
            ctx.restore();
          }

          // Floating Score & Event Popups
          for (const pop of s.popups) {
            const alphaRatio = Math.min(1, (pop.life / pop.maxLife) * 1.4);
            ctx.save();
            ctx.globalAlpha = alphaRatio;
            ctx.font = `700 ${Math.round(14 * pop.scale)}px "DM Sans", sans-serif`;
            ctx.textAlign = 'center';
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(6, 17, 22, 0.85)';
            ctx.strokeText(pop.text, pop.x, pop.y);
            ctx.fillStyle = pop.color;
            ctx.fillText(pop.text, pop.x, pop.y);
            ctx.restore();
          }
        }
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [createAiFish, pickStageSpecies, finishRun, showBanner, spawnBubbleBurst, spawnPopup, syncHudImmediate]);

  const mapPointerToCanvas = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = LOGICAL_WIDTH / Math.max(1, rect.width);
    const scaleY = LOGICAL_HEIGHT / Math.max(1, rect.height);
    simRef.current.player.targetX = Math.max(
      12,
      Math.min(LOGICAL_WIDTH - 12, (e.clientX - rect.left) * scaleX)
    );
    simRef.current.player.targetY = Math.max(
      24,
      Math.min(LOGICAL_HEIGHT - 16, (e.clientY - rect.top) * scaleY)
    );
  };

  return (
    <div className="space-y-4">
      {/* Main Interactive Feeding Frenzy Frame */}
      <div className="relative rounded-2xl bg-[var(--bg-elevated)] dark:bg-[#061116] text-[#0B1E27] dark:text-[#EDEBE3] shadow-2xl overflow-hidden border border-[#0B1E27]/12 dark:border-[#82AAA1]/20 select-none transition-colors duration-300">
        {/* TOP HUD BAR (Visible while Playing / Paused) */}
        {gameState !== 'TITLE_MENU' && (
          <div className="relative z-20 px-4 sm:px-5 py-3 bg-[#F7F6F1]/95 dark:bg-[#061116]/90 border-b border-[#0B1E27]/10 dark:border-[#82AAA1]/15 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs tabular-nums">
              {/* Left: Score + Frenzy Multiplier + Lives */}
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <span className="text-[#425B66] dark:text-[#98ACB5]">Skor </span>
                  <strong className="text-base text-[#0B1E27] dark:text-[#EDEBE3] font-bold">
                    {hud.score.toLocaleString('id-ID')}
                  </strong>
                </div>

                {/* Frenzy Gauge */}
                <div className="flex items-center gap-2">
                  <Flame
                    className={`w-4 h-4 ${
                      hud.frenzyMultiplier > 1
                        ? 'text-[#B57B14] dark:text-[#F5DA78]'
                        : 'text-[#5F7782] dark:text-[#7C929C]'
                    }`}
                  />
                  <span
                    className={`font-bold ${
                      hud.frenzyMultiplier > 1
                        ? 'text-[#9A6810] dark:text-[#F5DA78]'
                        : 'text-[#425B66] dark:text-[#98ACB5]'
                    }`}
                  >
                    {hud.frenzyLabel}
                  </span>
                  <div className="w-20 h-1.5 rounded-full bg-[#DCE6E4] dark:bg-[#102B38] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-100 ${
                        hud.frenzyMultiplier > 1
                          ? 'bg-[#D39622] dark:bg-[#F5DA78]'
                          : 'bg-[#1D6664] dark:bg-[#367D7B]'
                      }`}
                      style={{ width: `${hud.frenzyMeter}%` }}
                    />
                  </div>
                </div>

                {/* Lives */}
                <div className="flex items-center gap-1" aria-label={`Nyawa tersisa ${hud.lives}`}>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Heart
                      key={idx}
                      className={`w-4 h-4 ${
                        idx < hud.lives
                          ? 'text-[#B84F3C] fill-[#B84F3C] dark:text-[#D98270] dark:fill-[#D98270]'
                          : 'text-[#0B1E27]/20 dark:text-[#425B66]/40'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Center: Growth Bar with 2 Evolution Checkpoints */}
              <div className="flex-1 min-w-[200px] max-w-md space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#1D6664] dark:text-[#82AAA1]">
                    Ukuran:{' '}
                    <strong className="text-[#0B1E27] dark:text-[#EDEBE3]">
                      {hud.tier === 1 ? 'Kecil' : hud.tier === 2 ? 'Sedang' : 'Besar (Apex)'}
                    </strong>
                  </span>
                  <span className="text-[#425B66] dark:text-[#98ACB5]">
                    {Math.min(100, Math.round(hud.growthPercent))}%
                  </span>
                </div>
                <div className="relative w-full h-2.5 rounded-full bg-[#DCE6E4] dark:bg-[#102B38] overflow-hidden border border-[#0B1E27]/12 dark:border-[#82AAA1]/25">
                  <div
                    className="h-full bg-gradient-to-r from-[#1D6664] via-[#367D7B] to-[#D39622] dark:from-[#367D7B] dark:via-[#82AAA1] dark:to-[#F5DA78] transition-all duration-150"
                    style={{ width: `${Math.min(100, hud.growthPercent)}%` }}
                  />
                  {/* Tier 2 & Tier 3 evolution notch lines */}
                  <span
                    className="absolute top-0 bottom-0 w-0.5 bg-[#0B1E27]/55 dark:bg-[#EDEBE3]/80"
                    style={{ left: `${hud.tier1Marker}%` }}
                    title="Evolusi Ukuran Sedang"
                  />
                  <span
                    className="absolute top-0 bottom-0 w-0.5 bg-[#876B3A] dark:bg-[#F5DA78]/90"
                    style={{ left: `${hud.tier2Marker}%` }}
                    title="Evolusi Ukuran Besar"
                  />
                </div>
              </div>

              {/* Right: Dash / Tail Whip / Timer / Pause */}
              <div className="flex items-center gap-3">
                {/* Active Power-Up Icons */}
                {hud.hasShield && (
                  <span className="flex items-center gap-1 text-[#1D6664] dark:text-[#8CC9FF] font-semibold" title="Perisai Gelembung Aktif">
                    <Shield className="w-3.5 h-3.5" />
                  </span>
                )}
                {hud.magnetBuffSec > 0 && (
                  <span className="flex items-center gap-0.5 text-[#1D6664] dark:text-[#79E6D8] font-semibold" title="Magnet Mangsa">
                    <Magnet className="w-3.5 h-3.5" />
                    {hud.magnetBuffSec}s
                  </span>
                )}
                {hud.speedBuffSec > 0 && (
                  <span className="flex items-center gap-0.5 text-[#9A6810] dark:text-[#F6C95E] font-semibold" title="Turbo Arus">
                    <Zap className="w-3.5 h-3.5" />
                    {hud.speedBuffSec}s
                  </span>
                )}
                {hud.freezeBuffSec > 0 && (
                  <span className="flex items-center gap-0.5 text-[#256D85] dark:text-[#BBE9FF] font-semibold" title="Arus Beku">
                    <Snowflake className="w-3.5 h-3.5" />
                    {hud.freezeBuffSec}s
                  </span>
                )}

                {/* Dash Stamina */}
                <div className="hidden sm:flex items-center gap-1.5" title="Energi Dash (Klik Kiri / Spasi)">
                  <Zap className="w-3.5 h-3.5 text-[#1D6664] dark:text-[#82AAA1]" />
                  <div className="w-14 h-1.5 rounded-full bg-[#DCE6E4] dark:bg-[#102B38] overflow-hidden">
                    <div
                      className="h-full bg-[#1D6664] dark:bg-[#82AAA1]"
                      style={{ width: `${hud.dashEnergy}%` }}
                    />
                  </div>
                </div>

                {mode === 'time_attack' && (
                  <span
                    className={`flex items-center gap-1 font-bold ${
                      hud.timeRemaining <= 15
                        ? 'text-[#B84F3C] dark:text-[#D98270]'
                        : 'text-[#1D6664] dark:text-[#82AAA1]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {hud.timeRemaining}s
                  </span>
                )}

                <button
                  onClick={() => setGameState((prev) => (prev === 'PLAYING' ? 'PAUSED' : 'PLAYING'))}
                  className="px-3 py-1.5 rounded-lg bg-[#ECEAE1] hover:bg-[#DFDDD2] text-[#0B1E27] dark:bg-[#102B38] dark:hover:bg-[#17485A] dark:text-[#EDEBE3] text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {gameState === 'PAUSED' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{gameState === 'PAUSED' ? 'Lanjut' : 'Jeda'}</span>
                </button>
              </div>
            </div>

            {/* Dynamic Food Chain Bar (Visualizing Edible vs. Dangerous Species at Current Size!) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#0B1E27]/10 dark:border-[#82AAA1]/10 text-[11px]">
              <div className="flex items-center gap-3 overflow-x-auto">
                <span className="text-[#425B66] dark:text-[#98ACB5] shrink-0">Rantai Makanan:</span>
                {activeStage.foodChainSpecies.map((spId) => {
                  const sp = SPECIES_CATALOG[spId];
                  const edible = canPlayerEat(hud.tier, sp.tier, spId, false);
                  const danger = !edible;
                  return (
                    <div
                      key={spId}
                      className={`flex items-center gap-1.5 shrink-0 pr-2 ${
                        edible ? 'opacity-100' : 'opacity-70'
                      }`}
                      title={`${sp.name} (${edible ? 'Bisa dimakan' : 'Terlalu besar — hindari!'})`}
                    >
                      <SpeciesMiniCanvas species={sp} edible={edible} danger={danger} />
                      <span
                        className={
                          edible
                            ? 'text-[#1D6664] dark:text-[#82AAA1] font-medium'
                            : 'text-[#B84F3C] dark:text-[#D98270]'
                        }
                      >
                        {edible ? (
                          <Check className="w-3 h-3 inline mr-0.5" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 inline mr-0.5" />
                        )}
                        {sp.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="hidden md:flex items-center gap-3 text-[#425B66] dark:text-[#98ACB5] shrink-0">
                <span>Klik Kiri/Spasi: Dash</span>
                <span>·</span>
                <span>Klik Kanan/Shift: Tail Whip ({hud.whipCooldownPct}%)</span>
              </div>
            </div>
          </div>
        )}

        {/* HIGH-DPI 60FPS CANVAS STAGE */}
        <div
          data-cursor-mode={gameState === 'PLAYING' ? 'hidden' : 'fish'}
          className="relative w-full aspect-[16/9] min-h-[460px] bg-[#D9F1F0] dark:bg-[#061116] transition-colors duration-300"
        >
          <canvas
            ref={canvasRef}
            onPointerMove={mapPointerToCanvas}
            onPointerDown={(e) => {
              mapPointerToCanvas(e);
              if (e.button === 2) {
                triggerTailWhip();
              } else if (e.button === 0) {
                triggerDash();
              }
            }}
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-full block touch-none"
          />

          {/* Floating Event Banner (Growth Up / Frenzy / Stage Intro) */}
          {gameState === 'PLAYING' && hud.bannerText && (
            <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-10 px-5 py-2 rounded-full bg-white/92 dark:bg-[#061116]/85 border border-[#876B3A]/40 dark:border-[#C7B99E]/45 text-center shadow-xl">
              <span className="font-display text-sm sm:text-base font-semibold text-[#876B3A] dark:text-[#F5DA78]">
                {hud.bannerText}
              </span>
            </div>
          )}

          {/* TITLE MENU OVERLAY */}
          {gameState === 'TITLE_MENU' && (
            <div className="absolute inset-0 z-20 bg-[#F7F6F1]/86 dark:bg-[#061116]/72 backdrop-blur-sm overflow-y-auto p-5 sm:p-8 flex flex-col justify-between gap-6 transition-colors duration-300">
              {/* Top Header + Mode Switch */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#1D6664] dark:text-[#82AAA1] font-semibold block">
                    Rantai Trofik Samudra · 5 Ekosistem
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl text-[#0B1E27] dark:text-[#EDEBE3]">
                    Feeding Frenzy: Rantai Samudra
                  </h2>
                </div>

                {/* Mode Tabs + Best Scores */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-[#ECEAE1] dark:bg-[#091C25] border border-[#0B1E27]/12 dark:border-[#82AAA1]/20">
                    <button
                      onClick={() => setMode('campaign')}
                      className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        mode === 'campaign'
                          ? 'bg-[#267472] dark:bg-[#367D7B] text-[#EDEBE3]'
                          : 'text-[#425B66] hover:text-[#0B1E27] dark:text-[#98ACB5] dark:hover:text-[#EDEBE3]'
                      }`}
                    >
                      Mode Kampanye
                    </button>
                    <button
                      onClick={() => setMode('time_attack')}
                      className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        mode === 'time_attack'
                          ? 'bg-[#267472] dark:bg-[#367D7B] text-[#EDEBE3]'
                          : 'text-[#425B66] hover:text-[#0B1E27] dark:text-[#98ACB5] dark:hover:text-[#EDEBE3]'
                      }`}
                    >
                      Time Attack (90s)
                    </button>
                  </div>

                  <div className="text-xs text-[#876B3A] dark:text-[#C7B99E] tabular-nums">
                    Rekor:{' '}
                    <strong>
                      {(mode === 'campaign' ? bestCampaignScore : bestTimeAttackScore).toLocaleString('id-ID')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Character & Stage Selection Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Playable Hero Fish Selection */}
                <div className="lg:col-span-7 space-y-2.5">
                  <div className="text-xs font-semibold text-[#425B66] dark:text-[#98ACB5]">
                    Pilih Karakter Ikan Anda
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PLAYABLE_FISH.map((hero) => {
                      const active = hero.id === selectedHeroId;
                      return (
                        <button
                          key={hero.id}
                          onClick={() => {
                            soundEffects.playBubblePop();
                            setSelectedHeroId(hero.id);
                          }}
                          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            active
                              ? 'bg-[#E3F1EF] border-[#1D6664] dark:bg-[#0E2B38]/95 dark:border-[#82AAA1] shadow-lg'
                              : 'bg-white/88 border-[#0B1E27]/12 hover:border-[#1D6664]/50 dark:bg-[#091C25]/80 dark:border-[#82AAA1]/20 dark:hover:border-[#82AAA1]/50'
                          }`}
                        >
                          <HeroCanvasPreview hero={hero} active={active} />
                          <div className="mt-2 space-y-1">
                            <div className="font-display text-sm font-semibold text-[#0B1E27] dark:text-[#EDEBE3]">
                              {hero.name}
                            </div>
                            <div className="text-[11px] text-[#1D6664] dark:text-[#82AAA1] font-medium">
                              {hero.perkLabel}
                            </div>
                            <p className="text-[11px] text-[#425B66] dark:text-[#98ACB5] leading-snug line-clamp-2">
                              {hero.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stage Selection & Rules */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-3 bg-white/90 dark:bg-[#091C25]/85 border border-[#0B1E27]/12 dark:border-[#82AAA1]/20 rounded-xl p-4">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-[#425B66] dark:text-[#98ACB5]">
                      {mode === 'campaign' ? 'Pilih Stage Ekosistem' : 'Arena Time Attack 90 Detik'}
                    </div>
                    <div className="space-y-1.5">
                      {FF_STAGES.map((st, idx) => {
                        const isLocked = mode === 'campaign' && st.id > unlockedStage;
                        const active = idx === selectedStageIdx;
                        return (
                          <button
                            key={st.id}
                            disabled={isLocked}
                            onClick={() => {
                              soundEffects.playBubblePop();
                              setSelectedStageIdx(idx);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                              isLocked
                                ? 'bg-[#ECEAE1]/60 text-[#5F7782]/70 dark:bg-[#061116]/40 dark:text-[#5F7782] cursor-not-allowed'
                                : active
                                ? 'bg-[#267472] dark:bg-[#367D7B] text-[#EDEBE3] font-semibold cursor-pointer'
                                : 'bg-[#F7F6F1] text-[#425B66] hover:text-[#0B1E27] dark:bg-[#061116]/65 dark:text-[#98ACB5] dark:hover:text-[#EDEBE3] cursor-pointer'
                            }`}
                          >
                            <span className="truncate">
                              Stage {st.id}: {st.name}
                            </span>
                            <span className="text-[10px] shrink-0 ml-2">
                              {isLocked ? 'Terkunci' : active ? 'Dipilih' : 'Buka'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#0B1E27]/10 dark:border-[#82AAA1]/15 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[11px] text-[#425B66] dark:text-[#98ACB5] leading-relaxed">
                      <div>Gerak Kursor: Berenang · Klik Kiri / Spasi: Dash</div>
                      <div>Klik Kanan / Shift: Tail Whip · Makan Mutiara Tiram</div>
                    </div>

                    <button
                      onClick={() => startNewRun(selectedStageIdx, mode)}
                      className="px-6 py-2.5 rounded-full bg-[#1D6664] hover:bg-[#267472] text-[#F7F6F1] dark:bg-[#C7B99E] dark:hover:bg-[#EDEBE3] dark:text-[#061116] font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-lg whitespace-nowrap"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Mulai Bermain</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAUSE OVERLAY */}
          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 z-20 bg-[#F7F6F1]/84 dark:bg-[#061116]/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-5">
              <div className="space-y-1">
                <h3 className="font-display text-3xl text-[#0B1E27] dark:text-[#EDEBE3]">Permainan Dijeda</h3>
                <p className="text-xs text-[#425B66] dark:text-[#98ACB5]">
                  Stage {activeStage.id}: {activeStage.name} · {activeHero.name}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setGameState('PLAYING')}
                  className="px-6 py-2.5 rounded-full bg-[#267472] hover:bg-[#1D6664] text-[#F7F6F1] dark:bg-[#367D7B] dark:hover:bg-[#82AAA1] dark:text-[#EDEBE3] dark:hover:text-[#061116] font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Lanjutkan</span>
                </button>
                <button
                  onClick={() => startNewRun(selectedStageIdx, mode)}
                  className="px-5 py-2.5 rounded-full bg-[#ECEAE1] hover:bg-[#DFDDD2] text-[#0B1E27] dark:bg-[#0E2632] dark:hover:bg-[#17485A] dark:text-[#EDEBE3] text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ulangi Stage</span>
                </button>
                <button
                  onClick={() => setGameState('TITLE_MENU')}
                  className="px-5 py-2.5 rounded-full bg-transparent border border-[#0B1E27]/25 hover:border-[#0B1E27] text-[#425B66] hover:text-[#0B1E27] dark:border-[#82AAA1]/35 dark:hover:border-[#82AAA1] dark:text-[#98ACB5] dark:hover:text-[#EDEBE3] text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Menu Utama</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE CLEAR / GAME OVER OVERLAY */}
          {(gameState === 'STAGE_CLEAR' || gameState === 'GAME_OVER') && (
            <div className="absolute inset-0 z-20 bg-[#F7F6F1]/88 dark:bg-[#061116]/82 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
              <div className="max-w-md w-full space-y-5">
                <div className="flex justify-center">
                  {gameState === 'STAGE_CLEAR' ? (
                    <Trophy className="w-12 h-12 text-[#876B3A] dark:text-[#F5DA78]" />
                  ) : (
                    <Sparkles className="w-12 h-12 text-[#B84F3C] dark:text-[#D98270]" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-display text-3xl text-[#0B1E27] dark:text-[#EDEBE3]">
                    {gameState === 'STAGE_CLEAR'
                      ? `Stage ${activeStage.id} Ditaklukkan!`
                      : endReason === 'timeout'
                      ? 'Waktu Time Attack Habis!'
                      : 'Predator Mengalahkanmu'}
                  </h3>
                  <p className="text-xs text-[#425B66] dark:text-[#98ACB5]">
                    {activeStage.name} · Karakter: {activeHero.name}
                  </p>
                </div>

                {/* Clean Tabular Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/92 dark:bg-[#091C25]/90 border border-[#0B1E27]/12 dark:border-[#82AAA1]/20 rounded-xl p-4 text-xs tabular-nums">
                  <div>
                    <div className="text-[#425B66] dark:text-[#98ACB5]">Skor Akhir</div>
                    <div className="text-base font-bold text-[#876B3A] dark:text-[#F5DA78]">
                      {hud.score.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#425B66] dark:text-[#98ACB5]">Ikan Dimakan</div>
                    <div className="text-base font-bold text-[#0B1E27] dark:text-[#EDEBE3]">{hud.fishEaten}</div>
                  </div>
                  <div>
                    <div className="text-[#425B66] dark:text-[#98ACB5]">Max Kombo</div>
                    <div className="text-base font-bold text-[#1D6664] dark:text-[#82AAA1]">{hud.maxCombo}×</div>
                  </div>
                  <div>
                    <div className="text-[#425B66] dark:text-[#98ACB5]">Bonus XP</div>
                    <div className="text-base font-bold text-[#876B3A] dark:text-[#C7B99E]">+{lastXpAwarded}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setGameState('TITLE_MENU')}
                    className="px-5 py-2.5 rounded-full bg-[#ECEAE1] hover:bg-[#DFDDD2] text-[#0B1E27] dark:bg-[#0E2632] dark:hover:bg-[#17485A] dark:text-[#EDEBE3] text-xs font-medium cursor-pointer transition-colors"
                  >
                    Menu Utama
                  </button>
                  <button
                    onClick={() => startNewRun(selectedStageIdx, mode)}
                    className="px-6 py-2.5 rounded-full bg-[#0B1E27] hover:bg-[#17485A] text-[#F7F6F1] dark:bg-[#EDEBE3] dark:hover:bg-white dark:text-[#061116] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Main Lagi</span>
                  </button>
                  {gameState === 'STAGE_CLEAR' &&
                    mode === 'campaign' &&
                    selectedStageIdx < FF_STAGES.length - 1 && (
                      <button
                        onClick={() => startNewRun(selectedStageIdx + 1, 'campaign')}
                        className="px-6 py-2.5 rounded-full bg-[#267472] hover:bg-[#1D6664] text-[#F7F6F1] dark:bg-[#367D7B] dark:hover:bg-[#82AAA1] dark:text-[#EDEBE3] dark:hover:text-[#061116] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <span>Stage Berikutnya</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info Strip */}
        <div className="px-5 py-2.5 bg-[#F7F6F1]/95 dark:bg-[#061116]/95 border-t border-[#0B1E27]/10 dark:border-[#82AAA1]/15 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#425B66] dark:text-[#8FA3AC]">
          <span>
            {mode === 'campaign'
              ? `Kampanye · Stage ${activeStage.id}: ${activeStage.name}`
              : 'Time Attack · Rekor Arkeid 90 Detik'}
          </span>
          <span className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-[#1D6664] dark:text-[#82AAA1]" />
            <span>Mutiara Terkumpul: {hud.pearlsCollected} · Tekan Esc/P untuk Jeda</span>
          </span>
        </div>
      </div>
    </div>
  );
};
