import React, { useState } from 'react';
import { 
  Award, 
  Compass, 
  CheckSquare, 
  Gamepad2, 
  Heart, 
  HelpCircle, 
  Edit2,
  Check,
  Trash2
} from 'lucide-react';
import { UserProgress, getLevelInfo } from '../hooks/useUserProgress';
import { ACHIEVEMENTS_LIST } from '../data/missionsData';
import { SPECIES_DATABASE } from '../data/speciesData';
import { ActiveTab } from '../components/Navbar';
import { soundEffects } from '../utils/soundEffects';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface DashboardViewProps {
  progress: UserProgress;
  onSetUsername: (name: string) => void;
  onResetProgress: () => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
  onSetUsername,
  onResetProgress,
  onNavigate,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(progress.username);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const levelInfo = getLevelInfo(progress.totalXp);

  const handleSaveName = () => {
    onSetUsername(nameInput);
    setIsEditingName(false);
    soundEffects.playBubblePop();
  };

  const favoriteSpeciesData = SPECIES_DATABASE.filter((s) => progress.favoriteSpecies.includes(s.id));

  return (
    <div className="min-h-screen bg-[#040D14] text-[#F1F5F9] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Passport Card with Softer Borders */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* User Avatar & Title */}
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400 shrink-0">
                <Compass className="w-8 h-8 stroke-[1.75]" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="px-3 py-1 rounded-lg bg-white/[0.04] border border-teal-400 text-sm text-white focus:outline-none"
                      />
                      <button
                        onClick={handleSaveName}
                        className="p-1.5 rounded-lg bg-teal-400 text-slate-950 cursor-pointer"
                        aria-label="Simpan Nama"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1 className="font-display font-medium text-2xl sm:text-3xl text-white">
                        {progress.username}
                      </h1>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Ubah nama penjelajah"
                        aria-label="Ubah Nama"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-teal-300 font-medium">
                    LEVEL {levelInfo.level} · {levelInfo.title}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">
                    ID #{progress.totalXp.toString().padStart(5, '0')}
                  </span>
                </div>
              </div>
            </div>

            {/* Total XP Counter */}
            <div className="text-left md:text-right space-y-1 border-t md:border-t-0 pt-4 md:pt-0 border-white/[0.08]">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Akumulasi Total Reputasi</span>
              <div className="text-4xl font-display font-medium text-teal-300 tabular-nums">
                {progress.totalXp.toLocaleString('id-ID')} <span className="text-sm font-normal text-slate-400">XP</span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {levelInfo.level < 5 
                  ? `Butuh ${levelInfo.nextLevelXp - progress.totalXp} XP lagi menuju Level ${levelInfo.level + 1}`
                  : 'Peringkat Tertinggi Samudra Tercapai!'}
              </div>
            </div>

          </div>

          {/* Level Progress Bar */}
          <div className="mt-8 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span>Progress Level {levelInfo.level}</span>
              <span className="text-teal-400 font-medium tabular-nums">{levelInfo.progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-300 transition-all duration-500 rounded-full"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
          </div>

        </div>

        {/* 4 Performance Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-mono uppercase">Misi Selesai</span>
              <CheckSquare className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-display font-medium text-white tabular-nums">
              {progress.completedMissions.length}
            </div>
            <div className="text-[11px] text-slate-500">Aksi Konservasi Nyata</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-mono uppercase">Kuis Dijawab</span>
              <HelpCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-display font-medium text-white tabular-nums">
              {progress.quizTotalCorrect}
            </div>
            <div className="text-[11px] text-slate-500">{progress.quizCompletedCount} Sesi Kuis Selesai</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-mono uppercase">Highscore Game</span>
              <Gamepad2 className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-display font-medium text-white tabular-nums">
              {progress.gameHighScore}
            </div>
            <div className="text-[11px] text-slate-500">{progress.gamesPlayed} Kali Dimainkan</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-mono uppercase">Spesies Favorit</span>
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            </div>
            <div className="text-2xl font-display font-medium text-white tabular-nums">
              {progress.favoriteSpecies.length}
            </div>
            <div className="text-[11px] text-slate-500">Biota Disimpan di Museum</div>
          </div>

        </div>

        {/* ACHIEVEMENTS GRID */}
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs text-teal-400 font-medium tracking-wide">
              Lencana Kehormatan & Pencapaian
            </span>
            <h3 className="font-display font-medium text-2xl text-white">
              Pencapaian Konservasi ({progress.unlockedAchievements.length} / {ACHIEVEMENTS_LIST.length} Terbuka)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ACHIEVEMENTS_LIST.map((ach) => {
              const isUnlocked = progress.unlockedAchievements.includes(ach.id);

              return (
                <div
                  key={ach.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isUnlocked
                      ? 'bg-white/[0.03] border-teal-400/40 shadow-lg'
                      : 'bg-white/[0.01] border-white/[0.05] opacity-50 grayscale'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                        isUnlocked ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-white/[0.03] text-slate-500'
                      }`}>
                        <Award className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        isUnlocked ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/[0.04] text-slate-500'
                      }`}>
                        {isUnlocked ? 'Terbuka' : 'Terkunci'}
                      </span>
                    </div>

                    <h4 className="font-display font-medium text-sm text-white">
                      {ach.name}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono pt-2 border-t border-white/[0.06]">
                    Syarat: {ach.conditionDescription}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAVORITE SPECIES QUICK SHOWCASE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-medium text-2xl text-white">
              Spesies Favorit Tersimpan ({favoriteSpeciesData.length})
            </h3>
            <button
              onClick={() => onNavigate('explorer')}
              className="text-xs font-medium text-teal-400 hover:underline cursor-pointer"
            >
              Buka Semua di Museum &rarr;
            </button>
          </div>

          {favoriteSpeciesData.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.08] text-xs text-slate-500">
              Belum ada spesies favorit yang ditandai. Kunjungi Museum Spesies Laut dan tekan ikon hati untuk menyimpan!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {favoriteSpeciesData.map((sp) => (
                <div
                  key={sp.id}
                  onClick={() => onNavigate('explorer')}
                  className="rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02] hover:border-teal-400/50 cursor-pointer group transition-all"
                >
                  <div className="h-32 overflow-hidden relative">
                    <ImageWithFallback
                      src={sp.imageUrl}
                      alt={sp.commonName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-teal-300">
                      {sp.category}
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="font-medium text-xs text-white truncate">{sp.commonName}</div>
                    <div className="text-[11px] text-slate-500 italic font-mono truncate">{sp.scientificName}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RESET PROGRESS SECTION */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 leading-relaxed">
            Data progres, pencapaian, dan level tersimpan di penyimpanan lokal peramban (localStorage) perangkat Anda.
          </div>

          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-400 font-mono">Yakin reset semua progres?</span>
              <button
                onClick={() => {
                  onResetProgress();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-semibold cursor-pointer"
              >
                Ya, Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-slate-300 cursor-pointer"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.1] hover:border-rose-400/50 text-xs font-medium text-slate-400 hover:text-rose-400 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Progres Penjelajah</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
