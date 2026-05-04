import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CampaignExecutorService } from '../services/campaign-executor.service';
import { TemplateRendererService } from '../services/template-renderer.service';
import { TrackingService } from '../services/tracking.service';
import { EmailSenderService } from '../services/email-sender.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

describe('CampaignExecutorService', () => {
  let service: CampaignExecutorService;
  let prisma: any;
  let templateRenderer: any;
  let trackingService: any;
  let emailSender: any;

  const baseCampaign = {
    id: 'camp-1',
    name: 'Test Campaign',
    subject: 'Hello {{firstName}}',
    bodyHtml: '<p>Hi {{firstName}}</p>',
    accountId: 'acc-1',
    fromName: 'Marketing',
    replyToEmail: 'reply@example.com',
    trackOpens: true,
    trackClicks: true,
    sendRatePerMinute: 0,
    totalRecipients: 1,
    sentCount: 0,
    deliveredCount: 0,
    openedCount: 0,
    clickedCount: 0,
    repliedCount: 0,
    bouncedCount: 0,
    failedCount: 0,
    unsubscribedCount: 0,
  };

  const mockRecipient = {
    id: 'recip-1',
    campaignId: 'camp-1',
    email: 'lead@example.com',
    firstName: 'Alice',
    lastName: 'Smith',
    companyName: 'Acme',
    status: 'PENDING',
    mergeData: {},
  };

  beforeEach(async () => {
    prisma = {
      emailCampaign: {
        findUniqueOrThrow: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      campaignRecipient: {
        findMany: jest.fn().mockResolvedValue([mockRecipient]),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      emailUnsubscribe: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      email: {
        create: jest.fn().mockResolvedValue({ id: 'email-camp-1' }),
        update: jest.fn().mockResolvedValue({}),
      },
    };
(prisma as any).working = prisma;

    templateRenderer = {
      render: jest.fn().mockImplementation((tpl: string, data: Record<string, string>) => tpl.replace(/\{\{(\w+)\}\}/g, (_: string, k: string) => data[k] || '')),
    };

    trackingService = {
      generateTrackingPixelId: jest.fn().mockReturnValue('pixel-camp-1'),
      injectOpenPixel: jest.fn().mockImplementation((html) => html + '<img />'),
      rewriteLinks: jest.fn().mockImplementation((html) => html),
    };

    emailSender = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignExecutorService,
        { provide: PrismaService, useValue: prisma },
        { provide: TemplateRendererService, useValue: templateRenderer },
        { provide: TrackingService, useValue: trackingService },
        { provide: EmailSenderService, useValue: emailSender },
      ],
    }).compile();

    service = module.get<CampaignExecutorService>(CampaignExecutorService);
  });

  it('should throw BadRequestException for campaign in SENDING status', async () => {
    prisma.emailCampaign.findUniqueOrThrow.mockResolvedValue({
      ...baseCampaign,
      status: 'SENDING',
    });

    await expect(service.executeCampaign('camp-1')).rejects.toThrow(BadRequestException);
  });

  it('should pause campaign by updating status to PAUSED', async () => {
    await service.pauseCampaign('camp-1');

    expect(prisma.emailCampaign.update).toHaveBeenCalledWith({
      where: { id: 'camp-1' },
      data: { status: 'PAUSED' },
    });
  });

  it('should cancel campaign and update status and pending recipients', async () => {
    await service.cancelCampaign('camp-1');

    expect(prisma.emailCampaign.update).toHaveBeenCalledWith({
      where: { id: 'camp-1' },
      data: { status: 'CANCELLED' },
    });
    expect(prisma.campaignRecipient.updateMany).toHaveBeenCalledWith({
      where: { campaignId: 'camp-1', status: 'PENDING' },
      data: { status: 'FAILED', errorMessage: 'Campaign cancelled' },
    });
  });

  it('should execute campaign for DRAFT status and send emails', async () => {
    prisma.emailCampaign.findUniqueOrThrow.mockResolvedValue({
      ...baseCampaign,
      status: 'DRAFT',
    });
    // Return SENDING status on findUnique during loop (not paused/cancelled)
    prisma.emailCampaign.findUnique.mockResolvedValue({
      ...baseCampaign,
      status: 'SENDING',
    });

    await service.executeCampaign('camp-1');

    // Should update campaign to SENDING first
    expect(prisma.emailCampaign.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'camp-1' },
        data: expect.objectContaining({ status: 'SENDING' }),
      }),
    );

    // Should render template with merge data
    expect(templateRenderer.render).toHaveBeenCalled();

    // Should create email record
    expect(prisma.email.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          accountId: 'acc-1',
          direction: 'OUTBOUND',
          status: 'QUEUED',
          campaignId: 'camp-1',
        }),
      }),
    );

    // Should send the email
    expect(emailSender.send).toHaveBeenCalledWith('email-camp-1');

    // Should update recipient status to SENT
    expect(prisma.campaignRecipient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'recip-1' },
        data: expect.objectContaining({ status: 'SENT' }),
      }),
    );
  });
});
