import React, { useState, useMemo } from 'react';
import { Search, Clock, Calendar, ArrowRight, ChevronLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] pt-28 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-10">

        {selectedArticle ? (
          <article className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
            <button
              onClick={() => {
                setSelectedArticle(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali ke Katalog Pustaka</span>
            </button>

            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="text-[var(--accent-teal)] font-medium">
                  {selectedArticle.category}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedArticle.readTimeMinutes} Menit Membaca
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedArticle.publishDate}
                </span>
              </div>

              <h1 className="font-display font-light text-3xl sm:text-5xl text-[var(--text-primary)] leading-tight tracking-tight">
                {selectedArticle.title}
              </h1>

              <div className="text-xs text-[var(--text-muted)]">
                Ditulis oleh {selectedArticle.author}
              </div>
            </header>

            <div className="rounded-2xl overflow-hidden bg-[var(--bg-surface)]">
              <ImageWithFallback
                src={selectedArticle.coverImage}
                alt={selectedArticle.title}
                aspectRatioClass="aspect-[16/9]"
              />
            </div>

            <div className="space-y-6 max-w-prose">
              <p className="font-display text-lg sm:text-xl text-[var(--text-primary)] leading-relaxed">
                {selectedArticle.leadParagraph}
              </p>

              {selectedArticle.contentSections.map((sec, idx) => (
                <section key={idx} className="space-y-2 pt-2">
                  <h2 className="font-display font-medium text-xl text-[var(--text-primary)]">
                    {sec.heading}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {sec.body}
                  </p>
                </section>
              ))}
            </div>

            <div className="pt-6 border-t border-[var(--border-hairline)] text-xs text-[var(--text-muted)] space-y-1">
              <span className="font-medium text-[var(--text-primary)] block">Rujukan Publikasi:</span>
              <div>{selectedArticle.references.join(' · ')}</div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  setSelectedArticle(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-2.5 rounded-full bg-[#367D7B] hover:bg-[#267472] text-[#EDEBE3] text-xs font-semibold transition-colors cursor-pointer"
              >
                Kembali ke Katalog Pustaka
              </button>
            </div>
          </article>
        ) : (
          <>
            {/* Editorial Header */}
            <header className="space-y-3 max-w-3xl">
              <div className="text-[11px] font-medium tracking-[0.22em] text-[var(--accent-teal)] uppercase">
                Pustaka Riset · SDG 14
              </div>
              <h1 className="font-display font-light text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight">
                Pustaka Pengetahuan Samudra
              </h1>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Dua belas esai sains terkurasi mengenai pilar konservasi laut, pemanasan global, dan keanekaragaman hayati samudra.
              </p>
            </header>

            {/* Hairline Search + Underline Category Tabs */}
            <div className="space-y-5">
              <div className="relative max-w-md border-b border-[var(--border-hairline)]">
                <Search className="w-4 h-4 absolute left-0 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Cari judul atau tema artikel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2 py-2.5 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 overflow-x-auto border-b border-[var(--border-hairline)]">
                {categories.map((c) => {
                  const active = selectedCategory === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`pb-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer relative ${
                        active
                          ? 'text-[var(--text-primary)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {c}
                      {active && (
                        <span className="absolute bottom-0 inset-x-0 h-[1.5px] bg-[var(--accent-teal)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Borderless Editorial Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {filteredArticles.map((art) => (
                <article
                  key={art.id}
                  onClick={() => {
                    setSelectedArticle(art);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group flex flex-col justify-between space-y-4 cursor-pointer"
                >
                  <div className="space-y-4">
                    <div className="rounded-xl overflow-hidden bg-[var(--bg-surface)]">
                      <ImageWithFallback
                        src={art.coverImage}
                        alt={art.title}
                        className="group-hover:scale-105 transition-transform duration-700"
                        aspectRatioClass="aspect-[16/10]"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                        <span className="text-[var(--accent-teal)] font-medium uppercase tracking-wider">
                          {art.category}
                        </span>
                        <span>{art.readTimeMinutes} Menit Baca</span>
                      </div>

                      <h3 className="font-display font-medium text-xl text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors leading-snug">
                        {art.title}
                      </h3>

                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                        {art.leadParagraph}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-[var(--border-hairline)] text-[var(--text-muted)]">
                    <span>{art.publishDate}</span>
                    <span className="text-[var(--accent-teal)] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-medium">
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
