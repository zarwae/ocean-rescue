import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  ChevronDown,
  ShieldAlert,
  Compass,
  Fish,
  Wind,
  Thermometer,
  LifeBuoy,
  Globe2,
} from 'lucide-react';
import { ActiveTab } from '../components/Navbar';
import { OCEAN_STATISTICS } from '../data/statisticsData';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { UnderwaterDescent } from '../components/UnderwaterDescent';
import heroOceanImg from '../assets/images/hero_ocean_descent_1794530080584.jpg';
import ecologicalReefImg from '../assets/images/ecological_pillar_reef_1794530081122.jpg';
import abyssTwilightImg from '../assets/images/abyss_twilight_zone_1794530081646.jpg';
import plasticDriftImg from '../assets/images/plastic_ocean_drift_1794530081643.jpg';

import { ThemeMode } from '../hooks/useTheme';

gsap.registerPlugin(ScrollTrigger);

interface HomeViewProps {
  onNavigate: (tab: ActiveTab) => void;
  theme?: ThemeMode;
}

const ECOLOGICAL_PILLARS = [
  {
    id: 'oxygen',
    tag: '01 · Produksi Oksigen',
    title: 'Paru-Paru Planet Bumi',
    icon: Wind,
    body: 'Fitoplankton mikroskopis dan alga laut memproduksi lebih dari 50% hingga 80% seluruh gas oksigen di atmosfer bumi melalui fotosintesis lapisan fotik (UNESCO-IOC).',
  },
  {
    id: 'climate',
    tag: '02 · Keseimbangan Termal',
    title: 'Termostat Pengatur Suhu',
    icon: Thermometer,
    body: 'Samudra menyerap lebih dari 90% akumulasi panas berlebih akibat emisi gas rumah kaca, menahan suhu daratan agar tetap layak huni (IPCC AR6).',
  },
  {
    id: 'food',
    tag: '03 · Ketahanan Pangan',
    title: 'Sumber Protein 3,3 Miliar Jiwa',
    icon: Fish,
    body: 'Lebih dari 3,3 miliar manusia bergantung langsung pada boga bahari sebagai sumber protein hewani esensial serta mata pencaharian masyarakat pesisir.',
  },
  {
    id: 'coastal',
    tag: '04 · Perlindungan Pesisir',
    title: 'Benteng Penahan Bencana',
    icon: LifeBuoy,
    body: 'Terumbu karang, padang lamun, dan sabuk mangrove meredam hingga 97% energi hantaman gelombang badai serta mencegah abrasi garis pantai.',
  },
];

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, theme = 'dark' }) => {
  const [selectedBiomeIndex, setSelectedBiomeIndex] = useState(0);
  const homeRootRef = useRef<HTMLDivElement | null>(null);
  const storyContainerRef = useRef<HTMLDivElement | null>(null);
  const storyStickyRef = useRef<HTMLDivElement | null>(null);

  const BIOMES = [
    {
      title: 'Terumbu Karang Tropis',
      depth: '0 – 30 Meter',
      category: 'Zona Epipelagik Fotik',
      description:
        'Megastruktur kalsium karbonat yang menampung 25% seluruh keanekaragaman hayati samudra bumi meski hanya menempati kurang dari 0,1% dasar laut dunia.',
      species: 'Penyu Sisik, Kuda Laut, Ikan Badut, Karang Otak',
      threat: 'Pemutihan massal akibat kenaikan suhu laut global',
      image: ecologicalReefImg,
      actionTab: 'explorer' as ActiveTab,
    },
    {
      title: 'Samudra Terbuka',
      depth: '0 – 200 Meter',
      category: 'Zona Pelagik Bebas',
      description:
        'Jalur migrasi tanpa batas bagi megafauna terbesar di planet ini: paus biru, hiu paus raksasa, pari manta, dan penyu belimbing pengembara samudra.',
      species: 'Hiu Paus, Paus Biru, Pari Manta Oseanik, Mola-Mola',
      threat: 'Trawl industri, bycatch, dan akumulasi mikroplastik',
      image: heroOceanImg,
      actionTab: 'explorer' as ActiveTab,
    },
    {
      title: 'Palung Laut Dalam',
      depth: '1.000 – 11.000 Meter',
      category: 'Zona Hadal & Abisal',
      description:
        'Lembah kegelapan abadi dengan tekanan hidrostatik ekstrem lebih dari 1.000 atmosfer, di mana biota mengandalkan adaptasi bioluminesensi spektakuler.',
      species: 'Anglerfish Humpback, Cumi-Cumi Raksasa, Isopoda Raksasa',
      threat: 'Pertambangan dasar laut dalam & mikroplastik tenggelam',
      image: abyssTwilightImg,
      actionTab: 'explorer' as ActiveTab,
    },
    {
      title: 'Hutan Bakau',
      depth: 'Zona Intertidal',
      category: 'Ekosistem Karbon Biru',
      description:
        'Labirin akar penyerap karbon alami yang mengunci karbon 5 hingga 10 kali lebih padat dibanding hutan hujan daratan dan membentengi permukiman pesisir.',
      species: 'Ikan Gelodok, Kepiting Bakau, Anakan Kakap, Dugong',
      threat: 'Alih fungsi lahan pesisir dan limbah plastik muara',
      image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80',
      actionTab: 'knowledge' as ActiveTab,
    },
    {
      title: 'Padang Lamun',
      depth: '2 – 15 Meter',
      category: 'Padang Rumput Laut',
      description:
        'Padang tanaman berbunga sejati yang menjernihkan sedimen kolom air, menyuplai oksigen terlarut, dan menjadi lumbung makan utama mamalia duyung langka.',
      species: 'Dugong (Putri Duyung), Penyu Hijau, Naga Laut Daun',
      threat: 'Pencemaran limpasan daratan dan sedimentasi pengerukan',
      image: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=1200&q=80',
      actionTab: 'explorer' as ActiveTab,
    },
  ];

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.to('.hero-bg-photo', {
        yPercent: 18,
        scale: 1.08,
        opacity: 0.35,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to('.hero-foreground', {
        y: -48,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.from('.stat-card-item', {
        y: 28,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.stats-grid-section',
          start: 'top 78%',
          once: true,
        },
      });

      gsap.utils.toArray<HTMLElement>('.clip-reveal-frame').forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(12% 0% 12% 0%)', opacity: 0.4 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 82%',
              once: true,
            },
          }
        );
      });
    });

    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('.ecological-pillar-item').forEach((el) => {
        gsap.from(el, {
          y: 26,
          opacity: 0,
          duration: 0.65,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            once: true,
          },
        });
      });
    });

    const rafId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(rafId);
      mm.revert();
    };
  }, []);

  return (
    <div ref={homeRootRef} className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* 1. CINEMATIC HERO WITH SCROLL TRANSFORMATION */}
      <section className="hero-section relative min-h-screen flex items-center justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-300">
        <div className="hero-bg-photo absolute inset-0 z-0 will-change-transform">
          <img
            src={heroOceanImg}
            alt="Penyelam riset di kedalaman samudra raya dengan berkas cahaya alami menembus air"
            className="w-full h-full object-cover opacity-35 brightness-[1.08] contrast-[0.95] dark:opacity-100 dark:brightness-[0.62] dark:contrast-[1.04] transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F7F6F1]/75 via-[#F7F6F1]/45 to-[#F7F6F1] dark:from-[#061116]/75 dark:via-[#061116]/30 dark:to-[#061116] transition-colors duration-500" />
        </div>

        <div className="hero-foreground relative z-10 max-w-4xl mx-auto text-center space-y-7 will-change-transform">
          <div className="flex items-center justify-center gap-3 text-[11px] font-sans font-semibold tracking-[0.26em] uppercase text-[var(--accent-sand)]">
            <span>United Nations SDG 14</span>
            <span className="text-[var(--text-muted)] font-display italic text-sm tracking-normal lowercase" aria-hidden="true">·</span>
            <span className="font-display italic font-normal tracking-[0.12em] text-sm normal-case text-[var(--accent-teal)]">
              Life Below Water
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-5xl sm:text-7xl lg:text-[5.5rem] tracking-tight text-[var(--text-primary)] leading-[1.08] text-balance">
              <span className="inline-block animate-ocean-wave">The</span>{' '}
              <span className="inline-block animate-ocean-wave ocean-wave-delay-1">ocean</span>{' '}
              <span className="inline-block animate-ocean-wave ocean-wave-delay-2">is</span>{' '}
              <span className="inline-block animate-ocean-wave ocean-wave-delay-3">
                <span className="italic font-normal ocean-caustic-text inline-block pt-2 -mt-2 pb-4 -mb-4 pl-1 -ml-1 pr-2.5 -mr-1">calling.</span>
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed text-balance">
              Penjelajahan interaktif atas keindahan biosfer bawah air, pelacakan polusi plastik global, dan ikhtiar sains untuk merestorasi masa depan biru.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => onNavigate('tracker')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#367D7B] hover:bg-[#267472] text-[#EDEBE3] font-semibold text-xs tracking-wide transition-all duration-300 hover:-translate-y-0.5 shadow-lg flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Globe2 className="w-4 h-4" />
              <span>Buka Global Plastic Tracker</span>
            </button>

            <button
              onClick={() => onNavigate('explorer')}
              className="liquid-glass-pill w-full sm:w-auto px-7 py-3.5 rounded-full text-[var(--text-primary)] font-medium text-xs tracking-wide transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[var(--accent-teal)]" />
              <span>Jelajahi 32 Biota Samudra</span>
            </button>

            <button
              onClick={() => onNavigate('crisis')}
              className="liquid-glass-pill w-full sm:w-auto px-6 py-3.5 rounded-full text-[var(--text-primary)] font-medium text-xs tracking-wide transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-[var(--accent-coral)]" />
              <span>Krisis Laut</span>
            </button>
          </div>

          <div className="pt-4 text-xs italic text-[var(--accent-sand)] font-display">
            &ldquo;The ocean is not ours to destroy. It is ours to protect.&rdquo;
          </div>

          <div className="pt-4 flex flex-col items-center gap-2 text-sm font-display italic tracking-wide text-[var(--text-muted)]">
            <span>Gulir untuk menyelam</span>
            <ChevronDown className="w-4 h-4 text-[var(--accent-teal)] animate-bounce" />
          </div>
        </div>
      </section>

      {/* 2. GSAP SCROLL-DRIVEN UNDERWATER DESCENT */}
      <UnderwaterDescent onNavigate={onNavigate} theme={theme} />

      {/* 3. THE OCEAN IN NUMBERS (OPEN EDITORIAL GRID — ZERO BOXES) */}
      <section className="stats-grid-section py-24 bg-[var(--bg-surface)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs uppercase tracking-widest text-[var(--accent-teal)] font-semibold">
                Indikator Global · Data Resmi
              </span>
              <h2 className="font-display text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight">
                One Planet. One Living Ocean.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md leading-relaxed">
              Statistik ilmiah resmi dari laporan United Nations, UNESCO-IOC, NOAA, dan IPCC mengenai kondisi nyata samudra bumi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
            {OCEAN_STATISTICS.map((stat) => (
              <div
                key={stat.id}
                className="stat-card-item group border-b border-[var(--border-hairline)] pb-7 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-baseline gap-1.5 mb-3">
                    {stat.metricPrefix && (
                      <span className="text-2xl text-[var(--accent-teal)] font-light">
                        {stat.metricPrefix}
                      </span>
                    )}
                    <span className="font-display font-medium text-5xl sm:text-6xl text-[var(--text-primary)] tracking-tight tabular-nums">
                      {stat.decimals
                        ? stat.metricValue.toFixed(stat.decimals)
                        : stat.metricValue.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xl font-medium text-[var(--accent-sand)] font-display ml-1">
                      {stat.metricSuffix}
                    </span>
                  </div>

                  <h3 className="font-medium text-base text-[var(--text-primary)] mb-1.5">
                    {stat.label}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{stat.description}</p>
                </div>

                <div className="mt-5 flex items-center justify-between text-[11px] text-[var(--text-muted)] tabular-nums">
                  <span>{stat.source}</span>
                  <span className="text-[var(--accent-sand)]">{stat.year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DESKTOP-PINNED ECOLOGICAL STORYTELLING (UNBOXED ESSAYS) */}
      <section ref={storyContainerRef} className="py-24 sm:py-28 bg-[var(--bg-canvas)] relative transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Pinned Editorial Plate (Native Sticky — Borderless) */}
            <div ref={storyStickyRef} className="lg:col-span-5 lg:sticky lg:top-24 space-y-3">
              <div className="clip-reveal-frame relative rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src={ecologicalReefImg}
                  alt="Penyu hijau berenang di atas terumbu karang alami dengan pencahayaan matahari"
                  aspectRatioClass="aspect-[3/4]"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061116]/90 via-[#061116]/15 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 space-y-1.5 text-[#EDEBE3]">
                  <span className="text-[11px] text-[#C7B99E] uppercase tracking-widest block">
                    Ekologi Biosfer Laut
                  </span>
                  <p className="text-sm font-display italic leading-relaxed">
                    &ldquo;Setiap helaan napas kedua manusia di daratan bersumber langsung dari fotosintesis alga dan fitoplankton laut.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Right Staged Ecological Pillars — Pure Hairline Dividers, Zero Bordered Boxes */}
            <div className="lg:col-span-7 space-y-10 lg:pb-24">
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-widest text-[var(--accent-teal)] font-semibold">
                  Fungsi Ekologis Utama
                </span>
                <h2 className="font-display text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight leading-tight text-balance">
                  Mengapa Lautan Menentukan Kelangsungan Hidup Kita?
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                  Samudra adalah organ sirkulasi raksasa yang menyeimbangkan iklim global, memproduksi oksigen, dan menyokong ketahanan pangan bagi miliaran jiwa.
                </p>
              </div>

              <div className="divide-y divide-[var(--border-hairline)] border-t border-[var(--border-hairline)]">
                {ECOLOGICAL_PILLARS.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div key={pillar.id} className="ecological-pillar-item py-7 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wider text-[var(--accent-sand)] font-semibold">
                          {pillar.tag}
                        </span>
                        <Icon className="w-4 h-4 text-[var(--accent-teal)]" />
                      </div>
                      <h3 className="font-display text-2xl text-[var(--text-primary)]">{pillar.title}</h3>
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                        {pillar.body}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div>
                <button
                  onClick={() => onNavigate('knowledge')}
                  className="inline-flex items-center gap-2 text-xs text-[var(--accent-teal)] hover:underline font-semibold transition-colors cursor-pointer"
                >
                  <span>Baca 12 Artikel Riset Sains Kelautan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED TRACKER BRIDGE */}
      <section className="py-24 bg-[var(--bg-surface)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs uppercase tracking-widest text-[var(--accent-coral)] font-semibold">
                Observatorium 3D &amp; 2D
              </div>
              <h2 className="font-display text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight leading-tight">
                Global Ocean Plastic Tracker
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Amati bagaimana arus permukaan dari Open-Meteo Marine menggerakkan limbah pesisir melintasi cekungan samudra menuju lima zona akumulasi gyre subtropis.
              </p>

              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[var(--border-hairline)]">
                <div>
                  <div className="font-display text-2xl text-[var(--text-primary)] tabular-nums">5 Gyre</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Zona Konvergensi</div>
                </div>
                <div>
                  <div className="font-display text-2xl text-[var(--accent-teal)] tabular-nums">Live</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Arus Open-Meteo</div>
                </div>
                <div>
                  <div className="font-display text-2xl text-[var(--accent-sand)] tabular-nums">6 Rute</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Simulasi Hanyut</div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('tracker')}
                  className="px-6 py-3 rounded-full bg-[#367D7B] hover:bg-[#267472] text-[#EDEBE3] font-semibold text-xs tracking-wide transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Globe2 className="w-4 h-4" />
                  <span>Eksplorasi Globe Interaktif</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-2.5">
              <div className="clip-reveal-frame relative rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src={plasticDriftImg}
                  alt="Sampah film plastik dan sisa jaring hanyut di kolom air samudra terbuka"
                  aspectRatioClass="aspect-[16/10]"
                  loading="eager"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Proyeksi Globe 3D &amp; Peta Dunia 2D</span>
                <span>NOAA · UNEP · Open-Meteo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE MARINE BIOMES (BORDERLESS EDITORIAL SHOWCASE) */}
      <section className="py-24 bg-[var(--bg-canvas)] relative transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10 space-y-2">
            <span className="text-xs uppercase tracking-widest text-[var(--accent-teal)] font-semibold">
              Zonasi &amp; Ekosistem Maritim
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight">
              Eksplorasi Bioma Bawah Laut
            </h2>
          </div>

          {/* Clean Underline Tab Bar */}
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none border-b border-[var(--border-hairline)] mb-10">
            {BIOMES.map((b, idx) => (
              <button
                key={b.title}
                onClick={() => setSelectedBiomeIndex(idx)}
                className={`pb-3.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px cursor-pointer ${
                  selectedBiomeIndex === idx
                    ? 'border-[var(--accent-teal)] text-[var(--text-primary)] font-semibold'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {b.title}
              </button>
            ))}
          </div>

          {(() => {
            const currentBiome = BIOMES[selectedBiomeIndex];
            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-6 space-y-2">
                  <div className="rounded-2xl overflow-hidden shadow-xl">
                    <ImageWithFallback
                      src={currentBiome.image}
                      alt={currentBiome.title}
                      aspectRatioClass="aspect-[16/10]"
                      loading="eager"
                    />
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] font-display italic">
                    Kedalaman zona: {currentBiome.depth}
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-5">
                  <div className="text-xs text-[var(--accent-teal)] uppercase tracking-wider font-semibold">
                    {currentBiome.category}
                  </div>
                  <h3 className="font-display text-2xl sm:text-4xl text-[var(--text-primary)]">
                    {currentBiome.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {currentBiome.description}
                  </p>

                  <div className="space-y-2 text-xs pt-4 border-t border-[var(--border-hairline)]">
                    <div>
                      <span className="text-[var(--accent-sand)] font-semibold mr-2">Spesies Khas:</span>
                      <span className="text-[var(--text-primary)]">{currentBiome.species}</span>
                    </div>
                    <div>
                      <span className="text-[var(--accent-coral)] font-semibold mr-2">Ancaman Utama:</span>
                      <span className="text-[var(--text-secondary)]">{currentBiome.threat}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate(currentBiome.actionTab)}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent-teal)] hover:underline cursor-pointer"
                    >
                      <span>Eksplorasi Bioma Ini</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 7. CALL TO ACTION FINALE */}
      <section className="py-28 bg-[var(--bg-surface)] relative transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <span className="text-xs uppercase tracking-widest text-[var(--accent-teal)] font-semibold">
            Aksi Konservasi Nyata
          </span>
          <h2 className="font-display text-4xl sm:text-6xl text-[var(--text-primary)] tracking-tight text-balance">
            The Future of Our Oceans is Still Unwritten.
          </h2>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Memahami sains adalah langkah awal. Mengambil tindakan nyata adalah apa yang mengubah nasib samudra bumi.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('missions')}
              className="px-7 py-3 rounded-full bg-[#367D7B] hover:bg-[#267472] text-[#EDEBE3] font-semibold text-xs tracking-wide transition-colors cursor-pointer"
            >
              Mulai Misi Konservasi
            </button>
            <button
              onClick={() => onNavigate('simulator')}
              className="px-6 py-3 rounded-full text-[var(--text-primary)] hover:text-[var(--accent-teal)] font-medium text-xs tracking-wide transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Uji Simulator Ekosistem</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
