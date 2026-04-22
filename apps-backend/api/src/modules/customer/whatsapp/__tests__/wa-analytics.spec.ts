import { Test, TestingModule } from '@nestjs/testing';
import { WaAnalyticsService } from '../services/wa-analytics.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

describe('WaAnalyticsService', () => {
  let service: WaAnalyticsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      waMessage: {
        count: jest.fn(),
      },
      waConversation: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      waBroadcast: {
        findUniqueOrThrow: jest.fn(),
      },
      waBroadcastRecipient: {
        groupBy: jest.fn(),
      },
    };
(prisma as any).working = prisma;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaAnalyticsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WaAnalyticsService>(WaAnalyticsService);
  });

  it('should return overall analytics', async () => {
    // Mock counts in the order they are called by getOverallAnalytics:
    // totalSent, totalReceived, totalDelivered, totalRead, totalFailed,
    // totalConversations, openConversations, resolvedConversations
    prisma.waMessage.count
      .mockResolvedValueOnce(100)  // totalSent (OUTBOUND)
      .mockResolvedValueOnce(200)  // totalReceived (INBOUND)
      .mockResolvedValueOnce(80)   // totalDelivered (OUTBOUND, DELIVERED)
      .mockResolvedValueOnce(50)   // totalRead (OUTBOUND, READ)
      .mockResolvedValueOnce(5);   // totalFailed (OUTBOUND, FAILED)

    prisma.waConversation.count
      .mockResolvedValueOnce(150)  // totalConversations
      .mockResolvedValueOnce(40)   // openConversations
      .mockResolvedValueOnce(110); // resolvedConversations

    const result = await service.getOverallAnalytics('waba-1');

    expect(result.totalSent).toBe(100);
    expect(result.totalReceived).toBe(200);
    expect(result.totalDelivered).toBe(80);
    expect(result.totalRead).toBe(50);
    expect(result.totalFailed).toBe(5);
    expect(result.deliveryRate).toBe(80);   // Math.round(80/100 * 100)
    expect(result.readRate).toBe(50);       // Math.round(50/100 * 100)
    expect(result.totalConversations).toBe(150);
    expect(result.openConversations).toBe(40);
    expect(result.resolvedConversations).toBe(110);
  });

  it('should return empty analytics for no data', async () => {
    // All counts return 0
    prisma.waMessage.count.mockResolvedValue(0);
    prisma.waConversation.count.mockResolvedValue(0);

    const result = await service.getOverallAnalytics('waba-empty');

    expect(result.totalSent).toBe(0);
    expect(result.totalReceived).toBe(0);
    expect(result.totalDelivered).toBe(0);
    expect(result.totalRead).toBe(0);
    expect(result.totalFailed).toBe(0);
    expect(result.deliveryRate).toBe(0);
    expect(result.readRate).toBe(0);
    expect(result.totalConversations).toBe(0);
    expect(result.openConversations).toBe(0);
    expect(result.resolvedConversations).toBe(0);
  });

  it('should calculate agent performance', async () => {
    prisma.waConversation.findMany.mockResolvedValue([
      {
        assignedToId: 'agent-1',
        status: 'RESOLVED',
        messageCount: 12,
        assignedTo: { id: 'agent-1', firstName: 'John', lastName: 'Doe' },
      },
      {
        assignedToId: 'agent-1',
        status: 'OPEN',
        messageCount: 5,
        assignedTo: { id: 'agent-1', firstName: 'John', lastName: 'Doe' },
      },
      {
        assignedToId: 'agent-2',
        status: 'RESOLVED',
        messageCount: 8,
        assignedTo: { id: 'agent-2', firstName: 'Jane', lastName: 'Smith' },
      },
    ]);

    const result = await service.getAgentPerformance('waba-1');

    expect(result).toHaveLength(2);

    const agent1 = result.find((a: any) => a.userId === 'agent-1');
    expect(agent1).toBeDefined();
    expect(agent1.name).toBe('John Doe');
    expect(agent1.totalAssigned).toBe(2);
    expect(agent1.resolved).toBe(1);
    expect(agent1.open).toBe(1);
    expect(agent1.totalMessages).toBe(17); // 12 + 5

    const agent2 = result.find((a: any) => a.userId === 'agent-2');
    expect(agent2).toBeDefined();
    expect(agent2.name).toBe('Jane Smith');
    expect(agent2.totalAssigned).toBe(1);
    expect(agent2.resolved).toBe(1);
    expect(agent2.open).toBe(0);
    expect(agent2.totalMessages).toBe(8);
  });
});
