import { Test, TestingModule } from '@nestjs/testing';
import { EmailSyncService } from '../services/email-sync.service';
import { EmailProviderFactoryService } from '../services/email-provider-factory.service';
import { ThreadBuilderService } from '../services/thread-builder.service';
import { EmailLinkerService } from '../services/email-linker.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('EmailSyncService', () => {
  let service: EmailSyncService;
  let prisma: any;
  let providerFactory: any;
  let threadBuilder: any;
  let linker: any;
  let mockProviderService: any;

  const mockActiveAccount = {
    id: 'acc-1',
    provider: 'GMAIL',
    status: 'ACTIVE',
    syncToken: 'token-abc',
    syncFromDate: null,
    autoLinkEnabled: true,
  };

  const mockInactiveAccount = {
    id: 'acc-2',
    provider: 'OUTLOOK',
    status: 'DISCONNECTED',
    syncToken: null,
    syncFromDate: null,
    autoLinkEnabled: false,
  };

  const mockFetchedEmail = {
    providerMessageId: 'prov-msg-1',
    providerThreadId: 'prov-thread-1',
    internetMessageId: '<msg-001@example.com>',
    from: { email: 'sender@example.com', name: 'Sender' },
    to: [{ email: 'user@example.com', name: 'User' }],
    cc: [],
    subject: 'Test Sync Email',
    bodyHtml: '<p>Synced content</p>',
    bodyText: 'Synced content',
    snippet: 'Synced content',
    date: new Date('2026-01-15T10:00:00Z'),
    inReplyTo: null,
    references: [],
    labels: ['INBOX'],
    isRead: false,
    attachments: [],
  };

  beforeEach(async () => {
    mockProviderService = {
      fetchEmails: jest.fn().mockResolvedValue({
        emails: [mockFetchedEmail],
        newSyncToken: 'token-new',
      }),
    };

    prisma = {
      emailAccount: {
        findUniqueOrThrow: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      email: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'email-new-1' }),
      },
      emailAttachment: {
        createMany: jest.fn().mockResolvedValue({}),
      },
    };

    providerFactory = {
      getService: jest.fn().mockReturnValue(mockProviderService),
    };

    threadBuilder = {
      assignThread: jest.fn().mockResolvedValue('thread-1'),
    };

    linker = {
      autoLink: jest.fn().mockResolvedValue({ entityType: 'CONTACT', entityId: 'c-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailSyncService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmailProviderFactoryService, useValue: providerFactory },
        { provide: ThreadBuilderService, useValue: threadBuilder },
        { provide: EmailLinkerService, useValue: linker },
      ],
    }).compile();

    service = module.get<EmailSyncService>(EmailSyncService);
  });

  it('should return zero counts for inactive account', async () => {
    prisma.emailAccount.findUniqueOrThrow.mockResolvedValue(mockInactiveAccount);

    const result = await service.syncAccount('acc-2');

    expect(result).toEqual({ newEmails: 0, errors: 0 });
    expect(prisma.emailAccount.update).not.toHaveBeenCalled();
  });

  it('should sync new emails successfully', async () => {
    prisma.emailAccount.findUniqueOrThrow.mockResolvedValue(mockActiveAccount);

    const result = await service.syncAccount('acc-1');

    expect(result).toEqual({ newEmails: 1, errors: 0 });
    expect(providerFactory.getService).toHaveBeenCalledWith('GMAIL');
    expect(mockProviderService.fetchEmails).toHaveBeenCalledWith('acc-1', {
      syncToken: 'token-abc',
      since: undefined,
    });
    expect(prisma.email.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          accountId: 'acc-1',
          direction: 'INBOUND',
          fromEmail: 'sender@example.com',
          subject: 'Test Sync Email',
          status: 'DELIVERED',
        }),
      }),
    );
    expect(threadBuilder.assignThread).toHaveBeenCalledWith('email-new-1');
    expect(linker.autoLink).toHaveBeenCalledWith('email-new-1', [
      'sender@example.com',
      'user@example.com',
    ]);
  });

  it('should update sync state after successful sync', async () => {
    prisma.emailAccount.findUniqueOrThrow.mockResolvedValue(mockActiveAccount);

    await service.syncAccount('acc-1');

    // The last emailAccount.update call should set status back to ACTIVE with new sync token
    const updateCalls = prisma.emailAccount.update.mock.calls;
    const lastUpdateCall = updateCalls[updateCalls.length - 1][0];

    expect(lastUpdateCall).toEqual(
      expect.objectContaining({
        where: { id: 'acc-1' },
        data: expect.objectContaining({
          status: 'ACTIVE',
          lastSyncError: null,
          syncToken: 'token-new',
          totalReceived: { increment: 1 },
        }),
      }),
    );
  });
});
