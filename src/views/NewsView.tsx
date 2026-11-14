import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  Heart,
  MessageSquare,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { OCEAN_NEWS_ARTICLES, OceanNewsArticle } from '../data/oceanNewsData';
import { useOceanNewsState } from '../hooks/useOceanNewsState';
import {
  ALL_OCEAN_NEWS_TOPICS,
  NewsFeedFilter,
  OceanNewsTopic,
  rankNewsFeed,
} from '../utils/newsRecommendation';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { soundEffects } from '../utils/soundEffects';

interface NewsViewProps {
  defaultAuthorName?: string;
  onAwardXp?: (amount: number, reason: string) => void;
}

function formatIndonesianDate(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCommentTime(isoTimestamp: string): string {
  const parsed = new Date(isoTimestamp);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const NewsView: React.FC<NewsViewProps> = ({
  defaultAuthorName = 'Ocean Explorer',
  onAwardXp,
}) => {
  const {
    state,
    markAsRead,
    toggleLike,
    toggleSave,
    togglePreferredTopic,
    addComment,
    deleteComment,
    resetPersonalization,
  } = useOceanNewsState();

  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<NewsFeedFilter>('for-you');
  const [topicFilter, setTopicFilter] = useState<OceanNewsTopic | 'Semua'>('Semua');
  const [showPreferences, setShowPreferences] = useState(false);

  // Comment composer local state
  const [commentAuthor, setCommentAuthor] = useState(defaultAuthorName);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const commentSectionRef = useRef<HTMLElement | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null);

  const rankedItems = useMemo(
    () => rankNewsFeed(OCEAN_NEWS_ARTICLES, state, feedFilter, topicFilter),
    [state, feedFilter, topicFilter]
  );

  const selectedArticle: OceanNewsArticle | null = useMemo(
    () => OCEAN_NEWS_ARTICLES.find((a) => a.id === selectedArticleId) ?? null,
    [selectedArticleId]
  );

  const nextRecommendations = useMemo(() => {
    if (!selectedArticle) return [];
    const ranked = rankNewsFeed(
      OCEAN_NEWS_ARTICLES.filter((a) => a.id !== selectedArticle.id),
      state,
      'for-you'
    );
    return ranked.slice(0, 2);
  }, [selectedArticle, state]);

  const handleOpenArticle = (articleId: string) => {
    const alreadyRead = state.readIds.includes(articleId);
    soundEffects.playBubblePop();
    markAsRead(articleId);
    if (!alreadyRead && onAwardXp) {
      onAwardXp(15, 'Membaca berita kelautan');
    }
    setCommentError(null);
    setCommentText('');
    setSelectedArticleId(articleId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    soundEffects.playBubblePop();
    setSelectedArticleId(null);
    setCommentError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLikeClick = (articleId: string) => {
    const wasLiked = state.likedIds.includes(articleId);
    const nextLiked = toggleLike(articleId);
    soundEffects.playBubblePop();
    if (!wasLiked && nextLiked && onAwardXp) {
      onAwardXp(5, 'Menyukai laporan berita laut');
    }
  };

  const handleSaveClick = (articleId: string) => {
    const wasSaved = state.savedIds.includes(articleId);
    const nextSaved = toggleSave(articleId);
    soundEffects.playBubblePop();
    if (!wasSaved && nextSaved && onAwardXp) {
      onAwardXp(5, 'Menyimpan berita kelautan');
    }
  };

  const handleCommentSubmit = (e: React.FormEvent, articleId: string) => {
    e.preventDefault();
    const res = addComment(articleId, commentAuthor, commentText);
    if (!res.ok) {
      setCommentError(res.error ?? 'Gagal mengirim komentar.');
      return;
    }
    soundEffects.playBubblePop();
    setCommentText('');
    setCommentError(null);
    if (onAwardXp) {
      onAwardXp(10, 'Berkomentar pada berita kelautan');
    }
  };

  const scrollToComments = () => {
    commentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 320);
  };

  // ============================================================================
  // MODE 2: FULL ARTICLE READER VIEW
  // ============================================================================
  if (selectedArticle) {
    const isLiked = state.likedIds.includes(selectedArticle.id);
    const isSaved = state.savedIds.includes(selectedArticle.id);
    const comments = state.commentsByArticle[selectedArticle.id] ?? [];
    const totalLikes = selectedArticle.initialLikes + (isLiked ? 1 : 0);

    return (
      <article className="pt-28 pb-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-200">
        {/* Clean Top Back Control */}
        <div className="mb-8">
          <button
            type="button"
            onClick={handleBackToList}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-teal)] transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Berita</span>
          </button>
        </div>

        {/* Unboxed Editorial Header Metadata */}
        <header className="space-y-5 pb-6 border-b border-[var(--border-hairline)]">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="font-medium text-[var(--accent-teal)]">{selectedArticle.topic}</span>
            <span aria-hidden="true">·</span>
            <span>{formatIndonesianDate(selectedArticle.publishDate)}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{selectedArticle.readTimeMinutes} menit baca</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] leading-[1.15] text-[var(--text-primary)] font-medium [text-wrap:balance]">
            {selectedArticle.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="text-sm text-[var(--text-secondary)]">
              <span className="font-medium text-[var(--text-primary)]">{selectedArticle.author}</span>
              <span className="mx-2 text-[var(--text-muted)]" aria-hidden="true">
                ·
              </span>
              <span className="text-xs text-[var(--text-muted)]">{selectedArticle.authorRole}</span>
            </div>
          </div>
        </header>

        {/* Hero Visual + Figure Caption */}
        <figure className="my-8 space-y-2.5">
          <ImageWithFallback
            src={selectedArticle.coverImage}
            alt={selectedArticle.title}
            fallbackSubject={selectedArticle.topic}
            aspectRatioClass="aspect-[16/9]"
            className="rounded-xl"
            loading="eager"
          />
          <figcaption className="text-xs font-display italic text-[var(--text-muted)] leading-relaxed">
            Fig. — {selectedArticle.figureCaption}
          </figcaption>
        </figure>

        {/* Interactive Reader Action Strip (Top) */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-[var(--border-hairline)] mb-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleLikeClick(selectedArticle.id)}
              aria-pressed={isLiked}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isLiked
                  ? 'bg-[var(--accent-coral)]/12 text-[var(--accent-coral)]'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{isLiked ? 'Disukai' : 'Suka'}</span>
              <span className="tabular-nums font-semibold">{totalLikes}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveClick(selectedArticle.id)}
              aria-pressed={isSaved}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isSaved
                  ? 'bg-[var(--accent-teal)]/15 text-[var(--accent-teal)]'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={scrollToComments}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Komentar</span>
            <span className="tabular-nums font-semibold">{comments.length}</span>
          </button>
        </div>

        {/* Long-form Editorial Prose (Optimal 65–75ch reading measure) */}
        <div className="max-w-prose space-y-6 text-base sm:text-[17px] leading-[1.78] text-[var(--text-primary)]">
          <p className="text-[var(--text-primary)] font-medium first-letter:text-5xl first-letter:font-display first-letter:font-semibold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.82] first-letter:text-[var(--accent-teal)]">
            {selectedArticle.summary}
          </p>

          {selectedArticle.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-[var(--text-secondary)]">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Quiet Hairline Key Facts Section (No thick left accent bars) */}
        <section className="max-w-prose mt-10 py-6 border-y border-[var(--border-hairline)] space-y-3">
          <h2 className="font-display text-lg text-[var(--text-primary)] font-medium">
            Catatan &amp; Fakta Utama
          </h2>
          <ul className="space-y-2.5 text-sm text-[var(--text-secondary)] leading-relaxed">
            {selectedArticle.keyFacts.map((fact, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-xs tabular-nums text-[var(--accent-teal)] font-semibold pt-0.5">
                  0{idx + 1}.
                </span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Bottom Like & Save Echo */}
        <div className="max-w-prose flex flex-wrap items-center justify-between gap-4 py-6 border-b border-[var(--border-hairline)]">
          <span className="text-xs text-[var(--text-muted)]">
            Interaksi Anda membantu menyusun rekomendasi berita terbaik di beranda Berita Laut.
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleLikeClick(selectedArticle.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isLiked
                  ? 'bg-[var(--accent-coral)]/12 text-[var(--accent-coral)]'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="tabular-nums">{totalLikes}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveClick(selectedArticle.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isSaved
                  ? 'bg-[var(--accent-teal)]/15 text-[var(--accent-teal)]'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
            </button>
          </div>
        </div>

        {/* Reader Comment Section */}
        <section ref={commentSectionRef} className="max-w-prose pt-10 space-y-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl text-[var(--text-primary)] font-medium">
              Diskusi Pembaca
            </h2>
            <span className="text-xs text-[var(--text-muted)] tabular-nums">
              {comments.length} komentar
            </span>
          </div>

          <form onSubmit={(e) => handleCommentSubmit(e, selectedArticle.id)} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label
                  htmlFor="news-comment-author"
                  className="block text-xs text-[var(--text-muted)] mb-1.5"
                >
                  Nama Anda
                </label>
                <input
                  id="news-comment-author"
                  type="text"
                  maxLength={50}
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  placeholder="Nama pembaca"
                  className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="news-comment-body"
                    className="block text-xs text-[var(--text-muted)]"
                  >
                    Tanggapan
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)] tabular-nums">
                    {commentText.length}/600
                  </span>
                </div>
                <textarea
                  ref={commentInputRef}
                  id="news-comment-body"
                  rows={3}
                  maxLength={600}
                  value={commentText}
                  onChange={(e) => {
                    setCommentText(e.target.value);
                    if (commentError) setCommentError(null);
                  }}
                  placeholder="Bagikan pendapat atau pertanyaan Anda mengenai laporan ini..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors resize-y"
                />
              </div>
            </div>

            {commentError && (
              <p role="alert" className="text-xs text-[var(--accent-coral)]">
                {commentError}
              </p>
            )}

            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#367D7B] hover:bg-[#267472] text-[#EDEBE3] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                Kirim Komentar
              </button>
            </div>
          </form>

          {/* Comment List */}
          {comments.length === 0 ? (
            <p className="py-6 text-sm text-[var(--text-muted)] border-t border-[var(--border-hairline)]">
              Belum ada komentar pada berita ini. Jadilah yang pertama membuka diskusi.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border-hairline)] border-t border-[var(--border-hairline)]">
              {comments.map((comment) => {
                const isUserOwned = comment.id.startsWith('user-c-');
                return (
                  <li key={comment.id} className="py-4 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-[var(--text-primary)]">
                          {comment.authorName}
                        </span>
                        <span className="text-[var(--text-muted)]" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-[var(--text-muted)] tabular-nums">
                          {formatCommentTime(comment.createdAt)}
                        </span>
                      </div>
                      {isUserOwned && (
                        <button
                          type="button"
                          onClick={() => deleteComment(selectedArticle.id, comment.id)}
                          aria-label="Hapus komentar"
                          className="text-[var(--text-muted)] hover:text-[var(--accent-coral)] p-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                      {comment.text}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Next Recommended Reads (Title + Author only) */}
        {nextRecommendations.length > 0 && (
          <section className="max-w-prose pt-12 mt-12 border-t border-[var(--border-hairline)] space-y-4">
            <h3 className="text-xs font-semibold tracking-wide text-[var(--text-muted)]">
              Direkomendasikan Selanjutnya Untuk Anda
            </h3>
            <div className="divide-y divide-[var(--border-hairline)]">
              {nextRecommendations.map(({ article }) => (
                <button
                  key={article.id}
                  type="button"
                  onClick={() => handleOpenArticle(article.id)}
                  className="w-full py-4 text-left group flex items-baseline justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="font-display text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors">
                      {article.title}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {article.author} · {article.topic}
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-teal)] shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </section>
        )}
      </article>
    );
  }

  // ============================================================================
  // MODE 1: CLEAN HEADLINE + AUTHOR NEWS FEED
  // ============================================================================
  const activeSignalsCount =
    state.preferredTopics.length +
    state.likedIds.length +
    state.savedIds.length +
    state.readIds.length;

  return (
    <section className="pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-200">
      {/* Calm Broadsheet Masthead */}
      <header className="space-y-3 pb-8">
        <p className="text-xs font-medium tracking-wide text-[var(--accent-teal)]">
          Jurnalisme &amp; Kabar Samudra
        </p>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[var(--text-primary)] font-medium [text-wrap:balance]">
          Berita Kelautan
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          Disusun ringkas menampilkan judul dan penulis agar nyaman dipindai. Urutan berita menyesuaikan minat serta riwayat bacaan Anda secara otomatis.
        </p>
      </header>

      {/* Clean Underline Controls + Optional Interest Picker */}
      <div className="border-b border-[var(--border-hairline)] pb-3 flex flex-wrap items-center justify-between gap-4">
        <div
          className="flex items-center gap-6 overflow-x-auto overflow-y-hidden self-end -mb-[13px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Filter Berita"
        >
          <button
            type="button"
            role="tab"
            aria-selected={feedFilter === 'for-you'}
            onClick={() => {
              soundEffects.playBubblePop();
              setFeedFilter('for-you');
            }}
            className={`relative pt-1 pb-3 border-b-2 text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              feedFilter === 'for-you'
                ? 'text-[var(--text-primary)] font-semibold border-[var(--accent-teal)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-transparent'
            }`}
          >
            Untuk Anda
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={feedFilter === 'all'}
            onClick={() => {
              soundEffects.playBubblePop();
              setFeedFilter('all');
            }}
            className={`relative pt-1 pb-3 border-b-2 text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              feedFilter === 'all'
                ? 'text-[var(--text-primary)] font-semibold border-[var(--accent-teal)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-transparent'
            }`}
          >
            Semua Berita
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={feedFilter === 'saved'}
            onClick={() => {
              soundEffects.playBubblePop();
              setFeedFilter('saved');
            }}
            className={`relative pt-1 pb-3 border-b-2 text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              feedFilter === 'saved'
                ? 'text-[var(--text-primary)] font-semibold border-[var(--accent-teal)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-transparent'
            }`}
          >
            Tersimpan <span className="tabular-nums opacity-75">({state.savedIds.length})</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowPreferences((prev) => !prev)}
          aria-expanded={showPreferences}
          className={`inline-flex items-center gap-2 text-xs font-medium py-1.5 px-3 rounded-full transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            showPreferences || state.preferredTopics.length > 0
              ? 'bg-[var(--accent-teal)]/12 text-[var(--accent-teal)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>
            Minat Topik
            {state.preferredTopics.length > 0 ? ` (${state.preferredTopics.length})` : ''}
          </span>
        </button>
      </div>

      {/* Expandable Inline Topic Preference & Filter Strip (Zero Clutter When Collapsed) */}
      {showPreferences && (
        <div className="py-5 border-b border-[var(--border-hairline)] space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-[var(--text-secondary)]">
              Pilih topik yang paling Anda minati untuk memprioritaskan rekomendasi di tab <strong className="font-medium text-[var(--text-primary)]">Untuk Anda</strong>:
            </p>
            {(activeSignalsCount > 0 || topicFilter !== 'Semua') && (
              <button
                type="button"
                onClick={() => {
                  resetPersonalization();
                  setTopicFilter('Semua');
                }}
                className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Atur ulang minat</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {ALL_OCEAN_NEWS_TOPICS.map((topic) => {
              const selected = state.preferredTopics.includes(topic);
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    soundEffects.playBubblePop();
                    togglePreferredTopic(topic);
                  }}
                  aria-pressed={selected}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    selected
                      ? 'bg-[#367D7B] text-[#EDEBE3]'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {selected && <Check className="w-3 h-3" />}
                  <span>{topic}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[var(--text-muted)]">
            <span>Saring daftar:</span>
            <button
              type="button"
              onClick={() => setTopicFilter('Semua')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                topicFilter === 'Semua'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium'
                  : 'hover:text-[var(--text-primary)]'
              }`}
            >
              Semua
            </button>
            {ALL_OCEAN_NEWS_TOPICS.map((topic) => (
              <button
                key={`filter-${topic}`}
                type="button"
                onClick={() => setTopicFilter(topic)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  topicFilter === topic
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium'
                    : 'hover:text-[var(--text-primary)]'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clean Minimal Headline + Author Feed List */}
      {rankedItems.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <p className="font-display text-xl text-[var(--text-primary)]">
            {feedFilter === 'saved'
              ? 'Belum ada berita yang Anda simpan.'
              : 'Tidak ada berita pada topik ini.'}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            {feedFilter === 'saved'
              ? 'Buka berita mana saja lalu tekan Simpan agar muncul di daftar bacaan Anda.'
              : 'Ubah pilihan topik untuk melihat laporan kelautan lainnya.'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setFeedFilter('for-you');
                setTopicFilter('Semua');
              }}
              className="px-4 py-2 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-xs font-medium text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Lihat Rekomendasi Untuk Anda
            </button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-hairline)]">
          {rankedItems.map(({ article, reasonLabel, isLiked, isSaved, isRead }) => {
            return (
              <button
                key={article.id}
                type="button"
                onClick={() => handleOpenArticle(article.id)}
                className="w-full py-5 sm:py-6 px-2 -mx-2 rounded-lg text-left group hover:bg-[var(--bg-surface)]/55 transition-colors cursor-pointer flex items-start justify-between gap-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-teal)]"
              >
                <div className="space-y-1.5 min-w-0">
                  {/* Primary Visual Focus: Headline */}
                  <h2
                    className={`font-display text-lg sm:text-xl lg:text-[22px] leading-snug transition-colors [text-wrap:balance] ${
                      isRead
                        ? 'text-[var(--text-secondary)] group-hover:text-[var(--accent-teal)]'
                        : 'text-[var(--text-primary)] group-hover:text-[var(--accent-teal)]'
                    }`}
                  >
                    {article.title}
                  </h2>

                  {/* Secondary Focus: Author + Unboxed Minimal Metadata */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-[13px] text-[var(--text-secondary)]">
                    <span className="font-medium text-[var(--text-primary)]">{article.author}</span>
                    <span className="text-[var(--text-muted)]" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-[var(--text-muted)]">{article.topic}</span>
                    <span className="text-[var(--text-muted)]" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-[var(--text-muted)]">
                      {formatIndonesianDate(article.publishDate)}
                    </span>
                    {feedFilter === 'for-you' && reasonLabel && (
                      <>
                        <span className="text-[var(--text-muted)]" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-[var(--accent-teal)] font-medium">{reasonLabel}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Discreet Saved / Liked / Open Indicator */}
                <div className="flex items-center gap-2.5 pt-1 shrink-0 text-[var(--text-muted)]">
                  {isLiked && (
                    <Heart
                      className="w-3.5 h-3.5 text-[var(--accent-coral)] fill-current"
                      aria-label="Disukai"
                    />
                  )}
                  {isSaved && (
                    <Bookmark
                      className="w-3.5 h-3.5 text-[var(--accent-teal)] fill-current"
                      aria-label="Tersimpan"
                    />
                  )}
                  <ArrowUpRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:text-[var(--accent-teal)] transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
