import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateOfferHandler } from '../application/commands/create-offer/create-offer.handler';
import { CreateOfferCommand } from '../application/commands/create-offer/create-offer.command';
import { MktPrismaService } from '../infrastructure/mkt-prisma.service';

const mockMktPrisma = {
  client: {
    mktOffer: {
      create: jest.fn(),
    },
  },
};

describe('CreateOfferHandler', () => {
  let handler: CreateOfferHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateOfferHandler,
        { provide: MktPrismaService, useValue: mockMktPrisma },
      ],
    }).compile();

    handler = module.get<CreateOfferHandler>(CreateOfferHandler);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create an offer and return its id', async () => {
    mockMktPrisma.client.mktOffer.create.mockResolvedValue({
      id: 'new-offer-id',
      title: 'Summer Sale',
      status: 'DRAFT',
    });

    const command = new CreateOfferCommand(
      'tenant-1', 'user-1', 'user-1',
      'Summer Sale 20% Off',
      'ONE_TIME', 'PERCENTAGE', 20,
    );

    const result = await handler.execute(command);
    expect(typeof result).toBe('string');
    expect(mockMktPrisma.client.mktOffer.create).toHaveBeenCalledTimes(1);
  });

  it('should set SCHEDULED status for future publishAt', async () => {
    mockMktPrisma.client.mktOffer.create.mockResolvedValue({ id: 'id-1', status: 'SCHEDULED' });

    const futureDate = new Date(Date.now() + 86400000);
    const command = new CreateOfferCommand(
      'tenant-1', 'user-1', 'user-1',
      'Upcoming Sale', 'ONE_TIME', 'FLAT_AMOUNT', 50,
      undefined, undefined, undefined, undefined, undefined, undefined,
      100, true, undefined, futureDate,
    );

    await handler.execute(command);
    const callArg = mockMktPrisma.client.mktOffer.create.mock.calls[0][0];
    expect(callArg.data.status).toBe('SCHEDULED');
  });
});
