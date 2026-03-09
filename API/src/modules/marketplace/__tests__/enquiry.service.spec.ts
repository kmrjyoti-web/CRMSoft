import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EnquiryService } from '../services/enquiry.service';
import { ListingService } from '../services/listing.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('EnquiryService', () => {
  let service: EnquiryService;

  const MOCK_LISTING = {
    id: 'listing-1',
    tenantId: 'tenant-1',
    vendorId: 'vendor-1',
    title: 'Industrial Gloves',
  };

  const MOCK_BUYER = {
    id: 'buyer-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+919876543210',
    companyName: 'Doe Corp',
    verificationStatus: 'FULLY_VERIFIED',
  };

  const MOCK_ENQUIRY = {
    id: 'enquiry-1',
    enquiryNumber: 'ENQ-2026-00001',
    tenantId: 'tenant-1',
    vendorId: 'vendor-1',
    listingId: 'listing-1',
    buyerId: 'buyer-1',
    status: 'ENQ_NEW',
    messages: [],
    unreadCountBuyer: 0,
    unreadCountVendor: 0,
  };

  const mockPrisma = {
    marketplaceListing: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    marketplaceEnquiry: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    listingAnalytics: {
      updateMany: jest.fn(),
    },
  };

  const mockListingService = {
    trackEnquiry: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnquiryService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ListingService, useValue: mockListingService },
      ],
    }).compile();

    service = module.get(EnquiryService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create enquiry with buyer info', async () => {
      mockPrisma.marketplaceListing.findUnique.mockResolvedValue(MOCK_LISTING);
      mockPrisma.user.findUnique.mockResolvedValue(MOCK_BUYER);
      mockPrisma.marketplaceEnquiry.count.mockResolvedValue(0);
      mockPrisma.marketplaceEnquiry.create.mockResolvedValue(MOCK_ENQUIRY);

      const result = await service.create('tenant-1', 'buyer-1', {
        listingId: 'listing-1',
        quantity: 50,
        message: 'Need bulk pricing',
      });

      expect(mockPrisma.marketplaceEnquiry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            buyerName: 'John Doe',
            buyerVerified: true,
            listingTitle: 'Industrial Gloves',
          }),
        }),
      );
      expect(mockListingService.trackEnquiry).toHaveBeenCalledWith('listing-1');
    });

    it('should throw if listing not found', async () => {
      mockPrisma.marketplaceListing.findUnique.mockResolvedValue(null);

      await expect(
        service.create('tenant-1', 'buyer-1', { listingId: 'missing' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('reply', () => {
    it('should append message and update unread count', async () => {
      mockPrisma.marketplaceEnquiry.findUnique.mockResolvedValue({
        ...MOCK_ENQUIRY,
        messages: [],
        status: 'ENQ_NEW',
      });
      mockPrisma.marketplaceEnquiry.update.mockResolvedValue({});

      await service.reply('enquiry-1', 'vendor-1', 'VENDOR', 'We can offer bulk pricing');

      expect(mockPrisma.marketplaceEnquiry.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            messages: expect.arrayContaining([
              expect.objectContaining({
                senderType: 'VENDOR',
                message: 'We can offer bulk pricing',
              }),
            ]),
            status: 'ENQ_RESPONDED',
          }),
        }),
      );
    });
  });

  describe('updateStatus', () => {
    it('should update enquiry status', async () => {
      mockPrisma.marketplaceEnquiry.findUnique.mockResolvedValue(MOCK_ENQUIRY);
      mockPrisma.marketplaceEnquiry.update.mockResolvedValue({
        ...MOCK_ENQUIRY,
        status: 'ENQ_QUOTED',
      });

      const result = await service.updateStatus('enquiry-1', 'ENQ_QUOTED' as any);

      expect(mockPrisma.marketplaceEnquiry.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'ENQ_QUOTED' },
        }),
      );
    });
  });

  describe('markRead', () => {
    it('should reset unread count for buyer', async () => {
      mockPrisma.marketplaceEnquiry.update.mockResolvedValue({});

      await service.markRead('enquiry-1', 'BUYER');

      expect(mockPrisma.marketplaceEnquiry.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { unreadCountBuyer: 0 },
        }),
      );
    });
  });
});
