import React, { useState, useMemo } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
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

  const [reductionGoal, setReductionGoal] = useState<number>(50);
  const [showWhatIf, setShowWhatIf] = useState<boolean>(false);

  const footprint = useMemo(() => calculatePlasticFootprint(inputs), [inputs]);
  const reductionScenario = useMemo(
    () => calculateReductionSavings(footprint, reductionGoal),
    [footprint, reductionGoal]
  );

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
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] pt-28 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="space-y-3 max-w-3xl pb-6 border-b border-[var(--border-hairline)]">
          <div className="text-xs uppercase tracking-widest text-[var(--accent-teal)] font-semibold">
            Model UNEP &amp; Ellen MacArthur
          </div>
          <h1 className="font-display text-4xl sm:text-6xl text-[var(--text-primary)] tracking-tight">
            Kalkulator Jejak Plastik
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Hitung volume plastik tahunan, emisi karbon terkait, dan dampak penghematan jika beralih ke kebiasaan guna ulang.
          </p>
        </div>

        {/* OPEN 2-COLUMN EDITORIAL LAYOUT (Zero Widget Boxes) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT: Inputs (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
              <h2 className="font-display text-xl">Kebiasaan Harian</h2>
              <button
                onClick={handleReset}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-teal)] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="divide-y divide-[var(--border-hairline)]">
              <div className="py-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="input-bottles" className="font-medium">Botol Plastik / Hari</label>
                  <span className="font-semibold text-[var(--accent-teal)] tabular-nums">
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
                  className="w-full accent-[#367D7B] cursor-pointer"
                />
              </div>

              <div className="py-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="input-bags" className="font-medium">Kantong Belanja / Minggu</label>
                  <span className="font-semibold text-[var(--accent-teal)] tabular-nums">
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
                  className="w-full accent-[#367D7B] cursor-pointer"
                />
              </div>

              <div className="py-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="input-containers" className="font-medium">Wadah Makanan / Minggu</label>
                  <span className="font-semibold text-[var(--accent-teal)] tabular-nums">
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
                  className="w-full accent-[#367D7B] cursor-pointer"
                />
              </div>

              <label className="py-4 flex items-center justify-between cursor-pointer text-xs">
                <span>Rutin membawa botol tumbler sendiri</span>
                <input
                  type="checkbox"
                  checked={inputs.usesReusableBottle}
                  onChange={(e) => setInputs({ ...inputs, usesReusableBottle: e.target.checked })}
                  className="w-4 h-4 accent-[#367D7B] cursor-pointer"
                />
              </label>

              <label className="py-4 flex items-center justify-between cursor-pointer text-xs">
                <span>Memilah sampah daur ulang dengan benar</span>
                <input
                  type="checkbox"
                  checked={inputs.recyclesReliably}
                  onChange={(e) => setInputs({ ...inputs, recyclesReliably: e.target.checked })}
                  className="w-4 h-4 accent-[#367D7B] cursor-pointer"
                />
              </label>
            </div>

            <button
              onClick={handleWhatIfToggle}
              className={`w-full py-3 rounded-full font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                showWhatIf
                  ? 'bg-[var(--bg-surface)] text-[var(--accent-coral)]'
                  : 'bg-[#367D7B] hover:bg-[#267472] text-[#EDEBE3]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{showWhatIf ? 'Tutup Simulasi Reduksi' : 'Simulasi Pengurangan Plastik'}</span>
            </button>
          </div>

          {/* RIGHT: Clean Open Output (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pb-8 border-b border-[var(--border-hairline)]">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] block">
                  Estimasi Bulanan
                </span>
                <div className="text-4xl font-display text-[var(--text-primary)] tabular-nums mt-1">
                  {footprint.monthlyItems} <span className="text-sm text-[var(--text-muted)]">item</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {(footprint.monthlyItems / 30).toFixed(1)} item/hari
                </p>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] block">
                  Total Tahunan
                </span>
                <div className="text-4xl font-display text-[var(--accent-teal)] tabular-nums mt-1">
                  {footprint.yearlyItems.toLocaleString('id-ID')} <span className="text-sm text-[var(--text-muted)]">item</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {footprint.yearlyWeightKg} kg polimer
                </p>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] block">
                  Risiko Masuk Laut
                </span>
                <div className="text-4xl font-display text-[var(--accent-coral)] tabular-nums mt-1">
                  ~{footprint.oceanLeakageRiskKg} <span className="text-sm text-[var(--text-muted)]">kg</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {inputs.recyclesReliably ? 'Terkelola / Dipilah' : 'Risiko Tinggi'}
                </p>
              </div>
            </div>

            {/* Environmental Equivalents (Hairlines, Zero Boxes) */}
            <dl className="divide-y divide-[var(--border-hairline)] text-xs sm:text-sm">
              <div className="py-4 flex items-center justify-between gap-4">
                <dt className="text-[var(--text-secondary)]">Jejak Karbon Produksi Polimer</dt>
                <dd className="font-semibold text-[var(--text-primary)] tabular-nums">
                  {footprint.yearlyCo2Kg} kg CO₂e / tahun
                </dd>
              </div>
              <div className="py-4 flex items-center justify-between gap-4">
                <dt className="text-[var(--text-secondary)]">Setara Penyerapan Pohon Dewasa</dt>
                <dd className="font-semibold text-[var(--accent-teal)] tabular-nums">
                  {footprint.treesEquivalentToOffset} pohon / tahun
                </dd>
              </div>
            </dl>

            {/* WHAT-IF REDUCTION SECTION */}
            {showWhatIf && (
              <div className="pt-6 border-t border-[var(--border-hairline)] space-y-5 animate-in fade-in duration-150">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-xl">
                    Jika Mengurangi Plastik {reductionGoal}%
                  </h3>
                  <div className="flex gap-3 text-xs">
                    {[25, 50, 75].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setReductionGoal(pct)}
                        className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                          reductionGoal === pct
                            ? 'bg-[#367D7B] text-[#EDEBE3] font-semibold'
                            : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 text-xs">
                  <div>
                    <div className="text-[var(--text-muted)]">Item Dicegah</div>
                    <div className="text-2xl font-display text-[var(--accent-teal)] tabular-nums mt-0.5">
                      -{reductionScenario.savedYearlyItems}
                    </div>
                  </div>
                  <div>
                    <div className="text-[var(--text-muted)]">Bobot Hemat</div>
                    <div className="text-2xl font-display text-[var(--text-primary)] tabular-nums mt-0.5">
                      -{reductionScenario.savedKg} kg
                    </div>
                  </div>
                  <div>
                    <div className="text-[var(--text-muted)]">Emisi Dicegah</div>
                    <div className="text-2xl font-display text-[var(--accent-teal)] tabular-nums mt-0.5">
                      -{reductionScenario.savedCo2Kg} kg CO₂
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Asumsi UNEP &amp; Ellen MacArthur: botol PET ~20g, kantong ~6g, kemasan ~15g, emisi produksi ~2,5 kg CO₂e/kg resin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
