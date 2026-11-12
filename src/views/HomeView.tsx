import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  ChevronDown, 
  ShieldAlert, 
  Compass, 
  Fish, 
  Wind, 
  Thermometer, 
  LifeBuoy
} from 'lucide-react';
import { ActiveTab } from '../components/Navbar';
import { OCEAN_STATISTICS } from '../data/statisticsData';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface HomeViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const [counterActive, setCounterActive] = useState(false);
  const [selectedBiomeIndex, setSelectedBiomeIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setCounterActive(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const BIOMES = [
    {
      title: 'Terumbu Karang Tropis',
      depth: '0 – 30 Meter',
      category: 'Zona Epipelagik Fotik',
      description: 'Megastruktur kalsium karbonat yang menampung 25% seluruh keanekaragaman hayati samudra bumi meski hanya menempati kurang dari 0,1% dasar laut dunia.',
      species: 'Penyu Sisik, Kuda Laut, Ikan Badut, Karang Otak',
      threat: 'Pemutihan massal akibat kenaikan suhu laut global',
      image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1200&q=80',
      actionTab: 'explorer' as ActiveTab,
    },
    {
      title: 'Samudra Terbuka (Pelagik)',
      depth: '0 – 200 Meter',
      category: 'Zona Fotik Bebas',
      description: 'Jalur migrasi tanpa batas bagi megafauna terbesar di planet ini: paus biru, hiu paus raksasa, pari manta, dan penyu belimbing pengembara samudra.',
      species: 'Hiu Paus, Paus Biru, Pari Manta Oseanik, Mola-Mola',
      threat: 'Trawl industri, bycatch, dan akumulasi mikroplastik',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
      actionTab: 'explorer' as ActiveTab,
    },
    {
      title: 'Palung Laut Dalam (Abisal)',
      depth: '1.000 – 11.000 Meter',
      category: 'Zona Hadal & Abisal',
      description: 'Lembah kegelapan abadi dengan tekanan hidrostatik ekstrem lebih dari 1.000 atmosfer, di mana biota mengandalkan adaptasi bioluminesensi spektakuler.',
      species: 'Anglerfish Humpback, Cumi-Cumi Raksasa, Isopoda Raksasa',
      threat: 'Rencana pertambangan dasar laut dalam (deep-sea mining)',
      image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80',
      actionTab: 'explorer' as ActiveTab,
    },
    {
      title: 'Hutan Bakau (Mangrove)',
      depth: 'Zona Intertidal Pesisir',
      category: 'Ekosistem Karbon Biru',
      description: 'Labirin akar penyerap karbon alami yang mengunci karbon 5 hingga 10 kali lebih padat dibanding hutan hujan tropis daratan dan membentengi permukiman pesisir.',
      species: 'Ikan Gelodok, Kepiting Bakau, Anakan Kakap, Dugong',
      threat: 'Alih fungsi lahan tambak dan pembangunan pesisir',
      image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80',
      actionTab: 'knowledge' as ActiveTab,
    },
    {
      title: 'Padang Lamun (Seagrass)',
      depth: '2 – 15 Meter',
      category: 'Padang Rumput Bawah Laut',
      description: 'Padang tanaman berbunga sejati yang menjernihkan sedimen kolom air, menyuplai oksigen terlarut, dan menjadi lumbung makan utama mamalia duyung langka.',
      species: 'Dugong (Putri Duyung), Penyu Hijau, Naga Laut Daun',
      threat: 'Pencemaran limpasan daratan dan sedimentasi pengerukan',
      image: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=1200&q=80',
      actionTab: 'explorer' as ActiveTab,
    },
  ];

  return (
    <div className="min-h-screen bg-[#040D14] text-[#F1F5F9] selection:bg-teal-400 selection:text-slate-950 overflow-hidden">
      
      {/* 1. CINEMATIC EDITORIAL HERO */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        
        {/* Deep Ocean Full-Bleed Photography with Subtle Scrim */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2200&q=85"
            alt="Kedalaman samudra raya biru dengan berkas sinar matahari menembus air"
            className="w-full h-full brightness-[0.45] contrast-[1.05] filter"
            aspectRatioClass="h-full"
          />
          {/* Subtle multi-layer cinematic vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#040D14]/80 via-[#040D14]/40 to-[#040D14]" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#040D14]/40 to-[#040D14]/90" />
        </div>

        {/* Hero Content with Natural Editorial Typography */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-7">
          
          {/* Quiet Unboxed Kicker */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex items-center justify-center gap-2.5 text-xs text-teal-400 font-medium tracking-wide"
          >
            <span>Global Assessment</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span>United Nations SDG 14</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-slate-400">Life Below Water</span>
          </motion.div>

          {/* Grand Natural Title */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white leading-[1.06] text-balance">
              The ocean is <span className="italic font-normal text-teal-300">calling.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-light leading-relaxed text-balance">
              Sebuah penjelajahan interaktif atas keindahan biosfer bawah air, ancaman krisis nyata yang dihadapinya, serta ikhtiar sains untuk merestorasi masa depan biru kita.
            </p>
          </motion.div>

          {/* Clean Action Affordances */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
          >
            <button
              onClick={() => onNavigate('explorer')}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-teal-400 text-slate-950 font-semibold text-xs tracking-wider uppercase hover:bg-teal-300 transition-all shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Jelajahi 32 Biota Samudra</span>
              <Compass className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('crisis')}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white/[0.04] border border-white/[0.12] hover:border-white/30 text-slate-200 font-medium text-xs tracking-wider uppercase hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Pahami Krisis Laut</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </button>
          </motion.div>

          {/* Natural Quotation */}
          <div className="pt-4 text-xs italic text-slate-400 font-display">
            &ldquo;The ocean is not ours to destroy. It is ours to protect.&rdquo;
          </div>

          {/* Scroll Cue */}
          <div className="pt-6 flex flex-col items-center gap-2 text-xs text-slate-500">
            <span className="tracking-wide">Menyelam ke kedalaman samudra</span>
            <ChevronDown className="w-4 h-4 text-teal-400 animate-bounce" />
          </div>

        </div>
      </section>

      {/* 2. THE OCEAN IN NUMBERS (OPEN EDITORIAL BOARD) */}
      <section className="py-24 bg-[#030A10] border-y border-white/[0.06] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs text-teal-400 font-medium tracking-wide">
                Indikator Global & Data Resmi
              </span>
              <h2 className="font-display text-3xl sm:text-5xl text-white tracking-tight">
                One Planet. One Living Ocean.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              Statistik ilmiah resmi yang dihimpun dari laporan United Nations, UNESCO-IOC, NOAA, dan IPCC mengenai kondisi nyata biosfer samudra saat ini.
            </p>
          </div>

          {/* Typographic Asymmetric Grid with Hairline Dividers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            {OCEAN_STATISTICS.map((stat) => (
              <div 
                key={stat.id}
                className="group border-b border-white/[0.07] pb-7 flex flex-col justify-between hover:border-teal-400/40 transition-colors"
              >
                <div>
                  <div className="flex items-baseline gap-1.5 mb-3">
                    {stat.metricPrefix && (
                      <span className="text-2xl font-mono text-teal-400 font-light">
                        {stat.metricPrefix}
                      </span>
                    )}
                    <span className="font-display font-medium text-5xl sm:text-6xl text-white tracking-tight tabular-nums">
                      {counterActive 
                        ? (stat.decimals ? stat.metricValue.toFixed(stat.decimals) : stat.metricValue.toLocaleString('id-ID'))
                        : '0'}
                    </span>
                    <span className="text-xl font-medium text-teal-300 font-display ml-1">
                      {stat.metricSuffix}
                    </span>
                  </div>

                  <h3 className="font-medium text-base text-slate-100 mb-2 group-hover:text-teal-300 transition-colors">
                    {stat.label}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {stat.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Rujukan: {stat.source}</span>
                  <span className="text-teal-400/80">Tahun {stat.year}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. WHY THE OCEAN MATTERS (SPLIT-SCREEN EDITORIAL) */}
      <section className="py-28 bg-[#040D14] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Refined Photography with Soft Scrim & Serif Pull Quote */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1544552866-d3ed42536cfd?auto=format&fit=crop&w=1200&q=80"
                  alt="Penyu laut berenang anggun di terumbu karang tropis"
                  aspectRatioClass="aspect-[4/5]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02080D]/95 via-transparent to-transparent opacity-85" />
                <div className="absolute bottom-6 left-6 right-6 space-y-1.5">
                  <span className="text-[11px] font-mono text-teal-400 uppercase tracking-widest block">
                    Ekologi Biosfer Laut
                  </span>
                  <p className="text-sm font-display italic text-slate-200 leading-relaxed">
                    &ldquo;Setiap helaan napas kedua manusia di daratan bersumber langsung dari fotosintesis alga dan fitoplankton laut.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Right: The 4 Fundamental Pillars with Hairline Dividers (NO thick left borders) */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-3">
                <span className="text-xs text-teal-400 font-medium tracking-wide">
                  Fungsi Ekologis Utama
                </span>
                <h2 className="font-display text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                  Mengapa Lautan Menentukan Kelangsungan Hidup Kita?
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Bukan sekadar perairan luas yang memisahkan benua; samudra adalah organ sirkulasi raksasa yang menyeimbangkan iklim global, memproduksi oksigen, dan menyediakan ketahanan pangan bagi miliaran populasi bumi.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="border-t border-white/[0.08] pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400">
                    <Wind className="w-4 h-4" />
                    <h4 className="font-medium text-sm text-slate-100">Paru-Paru Planet Bumi</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Fitoplankton mikroskopis dan alga laut memproduksi lebih dari 50% hingga 80% seluruh gas oksigen di atmosfer bumi (UNESCO-IOC).
                  </p>
                </div>

                <div className="border-t border-white/[0.08] pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400">
                    <Thermometer className="w-4 h-4" />
                    <h4 className="font-medium text-sm text-slate-100">Termostat Pengatur Suhu</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Samudra menyerap lebih dari 90% akumulasi panas ekstra akibat emisi gas rumah kaca, mencegah daratan terpanggang suhu ekstrem (IPCC).
                  </p>
                </div>

                <div className="border-t border-white/[0.08] pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400">
                    <Fish className="w-4 h-4" />
                    <h4 className="font-medium text-sm text-slate-100">Ketahanan Pangan Global</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Lebih dari 3,3 miliar manusia bergantung langsung pada boga bahari sebagai sumber utama protein hewani esensial dan nutrisi mikro.
                  </p>
                </div>

                <div className="border-t border-white/[0.08] pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400">
                    <LifeBuoy className="w-4 h-4" />
                    <h4 className="font-medium text-sm text-slate-100">Benteng Penahan Bencana</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Terumbu karang dan sabuk mangrove meredam hingga 97% energi hantaman ombak badai dan abrasi pesisir secara alami.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('knowledge')}
                  className="inline-flex items-center gap-2 text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors cursor-pointer"
                >
                  <span>Baca 12 Artikel Riset Sains Kelautan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. INTERACTIVE MARINE BIOMES */}
      <section className="py-24 bg-[#030A10] border-t border-white/[0.06] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-12 space-y-2">
            <span className="text-xs text-teal-400 font-medium tracking-wide">
              Zonasi & Ekosistem Maritim
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-white tracking-tight">
              Eksplorasi Bioma Bawah Laut
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Jelajahi keunikan bioma laut dari paparan dangkal berlimpah cahaya hingga palung abisal tanpa matahari.
            </p>
          </div>

          {/* Segmented Biome Controls */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-4 scrollbar-none border-b border-white/[0.08] mb-8">
            {BIOMES.map((b, idx) => (
              <button
                key={b.title}
                onClick={() => setSelectedBiomeIndex(idx)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  selectedBiomeIndex === idx
                    ? 'bg-white/[0.1] text-white shadow-sm border border-white/[0.15]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                {b.title}
              </button>
            ))}
          </div>

          {/* Active Biome Presentation */}
          {(() => {
            const currentBiome = BIOMES[selectedBiomeIndex];
            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 sm:p-10 shadow-xl backdrop-blur-sm">
                <div className="lg:col-span-6 relative rounded-xl overflow-hidden border border-white/[0.08]">
                  <ImageWithFallback
                    src={currentBiome.image}
                    alt={currentBiome.title}
                    aspectRatioClass="aspect-[16/10]"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-md bg-[#02080D]/80 backdrop-blur-md border border-white/[0.1] text-[11px] font-mono text-teal-300">
                    {currentBiome.depth}
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-5">
                  <div className="text-xs font-mono text-teal-400/90 uppercase tracking-wider">
                    {currentBiome.category}
                  </div>
                  <h3 className="font-display text-2xl sm:text-4xl text-white">
                    {currentBiome.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {currentBiome.description}
                  </p>

                  <div className="space-y-2 text-xs pt-3 border-t border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono">Spesies Khas:</span>
                      <span className="text-slate-200">{currentBiome.species}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-rose-400 font-mono">Ancaman Utama:</span>
                      <span className="text-slate-300">{currentBiome.threat}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate(currentBiome.actionTab)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <span>Eksplorasi Spesies di Bioma Ini</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      </section>

      {/* 5. THE OCEAN CRISIS */}
      <section className="py-24 bg-[#040D14] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs text-rose-400 font-medium tracking-wide">
                Tekanan Antropogenik
              </span>
              <h2 className="font-display text-3xl sm:text-5xl text-white tracking-tight">
                Lautan di Ambang Titik Kritis
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Aktivitas manusia yang tidak terkontrol telah mendorong ekosistem samudra mendekati batas daya lenting biologisnya.
              </p>
            </div>

            <button
              onClick={() => onNavigate('crisis')}
              className="px-5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.12] hover:border-rose-400/60 text-xs font-semibold text-slate-200 hover:text-rose-400 transition-colors flex items-center gap-2 w-fit cursor-pointer"
            >
              <span>Telusuri Kronologi Krisis Lengkap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Pressure Highlights with Soft Hairlines */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Plastic */}
            <div className="space-y-4 group">
              <div className="overflow-hidden rounded-xl border border-white/[0.08]">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=800&q=80"
                  alt="Pencemaran sampah plastik terapung di laut"
                  className="group-hover:scale-105 transition-transform duration-700"
                  aspectRatioClass="aspect-[16/10]"
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-rose-400 uppercase tracking-wider">
                  Polusi Plastik
                </div>
                <h3 className="font-medium text-lg text-white">11+ Juta Ton Plastik/Tahun</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Limbah polimer membunuh lebih dari 100.000 mamalia laut dan jutaan burung setiap tahun melalui jeratan dan mikroplastik.
                </p>
                <button
                  onClick={() => onNavigate('calculator')}
                  className="text-xs text-teal-400 hover:text-teal-300 pt-1 inline-flex items-center gap-1 cursor-pointer font-medium"
                >
                  Hitung Jejak Plastik Anda &rarr;
                </button>
              </div>
            </div>

            {/* Overfishing */}
            <div className="space-y-4 group">
              <div className="overflow-hidden rounded-xl border border-white/[0.08]">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1544551763-8dd44758c2dd?auto=format&fit=crop&w=800&q=80"
                  alt="Armada kapal penangkap ikan laut dan jaring"
                  className="group-hover:scale-105 transition-transform duration-700"
                  aspectRatioClass="aspect-[16/10]"
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-rose-400 uppercase tracking-wider">
                  Eksploitasi Perikanan
                </div>
                <h3 className="font-medium text-lg text-white">35% Stok Ikan Terkuras Habis</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pukat harimau dasar dan penangkapan ilegal IUU Fishing mengikis predator puncak seperti hiu hingga lebih dari 70%.
                </p>
                <button
                  onClick={() => onNavigate('crisis')}
                  className="text-xs text-teal-400 hover:text-teal-300 pt-1 inline-flex items-center gap-1 cursor-pointer font-medium"
                >
                  Pelajari Dampak Rantai Makanan &rarr;
                </button>
              </div>
            </div>

            {/* Coral Bleaching */}
            <div className="space-y-4 group">
              <div className="overflow-hidden rounded-xl border border-white/[0.08]">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=800&q=80"
                  alt="Pemutihan karang bercabang putih kapur"
                  className="group-hover:scale-105 transition-transform duration-700"
                  aspectRatioClass="aspect-[16/10]"
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-rose-400 uppercase tracking-wider">
                  Kenaikan Suhu Global
                </div>
                <h3 className="font-medium text-lg text-white">Pemutihan Karang Massal</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gelombang panas memutus simbiosis karang dengan alga zooxanthellae, mematikan fondasi habitat bagi ribuan biota pesisir.
                </p>
                <button
                  onClick={() => onNavigate('simulator')}
                  className="text-xs text-teal-400 hover:text-teal-300 pt-1 inline-flex items-center gap-1 cursor-pointer font-medium"
                >
                  Simulasi Stres Termal di Lab &rarr;
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. CALL TO ACTION FINALE */}
      <section className="py-28 bg-[#030A10] border-t border-white/[0.06] relative">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <span className="text-xs text-teal-400 font-medium tracking-wide">
            Aksi Konservasi Nyata
          </span>
          <h2 className="font-display text-4xl sm:text-6xl text-white tracking-tight">
            The Future of Our Oceans is Still Unwritten.
          </h2>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed">
            Memahami sains adalah langkah awal. Mengambil tindakan nyata adalah apa yang mengubah nasib samudra bumi. Bergabunglah dengan aksi konservasi sekarang.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('missions')}
              className="px-6 py-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold text-xs tracking-wider uppercase transition-all shadow-md shadow-teal-500/20 cursor-pointer"
            >
              Mulai Misi Konservasi Siswa
            </button>
            <button
              onClick={() => onNavigate('simulator')}
              className="px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.12] hover:border-white/30 text-slate-200 font-medium text-xs tracking-wider uppercase transition-all cursor-pointer"
            >
              Uji Coba Simulator Ekosistem
            </button>
            <button
              onClick={() => onNavigate('game')}
              className="px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.12] hover:border-teal-400/50 text-teal-300 font-medium text-xs tracking-wider uppercase transition-all cursor-pointer"
            >
              Mainkan Game Bersih Laut
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
