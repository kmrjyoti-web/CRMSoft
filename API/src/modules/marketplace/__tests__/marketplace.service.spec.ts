import { VendorService } from '../services/vendor.service';
import { MarketplaceModuleService } from '../services/marketplace-module.service';
import { MarketplaceInstallService } from '../services/marketplace-install.service';
import { ReviewService } from '../services/review.service';

// ─── Mock PrismaService ──────────────────────────────────

function createMockPrisma() {
  const mock: any = {
    marketplaceVendor: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    marketplaceModule: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    marketplaceReview: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    tenantMarketplaceModule: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
  };
  mock.platform = mock;
  return mock;
}

// ═════════════════════════════════════════════════════════
// VENDOR SERVICE TESTS
// ═════════════════════════════════════════════════════════

describe('VendorService', () => {
  let service: VendorService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    service = new VendorService(mockPrisma as any);
  });

  describe('register', () => {
    it('should create a new vendor with PENDING status', async () => {
      const data = {
        companyName: 'Acme Solutions',
        contactEmail: 'vendor@acme.com',
        gstNumber: '29ABCDE1234F1ZK',
      };
      const created = { id: 'v-1', ...data, status: 'PENDING', revenueSharePct: 70 };

      mockPrisma.marketplaceVendor.findUnique.mockResolvedValue(null);
      mockPrisma.marketplaceVendor.create.mockResolvedValue(created);

      const result = await service.register(data);

      expect(mockPrisma.marketplaceVendor.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          companyName: 'Acme Solutions',
          contactEmail: 'vendor@acme.com',
          status: 'PENDING',
        }),
      });
      expect(result).toEqual(created);
    });

    it('should reject duplicate email', async () => {
      mockPrisma.marketplaceVendor.findUnique.mockResolvedValue({
        id: 'v-1',
        contactEmail: 'vendor@acme.com',
      });

      await expect(
        service.register({
          companyName: 'Acme',
          contactEmail: 'vendor@acme.com',
        }),
      ).rejects.toThrow();
    });
  });

  describe('approve', () => {
    it('should set status to APPROVED and verifiedAt', async () => {
      const vendor = { id: 'v-1', status: 'PENDING' };
      const approved = { ...vendor, status: 'APPROVED', verifiedAt: new Date() };

      mockPrisma.marketplaceVendor.findUnique.mockResolvedValue(vendor);
      mockPrisma.marketplaceVendor.update.mockResolvedValue(approved);

      const result = await service.approve('v-1');

      expect(mockPrisma.marketplaceVendor.update).toHaveBeenCalledWith({
        where: { id: 'v-1' },
        data: {
          status: 'APPROVED',
          verifiedAt: expect.any(Date),
        },
      });
      expect(result.status).toBe('APPROVED');
    });

    it('should throw if vendor not found', async () => {
      mockPrisma.marketplaceVendor.findUnique.mockResolvedValue(null);

      await expect(service.approve('v-999')).rejects.toThrow();
    });

    it('should throw if vendor already approved', async () => {
      mockPrisma.marketplaceVendor.findUnique.mockResolvedValue({
        id: 'v-1',
        status: 'APPROVED',
      });

      await expect(service.approve('v-1')).rejects.toThrow();
    });
  });

  describe('suspend', () => {
    it('should set status to SUSPENDED', async () => {
      const vendor = { id: 'v-1', status: 'APPROVED' };
      const suspended = { ...vendor, status: 'SUSPENDED' };

      mockPrisma.marketplaceVendor.findUnique.mockResolvedValue(vendor);
      mockPrisma.marketplaceVendor.update.mockResolvedValue(suspended);

      const result = await service.suspend('v-1');

      expect(result.status).toBe('SUSPENDED');
    });
  });

  describe('listAll', () => {
    it('should return paginated vendors with status filter', async () => {
      const vendors = [
        { id: 'v-1', companyName: 'Acme', status: 'APPROVED', _count: { modules: 3 } },
      ];
      mockPrisma.marketplaceVendor.findMany.mockResolvedValue(vendors);
      mockPrisma.marketplaceVendor.count.mockResolvedValue(1);

      const result = await service.listAll({ status: 'APPROVED' });

      expect(result.data).toEqual(vendors);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('getById', () => {
    it('should return vendor with modules', async () => {
      const vendor = {
        id: 'v-1',
        companyName: 'Acme',
        _count: { modules: 2 },
        modules: [
          { id: 'm-1', moduleCode: 'mod-1', moduleName: 'Mod 1', status: 'PUBLISHED' },
        ],
      };
      mockPrisma.marketplaceVendor.findUnique.mockResolvedValue(vendor);

      const result = await service.getById('v-1');

      expect(result.modules).toHaveLength(1);
      expect(result._count.modules).toBe(2);
    });
  });
});

// ═════════════════════════════════════════════════════════
// MARKETPLACE MODULE SERVICE TESTS
// ═════════════════════════════════════════════════════════

describe('MarketplaceModuleService', () => {
  let service: MarketplaceModuleService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    service = new MarketplaceModuleService(mockPrisma as any);
  });

  describe('create', () => {
    it('should create a module draft for approved vendor', async () => {
      const vendor = { id: 'v-1', status: 'APPROVED' };
      const moduleData = {
        moduleCode: 'whatsapp-int',
        moduleName: 'WhatsApp Integration',
        category: 'communication',
        shortDescription: 'Integrate WhatsApp messaging',
        longDescription: 'Full WhatsApp integration with templates...',
      };
      const created = { id: 'm-1', vendorId: 'v-1', ...moduleData, status: 'DRAFT' };

      mockPrisma.marketplaceVendor.findUnique.mockResolvedValue(vendor);
      mockPrisma.marketplaceModule.findUnique.mockResolvedValue(null);
      mockPrisma.marketplaceModule.create.mockResolvedValue(created);

      const result = await service.create('v-1', moduleData);

      expect(mockPrisma.marketplaceModule.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          vendorId: 'v-1',
          moduleCode: 'whatsapp-int',
          status: 'DRAFT',
        }),
      });
      expect(result.status).toBe('DRAFT');
    });

    it('should reject if vendor is not approved', async () => {
      mockPrisma.marketplaceVendor.findUnique.mockResolvedValue({
        id: 'v-1',
        status: 'PENDING',
      });

      await expect(
        service.create('v-1', {
          moduleCode: 'test',
          moduleName: 'Test',
          category: 'test',
          shortDescription: 'Test module for testing',
          longDescription: 'Test module for testing the marketplace',
        }),
      ).rejects.toThrow();
    });

    it('should reject duplicate moduleCode', async () => {
      mockPrisma.marketplaceVendor.findUnique.mockResolvedValue({
        id: 'v-1',
        status: 'APPROVED',
      });
      mockPrisma.marketplaceModule.findUnique.mockResolvedValue({
        id: 'm-1',
        moduleCode: 'existing',
      });

      await expect(
        service.create('v-1', {
          moduleCode: 'existing',
          moduleName: 'Test',
          category: 'test',
          shortDescription: 'Test module for testing',
          longDescription: 'Test module for testing the marketplace',
        }),
      ).rejects.toThrow();
    });
  });

  describe('submitForReview', () => {
    it('should change status from DRAFT to REVIEW', async () => {
      const mod = { id: 'm-1', status: 'DRAFT' };
      const submitted = { ...mod, status: 'REVIEW' };

      mockPrisma.marketplaceModule.findUnique.mockResolvedValue(mod);
      mockPrisma.marketplaceModule.update.mockResolvedValue(submitted);

      const result = await service.submitForReview('m-1');

      expect(mockPrisma.marketplaceModule.update).toHaveBeenCalledWith({
        where: { id: 'm-1' },
        data: { status: 'REVIEW' },
      });
      expect(result.status).toBe('REVIEW');
    });

    it('should reject if not in DRAFT status', async () => {
      mockPrisma.marketplaceModule.findUnique.mockResolvedValue({
        id: 'm-1',
        status: 'PUBLISHED',
      });

      await expect(service.submitForReview('m-1')).rejects.toThrow();
    });
  });

  describe('publish', () => {
    it('should change status from REVIEW to PUBLISHED with publishedAt', async () => {
      const mod = { id: 'm-1', status: 'REVIEW' };
      const published = { ...mod, status: 'PUBLISHED', publishedAt: new Date() };

      mockPrisma.marketplaceModule.findUnique.mockResolvedValue(mod);
      mockPrisma.marketplaceModule.update.mockResolvedValue(published);

      const result = await service.publish('m-1');

      expect(mockPrisma.marketplaceModule.update).toHaveBeenCalledWith({
        where: { id: 'm-1' },
        data: {
          status: 'PUBLISHED',
          publishedAt: expect.any(Date),
        },
      });
      expect(result.status).toBe('PUBLISHED');
    });

    it('should reject if not in REVIEW status', async () => {
      mockPrisma.marketplaceModule.findUnique.mockResolvedValue({
        id: 'm-1',
        status: 'DRAFT',
      });

      await expect(service.publish('m-1')).rejects.toThrow();
    });
  });

  describe('lifecycle: DRAFT -> REVIEW -> PUBLISHED', () => {
    it('should follow the full lifecycle', async () => {
      // Step 1: Create as DRAFT
      mockPrisma.marketplaceVendor.findUnique.mockResolvedValue({
        id: 'v-1',
        status: 'APPROVED',
      });
      mockPrisma.marketplaceModule.findUnique
        .mockResolvedValueOnce(null) // moduleCode uniqueness check
        .mockResolvedValueOnce({ id: 'm-1', status: 'DRAFT' }) // submitForReview lookup
        .mockResolvedValueOnce({ id: 'm-1', status: 'REVIEW' }); // publish lookup

      const draftModule = { id: 'm-1', status: 'DRAFT' };
      mockPrisma.marketplaceModule.create.mockResolvedValue(draftModule);

      const draft = await service.create('v-1', {
        moduleCode: 'test-mod',
        moduleName: 'Test Module',
        category: 'tools',
        shortDescription: 'A test module for testing',
        longDescription: 'A longer test module description for the marketplace',
      });
      expect(draft.status).toBe('DRAFT');

      // Step 2: Submit for review
      const reviewModule = { id: 'm-1', status: 'REVIEW' };
      mockPrisma.marketplaceModule.update.mockResolvedValueOnce(reviewModule);

      const reviewed = await service.submitForReview('m-1');
      expect(reviewed.status).toBe('REVIEW');

      // Step 3: Publish
      const publishedModule = { id: 'm-1', status: 'PUBLISHED', publishedAt: new Date() };
      mockPrisma.marketplaceModule.update.mockResolvedValueOnce(publishedModule);

      const published = await service.publish('m-1');
      expect(published.status).toBe('PUBLISHED');
      expect(published.publishedAt).toBeDefined();
    });
  });

  describe('listPublished', () => {
    it('should return only published modules', async () => {
      const modules = [
        { id: 'm-1', moduleName: 'Mod A', status: 'PUBLISHED', vendor: { companyName: 'Acme' } },
      ];
      mockPrisma.marketplaceModule.findMany.mockResolvedValue(modules);
      mockPrisma.marketplaceModule.count.mockResolvedValue(1);

      const result = await service.listPublished();

      expect(mockPrisma.marketplaceModule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PUBLISHED' },
        }),
      );
      expect(result.data).toEqual(modules);
    });

    it('should filter by category', async () => {
      mockPrisma.marketplaceModule.findMany.mockResolvedValue([]);
      mockPrisma.marketplaceModule.count.mockResolvedValue(0);

      await service.listPublished({ category: 'communication' });

      expect(mockPrisma.marketplaceModule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PUBLISHED', category: 'communication' },
        }),
      );
    });

    it('should filter by search term', async () => {
      mockPrisma.marketplaceModule.findMany.mockResolvedValue([]);
      mockPrisma.marketplaceModule.count.mockResolvedValue(0);

      await service.listPublished({ search: 'whatsapp' });

      expect(mockPrisma.marketplaceModule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PUBLISHED',
            OR: expect.arrayContaining([
              expect.objectContaining({
                moduleName: { contains: 'whatsapp', mode: 'insensitive' },
              }),
            ]),
          }),
        }),
      );
    });
  });

  describe('getFeatured', () => {
    it('should return top-rated published modules', async () => {
      const featured = [
        { id: 'm-1', moduleName: 'Top Module', avgRating: 4.9, installCount: 500 },
        { id: 'm-2', moduleName: 'Popular Module', avgRating: 4.7, installCount: 1000 },
      ];
      mockPrisma.marketplaceModule.findMany.mockResolvedValue(featured);

      const result = await service.getFeatured();

      expect(mockPrisma.marketplaceModule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PUBLISHED' },
          orderBy: [{ avgRating: 'desc' }, { installCount: 'desc' }],
          take: 10,
        }),
      );
      expect(result).toEqual(featured);
    });
  });

  describe('suspend', () => {
    it('should set module status to SUSPENDED', async () => {
      mockPrisma.marketplaceModule.findUnique.mockResolvedValue({
        id: 'm-1',
        status: 'PUBLISHED',
      });
      mockPrisma.marketplaceModule.update.mockResolvedValue({
        id: 'm-1',
        status: 'SUSPENDED',
      });

      const result = await service.suspend('m-1');

      expect(result.status).toBe('SUSPENDED');
    });
  });
});

