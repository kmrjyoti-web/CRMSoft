import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EmailSenderService } from '../services/email-sender.service';
import { EmailProviderFactoryService } from '../services/email-provider-factory.service';
import { TrackingService } from '../services/tracking.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

describe('EmailSenderService', () => {
  let service: EmailSenderService;
  let prisma: any;
  let providerFactory: any;
  let trackingService: any;
  let mockProviderService: any;

  const mockAccount = {
    id: 'acc-1',
    provider: 'GMAIL',
    emailAddress: 'user@example.com',
    displayName: 'Test User',
    todaySentCount: 5,
    dailySendLimit: 100,
  };

  const mockEmail = {
    id: 'email-1',
    accountId: 'acc-1',
    account: mockAccount,
    attachments: [],
    toEmails: [{ email: 'recipient@example.com', name: 'Recipient' }],
    ccEmails: [],
    bccEmails: [],
    subject: 'Test Email',
    bodyHtml: '<p>Hello</p>',
    bodyText: 'Hello',
    replyToEmail: null,
    inReplyToMessageId: null,
    references: [],
    retryCount: 0,
    status: 'QUEUED',
  };

  beforeEach(async () => {
    mockProviderService = {
      sendEmail: jest.fn().mockResolvedValue({
        messageId: 'msg-id-1',
        providerMessageId: 'provider-msg-1',
        threadId: 'thread-1',
      }),
    };

    prisma = {
      email: {
        findUniqueOrThrow: jest.fn().mockResolvedValue(mockEmail),
        update: jest.fn().mockResolvedValue(mockEmail),
      },
      emailUnsubscribe: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      emailAccount: {
        update: jest.fn().mockResolvedValue(mockAccount),
      },
    };

    providerFactory = {
      getService: jest.fn().mockReturnValue(mockProviderService),
    };

    trackingService = {
      generateTrackingPixelId: jest.fn().mockReturnValue('pixel-123'),
      injectOpenPixel: jest.fn().mockImplementation((html) => html),
      rewriteLinks: jest.fn().mockImplementation((html) => html),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailSenderService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmailProviderFactoryService, useValue: providerFactory },
        { provide: TrackingService, useValue: trackingService },
      ],
    }).compile();

    service = module.get<EmailSenderService>(EmailSenderService);
  });

  it('should send email successfully and update status to SENT', async () => {
    await service.send('email-1');

    expect(prisma.email.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 'email-1' },
      include: { account: true, attachments: true },
    });
    expect(providerFactory.getService).toHaveBeenCalledWith('GMAIL');
    expect(mockProviderService.sendEmail).toHaveBeenCalled();
    expect(prisma.email.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'email-1' },
        data: expect.objectContaining({ status: 'SENT' }),
      }),
    );
    expect(prisma.emailAccount.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'acc-1' },
        data: expect.objectContaining({
          todaySentCount: { increment: 1 },
          totalSent: { increment: 1 },
        }),
      }),
    );
  });

  it('should throw BadRequestException when daily limit is reached', async () => {
    const limitReachedEmail = {
      ...mockEmail,
      account: { ...mockAccount, todaySentCount: 100, dailySendLimit: 100 },
    };
    prisma.email.findUniqueOrThrow.mockResolvedValue(limitReachedEmail);

    await expect(service.send('email-1')).rejects.toThrow(BadRequestException);
  });

  it('should cancel email when all recipients are unsubscribed', async () => {
    prisma.emailUnsubscribe.findMany.mockResolvedValue([
      { email: 'recipient@example.com' },
    ]);

    await service.send('email-1');

    expect(prisma.email.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'email-1' },
        data: expect.objectContaining({
          status: 'CANCELLED',
          errorMessage: 'All recipients are unsubscribed',
        }),
      }),
    );
    expect(mockProviderService.sendEmail).not.toHaveBeenCalled();
  });

  it('should mark email as FAILED after max retries (3)', async () => {
    const emailWithRetries = { ...mockEmail, retryCount: 2 };
    prisma.email.findUniqueOrThrow.mockResolvedValue(emailWithRetries);
    mockProviderService.sendEmail.mockRejectedValue(new Error('Provider timeout'));

    await service.send('email-1');

    expect(prisma.email.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'FAILED',
          retryCount: 3,
          errorMessage: 'Provider timeout',
        }),
      }),
    );
  });
});
