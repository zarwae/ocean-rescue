import React, { useState, useMemo } from 'react';
import {
  Search,
  Heart,
  Shuffle,
  ArrowLeftRight,
  X,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
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
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const [selectedSpecies, setSelectedSpecies] = useState<MarineSpecies | null>(null);

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
      const matchFav = !onlyFavorites || favoriteSpecies.includes(sp.id);

      return matchSearch && matchCategory && matchFav;
    });
  }, [searchQuery, selectedCategory, onlyFavorites, favoriteSpecies]);

  const handleRandomDiscovery = () => {
    const randomIndex = Math.floor(Math.random() * SPECIES_DATABASE.length);
    setSelectedSpecies(SPECIES_DATABASE[randomIndex]);
    soundEffects.playBubblePop();
  };

  const getIucnColor = (status: string) => {
    if (status.includes('Critically Endangered') || status.includes('Endangered')) {
      return 'text-[var(--accent-coral)]';
    }
    if (status.includes('Vulnerable')) return 'text-[var(--accent-sand)]';
    return 'text-[var(--accent-teal)]';
  };

  const spotlightSpecies = SPECIES_DATABASE[0];

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] pt-28 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* OPEN EDITORIAL SPOTLIGHT (No Outer Box) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pb-10 border-b border-[var(--border-hairline)]">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs uppercase tracking-widest text-[var(--accent-teal)] font-semibold block">
              Museum Biota Samudra · 32 Spesies
            </span>
            <h1 className="font-display text-4xl sm:text-5xl text-[var(--text-primary)] tracking-tight">
              {spotlightSpecies.indonesianName}
            </h1>
            <div className="text-xs italic text-[var(--text-muted)]">
              {spotlightSpecies.scientificName} · {spotlightSpecies.category}
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
              {spotlightSpecies.physicalCharacteristics} {spotlightSpecies.ecologicalRole}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  setSelectedSpecies(spotlightSpecies);
                  soundEffects.playBubblePop();
                }}
                className="px-6 py-2.5 rounded-full bg-[#367D7B] hover:bg-[#267472] text-[#EDEBE3] font-semibold text-xs tracking-wide transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Buka Lembar Fakta</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleRandomDiscovery}
                className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Shuffle className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
                <span>Temukan Spesies Acak</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl overflow-hidden shadow-xl">
            <ImageWithFallback
              src={spotlightSpecies.imageUrl}
              alt={spotlightSpecies.indonesianName}
              aspectRatioClass="aspect-[16/11]"
              loading="eager"
            />
          </div>
        </div>

        {/* MINIMAL SEARCH & CONTROLS */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-96 border-b border-[var(--border-hairline)] focus-within:border-[var(--accent-teal)] transition-colors">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-0 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari spesies, nama latin, atau habitat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-2.5 bg-transparent text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-5 text-xs">
              <button
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                  onlyFavorites
                    ? 'text-[var(--accent-coral)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current' : ''}`} />
                <span>Favorit ({favoriteSpecies.length})</span>
              </button>

              <button
                onClick={() => setIsComparing(true)}
                className="inline-flex items-center gap-1.5 font-medium text-[var(--accent-teal)] hover:underline cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Bandingkan Spesies</span>
              </button>
            </div>
          </div>

          {/* Clean Underline Category Tabs */}
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none border-b border-[var(--border-hairline)]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`pb-3 text-xs font-medium whitespace-nowrap cursor-pointer border-b-2 -mb-px transition-colors ${
                  selectedCategory === cat
                    ? 'border-[var(--accent-teal)] text-[var(--text-primary)] font-semibold'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {cat === 'All' ? 'Semua (32)' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* BORDERLESS GALLERY SHOWCASE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {filteredSpecies.map((sp) => {
            const isFav = favoriteSpecies.includes(sp.id);
            return (
              <div
                key={sp.id}
                onClick={() => {
                  setSelectedSpecies(sp);
                  soundEffects.playBubblePop();
                }}
                className="group flex flex-col justify-between cursor-pointer space-y-3"
              >
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden shadow-md">
                    <ImageWithFallback
                      src={sp.imageUrl}
                      alt={sp.indonesianName}
                      className="group-hover:scale-105 transition-transform duration-700"
                      aspectRatioClass="aspect-[16/11]"
                    />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(sp.id);
                        soundEffects.playChime(1);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 rounded-full bg-[#061116]/75 backdrop-blur-sm hover:scale-110 transition-transform cursor-pointer"
                      title={isFav ? 'Hapus dari favorit' : 'Simpan ke favorit'}
                      aria-label="Favorit"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-[#D98270] fill-[#D98270]' : 'text-[#EDEBE3]/80'}`} />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                      <span>{sp.taxonomy.class}</span>
                      <span aria-hidden="true">·</span>
                      <span>{sp.depthRange}</span>
                    </div>

                    <h3 className="font-display font-medium text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors">
                      {sp.indonesianName}
                    </h3>

                    <div className="text-xs italic text-[var(--text-muted)]">
                      {sp.scientificName}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-between text-[11px]">
                  <span className={`font-medium ${getIucnColor(sp.iucnStatus)}`}>
                    {sp.iucnStatus.split(' ')[0]} {sp.iucnStatus.match(/\((.*?)\)/)?.[0]}
                  </span>
                  <span className="text-[var(--accent-teal)] group-hover:translate-x-0.5 transition-transform font-medium">
                    Detail &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSpecies.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <p className="text-sm text-[var(--text-secondary)]">
              Tidak ada biota yang cocok dengan kriteria pencarian.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setOnlyFavorites(false);
              }}
              className="text-xs text-[var(--accent-teal)] hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* CLEAN SPECIES DOSSIER MODAL */}
      {selectedSpecies && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto"
          onClick={() => setSelectedSpecies(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-2xl overflow-hidden shadow-2xl my-8 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 sm:h-72 w-full overflow-hidden">
              <ImageWithFallback
                src={selectedSpecies.imageUrl}
                alt={selectedSpecies.indonesianName}
                aspectRatioClass="h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061116]/90 via-[#061116]/30 to-transparent" />

              <button
                onClick={() => setSelectedSpecies(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#061116]/75 text-[#EDEBE3] hover:text-[#D98270] transition-colors cursor-pointer"
                aria-label="Tutup Detail"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-5 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-[#EDEBE3]">
                <div>
                  <span className="text-[11px] text-[#82AAA1] uppercase tracking-wider block">
                    {selectedSpecies.category} · {selectedSpecies.taxonomy.class}
                  </span>
                  <h2 className="font-display text-3xl text-[#EDEBE3]">
                    {selectedSpecies.indonesianName}
                  </h2>
                  <div className="text-xs italic text-[#EDEBE3]/80">
                    {selectedSpecies.scientificName} ({selectedSpecies.commonName})
                  </div>
                </div>
                <span className="text-xs font-medium text-[#C7B99E]">
                  IUCN: {selectedSpecies.iucnStatus}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-5 border-b border-[var(--border-hairline)] text-xs">
                <div>
                  <dt className="text-[11px] text-[var(--text-muted)]">Kedalaman</dt>
                  <dd className="font-medium mt-0.5">{selectedSpecies.depthRange}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-[var(--text-muted)]">Pola Makan</dt>
                  <dd className="font-medium text-[var(--accent-teal)] mt-0.5">{selectedSpecies.diet}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-[var(--text-muted)]">Famili</dt>
                  <dd className="font-medium mt-0.5">{selectedSpecies.taxonomy.family}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-[var(--text-muted)]">Persebaran</dt>
                  <dd className="font-medium truncate mt-0.5" title={selectedSpecies.geographicDistribution}>
                    {selectedSpecies.geographicDistribution}
                  </dd>
                </div>
              </dl>

              <div className="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                <h4 className="font-display text-base text-[var(--text-primary)] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--accent-teal)]" />
                  <span>Karakteristik &amp; Peran Ekologis</span>
                </h4>
                <p>{selectedSpecies.physicalCharacteristics}</p>
                <p>
                  <strong className="text-[var(--accent-teal)] font-semibold">Peran Ekologis: </strong>
                  {selectedSpecies.ecologicalRole}
                </p>
              </div>

              <div className="space-y-2 text-xs text-[var(--text-secondary)]">
                <h4 className="font-display text-base text-[var(--accent-coral)] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Ancaman Utama</span>
                </h4>
                <ul className="space-y-1.5">
                  {selectedSpecies.conservationThreats.map((threat, idx) => (
                    <li key={idx}>· {threat}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Fotografer: {selectedSpecies.imagePhotographer}</span>
                <button
                  onClick={() => {
                    onToggleFavorite(selectedSpecies.id);
                    soundEffects.playChime(1);
                  }}
                  className="text-[var(--accent-teal)] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Heart className={`w-3.5 h-3.5 ${favoriteSpecies.includes(selectedSpecies.id) ? 'fill-current text-[var(--accent-coral)]' : ''}`} />
                  <span>{favoriteSpecies.includes(selectedSpecies.id) ? 'Disimpan' : 'Simpan ke Favorit'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPARISON MODAL */}
      {isComparing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto"
          onClick={() => setIsComparing(false)}
        >
          <div
            className="relative w-full max-w-5xl bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-2xl overflow-hidden shadow-2xl my-8 p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-[var(--accent-teal)]" />
                <h3 className="font-display font-medium text-xl">Komparasi Biota Laut</h3>
              </div>
              <button
                onClick={() => setIsComparing(false)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                aria-label="Tutup Komparasi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: 'Spesies A', sp: compareSpeciesA, setSp: setCompareSpeciesA },
                { label: 'Spesies B', sp: compareSpeciesB, setSp: setCompareSpeciesB },
              ].map(({ label, sp, setSp }) => (
                <div key={label} className="space-y-4">
                  <div className="border-b border-[var(--border-hairline)] pb-1">
                    <label className="text-[11px] text-[var(--text-muted)] block mb-1">{label}</label>
                    <select
                      value={sp.id}
                      onChange={(e) => {
                        const found = SPECIES_DATABASE.find((s) => s.id === e.target.value);
                        if (found) setSp(found);
                      }}
                      className="w-full py-1.5 bg-transparent text-xs font-medium text-[var(--text-primary)] focus:outline-none cursor-pointer"
                    >
                      {SPECIES_DATABASE.map((s) => (
                        <option key={s.id} value={s.id} className="bg-[var(--bg-elevated)] text-[var(--text-primary)]">
                          {s.indonesianName} ({s.scientificName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-xl overflow-hidden shadow-md">
                    <ImageWithFallback
                      src={sp.imageUrl}
                      alt={sp.indonesianName}
                      aspectRatioClass="aspect-[16/10]"
                    />
                  </div>

                  <div className="space-y-2 text-xs">
                    <h4 className="font-display text-lg">{sp.indonesianName}</h4>
                    <div className="text-[var(--accent-teal)] text-[11px]">
                      {sp.depthRange} · {sp.diet}
                    </div>
                    <p className="text-[var(--text-secondary)] leading-relaxed">{sp.physicalCharacteristics}</p>
                    <p className="text-[var(--text-muted)] leading-relaxed pt-2 border-t border-[var(--border-hairline)]">
                      {sp.ecologicalRole}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
