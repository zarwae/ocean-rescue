import React, { useState, useMemo } from 'react';
import { 
  RotateCcw, 
  Sparkles, 
  Trees
} from 'lucide-react';
import { calculatePlasticFootprint, calculateReductionSavings, PlasticInputs } from '../utils/calculatorLogic';
import { soundEffects } from '../utils/soundEffects';

interface CalculatorViewProps {
  onAwardXp?: (xp: number, reason: string) => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({ onAwardXp }) => {
  const [inputs, setInputs] = useState<PlasticInputs>({
    bottlesPerDay: 2,
    bagsPerWeek: 6,
    foodContainersPerWeek: 4,
    usesReusableBottle: false,
    recyclesReliably: false,
  });

  const [reductionGoal, setReductionGoal] = useState<number>(50); // percentage 25%, 50%, 75%
  const [showWhatIf, setShowWhatIf] = useState<boolean>(false);

  const footprint = useMemo(() => {
    return calculatePlasticFootprint(inputs);
  }, [inputs]);

  const reductionScenario = useMemo(() => {
    return calculateReductionSavings(footprint, reductionGoal);
  }, [footprint, reductionGoal]);

  const handleWhatIfToggle = () => {
    const newState = !showWhatIf;
    setShowWhatIf(newState);
    soundEffects.playBubblePop();
    if (newState && onAwardXp) {
      onAwardXp(25, 'Menganalisis skenario reduksi sampah plastik');
    }
  };

  const handleReset = () => {
    setInputs({
      bottlesPerDay: 1,
      bagsPerWeek: 3,
      foodContainersPerWeek: 2,
      usesReusableBottle: true,
      recyclesReliably: true,
    });
    soundEffects.playBubblePop();
  };

  return (
    <div className="min-h-screen bg-[#040D14] text-[#F1F5F9] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header - Editorial Style */}
        <div className="space-y-3 max-w-3xl">
          <div className="text-xs text-teal-400 font-medium tracking-wide">
            Kalkulator Dampak Lingkungan · Model UNEP
          </div>
          <h1 className="font-display text-4xl sm:text-6xl text-white tracking-tight">
            Kalkulator Jejak Plastik Samudra
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Hitung perkiraan volume sampah plastik tahunan Anda, emisi karbon yang dihasilkan, serta potensi penyelamatan ekosistem laut jika Anda beralih ke alternatif guna ulang.
          </p>
        </div>

        {/* CALCULATOR MAIN GRID: Inputs (5 cols) & Results (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: User Habit Inputs (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-6 shadow-xl backdrop-blur-md">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="font-display font-medium text-base text-white">
                Kebiasaan Penggunaan Plastik
              </h3>
              <button
                onClick={handleReset}
                className="text-xs font-mono text-slate-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
                title="Reset nilai default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Input 1: Bottles per day */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="input-bottles" className="font-medium text-slate-200">Botol Plastik Air Mineral / Hari</label>
                <span className="font-mono text-xs text-teal-300 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] tabular-nums">
                  {inputs.bottlesPerDay} botol
                </span>
              </div>
              <input
                id="input-bottles"
                type="range"
                min="0"
                max="8"
                step="1"
                value={inputs.bottlesPerDay}
                onChange={(e) => setInputs({ ...inputs, bottlesPerDay: Number(e.target.value) })}
                className="w-full accent-teal-400 cursor-pointer"
                aria-label="Botol Plastik per Hari"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0</span>
                <span>4 botol/hari</span>
                <span>8 botol/hari</span>
              </div>
            </div>

            {/* Input 2: Bags per week */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="input-bags" className="font-medium text-slate-200">Kantong Kresek Belanja / Minggu</label>
                <span className="font-mono text-xs text-teal-300 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] tabular-nums">
                  {inputs.bagsPerWeek} kantong
                </span>
              </div>
              <input
                id="input-bags"
                type="range"
                min="0"
                max="25"
                step="1"
                value={inputs.bagsPerWeek}
                onChange={(e) => setInputs({ ...inputs, bagsPerWeek: Number(e.target.value) })}
                className="w-full accent-teal-400 cursor-pointer"
                aria-label="Kantong Kresek per Minggu"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0</span>
                <span>12 kantong/minggu</span>
                <span>25 kantong/minggu</span>
              </div>
            </div>

            {/* Input 3: Food containers per week */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="input-containers" className="font-medium text-slate-200">Kemasan Makanan Sekali Pakai / Minggu</label>
                <span className="font-mono text-xs text-teal-300 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] tabular-nums">
                  {inputs.foodContainersPerWeek} wadah
                </span>
              </div>
              <input
                id="input-containers"
                type="range"
                min="0"
                max="20"
                step="1"
                value={inputs.foodContainersPerWeek}
                onChange={(e) => setInputs({ ...inputs, foodContainersPerWeek: Number(e.target.value) })}
                className="w-full accent-teal-400 cursor-pointer"
                aria-label="Kemasan Makanan per Minggu"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0</span>
                <span>10 wadah</span>
                <span>20 wadah</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-white/[0.08]">
              <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] cursor-pointer hover:border-white/20 transition-colors">
                <span className="text-xs text-slate-200">Rutin Membawa Botol Tumbler Sendiri</span>
                <input
                  type="checkbox"
                  checked={inputs.usesReusableBottle}
                  onChange={(e) => setInputs({ ...inputs, usesReusableBottle: e.target.checked })}
                  className="w-4 h-4 accent-teal-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] cursor-pointer hover:border-white/20 transition-colors">
                <span className="text-xs text-slate-200">Memilah Sampah Daur Ulang Secara Benar</span>
                <input
                  type="checkbox"
                  checked={inputs.recyclesReliably}
                  onChange={(e) => setInputs({ ...inputs, recyclesReliably: e.target.checked })}
                  className="w-4 h-4 accent-teal-400 cursor-pointer"
                />
              </label>
            </div>

            {/* What If Toggle Button */}
            <div className="pt-2">
              <button
                onClick={handleWhatIfToggle}
                className={`w-full py-2.5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  showWhatIf
                    ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300'
                    : 'bg-teal-400 text-slate-950 font-semibold hover:bg-teal-300 shadow-md shadow-teal-500/20'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{showWhatIf ? 'Tutup Skenario Reduksi' : 'Simulasi Pengurangan Sampah'}</span>
              </button>
            </div>

          </div>

          {/* RIGHT: Calculation Results & Environmental Impact (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Stat Summary Grid with Tabular Numerals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Estimasi Bulanan</span>
                <div className="text-3xl font-display font-medium text-white tabular-nums">
                  {footprint.monthlyItems} <span className="text-xs font-normal text-slate-500">item</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Sekitar {(footprint.monthlyItems / 30).toFixed(1)} item plastik/hari
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Total Tahunan</span>
                <div className="text-3xl font-display font-medium text-teal-300 tabular-nums">
                  {footprint.yearlyItems.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">item</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Bobot: {footprint.yearlyWeightKg} kg polimer murni
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Risiko Masuk Laut</span>
                <div className="text-3xl font-display font-medium text-rose-300 tabular-nums">
                  ~{footprint.oceanLeakageRiskKg} <span className="text-xs font-normal text-slate-500">kg</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {inputs.recyclesReliably ? 'Risiko Rendah (Dipilah)' : 'Risiko Tinggi (Tak Terkelola)'}
                </div>
              </div>

            </div>

            {/* Environmental Equivalents Card */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
              <h4 className="font-display font-medium text-base text-white flex items-center gap-2">
                <Trees className="w-4 h-4 text-emerald-400" />
                <span>Dampak Emisi Karbon & Beban Lingkungan</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="text-slate-500 font-mono text-[10px] uppercase">Jejak Karbon Pembuatan Plastik</div>
                  <div className="text-xl font-medium text-white font-mono tabular-nums">
                    {footprint.yearlyCo2Kg} kg CO₂e / tahun
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Emisi setara mengemudi motor sejauh ~{(footprint.yearlyCo2Kg * 8).toFixed(0)} km.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="text-slate-500 font-mono text-[10px] uppercase">Pohon Penyeimbang Emisi</div>
                  <div className="text-xl font-medium text-emerald-300 font-mono tabular-nums">
                    {footprint.treesEquivalentToOffset} pohon dewasa
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Menyerap emisi CO₂ polimer plastik Anda selama 1 tahun penuh.
                  </div>
                </div>
              </div>
            </div>

            {/* WHAT-IF REDUCTION SCENARIO SECTION */}
            {showWhatIf && (
              <div className="p-6 rounded-2xl bg-teal-500/[0.04] border border-teal-500/30 space-y-4 animate-in zoom-in-95 duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-teal-400 tracking-wider block">
                      Simulasi Perubahan Gaya Hidup
                    </span>
                    <h4 className="font-display font-medium text-lg text-white">
                      Jika Anda Mengurangi Plastik Sebesar {reductionGoal}%:
                    </h4>
                  </div>

                  {/* Goal Buttons */}
                  <div className="flex gap-1.5">
                    {[25, 50, 75].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setReductionGoal(pct)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                          reductionGoal === pct
                            ? 'bg-teal-400 text-slate-950 font-semibold'
                            : 'bg-white/[0.04] text-slate-300 hover:text-white'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Savings Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                    <span className="text-[10px] text-slate-500 block">SAMPAH TERCEGAH</span>
                    <span className="text-xl font-medium text-teal-300 tabular-nums">
                      -{reductionScenario.savedYearlyItems} item
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                    <span className="text-[10px] text-slate-500 block">BOBOT TERHEMAT</span>
                    <span className="text-xl font-medium text-emerald-300 tabular-nums">
                      -{reductionScenario.savedKg} kg
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                    <span className="text-[10px] text-slate-500 block">EMISI TERCEGAH</span>
                    <span className="text-xl font-medium text-teal-300 tabular-nums">
                      -{reductionScenario.savedCo2Kg} kg CO₂
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Langkah sederhana membawa tumbler dan tas belanja guna ulang dapat menyelamatkan rata-rata 160 botol plastik dan 300 kantong kresek per orang setiap tahun dari risiko mencemari pesisir.
                </p>
              </div>
            )}

            {/* Scientific Calculation Assumptions Note */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-500 space-y-1">
              <span className="font-medium text-slate-400 block font-mono">Asumsi Ilmiah Perhitungan:</span>
              <p className="leading-relaxed text-[11px]">
                Mengacu pada benchmark United Nations Environment Programme (UNEP) dan Ellen MacArthur Foundation: Berat rata-rata botol PET ~20g, kantong plastik ~6g, kemasan sachet/wadah ~15g. 1 kg produksi resin polimer plastik melepaskan ~2,5 kg CO₂e.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
