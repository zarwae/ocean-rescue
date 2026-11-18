import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Anchor,
  Award,
  Backpack,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Compass,
  Coins,
  Fish,
  Lock,
  Maximize2,
  Minimize2,
  Moon,
  PackageOpen,
  Search,
  Ship,
  ShoppingBag,
  Sparkles,
  Sun,
  Unlock,
  Volume2,
  VolumeX,
  Wand2,
  Waves,
} from 'lucide-react';
import type { ThemeMode } from '../hooks/useTheme';
import { useGameFullscreen } from '../hooks/useGameFullscreen';
import {
  FISCH_BAITS,
  FISCH_BOATS,
  FISCH_ENCHANTS,
  FISCH_ISLANDS,
  FISCH_MUTATIONS,
  FISCH_QUESTS,
  FISCH_RODS,
  FISCH_SPECIES,
  FischSeason,
  FischSpecies,
  FischTimeOfDay,
  FischWeather,
  RARITY_COLORS,
  RARITY_ORDER,
} from '../utils/fischData';
import {
  applyCatchToQuests,
  applyFischXp,
  calculateFishSellValue,
  findBait,
  findBoat,
  findEnchant,
  findRod,
  FischCaughtItem,
  FischSaveState,
  formatCredits,
  generateAnglerQuest,
  getEffectiveStats,
  getReelPhysics,
  getXpForNextLevel,
  loadFischSave,
  openCrateReward,
  rollCatchCandidate,
  rollCatchResult,
  saveFischSave,
} from '../utils/fischEngine';
import { FischPhase } from '../utils/fischRenderer';
import { FischNpcSpawn } from '../utils/fisch3dWorld';
import {
  CatchVisualTrigger,
  Fisch3DViewport,
  FischMutableEngineState,
} from './Fisch3DViewport';
import { soundEffects } from '../utils/soundEffects';

interface FischGameProps {
  onAwardXp: (xp: number, reason: string) => void;
  onRecordGame: (score: number, xpEarned: number) => void;
  theme?: ThemeMode;
}

type FischSubTab = 'islands' | 'inventory' | 'shop' | 'altar' | 'quests' | 'bestiary';

interface CatchShowcase {
  id: number;
  item?: FischCaughtItem;
  species: FischSpecies;
  weightKg: number;
  mutationId: string;
  isShiny: boolean;
  isSparkling: boolean;
  isGiant: boolean;
  isTiny: boolean;
  sellValue: number;
  xpGained: number;
  isNewBestiary: boolean;
  lineSnapped?: boolean;
  spiritBonusName?: string;
}

interface ShakeTarget {
  id: number;
  xPercent: number;
  yPercent: number;
}

const SEASONS: FischSeason[] = ['Spring', 'Summer', 'Autumn', 'Winter'];

