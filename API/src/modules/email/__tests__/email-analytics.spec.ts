import { Test, TestingModule } from '@nestjs/testing';
import { EmailAnalyticsService } from '../services/email-analytics.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('EmailAnalyticsService', () => {
  let service: EmailAnalyticsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      emailAccount: {
        findMany: jest.fn(),
      },
      email: {
        count: jest.fn(),
      },
      emailCampaign: {
        findUniqueOrThrow: jest.fn(),
      },
      campaignRecipient: {
        groupBy: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailAnalyticsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EmailAnalyticsService>(EmailAnalyticsService);
  });

  it('should return correct overall analytics stats and rates', async () => {
    prisma.emailAccount.findMany.mockResolvedValue([
      { id: 'acc-1' },
      { id: 'acc-2' },
    ]);

    // Mock counts: totalSent, totalReceived, totalOpened, totalClicked, totalBounced, totalReplied
    prisma.email.count
      .mockResolvedValueOnce(100) // totalSent
      .mockResolvedValueOnce(200) // totalReceived
      .mockResolvedValueOnce(50)  // totalOpened
      .mockResolvedValueOnce(20)  // totalClicked
      .mockResolvedValueOnce(5)   // totalBounced
      .mockResolvedValueOnce(10); // totalReplied

    const result = await service.getOverallAnalytics('user-1');

    expect(result.totalSent).toBe(100);
    expect(result.totalReceived).toBe(200);
    expect(result.totalOpened).toBe(50);
    expect(result.totalClicked).toBe(20);
    expect(result.totalBounced).toBe(5);
    expect(result.totalReplied).toBe(10);
    expect(result.openRate).toBe(50);    // 50/100 * 100
    expect(result.clickRate).toBe(20);   // 20/100 * 100
    expect(result.bounceRate).toBe(5);   // 5/100 * 100
    expect(result.replyRate).toBe(10);   // 10/100 * 100
  });

  it('should return empty analytics when user has no accounts', async () => {
    prisma.emailAccount.findMany.mockResolvedValue([]);

    const result = await service.getOverallAnalytics('user-no-accounts');

    expect(result.totalSent).toBe(0);
    expect(result.totalReceived).toBe(0);
    expect(result.totalOpened).toBe(0);
    expect(result.totalClicked).toBe(0);
    expect(result.openRate).toBe(0);
    expect(result.clickRate).toBe(0);
    expect(result.bounceRate).toBe(0);
    expect(result.replyRate).toBe(0);
  });

  it('should return campaign stats with recipient breakdown', async () => {
    const mockCampaign = {
      id: 'camp-1',
      name: 'Q1 Outreach',
      status: 'COMPLETED',
      totalRecipients: 50,
      sentCount: 45,
      deliveredCount: 42,
      openedCount: 30,
      clickedCount: 15,
      repliedCount: 5,
      bouncedCount: 3,
      failedCount: 5,
      unsubscribedCount: 2,
      startedAt: new Date('2026-01-10'),
      completedAt: new Date('2026-01-10'),
    };

    prisma.emailCampaign.findUniqueOrThrow.mockResolvedValue(mockCampaign);
    prisma.campaignRecipient.groupBy.mockResolvedValue([
      { status: 'SENT', _count: { id: 40 } },
      { status: 'FAILED', _count: { id: 5 } },
      { status: 'UNSUBSCRIBED', _count: { id: 2 } },
      { status: 'PENDING', _count: { id: 3 } },
    ]);

    const result = await service.getCampaignStats('camp-1');

    expect(result.campaign.id).toBe('camp-1');
    expect(result.campaign.name).toBe('Q1 Outreach');
    expect(result.campaign.status).toBe('COMPLETED');
    expect(result.stats.sent).toBe(45);
    expect(result.stats.opened).toBe(30);
    expect(result.stats.clicked).toBe(15);
    expect(result.stats.openRate).toBe(67); // Math.round(30/45 * 100)
    expect(result.stats.clickRate).toBe(33); // Math.round(15/45 * 100)
    expect(result.recipientBreakdown).toEqual({
      SENT: 40,
      FAILED: 5,
      UNSUBSCRIBED: 2,
      PENDING: 3,
    });
  });
});
