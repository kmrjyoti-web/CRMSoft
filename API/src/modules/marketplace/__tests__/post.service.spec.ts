import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PostService } from '../services/post.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('PostService', () => {
  let service: PostService;

  const MOCK_POST = {
    id: 'post-1',
    tenantId: 'tenant-1',
    authorId: 'user-1',
    postType: 'PT_TEXT',
    content: 'Check out #newproduct @user2',
    status: 'PS_ACTIVE',
    likeCount: 5,
    commentCount: 2,
    shareCount: 1,
    saveCount: 1,
    viewCount: 100,
  };

  const mockPrisma = {
    marketplacePost: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    postAnalytics: {
      create: jest.fn(),
    },
    postEngagement: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    postComment: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(PostService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create post and extract hashtags', async () => {
      mockPrisma.marketplacePost.create.mockResolvedValue(MOCK_POST);
      mockPrisma.postAnalytics.create.mockResolvedValue({});

      const result = await service.create('tenant-1', 'user-1', {
        postType: 'PT_TEXT' as any,
        content: 'Check out #newproduct @user2',
      });

      expect(mockPrisma.marketplacePost.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            hashtags: ['newproduct'],
            mentions: ['user2'],
            status: 'PS_ACTIVE',
          }),
        }),
      );
    });

    it('should schedule post for future', async () => {
      const futureDate = new Date(Date.now() + 86400000);
      mockPrisma.marketplacePost.create.mockResolvedValue({
        ...MOCK_POST,
        status: 'PS_SCHEDULED',
      });
      mockPrisma.postAnalytics.create.mockResolvedValue({});

      await service.create('tenant-1', 'user-1', {
        postType: 'PT_TEXT' as any,
        content: 'Scheduled post',
        publishAt: futureDate,
      });

      expect(mockPrisma.marketplacePost.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PS_SCHEDULED',
          }),
        }),
      );
    });
  });

  describe('getFeed', () => {
    it('should return paginated feed with user engagement state', async () => {
      mockPrisma.marketplacePost.findMany.mockResolvedValue([MOCK_POST]);
      mockPrisma.marketplacePost.count.mockResolvedValue(1);
      mockPrisma.postEngagement.findMany.mockResolvedValue([
        { postId: 'post-1', userId: 'user-1', action: 'EA_LIKE' },
      ]);

      const result = await service.getFeed('tenant-1', { page: 1, limit: 20 }, 'user-1');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].isLiked).toBe(true);
      expect(result.data[0].isSaved).toBe(false);
    });
  });

  describe('toggleLike', () => {
    it('should like a post', async () => {
      mockPrisma.marketplacePost.findUnique.mockResolvedValue(MOCK_POST);
      mockPrisma.postEngagement.findUnique.mockResolvedValue(null);
      mockPrisma.postEngagement.create.mockResolvedValue({});
      mockPrisma.marketplacePost.update.mockResolvedValue({});

      const result = await service.toggleLike('post-1', 'user-1', 'tenant-1');

      expect(result.liked).toBe(true);
      expect(result.likeCount).toBe(6);
    });

    it('should unlike a post', async () => {
      mockPrisma.marketplacePost.findUnique.mockResolvedValue(MOCK_POST);
      mockPrisma.postEngagement.findUnique.mockResolvedValue({ id: 'eng-1' });
      mockPrisma.postEngagement.delete.mockResolvedValue({});
      mockPrisma.marketplacePost.update.mockResolvedValue({});

      const result = await service.toggleLike('post-1', 'user-1', 'tenant-1');

      expect(result.liked).toBe(false);
      expect(result.likeCount).toBe(4);
    });
  });

  describe('toggleSave', () => {
    it('should save a post', async () => {
      mockPrisma.marketplacePost.findUnique.mockResolvedValue(MOCK_POST);
      mockPrisma.postEngagement.findUnique.mockResolvedValue(null);
      mockPrisma.postEngagement.create.mockResolvedValue({});
      mockPrisma.marketplacePost.update.mockResolvedValue({});

      const result = await service.toggleSave('post-1', 'user-1', 'tenant-1');

      expect(result.saved).toBe(true);
    });
  });

  describe('addComment', () => {
    it('should add a comment and increment count', async () => {
      mockPrisma.marketplacePost.findUnique.mockResolvedValue(MOCK_POST);
      mockPrisma.postComment.create.mockResolvedValue({
        id: 'comment-1',
        content: 'Great product!',
      });
      mockPrisma.marketplacePost.update.mockResolvedValue({});
      mockPrisma.postEngagement.create.mockResolvedValue({});

      const result = await service.addComment(
        'post-1',
        'user-2',
        'tenant-1',
        'Great product!',
      );

      expect(result.content).toBe('Great product!');
      expect(mockPrisma.marketplacePost.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { commentCount: { increment: 1 } },
        }),
      );
    });

    it('should track as REPLY when parentId is provided', async () => {
      mockPrisma.marketplacePost.findUnique.mockResolvedValue(MOCK_POST);
      mockPrisma.postComment.create.mockResolvedValue({ id: 'reply-1' });
      mockPrisma.marketplacePost.update.mockResolvedValue({});
      mockPrisma.postEngagement.create.mockResolvedValue({});

      await service.addComment('post-1', 'user-2', 'tenant-1', 'Reply!', 'comment-1');

      expect(mockPrisma.postEngagement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'EA_REPLY' }),
        }),
      );
    });
  });

  describe('trackShare', () => {
    it('should record share and increment count', async () => {
      mockPrisma.marketplacePost.findUnique.mockResolvedValue(MOCK_POST);
      mockPrisma.postEngagement.create.mockResolvedValue({});
      mockPrisma.marketplacePost.update.mockResolvedValue({});

      const result = await service.trackShare('post-1', 'user-1', 'tenant-1', 'WHATSAPP');

      expect(result.success).toBe(true);
      expect(mockPrisma.postEngagement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'EA_SHARE',
            sharedTo: 'WHATSAPP',
          }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should throw for non-existent post', async () => {
      mockPrisma.marketplacePost.findUnique.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
