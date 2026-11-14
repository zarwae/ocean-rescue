import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { CrisisView } from './views/CrisisView';
import { ExplorerView } from './views/ExplorerView';
import { PlasticTrackerView } from './views/PlasticTrackerView';
import { SimulatorView } from './views/SimulatorView';
import { GameView } from './views/GameView';
import { KnowledgeView } from './views/KnowledgeView';
import { CalculatorView } from './views/CalculatorView';
import { MissionsView } from './views/MissionsView';
import { DashboardView } from './views/DashboardView';
import { QuizView } from './views/QuizView';
import { DataView } from './views/DataView';
import { NewsView } from './views/NewsView';
import { useUserProgress } from './hooks/useUserProgress';
import { useTheme } from './hooks/useTheme';
import { Sparkles, X, Award } from 'lucide-react';
import { UnderwaterAtmosphere } from './components/UnderwaterAtmosphere';
import { AquaAIWidget } from './components/AquaAIWidget';
import { FishCursor } from './components/FishCursor';
import { soundEffects } from './utils/soundEffects';

const VALID_TABS: readonly ActiveTab[] = [
  'home',
  'crisis',
  'explorer',
  'tracker',
  'simulator',
  'game',
  'knowledge',
  'calculator',
  'missions',
  'dashboard',
  'quiz',
  'data',
  'news',
];

function isValidTab(value: string | null): value is ActiveTab {
  return value !== null && (VALID_TABS as readonly string[]).includes(value);
}

function getInitialTabFromUrl(): ActiveTab {
  if (typeof window === 'undefined') return 'home';
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab');
  if (isValidTab(tabParam)) return tabParam;
  if (params.get('autostart')) return 'explorer';
  return 'home';
}

function getInitialAquaOpenFromUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('tab') === 'aqua-ai';
}

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(getInitialTabFromUrl);
  const [isAquaChatOpen, setIsAquaChatOpen] = useState<boolean>(getInitialAquaOpenFromUrl);
  const [isMuted, setIsMuted] = useState(soundEffects.isMuted);
  const { theme, toggleTheme } = useTheme();

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEffects.isMuted = next;
    if (!next) {
      soundEffects.playBubblePop();
    }
  };

  const {
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
  } = useUserProgress();

  // Sync browser Back/Forward history navigation
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getInitialTabFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Auto-dismiss notification after 4.5 seconds
  useEffect(() => {
    if (!recentNotification) return;
    const timer = setTimeout(() => {
      clearNotification();
    }, 4500);
    return () => clearTimeout(timer);
  }, [recentNotification]);

  const handleTabSwitch = (tab: ActiveTab) => {
    setActiveTab(tab);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('autostart');
      if (tab === 'home') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', tab);
      }
      window.history.pushState({ tab }, '', url.toString());
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[#367D7B] selection:text-[#EDEBE3] relative transition-colors duration-300">
      {/* Global Desktop Maritime Fish Cursor */}
      <FishCursor />

      {/* Subtle Ambient Atmosphere */}
      <UnderwaterAtmosphere hideBackToTop={isAquaChatOpen} />

      {/* Clean Minimalist Top Bar with Theme Switch */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleTabSwitch}
        onOpenAquaChat={() => setIsAquaChatOpen(true)}
        levelTitle={levelInfo.title}
        levelNumber={levelInfo.level}
        totalXp={progress.totalXp}
        progressPercent={levelInfo.progressPercent}
        isMuted={isMuted}
        onToggleSound={toggleSound}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Quiet Toast Notification (Zero heavy borders) */}
      {recentNotification && (
        <aside
          aria-label="Notifikasi Progres"
          className="liquid-glass fixed bottom-6 left-6 z-50 p-4 rounded-2xl max-w-sm flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="w-8 h-8 rounded-full bg-[#367D7B]/15 flex items-center justify-center text-[var(--accent-teal)] shrink-0 mt-0.5">
            {recentNotification.type === 'achievement' ? (
              <Award className="w-4 h-4 text-[var(--accent-sand)]" />
            ) : (
              <Sparkles className="w-4 h-4 text-[var(--accent-teal)]" />
            )}
          </div>

          <div className="flex-1 space-y-0.5">
            <h4 className="font-display font-medium text-xs text-[var(--text-primary)]">
              {recentNotification.title}
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              {recentNotification.description}
            </p>
          </div>

          <button
            onClick={clearNotification}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* Main View Container */}
      <main className="flex-grow" key={activeTab}>
        {activeTab === 'home' && <HomeView onNavigate={handleTabSwitch} theme={theme} />}
        {activeTab === 'crisis' && <CrisisView onNavigate={handleTabSwitch} />}
        {activeTab === 'explorer' && (
          <ExplorerView
            favoriteSpecies={progress.favoriteSpecies}
            onToggleFavorite={toggleFavorite}
          />
        )}
        {activeTab === 'tracker' && <PlasticTrackerView onAwardXp={addXp} theme={theme} />}
        {activeTab === 'simulator' && <SimulatorView onAwardXp={addXp} theme={theme} />}
        {activeTab === 'game' && <GameView onAwardXp={addXp} onRecordGame={recordGamePlayed} theme={theme} />}
        {activeTab === 'knowledge' && <KnowledgeView />}
        {activeTab === 'calculator' && <CalculatorView onAwardXp={addXp} />}
        {activeTab === 'missions' && (
          <MissionsView
            completedMissions={progress.completedMissions}
            onCompleteMission={completeMission}
            totalXp={progress.totalXp}
          />
        )}
        {activeTab === 'dashboard' && (
          <DashboardView
            progress={progress}
            onSetUsername={setUsername}
            onResetProgress={resetAllProgress}
            onNavigate={handleTabSwitch}
          />
        )}
        {activeTab === 'quiz' && (
          <QuizView onRecordQuizCompleted={recordQuizCompleted} />
        )}
        {activeTab === 'data' && <DataView />}
        {activeTab === 'news' && (
          <NewsView defaultAuthorName={progress.username} onAwardXp={addXp} />
        )}
      </main>

      {/* Global Floating Liquid Glass Aqua AI Chat Widget */}
      <AquaAIWidget
        isOpen={isAquaChatOpen}
        onOpen={() => setIsAquaChatOpen(true)}
        onClose={() => setIsAquaChatOpen(false)}
        activeTab={activeTab}
      />

      {/* Editorial Footer */}
      <Footer onSelectTab={handleTabSwitch} onOpenAquaChat={() => setIsAquaChatOpen(true)} />
    </div>
  );
}

export default App;
