import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateReviewHandler } from '../application/commands/create-review/create-review.handler';
import { CreateReviewCommand } from '../application/commands/create-review/create-review.command';
import { MktPrismaService } from '../infrastructure/mkt-prisma.service';

const mockListing = { id: 'listing-1', tenantId: 'tenant-1', status: 'ACTIVE', isDeleted: false };

const mockMktPrisma = {
  client: {
    mktListing: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    mktReview: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([{ rating: 4 }, { rating: 5 }]),
    },
  },
};

describe('CreateReviewHandler', () => {
  let handler: CreateReviewHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateReviewHandler,
        { provide: MktPrismaService, useValue: mockMktPrisma },
      ],
    }).compile();

    handler = module.get<CreateReviewHandler>(CreateReviewHandler);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create a PENDING review for unverified purchase', async () => {
    mockMktPrisma.client.mktListing.findFirst.mockResolvedValue(mockListing);
    mockMktPrisma.client.mktReview.create.mockResolvedValue({
      id: 'review-1', status: 'PENDING', rating: 4,
    });

    const command = new CreateReviewCommand('tenant-1', 'listing-1', 'user-1', 4, 'Great product');
    const result = await handler.execute(command);

    const createCall = mockMktPrisma.client.mktReview.create.mock.calls[0][0];
    expect(createCall.data.status).toBe('PENDING');
    expect(createCall.data.isVerifiedPurchase).toBe(false);
  });

  it('should auto-approve review with orderId (verified purchase)', async () => {
    mockMktPrisma.client.mktListing.findFirst.mockResolvedValue(mockListing);
    mockMktPrisma.client.mktReview.create.mockResolvedValue({
      id: 'review-1', status: 'APPROVED', rating: 5,
    });

    const command = new CreateReviewCommand(
      'tenant-1', 'listing-1', 'user-1', 5, 'Excellent', 'Amazing!', [], 'order-1',
    );
    await handler.execute(command);

    const createCall = mockMktPrisma.client.mktReview.create.mock.calls[0][0];
    expect(createCall.data.status).toBe('APPROVED');
    expect(createCall.data.isVerifiedPurchase).toBe(true);
    // Should update listing rating for approved review
    expect(mockMktPrisma.client.mktListing.update).toHaveBeenCalled();
  });

  it('should throw NotFoundException if listing does not exist', async () => {
    mockMktPrisma.client.mktListing.findFirst.mockResolvedValue(null);

    const command = new CreateReviewCommand('tenant-1', 'bad-listing', 'user-1', 4);
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for invalid rating', async () => {
    const command = new CreateReviewCommand('tenant-1', 'listing-1', 'user-1', 6);
    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });
});
