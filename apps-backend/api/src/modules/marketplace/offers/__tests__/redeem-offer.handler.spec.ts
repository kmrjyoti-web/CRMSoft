import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RedeemOfferHandler } from '../application/commands/redeem-offer/redeem-offer.handler';
import { RedeemOfferCommand } from '../application/commands/redeem-offer/redeem-offer.command';
import { MktPrismaService } from '../infrastructure/mkt-prisma.service';

const mockOffer = {
  id: 'offer-1',
  tenantId: 'tenant-1',
  title: 'Test Offer',
  status: 'ACTIVE',
  offerType: 'ONE_TIME',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  currentRedemptions: 0,
  maxRedemptions: 5,
  autoCloseOnLimit: true,
  conditions: {},
  expiresAt: null,
  linkedListingIds: [],
  linkedCategoryIds: [],
  isDeleted: false,
  lastResetAt: null,
};

const mockTx = {
  mktOfferRedemption: { create: jest.fn() },
  mktOffer: { update: jest.fn() },
};

const mockMktPrisma = {
  client: {
    mktOffer: {
      findFirst: jest.fn(),
    },
    mktOfferRedemption: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation(async (fn: any) => fn(mockTx)),
  },
};

describe('RedeemOfferHandler', () => {
  let handler: RedeemOfferHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        RedeemOfferHandler,
        { provide: MktPrismaService, useValue: mockMktPrisma },
      ],
    }).compile();

    handler = module.get<RedeemOfferHandler>(RedeemOfferHandler);
  });

  afterEach(() => jest.clearAllMocks());

  it('should successfully redeem an offer', async () => {
    mockMktPrisma.client.mktOffer.findFirst.mockResolvedValue(mockOffer);

    const command = new RedeemOfferCommand('offer-1', 'tenant-1', 'user-1', undefined, 1000);
    const result = await handler.execute(command);

    expect(result).toHaveProperty('redemptionId');
    expect(result).toHaveProperty('discountAmount');
    expect(result.discountAmount).toBe(100); // 10% of 1000
  });

  it('should throw NotFoundException for non-existent offer', async () => {
    mockMktPrisma.client.mktOffer.findFirst.mockResolvedValue(null);

    const command = new RedeemOfferCommand('bad-offer', 'tenant-1', 'user-1');
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for inactive offer', async () => {
    mockMktPrisma.client.mktOffer.findFirst.mockResolvedValue({
      ...mockOffer,
      status: 'PAUSED',
    });

    const command = new RedeemOfferCommand('offer-1', 'tenant-1', 'user-1');
    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });
});
