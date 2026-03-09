import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { ListingService } from '../services/listing.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PricingAccessService } from '../../verification/services/pricing-access.service';

describe('OrderService', () => {
  let service: OrderService;

  const dec = (n: number) => ({ valueOf: () => n, toNumber: () => n, toString: () => String(n) });

  const MOCK_LISTING = {
    id: 'listing-1',
    vendorId: 'vendor-1',
    title: 'Industrial Gloves',
    b2cPrice: dec(120),
    status: 'LST_ACTIVE',
    priceTiers: [
      { minQty: 1, maxQty: 10, pricePerUnit: dec(100) },
    ],
  };

  const MOCK_ORDER = {
    id: 'order-1',
    orderNumber: 'ORD-2026-00001',
    tenantId: 'tenant-1',
    vendorId: 'vendor-1',
    buyerId: 'buyer-1',
    subtotal: 1200,
    totalTax: 216,
    totalAmount: 1416,
    status: 'MKT_PENDING',
    items: [],
  };

  const mockPrisma = {
    marketplaceListing: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    marketplaceOrder: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    marketplaceEnquiry: {
      update: jest.fn(),
    },
    listingAnalytics: {
      updateMany: jest.fn(),
    },
  };

  const mockPricingService = {
    calculatePrice: jest.fn().mockResolvedValue({
      unitPrice: 100,
      totalPrice: 1000,
      tier: '1-10',
    }),
  };

  const mockListingService = {
    trackOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PricingAccessService, useValue: mockPricingService },
        { provide: ListingService, useValue: mockListingService },
      ],
    }).compile();

    service = module.get(OrderService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create order with calculated pricing', async () => {
      mockPrisma.marketplaceListing.findUnique.mockResolvedValue(MOCK_LISTING);
      mockPrisma.marketplaceOrder.count.mockResolvedValue(0);
      mockPrisma.marketplaceOrder.create.mockResolvedValue(MOCK_ORDER);

      const result = await service.create('tenant-1', 'buyer-1', {
        items: [{ listingId: 'listing-1', quantity: 10 }],
        shippingAddress: { city: 'Mumbai', state: 'MH', pincode: '400001' },
      });

      expect(mockPricingService.calculatePrice).toHaveBeenCalledWith(
        'buyer-1',
        10,
        120,
        expect.any(Array),
      );
      expect(mockPrisma.marketplaceOrder.create).toHaveBeenCalled();
      expect(mockListingService.trackOrder).toHaveBeenCalledWith('listing-1');
    });

    it('should throw if no items provided', async () => {
      await expect(
        service.create('tenant-1', 'buyer-1', {
          items: [],
          shippingAddress: {},
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if listing not found', async () => {
      mockPrisma.marketplaceListing.findUnique.mockResolvedValue(null);

      await expect(
        service.create('tenant-1', 'buyer-1', {
          items: [{ listingId: 'missing', quantity: 1 }],
          shippingAddress: {},
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should convert enquiry when sourceEnquiryId provided', async () => {
      mockPrisma.marketplaceListing.findUnique.mockResolvedValue(MOCK_LISTING);
      mockPrisma.marketplaceOrder.count.mockResolvedValue(0);
      mockPrisma.marketplaceOrder.create.mockResolvedValue(MOCK_ORDER);
      mockPrisma.marketplaceEnquiry.update.mockResolvedValue({});

      await service.create('tenant-1', 'buyer-1', {
        items: [{ listingId: 'listing-1', quantity: 10 }],
        shippingAddress: {},
        sourceEnquiryId: 'enquiry-1',
      });

      expect(mockPrisma.marketplaceEnquiry.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'ENQ_CONVERTED',
            convertedToOrderId: 'order-1',
          }),
        }),
      );
    });
  });

  describe('updateStatus', () => {
    it('should update status and append to history', async () => {
      mockPrisma.marketplaceOrder.findUnique.mockResolvedValue({
        ...MOCK_ORDER,
        statusHistory: [],
      });
      mockPrisma.marketplaceOrder.update.mockResolvedValue({});

      await service.updateStatus('order-1', 'MKT_CONFIRMED' as any, 'Order confirmed');

      expect(mockPrisma.marketplaceOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'MKT_CONFIRMED',
            statusHistory: expect.arrayContaining([
              expect.objectContaining({ status: 'MKT_CONFIRMED' }),
            ]),
          }),
        }),
      );
    });

    it('should set deliveredAt for DELIVERED status', async () => {
      mockPrisma.marketplaceOrder.findUnique.mockResolvedValue({
        ...MOCK_ORDER,
        statusHistory: [],
      });
      mockPrisma.marketplaceOrder.update.mockResolvedValue({});

      await service.updateStatus('order-1', 'MKT_DELIVERED' as any);

      expect(mockPrisma.marketplaceOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            deliveredAt: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should throw for non-existent order', async () => {
      mockPrisma.marketplaceOrder.findUnique.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
