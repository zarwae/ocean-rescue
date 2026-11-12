import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Heart, 
  Shuffle, 
  ArrowLeftRight, 
  X, 
  Compass, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { SPECIES_DATABASE, MarineSpecies } from '../data/speciesData';
import { soundEffects } from '../utils/soundEffects';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface ExplorerViewProps {
  favoriteSpecies: string[];
  onToggleFavorite: (id: string) => void;
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  favoriteSpecies,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedIucn, setSelectedIucn] = useState<string>('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Active detail modal
  const [selectedSpecies, setSelectedSpecies] = useState<MarineSpecies | null>(null);

  // Comparison mode state
  const [isComparing, setIsComparing] = useState(false);
  const [compareSpeciesA, setCompareSpeciesA] = useState<MarineSpecies>(SPECIES_DATABASE[0]);
  const [compareSpeciesB, setCompareSpeciesB] = useState<MarineSpecies>(SPECIES_DATABASE[1]);

  const categories = [
    'All',
    'Marine Mammals',
    'Sharks and Rays',
    'Marine Reptiles',
    'Ocean Fish',
    'Corals',
    'Deep Sea Creatures',
    'Marine Invertebrates',
  ];

  const filteredSpecies = useMemo(() => {
    return SPECIES_DATABASE.filter((sp) => {
      const matchSearch = 
        sp.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sp.indonesianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sp.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sp.habitat.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === 'All' || sp.category === selectedCategory;
      const matchIucn = selectedIucn === 'All' || sp.iucnStatus === selectedIucn;
      const matchFav = !onlyFavorites || favoriteSpecies.includes(sp.id);

      return matchSearch && matchCategory && matchIucn && matchFav;
    });
  }, [searchQuery, selectedCategory, selectedIucn, onlyFavorites, favoriteSpecies]);

  const handleRandomDiscovery = () => {
    const randomIndex = Math.floor(Math.random() * SPECIES_DATABASE.length);
    setSelectedSpecies(SPECIES_DATABASE[randomIndex]);
    soundEffects.playBubblePop();
  };

  const getIucnColor = (status: string) => {
    if (status.includes('Critically Endangered')) return 'text-rose-400';
    if (status.includes('Endangered')) return 'text-rose-300';
    if (status.includes('Vulnerable')) return 'text-amber-300';
    if (status.includes('Least Concern')) return 'text-emerald-400';
    return 'text-teal-300';
  };

  const spotlightSpecies = SPECIES_DATABASE[0]; // Whale Shark

  return (
    <div className="min-h-screen bg-[#040D14] text-[#F1F5F9] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* EDITORIAL SPOTLIGHT HERO BANNER */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.02] backdrop-blur-md shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            <div className="lg:col-span-7 p-8 sm:p-12 space-y-4">
              <div className="flex items-center gap-2 text-xs text-teal-400 font-medium">
                <Compass className="w-4 h-4" />
                <span>Museum Biota Samudra · Koleksi Unggulan</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl text-white tracking-tight">
                {spotlightSpecies.indonesianName}
              </h1>
              <div className="text-xs font-mono italic text-slate-400">
                {spotlightSpecies.scientificName} · {spotlightSpecies.category}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                {spotlightSpecies.physicalCharacteristics} {spotlightSpecies.ecologicalRole}
              </p>
              
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedSpecies(spotlightSpecies);
                    soundEffects.playBubblePop();
                  }}
                  className="px-6 py-2.5 rounded-lg bg-teal-400 text-slate-950 font-semibold text-xs tracking-wider uppercase hover:bg-teal-300 transition-all shadow-md shadow-teal-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <span>Buka Lembar Fakta Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleRandomDiscovery}
                  className="px-5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.12] hover:border-white/30 text-slate-200 font-medium text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5 text-teal-400" />
                  <span>Jelajahi Acak</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 h-72 sm:h-96 relative">
              <ImageWithFallback
                src={spotlightSpecies.imageUrl}
                alt={spotlightSpecies.indonesianName}
                aspectRatioClass="h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#040D14] via-transparent to-transparent hidden lg:block" />
            </div>

          </div>
        </div>

        {/* SEARCH, CATEGORY & CONTROLS */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search Input with Softer Borders */}
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama spesies, nama latin, atau habitat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.1] text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400/80 transition-colors"
              />
            </div>

            {/* Comparison button & Favorites filter */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  onlyFavorites
                    ? 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                    : 'bg-white/[0.03] border-white/[0.1] text-slate-400 hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current text-rose-400' : ''}`} />
                <span>Favorit ({favoriteSpecies.length})</span>
              </button>

              <button
                onClick={() => setIsComparing(true)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-teal-400/10 border border-teal-400/30 hover:bg-teal-400/20 text-teal-300 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Komparasi Spesies</span>
              </button>
            </div>

          </div>

          {/* Clean Segmented Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white/[0.12] text-white border border-white/[0.16] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                {cat === 'All' ? 'Semua Kategori (32)' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* SPECIES SHOWCASE GALLERY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredSpecies.map((sp) => {
            const isFav = favoriteSpecies.includes(sp.id);
            return (
              <div
                key={sp.id}
                onClick={() => {
                  setSelectedSpecies(sp);
                  soundEffects.playBubblePop();
                }}
                className="group rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.08] hover:border-teal-400/40 hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-xl"
              >
                <div>
                  <div className="relative overflow-hidden">
                    <ImageWithFallback
                      src={sp.imageUrl}
                      alt={sp.indonesianName}
                      className="group-hover:scale-105 transition-transform duration-700"
                      aspectRatioClass="aspect-[16/11]"
                    />
                    
                    {/* Favorite Heart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(sp.id);
                        soundEffects.playChime(1);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-[#02080D]/80 backdrop-blur-md border border-white/[0.1] hover:scale-110 transition-transform cursor-pointer"
                      title={isFav ? 'Hapus dari favorit' : 'Simpan ke favorit'}
                      aria-label="Favorit"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-rose-400 fill-rose-400' : 'text-slate-400'}`} />
                    </button>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="text-[11px] font-mono text-slate-400 tracking-wide flex items-center gap-1.5">
                      <span>{sp.taxonomy.class}</span>
                      <span>·</span>
                      <span>{sp.depthRange}</span>
                    </div>

                    <h3 className="font-display font-medium text-lg text-white group-hover:text-teal-300 transition-colors">
                      {sp.indonesianName}
                    </h3>
                    
                    <div className="text-xs font-mono italic text-slate-400">
                      {sp.scientificName}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-1">
                      {sp.physicalCharacteristics}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className={`font-mono text-[11px] font-medium ${getIucnColor(sp.iucnStatus)}`}>
                    {sp.iucnStatus.split(' ')[0]} {sp.iucnStatus.match(/\((.*?)\)/)?.[0]}
                  </span>
                  <span className="text-[11px] text-teal-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium">
                    Detail &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSpecies.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <p className="text-base text-slate-400">Tidak ada biota yang cocok dengan kriteria pencarian Anda.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedIucn('All');
                setOnlyFavorites(false);
              }}
              className="text-xs font-mono text-teal-400 hover:underline cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        )}

      </div>

      {/* FULL SPECIES DOSSIER MODAL */}
      {selectedSpecies && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div 
            className="relative w-full max-w-4xl bg-[#030A10] border border-white/[0.1] rounded-2xl overflow-hidden shadow-2xl my-8 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image Header */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden">
              <ImageWithFallback
                src={selectedSpecies.imageUrl}
                alt={selectedSpecies.indonesianName}
                aspectRatioClass="h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030A10] via-[#030A10]/30 to-transparent" />

              <button
                onClick={() => setSelectedSpecies(null)}
                className="absolute top-4 right-4 p-2.5 rounded-lg bg-[#02080D]/80 backdrop-blur-md border border-white/[0.1] text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                aria-label="Tutup Detail"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <span className="text-xs font-mono text-teal-400 uppercase tracking-wider block mb-1">
                    {selectedSpecies.category} · {selectedSpecies.taxonomy.phylum} &gt; {selectedSpecies.taxonomy.class}
                  </span>
                  <h2 className="font-display font-medium text-3xl sm:text-4xl text-white">
                    {selectedSpecies.indonesianName}
                  </h2>
                  <div className="text-xs font-mono italic text-slate-300 mt-0.5">
                    {selectedSpecies.scientificName} ({selectedSpecies.commonName})
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-md border text-xs font-mono font-medium bg-[#02080D]/80 backdrop-blur-md ${getIucnColor(selectedSpecies.iucnStatus)} border-current/30 w-fit`}>
                  IUCN: {selectedSpecies.iucnStatus}
                </div>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Biological Specs Grid with Hairlines */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block">Zona Kedalaman</span>
                  <span className="font-medium text-slate-200">{selectedSpecies.depthRange}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block">Pola Makanan</span>
                  <span className="font-medium text-teal-300">{selectedSpecies.diet}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block">Famili Taksonomi</span>
                  <span className="font-medium text-slate-200">{selectedSpecies.taxonomy.family}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block">Wilayah Persebaran</span>
                  <span className="font-medium text-slate-200 truncate block" title={selectedSpecies.geographicDistribution}>
                    {selectedSpecies.geographicDistribution}
                  </span>
                </div>
              </div>

              {/* Anatomy & Ecology */}
              <div className="space-y-2">
                <h4 className="font-display font-medium text-base text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>Karakteristik Fisik & Peran Ekologis</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedSpecies.physicalCharacteristics}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-teal-300 font-semibold">Peran Ekologis: </strong>
                  {selectedSpecies.ecologicalRole}
                </p>
              </div>

              {/* Conservation Threats */}
              <div className="space-y-2">
                <h4 className="font-display font-medium text-base text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Ancaman Kepunahan Utama</span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {selectedSpecies.conservationThreats.map((threat, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.06]">
                      <span className="text-rose-400 font-bold">·</span>
                      <span>{threat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interesting Facts */}
              <div className="space-y-2 p-4 rounded-xl bg-teal-500/[0.04] border border-teal-500/20 text-xs">
                <span className="font-mono text-teal-400 font-medium block uppercase text-[10px]">
                  Fakta Menarik Biologi:
                </span>
                {selectedSpecies.interestingFacts.map((fact, idx) => (
                  <p key={idx} className="text-slate-200 leading-relaxed">
                    &ldquo;{fact}&rdquo;
                  </p>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono border-t border-white/[0.08]">
                <span>Fotografer: {selectedSpecies.imagePhotographer}</span>
                <button
                  onClick={() => {
                    onToggleFavorite(selectedSpecies.id);
                    soundEffects.playChime(1);
                  }}
                  className="text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Heart className={`w-3.5 h-3.5 ${favoriteSpecies.includes(selectedSpecies.id) ? 'fill-current text-rose-400' : ''}`} />
                  <span>{favoriteSpecies.includes(selectedSpecies.id) ? 'Disimpan di Favorit' : 'Tambah ke Favorit'}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* COMPARISON MODAL */}
      {isComparing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div 
            className="relative w-full max-w-5xl bg-[#030A10] border border-white/[0.1] rounded-2xl overflow-hidden shadow-2xl my-8 p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-teal-400" />
                <h3 className="font-display font-medium text-xl text-white">
                  Komparasi Adaptasi Biota Laut
                </h3>
              </div>
              <button
                onClick={() => setIsComparing(false)}
                className="p-2 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Species A Selector & Card */}
              <div className="space-y-4">
                <label className="text-xs font-mono text-slate-400 block">Spesies Primer (A)</label>
                <select
                  value={compareSpeciesA.id}
                  onChange={(e) => {
                    const found = SPECIES_DATABASE.find((s) => s.id === e.target.value);
                    if (found) setCompareSpeciesA(found);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none"
                >
                  {SPECIES_DATABASE.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#040D14]">
                      {s.indonesianName} ({s.scientificName})
                    </option>
                  ))}
                </select>

                <div className="rounded-xl overflow-hidden border border-white/[0.08]">
                  <ImageWithFallback
                    src={compareSpeciesA.imageUrl}
                    alt={compareSpeciesA.indonesianName}
                    aspectRatioClass="aspect-[16/10]"
                  />
                </div>

                <div className="space-y-2 text-xs">
                  <h4 className="font-display text-lg text-white">{compareSpeciesA.indonesianName}</h4>
                  <div className="text-teal-400 font-mono text-[11px]">{compareSpeciesA.depthRange} · {compareSpeciesA.diet}</div>
                  <p className="text-slate-300 leading-relaxed">{compareSpeciesA.physicalCharacteristics}</p>
                  <p className="text-slate-400 leading-relaxed pt-2 border-t border-white/[0.06]">{compareSpeciesA.ecologicalRole}</p>
                </div>
              </div>

              {/* Species B Selector & Card */}
              <div className="space-y-4">
                <label className="text-xs font-mono text-slate-400 block">Spesies Pembanding (B)</label>
                <select
                  value={compareSpeciesB.id}
                  onChange={(e) => {
                    const found = SPECIES_DATABASE.find((s) => s.id === e.target.value);
                    if (found) setCompareSpeciesB(found);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none"
                >
                  {SPECIES_DATABASE.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#040D14]">
                      {s.indonesianName} ({s.scientificName})
                    </option>
                  ))}
                </select>

                <div className="rounded-xl overflow-hidden border border-white/[0.08]">
                  <ImageWithFallback
                    src={compareSpeciesB.imageUrl}
                    alt={compareSpeciesB.indonesianName}
                    aspectRatioClass="aspect-[16/10]"
                  />
                </div>

                <div className="space-y-2 text-xs">
                  <h4 className="font-display text-lg text-white">{compareSpeciesB.indonesianName}</h4>
                  <div className="text-teal-400 font-mono text-[11px]">{compareSpeciesB.depthRange} · {compareSpeciesB.diet}</div>
                  <p className="text-slate-300 leading-relaxed">{compareSpeciesB.physicalCharacteristics}</p>
                  <p className="text-slate-400 leading-relaxed pt-2 border-t border-white/[0.06]">{compareSpeciesB.ecologicalRole}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