// ═════════════════════════════════════════════════════════
// MARKETPLACE INSTALL SERVICE TESTS
// ═════════════════════════════════════════════════════════

describe('MarketplaceInstallService', () => {
  let service: MarketplaceInstallService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    service = new MarketplaceInstallService(mockPrisma as any);
  });

  describe('install', () => {
    it('should install a published module with TRIAL status', async () => {
      const mod = { id: 'm-1', status: 'PUBLISHED', launchOfferDays: null };
      const installation = {
        id: 'inst-1',
        tenantId: 't-1',
        moduleId: 'm-1',
        status: 'TRIAL',
        trialEndsAt: expect.any(Date),
      };

      mockPrisma.marketplaceModule.findUnique.mockResolvedValue(mod);
      mockPrisma.tenantMarketplaceModule.findUnique.mockResolvedValue(null);
      mockPrisma.tenantMarketplaceModule.upsert.mockResolvedValue(installation);
      mockPrisma.marketplaceModule.update.mockResolvedValue({
        ...mod,
        installCount: 1,
      });

      const result = await service.install('t-1', 'm-1');

      expect(result.status).toBe('TRIAL');
      expect(mockPrisma.marketplaceModule.update).toHaveBeenCalledWith({
        where: { id: 'm-1' },
        data: { installCount: { increment: 1 } },
      });
    });

    it('should reject if module is not published', async () => {
      mockPrisma.marketplaceModule.findUnique.mockResolvedValue({
        id: 'm-1',
        status: 'DRAFT',
      });

      await expect(service.install('t-1', 'm-1')).rejects.toThrow();
    });

    it('should reject if already installed (non-cancelled)', async () => {
      mockPrisma.marketplaceModule.findUnique.mockResolvedValue({
        id: 'm-1',
        status: 'PUBLISHED',
      });
      mockPrisma.tenantMarketplaceModule.findUnique.mockResolvedValue({
        id: 'inst-1',
        status: 'ACTIVE',
      });

      await expect(service.install('t-1', 'm-1')).rejects.toThrow();
    });

    it('should allow re-install after cancellation', async () => {
      const mod = { id: 'm-1', status: 'PUBLISHED', launchOfferDays: null };
      const installation = {
        id: 'inst-1',
        tenantId: 't-1',
        moduleId: 'm-1',
        status: 'TRIAL',
      };

      mockPrisma.marketplaceModule.findUnique.mockResolvedValue(mod);
      mockPrisma.tenantMarketplaceModule.findUnique.mockResolvedValue({
        id: 'inst-1',
        status: 'CANCELLED',
      });
      mockPrisma.tenantMarketplaceModule.upsert.mockResolvedValue(installation);
      mockPrisma.marketplaceModule.update.mockResolvedValue({
        ...mod,
        installCount: 2,
      });

      const result = await service.install('t-1', 'm-1');

      expect(result.status).toBe('TRIAL');
    });
  });

  describe('activate', () => {
    it('should change status from TRIAL to ACTIVE', async () => {
      const installation = { id: 'inst-1', tenantId: 't-1', moduleId: 'm-1', status: 'TRIAL' };
      const activated = { ...installation, status: 'ACTIVE', subscriptionId: 'sub_123' };

      mockPrisma.tenantMarketplaceModule.findUnique.mockResolvedValue(installation);
      mockPrisma.tenantMarketplaceModule.update.mockResolvedValue(activated);

      const result = await service.activate('t-1', 'm-1', 'sub_123');

      expect(result.status).toBe('ACTIVE');
      expect(result.subscriptionId).toBe('sub_123');
    });

    it('should reject if already active', async () => {
      mockPrisma.tenantMarketplaceModule.findUnique.mockResolvedValue({
        id: 'inst-1',
        status: 'ACTIVE',
      });

      await expect(service.activate('t-1', 'm-1')).rejects.toThrow();
    });

    it('should reject if cancelled', async () => {
      mockPrisma.tenantMarketplaceModule.findUnique.mockResolvedValue({
        id: 'inst-1',
        status: 'CANCELLED',
      });

      await expect(service.activate('t-1', 'm-1')).rejects.toThrow();
    });
  });

  describe('cancel', () => {
    it('should set status to CANCELLED', async () => {
      const installation = { id: 'inst-1', status: 'ACTIVE' };
      const cancelled = { ...installation, status: 'CANCELLED' };

      mockPrisma.tenantMarketplaceModule.findUnique.mockResolvedValue(installation);
      mockPrisma.tenantMarketplaceModule.update.mockResolvedValue(cancelled);

      const result = await service.cancel('t-1', 'm-1');

      expect(result.status).toBe('CANCELLED');
    });
  });

  describe('listInstalled', () => {
    it('should return all installations for a tenant', async () => {
      const installations = [
        {
          id: 'inst-1',
          status: 'ACTIVE',
          module: { moduleName: 'Mod A', vendor: { companyName: 'Acme' } },
        },
      ];
      mockPrisma.tenantMarketplaceModule.findMany.mockResolvedValue(installations);

      const result = await service.listInstalled('t-1');

      expect(result).toEqual(installations);
    });
  });

  describe('checkInstalled', () => {
    it('should return true when module is installed and active', async () => {
      mockPrisma.tenantMarketplaceModule.findFirst.mockResolvedValue({
        id: 'inst-1',
        status: 'ACTIVE',
      });

      const result = await service.checkInstalled('t-1', 'whatsapp-int');

      expect(result).toBe(true);
    });

    it('should return false when module is not installed', async () => {
      mockPrisma.tenantMarketplaceModule.findFirst.mockResolvedValue(null);

      const result = await service.checkInstalled('t-1', 'whatsapp-int');

      expect(result).toBe(false);
    });
  });
});

