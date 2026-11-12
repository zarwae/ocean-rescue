import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Clock, 
  Calendar, 
  ArrowRight, 
  ChevronLeft
} from 'lucide-react';
import { ARTICLES_DATABASE, KnowledgeArticle } from '../data/articlesData';
import { ImageWithFallback } from '../components/ImageWithFallback';

export const KnowledgeView: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categories = useMemo(() => {
    const cats = new Set(ARTICLES_DATABASE.map((a) => a.category));
    return ['Semua', ...Array.from(cats)];
  }, []);

  const filteredArticles = useMemo(() => {
    return ARTICLES_DATABASE.filter((art) => {
      const matchSearch = 
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.leadParagraph.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === 'Semua' || art.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#040D14] text-[#F1F5F9] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* If reader mode is open, show article detail */}
        {selectedArticle ? (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
            
            {/* Back button */}
            <button
              onClick={() => {
                setSelectedArticle(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.1] text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali ke Katalog Pustaka</span>
            </button>

            {/* Article Header */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
                <span className="text-teal-400 font-medium">
                  {selectedArticle.category}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedArticle.readTimeMinutes} Menit Membaca
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedArticle.publishDate}
                </span>
              </div>

              <h1 className="font-display font-medium text-3xl sm:text-5xl text-white leading-tight tracking-tight">
                {selectedArticle.title}
              </h1>

              <div className="text-xs text-slate-400 font-mono">
                Penulis: {selectedArticle.author}
              </div>
            </div>

            {/* Featured Image */}
            <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
              <ImageWithFallback
                src={selectedArticle.coverImage}
                alt={selectedArticle.title}
                aspectRatioClass="aspect-[16/9]"
              />
            </div>

            {/* Article Body */}
            <div className="space-y-6 text-sm text-slate-300 leading-relaxed max-w-prose">
              <p className="text-base text-slate-200 font-medium leading-relaxed border-l-2 border-teal-400 pl-4 py-1">
                {selectedArticle.leadParagraph}
              </p>

              {selectedArticle.contentSections.map((sec, idx) => (
                <div key={idx} className="space-y-2 pt-2">
                  <h3 className="font-display font-medium text-xl text-white">
                    {sec.heading}
                  </h3>
                  <p className="text-slate-300 leading-relaxed text-sm">
                    {sec.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Scientific References */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] text-xs text-slate-400 font-mono space-y-1">
              <span className="font-medium text-slate-200 block">Rujukan Publikasi & Sumber:</span>
              <div>{selectedArticle.references.join(' • ')}</div>
            </div>

            {/* Back button bottom */}
            <div className="pt-6 border-t border-white/[0.08] text-center">
              <button
                onClick={() => {
                  setSelectedArticle(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-2.5 rounded-lg bg-teal-400 text-slate-950 text-xs font-semibold hover:bg-teal-300 transition-all cursor-pointer"
              >
                Kembali ke Katalog Pustaka
              </button>
            </div>

          </div>
        ) : (
          /* Articles Catalog Overview */
          <>
            {/* Header */}
            <div className="space-y-3 max-w-3xl">
              <div className="text-xs text-teal-400 font-medium tracking-wide">
                Pustaka Riset & Artikel Sains · SDG 14
              </div>
              <h1 className="font-display text-4xl sm:text-6xl text-white tracking-tight">
                Pustaka Pengetahuan Samudra
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Jurnal artikel sains editorial mendalam mengenai 12 topik pilar SDG 14: Life Below Water, ditulis dengan fakta terverifikasi dan bahasa yang mudah dipahami.
              </p>
            </div>

            {/* Search and Category Filter */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cari artikel ilmiah berdasarkan judul, kata kunci, atau tema..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400/80 transition-colors"
                  />
                </div>

                <div className="md:col-span-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.1] text-xs text-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c} className="bg-[#040D14]">
                        {c === 'Semua' ? 'Semua Kategori Jurnal' : c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Category Chips */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.06]">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      selectedCategory === c
                        ? 'bg-white/[0.12] text-white border border-white/[0.15]'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles Grid (12 Articles) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((art) => (
                <article
                  key={art.id}
                  className="group rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-teal-400/40 hover:bg-white/[0.04] transition-all flex flex-col justify-between overflow-hidden shadow-lg cursor-pointer"
                  onClick={() => {
                    setSelectedArticle(art);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div>
                    <div className="overflow-hidden">
                      <ImageWithFallback
                        src={art.coverImage}
                        alt={art.title}
                        className="group-hover:scale-105 transition-transform duration-700"
                        aspectRatioClass="aspect-[16/10]"
                      />
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span className="text-teal-400 font-medium">{art.category}</span>
                        <span>{art.readTimeMinutes} Min Baca</span>
                      </div>

                      <h3 className="font-display font-medium text-lg text-white group-hover:text-teal-300 transition-colors leading-snug">
                        {art.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {art.leadParagraph}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center justify-between text-xs border-t border-white/[0.06] mt-4 pt-3 text-slate-500 font-mono">
                    <span>{art.publishDate}</span>
                    <span className="text-teal-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-medium">
                      Baca Lengkap <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
};
