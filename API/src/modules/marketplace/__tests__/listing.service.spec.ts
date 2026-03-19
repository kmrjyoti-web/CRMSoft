import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ListingService } from '../services/listing.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PricingAccessService } from '../../softwarevendor/verification/services/pricing-access.service';

describe('ListingService', () => {
  let service: ListingService;

  const dec = (n: number) => ({ valueOf: () => n, toNumber: () => n, toString: () => String(n) });

  const MOCK_LISTING = {
    id: 'listing-1',
    tenantId: 'tenant-1',
    vendorId: 'user-1',
    listingType: 'PRODUCT',
    title: 'Industrial Gloves',
    b2cPrice: dec(120),
    currency: 'INR',
    status: 'LST_ACTIVE',
    viewCount: 10,
    enquiryCount: 2,
    orderCount: 1,
    priceTiers: [
      { minQty: 1, maxQty: 10, pricePerUnit: dec(100) },
      { minQty: 11, maxQty: null, pricePerUnit: dec(85) },
    ],
    analytics: { totalViews: 10 },
  };

  const mockPrisma = {
    marketplaceListing: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    listingPriceTier: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    listingAnalytics: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockPricingService = {
    getPricingForUser: jest.fn().mockResolvedValue({
      showB2BPricing: false,
      b2cPrice: 120,
      currency: 'INR',
      message: 'Register as a business to see wholesale prices',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PricingAccessService, useValue: mockPricingService },
      ],
    }).compile();

    service = module.get(ListingService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a listing with price tiers', async () => {
      mockPrisma.marketplaceListing.create.mockResolvedValue({
        ...MOCK_LISTING,
        id: 'new-listing',
      });
      mockPrisma.listingAnalytics.create.mockResolvedValue({});

      const result = await service.create('tenant-1', 'user-1', {
        listingType: 'PRODUCT' as any,
        title: 'Industrial Gloves',
        b2cPrice: 120,
        b2bEnabled: true,
        b2bTiers: [
          { minQty: 1, maxQty: 10, pricePerUnit: 100 },
          { minQty: 11, pricePerUnit: 85 },
        ],
      });

      expect(mockPrisma.marketplaceListing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Industrial Gloves',
            status: 'LST_ACTIVE',
            priceTiers: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({ minQty: 1 }),
              ]),
            }),
          }),
        }),
      );
      expect(mockPrisma.listingAnalytics.create).toHaveBeenCalled();
    });

    it('should set status to SCHEDULED when publishAt is in future', async () => {
      const futureDate = new Date(Date.now() + 86400000);
      mockPrisma.marketplaceListing.create.mockResolvedValue({
        ...MOCK_LISTING,
        status: 'LST_SCHEDULED',
      });
      mockPrisma.listingAnalytics.create.mockResolvedValue({});

      await service.create('tenant-1', 'user-1', {
        listingType: 'PRODUCT' as any,
        title: 'Test',
        b2cPrice: 100,
        publishAt: futureDate,
      });

      expect(mockPrisma.marketplaceListing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'LST_SCHEDULED',
          }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return listing with pricing for user', async () => {
      mockPrisma.marketplaceListing.findUnique.mockResolvedValue(MOCK_LISTING);
      mockPrisma.marketplaceListing.update.mockResolvedValue({});
      mockPrisma.listingAnalytics.findUnique.mockResolvedValue({
        dailyStats: [],
      });
      mockPrisma.listingAnalytics.update.mockResolvedValue({});

      const result = await service.findById('listing-1', 'user-1');

      expect(result.pricing).toBeDefined();
      expect(mockPricingService.getPricingForUser).toHaveBeenCalledWith(
        'user-1',
        120,
        expect.any(Array),
        'INR',
      );
    });

    it('should throw NotFoundException for missing listing', async () => {
      mockPrisma.marketplaceListing.findUnique.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
    });

    it('should track view on access', async () => {
      mockPrisma.marketplaceListing.findUnique.mockResolvedValue(MOCK_LISTING);
      mockPrisma.marketplaceListing.update.mockResolvedValue({});
      mockPrisma.listingAnalytics.findUnique.mockResolvedValue({
        dailyStats: [],
      });
      mockPrisma.listingAnalytics.update.mockResolvedValue({});

      await service.findById('listing-1');

      expect(mockPrisma.marketplaceListing.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { viewCount: { increment: 1 } },
        }),
      );
    });
  });

  describe('findMany', () => {
    it('should return paginated listings', async () => {
      mockPrisma.marketplaceListing.findMany.mockResolvedValue([MOCK_LISTING]);
      mockPrisma.marketplaceListing.count.mockResolvedValue(1);

      const result = await service.findMany(
        'tenant-1',
        {},
        { page: 1, limit: 20 },
      );

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by search term', async () => {
      mockPrisma.marketplaceListing.findMany.mockResolvedValue([]);
      mockPrisma.marketplaceListing.count.mockResolvedValue(0);

      await service.findMany(
        'tenant-1',
        { search: 'gloves' },
        { page: 1, limit: 20 },
      );

      expect(mockPrisma.marketplaceListing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ title: { contains: 'gloves', mode: 'insensitive' } }),
            ]),
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update listing and replace price tiers', async () => {
      mockPrisma.marketplaceListing.findFirst.mockResolvedValue(MOCK_LISTING);
      mockPrisma.marketplaceListing.update.mockResolvedValue(MOCK_LISTING);
      mockPrisma.listingPriceTier.deleteMany.mockResolvedValue({});
      mockPrisma.listingPriceTier.createMany.mockResolvedValue({});
      mockPrisma.marketplaceListing.findUnique.mockResolvedValue(MOCK_LISTING);
      mockPrisma.listingAnalytics.findUnique.mockResolvedValue({ dailyStats: [] });
      mockPrisma.listingAnalytics.update.mockResolvedValue({});

      await service.update('listing-1', 'tenant-1', 'user-1', {
        title: 'Updated Title',
        b2bTiers: [{ minQty: 1, maxQty: 50, pricePerUnit: 90 }],
      });

      expect(mockPrisma.listingPriceTier.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.listingPriceTier.createMany).toHaveBeenCalled();
    });
  });
});