// ═════════════════════════════════════════════════════════
// REVIEW SERVICE TESTS
// ═════════════════════════════════════════════════════════

describe('ReviewService', () => {
  let service: ReviewService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    service = new ReviewService(mockPrisma as any);
  });

  describe('create', () => {
    it('should create a review and recalculate rating', async () => {
      const mod = { id: 'm-1', status: 'PUBLISHED' };
      const installation = { id: 'inst-1', tenantId: 't-1', moduleId: 'm-1' };
      const review = {
        id: 'r-1',
        moduleId: 'm-1',
        tenantId: 't-1',
        rating: 4,
        title: 'Great!',
        comment: 'Works perfectly',
      };

      mockPrisma.marketplaceModule.findUnique.mockResolvedValue(mod);
      mockPrisma.tenantMarketplaceModule.findUnique.mockResolvedValue(installation);
      mockPrisma.marketplaceReview.upsert.mockResolvedValue(review);
      mockPrisma.marketplaceReview.aggregate.mockResolvedValue({
        _avg: { rating: 4.0 },
        _count: { rating: 1 },
      });
      mockPrisma.marketplaceModule.update.mockResolvedValue({
        ...mod,
        avgRating: 4.0,
        reviewCount: 1,
      });

      const result = await service.create('t-1', 'm-1', {
        rating: 4,
        title: 'Great!',
        comment: 'Works perfectly',
      });

      expect(result.rating).toBe(4);
      expect(mockPrisma.marketplaceReview.upsert).toHaveBeenCalled();
      // Verify recalculation was called
      expect(mockPrisma.marketplaceReview.aggregate).toHaveBeenCalledWith({
        where: { moduleId: 'm-1' },
        _avg: { rating: true },
        _count: { rating: true },
      });
    });

    it('should reject if module not installed by tenant', async () => {
      mockPrisma.marketplaceModule.findUnique.mockResolvedValue({ id: 'm-1' });
      mockPrisma.tenantMarketplaceModule.findUnique.mockResolvedValue(null);

      await expect(
        service.create('t-1', 'm-1', { rating: 5 }),
      ).rejects.toThrow();
    });

    it('should reject invalid rating', async () => {
      mockPrisma.marketplaceModule.findUnique.mockResolvedValue({ id: 'm-1' });
      mockPrisma.tenantMarketplaceModule.findUnique.mockResolvedValue({
        id: 'inst-1',
      });

      await expect(
        service.create('t-1', 'm-1', { rating: 6 }),
      ).rejects.toThrow();
    });
  });

  describe('recalculateRating', () => {
    it('should update avgRating and reviewCount on module', async () => {
      mockPrisma.marketplaceReview.aggregate.mockResolvedValue({
        _avg: { rating: 4.33 },
        _count: { rating: 3 },
      });
      mockPrisma.marketplaceModule.update.mockResolvedValue({
        id: 'm-1',
        avgRating: 4.33,
        reviewCount: 3,
      });

      const result = await service.recalculateRating('m-1');

      expect(result.avgRating).toBe(4.33);
      expect(result.reviewCount).toBe(3);
      expect(mockPrisma.marketplaceModule.update).toHaveBeenCalledWith({
        where: { id: 'm-1' },
        data: {
          avgRating: 4.33,
          reviewCount: 3,
        },
      });
    });

    it('should handle zero reviews', async () => {
      mockPrisma.marketplaceReview.aggregate.mockResolvedValue({
        _avg: { rating: null },
        _count: { rating: 0 },
      });
      mockPrisma.marketplaceModule.update.mockResolvedValue({
        id: 'm-1',
        avgRating: 0,
        reviewCount: 0,
      });

      const result = await service.recalculateRating('m-1');

      expect(result.avgRating).toBe(0);
      expect(result.reviewCount).toBe(0);
    });
  });

  describe('listForModule', () => {
    it('should return paginated reviews', async () => {
      const reviews = [
        { id: 'r-1', rating: 5, title: 'Amazing', comment: 'Love it' },
        { id: 'r-2', rating: 3, title: 'Decent', comment: 'OK' },
      ];
      mockPrisma.marketplaceReview.findMany.mockResolvedValue(reviews);
      mockPrisma.marketplaceReview.count.mockResolvedValue(2);

      const result = await service.listForModule('m-1', 1, 10);

      expect(result.data).toEqual(reviews);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });
});
