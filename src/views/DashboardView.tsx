import React, { useState } from 'react';
import { Award, Compass, Edit2, Check, Trash2 } from 'lucide-react';
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
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] pt-28 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-14">

        {/* Open Passport Header */}
        <section className="pb-8 border-b border-[var(--border-hairline)] space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--accent-teal-bg)] flex items-center justify-center text-[var(--accent-teal)] shrink-0">
                <Compass className="w-7 h-7 stroke-[1.6]" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                        className="px-2 py-1 bg-transparent border-b border-[var(--accent-teal)] text-base text-[var(--text-primary)] focus:outline-none"
                      />
                      <button
                        onClick={handleSaveName}
                        className="p-1.5 rounded-full bg-[#367D7B] text-[#EDEBE3] cursor-pointer"
                        aria-label="Simpan Nama"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1 className="font-display font-light text-2xl sm:text-4xl text-[var(--text-primary)] tracking-tight">
                        {progress.username}
                      </h1>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                        title="Ubah nama penjelajah"
                        aria-label="Ubah Nama"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span className="text-[var(--accent-teal)] font-medium">
                    Level {levelInfo.level} · {levelInfo.title}
                  </span>
                  <span>·</span>
                  <span className="tabular-nums">ID #{progress.totalXp.toString().padStart(5, '0')}</span>
                </div>
              </div>
            </div>

            <div className="text-left md:text-right space-y-1">
              <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)] block">
                Total Reputasi
              </span>
              <div className="text-3xl sm:text-4xl font-display font-light text-[var(--accent-sand)] tabular-nums">
                {progress.totalXp.toLocaleString('id-ID')}{' '}
                <span className="text-sm font-sans text-[var(--text-muted)]">XP</span>
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                {levelInfo.level < 5
                  ? `Butuh ${levelInfo.nextLevelXp - progress.totalXp} XP menuju Level ${levelInfo.level + 1}`
                  : 'Peringkat Tertinggi Samudra Tercapai'}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Progres Level {levelInfo.level}</span>
              <span className="text-[var(--accent-teal)] font-medium tabular-nums">
                {levelInfo.progressPercent}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--bg-surface)] overflow-hidden">
              <div
                className="h-full bg-[#367D7B] transition-all duration-500 rounded-full"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
          </div>
        </section>

        {/* Open Typographic 4-Metric Strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-[var(--border-hairline)]">
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Misi Selesai</div>
            <div className="font-display font-light text-3xl text-[var(--text-primary)] tabular-nums mt-1">
              {progress.completedMissions.length}
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">Aksi Konservasi Nyata</div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Kuis Benar</div>
            <div className="font-display font-light text-3xl text-[var(--text-primary)] tabular-nums mt-1">
              {progress.quizTotalCorrect}
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">
              {progress.quizCompletedCount} Sesi Kuis Selesai
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Highscore Game</div>
            <div className="font-display font-light text-3xl text-[var(--text-primary)] tabular-nums mt-1">
              {progress.gameHighScore}
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">
              {progress.gamesPlayed} Kali Dimainkan
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Spesies Favorit</div>
            <div className="font-display font-light text-3xl text-[var(--text-primary)] tabular-nums mt-1">
              {progress.favoriteSpecies.length}
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">Biota Tersimpan</div>
          </div>
        </section>

        {/* Unboxed Achievements Archive */}
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--accent-teal)] font-medium">
              Lencana Kehormatan
            </span>
            <h2 className="font-display font-light text-2xl sm:text-3xl text-[var(--text-primary)]">
              Pencapaian Konservasi ({progress.unlockedAchievements.length} / {ACHIEVEMENTS_LIST.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
            {ACHIEVEMENTS_LIST.map((ach) => {
              const isUnlocked = progress.unlockedAchievements.includes(ach.id);

              return (
                <div
                  key={ach.id}
                  className={`pt-5 border-t border-[var(--border-hairline)] space-y-2 transition-opacity ${
                    isUnlocked ? '' : 'opacity-45'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-[var(--accent-teal)]">
                      <Award className="w-3.5 h-3.5" />
                      {isUnlocked ? 'Terbuka' : 'Terkunci'}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {ach.conditionDescription}
                    </span>
                  </div>
                  <h3 className="font-display font-medium text-base text-[var(--text-primary)]">
                    {ach.name}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Favorite Species Showcase */}
        <section className="space-y-6 pt-6 border-t border-[var(--border-hairline)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display font-light text-2xl text-[var(--text-primary)]">
              Spesies Favorit Tersimpan ({favoriteSpeciesData.length})
            </h2>
            <button
              onClick={() => onNavigate('explorer')}
              className="text-xs font-medium text-[var(--accent-teal)] hover:underline cursor-pointer whitespace-nowrap"
            >
              Buka Biota Samudra &rarr;
            </button>
          </div>

          {favoriteSpeciesData.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] py-4">
              Belum ada spesies favorit yang ditandai. Kunjungi halaman Biota Samudra dan tekan ikon hati untuk menyimpan.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {favoriteSpeciesData.map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => onNavigate('explorer')}
                  className="text-left group cursor-pointer space-y-2"
                >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[var(--bg-surface)]">
                    <ImageWithFallback
                      src={sp.imageUrl}
                      alt={sp.commonName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-xs text-[var(--text-primary)] truncate group-hover:text-[var(--accent-teal)] transition-colors">
                      {sp.commonName}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] italic truncate">
                      {sp.scientificName}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Subtle Reset Control */}
        <footer className="pt-8 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            Progres dan pencapaian tersimpan secara lokal di peramban perangkat Anda.
          </p>

          {showResetConfirm ? (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[var(--accent-coral)]">Reset semua progres?</span>
              <button
                onClick={() => {
                  onResetProgress();
                  setShowResetConfirm(false);
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#D98270] text-[#061116] font-semibold cursor-pointer"
              >
                Ya, Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent-coral)] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Progres</span>
            </button>
          )}
        </footer>

      </div>
    </div>
  );
};
