import React, { useState, useRef } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  MoveHorizontal,
} from 'lucide-react';
import { ActiveTab } from '../components/Navbar';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface CrisisViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

const CRISIS_TABS: {
  id: 'plastic' | 'overfishing' | 'bleaching' | 'acidification' | 'habitat';
  label: string;
}[] = [
  { id: 'plastic', label: 'Polusi Plastik' },
  { id: 'overfishing', label: 'Overfishing' },
  { id: 'bleaching', label: 'Coral Bleaching' },
  { id: 'acidification', label: 'Pengasaman Laut' },
  { id: 'habitat', label: 'Kerusakan Habitat' },
];

export const CrisisView: React.FC<CrisisViewProps> = ({ onNavigate }) => {
  const [activeStory, setActiveStory] = useState<'plastic' | 'overfishing' | 'bleaching' | 'acidification' | 'habitat'>('plastic');
  const [beforeAfterSplit, setBeforeAfterSplit] = useState<number>(50);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const updatePosition = (clientX: number) => {
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      setBeforeAfterSplit(Math.round((x / rect.width) * 100));
    };
    updatePosition(e.clientX);

    const onPointerMove = (ev: PointerEvent) => updatePosition(ev.clientX);
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] pt-28 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Clean Editorial Header */}
        <div className="space-y-3 max-w-3xl">
          <div className="text-xs uppercase tracking-widest text-[var(--accent-coral)] font-semibold">
            Anatomi Krisis · 5 Ancaman Utama
          </div>
          <h1 className="font-display text-4xl sm:text-6xl text-[var(--text-primary)] tracking-tight">
            Anatomi Krisis Samudra Raya
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Menelusuri lima tekanan terbesar manusia yang mengubah tatanan kimiawi, termal, dan keanekaragaman hayati samudra bumi.
          </p>
        </div>

        {/* Clean Underline Tab Strip (Zero Bordered Cards) */}
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none border-b border-[var(--border-hairline)]">
          {CRISIS_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveStory(t.id)}
              className={`pb-3.5 text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer border-b-2 -mb-px transition-colors ${
                activeStory === t.id
                  ? 'border-[var(--accent-coral)] text-[var(--text-primary)] font-semibold'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* STORY 1: PLASTIC POLLUTION */}
        {activeStory === 'plastic' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in fade-in duration-200">
            <div className="lg:col-span-7 space-y-7">
              <div>
                <span className="text-xs text-[var(--accent-coral)] uppercase tracking-wider font-semibold block">
                  01 · Polusi Plastik &amp; Mikroplastik
                </span>
                <h2 className="font-display text-2xl sm:text-4xl text-[var(--text-primary)] mt-1">
                  Gelombang Polimer Abadi di Jantung Samudra
                </h2>
              </div>

              <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                <p>
                  Plastik diciptakan untuk bertahan sangat lama, namun sepertiga produksi global dirancang untuk sekali pakai. Melalui sungai dan saluran kota, lebih dari 11 juta metrik ton plastik mengalir ke laut setiap tahun.
                </p>
                <p>
                  Radiasi matahari dan ombak memecah plastik menjadi mikroplastik (&lt;5 mm) yang menyerap racun organik, lalu tertelan zooplankton, ikan, dan penyu.
                </p>
              </div>

              {/* Open 4-Step Migration Flow (Hairline Top Only, Zero Boxes) */}
              <div className="pt-4 border-t border-[var(--border-hairline)] space-y-3">
                <h4 className="text-xs font-semibold text-[var(--accent-teal)] uppercase tracking-wider">
                  Jalur Migrasi Polutan
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">1. Sumber Darat</div>
                    <p className="text-[var(--text-muted)] mt-1">80% berasal dari limbah darat tak terkelola.</p>
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">2. Aliran Sungai</div>
                    <p className="text-[var(--text-muted)] mt-1">Mengalir cepat dari muara menuju teluk pesisir.</p>
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">3. Pusaran Gyre</div>
                    <p className="text-[var(--text-muted)] mt-1">Terjebak arus siklonik di 5 zona samudra.</p>
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">4. Palung Dalam</div>
                    <p className="text-[var(--text-muted)] mt-1">Tenggelam ke sedimen zona abisal.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-hairline)] space-y-2.5">
                <h4 className="font-display text-lg text-[var(--text-primary)]">Langkah Penanggulangan</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-teal)] shrink-0 mt-0.5" />
                    <span>Eliminasi plastik sekali pakai (kantong belanja, sedotan, kemasan makanan tipis).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-teal)] shrink-0 mt-0.5" />
                    <span>Penerapan Extended Producer Responsibility (EPR) dan pencegahan sampah di muara sungai.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-2">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=1000&q=80"
                    alt="Polusi plastik di bawah air laut"
                    className="w-full h-64 object-cover"
                  />
                </div>
                <p className="text-xs text-[var(--text-muted)] font-display italic">
                  Lebih dari 90% burung laut dan 52% penyu laut dunia tercatat telah menelan partikel plastik (CSIRO).
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--border-hairline)] space-y-2 text-xs">
                <div className="text-[var(--accent-teal)] font-semibold uppercase tracking-wider">
                  Spesies Terdampak Langsung
                </div>
                <p className="text-[var(--text-secondary)]">
                  Penyu Hijau · Penyu Belimbing · Ikan Mola-Mola
                </p>
                <button
                  onClick={() => onNavigate('calculator')}
                  className="text-xs font-semibold text-[var(--accent-teal)] hover:underline inline-flex items-center gap-1 pt-1 cursor-pointer"
                >
                  <span>Hitung Jejak Plastik Anda</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STORY 2: OVERFISHING */}
        {activeStory === 'overfishing' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in fade-in duration-200">
            <div className="lg:col-span-7 space-y-7">
              <div>
                <span className="text-xs text-[var(--accent-teal)] uppercase tracking-wider font-semibold block">
                  02 · Penangkapan Ikan Berlebih
                </span>
                <h2 className="font-display text-2xl sm:text-4xl text-[var(--text-primary)] mt-1">
                  Runtuhnya Rantai Makanan Trofik Laut Lepas
                </h2>
              </div>

              <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                <p>
                  Menurut laporan SOFIA oleh FAO, 35,4% stok ikan laut komersial saat ini ditangkap melebihi kapasitas biologis pemulihan alami.
                </p>
                <p>
                  Pukat hela dasar mengeruk karang, sementara rawai industri menangkap jutaan hiu dan penyu sebagai bycatch. Hilangnya predator puncak memicu ketidakseimbangan trofik yang melumpuhkan ekosistem karang.
                </p>
              </div>

              {/* Clean Trophic List (Hairlines only) */}
              <div className="pt-4 border-t border-[var(--border-hairline)] space-y-2">
                <h4 className="text-xs font-semibold text-[var(--accent-teal)] uppercase tracking-wider">
                  Efek Trophic Cascade
                </h4>
                <dl className="divide-y divide-[var(--border-hairline)] text-xs">
                  <div className="py-2.5 flex items-center justify-between gap-4">
                    <dt className="font-medium text-[var(--text-primary)]">Predator Puncak (Hiu Putih, Martil)</dt>
                    <dd className="text-[var(--accent-coral)] font-semibold tabular-nums">Turun 80–90%</dd>
                  </div>
                  <div className="py-2.5 flex items-center justify-between gap-4">
                    <dt className="font-medium text-[var(--text-primary)]">Mesopredator Sedang</dt>
                    <dd className="text-[var(--accent-teal)] font-medium">Ledakan tak terkendali</dd>
                  </div>
                  <div className="py-2.5 flex items-center justify-between gap-4">
                    <dt className="font-medium text-[var(--text-primary)]">Ikan Herbivora Pemakan Alga</dt>
                    <dd className="text-[var(--accent-coral)] font-medium">Terdegradasi drastis</dd>
                  </div>
                </dl>
              </div>

              <div className="pt-2 space-y-2.5">
                <h4 className="font-display text-lg text-[var(--text-primary)]">Solusi Perikanan Berkelanjutan</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-teal)] shrink-0 mt-0.5" />
                    <span>Kuota tangkap berbasis sains, penutupan musim pemijahan, serta pelarangan alat tangkap destruktif.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-teal)] shrink-0 mt-0.5" />
                    <span>Memilih rantai pasok boga bahari berlabel lestari seperti MSC dan ASC.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1560275619-4662e36fa65c?auto=format&fit=crop&w=1000&q=80"
                  alt="Hiu dan ancaman penangkapan ikan berlebih"
                  className="w-full h-64 object-cover"
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] font-display italic">
                Lebih dari 100 juta hiu dibunuh setiap tahun, menempatkan sepertiga spesies hiu dan pari dalam risiko kepunahan tinggi (IUCN).
              </p>
              <div className="pt-2 border-t border-[var(--border-hairline)] text-xs text-[var(--text-secondary)]">
                Spesies rentan: Hiu Martil · Pari Manta · Ikan Napoleon
              </div>
            </div>
          </div>
        )}

        {/* STORY 3: CORAL BLEACHING */}
        {activeStory === 'bleaching' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in fade-in duration-200">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs text-[var(--accent-coral)] uppercase tracking-wider font-semibold block">
                  03 · Pemutihan Karang
                </span>
                <h2 className="font-display text-2xl sm:text-4xl text-[var(--text-primary)] mt-1">
                  Ketika Hutan Hujan Laut Kehilangan Jiwanya
                </h2>
              </div>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Polip karang keras bersimbiosis dengan alga <em>Zooxanthellae</em> yang memasok hingga 90% energi dan warnanya. Saat suhu laut naik 1–2°C berminggu-minggu, polip terpaksa melepaskan alga tersebut hingga kerangka putihnya terekspos.
              </p>

              {/* Borderless Interactive Before & After Comparison */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--accent-teal)] font-semibold uppercase tracking-wider">
                    Komparasi Visual Terumbu
                  </span>
                  <span className="text-[var(--text-muted)] tabular-nums">{beforeAfterSplit}%</span>
                </div>

                <div
                  ref={sliderRef}
                  onPointerDown={handlePointerDown}
                  className="relative h-64 sm:h-80 rounded-2xl overflow-hidden select-none shadow-xl cursor-ew-resize group"
                >
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1200&q=80"
                    alt="Terumbu karang sehat berwarna-warni penuh ikan"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-[#061116]/80 text-[#82AAA1] text-xs font-medium">
                    Sehat (Simbiosis Utuh)
                  </div>

                  <div
                    className="absolute inset-y-0 right-0 overflow-hidden pointer-events-none"
                    style={{ width: `${100 - beforeAfterSplit}%` }}
                  >
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1200&q=80"
                      alt="Terumbu karang memutih pucat sekarat"
                      className="absolute inset-y-0 right-0 w-full h-full object-cover filter grayscale contrast-125"
                    />
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-[#061116]/80 text-[#D98270] text-xs font-medium">
                      Memutih (Bleached)
                    </div>
                  </div>

                  <div
                    className="absolute inset-y-0 w-0.5 bg-white shadow-2xl pointer-events-none"
                    style={{ left: `${beforeAfterSplit}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#367D7B] text-white flex items-center justify-center shadow-lg">
                      <MoveHorizontal className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={beforeAfterSplit}
                  onChange={(e) => setBeforeAfterSplit(Number(e.target.value))}
                  aria-label="Rasio pembandingan terumbu karang"
                  className="w-full h-1.5 bg-[var(--bg-surface)] rounded-lg appearance-none cursor-pointer accent-[#367D7B]"
                />
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4 lg:pt-12">
              <h4 className="text-xs text-[var(--accent-teal)] uppercase tracking-wider font-semibold">
                Fakta Sains Pemutihan Massal
              </h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Lebih dari 50% terumbu karang hidup di bumi telah hilang dalam 30 tahun terakhir akibat kenaikan suhu muka laut global (GCRMN).
              </p>
              <button
                onClick={() => onNavigate('simulator')}
                className="text-xs font-semibold text-[var(--accent-teal)] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Uji Dampak Suhu di Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STORY 4: ACIDIFICATION */}
        {activeStory === 'acidification' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in fade-in duration-200">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs text-[var(--accent-teal)] uppercase tracking-wider font-semibold block">
                  04 · Pengasaman Laut
                </span>
                <h2 className="font-display text-2xl sm:text-4xl text-[var(--text-primary)] mt-1">
                  Krisis Osteoporosis Kimiawi Bawah Air
                </h2>
              </div>

              <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                <p>
                  Samudra menyerap sekitar 30% emisi CO₂ manusia. Ketika CO₂ larut dalam air laut, terbentuk asam karbonat yang menurunkan pH samudra dan mengikat ion karbonat bebas.
                </p>
                <p>
                  Tanpa ion karbonat cukup, organisme bercangkang seperti karang, kerang, dan pteropoda kesulitan membentuk kerangka kalsium karbonat.
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--border-hairline)] space-y-2.5">
                <h4 className="font-display text-lg text-[var(--text-primary)]">Upaya Restorasi Kimiawi</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-teal)] shrink-0 mt-0.5" />
                    <span>Transisi menuju energi terbarukan guna menghentikan laju emisi CO₂ atmosfer.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-teal)] shrink-0 mt-0.5" />
                    <span>Konservasi padang lamun dan hutan kelp sebagai penyeimbang pH pesisir alami.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1545671913-b89ac1b4ac10?auto=format&fit=crop&w=1000&q=80"
                  alt="Moluska dan organisme bercangkang laut"
                  className="w-full h-64 object-cover"
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] font-display italic">
                Pada simulasi air laut terasamkan, cangkang tipis siput laut pteropoda mulai larut dalam 45 hari (NOAA Lab).
              </p>
            </div>
          </div>
        )}

        {/* STORY 5: HABITAT DESTRUCTION */}
        {activeStory === 'habitat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in fade-in duration-200">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs text-[var(--accent-teal)] uppercase tracking-wider font-semibold block">
                  05 · Kerusakan Habitat Pesisir
                </span>
                <h2 className="font-display text-2xl sm:text-4xl text-[var(--text-primary)] mt-1">
                  Hilangnya Benteng Alami dan Pembibitan Bahari
                </h2>
              </div>

              <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                <p>
                  Hutan bakau dan padang lamun menjadi lokasi pemijahan lebih dari 70% spesies ikan bernilai ekologis dan ekonomi dunia.
                </p>
                <p>
                  Alih fungsi lahan pesisir, sedimentasi berlebih, dan reklamasi telah memusnahkan lebih dari 35% mangrove dunia sejak 1980-an.
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--border-hairline)] space-y-2.5">
                <h4 className="font-display text-lg text-[var(--text-primary)]">Langkah Konservasi Habitat</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-teal)] shrink-0 mt-0.5" />
                    <span>Rehabilitasi sabuk mangrove dan perluasan Kawasan Konservasi Perairan (MPA) pada ekosistem lamun.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1000&q=80"
                  alt="Akar mangrove dan padang lamun yang tenang"
                  className="w-full h-64 object-cover"
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] font-display italic">
                Satu hektar mangrove mengunci karbon hingga 5 kali lebih banyak daripada hutan hujan daratan (UNEP).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
