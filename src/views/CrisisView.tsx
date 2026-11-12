import React, { useState, useRef } from 'react';
import { 
  Trash2, 
  Fish, 
  ThermometerSnowflake, 
  Droplet, 
  Trees, 
  CheckCircle2, 
  ChevronRight,
  MoveHorizontal
} from 'lucide-react';
import { ActiveTab } from '../components/Navbar';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface CrisisViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const CrisisView: React.FC<CrisisViewProps> = ({ onNavigate }) => {
  const [activeStory, setActiveStory] = useState<'plastic' | 'overfishing' | 'bleaching' | 'acidification' | 'habitat'>('plastic');
  const [beforeAfterSplit, setBeforeAfterSplit] = useState<number>(50); // percentage 0 - 100
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const updatePosition = (clientX: number) => {
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      setBeforeAfterSplit(Math.round((x / rect.width) * 100));
    };
    updatePosition(e.clientX);

    const onPointerMove = (ev: PointerEvent) => {
      updatePosition(ev.clientX);
    };
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div className="min-h-screen bg-[#040D14] text-[#F1F5F9] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header - Natural Editorial Format */}
        <div className="space-y-3 max-w-3xl">
          <div className="text-xs text-rose-400 font-medium tracking-wide">
            Anatomi Krisis Antropogenik · 5 Ancaman Utama
          </div>
          <h1 className="font-display text-4xl sm:text-6xl text-white tracking-tight">
            Anatomi Krisis Samudra Raya
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Menelusuri secara ilmiah lima tekanan terbesar manusia yang sedang mengubah tatanan kimiawi, termal, dan keanekaragaman hayati samudra bumi.
          </p>
        </div>

        {/* Story Selector Navigation Tabs with Subtle Hairlines */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 border-b border-white/[0.08] pb-4">
          <button
            onClick={() => setActiveStory('plastic')}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
              activeStory === 'plastic'
                ? 'bg-white/[0.08] border-rose-400/50 text-rose-300 shadow-sm'
                : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <Trash2 className="w-4 h-4 shrink-0 text-rose-400" />
            <div>
              <div className="text-xs font-medium">Polusi Plastik</div>
              <div className="text-[10px] text-slate-500 font-mono">11 Juta Ton/Tahun</div>
            </div>
          </button>

          <button
            onClick={() => setActiveStory('overfishing')}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
              activeStory === 'overfishing'
                ? 'bg-white/[0.08] border-teal-400/50 text-teal-300 shadow-sm'
                : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <Fish className="w-4 h-4 shrink-0 text-teal-400" />
            <div>
              <div className="text-xs font-medium">Overfishing</div>
              <div className="text-[10px] text-slate-500 font-mono">35% Stok Kritis</div>
            </div>
          </button>

          <button
            onClick={() => setActiveStory('bleaching')}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
              activeStory === 'bleaching'
                ? 'bg-white/[0.08] border-rose-400/50 text-rose-300 shadow-sm'
                : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <ThermometerSnowflake className="w-4 h-4 shrink-0 text-rose-400" />
            <div>
              <div className="text-xs font-medium">Coral Bleaching</div>
              <div className="text-[10px] text-slate-500 font-mono">Stres Termal Karang</div>
            </div>
          </button>

          <button
            onClick={() => setActiveStory('acidification')}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
              activeStory === 'acidification'
                ? 'bg-white/[0.08] border-teal-400/50 text-teal-300 shadow-sm'
                : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <Droplet className="w-4 h-4 shrink-0 text-teal-400" />
            <div>
              <div className="text-xs font-medium">Pengasaman Laut</div>
              <div className="text-[10px] text-slate-500 font-mono">pH Turun 0.1 Unit</div>
            </div>
          </button>

          <button
            onClick={() => setActiveStory('habitat')}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 col-span-2 sm:col-span-1 cursor-pointer ${
              activeStory === 'habitat'
                ? 'bg-white/[0.08] border-emerald-400/50 text-emerald-300 shadow-sm'
                : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <Trees className="w-4 h-4 shrink-0 text-emerald-400" />
            <div>
              <div className="text-xs font-medium">Kerusakan Habitat</div>
              <div className="text-[10px] text-slate-500 font-mono">Mangrove & Lamun</div>
            </div>
          </button>
        </div>

        {/* STORY 1: PLASTIC POLLUTION */}
        {activeStory === 'plastic' && (
          <div className="space-y-10 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs font-mono text-rose-400 uppercase tracking-wider block">
                    Krisis 01 · Polusi Plastik & Mikroplastik
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl text-white mt-1">
                    Gelombang Polimer Abadi di Jantung Samudra
                  </h2>
                </div>

                <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                  <p>
                    Plastik diciptakan untuk bertahan selamanya, namun ironisnya sepertiga dari total produksi global dirancang untuk dibuang sekali pakai dalam hitungan menit. Dari daratan, melalui sungai dan selokan kota, lebih dari 11 juta metrik ton limbah plastik masuk ke lautan setiap tahun.
                  </p>
                  <p>
                    Di laut lepas, radiasi ultraviolet dan gesekan ombak memecah plastik besar menjadi miliaran fragmen mikroplastik berukuran kurang dari 5 milimeter. Mikroplastik ini bertindak seperti spons magnetis bagi racun organik persisten (POPs), lalu tertelan oleh zooplankton, ikan, dan penyu yang mengiranya sebagai ubur-ubur.
                  </p>
                </div>

                {/* Interactive Diagram with Hairline Borders */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                  <h4 className="text-xs font-mono text-teal-400 uppercase tracking-wider">
                    Jalur Migrasi Polutan: Siklus Plastik Samudra
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 text-xs">
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1">
                      <div className="font-medium text-white">1. Sumber Darat</div>
                      <div className="text-[11px] text-slate-400">80% plastik laut berasal dari sampah kota tak terkelola.</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1">
                      <div className="font-medium text-white">2. Aliran Sungai</div>
                      <div className="text-[11px] text-slate-400">Sungai utama mengalirkan jutaan ton plastik ke teluk.</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1">
                      <div className="font-medium text-white">3. Pusaran Arus</div>
                      <div className="text-[11px] text-slate-400">Terkumpul di 5 Gyre samudra (Great Pacific Patch).</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1">
                      <div className="font-medium text-white">4. Palung Dalam</div>
                      <div className="text-[11px] text-slate-400">Tenggelam menjadi salju laut dan meracuni biota abisal.</div>
                    </div>
                  </div>
                </div>

                {/* Practical Solutions */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-display font-medium text-base text-white">
                    Langkah Penanggulangan Nyata:
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>Pelarangan regulasi produk plastik sekali pakai (kantong kresek, sedotan, styrofoam).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>Penerapan Extended Producer Responsibility (EPR) agar produsen bertanggung jawab mendaur ulang kemasan.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>Pencegahan sampah di muara sungai menggunakan floating barrier dan edukasi masyarakat pesisir.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02]">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=1000&q=80"
                    alt="Polusi plastik di bawah air laut"
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4 space-y-1.5">
                    <div className="text-xs font-medium text-white">Dampak Pada Satwa Laut</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Lebih dari 90% burung laut dan 52% penyu laut di seluruh dunia tercatat telah menelan partikel plastik dalam saluran pencernaannya (CSIRO Study).
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                  <h4 className="text-xs font-mono text-teal-400 uppercase tracking-wider">
                    Spesies Terdampak Langsung
                  </h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-200">
                      Penyu Hijau (Chelonia mydas)
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-200">
                      Penyu Belimbing (Dermochelys coriacea)
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-200">
                      Ikan Mola-Mola (Mola mola)
                    </span>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate('calculator')}
                      className="text-xs font-medium text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Buka Kalkulator Plastik</span> &rarr;
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* STORY 2: OVERFISHING */}
        {activeStory === 'overfishing' && (
          <div className="space-y-10 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs font-mono text-teal-400 uppercase tracking-wider block">
                    Krisis 02 · Penangkapan Ikan Berlebih (Overfishing)
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl text-white mt-1">
                    Runtuhnya Rantai Makanan Trofik Laut Lepas
                  </h2>
                </div>

                <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                  <p>
                    Menurut laporan The State of World Fisheries and Aquaculture (SOFIA) oleh FAO, 35,4% stok ikan laut komersial saat ini ditangkap melebihi kapasitas biologis pemulihan alami.
                  </p>
                  <p>
                    Teknologi penangkapan industri seperti pukat hela dasar (bottom trawling) mengeruk substrat bentik karang, sementara ribuan mil tali pancing rawai (longline) menangkap jutaan hiu, pari, dan burung albatros secara sia-sia sebagai bycatch. Ketika predator puncak dihabisi, terjadi ketidakseimbangan trofik yang memicu ledakan populasi hama atau ubur-ubur.
                  </p>
                </div>

                {/* Diagram Rantai Makanan Trofik */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                  <h4 className="text-xs font-mono text-teal-400 uppercase tracking-wider">
                    Fenomena Trophic Cascade Saat Predator Puncak Hilang
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-rose-400/30 flex items-center justify-between">
                      <span className="font-medium text-rose-300">Tingkat 4: Predator Puncak (Hiu Putih, Hiu Martil)</span>
                      <span className="font-mono text-rose-400 font-medium">Turun 80-90%</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                      <span className="font-medium text-slate-300">Tingkat 3: Mesopredator & Ikan Sedang</span>
                      <span className="font-mono text-teal-300">Ledakan tak terkendali</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                      <span className="font-medium text-slate-300">Tingkat 2: Ikan Herbivora Perawat Karang</span>
                      <span className="font-mono text-rose-400">Dihabiskan oleh mesopredator</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-rose-400/30 flex items-center justify-between">
                      <span className="font-medium text-rose-300">Dampak Akhir: Terumbu Karang Terbekap Alga Liar</span>
                      <span className="font-mono text-rose-400 font-medium">Kematian Koloni Karang</span>
                    </div>
                  </div>
                </div>

                {/* Practical Solutions */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-display font-medium text-base text-white">
                    Solusi Perikanan Berkelanjutan:
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>Penerapan kuota tangkap berbasis ilmiah (Maximum Sustainable Yield) dan penutupan musim pemijahan.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>Pelarangan alat tangkap destruktif (pukat harimau, bom ikan, racun potasium sianida).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>Dukungan sertifikasi rantai pasok boga bahari ramah lingkungan seperti MSC dan ASC.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02]">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1560275619-4662e36fa65c?auto=format&fit=crop&w=1000&q=80"
                    alt="Hiu dan ancaman penangkapan ikan berlebih"
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4 space-y-1.5">
                    <div className="text-xs font-medium text-white">Fakta Ancaman Hiu Global</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Lebih dari 100 juta hiu dibunuh setiap tahun terutama demi perdagangan sirip ilegal, menempatkan sepertiga spesies hiu dan pari dalam risiko kepunahan tinggi (IUCN).
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                  <h4 className="text-xs font-mono text-teal-400 uppercase tracking-wider">
                    Spesies Paling Terancam Overfishing
                  </h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-200">
                      Hiu Martil (Sphyrna lewini)
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-200">
                      Pari Manta (Mobula alfredi)
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-200">
                      Ikan Napoleon (Cheilinus undulatus)
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* STORY 3: CORAL BLEACHING WITH BEFORE & AFTER SLIDER */}
        {activeStory === 'bleaching' && (
          <div className="space-y-10 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs font-mono text-rose-400 uppercase tracking-wider block">
                    Krisis 03 · Pemutihan Karang (Coral Bleaching)
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl text-white mt-1">
                    Ketika Hutan Hujan Laut Kehilangan Jiwanya
                  </h2>
                </div>

                <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                  <p>
                    Karang keras bukanlah batu mati, melainkan hewan polip avertebrata yang bersimbiosis erat dengan mikroalga fotosintetik bernama Zooxanthellae. Alga ini tinggal di dalam jaringan polip dan menyediakan hingga 90% makanan serta warna-warni memukau terumbu karang.
                  </p>
                  <p>
                    Ketika suhu air laut naik 1–2°C di atas batas ambang musim panas selama berminggu-minggu, fotosistem alga mengalami fotokerusakan dan memproduksi racun oksigen reaktif. Demi menyelamatkan diri, polip terpaksa mengeluarkan alga tersebut. Tanpa alga, jaringan karang menjadi transparan memperlihatkan kerangka kalsium karbonat putih kapur.
                  </p>
                </div>

                {/* Before & After Interactive Comparison Slider */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono text-teal-400 uppercase tracking-wider">
                      Komparasi Visual: Terumbu Sehat vs Pemutihan Karang
                    </h4>
                    <span className="text-xs font-mono text-slate-400">
                      {beforeAfterSplit}% Rasio
                    </span>
                  </div>

                  <div 
                    ref={sliderRef}
                    onPointerDown={handlePointerDown}
                    className="relative h-64 sm:h-80 rounded-xl overflow-hidden select-none border border-white/[0.1] cursor-ew-resize group"
                  >
                    {/* Healthy Coral (Full Width Background) */}
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1200&q=80"
                      alt="Terumbu karang sehat berwarna-warni penuh ikan"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-md bg-[#02080D]/80 backdrop-blur-sm text-teal-300 text-xs font-medium border border-white/[0.1]">
                      Kondisi Sehat (Simbiosis Utuh)
                    </div>

                    {/* Bleached Coral (Clipped Overlay) */}
                    <div 
                      className="absolute inset-y-0 right-0 overflow-hidden pointer-events-none"
                      style={{ width: `${100 - beforeAfterSplit}%` }}
                    >
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1200&q=80"
                        alt="Terumbu karang memutih pucat sekarat"
                        className="absolute inset-y-0 right-0 w-full h-full object-cover filter grayscale contrast-125"
                      />
                      <div className="absolute bottom-3 right-3 px-3 py-1 rounded-md bg-[#02080D]/80 backdrop-blur-sm text-rose-300 text-xs font-medium border border-white/[0.1]">
                        Memutih (Bleached)
                      </div>
                    </div>

                    {/* Divider Line & Drag Handle */}
                    <div 
                      className="absolute inset-y-0 w-0.5 bg-white shadow-2xl pointer-events-none"
                      style={{ left: `${beforeAfterSplit}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center shadow-lg border border-white group-hover:scale-110 transition-transform">
                        <MoveHorizontal className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Range Slider Control */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={beforeAfterSplit}
                      onChange={(e) => setBeforeAfterSplit(Number(e.target.value))}
                      className="w-full h-1.5 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-teal-400"
                    />
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                  <h4 className="text-xs font-mono text-teal-400 uppercase tracking-wider">
                    Fakta Sains Pemutihan Massal
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Lebih dari 50% terumbu karang hidup di planet bumi telah hilang dalam 30 tahun terakhir akibat kenaikan suhu muka laut global (Global Coral Reef Monitoring Network).
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate('simulator')}
                      className="text-xs font-medium text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Simulasikan Dampak di Lab Ekosistem</span> &rarr;
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STORY 4: ACIDIFICATION */}
        {activeStory === 'acidification' && (
          <div className="space-y-10 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs font-mono text-teal-400 uppercase tracking-wider block">
                    Krisis 04 · Pengasaman Laut (Ocean Acidification)
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl text-white mt-1">
                    Krisis Osteoporosis Kimiawi Bawah Air
                  </h2>
                </div>

                <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                  <p>
                    Samudra menyerap sekitar 30% dari total emisi karbon dioksida (CO2) yang dihasilkan oleh pembakaran bahan bakar fosil dan deforestasi. Ketika CO2 terlarut dalam air laut, terjadi reaksi pembentukan asam karbonat yang melepaskan ion hidrogen dan menurunkan pH rata-rata samudra bumi.
                  </p>
                  <p>
                    Akibatnya, ion karbonat bebas (CO3 2-) yang dibutuhkan oleh organisme bercangkang seperti karang, kerang, kepiting, dan siput laut pteropoda untuk membangun cangkang kalsium karbonat menjadi sangat langka. Cangkang mereka menjadi rapuh, melarut, dan gagal mengeras.
                  </p>
                </div>

                {/* Practical Solutions */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-display font-medium text-base text-white">
                    Upaya Restorasi Kimiawi Laut:
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>Transisi masif ke energi terbarukan untuk menghentikan akumulasi emisi CO2 atmosfer.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>Konservasi padang lamun dan alga kelp yang mampu menyerap CO2 terlarut secara lokal (alkalisasi alami).</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02]">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1545671913-b89ac1b4ac10?auto=format&fit=crop&w=1000&q=80"
                    alt="Moluska dan organisme bercangkang laut"
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4 space-y-1.5">
                    <div className="text-xs font-medium text-white">Dampak Pada Pteropoda (Sea Butterfly)</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Siput laut bersayap kecil berukuran 2 mm ini adalah pakan esensial ikan salmon dan paus. Dalam air laut yang terasamkan, cangkang tipis mereka mulai retak dan larut hanya dalam tempo 45 hari (NOAA Lab).
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STORY 5: HABITAT DESTRUCTION */}
        {activeStory === 'habitat' && (
          <div className="space-y-10 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block">
                    Krisis 05 · Kehancuran Habitat Pesisir & Dasar Laut
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl text-white mt-1">
                    Hilangnya Benteng Alami dan Pembibitan Generasi Bahari
                  </h2>
                </div>

                <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                  <p>
                    Kawasan pesisir adalah zona paling produktif di muka bumi. Hutan bakau (mangrove) dan padang lamun (seagrass) bertindak sebagai tempat pemijahan dan pembibitan (nursery ground) bagi lebih dari 70% spesies ikan bernilai komersial dunia.
                  </p>
                  <p>
                    Namun, pembangunan tambak intensif, sedimentasi tambang darat, pengerukan jalur kapal, dan reklamasi pesisir telah memusnahkan lebih dari 35% hutan mangrove dunia dan 30% hamparan padang lamun sejak tahun 1980-an.
                  </p>
                </div>

                {/* Practical Solutions */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-display font-medium text-base text-white">
                    Langkah Konservasi Habitat Nyata:
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>Rehabilitasi dan moratorium penebangan hutan mangrove pesisir.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>Pemberian status Kawasan Konservasi Perairan (MPA) pada ekosistem lamun.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02]">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1000&q=80"
                    alt="Akar mangrove dan padang lamun yang tenang"
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4 space-y-1.5">
                    <div className="text-xs font-medium text-white">Kehebatan Karbon Biru (Blue Carbon)</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Satu hektar mangrove mampu menyerap karbon hingga 5 kali lebih banyak daripada hutan hujan daratan dan menguncinya di tanah selama ribuan tahun tanpa membusuk (UNEP).
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Bottom Banner to Simulator */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-display font-medium text-lg text-white">
              Ingin melihat interaksi kelima krisis ini secara langsung?
            </h3>
            <p className="text-xs text-slate-400">
              Uji coba variabel suhu, plastik, pengasaman, dan tekanan penangkapan di Simulator Ekosistem Laut kami.
            </p>
          </div>
          <button
            onClick={() => onNavigate('simulator')}
            className="px-5 py-2.5 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-semibold transition-all shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <span>Buka Simulator Ekosistem</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
