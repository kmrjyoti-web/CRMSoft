import { FeedRankerService, RankableItem, UserContext } from '../application/services/feed-ranker.service';

describe('FeedRankerService', () => {
  let service: FeedRankerService;

  beforeEach(() => {
    service = new FeedRankerService();
  });

  const makeItem = (overrides: Partial<RankableItem> = {}): RankableItem => ({
    id: 'item-1',
    type: 'POST',
    createdAt: new Date(),
    viewCount: 100,
    likeCount: 10,
    commentCount: 5,
    shareCount: 2,
    ...overrides,
  });

  const makeCtx = (overrides: Partial<UserContext> = {}): UserContext => ({
    userId: 'user-1',
    followingIds: [],
    interactedCategoryIds: [],
    ...overrides,
  });

  // ─── recencyScore ──────────────────────────────────────────────────────────

  describe('recencyScore', () => {
    it('returns 1.0 for items created < 1 hour ago', () => {
      const recent = new Date(Date.now() - 30 * 60 * 1000);
      expect(service.recencyScore(recent)).toBe(1.0);
    });

    it('returns 0.8 for items created 1-6 hours ago', () => {
      const recent = new Date(Date.now() - 3 * 60 * 60 * 1000);
      expect(service.recencyScore(recent)).toBe(0.8);
    });

    it('returns 0.5 for items created 6-24 hours ago', () => {
      const recent = new Date(Date.now() - 12 * 60 * 60 * 1000);
      expect(service.recencyScore(recent)).toBe(0.5);
    });

    it('returns 0.2 for items created 1-7 days ago', () => {
      const recent = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(service.recencyScore(recent)).toBe(0.2);
    });

    it('returns 0.05 for items older than 7 days', () => {
      const old = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      expect(service.recencyScore(old)).toBe(0.05);
    });
  });

  // ─── engagementScore ───────────────────────────────────────────────────────

  describe('engagementScore', () => {
    it('returns 0 when viewCount is 0', () => {
      const item = makeItem({ viewCount: 0 });
      expect(service.engagementScore(item)).toBe(0);
    });

    it('calculates engagement ratio correctly', () => {
      // engagement = 10 (likes) + 5*2 (comments) + 2*3 (shares) = 26
      // ratio = 26 / 100 = 0.26
      const item = makeItem({ viewCount: 100, likeCount: 10, commentCount: 5, shareCount: 2 });
      expect(service.engagementScore(item)).toBeCloseTo(0.26, 5);
    });

    it('caps score at 1.0', () => {
      const item = makeItem({ viewCount: 1, likeCount: 100, commentCount: 100, shareCount: 100 });
      expect(service.engagementScore(item)).toBe(1.0);
    });

    it('handles missing like/comment/share counts', () => {
      const item = makeItem({ viewCount: 100, likeCount: undefined, commentCount: undefined, shareCount: undefined });
      expect(service.engagementScore(item)).toBe(0);
    });
  });

  // ─── relevanceScore ────────────────────────────────────────────────────────

  describe('relevanceScore', () => {
    it('adds 0.3 for interacted category match', () => {
      const item = makeItem({ categoryId: 'cat-1' });
      const ctx = makeCtx({ interactedCategoryIds: ['cat-1'] });
      expect(service.relevanceScore(item, ctx)).toBeGreaterThanOrEqual(0.3);
    });

    it('adds 0.2 for same city', () => {
      const item = makeItem({ city: 'Mumbai' });
      const ctx = makeCtx({ city: 'Mumbai' });
      expect(service.relevanceScore(item, ctx)).toBeGreaterThanOrEqual(0.2);
    });

    it('adds 0.1 for same state', () => {
      const item = makeItem({ state: 'Maharashtra' });
      const ctx = makeCtx({ state: 'Maharashtra' });
      expect(service.relevanceScore(item, ctx)).toBeGreaterThanOrEqual(0.1);
    });

    it('adds 0.3 for followed author', () => {
      const item = makeItem({ authorId: 'author-1' });
      const ctx = makeCtx({ followingIds: ['author-1'] });
      expect(service.relevanceScore(item, ctx)).toBeGreaterThanOrEqual(0.3);
    });

    it('returns 0 for no matches', () => {
      const item = makeItem({ categoryId: 'cat-1', city: 'Mumbai', authorId: 'author-1' });
      const ctx = makeCtx();
      expect(service.relevanceScore(item, ctx)).toBe(0);
    });
  });

  // ─── boostScore ────────────────────────────────────────────────────────────

  describe('boostScore', () => {
    it('adds 0.5 for featured items', () => {
      const item = makeItem({ isFeatured: true });
      expect(service.boostScore(item)).toBeGreaterThanOrEqual(0.5);
    });

    it('adds 0.3 for items with active offers', () => {
      const item = makeItem({ hasActiveOffer: true });
      expect(service.boostScore(item)).toBeGreaterThanOrEqual(0.3);
    });

    it('adds 0.2 for PRODUCT_LAUNCH post type', () => {
      const item = makeItem({ postType: 'PRODUCT_LAUNCH' });
      expect(service.boostScore(item)).toBeGreaterThanOrEqual(0.2);
    });

    it('stacks multiple boosts', () => {
      const item = makeItem({ isFeatured: true, hasActiveOffer: true, postType: 'PRODUCT_LAUNCH' });
      expect(service.boostScore(item)).toBe(1.0);
    });

    it('returns 0 with no boost signals', () => {
      const item = makeItem({ isFeatured: false, hasActiveOffer: false });
      expect(service.boostScore(item)).toBe(0);
    });
  });

  // ─── rank ─────────────────────────────────────────────────────────────────

  describe('rank', () => {
    it('sorts items by score descending', () => {
      const oldItem = makeItem({ id: 'old', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) });
      const newItem = makeItem({ id: 'new', createdAt: new Date() });
      const ctx = makeCtx();

      const ranked = service.rank([oldItem, newItem], ctx);
      expect(ranked[0].id).toBe('new');
      expect(ranked[1].id).toBe('old');
    });

    it('prioritizes followed authors', () => {
      const normalItem = makeItem({ id: 'normal', authorId: 'stranger', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) });
      const followedItem = makeItem({ id: 'followed', authorId: 'friend', createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) });
      const ctx = makeCtx({ followingIds: ['friend'] });

      const ranked = service.rank([normalItem, followedItem], ctx);
      expect(ranked[0].id).toBe('followed');
    });

    it('returns empty array for empty input', () => {
      expect(service.rank([], makeCtx())).toEqual([]);
    });
  });
});
