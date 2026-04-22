import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceSchedulingService } from '../services/scheduling.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('MarketplaceSchedulingService', () => {
  let service: MarketplaceSchedulingService;

  const mockPrisma = {
    marketplaceListing: {
      updateMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    marketplacePost: {
      updateMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };
(mockPrisma as any).platform = mockPrisma;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketplaceSchedulingService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(MarketplaceSchedulingService);
    jest.clearAllMocks();
  });

  describe('processScheduled', () => {
    it('should publish scheduled listings and posts', async () => {
      mockPrisma.marketplaceListing.updateMany.mockResolvedValue({ count: 3 });
      mockPrisma.marketplacePost.updateMany.mockResolvedValue({ count: 2 });
      mockPrisma.marketplaceListing.findMany.mockResolvedValue([]);
      mockPrisma.marketplacePost.findMany.mockResolvedValue([]);

      const result = await service.processScheduled();

      expect(result.published).toBe(5);
      expect(result.expired).toBe(0);

      // Verify listings publish query
      expect(mockPrisma.marketplaceListing.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'LST_SCHEDULED',
          }),
          data: expect.objectContaining({
            status: 'LST_ACTIVE',
          }),
        }),
      );
    });

    it('should expire active listings past expiry date', async () => {
      mockPrisma.marketplaceListing.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.marketplacePost.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.marketplaceListing.findMany.mockResolvedValue([
        { id: 'l-1', expiryAction: 'EXP_DEACTIVATE' },
        { id: 'l-2', expiryAction: 'EXP_ARCHIVE' },
      ]);
      mockPrisma.marketplaceListing.update.mockResolvedValue({});
      mockPrisma.marketplacePost.findMany.mockResolvedValue([]);

      const result = await service.processScheduled();

      expect(result.expired).toBe(2);
      expect(mockPrisma.marketplaceListing.update).toHaveBeenCalledTimes(2);

      // Check archive action
      expect(mockPrisma.marketplaceListing.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'l-2' },
          data: { status: 'LST_ARCHIVED' },
        }),
      );
    });

    it('should expire posts past expiry date', async () => {
      mockPrisma.marketplaceListing.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.marketplacePost.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.marketplaceListing.findMany.mockResolvedValue([]);
      mockPrisma.marketplacePost.findMany.mockResolvedValue([
        { id: 'p-1', expiryAction: 'EXP_DELETE' },
      ]);
      mockPrisma.marketplacePost.update.mockResolvedValue({});

      const result = await service.processScheduled();

      expect(result.expired).toBe(1);
      expect(mockPrisma.marketplacePost.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'p-1' },
          data: { status: 'PS_DELETED' },
        }),
      );
    });

    it('should return zero when nothing to process', async () => {
      mockPrisma.marketplaceListing.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.marketplacePost.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.marketplaceListing.findMany.mockResolvedValue([]);
      mockPrisma.marketplacePost.findMany.mockResolvedValue([]);

      const result = await service.processScheduled();

      expect(result.published).toBe(0);
      expect(result.expired).toBe(0);
    });

    describe('error cases', () => {
      it('should propagate DB error from marketplaceListing.updateMany', async () => {
        mockPrisma.marketplaceListing.updateMany.mockRejectedValue(new Error('DB write failed'));
        await expect(service.processScheduled()).rejects.toThrow('DB write failed');
      });

      it('should handle EXP_DEACTIVATE action correctly', async () => {
        mockPrisma.marketplaceListing.updateMany.mockResolvedValue({ count: 0 });
        mockPrisma.marketplacePost.updateMany.mockResolvedValue({ count: 0 });
        mockPrisma.marketplaceListing.findMany.mockResolvedValue([
          { id: 'l-deactivate', expiryAction: 'EXP_DEACTIVATE' },
        ]);
        mockPrisma.marketplaceListing.update.mockResolvedValue({});
        mockPrisma.marketplacePost.findMany.mockResolvedValue([]);

        const result = await service.processScheduled();
        expect(result.expired).toBe(1);
        expect(mockPrisma.marketplaceListing.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: 'l-deactivate' },
            data: { status: 'LST_EXPIRED' },
          }),
        );
      });

      it('should continue processing posts even when no listings expire', async () => {
        mockPrisma.marketplaceListing.updateMany.mockResolvedValue({ count: 0 });
        mockPrisma.marketplacePost.updateMany.mockResolvedValue({ count: 1 });
        mockPrisma.marketplaceListing.findMany.mockResolvedValue([]);
        mockPrisma.marketplacePost.findMany.mockResolvedValue([]);

        const result = await service.processScheduled();
        expect(result.published).toBe(1);
        expect(result.expired).toBe(0);
      });
    });
  });
});
