import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeTopicAffinity,
  NewsEngagementState,
  RankableNewsArticle,
  rankNewsFeed,
} from './newsRecommendation.ts';

const SAMPLE_ARTICLES: RankableNewsArticle[] = [
  {
    id: 'a-coral-1',
    title: 'Karang Tahan Panas di Raja Ampat',
    author: 'Nadia Kusuma',
    topic: 'Terumbu Karang',
    publishDate: '2026-11-12',
    initialLikes: 100,
  },
  {
    id: 'a-plastic-1',
    title: 'Penghalang Sampah di Muara',
    author: 'Dimas Adiputra',
    topic: 'Polusi Plastik',
    publishDate: '2026-11-11',
    initialLikes: 110,
  },
  {
    id: 'a-plastic-2',
    title: 'Mikroplastik di Akar Mangrove',
    author: 'Nadia Kusuma',
    topic: 'Polusi Plastik',
    publishDate: '2026-10-28',
    initialLikes: 95,
  },
  {
    id: 'a-biota-1',
    title: 'Migrasi Pari Manta Laut Sawu',
    author: 'Siti Rahma',
    topic: 'Biota Laut',
    publishDate: '2026-11-05',
    initialLikes: 180,
  },
];

const EMPTY_STATE: NewsEngagementState = {
  likedIds: [],
  savedIds: [],
  readIds: [],
  preferredTopics: [],
  commentsByArticle: {},
};

test('computeTopicAffinity sums explicit preferences and implicit engagement weights accurately', () => {
  const state: NewsEngagementState = {
    likedIds: ['a-plastic-1'], // +3 Polusi Plastik
    savedIds: ['a-coral-1'], // +4 Terumbu Karang
    readIds: ['a-biota-1'], // +1.5 Biota Laut
    preferredTopics: ['Terumbu Karang'], // +6 Terumbu Karang
    commentsByArticle: {
      'a-plastic-2': [
        {
          id: 'c1',
          authorName: 'Tester',
          text: 'Bagus',
          createdAt: '2026-11-12T00:00:00Z',
        },
      ], // +2.5 Polusi Plastik
    },
  };

  const affinity = computeTopicAffinity(SAMPLE_ARTICLES, state);
  assert.equal(affinity['Terumbu Karang'], 10);
  assert.equal(affinity['Polusi Plastik'], 5.5);
  assert.equal(affinity['Biota Laut'], 1.5);
  assert.equal(affinity['Iklim & Arus'], 0);
});

test('rankNewsFeed prioritizes unread matching topics when user likes and saves plastic stories', () => {
  const state: NewsEngagementState = {
    ...EMPTY_STATE,
    likedIds: ['a-plastic-1'],
    savedIds: ['a-plastic-1'],
    readIds: ['a-plastic-1'],
  };

  const ranked = rankNewsFeed(SAMPLE_ARTICLES, state, 'for-you', 'Semua', '2026-11-14');
  // Unread Polusi Plastik story ('a-plastic-2') gets high affinity + unread bonus -> first
  assert.equal(ranked[0].article.id, 'a-plastic-2');
  assert.equal(ranked[0].reasonLabel, 'Mirip berita yang Anda sukai atau simpan');
  // Read liked/saved story stays above unrelated topics because topic affinity weight dominates
  assert.equal(ranked[1].article.id, 'a-plastic-1');
});

test('rankNewsFeed filters saved tab strictly to savedIds', () => {
  const state: NewsEngagementState = {
    ...EMPTY_STATE,
    savedIds: ['a-biota-1'],
  };

  const savedFeed = rankNewsFeed(SAMPLE_ARTICLES, state, 'saved', 'Semua', '2026-11-14');
  assert.equal(savedFeed.length, 1);
  assert.equal(savedFeed[0].article.id, 'a-biota-1');
  assert.equal(savedFeed[0].isSaved, true);
});

test('rankNewsFeed explicit topic preference surfaces topic articles cleanly', () => {
  const state: NewsEngagementState = {
    ...EMPTY_STATE,
    preferredTopics: ['Biota Laut'],
  };

  const ranked = rankNewsFeed(SAMPLE_ARTICLES, state, 'for-you', 'Semua', '2026-11-14');
  assert.equal(ranked[0].article.id, 'a-biota-1');
  assert.equal(ranked[0].reasonLabel, 'Sesuai minat pilihanmu');
});
