import { useState, useEffect } from 'react';
import { ACHIEVEMENTS_LIST } from '../data/missionsData';
import { soundEffects } from '../utils/soundEffects';

export interface UserProgress {
  username: string;
  avatarSeed: string;
  totalXp: number;
  completedMissions: string[];
  favoriteSpecies: string[];
  quizCompletedCount: number;
  quizTotalCorrect: number;
  gamesPlayed: number;
  gameHighScore: number;
  unlockedAchievements: string[];
}

const STORAGE_KEY = 'ocean_rescue_user_progress_v1';

const DEFAULT_PROGRESS: UserProgress = {
  username: 'Ocean Explorer',
  avatarSeed: 'diver-1',
  totalXp: 120, // Starting explorer bonus
  completedMissions: [],
  favoriteSpecies: ['whale-shark', 'green-sea-turtle'],
  quizCompletedCount: 0,
  quizTotalCorrect: 0,
  gamesPlayed: 0,
  gameHighScore: 0,
  unlockedAchievements: ['first-dive'],
};

export function getLevelInfo(xp: number): {
  level: number;
  title: string;
  minXp: number;
  nextLevelXp: number;
  progressPercent: number;
  badgeColor: string;
} {
  if (xp >= 2500) {
    return {
      level: 5,
      title: 'OCEAN LEGEND',
      minXp: 2500,
      nextLevelXp: 2500,
      progressPercent: 100,
      badgeColor: 'text-[#C7B99E] border-[#C7B99E]/40 bg-[#C7B99E]/10',
    };
  } else if (xp >= 1200) {
    const range = 2500 - 1200;
    const current = xp - 1200;
    return {
      level: 4,
      title: 'OCEAN GUARDIAN',
      minXp: 1200,
      nextLevelXp: 2500,
      progressPercent: Math.min(100, Math.round((current / range) * 100)),
      badgeColor: 'text-[#82AAA1] border-[#82AAA1]/40 bg-[#82AAA1]/10',
    };
  } else if (xp >= 600) {
    const range = 1200 - 600;
    const current = xp - 600;
    return {
      level: 3,
      title: 'MARINE PROTECTOR',
      minXp: 600,
      nextLevelXp: 1200,
      progressPercent: Math.min(100, Math.round((current / range) * 100)),
      badgeColor: 'text-[#82AAA1] border-[#367D7B]/40 bg-[#367D7B]/15',
    };
  } else if (xp >= 250) {
    const range = 600 - 250;
    const current = xp - 250;
    return {
      level: 2,
      title: 'SEA EXPLORER',
      minXp: 250,
      nextLevelXp: 600,
      progressPercent: Math.min(100, Math.round((current / range) * 100)),
      badgeColor: 'text-[#EDEBE3] border-[#367D7B]/40 bg-[#102B38]/60',
    };
  } else {
    const range = 250;
    const current = xp;
    return {
      level: 1,
      title: 'OCEAN BEGINNER',
      minXp: 0,
      nextLevelXp: 250,
      progressPercent: Math.min(100, Math.round((current / range) * 100)),
      badgeColor: 'text-[#8FA3AC] border-[#EDEBE3]/15 bg-[#091C25]/70',
    };
  }
}

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    if (typeof window === 'undefined') return DEFAULT_PROGRESS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PROGRESS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed reading user progress from localStorage', e);
    }
    return DEFAULT_PROGRESS;
  });

  const [recentNotification, setRecentNotification] = useState<{
    id: string;
    title: string;
    description: string;
    type: 'xp' | 'achievement' | 'mission';
  } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed saving user progress to localStorage', e);
    }
  }, [progress]);

  // Check achievements whenever state changes
  const checkAchievements = (current: UserProgress) => {
    const newUnlocked = [...current.unlockedAchievements];
    let hadNew = false;

    const maybeUnlock = (achId: string) => {
      if (!newUnlocked.includes(achId)) {
        newUnlocked.push(achId);
        hadNew = true;
        const meta = ACHIEVEMENTS_LIST.find((a) => a.id === achId);
        if (meta) {
          soundEffects.playFanfare();
          setRecentNotification({
            id: Date.now().toString(),
            title: `Pencapaian Terbuka: ${meta.name}`,
            description: meta.description,
            type: 'achievement',
          });
        }
      }
    };

    if (current.totalXp >= 600) maybeUnlock('ocean-guardian');
    if (current.favoriteSpecies.length >= 3) maybeUnlock('marine-explorer');
    if (current.quizCompletedCount >= 1) maybeUnlock('quiz-master');
    if (current.gamesPlayed >= 1) maybeUnlock('plastic-fighter');

    if (hadNew) {
      return { ...current, unlockedAchievements: newUnlocked };
    }
    return current;
  };

  const addXp = (amount: number, reason: string) => {
    setProgress((prev) => {
      const newXp = prev.totalXp + amount;
      const updated = { ...prev, totalXp: newXp };
      const checked = checkAchievements(updated);

      setRecentNotification({
        id: Date.now().toString(),
        title: `+${amount} XP Diperoleh`,
        description: reason,
        type: 'xp',
      });

      return checked;
    });
  };

  const completeMission = (missionId: string, xpReward: number) => {
    setProgress((prev) => {
      if (prev.completedMissions.includes(missionId)) return prev;
      soundEffects.playChime(3);
      const updated = {
        ...prev,
        totalXp: prev.totalXp + xpReward,
        completedMissions: [...prev.completedMissions, missionId],
      };
      setRecentNotification({
        id: Date.now().toString(),
        title: `Misi Diselesaikan! (+${xpReward} XP)`,
        description: 'Aksi nyata Anda telah dicatat dalam log konservasi mandiri.',
        type: 'mission',
      });
      return checkAchievements(updated);
    });
  };

  const toggleFavorite = (speciesId: string) => {
    setProgress((prev) => {
      const exists = prev.favoriteSpecies.includes(speciesId);
      const updatedList = exists
        ? prev.favoriteSpecies.filter((id) => id !== speciesId)
        : [...prev.favoriteSpecies, speciesId];

      soundEffects.playBubblePop();
      const updated = { ...prev, favoriteSpecies: updatedList };
      return checkAchievements(updated);
    });
  };

  const recordQuizCompleted = (correctCount: number, totalQuestions: number, xpEarned: number) => {
    setProgress((prev) => {
      const updated = {
        ...prev,
        totalXp: prev.totalXp + xpEarned,
        quizCompletedCount: prev.quizCompletedCount + 1,
        quizTotalCorrect: prev.quizTotalCorrect + correctCount,
      };
      setRecentNotification({
        id: Date.now().toString(),
        title: `Kuis Selesai! (+${xpEarned} XP)`,
        description: `Anda menjawab ${correctCount} dari ${totalQuestions} pertanyaan dengan benar.`,
        type: 'xp',
      });
      return checkAchievements(updated);
    });
  };

  const recordGamePlayed = (score: number, xpEarned: number) => {
    setProgress((prev) => {
      const newHigh = Math.max(prev.gameHighScore, score);
      const updated = {
        ...prev,
        totalXp: prev.totalXp + xpEarned,
        gamesPlayed: prev.gamesPlayed + 1,
        gameHighScore: newHigh,
      };
      return checkAchievements(updated);
    });
  };

  const setUsername = (name: string) => {
    setProgress((prev) => ({ ...prev, username: name.trim() || 'Ocean Explorer' }));
  };

  const resetAllProgress = () => {
    setProgress(DEFAULT_PROGRESS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setRecentNotification({
      id: Date.now().toString(),
      title: 'Progres Direset',
      description: 'Seluruh riwayat penjelajah telah dikembalikan ke kondisi awal.',
      type: 'mission',
    });
  };

  const clearNotification = () => {
    setRecentNotification(null);
  };

  const levelInfo = getLevelInfo(progress.totalXp);

  return {
    progress,
    levelInfo,
    addXp,
    completeMission,
    toggleFavorite,
    recordQuizCompleted,
    recordGamePlayed,
    setUsername,
    resetAllProgress,
    recentNotification,
    clearNotification,
  };
}
