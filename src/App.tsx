import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { CrisisView } from './views/CrisisView';
import { ExplorerView } from './views/ExplorerView';
import { SimulatorView } from './views/SimulatorView';
import { GameView } from './views/GameView';
import { AquaAIView } from './views/AquaAIView';
import { KnowledgeView } from './views/KnowledgeView';
import { CalculatorView } from './views/CalculatorView';
import { MissionsView } from './views/MissionsView';
import { DashboardView } from './views/DashboardView';
import { QuizView } from './views/QuizView';
import { DataView } from './views/DataView';
import { useUserProgress } from './hooks/useUserProgress';
import { Sparkles, X, Award, CheckCircle2 } from 'lucide-react';
import { UnderwaterAtmosphere } from './components/UnderwaterAtmosphere';
import { soundEffects } from './utils/soundEffects';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isMuted, setIsMuted] = useState(soundEffects.isMuted);

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

  // Handle URL hash or autostart query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const autostart = params.get('autostart');
    if (autostart) {
      setActiveTab('explorer');
    }
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#040D14] text-[#F4F7F5] flex flex-col font-sans selection:bg-[#35C6C0] selection:text-[#031019] relative">
      
      {/* Living Underwater Atmosphere & Depth HUD */}
      <UnderwaterAtmosphere isMuted={isMuted} onToggleSound={toggleSound} />

      {/* Navbar with Level Badge & Audio controls */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleTabSwitch}
        levelTitle={levelInfo.title}
        levelNumber={levelInfo.level}
        totalXp={progress.totalXp}
      />

      {/* Floating XP / Achievement Toast Notification */}
      {recentNotification && (
        <aside
          aria-label="Notifikasi Progres"
          className="fixed bottom-6 left-6 z-50 p-4 rounded-xl bg-[#02080D]/95 border border-white/[0.12] shadow-2xl backdrop-blur-md max-w-sm flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
            {recentNotification.type === 'achievement' ? (
              <Award className="w-4 h-4 text-amber-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-teal-400" />
            )}
          </div>

          <div className="flex-1 space-y-0.5">
            <h4 className="font-display font-medium text-xs text-white">
              {recentNotification.title}
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {recentNotification.description}
            </p>
          </div>

          <button
            onClick={clearNotification}
            className="text-slate-500 hover:text-white p-1 cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* Main View Container */}
      <main className="flex-grow">
        {activeTab === 'home' && <HomeView onNavigate={handleTabSwitch} />}
        {activeTab === 'crisis' && <CrisisView onNavigate={handleTabSwitch} />}
        {activeTab === 'explorer' && (
          <ExplorerView
            favoriteSpecies={progress.favoriteSpecies}
            onToggleFavorite={toggleFavorite}
          />
        )}
        {activeTab === 'simulator' && <SimulatorView onAwardXp={addXp} />}
        {activeTab === 'game' && <GameView onAwardXp={addXp} onRecordGame={recordGamePlayed} />}
        {activeTab === 'aqua-ai' && <AquaAIView />}
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
      </main>

      {/* Editorial Footer */}
      <Footer onSelectTab={handleTabSwitch} />

    </div>
  );
}

export default App;
