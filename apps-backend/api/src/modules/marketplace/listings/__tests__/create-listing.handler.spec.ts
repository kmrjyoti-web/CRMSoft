import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateListingHandler } from '../application/commands/create-listing/create-listing.handler';
import { CreateListingCommand } from '../application/commands/create-listing/create-listing.command';
import { MktPrismaService } from '../infrastructure/mkt-prisma.service';

const mockMktPrisma = {
  client: {
    mktListing: {
      create: jest.fn(),
    },
  },
};

describe('CreateListingHandler', () => {
  let handler: CreateListingHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateListingHandler,
        { provide: MktPrismaService, useValue: mockMktPrisma },
      ],
    }).compile();

    handler = module.get<CreateListingHandler>(CreateListingHandler);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create a listing and return its id', async () => {
    const mockId = 'new-listing-id';
    mockMktPrisma.client.mktListing.create.mockResolvedValue({ id: mockId, title: 'Test', status: 'DRAFT' });

    const command = new CreateListingCommand(
      'tenant-1', 'user-1', 'PRODUCT', 'Test Product', 'user-1',
    );

    const result = await handler.execute(command);
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(mockMktPrisma.client.mktListing.create).toHaveBeenCalledTimes(1);
  });

  it('should create listing with SCHEDULED status when publishAt is in future', async () => {
    const futureDate = new Date(Date.now() + 86400000);
    mockMktPrisma.client.mktListing.create.mockResolvedValue({ id: 'id-1', status: 'SCHEDULED' });

    const command = new CreateListingCommand(
      'tenant-1', 'user-1', 'PRODUCT', 'Future Product', 'user-1',
      undefined, undefined, undefined, undefined, undefined, undefined, 0, undefined,
      1, undefined, undefined, undefined, true, 100, undefined, undefined,
      futureDate,
    );

    await handler.execute(command);
    const callArg = mockMktPrisma.client.mktListing.create.mock.calls[0][0];
    expect(callArg.data.status).toBe('SCHEDULED');
  });
});
