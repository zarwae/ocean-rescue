import React, { useState } from 'react';
import { 
  CheckSquare, 
  Sparkles, 
  Clock, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Info,
  Calendar,
  Layers,
  Check
} from 'lucide-react';
import { INITIAL_MISSIONS, Mission } from '../data/missionsData';
import { soundEffects } from '../utils/soundEffects';

interface MissionsViewProps {
  completedMissions: string[];
  onCompleteMission: (id: string, xpReward: number) => void;
  totalXp: number;
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  completedMissions,
  onCompleteMission,
  totalXp,
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
    <div className="min-h-screen bg-[#02080D] text-slate-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-3 max-w-2xl">
            <div className="text-[11px] font-mono tracking-widest text-cyan-400/90 uppercase">
              Aksi Nyata & Log Konservasi · SDG 14
            </div>
            <h1 className="font-display font-light text-3xl sm:text-5xl text-white tracking-tight">
              Misi Konservasi Harian & Tantangan
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Mulai dari langkah kecil di kehidupan sekolah dan rumah. Setiap aksi yang Anda selesaikan menyumbang XP untuk menaikkan reputasi penjelajah Anda.
            </p>
          </div>

          {/* Progress summary */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md flex items-center gap-4 shrink-0">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-300">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Total Selesai</div>
              <div className="text-xl font-light font-display text-white">
                {completedMissions.length} <span className="text-xs font-mono text-slate-500">/ {INITIAL_MISSIONS.length} misi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Self-Reporting Transparency Notice */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-start gap-3 text-xs text-slate-400 leading-relaxed">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-200 font-medium font-mono text-[11px] block mb-0.5">
              Integritas & Pelaporan Aksi Mandiri (Self-Reported Actions)
            </span>
            Penyelesaian misi di platform ini dicatat berdasarkan kejujuran dan komitmen mandiri Anda sebagai penjelajah laut, bukan diverifikasi oleh sensor otomatis. Jadikan misi ini sebagai kebiasaan gaya hidup nyata.
          </div>
        </div>

        {/* Filter and Tab Selectors */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
          
          {/* Tab selector */}
          <div className="flex gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Misi ({INITIAL_MISSIONS.length})
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'daily'
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Harian ({completedDailyCount}/{dailyCount})
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'weekly'
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mingguan ({completedWeeklyCount}/{weeklyCount})
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-60">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#03090F] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-cyan-400/50"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'Semua' ? 'Semua Kategori Aksi' : c}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Missions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMissions.map((mission) => {
            const isCompleted = completedMissions.includes(mission.id);

            return (
              <div
                key={mission.id}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-5 ${
                  isCompleted
                    ? 'bg-white/[0.01] border-emerald-500/30 opacity-75'
                    : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.18]'
                }`}
              >
                <div className="space-y-3.5">
                  
                  {/* Top Metadata */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className={mission.type === 'daily' ? 'text-cyan-400' : 'text-amber-300'}>
                      {mission.type === 'daily' ? 'Misi Harian' : 'Tantangan Mingguan'}
                    </span>
                    <span className="text-slate-500">
                      {mission.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className={`font-display font-light text-base sm:text-lg leading-snug ${
                      isCompleted ? 'text-emerald-300 line-through' : 'text-white'
                    }`}>
                      {mission.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {mission.description}
                    </p>
                  </div>

                  {/* Action Guidance */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-400 leading-relaxed">
                    <span className="text-cyan-300 font-mono text-[10px] uppercase tracking-wider block mb-0.5">
                      Panduan Pelaksanaan
                    </span>
                    {mission.actionGuidance}
                  </div>

                  {/* Meta stats */}
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400/80" />
                      {mission.estimatedTime}
                    </span>
                    <span className="font-semibold text-cyan-300">
                      +{mission.xpReward} XP
                    </span>
                  </div>
                </div>

                {/* Complete Button */}
                <div>
                  {isCompleted ? (
                    <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-300 flex items-center justify-center gap-2 font-mono">
                      <Check className="w-4 h-4" />
                      <span>Misi Dituntaskan</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onCompleteMission(mission.id, mission.xpReward)}
                      className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.12] hover:border-cyan-400/60 hover:text-cyan-300 text-xs font-medium text-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Tandai Selesai (+{mission.xpReward} XP)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
