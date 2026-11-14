import { useState, useEffect, useCallback } from 'react';
import {
  ALL_OCEAN_NEWS_TOPICS,
  NewsComment,
  NewsEngagementState,
  OceanNewsTopic,
} from '../utils/newsRecommendation';
import { OCEAN_NEWS_ARTICLES } from '../data/oceanNewsData';

const STORAGE_KEY = 'ocean_rescue_news_state_v1';

function buildInitialCommentsMap(): Record<string, NewsComment[]> {
  const initial: Record<string, NewsComment[]> = {};
  for (const article of OCEAN_NEWS_ARTICLES) {
    if (article.initialComments.length > 0) {
      initial[article.id] = [...article.initialComments];
    }
  }
  return initial;
}

const DEFAULT_NEWS_STATE: NewsEngagementState = {
  likedIds: [],
  savedIds: [],
  readIds: [],
  preferredTopics: [],
  commentsByArticle: buildInitialCommentsMap(),
};

function sanitizeLoadedState(raw: unknown): NewsEngagementState {
  if (!raw || typeof raw !== 'object') return DEFAULT_NEWS_STATE;
  const parsed = raw as Partial<NewsEngagementState>;

  const validTopicsSet = new Set<string>(ALL_OCEAN_NEWS_TOPICS);
  const preferredTopics = Array.isArray(parsed.preferredTopics)
    ? parsed.preferredTopics.filter(
        (t): t is OceanNewsTopic => typeof t === 'string' && validTopicsSet.has(t)
      )
    : [];

  const commentsByArticle: Record<string, NewsComment[]> = {
    ...buildInitialCommentsMap(),
  };

  if (parsed.commentsByArticle && typeof parsed.commentsByArticle === 'object') {
    for (const [articleId, list] of Object.entries(parsed.commentsByArticle)) {
      if (!Array.isArray(list)) continue;
      commentsByArticle[articleId] = list.filter(
        (item): item is NewsComment =>
          Boolean(item) &&
          typeof item.id === 'string' &&
          typeof item.authorName === 'string' &&
          typeof item.text === 'string' &&
          typeof item.createdAt === 'string'
      );
    }
  }

  return {
    likedIds: Array.isArray(parsed.likedIds)
      ? parsed.likedIds.filter((id): id is string => typeof id === 'string')
      : [],
    savedIds: Array.isArray(parsed.savedIds)
      ? parsed.savedIds.filter((id): id is string => typeof id === 'string')
      : [],
    readIds: Array.isArray(parsed.readIds)
      ? parsed.readIds.filter((id): id is string => typeof id === 'string')
      : [],
    preferredTopics,
    commentsByArticle,
  };
}

export function useOceanNewsState() {
  const [state, setState] = useState<NewsEngagementState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return sanitizeLoadedState(JSON.parse(stored));
      }
    } catch {
      // Fallback safely to default state
    }
    return DEFAULT_NEWS_STATE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [state]);

  const markAsRead = useCallback((articleId: string) => {
    setState((prev) => {
      if (prev.readIds.includes(articleId)) return prev;
      return {
        ...prev,
        readIds: [...prev.readIds, articleId],
      };
    });
  }, []);

  const toggleLike = useCallback((articleId: string): boolean => {
    let nextLiked = false;
    setState((prev) => {
      const exists = prev.likedIds.includes(articleId);
      nextLiked = !exists;
      return {
        ...prev,
        likedIds: exists
          ? prev.likedIds.filter((id) => id !== articleId)
          : [...prev.likedIds, articleId],
      };
    });
    return nextLiked;
  }, []);

  const toggleSave = useCallback((articleId: string): boolean => {
    let nextSaved = false;
    setState((prev) => {
      const exists = prev.savedIds.includes(articleId);
      nextSaved = !exists;
      return {
        ...prev,
        savedIds: exists
          ? prev.savedIds.filter((id) => id !== articleId)
          : [...prev.savedIds, articleId],
      };
    });
    return nextSaved;
  }, []);

  const togglePreferredTopic = useCallback((topic: OceanNewsTopic) => {
    setState((prev) => {
      const exists = prev.preferredTopics.includes(topic);
      return {
        ...prev,
        preferredTopics: exists
          ? prev.preferredTopics.filter((t) => t !== topic)
          : [...prev.preferredTopics, topic],
      };
    });
  }, []);

  const addComment = useCallback(
    (
      articleId: string,
      authorName: string,
      text: string
    ): { ok: boolean; error?: string } => {
      const cleanText = text.trim();
      const cleanAuthor = authorName.trim() || 'Pembaca Samudra';

      if (!cleanText) {
        return { ok: false, error: 'Tulis komentar terlebih dahulu sebelum mengirim.' };
      }
      if (cleanText.length > 600) {
        return { ok: false, error: 'Komentar maksimal 600 karakter.' };
      }

      const newComment: NewsComment = {
        id: `user-c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        authorName: cleanAuthor.slice(0, 50),
        text: cleanText,
        createdAt: new Date().toISOString(),
      };

      setState((prev) => {
        const existing = prev.commentsByArticle[articleId] ?? [];
        return {
          ...prev,
          commentsByArticle: {
            ...prev.commentsByArticle,
            [articleId]: [newComment, ...existing],
          },
        };
      });

      return { ok: true };
    },
    []
  );

  const deleteComment = useCallback((articleId: string, commentId: string) => {
    setState((prev) => {
      const existing = prev.commentsByArticle[articleId] ?? [];
      return {
        ...prev,
        commentsByArticle: {
          ...prev.commentsByArticle,
          [articleId]: existing.filter((c) => c.id !== commentId),
        },
      };
    });
  }, []);

  const resetPersonalization = useCallback(() => {
    setState((prev) => ({
      ...prev,
      readIds: [],
      preferredTopics: [],
    }));
  }, []);

  return {
    state,
    markAsRead,
    toggleLike,
    toggleSave,
    togglePreferredTopic,
    addComment,
    deleteComment,
    resetPersonalization,
  };
}
