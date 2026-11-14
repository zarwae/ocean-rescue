export type OceanNewsTopic =
  | 'Terumbu Karang'
  | 'Polusi Plastik'
  | 'Iklim & Arus'
  | 'Biota Laut'
  | 'Kebijakan & Konservasi';

export const ALL_OCEAN_NEWS_TOPICS: readonly OceanNewsTopic[] = [
  'Terumbu Karang',
  'Polusi Plastik',
  'Iklim & Arus',
  'Biota Laut',
  'Kebijakan & Konservasi',
];

export type NewsFeedFilter = 'for-you' | 'all' | 'saved';

export interface NewsComment {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface NewsEngagementState {
  likedIds: string[];
  savedIds: string[];
  readIds: string[];
  preferredTopics: OceanNewsTopic[];
  commentsByArticle: Record<string, NewsComment[]>;
}

export interface RankableNewsArticle {
  id: string;
  title: string;
  author: string;
  topic: OceanNewsTopic;
  publishDate: string;
  initialLikes: number;
}

export interface RankedNewsItem<T extends RankableNewsArticle> {
  article: T;
  score: number;
  reasonLabel: string | null;
  isLiked: boolean;
  isSaved: boolean;
  isRead: boolean;
}

const DEFAULT_REFERENCE_DATE_ISO = '2026-11-14';

function daysBetween(olderIso: string, newerIso: string): number {
  const olderMs = Date.parse(olderIso);
  const newerMs = Date.parse(newerIso);
  if (Number.isNaN(olderMs) || Number.isNaN(newerMs)) return 30;
  return Math.max(0, Math.round((newerMs - olderMs) / (1000 * 60 * 60 * 24)));
}

/**
 * Computes per-topic affinity weights from explicit topic preferences and
 * implicit reading signals (saves, likes, comments, reads).
 */
export function computeTopicAffinity(
  articles: readonly RankableNewsArticle[],
  engagement: NewsEngagementState
): Record<OceanNewsTopic, number> {
  const affinity: Record<OceanNewsTopic, number> = {
    'Terumbu Karang': 0,
    'Polusi Plastik': 0,
    'Iklim & Arus': 0,
    'Biota Laut': 0,
    'Kebijakan & Konservasi': 0,
  };

  const articleById = new Map<string, RankableNewsArticle>();
  for (const article of articles) {
    articleById.set(article.id, article);
  }

  for (const topic of engagement.preferredTopics) {
    if (topic in affinity) {
      affinity[topic] += 6;
    }
  }

  for (const id of engagement.savedIds) {
    const article = articleById.get(id);
    if (article) affinity[article.topic] += 4;
  }

  for (const id of engagement.likedIds) {
    const article = articleById.get(id);
    if (article) affinity[article.topic] += 3;
  }

  for (const [id, comments] of Object.entries(engagement.commentsByArticle)) {
    if (comments.length > 0) {
      const article = articleById.get(id);
      if (article) affinity[article.topic] += 2.5;
    }
  }

  for (const id of engagement.readIds) {
    const article = articleById.get(id);
    if (article) affinity[article.topic] += 1.5;
  }

  return affinity;
}

/**
 * Scores a single marine news article for a specific reader profile and returns
 * both the numeric score and a quiet human-readable reason label.
 */
export function scoreNewsArticle<T extends RankableNewsArticle>(
  article: T,
  allArticles: readonly T[],
  engagement: NewsEngagementState,
  affinityCache?: Record<OceanNewsTopic, number>,
  referenceDateIso: string = DEFAULT_REFERENCE_DATE_ISO
): RankedNewsItem<T> {
  const affinity = affinityCache ?? computeTopicAffinity(allArticles, engagement);
  const preferredSet = new Set(engagement.preferredTopics);
  const likedSet = new Set(engagement.likedIds);
  const savedSet = new Set(engagement.savedIds);
  const readSet = new Set(engagement.readIds);

  const highIntentTopics = new Set<OceanNewsTopic>();
  for (const candidate of allArticles) {
    if (likedSet.has(candidate.id) || savedSet.has(candidate.id)) {
      highIntentTopics.add(candidate.topic);
    }
  }

  const topicAffinity = affinity[article.topic] ?? 0;
  const ageDays = daysBetween(article.publishDate, referenceDateIso);
  const recencyBoost = Math.max(0, 4 - ageDays * 0.08);
  const qualityBaseline = Math.min(2.5, article.initialLikes / 120);

  const isLiked = likedSet.has(article.id);
  const isSaved = savedSet.has(article.id);
  const isRead = readSet.has(article.id);

  // Gently lift unread stories above already-read ones so the reader discovers fresh reporting
  const unreadBonus = isRead ? -0.9 : 1.25;

  const score = Number(
    (topicAffinity * 2.2 + recencyBoost + qualityBaseline + unreadBonus).toFixed(2)
  );

  let reasonLabel: string | null = null;
  if (preferredSet.has(article.topic)) {
    reasonLabel = 'Sesuai minat pilihanmu';
  } else if (highIntentTopics.has(article.topic) && !isLiked && !isSaved) {
    reasonLabel = 'Mirip berita yang Anda sukai atau simpan';
  } else if (topicAffinity > 0 && !isRead) {
    reasonLabel = 'Berdasarkan riwayat bacaanmu';
  } else if (ageDays <= 10) {
    reasonLabel = 'Terbaru hari ini';
  }

  return {
    article,
    score,
    reasonLabel,
    isLiked,
    isSaved,
    isRead,
  };
}

/**
 * Filters and ranks the marine news feed according to the active feed tab,
 * optional topic filter, and personal engagement profile.
 */
export function rankNewsFeed<T extends RankableNewsArticle>(
  articles: readonly T[],
  engagement: NewsEngagementState,
  feedFilter: NewsFeedFilter,
  topicFilter: OceanNewsTopic | 'Semua' = 'Semua',
  referenceDateIso: string = DEFAULT_REFERENCE_DATE_ISO
): RankedNewsItem<T>[] {
  const affinity = computeTopicAffinity(articles, engagement);
  const savedSet = new Set(engagement.savedIds);

  const filtered = articles.filter((article) => {
    if (feedFilter === 'saved' && !savedSet.has(article.id)) {
      return false;
    }
    if (topicFilter !== 'Semua' && article.topic !== topicFilter) {
      return false;
    }
    return true;
  });

  const scored = filtered.map((article) =>
    scoreNewsArticle(article, articles, engagement, affinity, referenceDateIso)
  );

  if (feedFilter === 'for-you') {
    return scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const dateCompare = b.article.publishDate.localeCompare(a.article.publishDate);
      if (dateCompare !== 0) return dateCompare;
      return b.article.initialLikes - a.article.initialLikes;
    });
  }

  return scored.sort((a, b) => {
    const dateCompare = b.article.publishDate.localeCompare(a.article.publishDate);
    if (dateCompare !== 0) return dateCompare;
    return b.score - a.score;
  });
}
