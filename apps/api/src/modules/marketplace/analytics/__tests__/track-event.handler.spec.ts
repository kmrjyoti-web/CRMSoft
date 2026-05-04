import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { TrackEventHandler } from '../application/commands/track-event/track-event.handler';
import { TrackEventCommand } from '../application/commands/track-event/track-event.command';
import { MktPrismaService } from '../infrastructure/mkt-prisma.service';

const mockMktPrisma = {
  client: {
    mktAnalyticsEvent: {
      create: jest.fn(),
    },
    mktListing: {
      updateMany: jest.fn(),
    },
    mktPost: {
      updateMany: jest.fn(),
    },
    mktOffer: {
      updateMany: jest.fn(),
    },
  },
};

describe('TrackEventHandler', () => {
  let handler: TrackEventHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        TrackEventHandler,
        { provide: MktPrismaService, useValue: mockMktPrisma },
      ],
    }).compile();

    handler = module.get<TrackEventHandler>(TrackEventHandler);
  });

  afterEach(() => jest.clearAllMocks());

  it('should insert analytics event into database', async () => {
    mockMktPrisma.client.mktAnalyticsEvent.create.mockResolvedValue({ id: 'event-1' });
    mockMktPrisma.client.mktListing.updateMany.mockResolvedValue({ count: 1 });

    const command = new TrackEventCommand(
      'tenant-1', 'LISTING', 'listing-1', 'VIEW', 'user-1', 'FEED',
    );

    await handler.execute(command);

    expect(mockMktPrisma.client.mktAnalyticsEvent.create).toHaveBeenCalledTimes(1);
    const createArg = mockMktPrisma.client.mktAnalyticsEvent.create.mock.calls[0][0];
    expect(createArg.data.entityType).toBe('LISTING');
    expect(createArg.data.entityId).toBe('listing-1');
    expect(createArg.data.eventType).toBe('VIEW');
  });

  it('should NOT compute summaries inline (BullMQ handles that)', async () => {
    mockMktPrisma.client.mktAnalyticsEvent.create.mockResolvedValue({ id: 'event-1' });
    mockMktPrisma.client.mktOffer.updateMany.mockResolvedValue({ count: 0 });

    const command = new TrackEventCommand('tenant-1', 'OFFER', 'offer-1', 'IMPRESSION');
    await handler.execute(command);

    // Only raw event insert and counter update — no summary computation
    expect(mockMktPrisma.client.mktAnalyticsEvent.create).toHaveBeenCalledTimes(1);
  });
});
