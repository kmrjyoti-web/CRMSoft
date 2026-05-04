import { Test, TestingModule } from '@nestjs/testing';
import { WaBroadcastExecutorService } from '../services/wa-broadcast-executor.service';
import { WaApiService } from '../services/wa-api.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

describe('WaBroadcastExecutorService', () => {
  let service: WaBroadcastExecutorService;
  let prisma: any;
  let waApiService: any;

  const baseBroadcast = {
    id: 'broadcast-1',
    name: 'Test Broadcast',
    wabaId: 'waba-1',
    templateId: 'tpl-1',
    status: 'DRAFT',
    throttlePerSecond: 0,
    totalRecipients: 2,
    sentCount: 0,
    failedCount: 0,
    optOutCount: 0,
    template: {
      id: 'tpl-1',
      name: 'welcome_template',
      language: 'en',
    },
  };

  const mockRecipients = [
    {
      id: 'recip-1',
      broadcastId: 'broadcast-1',
      phoneNumber: '+1111111111',
      contactName: 'Alice',
      status: 'PENDING',
      variables: {},
    },
    {
      id: 'recip-2',
      broadcastId: 'broadcast-1',
      phoneNumber: '+2222222222',
      contactName: 'Bob',
      status: 'PENDING',
      variables: {},
    },
  ];

  beforeEach(async () => {
    prisma = {
      waBroadcast: {
        findUniqueOrThrow: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      waBroadcastRecipient: {
        findMany: jest.fn().mockResolvedValue(mockRecipients),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      waOptOut: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      waMessage: {
        create: jest.fn().mockResolvedValue({ id: 'msg-1', waMessageId: 'wamid-1' }),
      },
      waConversation: {
        findFirst: jest.fn().mockResolvedValue({ id: 'conv-1' }),
        create: jest.fn().mockResolvedValue({ id: 'conv-new-1' }),
      },
    };
(prisma as any).working = prisma;

    waApiService = {
      sendTemplate: jest.fn().mockResolvedValue({ messages: [{ id: 'wamid-1' }] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaBroadcastExecutorService,
        { provide: PrismaService, useValue: prisma },
        { provide: WaApiService, useValue: waApiService },
      ],
    }).compile();

    service = module.get<WaBroadcastExecutorService>(WaBroadcastExecutorService);
  });

  it('should execute broadcast and send templates', async () => {
    prisma.waBroadcast.findUniqueOrThrow.mockResolvedValue({
      ...baseBroadcast,
      status: 'DRAFT',
    });
    // During loop, broadcast is still SENDING
    prisma.waBroadcast.findUnique.mockResolvedValue({
      ...baseBroadcast,
      status: 'SENDING',
    });

    await service.executeBroadcast('broadcast-1');

    // Should update broadcast to SENDING first
    expect(prisma.waBroadcast.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'broadcast-1' },
        data: expect.objectContaining({ status: 'SENDING' }),
      }),
    );

    // sendTemplate should be called once per recipient (2 recipients)
    expect(waApiService.sendTemplate).toHaveBeenCalledTimes(2);

    // Each recipient should be marked SENT
    expect(prisma.waBroadcastRecipient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'recip-1' },
        data: expect.objectContaining({ status: 'SENT' }),
      }),
    );
    expect(prisma.waBroadcastRecipient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'recip-2' },
        data: expect.objectContaining({ status: 'SENT' }),
      }),
    );
  });

  it('should skip opted-out recipients', async () => {
    prisma.waBroadcast.findUniqueOrThrow.mockResolvedValue({
      ...baseBroadcast,
      status: 'DRAFT',
    });
    prisma.waBroadcast.findUnique.mockResolvedValue({
      ...baseBroadcast,
      status: 'SENDING',
    });
    // One phone number is opted out
    prisma.waOptOut.findMany.mockResolvedValue([
      { phoneNumber: '+1111111111' },
    ]);

    await service.executeBroadcast('broadcast-1');

    // Only 1 sendTemplate call (the non-opted-out recipient)
    expect(waApiService.sendTemplate).toHaveBeenCalledTimes(1);
    expect(waApiService.sendTemplate).toHaveBeenCalledWith(
      'waba-1',
      '+2222222222',
      'welcome_template',
      'en',
      undefined,
    );

    // The opted-out recipient should be marked OPTED_OUT
    expect(prisma.waBroadcastRecipient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'recip-1' },
        data: expect.objectContaining({ status: 'OPTED_OUT' }),
      }),
    );
  });

  it('should handle broadcast pause', async () => {
    prisma.waBroadcast.findUniqueOrThrow.mockResolvedValue({
      ...baseBroadcast,
      status: 'DRAFT',
    });
    // Return PAUSED on the first findUnique check inside the loop
    prisma.waBroadcast.findUnique.mockResolvedValue({
      ...baseBroadcast,
      status: 'PAUSED',
    });

    await service.executeBroadcast('broadcast-1');

    // The loop should break immediately; no templates sent
    expect(waApiService.sendTemplate).not.toHaveBeenCalled();
  });

  it('should cancel broadcast and fail pending recipients', async () => {
    await service.cancelBroadcast('broadcast-1');

    expect(prisma.waBroadcast.update).toHaveBeenCalledWith({
      where: { id: 'broadcast-1' },
      data: { status: 'CANCELLED' },
    });
    expect(prisma.waBroadcastRecipient.updateMany).toHaveBeenCalledWith({
      where: { broadcastId: 'broadcast-1', status: 'PENDING' },
      data: { status: 'FAILED', failureReason: 'Broadcast cancelled' },
    });
  });

  it('should mark failed status on API error', async () => {
    prisma.waBroadcast.findUniqueOrThrow.mockResolvedValue({
      ...baseBroadcast,
      status: 'DRAFT',
    });
    prisma.waBroadcast.findUnique.mockResolvedValue({
      ...baseBroadcast,
      status: 'SENDING',
    });
    // Only one recipient for simplicity
    prisma.waBroadcastRecipient.findMany.mockResolvedValue([mockRecipients[0]]);

    waApiService.sendTemplate.mockRejectedValue(new Error('WhatsApp API rate limit exceeded'));

    await service.executeBroadcast('broadcast-1');

    // Recipient should be marked FAILED with error message
    expect(prisma.waBroadcastRecipient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'recip-1' },
        data: expect.objectContaining({
          status: 'FAILED',
          failureReason: 'WhatsApp API rate limit exceeded',
        }),
      }),
    );
  });
});
