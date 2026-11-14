import React, { useState } from 'react';
import { Clock, Check, CheckSquare } from 'lucide-react';
import { INITIAL_MISSIONS } from '../data/missionsData';

interface MissionsViewProps {
  completedMissions: string[];
  onCompleteMission: (id: string, xpReward: number) => void;
  totalXp: number;
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  completedMissions,
  onCompleteMission,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'daily' | 'weekly'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categories = ['Semua', 'Reduksi Plastik', 'Edukasi & Riset', 'Aksi Komunitas', 'Konsumsi Bijak'];

  const filteredMissions = INITIAL_MISSIONS.filter((m) => {
    const matchTab = activeTab === 'all' || m.type === activeTab;
    const matchCat = selectedCategory === 'Semua' || m.category === selectedCategory;
    return matchTab && matchCat;
  });

  const dailyCount = INITIAL_MISSIONS.filter((m) => m.type === 'daily').length;
  const completedDailyCount = INITIAL_MISSIONS.filter((m) => m.type === 'daily' && completedMissions.includes(m.id)).length;

  const weeklyCount = INITIAL_MISSIONS.filter((m) => m.type === 'weekly').length;
  const completedWeeklyCount = INITIAL_MISSIONS.filter((m) => m.type === 'weekly' && completedMissions.includes(m.id)).length;

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] pt-28 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Editorial Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[var(--border-hairline)]">
          <div className="space-y-3 max-w-2xl">
            <div className="text-[11px] font-medium tracking-[0.22em] text-[var(--accent-teal)] uppercase">
              Aksi Nyata &amp; Log Konservasi · SDG 14
            </div>
            <h1 className="font-display font-light text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight">
              Misi Konservasi Harian
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Mulai dari langkah kecil di rumah dan sekolah. Pencatatan bersifat mandiri atas komitmen pribadi Anda sebagai penjaga laut.
            </p>
          </div>

          <div className="text-left md:text-right shrink-0">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Total Selesai
            </div>
            <div className="text-3xl font-light font-display text-[var(--text-primary)] tabular-nums mt-0.5">
              {completedMissions.length}{' '}
              <span className="text-sm font-sans text-[var(--text-muted)]">
                / {INITIAL_MISSIONS.length} misi
              </span>
            </div>
          </div>
        </header>

        {/* Clean Underline Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-6 overflow-x-auto">
            {[
              { id: 'all' as const, label: `Semua (${INITIAL_MISSIONS.length})` },
              { id: 'daily' as const, label: `Harian (${completedDailyCount}/${dailyCount})` },
              { id: 'weekly' as const, label: `Mingguan (${completedWeeklyCount}/${weeklyCount})` },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer relative ${
                    active
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label}
                  {active && (
                    <span className="absolute bottom-0 inset-x-0 h-[1.5px] bg-[var(--accent-teal)]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pb-2.5 sm:pb-3 shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter kategori misi"
              className="bg-transparent text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option
                  key={c}
                  value={c}
                  className="bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                >
                  {c === 'Semua' ? 'Semua Kategori' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Unboxed Airy Editorial Mission List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {filteredMissions.map((mission) => {
            const isCompleted = completedMissions.includes(mission.id);

            return (
              <article
                key={mission.id}
                className={`pt-6 border-t border-[var(--border-hairline)] flex flex-col justify-between gap-5 transition-opacity ${
                  isCompleted ? 'opacity-65' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em]">
                    <span className={mission.type === 'daily' ? 'text-[var(--accent-teal)]' : 'text-[var(--accent-sand)]'}>
                      {mission.type === 'daily' ? 'Misi Harian' : 'Tantangan Mingguan'}
                    </span>
                    <span className="text-[var(--text-muted)]">
                      {mission.category}
                    </span>
                  </div>

                  <h2
                    className={`font-display font-light text-xl leading-snug ${
                      isCompleted ? 'text-[var(--accent-teal)] line-through' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {mission.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {mission.description}
                  </p>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    <span className="font-medium text-[var(--text-primary)]">Panduan: </span>
                    {mission.actionGuidance}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] tabular-nums">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
                      {mission.estimatedTime}
                    </span>
                    <span className="font-semibold text-[var(--accent-sand)]">
                      +{mission.xpReward} XP
                    </span>
                  </div>

                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-teal)] whitespace-nowrap">
                      <Check className="w-3.5 h-3.5" />
                      <span>Selesai</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onCompleteMission(mission.id, mission.xpReward)}
                      className="px-4 py-2 rounded-full bg-[#367D7B] hover:bg-[#267472] text-[#EDEBE3] text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Tandai Selesai</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

      </div>
    </div>
  );
};