export const FischGame: React.FC<FischGameProps> = ({
  onAwardXp,
  onRecordGame,
  theme = 'dark',
}) => {
  const [save, setSave] = useState<FischSaveState>(() => loadFischSave());
  const [activeTab, setActiveTab] = useState<FischSubTab>('islands');
  const [phase, setPhase] = useState<FischPhase>('idle');

  // Dynamic World Environment
  const [timeOfDay, setTimeOfDay] = useState<FischTimeOfDay>('Day');
  const [weather, setWeather] = useState<FischWeather>('Clear');
  const [season, setSeason] = useState<FischSeason>('Summer');
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  // Active Minigame Overlays & Feedback
  const [shakeTarget, setShakeTarget] = useState<ShakeTarget | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [catchShowcase, setCatchShowcase] = useState<CatchShowcase | null>(null);
  const [lastCatchVisual, setLastCatchVisual] = useState<CatchVisualTrigger | null>(null);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [appraiseSelectedUid, setAppraiseSelectedUid] = useState<string>('');
  const [enchantTargetRodId, setEnchantTargetRodId] = useState<string>(() => loadFischSave().equippedRodId);

  // Bestiary Filters
  const [bestiarySearch, setBestiarySearch] = useState('');
  const [bestiaryIslandFilter, setBestiaryIslandFilter] = useState<string>('all');
  const [bestiaryRarityFilter, setBestiaryRarityFilter] = useState<string>('all');
  const [bestiaryStatusFilter, setBestiaryStatusFilter] = useState<'all' | 'caught' | 'missing'>('all');

  const dockSectionRef = useRef<HTMLDivElement | null>(null);
  const recordedSessionRef = useRef(false);
  const { containerRef: fischFsRef, isFullscreen, toggleFullscreen } = useGameFullscreen();

  // Mutable 60fps Engine State
  const engineRef = useRef<FischMutableEngineState>({
    phase: 'idle',
    castPower: 0,
    castDir: 1,
    perfectCast: false,
    bobberProgress: 0,
    waitRemaining: 0,
    biteRemaining: 0,
    shakeCount: 0,
    hookedSpecies: null,
    reelBarCenter: 0.5,
    reelBarVel: 0,
    reelBarWidth: 0.27,
    reelFishPos: 0.5,
    reelFishTarget: 0.5,
    reelFishTimer: 0,
    reelProgress: 0.25,
    reelGrace: 0,
    holdingInput: false,
  });

  // Persist save changes
  useEffect(() => {
    saveFischSave(save);
  }, [save]);

  useEffect(() => {
    soundEffects.isMuted = save.soundMuted;
  }, [save.soundMuted]);

  const merlinLuckActive = save.merlinLuckUntil > nowMs;
  const auroraActive = save.auroraTotemUntil > nowMs || weather === 'Aurora';

  const currentIsland = useMemo(
    () => FISCH_ISLANDS.find((i) => i.id === save.currentIslandId) ?? FISCH_ISLANDS[0],
    [save.currentIslandId]
  );
  const equippedRod = useMemo(() => findRod(save.equippedRodId), [save.equippedRodId]);
  const equippedBoat = useMemo(() => findBoat(save.equippedBoatId), [save.equippedBoatId]);
  const equippedBait = useMemo(() => {
    if (!save.equippedBaitId) return null;
    if ((save.baitCounts[save.equippedBaitId] ?? 0) <= 0) return null;
    return findBait(save.equippedBaitId);
  }, [save.equippedBaitId, save.baitCounts]);

  const equippedEnchant = useMemo(
    () => findEnchant(save.rodEnchants[equippedRod.id]),
    [save.rodEnchants, equippedRod.id]
  );

  const effectiveStats = useMemo(
    () =>
      getEffectiveStats(equippedRod, equippedBait, equippedEnchant, {
        merlinLuckActive,
        auroraActive,
        perfectCast: engineRef.current.perfectCast,
        streak: save.streak,
      }),
    [equippedRod, equippedBait, equippedEnchant, merlinLuckActive, auroraActive, save.streak, phase]
  );

  const worldRef = useRef({
    timeOfDay,
    weather,
    season,
    merlinLuckActive,
    auroraActive,
  });
  worldRef.current = { timeOfDay, weather, season, merlinLuckActive, auroraActive };

  const saveRef = useRef(save);
  saveRef.current = save;

  const statsRef = useRef(effectiveStats);
  statsRef.current = effectiveStats;

  // World Clock & Weather Cycle (Every 60s rotates Day/Night or Weather)
  useEffect(() => {
    const tick = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    const envCycle = window.setInterval(() => {
      setTimeOfDay((prev) => (prev === 'Day' ? 'Night' : 'Day'));
      setWeather((prev) => {
        const roll = Math.random();
        if (roll < 0.42) return 'Clear';
        if (roll < 0.62) return 'Rain';
        if (roll < 0.78) return 'Windy';
        if (roll < 0.89) return 'Foggy';
        if (roll < 0.96) return 'Storm';
        return 'Aurora';
      });
      if (Math.random() < 0.3) {
        setSeason((prev) => {
          const idx = SEASONS.indexOf(prev);
          return SEASONS[(idx + 1) % SEASONS.length];
        });
      }
    }, 75000);

    return () => {
      window.clearInterval(tick);
      window.clearInterval(envCycle);
    };
  }, []);

  const showTempBanner = useCallback((msg: string) => {
    setStatusBanner(msg);
  }, []);

  useEffect(() => {
    if (!statusBanner) return;
    const t = window.setTimeout(() => setStatusBanner(null), 2600);
    return () => window.clearTimeout(t);
  }, [statusBanner]);

  const spawnShakeButton = useCallback(() => {
    setShakeTarget({
      id: Date.now() + Math.random(),
      xPercent: 26 + Math.random() * 54,
      yPercent: 24 + Math.random() * 44,
    });
  }, []);

  const triggerShake = useCallback(() => {
    const eng = engineRef.current;
    if (eng.phase !== 'waiting') return;
    eng.shakeCount += 1;
    eng.waitRemaining = Math.max(0.25, eng.waitRemaining - 1.35);
    soundEffects.playFischShake();
    if (eng.waitRemaining > 0.45) {
      spawnShakeButton();
    } else {
      setShakeTarget(null);
    }
  }, [spawnShakeButton]);

  const finalizeCatchSuccess = useCallback(
    (hooked: FischSpecies) => {
      const currentSave = saveRef.current;
      const rod = findRod(currentSave.equippedRodId);
      const bait =
        currentSave.equippedBaitId && (currentSave.baitCounts[currentSave.equippedBaitId] ?? 0) > 0
          ? findBait(currentSave.equippedBaitId)
          : null;
      const enchant = findEnchant(currentSave.rodEnchants[rod.id]);
      const world = {
        ...worldRef.current,
        perfectCast: engineRef.current.perfectCast,
        streak: currentSave.streak,
      };
      const eff = getEffectiveStats(rod, bait, enchant, world);

      const outcome = rollCatchResult(hooked, rod, enchant, eff, world);

      if (outcome.lineSnapped) {
        soundEffects.playFischSnap();
        setCatchShowcase({
          id: Date.now(),
          species: hooked,
          weightKg: outcome.weightKg,
          mutationId: outcome.mutationId,
          isShiny: false,
          isSparkling: false,
          isGiant: outcome.isGiant,
          isTiny: outcome.isTiny,
          sellValue: 0,
          xpGained: 0,
          isNewBestiary: false,
          lineSnapped: true,
        });
        setSave((prev) => ({ ...prev, streak: 0 }));
        showTempBanner(
          `Senar Putus! ${hooked.name} (${outcome.weightKg} kg) melebihi Max Kg ${rod.name}.`
        );
        return;
      }

      const isRarePlus =
        hooked.rarity === 'Rare' ||
        hooked.rarity === 'Legendary' ||
        hooked.rarity === 'Mythical' ||
        hooked.rarity === 'Exotic';
      soundEffects.playFischCatch(isRarePlus);

      const globalXp = Math.max(4, Math.round(outcome.xpGained * 0.12));
      if (!recordedSessionRef.current) {
        recordedSessionRef.current = true;
        onRecordGame(outcome.sellValue, globalXp);
      }
      onAwardXp(globalXp, `Fisch: Menangkap ${hooked.name}`);

      setSave((prev) => {
        const nextBaitCounts = { ...prev.baitCounts };
        let nextEquippedBait = prev.equippedBaitId;
        if (bait && nextBaitCounts[bait.id] > 0) {
          nextBaitCounts[bait.id] -= 1;
          if (nextBaitCounts[bait.id] <= 0) {
            delete nextBaitCounts[bait.id];
            if (nextEquippedBait === bait.id) nextEquippedBait = null;
          }
        }

        const nextBestiary = { ...prev.bestiary };
        const existingBestiary = nextBestiary[hooked.id];
        const isNewEntry = !existingBestiary;
        const mutSet = new Set(existingBestiary?.mutations ?? []);
        if (outcome.mutationId !== 'none') mutSet.add(outcome.mutationId);
        nextBestiary[hooked.id] = {
          caughtCount: (existingBestiary?.caughtCount ?? 0) + 1,
          bestWeightKg: Math.max(existingBestiary?.bestWeightKg ?? 0, outcome.weightKg),
          mutations: Array.from(mutSet),
          firstCaughtAt: existingBestiary?.firstCaughtAt ?? Date.now(),
        };

        let nextCredits = prev.credits;
        let nextRelicCount = prev.relicCount;
        const nextCrateCounts = { ...prev.crateCounts };
        const nextInventory = [...prev.inventory];

        let primaryCaughtItem: FischCaughtItem | undefined;
        if (hooked.isRelic) {
          nextRelicCount += 1;
        } else if (hooked.isCrate) {
          nextCrateCounts[hooked.id] = (nextCrateCounts[hooked.id] ?? 0) + 1;
        } else {
          primaryCaughtItem = {
            uid: `fish_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            speciesId: hooked.id,
            weightKg: outcome.weightKg,
            mutationId: outcome.mutationId,
            isShiny: outcome.isShiny,
            isSparkling: outcome.isSparkling,
            isGiant: outcome.isGiant,
            isTiny: outcome.isTiny,
            sellValue: outcome.sellValue,
            caughtAt: Date.now(),
            locked: hooked.rarity === 'Mythical' || hooked.rarity === 'Exotic' || outcome.isShiny,
          };
          nextInventory.unshift(primaryCaughtItem);
        }

        // Rod of the Depths Spirit Passive: every 3rd catch spawns a free bonus fish!
        let spiritBonusName: string | undefined;
        const nextTotalCatches = prev.totalCatches + 1;
        if (rod.spiritBonusEvery && nextTotalCatches % rod.spiritBonusEvery === 0) {
          const spiritCandidate = rollCatchCandidate(prev.currentIslandId, rod, bait, eff, world);
          if (!spiritCandidate.isCrate && !spiritCandidate.isRelic) {
            const spiritRoll = rollCatchResult(spiritCandidate, rod, enchant, eff, world);
            if (!spiritRoll.lineSnapped) {
              spiritBonusName = `${spiritCandidate.name} (${spiritRoll.weightKg} kg)`;
              nextInventory.unshift({
                uid: `spirit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                speciesId: spiritCandidate.id,
                weightKg: spiritRoll.weightKg,
                mutationId: spiritRoll.mutationId,
                isShiny: spiritRoll.isShiny,
                isSparkling: spiritRoll.isSparkling,
                isGiant: spiritRoll.isGiant,
                isTiny: spiritRoll.isTiny,
                sellValue: spiritRoll.sellValue,
                caughtAt: Date.now(),
                locked: false,
              });
            }
          }
        }

        const bonusFirstXp = isNewEntry ? Math.round(outcome.xpGained * 0.5) : 0;
        const leveled = applyFischXp(prev.level, prev.xp, outcome.xpGained + bonusFirstXp);
        if (leveled.levelsGained > 0) {
          soundEffects.playFanfare();
        }

        let updated: FischSaveState = {
          ...prev,
          level: leveled.level,
          xp: leveled.xp,
          credits: nextCredits,
          totalCatches: nextTotalCatches,
          streak: prev.streak + 1,
          equippedBaitId: nextEquippedBait,
          baitCounts: nextBaitCounts,
          crateCounts: nextCrateCounts,
          relicCount: nextRelicCount,
          inventory: nextInventory.slice(0, 120),
          bestiary: nextBestiary,
          islandCatches: {
            ...prev.islandCatches,
            [prev.currentIslandId]: (prev.islandCatches[prev.currentIslandId] ?? 0) + 1,
          },
        };

        updated = applyCatchToQuests(updated, hooked);

        const mutObj = FISCH_MUTATIONS.find((m) => m.id === outcome.mutationId);
        setLastCatchVisual({
          id: Date.now(),
          species: hooked,
          mutationColorHex: mutObj && mutObj.id !== 'none' ? mutObj.colorHex : null,
          isGiant: outcome.isGiant,
          lineSnapped: false,
        });

        setCatchShowcase({
          id: Date.now(),
          item: primaryCaughtItem,
          species: hooked,
          weightKg: outcome.weightKg,
          mutationId: outcome.mutationId,
          isShiny: outcome.isShiny,
          isSparkling: outcome.isSparkling,
          isGiant: outcome.isGiant,
          isTiny: outcome.isTiny,
          sellValue: outcome.sellValue,
          xpGained: outcome.xpGained + bonusFirstXp,
          isNewBestiary: isNewEntry,
          spiritBonusName,
        });

        return updated;
      });
    },
    [onAwardXp, onRecordGame, showTempBanner]
  );

  // Start Cast Charging
  const beginCharge = useCallback(() => {
    const eng = engineRef.current;
    if (eng.phase === 'reeling') {
      eng.holdingInput = true;
      return;
    }
    if (eng.phase === 'waiting') {
      return;
    }
    if (eng.phase === 'idle') {
      eng.phase = 'charging';
      eng.castPower = 0.1;
      eng.castDir = 1;
      eng.perfectCast = false;
      setPhase('charging');
      setCatchShowcase(null);
    }
  }, []);

  const releaseInput = useCallback(() => {
    const eng = engineRef.current;
    eng.holdingInput = false;
    if (eng.phase === 'charging') {
      eng.perfectCast = eng.castPower >= 0.78 && eng.castPower <= 0.94;
      eng.phase = 'casting';
      eng.bobberProgress = 0;
      eng.shakeCount = 0;
      setPhase('casting');
      soundEffects.playFischCast();
    }
  }, []);

  // 60fps Fishing State Stepper (Invoked smoothly inside Fisch3DViewport's Three.js loop)
  const stepFishing = useCallback(
    (dt: number, emitSplash: (x: number, y: number, z: number) => void) => {
      const eng = engineRef.current;

      if (eng.phase === 'charging') {
        eng.castPower += eng.castDir * 1.15 * dt;
        if (eng.castPower >= 1) {
          eng.castPower = 1;
          eng.castDir = -1;
        } else if (eng.castPower <= 0.1) {
          eng.castPower = 0.1;
          eng.castDir = 1;
        }
      } else if (eng.phase === 'casting') {
        eng.bobberProgress += dt * 2.1;
        if (eng.bobberProgress >= 1) {
          eng.bobberProgress = 1;
          eng.phase = 'waiting';
          const lureFactor = Math.max(0.28, 1 - statsRef.current.lureSpeed / 145);
          eng.waitRemaining = Math.max(1.1, (4.8 - eng.castPower * 1.1) * lureFactor);
          setPhase('waiting');
          soundEffects.playFischSplash();
          emitSplash(0, 0, 14);
          spawnShakeButton();
        }
      } else if (eng.phase === 'waiting') {
        eng.waitRemaining -= dt;
        if (eng.waitRemaining <= 0) {
          setShakeTarget(null);
          const s = saveRef.current;
          const rod = findRod(s.equippedRodId);
          const bait =
            s.equippedBaitId && (s.baitCounts[s.equippedBaitId] ?? 0) > 0
              ? findBait(s.equippedBaitId)
              : null;
          const enchant = findEnchant(s.rodEnchants[rod.id]);
          const world = { ...worldRef.current, perfectCast: eng.perfectCast, streak: s.streak };
          const eff = getEffectiveStats(rod, bait, enchant, world);

          const candidate = rollCatchCandidate(s.currentIslandId, rod, bait, eff, world);
          eng.hookedSpecies = candidate;
          eng.phase = 'biting';
          eng.biteRemaining = 0.65;
          setPhase('biting');
          soundEffects.playFischBite();
        }
      } else if (eng.phase === 'biting') {
        eng.biteRemaining -= dt;
        if (eng.biteRemaining <= 0 && eng.hookedSpecies) {
          const physics = getReelPhysics(eng.hookedSpecies, statsRef.current);
          eng.phase = 'reeling';
          eng.reelBarWidth = physics.barWidth;
          eng.reelBarCenter = 0.5;
          eng.reelBarVel = 0;
          eng.reelFishPos = 0.52;
          eng.reelFishTarget = 0.35 + Math.random() * 0.3;
          eng.reelFishTimer = 0.4;
          eng.reelProgress = 0.26;
          eng.reelGrace = 1.1;
          setPhase('reeling');
        }
      } else if (eng.phase === 'reeling' && eng.hookedSpecies) {
        const physics = getReelPhysics(eng.hookedSpecies, statsRef.current);

        // Control Bar Physics (Authentic Fisch acceleration & bounce)
        const accel = 2.65;
        const gravity = 2.25;
        if (eng.holdingInput) {
          eng.reelBarVel += accel * dt;
        } else {
          eng.reelBarVel -= gravity * dt;
        }
        eng.reelBarVel *= Math.pow(0.28, dt);
        eng.reelBarCenter += eng.reelBarVel * dt;

        const halfW = eng.reelBarWidth / 2;
        if (eng.reelBarCenter < halfW) {
          eng.reelBarCenter = halfW;
          eng.reelBarVel = Math.max(0, -eng.reelBarVel * 0.25);
        } else if (eng.reelBarCenter > 1 - halfW) {
          eng.reelBarCenter = 1 - halfW;
          eng.reelBarVel = Math.min(0, -eng.reelBarVel * 0.25);
        }

        // Fish erratic darting AI inside track
        eng.reelFishTimer -= dt;
        if (eng.reelFishTimer <= 0) {
          eng.reelFishTimer =
            Math.max(0.22, 1.35 / physics.fishErraticness) * (0.65 + Math.random() * 0.7);
          const span = 0.16 + (eng.hookedSpecies.difficulty / 10) * 0.62;
          const nextTarget = eng.reelFishPos + (Math.random() - 0.5) * span * 2;
          eng.reelFishTarget = Math.max(0.06, Math.min(0.94, nextTarget));
        }
        const diff = eng.reelFishTarget - eng.reelFishPos;
        const step = Math.sign(diff) * Math.min(Math.abs(diff), physics.fishSpeed * dt);
        eng.reelFishPos = Math.max(0.05, Math.min(0.95, eng.reelFishPos + step));

        // Progress evaluation
        const onTarget = Math.abs(eng.reelFishPos - eng.reelBarCenter) <= halfW + 0.018;
        if (onTarget) {
          eng.reelProgress = Math.min(1, eng.reelProgress + physics.progressGainPerSec * dt);
        } else if (eng.reelGrace <= 0) {
          eng.reelProgress = Math.max(0, eng.reelProgress - physics.progressDrainPerSec * dt);
        }
        if (eng.reelGrace > 0) eng.reelGrace -= dt;

        if (eng.reelProgress >= 1) {
          const caught = eng.hookedSpecies;
          eng.phase = 'idle';
          eng.hookedSpecies = null;
          eng.holdingInput = false;
          setPhase('idle');
          finalizeCatchSuccess(caught);
        } else if (eng.reelProgress <= 0 && eng.reelGrace <= 0) {
          const lostName = eng.hookedSpecies.name;
          eng.phase = 'idle';
          eng.hookedSpecies = null;
          eng.holdingInput = false;
          setPhase('idle');
          soundEffects.playWarning();
          setSave((prev) => ({ ...prev, streak: 0 }));
          showTempBanner(`${lostName} terlepas! Jaga bar putih tetap di atas ikan.`);
        }
      }
    },
    [finalizeCatchSuccess, showTempBanner, spawnShakeButton]
  );

  const handleInteractNpc = useCallback(
    (npc: FischNpcSpawn) => {
      soundEffects.playBubblePop();
      setActiveTab(npc.targetTab);
      setDockCollapsed(false);
      showTempBanner(`${npc.name}: ${npc.subtitle}`);
      window.setTimeout(() => {
        dockSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    },
    [showTempBanner]
  );

  // Economy & NPC Actions
  const handleSellFish = (uid: string) => {
    const item = save.inventory.find((i) => i.uid === uid);
    if (!item || item.locked) return;
    soundEffects.playFischCoin();
    setSave((prev) => ({
      ...prev,
      credits: prev.credits + item.sellValue,
      inventory: prev.inventory.filter((i) => i.uid !== uid),
    }));
    showTempBanner(`Terjual seharga +${formatCredits(item.sellValue)}`);
  };

  const handleToggleLock = (uid: string) => {
    soundEffects.playBubblePop();
    setSave((prev) => ({
      ...prev,
      inventory: prev.inventory.map((i) => (i.uid === uid ? { ...i, locked: !i.locked } : i)),
    }));
    setCatchShowcase((prev) =>
      prev && prev.item?.uid === uid
        ? { ...prev, item: { ...prev.item, locked: !prev.item.locked } }
        : prev
    );
  };

  const unlockedInventoryValue = useMemo(
    () => save.inventory.filter((i) => !i.locked).reduce((sum, i) => sum + i.sellValue, 0),
    [save.inventory]
  );

  const handleSellAllUnlocked = () => {
    if (unlockedInventoryValue <= 0) return;
    const count = save.inventory.filter((i) => !i.locked).length;
    soundEffects.playFischCoin();
    setSave((prev) => ({
      ...prev,
      credits: prev.credits + unlockedInventoryValue,
      inventory: prev.inventory.filter((i) => i.locked),
    }));
    showTempBanner(`Merchant membeli ${count} ikan seharga +${formatCredits(unlockedInventoryValue)}!`);
  };

  const handleBuyRod = (rodId: string) => {
    const rod = findRod(rodId);
    if (save.ownedRods.includes(rod.id)) {
      soundEffects.playBubblePop();
      setSave((prev) => ({ ...prev, equippedRodId: rod.id }));
      setEnchantTargetRodId(rod.id);
      return;
    }
    if (save.level < rod.minLevel) {
      soundEffects.playWarning();
      showTempBanner(`Membutuhkan Level ${rod.minLevel} untuk membeli ${rod.name}.`);
      return;
    }
    if (save.credits < rod.price) {
      soundEffects.playWarning();
      showTempBanner(`Saldo kurang! Butuh ${formatCredits(rod.price)}.`);
      return;
    }
    soundEffects.playFischCatch(true);
    setSave((prev) => ({
      ...prev,
      credits: prev.credits - rod.price,
      ownedRods: [...prev.ownedRods, rod.id],
      equippedRodId: rod.id,
    }));
    setEnchantTargetRodId(rod.id);
    showTempBanner(`Berhasil membeli & memasang ${rod.name}!`);
  };

  const handleBuyOrEquipBoat = (boatId: string) => {
    const boat = findBoat(boatId);
    if (save.ownedBoats.includes(boat.id)) {
      soundEffects.playBubblePop();
      setSave((prev) => ({ ...prev, equippedBoatId: boat.id }));
      showTempBanner(`Kapal aktif diganti ke ${boat.name}!`);
      return;
    }
    if (save.level < boat.minLevel) {
      soundEffects.playWarning();
      showTempBanner(`Membutuhkan Level ${boat.minLevel} untuk membeli ${boat.name}.`);
      return;
    }
    if (save.credits < boat.price) {
      soundEffects.playWarning();
      showTempBanner(`Saldo kurang! Butuh ${formatCredits(boat.price)}.`);
      return;
    }
    soundEffects.playFischCatch(true);
    setSave((prev) => ({
      ...prev,
      credits: prev.credits - boat.price,
      ownedBoats: [...prev.ownedBoats, boat.id],
      equippedBoatId: boat.id,
    }));
    showTempBanner(`Berhasil membeli & meluncurkan ${boat.name}! Naik kapal di dermaga [B].`);
  };

  const handleSailToOutpost = useCallback(
    (islandId: string) => {
      const target = FISCH_ISLANDS.find((i) => i.id === islandId);
      if (!target) return;
      if (saveRef.current.level < target.minLevel) {
        soundEffects.playWarning();
        showTempBanner(`Butuh Level ${target.minLevel} untuk berlabuh di ${target.name}.`);
        return;
      }
      soundEffects.playBubblePop();
      setSave((prev) => ({ ...prev, currentIslandId: target.id }));
      showTempBanner(`Berhasil berlabuh di ${target.name}!`);
    },
    [showTempBanner]
  );

  const handleBuyBait = (baitId: string, qty: number) => {
    const bait = findBait(baitId);
    if (!bait || !bait.shopPrice) return;
    const totalCost = bait.shopPrice * qty;
    if (save.credits < totalCost) {
      soundEffects.playWarning();
      showTempBanner(`Saldo tidak cukup (${formatCredits(totalCost)}).`);
      return;
    }
    soundEffects.playFischCoin();
    setSave((prev) => ({
      ...prev,
      credits: prev.credits - totalCost,
      equippedBaitId: prev.equippedBaitId ?? baitId,
      baitCounts: {
        ...prev.baitCounts,
        [baitId]: (prev.baitCounts[baitId] ?? 0) + qty,
      },
    }));
    showTempBanner(`Membeli ${qty}× ${bait.name}`);
  };

  const handleBuyCrate = (crateId: string, cost: number) => {
    if (save.credits < cost) {
      soundEffects.playWarning();
      showTempBanner(`Saldo tidak cukup (${formatCredits(cost)}).`);
      return;
    }
    soundEffects.playFischCoin();
    setSave((prev) => ({
      ...prev,
      credits: prev.credits - cost,
      crateCounts: {
        ...prev.crateCounts,
        [crateId]: (prev.crateCounts[crateId] ?? 0) + 1,
      },
    }));
    const sp = FISCH_SPECIES.find((s) => s.id === crateId);
    showTempBanner(`Membeli 1× ${sp?.name ?? 'Crate'} (buka di tab Tas & Peti).`);
  };

  const handleOpenCrate = (crateId: string) => {
    if ((save.crateCounts[crateId] ?? 0) <= 0) return;
    const reward = openCrateReward(crateId);
    soundEffects.playFischCatch(true);
    setSave((prev) => {
      const nextCrates = { ...prev.crateCounts, [crateId]: prev.crateCounts[crateId] - 1 };
      if (nextCrates[crateId] <= 0) delete nextCrates[crateId];
      const nextBaits = { ...prev.baitCounts };
      for (const [bId, qty] of Object.entries(reward.baits)) {
        nextBaits[bId] = (nextBaits[bId] ?? 0) + qty;
      }
      const nextQuestProg = { ...prev.questProgress };
      for (const q of FISCH_QUESTS) {
        if (q.targetType === 'open_crates' && !prev.completedQuestIds.includes(q.id)) {
          nextQuestProg[q.id] = Math.min(q.requiredAmount, (nextQuestProg[q.id] ?? 0) + 1);
        }
      }
      return {
        ...prev,
        credits: prev.credits + reward.credits,
        cratesOpened: prev.cratesOpened + 1,
        relicCount: prev.relicCount + reward.relicsGained,
        crateCounts: nextCrates,
        baitCounts: nextBaits,
        questProgress: nextQuestProg,
      };
    });
    showTempBanner(`Peti Terbuka: ${reward.summaryText}`);
  };

  const handleAppraiseFish = (uid: string) => {
    const item = save.inventory.find((i) => i.uid === uid);
    if (!item) return;
    const sp = FISCH_SPECIES.find((s) => s.id === item.speciesId);
    if (!sp) return;
    const fee = Math.max(150, Math.round(sp.baseValuePerKg * sp.maxKg * 0.25));
    if (save.credits < fee) {
      soundEffects.playWarning();
      showTempBanner(`Biaya Appraiser butuh ${formatCredits(fee)}.`);
      return;
    }

    const rWeight = Math.random();
    let newWeight = sp.minKg + (sp.maxKg - sp.minKg) * Math.pow(Math.random(), 1.25);
    let isGiant = false;
    let isTiny = false;
    if (rWeight > 0.85) {
      isGiant = true;
      newWeight *= 1.75 + Math.random() * 0.6;
    } else if (rWeight < 0.08) {
      isTiny = true;
      newWeight *= 0.5;
    }
    newWeight = Number(newWeight.toFixed(2));

    const mutRoll = Math.random();
    let newMutationId = item.mutationId;
    if (mutRoll < 0.42) {
      const pool = FISCH_MUTATIONS.filter((m) => m.id !== 'none');
      newMutationId = pool[Math.floor(Math.random() * pool.length)].id;
    }
    const newShiny = item.isShiny || Math.random() < 0.14;
    const newSparkling = item.isSparkling || Math.random() < 0.16;
    const newValue = calculateFishSellValue(sp, newWeight, newMutationId, newShiny, newSparkling);

    soundEffects.playFischEnchant();
    setSave((prev) => ({
      ...prev,
      credits: prev.credits - fee,
      inventory: prev.inventory.map((i) =>
        i.uid === uid
          ? {
              ...i,
              weightKg: newWeight,
              mutationId: newMutationId,
              isShiny: newShiny,
              isSparkling: newSparkling,
              isGiant,
              isTiny,
              sellValue: newValue,
            }
          : i
      ),
    }));
    const mutName = FISCH_MUTATIONS.find((m) => m.id === newMutationId)?.name ?? 'Normal';
    showTempBanner(
      `Appraised ${sp.name}: ${newWeight} kg · ${mutName}${newShiny ? ' · Shiny' : ''}${
        newSparkling ? ' · Sparkling' : ''
      } (${formatCredits(newValue)})`
    );
  };

  const handleEnchantRod = () => {
    if (timeOfDay !== 'Night') {
      soundEffects.playWarning();
      showTempBanner('Keeper’s Altar hanya aktif saat Malam! Gunakan Sundial Totem atau tunggu malam.');
      return;
    }
    if (save.relicCount <= 0) {
      soundEffects.playWarning();
      showTempBanner('Membutuhkan 1× Enchant Relic (beli dari Merlin atau dapatkan saat memancing).');
      return;
    }
    const currentEnchant = save.rodEnchants[enchantTargetRodId];
    const pool = FISCH_ENCHANTS.filter((e) => e.id !== currentEnchant);
    const rolled = pool[Math.floor(Math.random() * pool.length)];

    soundEffects.playFischEnchant();
    setSave((prev) => ({
      ...prev,
      relicCount: prev.relicCount - 1,
      rodEnchants: {
        ...prev.rodEnchants,
        [enchantTargetRodId]: rolled.id,
      },
    }));
    const rodName = findRod(enchantTargetRodId).name;
    showTempBanner(`${rodName} mendapat Enchant "${rolled.name}"! (${rolled.description})`);
  };

  const handleClaimQuest = (questId: string) => {
    const q = FISCH_QUESTS.find((item) => item.id === questId);
    if (!q || save.completedQuestIds.includes(q.id)) return;
    const progress = save.questProgress[q.id] ?? 0;
    if (progress < q.requiredAmount) return;

    soundEffects.playFanfare();
    onAwardXp(Math.round(q.rewardXp * 0.1), `Fisch Quest: ${q.title}`);

    setSave((prev) => {
      const leveled = applyFischXp(prev.level, prev.xp, q.rewardXp);
      const nextBaits = { ...prev.baitCounts };
      if (q.rewardBait) {
        nextBaits[q.rewardBait.baitId] = (nextBaits[q.rewardBait.baitId] ?? 0) + q.rewardBait.amount;
      }
      const nextCrates = { ...prev.crateCounts };
      if (q.rewardCrate) {
        nextCrates[q.rewardCrate.crateId] =
          (nextCrates[q.rewardCrate.crateId] ?? 0) + q.rewardCrate.amount;
      }
      const nextRods =
        q.rewardRodId && !prev.ownedRods.includes(q.rewardRodId)
          ? [...prev.ownedRods, q.rewardRodId]
          : prev.ownedRods;

      return {
        ...prev,
        level: leveled.level,
        xp: leveled.xp,
        credits: prev.credits + q.rewardCredits,
        relicCount: prev.relicCount + (q.rewardRelics ?? 0),
        baitCounts: nextBaits,
        crateCounts: nextCrates,
        ownedRods: nextRods,
        completedQuestIds: [...prev.completedQuestIds, q.id],
      };
    });
    showTempBanner(`Misi "${q.title}" selesai! Hadiah diklaim.`);
  };

  const handleClaimAnglerQuest = () => {
    const aq = save.anglerQuest;
    if (!aq || aq.progress < aq.requiredAmount) return;
    soundEffects.playFanfare();
    onAwardXp(Math.round(aq.rewardXp * 0.08), `Fisch Angler: ${aq.title}`);
    setSave((prev) => {
      const leveled = applyFischXp(prev.level, prev.xp, aq.rewardXp);
      return {
        ...prev,
        level: leveled.level,
        xp: leveled.xp,
        credits: prev.credits + aq.rewardCredits,
        baitCounts: {
          ...prev.baitCounts,
          [aq.rewardBaitId]: (prev.baitCounts[aq.rewardBaitId] ?? 0) + aq.rewardBaitAmount,
        },
        anglerQuest: generateAnglerQuest(leveled.level),
      };
    });
    showTempBanner(`Pesanan Angler selesai! +${formatCredits(aq.rewardCredits)}`);
  };

  // Bestiary Metrics & Filters
  const discoveredCount = Object.keys(save.bestiary).length;
  const bestiaryPercent = Math.round((discoveredCount / FISCH_SPECIES.length) * 100);

  const filteredBestiary = useMemo(() => {
    return FISCH_SPECIES.filter((sp) => {
      if (bestiaryIslandFilter !== 'all' && sp.islandId !== bestiaryIslandFilter) return false;
      if (bestiaryRarityFilter !== 'all' && sp.rarity !== bestiaryRarityFilter) return false;
      const caught = Boolean(save.bestiary[sp.id]);
      if (bestiaryStatusFilter === 'caught' && !caught) return false;
      if (bestiaryStatusFilter === 'missing' && caught) return false;
      if (bestiarySearch.trim()) {
        const q = bestiarySearch.toLowerCase();
        if (!sp.name.toLowerCase().includes(q) && !sp.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [
    bestiaryIslandFilter,
    bestiaryRarityFilter,
    bestiaryStatusFilter,
    bestiarySearch,
    save.bestiary,
  ]);

  const xpNeeded = getXpForNextLevel(save.level);
  const xpPct = Math.min(100, Math.round((save.xp / xpNeeded) * 100));

  return (
    <div
      ref={fischFsRef}
      className={`bg-[#F7F6F1] dark:bg-[#091C25] text-[#0B1E27] dark:text-[#EDEBE3] border border-[#0B1E27]/12 dark:border-[#82AAA1]/18 shadow-2xl select-none transition-colors duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-[100dvh] rounded-none overflow-y-auto flex flex-col justify-between'
          : 'rounded-2xl overflow-hidden'
      }`}
    >
      {/* Top World & Player HUD */}
      <div className="px-4 sm:px-5 py-3 bg-[#ECEAE1]/95 dark:bg-[#061116]/90 border-b border-[#0B1E27]/10 dark:border-[#82AAA1]/15 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 tabular-nums">
          {/* Level & XP Bar */}
          <div className="flex items-center gap-2.5">
            <span className="font-display font-bold text-sm text-[#1D6664] dark:text-[#82AAA1]">
              Lv. {save.level}
            </span>
            <div className="w-24 sm:w-28 h-2 rounded-full bg-[#DCE6E4] dark:bg-[#102B38] overflow-hidden">
              <div
                className="h-full bg-[#267472] dark:bg-[#82AAA1] transition-all duration-300"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <span className="text-[11px] text-[#425B66] dark:text-[#98ACB5]">
              {save.xp}/{xpNeeded} XP
            </span>
          </div>

          <span className="text-[#0B1E27]/20 dark:text-[#EDEBE3]/20" aria-hidden="true">
            ·
          </span>

          {/* Credits (C$) */}
          <div className="flex items-center gap-1.5 font-semibold text-[#876B3A] dark:text-[#F6C453]">
            <Coins className="w-3.5 h-3.5" />
            <span>{formatCredits(save.credits)}</span>
          </div>

          <span className="hidden md:inline text-[#0B1E27]/20 dark:text-[#EDEBE3]/20" aria-hidden="true">
            ·
          </span>

          <span className="hidden md:inline text-[#425B66] dark:text-[#98ACB5]">
            Bestiary {discoveredCount}/{FISCH_SPECIES.length} ({bestiaryPercent}%)
          </span>
        </div>

        {/* Right: Island · Time · Weather · Season · Mute */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] tabular-nums">
          <span className="font-semibold text-[#0B1E27] dark:text-[#EDEBE3]">
            {currentIsland.name}
          </span>
          <span className="text-[#0B1E27]/20 dark:text-[#EDEBE3]/20" aria-hidden="true">
            ·
          </span>
          <span className="flex items-center gap-1 text-[#425B66] dark:text-[#98ACB5]">
            {timeOfDay === 'Night' ? (
              <Moon className="w-3.5 h-3.5 text-[#7B3FE4] dark:text-[#B794F4]" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[#876B3A] dark:text-[#F6C453]" />
            )}
            <span>{timeOfDay === 'Night' ? 'Malam' : 'Siang'}</span>
          </span>
          <span className="text-[#425B66] dark:text-[#98ACB5]">
            {auroraActive ? 'Aurora' : weather} · {season}
          </span>
          {merlinLuckActive && (
            <span className="text-[#1D6664] dark:text-[#5EC48B] font-semibold">
              Merlin +65% Luck
            </span>
          )}
          <button
            onClick={() => setSave((prev) => ({ ...prev, soundMuted: !prev.soundMuted }))}
            className="p-1.5 rounded-lg hover:bg-[#0B1E27]/10 dark:hover:bg-[#EDEBE3]/10 text-[#425B66] dark:text-[#98ACB5] cursor-pointer"
            title={save.soundMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
          >
            {save.soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-[#0B1E27]/10 dark:hover:bg-[#EDEBE3]/10 text-[#425B66] dark:text-[#98ACB5] cursor-pointer"
            title={isFullscreen ? 'Keluar Layar Penuh (Esc)' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main 3D Roblox Interactive World Stage */}
      <Fisch3DViewport
        theme={theme}
        island={currentIsland}
        rod={equippedRod}
        boat={equippedBoat}
        playerLevel={save.level}
        timeOfDay={timeOfDay}
        weather={weather}
        auroraActive={auroraActive}
        phase={phase}
        engineRef={engineRef}
        shakeTarget={shakeTarget}
        lastCatchVisual={lastCatchVisual}
        onStepFishing={stepFishing}
        onBeginCastOrReel={beginCharge}
        onReleaseInput={releaseInput}
        onTriggerShake={triggerShake}
        onInteractNpc={handleInteractNpc}
        onSailToOutpost={handleSailToOutpost}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        statusBanner={statusBanner}
      >
        {/* Catch Showcase Floating Summary Card (No backdrop-filter over WebGL) */}
        {catchShowcase && phase === 'idle' && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-14 right-3 z-20 w-72 sm:w-80 rounded-xl bg-[#F7F6F1] dark:bg-[#061116] border border-[#0B1E27]/20 dark:border-[#82AAA1]/35 p-3.5 shadow-2xl space-y-2"
          >
            {catchShowcase.lineSnapped ? (
              <>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#B84F3C] dark:text-[#D98270]">
                  Senar Putus! (Melebihi Max Kg)
                </div>
                <div className="font-display text-base font-bold">
                  {catchShowcase.species.name} ({catchShowcase.weightKg} kg)
                </div>
                <p className="text-[11px] text-[#425B66] dark:text-[#98ACB5]">
                  Batas joran {equippedRod.name} adalah {equippedRod.maxKg.toLocaleString()} kg. Tingkatkan Rod di Merchant!
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span
                    className="font-bold uppercase tracking-wider"
                    style={{
                      color:
                        theme === 'dark'
                          ? RARITY_COLORS[catchShowcase.species.rarity].dark
                          : RARITY_COLORS[catchShowcase.species.rarity].light,
                    }}
                  >
                    {catchShowcase.species.rarity}
                    {catchShowcase.isNewBestiary ? ' · Entri Bestiary Baru!' : ''}
                  </span>
                  <span className="text-[#1D6664] dark:text-[#82AAA1] font-semibold tabular-nums">
                    +{catchShowcase.xpGained} XP
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-display text-base font-bold leading-tight">
                    {catchShowcase.isGiant ? 'Giant ' : catchShowcase.isTiny ? 'Tiny ' : ''}
                    {catchShowcase.mutationId !== 'none'
                      ? `${
                          FISCH_MUTATIONS.find((m) => m.id === catchShowcase.mutationId)?.name ?? ''
                        } `
                      : ''}
                    {catchShowcase.species.name}
                  </div>
                  <span className="text-xs font-semibold tabular-nums shrink-0">
                    {catchShowcase.weightKg} kg
                  </span>
                </div>

                <div className="text-[11px] text-[#425B66] dark:text-[#98ACB5]">
                  {[
                    catchShowcase.isShiny ? 'Shiny (1.85×)' : null,
                    catchShowcase.isSparkling ? 'Sparkling (1.85×)' : null,
                    catchShowcase.species.isCrate
                      ? 'Disimpan di Tas Peti'
                      : catchShowcase.species.isRelic
                      ? '+1 Enchant Relic di Tas Altar'
                      : `Estimasi ${formatCredits(catchShowcase.sellValue)}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </div>

                {catchShowcase.spiritBonusName && (
                  <div className="text-[11px] text-[#7B3FE4] dark:text-[#B794F4] font-semibold">
                    Roh Kedalaman menghadiahkan bonus: {catchShowcase.spiritBonusName}!
                  </div>
                )}

                {catchShowcase.item && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleToggleLock(catchShowcase.item!.uid)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#ECEAE1] hover:bg-[#DFDDD2] dark:bg-[#0E2632] dark:hover:bg-[#163646] text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {catchShowcase.item.locked ? (
                        <>
                          <Lock className="w-3 h-3 text-[#876B3A] dark:text-[#F6C453]" />
                          <span>Terkunci</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3" />
                          <span>Kunci</span>
                        </>
                      )}
                    </button>
                    {!catchShowcase.item.locked && (
                      <button
                        onClick={() => {
                          handleSellFish(catchShowcase.item!.uid);
                          setCatchShowcase(null);
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#267472] hover:bg-[#1D6664] text-[#F7F6F1] text-[11px] font-semibold cursor-pointer"
                      >
                        Jual (+{formatCredits(catchShowcase.sellValue)})
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Fisch3DViewport>

      {/* Equipped Loadout Strip */}
      <div className="px-4 sm:px-5 py-3 bg-[#ECEAE1]/75 dark:bg-[#061116]/75 border-b border-[#0B1E27]/10 dark:border-[#82AAA1]/15 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: equippedRod.colorHex }}
            />
            <span className="font-semibold">{equippedRod.name}</span>
            {equippedEnchant && (
              <span className="text-[#7B3FE4] dark:text-[#B794F4] font-semibold">
                [{equippedEnchant.name}]
              </span>
            )}
          </div>
          <span className="text-[#425B66] dark:text-[#98ACB5] tabular-nums">
            Lure {effectiveStats.lureSpeed >= 0 ? `+${effectiveStats.lureSpeed}` : effectiveStats.lureSpeed}% ·
            Luck {effectiveStats.luck >= 0 ? `+${effectiveStats.luck}` : effectiveStats.luck}% ·
            Res {effectiveStats.resilience}% ·
            Max {effectiveStats.maxKg >= 999999 ? '∞' : `${effectiveStats.maxKg.toLocaleString()} kg`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 tabular-nums">
          <span className="flex items-center gap-1.5 text-[#425B66] dark:text-[#98ACB5]">
            <Ship className="w-3.5 h-3.5 text-[#1D6664] dark:text-[#82AAA1]" />
            <strong className="text-[#0B1E27] dark:text-[#EDEBE3]">{equippedBoat.name}</strong>
          </span>
          <span className="text-[#0B1E27]/20 dark:text-[#EDEBE3]/20" aria-hidden="true">
            ·
          </span>
          <span className="text-[#425B66] dark:text-[#98ACB5]">
            Umpan:{' '}
            <strong className="text-[#0B1E27] dark:text-[#EDEBE3]">
              {equippedBait
                ? `${equippedBait.name} (${save.baitCounts[equippedBait.id]})`
                : 'Tanpa Umpan'}
            </strong>
          </span>
          <span className="text-[#0B1E27]/20 dark:text-[#EDEBE3]/20" aria-hidden="true">
            ·
          </span>
          <span className="text-[#1D6664] dark:text-[#82AAA1] font-semibold">
            Streak {save.streak}×
          </span>
          {phase === 'idle' && (
            <button
              onClick={() => {
                beginCharge();
                window.setTimeout(() => {
                  engineRef.current.castPower = 0.86;
                  releaseInput();
                }, 140);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#267472] hover:bg-[#1D6664] text-[#F7F6F1] text-xs font-semibold cursor-pointer"
            >
              Lempar Cepat
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs (6 Functional Areas) + Collapsible Dock Toggle */}
      <div
        ref={dockSectionRef}
        className="px-4 sm:px-5 pt-2.5 border-b border-[#0B1E27]/10 dark:border-[#82AAA1]/15 flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-1 overflow-x-auto">
          {(
            [
              { id: 'islands', label: 'Pulau & Cuaca', icon: Compass },
              { id: 'inventory', label: `Tas (${save.inventory.length})`, icon: Backpack },
              { id: 'shop', label: 'Merchant & Toko', icon: ShoppingBag },
              { id: 'altar', label: 'Appraiser & Altar', icon: Wand2 },
              { id: 'quests', label: 'Quest NPC', icon: Award },
              { id: 'bestiary', label: `Bestiary (${discoveredCount}/${FISCH_SPECIES.length})`, icon: BookOpen },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id && !dockCollapsed;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setDockCollapsed(false);
                }}
                className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'border-[#1D6664] text-[#1D6664] dark:border-[#82AAA1] dark:text-[#82AAA1]'
                    : 'border-transparent text-[#425B66] hover:text-[#0B1E27] dark:text-[#8FA3AC] dark:hover:text-[#EDEBE3]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setDockCollapsed((c) => !c)}
          className="px-2.5 py-1.5 mb-1 rounded-lg bg-[#ECEAE1] hover:bg-[#DFDDD2] dark:bg-[#0E2632] dark:hover:bg-[#163646] text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
          title={dockCollapsed ? 'Tampilkan Panel Bawah' : 'Sembunyikan Panel Bawah'}
        >
          {dockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{dockCollapsed ? 'Buka Panel' : 'Tutup Panel'}</span>
        </button>
      </div>

      {/* Tab Content Workspace */}
      {!dockCollapsed && (
      <div className="p-4 sm:p-5 space-y-5">
        {/* TAB 1: ISLANDS & WEATHER TOTEMS */}
        {activeTab === 'islands' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#0B1E27]/10 dark:border-[#82AAA1]/15">
              <div>
                <h3 className="font-display text-lg font-semibold">Peta Ekspedisi Kepulauan Fisch</h3>
                <p className="text-xs text-[#425B66] dark:text-[#98ACB5]">
                  Setiap pulau memiliki ekosistem spesies unik, kondisi cuaca, dan syarat level pelayaran.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    if (save.credits < 600) {
                      soundEffects.playWarning();
                      showTempBanner('Sundial Totem butuh 600 C$.');
                      return;
                    }
                    soundEffects.playFischEnchant();
                    setSave((p) => ({ ...p, credits: p.credits - 600 }));
                    setTimeOfDay((t) => (t === 'Day' ? 'Night' : 'Day'));
                    showTempBanner('Sundial Totem diaktifkan! Waktu Siang ↔ Malam berganti.');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#ECEAE1] hover:bg-[#DFDDD2] dark:bg-[#0E2632] dark:hover:bg-[#163646] border border-[#0B1E27]/12 dark:border-[#82AAA1]/20 text-xs font-semibold cursor-pointer"
                >
                  Sundial Totem (600 C$)
                </button>
                <button
                  onClick={() => {
                    if (save.credits < 8500) {
                      soundEffects.playWarning();
                      showTempBanner('Aurora Totem butuh 8,500 C$.');
                      return;
                    }
                    soundEffects.playFischEnchant();
                    setWeather('Aurora');
                    setTimeOfDay('Night');
                    setSave((p) => ({
                      ...p,
                      credits: p.credits - 8500,
                      auroraTotemUntil: Date.now() + 90000,
                    }));
                    showTempBanner('Aurora Borealis muncul di langit! +140% Luck selama 90 detik.');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#267472] hover:bg-[#1D6664] text-[#F7F6F1] text-xs font-semibold cursor-pointer"
                >
                  Aurora Totem (8,500 C$)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {FISCH_ISLANDS.map((isl) => {
                const unlocked = save.level >= isl.minLevel;
                const isHere = save.currentIslandId === isl.id;
                const islandTotal = FISCH_SPECIES.filter((s) => s.islandId === isl.id).length;
                const islandFound = FISCH_SPECIES.filter(
                  (s) => s.islandId === isl.id && Boolean(save.bestiary[s.id])
                ).length;

                return (
                  <div
                    key={isl.id}
                    className={`rounded-xl p-3.5 border flex flex-col justify-between gap-3 transition-colors ${
                      isHere
                        ? 'bg-white dark:bg-[#0E2632] border-[#267472] dark:border-[#82AAA1]'
                        : 'bg-[#ECEAE1]/55 dark:bg-[#061116]/60 border-[#0B1E27]/10 dark:border-[#82AAA1]/15'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-semibold text-[#1D6664] dark:text-[#82AAA1] flex items-center gap-1">
                          <span>Min Lv. {isl.minLevel}</span>
                          {isl.requiresBoat && (
                            <span className="text-[#876B3A] dark:text-[#F6C453] inline-flex items-center gap-0.5">
                              · <Ship className="w-3 h-3" /> Kapal
                            </span>
                          )}
                        </span>
                        <span className="tabular-nums text-[#425B66] dark:text-[#98ACB5]">
                          {islandFound}/{islandTotal} Ikan
                        </span>
                      </div>
                      <h4 className="font-display text-base font-bold">{isl.name}</h4>
                      <p className="text-[11px] text-[#425B66] dark:text-[#98ACB5] leading-relaxed">
                        {isl.description}
                      </p>
                      {isl.dangerNote && (
                        <p className="text-[11px] text-[#B84F3C] dark:text-[#D98270] font-medium">
                          {isl.dangerNote}
                        </p>
                      )}
                      {isl.requiresBoat && isl.outpostCoords && !isHere && (
                        <p className="text-[11px] text-[#1E3A5F] dark:text-[#63B3ED] font-medium">
                          Atau layari langsung dengan Kapal (tekan [B] di dermaga menuju koordinat {isl.outpostCoords.x}, {isl.outpostCoords.z}).
                        </p>
                      )}
                    </div>

                    <button
                      disabled={!unlocked || isHere}
                      onClick={() => {
                        soundEffects.playBubblePop();
                        setSave((p) => ({ ...p, currentIslandId: isl.id }));
                        showTempBanner(`Berlayar menuju ${isl.name}!`);
                      }}
                      className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
                        isHere
                          ? 'bg-[#267472]/15 text-[#1D6664] dark:text-[#82AAA1] cursor-default'
                          : unlocked
                          ? 'bg-[#267472] hover:bg-[#1D6664] text-[#F7F6F1] cursor-pointer'
                          : 'bg-[#0B1E27]/10 dark:bg-[#EDEBE3]/10 text-[#5F7782] cursor-not-allowed'
                      }`}
                    >
                      {isHere
                        ? 'Lokasi Aktif'
                        : unlocked
                        ? isl.requiresBoat
                          ? 'Berlayar ke Pulau'
                          : 'Berlayar ke Pulau'
                        : `Terbuka di Lv. ${isl.minLevel}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY, CRATES, BAITS & ROD EQUIP */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Crates & Relics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl bg-[#ECEAE1]/60 dark:bg-[#061116]/65 border border-[#0B1E27]/10 dark:border-[#82AAA1]/15 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-base font-semibold flex items-center gap-2">
                    <PackageOpen className="w-4 h-4 text-[#1D6664] dark:text-[#82AAA1]" />
                    <span>Peti Umpan &amp; Geode ({Object.values(save.crateCounts).reduce((a, b) => a + b, 0)})</span>
                  </h4>
                  <span className="text-xs font-semibold text-[#7B3FE4] dark:text-[#B794F4]">
                    Enchant Relic: {save.relicCount}×
                  </span>
                </div>
                {Object.keys(save.crateCounts).length === 0 ? (
                  <p className="text-xs text-[#425B66] dark:text-[#98ACB5]">
                    Belum ada peti. Gunakan umpan Magnet atau beli peti di Merchant!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(save.crateCounts).map(([cId, count]) => {
                      const sp = FISCH_SPECIES.find((s) => s.id === cId);
                      return (
                        <button
                          key={cId}
                          onClick={() => handleOpenCrate(cId)}
                          className="px-3 py-2 rounded-lg bg-white dark:bg-[#0E2632] border border-[#0B1E27]/12 dark:border-[#82AAA1]/25 text-xs font-semibold hover:border-[#267472] cursor-pointer"
                        >
                          Buka {sp?.name ?? cId} ({count}×)
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Equip Bait */}
              <div className="rounded-xl bg-[#ECEAE1]/60 dark:bg-[#061116]/65 border border-[#0B1E27]/10 dark:border-[#82AAA1]/15 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-base font-semibold">Pilih Umpan (Bait Bag)</h4>
                  {save.equippedBaitId && (
                    <button
                      onClick={() => setSave((p) => ({ ...p, equippedBaitId: null }))}
                      className="text-xs text-[#B84F3C] dark:text-[#D98270] font-semibold cursor-pointer"
                    >
                      Lepas Umpan
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {FISCH_BAITS.filter((b) => (save.baitCounts[b.id] ?? 0) > 0).length === 0 ? (
                    <p className="text-xs text-[#425B66] dark:text-[#98ACB5]">
                      Stok umpan kosong. Buka Bait Crate atau beli di Toko Merchant.
                    </p>
                  ) : (
                    FISCH_BAITS.filter((b) => (save.baitCounts[b.id] ?? 0) > 0).map((b) => {
                      const active = save.equippedBaitId === b.id;
                      return (
                        <button
                          key={b.id}
                          onClick={() => {
                            soundEffects.playBubblePop();
                            setSave((p) => ({ ...p, equippedBaitId: b.id }));
                          }}
                          title={b.description}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                            active
                              ? 'bg-[#267472] text-[#F7F6F1] border-[#267472]'
                              : 'bg-white dark:bg-[#0E2632] border-[#0B1E27]/12 dark:border-[#82AAA1]/20'
                          }`}
                        >
                          {b.name} ({save.baitCounts[b.id]}×)
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Owned Rods Quick Switch */}
            <div className="space-y-2">
              <h4 className="font-display text-base font-semibold">
                Koleksi Joran Dimiliki ({save.ownedRods.length}/{FISCH_RODS.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {save.ownedRods.map((rId) => {
                  const rod = findRod(rId);
                  const enchant = findEnchant(save.rodEnchants[rId]);
                  const active = save.equippedRodId === rId;
                  return (
                    <button
                      key={rId}
                      onClick={() => {
                        soundEffects.playBubblePop();
                        setSave((p) => ({ ...p, equippedRodId: rId }));
                        setEnchantTargetRodId(rId);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border flex items-center gap-2 cursor-pointer ${
                        active
                          ? 'bg-[#267472] text-[#F7F6F1] border-[#267472]'
                          : 'bg-white dark:bg-[#0E2632] border-[#0B1E27]/12 dark:border-[#82AAA1]/20'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: rod.colorHex }}
                      />
                      <span>{rod.name}</span>
                      {enchant && <span className="opacity-85">[{enchant.name}]</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caught Fish Inventory */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-display text-base font-semibold">
                  Tas Ikan ({save.inventory.length}/120)
                </h4>
                {unlockedInventoryValue > 0 && (
                  <button
                    onClick={handleSellAllUnlocked}
                    className="px-4 py-2 rounded-lg bg-[#876B3A] hover:bg-[#6E562D] dark:bg-[#C7B99E] dark:hover:bg-[#EDEBE3] text-[#F7F6F1] dark:text-[#061116] text-xs font-semibold cursor-pointer"
                  >
                    Jual Semua Non-Favorit (+{formatCredits(unlockedInventoryValue)})
                  </button>
                )}
              </div>

              {save.inventory.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#0B1E27]/20 dark:border-[#82AAA1]/25 p-6 text-center text-xs text-[#425B66] dark:text-[#98ACB5]">
                  Tas ikan masih kosong. Lemparkan kail ke air untuk menangkap ikan!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[340px] overflow-y-auto pr-1">
                  {save.inventory.map((item) => {
                    const sp = FISCH_SPECIES.find((s) => s.id === item.speciesId);
                    if (!sp) return null;
                    const mut = FISCH_MUTATIONS.find((m) => m.id === item.mutationId);
                    return (
                      <div
                        key={item.uid}
                        className="rounded-xl bg-white dark:bg-[#061116]/75 border border-[#0B1E27]/12 dark:border-[#82AAA1]/18 p-3 flex flex-col justify-between gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <span
                              className="font-bold"
                              style={{
                                color:
                                  theme === 'dark'
                                    ? RARITY_COLORS[sp.rarity].dark
                                    : RARITY_COLORS[sp.rarity].light,
                              }}
                            >
                              {sp.rarity}
                            </span>
                            <span className="tabular-nums font-semibold">{item.weightKg} kg</span>
                          </div>
                          <div className="font-display text-sm font-bold truncate">
                            {item.isGiant ? 'Giant ' : item.isTiny ? 'Tiny ' : ''}
                            {mut && mut.id !== 'none' ? `${mut.name} ` : ''}
                            {sp.name}
                          </div>
                          <div className="text-[11px] text-[#425B66] dark:text-[#98ACB5] tabular-nums">
                            {[
                              item.isShiny ? 'Shiny' : null,
                              item.isSparkling ? 'Sparkling' : null,
                              formatCredits(item.sellValue),
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleToggleLock(item.uid)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#ECEAE1] dark:bg-[#0E2632] text-[11px] flex items-center gap-1 cursor-pointer"
                            title={item.locked ? 'Buka kunci agar bisa dijual' : 'Kunci sebagai Favorit'}
                          >
                            {item.locked ? (
                              <>
                                <Lock className="w-3 h-3 text-[#876B3A] dark:text-[#F6C453]" />
                                <span>Favorit</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3 h-3" />
                                <span>Kunci</span>
                              </>
                            )}
                          </button>
                          <button
                            disabled={item.locked}
                            onClick={() => handleSellFish(item.uid)}
                            className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold ${
                              item.locked
                                ? 'bg-[#0B1E27]/8 dark:bg-[#EDEBE3]/8 text-[#5F7782] cursor-not-allowed'
                                : 'bg-[#267472] hover:bg-[#1D6664] text-[#F7F6F1] cursor-pointer'
                            }`}
                          >
                            {item.locked ? 'Terkunci' : 'Jual'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MERCHANT & ROD/BAIT SHOP */}
        {activeTab === 'shop' && (
          <div className="space-y-6">
            {/* Merchant Quick Counter */}
            <div className="rounded-xl bg-[#ECEAE1]/75 dark:bg-[#061116]/75 border border-[#0B1E27]/12 dark:border-[#82AAA1]/20 p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="font-display text-base font-bold">The Merchant — Dermaga Moosewood</h4>
                <p className="text-xs text-[#425B66] dark:text-[#98ACB5]">
                  Jual hasil pancingan Anda untuk C$ atau beli Peti Umpan. Ikan berstatus Favorit tetap aman.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  disabled={unlockedInventoryValue <= 0}
                  onClick={handleSellAllUnlocked}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                    unlockedInventoryValue > 0
                      ? 'bg-[#876B3A] hover:bg-[#6E562D] dark:bg-[#C7B99E] dark:hover:bg-[#EDEBE3] text-[#F7F6F1] dark:text-[#061116] cursor-pointer'
                      : 'bg-[#0B1E27]/10 dark:bg-[#EDEBE3]/10 text-[#5F7782] cursor-not-allowed'
                  }`}
                >
                  Jual Semua ({formatCredits(unlockedInventoryValue)})
                </button>
                <button
                  onClick={() => handleBuyCrate('crate__bait_crate', 120)}
                  className="px-3.5 py-2 rounded-lg bg-[#267472] hover:bg-[#1D6664] text-[#F7F6F1] text-xs font-semibold cursor-pointer"
                >
                  Bait Crate (120 C$)
                </button>
                <button
                  onClick={() => handleBuyCrate('crate__quality_bait_crate', 550)}
                  className="px-3.5 py-2 rounded-lg bg-[#267472] hover:bg-[#1D6664] text-[#F7F6F1] text-xs font-semibold cursor-pointer"
                >
                  Quality Crate (550 C$)
                </button>
              </div>
            </div>

            {/* Galangan Kapal — Tukang Kapal */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-display text-base font-bold flex items-center gap-2">
                  <Ship className="w-4 h-4 text-[#1D6664] dark:text-[#82AAA1]" />
                  <span>Galangan Kapal · Tukang Kapal ({FISCH_BOATS.length} Kapal 3D)</span>
                </h4>
                <span className="text-[11px] text-[#425B66] dark:text-[#98ACB5]">
                  Dekati kapal di sisi kiri ujung dermaga dan tekan [B] untuk berlayar ke pulau atol!
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {FISCH_BOATS.map((boat) => {
                  const owned = save.ownedBoats.includes(boat.id);
                  const equipped = save.equippedBoatId === boat.id;
                  const levelOk = save.level >= boat.minLevel;

                  return (
                    <div
                      key={boat.id}
                      className={`rounded-xl p-3.5 border flex flex-col justify-between gap-3 ${
                        equipped
                          ? 'bg-white dark:bg-[#0E2632] border-[#267472] dark:border-[#82AAA1]'
                          : 'bg-[#ECEAE1]/50 dark:bg-[#061116]/60 border-[#0B1E27]/10 dark:border-[#82AAA1]/15'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: boat.colorHex }}
                            />
                            <span className="font-display font-bold text-sm">{boat.name}</span>
                          </div>
                          <span className="text-[11px] font-semibold text-[#876B3A] dark:text-[#F6C453] tabular-nums">
                            {owned ? 'Dimiliki' : formatCredits(boat.price)}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#1D6664] dark:text-[#82AAA1] font-medium tabular-nums">
                          Kecepatan {boat.speed} kn · Kemudi {boat.turnSpeed}× · Min Lv. {boat.minLevel}
                        </div>
                        <p className="text-[11px] text-[#425B66] dark:text-[#98ACB5] leading-snug">
                          {boat.description}
                        </p>
                      </div>

                      <button
                        disabled={equipped || (!owned && (!levelOk || save.credits < boat.price))}
                        onClick={() => handleBuyOrEquipBoat(boat.id)}
                        className={`w-full py-2 rounded-lg text-xs font-semibold ${
                          equipped
                            ? 'bg-[#267472]/15 text-[#1D6664] dark:text-[#82AAA1] cursor-default'
                            : owned
                            ? 'bg-[#ECEAE1] hover:bg-[#DFDDD2] dark:bg-[#102B38] text-[#0B1E27] dark:text-[#EDEBE3] cursor-pointer'
                            : levelOk && save.credits >= boat.price
                            ? 'bg-[#267472] hover:bg-[#1D6664] text-[#F7F6F1] cursor-pointer'
                            : 'bg-[#0B1E27]/10 dark:bg-[#EDEBE3]/10 text-[#5F7782] cursor-not-allowed'
                        }`}
                      >
                        {equipped
                          ? 'Kapal Ditambatkan'
                          : owned
                          ? 'Luncurkan Kapal'
                          : !levelOk
                          ? `Butuh Lv. ${boat.minLevel}`
                          : `Beli (${formatCredits(boat.price)})`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 18 Fishing Rods Shop */}
            <div className="space-y-3">
              <h4 className="font-display text-base font-bold">Toko Joran ({FISCH_RODS.length} Rod Autentik)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
                {FISCH_RODS.map((rod) => {
                  const owned = save.ownedRods.includes(rod.id);
                  const equipped = save.equippedRodId === rod.id;
                  const levelOk = save.level >= rod.minLevel;

                  return (
                    <div
                      key={rod.id}
                      className={`rounded-xl p-3.5 border flex flex-col justify-between gap-3 ${
                        equipped
                          ? 'bg-white dark:bg-[#0E2632] border-[#267472] dark:border-[#82AAA1]'
                          : 'bg-[#ECEAE1]/50 dark:bg-[#061116]/60 border-[#0B1E27]/10 dark:border-[#82AAA1]/15'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: rod.colorHex }}
                            />
                            <span className="font-display font-bold text-sm">{rod.name}</span>
                          </div>
                          <span className="text-[11px] font-semibold text-[#876B3A] dark:text-[#F6C453] tabular-nums">
                            {owned ? 'Dimiliki' : formatCredits(rod.price)}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#425B66] dark:text-[#98ACB5] tabular-nums">
                          Lure {rod.lureSpeed >= 0 ? `+${rod.lureSpeed}` : rod.lureSpeed}% ·
                          Luck {rod.luck >= 0 ? `+${rod.luck}` : rod.luck}% ·
                          Ctrl {rod.control >= 0 ? `+${rod.control}` : rod.control} ·
                          Res {rod.resilience}% ·
                          Max {rod.maxKg >= 999999 ? '∞' : `${rod.maxKg.toLocaleString()}kg`}
                        </div>
                        <p className="text-[11px] text-[#425B66] dark:text-[#98ACB5] leading-snug">
                          {rod.passiveText}
                        </p>
                      </div>

                      <button
                        disabled={equipped || (!owned && (!levelOk || save.credits < rod.price))}
                        onClick={() => handleBuyRod(rod.id)}
                        className={`w-full py-2 rounded-lg text-xs font-semibold ${
                          equipped
                            ? 'bg-[#267472]/15 text-[#1D6664] dark:text-[#82AAA1] cursor-default'
                            : owned
                            ? 'bg-[#ECEAE1] hover:bg-[#DFDDD2] dark:bg-[#102B38] text-[#0B1E27] dark:text-[#EDEBE3] cursor-pointer'
                            : levelOk && save.credits >= rod.price
                            ? 'bg-[#267472] hover:bg-[#1D6664] text-[#F7F6F1] cursor-pointer'
                            : 'bg-[#0B1E27]/10 dark:bg-[#EDEBE3]/10 text-[#5F7782] cursor-not-allowed'
                        }`}
                      >
                        {equipped
                          ? 'Sedang Dipakai'
                          : owned
                          ? 'Pasang Rod'
                          : !levelOk
                          ? `Butuh Lv. ${rod.minLevel}`
                          : `Beli (${formatCredits(rod.price)})`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct Bait Shop */}
            <div className="space-y-3">
              <h4 className="font-display text-base font-bold">Toko Umpan (Beli Satuan &amp; Grosir)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {FISCH_BAITS.map((bait) => (
                  <div
                    key={bait.id}
                    className="rounded-xl p-3 bg-[#ECEAE1]/50 dark:bg-[#061116]/60 border border-[#0B1E27]/10 dark:border-[#82AAA1]/15 flex flex-col justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{bait.name}</span>
                        <span className="text-[#876B3A] dark:text-[#F6C453] tabular-nums">
                          {formatCredits(bait.shopPrice ?? 50)}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#1D6664] dark:text-[#82AAA1] tabular-nums">
                        Pref +{bait.preferredLuck}% · Univ +{bait.universalLuck}% · Lure {bait.lureSpeed}%
                      </div>
                      <p className="text-[11px] text-[#425B66] dark:text-[#98ACB5]">{bait.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => handleBuyBait(bait.id, 1)}
                        className="flex-1 py-1.5 rounded-lg bg-white dark:bg-[#0E2632] border border-[#0B1E27]/12 dark:border-[#82AAA1]/20 text-[11px] font-semibold cursor-pointer"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleBuyBait(bait.id, 5)}
                        className="flex-1 py-1.5 rounded-lg bg-[#267472] hover:bg-[#1D6664] text-[#F7F6F1] text-[11px] font-semibold cursor-pointer"
                      >
                        +5 ({formatCredits((bait.shopPrice ?? 50) * 5)})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: APPRAISER, MERLIN & KEEPER'S ALTAR (ENCHANTING) */}
        {activeTab === 'altar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Treasure Appraiser */}
            <div className="rounded-xl bg-[#ECEAE1]/60 dark:bg-[#061116]/65 border border-[#0B1E27]/12 dark:border-[#82AAA1]/18 p-4 space-y-3">
              <h4 className="font-display text-base font-bold">Treasure Appraiser</h4>
              <p className="text-xs text-[#425B66] dark:text-[#98ACB5]">
                Gulirkan ulang berat (peluang Giant!), atribut Shiny/Sparkling, serta Mutasi baru pada ikan di tas Anda.
              </p>

              {save.inventory.length === 0 ? (
                <p className="text-xs text-[#5F7782]">Tangkap minimal 1 ikan terlebih dahulu.</p>
              ) : (
                <>
                  <select
                    value={appraiseSelectedUid || save.inventory[0]?.uid || ''}
                    onChange={(e) => setAppraiseSelectedUid(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0E2632] border border-[#0B1E27]/15 dark:border-[#82AAA1]/25 text-xs"
                  >
                    {save.inventory.map((item) => {
                      const sp = FISCH_SPECIES.find((s) => s.id === item.speciesId);
                      return (
                        <option key={item.uid} value={item.uid}>
                          {sp?.name ?? item.speciesId} · {item.weightKg} kg ({formatCredits(item.sellValue)})
                        </option>
                      );
                    })}
                  </select>
                  {(() => {
                    const targetUid = appraiseSelectedUid || save.inventory[0]?.uid;
                    const targetItem = save.inventory.find((i) => i.uid === targetUid);
                    const sp = targetItem
                      ? FISCH_SPECIES.find((s) => s.id === targetItem.speciesId)
                      : null;
                    const fee = sp ? Math.max(150, Math.round(sp.baseValuePerKg * sp.maxKg * 0.25)) : 150;
                    return (
                      <button
                        disabled={!targetItem}
                        onClick={() => targetItem && handleAppraiseFish(targetItem.uid)}
                        className="w-full py-2 rounded-lg bg-[#267472] hover:bg-[#1D6664] text-[#F7F6F1] text-xs font-semibold cursor-pointer"
                      >
                        Appraise Ikan ({formatCredits(fee)})
                      </button>
                    );
                  })()}
                </>
              )}
            </div>

            {/* Merlin (Sunstone) */}
            <div className="rounded-xl bg-[#ECEAE1]/60 dark:bg-[#061116]/65 border border-[#0B1E27]/12 dark:border-[#82AAA1]/18 p-4 space-y-3">
              <h4 className="font-display text-base font-bold">Merlin — Sunstone Peak</h4>
              <p className="text-xs text-[#425B66] dark:text-[#98ACB5]">
                Penyihir Sunstone menyediakan Enchant Relic langka serta berkah keberuntungan sementara.
              </p>
              <div className="text-xs font-semibold text-[#7B3FE4] dark:text-[#B794F4]">
                Stok Enchant Relic Anda: {save.relicCount}×
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (save.credits < 11000) {
                      soundEffects.playWarning();
                      showTempBanner('Enchant Relic dari Merlin berharga 11,000 C$.');
                      return;
                    }
                    soundEffects.playFischEnchant();
                    setSave((p) => ({
                      ...p,
                      credits: p.credits - 11000,
                      relicCount: p.relicCount + 1,
                    }));
                    showTempBanner('Membeli 1× Enchant Relic dari Merlin!');
                  }}
                  className="w-full py-2 rounded-lg bg-[#267472] hover:bg-[#1D6664] text-[#F7F6F1] text-xs font-semibold cursor-pointer"
                >
                  Beli Enchant Relic (11,000 C$)
                </button>
                <button
                  onClick={() => {
                    if (save.credits < 2500) {
                      soundEffects.playWarning();
                      showTempBanner('Merlin’s Luck Boost butuh 2,500 C$.');
                      return;
                    }
                    soundEffects.playFischEnchant();
                    setSave((p) => ({
                      ...p,
                      credits: p.credits - 2500,
                      merlinLuckUntil: Date.now() + 90000,
                    }));
                    showTempBanner('Berkah Merlin aktif! +65% Luck selama 90 detik.');
                  }}
                  className="w-full py-2 rounded-lg bg-white dark:bg-[#0E2632] border border-[#0B1E27]/15 dark:border-[#82AAA1]/25 text-xs font-semibold cursor-pointer"
                >
                  Merlin’s Luck +65% / 90d (2,500 C$)
                </button>
              </div>
            </div>

            {/* Keeper's Altar (Night Enchanting) */}
            <div className="rounded-xl bg-[#ECEAE1]/60 dark:bg-[#061116]/65 border border-[#0B1E27]/12 dark:border-[#82AAA1]/18 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-display text-base font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#7B3FE4] dark:text-[#B794F4]" />
                  <span>Keeper’s Altar</span>
                </h4>
                <span
                  className={`text-[11px] font-semibold ${
                    timeOfDay === 'Night'
                      ? 'text-[#2A7B4F] dark:text-[#5EC48B]'
                      : 'text-[#B84F3C] dark:text-[#D98270]'
                  }`}
                >
                  {timeOfDay === 'Night' ? 'Altar Terbuka (Malam)' : 'Aktif Saat Malam'}
                </span>
              </div>
              <p className="text-xs text-[#425B66] dark:text-[#98ACB5]">
                Pasang salah satu dari 12 Enchantment (Divine, Abyssal, Quantum, Blessed, Hasty) memakai 1× Enchant Relic.
              </p>

              <select
                value={enchantTargetRodId}
                onChange={(e) => setEnchantTargetRodId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0E2632] border border-[#0B1E27]/15 dark:border-[#82AAA1]/25 text-xs"
              >
                {save.ownedRods.map((rId) => {
                  const r = findRod(rId);
                  const e = findEnchant(save.rodEnchants[rId]);
                  return (
                    <option key={rId} value={rId}>
                      {r.name} {e ? `[${e.name}]` : '(Polos)'}
                    </option>
                  );
                })}
              </select>

              <button
                onClick={handleEnchantRod}
                className={`w-full py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                  timeOfDay === 'Night' && save.relicCount > 0
                    ? 'bg-[#7B3FE4] hover:bg-[#662ED0] text-white'
                    : 'bg-[#0B1E27]/12 dark:bg-[#EDEBE3]/12 text-[#425B66] dark:text-[#98ACB5]'
                }`}
              >
                Enchant Rod (1× Relic)
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: NPC QUESTS & ROTATING ANGLER BOARD */}
        {activeTab === 'quests' && (
          <div className="space-y-5">
            {/* Rotating Angler Quest */}
            {save.anglerQuest && (
              <div className="rounded-xl bg-white dark:bg-[#0E2632] border border-[#267472]/40 dark:border-[#82AAA1]/35 p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-[#1D6664] dark:text-[#82AAA1]">
                    The Angler · Misi Harian Berulang
                  </div>
                  <h4 className="font-display text-base font-bold">{save.anglerQuest.title}</h4>
                  <p className="text-xs text-[#425B66] dark:text-[#98ACB5] tabular-nums">
                    Progres: {save.anglerQuest.progress}/{save.anglerQuest.requiredAmount} ekor · Hadiah:{' '}
                    {formatCredits(save.anglerQuest.rewardCredits)} + {save.anglerQuest.rewardXp} XP +{' '}
                    {save.anglerQuest.rewardBaitAmount}×{' '}
                    {findBait(save.anglerQuest.rewardBaitId)?.name ?? save.anglerQuest.rewardBaitId}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundEffects.playBubblePop();
                      setSave((p) => ({ ...p, anglerQuest: generateAnglerQuest(p.level) }));
                    }}
                    className="px-3 py-2 rounded-lg bg-[#ECEAE1] dark:bg-[#061116] text-xs font-semibold cursor-pointer"
                  >
                    Ganti Pesanan
                  </button>
                  <button
                    disabled={save.anglerQuest.progress < save.anglerQuest.requiredAmount}
                    onClick={handleClaimAnglerQuest}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                      save.anglerQuest.progress >= save.anglerQuest.requiredAmount
                        ? 'bg-[#267472] hover:bg-[#1D6664] text-[#F7F6F1] cursor-pointer'
                        : 'bg-[#0B1E27]/10 dark:bg-[#EDEBE3]/10 text-[#5F7782] cursor-not-allowed'
                    }`}
                  >
                    Klaim Hadiah
                  </button>
                </div>
              </div>
            )}

            {/* NPC Story Quests */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {FISCH_QUESTS.map((q) => {
                const completed = save.completedQuestIds.includes(q.id);
                const lockedByLevel = save.level < q.minLevel;
                const progress = save.questProgress[q.id] ?? 0;
                const readyToClaim = !completed && !lockedByLevel && progress >= q.requiredAmount;

                return (
                  <div
                    key={q.id}
                    className={`rounded-xl p-4 border flex flex-col justify-between gap-3 ${
                      completed
                        ? 'bg-[#2A7B4F]/8 dark:bg-[#5EC48B]/10 border-[#2A7B4F]/25 dark:border-[#5EC48B]/25'
                        : 'bg-[#ECEAE1]/55 dark:bg-[#061116]/65 border-[#0B1E27]/10 dark:border-[#82AAA1]/15'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#1D6664] dark:text-[#82AAA1]">
                          {q.npcName} · {q.npcRole}
                        </span>
                        <span className="tabular-nums text-[#425B66] dark:text-[#98ACB5]">
                          Lv. {q.minLevel}+
                        </span>
                      </div>
                      <h5 className="font-display text-sm font-bold">{q.title}</h5>
                      <p className="text-[11px] text-[#425B66] dark:text-[#98ACB5] leading-relaxed">
                        {q.description}
                      </p>
                      <div className="text-[11px] font-medium text-[#876B3A] dark:text-[#F6C453] tabular-nums">
                        Hadiah: {formatCredits(q.rewardCredits)} · {q.rewardXp} XP
                        {q.rewardRodId ? ` · ${findRod(q.rewardRodId).name}` : ''}
                        {q.rewardRelics ? ` · ${q.rewardRelics}× Relic` : ''}
                        {q.rewardBait
                          ? ` · ${q.rewardBait.amount}× ${findBait(q.rewardBait.baitId)?.name ?? ''}`
                          : ''}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full h-1.5 rounded-full bg-[#DCE6E4] dark:bg-[#102B38] overflow-hidden">
                        <div
                          className="h-full bg-[#267472] dark:bg-[#82AAA1]"
                          style={{
                            width: `${completed ? 100 : Math.min(100, (progress / q.requiredAmount) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] tabular-nums">
                        <span>
                          {completed
                            ? 'Selesai'
                            : lockedByLevel
                            ? `Terbuka di Lv. ${q.minLevel}`
                            : `${progress}/${q.requiredAmount}`}
                        </span>
                        {readyToClaim && (
                          <button
                            onClick={() => handleClaimQuest(q.id)}
                            className="px-3 py-1 rounded-lg bg-[#267472] hover:bg-[#1D6664] text-[#F7F6F1] font-semibold cursor-pointer"
                          >
                            Klaim
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: BESTIARY (230 SPECIES & CRATES) */}
        {activeTab === 'bestiary' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-base font-bold">
                  Bestiary Samudra — {discoveredCount} / {FISCH_SPECIES.length} Spesies ({bestiaryPercent}%)
                </h4>
                <p className="text-xs text-[#425B66] dark:text-[#98ACB5]">
                  Lengkapi seluruh entri di {FISCH_ISLANDS.length} pulau termasuk ikan legendaris, mutasi langka, geode, dan relik.
                </p>
              </div>
              <div className="w-48 h-2.5 rounded-full bg-[#DCE6E4] dark:bg-[#102B38] overflow-hidden">
                <div
                  className="h-full bg-[#267472] dark:bg-[#82AAA1] transition-all duration-300"
                  style={{ width: `${bestiaryPercent}%` }}
                />
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5F7782]" />
                <input
                  type="text"
                  value={bestiarySearch}
                  onChange={(e) => setBestiarySearch(e.target.value)}
                  placeholder="Cari nama spesies..."
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-[#061116] border border-[#0B1E27]/12 dark:border-[#82AAA1]/20 text-xs"
                />
              </div>
              <select
                value={bestiaryIslandFilter}
                onChange={(e) => setBestiaryIslandFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white dark:bg-[#061116] border border-[#0B1E27]/12 dark:border-[#82AAA1]/20 text-xs"
              >
                <option value="all">Semua Pulau ({FISCH_SPECIES.length})</option>
                {FISCH_ISLANDS.map((isl) => (
                  <option key={isl.id} value={isl.id}>
                    {isl.name}
                  </option>
                ))}
                <option value="universal">Peti &amp; Relik Universal</option>
              </select>
              <select
                value={bestiaryRarityFilter}
                onChange={(e) => setBestiaryRarityFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white dark:bg-[#061116] border border-[#0B1E27]/12 dark:border-[#82AAA1]/20 text-xs"
              >
                <option value="all">Semua Rarity</option>
                {RARITY_ORDER.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select
                value={bestiaryStatusFilter}
                onChange={(e) =>
                  setBestiaryStatusFilter(e.target.value as 'all' | 'caught' | 'missing')
                }
                className="px-3 py-2 rounded-lg bg-white dark:bg-[#061116] border border-[#0B1E27]/12 dark:border-[#82AAA1]/20 text-xs"
              >
                <option value="all">Semua Status</option>
                <option value="caught">Sudah Ditangkap ({discoveredCount})</option>
                <option value="missing">Belum Ditemukan ({FISCH_SPECIES.length - discoveredCount})</option>
              </select>
            </div>

            {/* Bestiary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[410px] overflow-y-auto pr-1">
              {filteredBestiary.map((sp) => {
                const entry = save.bestiary[sp.id];
                const found = Boolean(entry);
                const islName =
                  sp.islandId === 'universal'
                    ? 'Semua Perairan'
                    : FISCH_ISLANDS.find((i) => i.id === sp.islandId)?.name ?? sp.islandId;
                const prefHint = [
                  sp.preferredTime ? sp.preferredTime : null,
                  sp.preferredWeather ? sp.preferredWeather : null,
                  sp.preferredBait ? `Umpan ${findBait(sp.preferredBait)?.name ?? sp.preferredBait}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <div
                    key={sp.id}
                    className={`rounded-xl p-3 border space-y-1.5 ${
                      found
                        ? 'bg-white dark:bg-[#061116]/75 border-[#0B1E27]/12 dark:border-[#82AAA1]/20'
                        : 'bg-[#ECEAE1]/40 dark:bg-[#061116]/35 border-[#0B1E27]/8 dark:border-[#82AAA1]/10 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span
                        className="font-bold"
                        style={{
                          color:
                            theme === 'dark'
                              ? RARITY_COLORS[sp.rarity].dark
                              : RARITY_COLORS[sp.rarity].light,
                        }}
                      >
                        {sp.rarity}
                      </span>
                      <span className="text-[#425B66] dark:text-[#98ACB5] truncate">{islName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Fish
                        className="w-4 h-4 shrink-0"
                        style={{ color: found ? sp.colorHex : '#5F7782' }}
                      />
                      <span className="font-display text-sm font-bold truncate">
                        {found ? sp.name : `??? (${sp.name.slice(0, 2)}•••)`}
                      </span>
                    </div>

                    {found ? (
                      <>
                        <p className="text-[11px] text-[#425B66] dark:text-[#98ACB5] leading-snug">
                          {sp.description}
                        </p>
                        <div className="text-[11px] text-[#1D6664] dark:text-[#82AAA1] tabular-nums">
                          Ditangkap {entry.caughtCount}× · Rekor {entry.bestWeightKg} kg · {sp.baseValuePerKg} C$/kg
                        </div>
                        {entry.mutations.length > 0 && (
                          <div className="text-[11px] text-[#7B3FE4] dark:text-[#B794F4]">
                            Mutasi: {entry.mutations.join(', ')}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-[11px] text-[#5F7782] dark:text-[#7C929C] space-y-0.5">
                        <div>Bobot: {sp.minKg}–{sp.maxKg} kg</div>
                        <div>{prefHint ? `Petunjuk: ${prefHint}` : 'Petunjuk: Muncul di segala cuaca'}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Clean Footer Strip */}
      <div className="px-5 py-2.5 bg-[#ECEAE1]/90 dark:bg-[#061116]/90 border-t border-[#0B1E27]/10 dark:border-[#82AAA1]/15 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#425B66] dark:text-[#8FA3AC]">
        <span className="flex items-center gap-1.5">
          <Waves className="w-3.5 h-3.5 text-[#1D6664] dark:text-[#82AAA1]" />
          <span>Fisch: Ekspedisi Pancing Samudra · Progres tersimpan otomatis di browser</span>
        </span>
        <span className="flex items-center gap-1.5 tabular-nums">
          <Anchor className="w-3.5 h-3.5" />
          <span>Total Tangkapan: {save.totalCatches} · Peti Dibuka: {save.cratesOpened}</span>
        </span>
      </div>
    </div>
  );
};
