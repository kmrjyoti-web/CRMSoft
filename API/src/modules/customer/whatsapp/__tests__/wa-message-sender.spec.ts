import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WaMessageSenderService } from '../services/wa-message-sender.service';
import { WaApiService } from '../services/wa-api.service';
import { WaConversationService } from '../services/wa-conversation.service';
import { WaWindowCheckerService } from '../services/wa-window-checker.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

describe('WaMessageSenderService', () => {
  let service: WaMessageSenderService;
  let prisma: any;
  let waApiService: any;
  let conversationService: any;
  let windowChecker: any;

  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const mockConversation = {
    id: 'conv-1',
    wabaId: 'waba-1',
    contactPhone: '919876543210',
    windowExpiresAt: futureDate,
  };

  const mockTemplate = {
    id: 'tpl-1',
    wabaId: 'waba-1',
    name: 'hello_world',
    language: 'en',
  };

  beforeEach(async () => {
    prisma = {
      waConversation: {
        findUniqueOrThrow: jest.fn().mockResolvedValue(mockConversation),
      },
      waOptOut: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      waMessage: {
        create: jest.fn().mockResolvedValue({ id: 'msg-1' }),
      },
      waTemplate: {
        findUniqueOrThrow: jest.fn().mockResolvedValue(mockTemplate),
        update: jest.fn().mockResolvedValue({}),
      },
      whatsAppBusinessAccount: {
        update: jest.fn().mockResolvedValue({}),
      },
    };

    waApiService = {
      sendText: jest.fn().mockResolvedValue({ messages: [{ id: 'wamid.sent-1' }] }),
      sendTemplate: jest.fn().mockResolvedValue({ messages: [{ id: 'wamid.tpl-1' }] }),
      sendMedia: jest.fn().mockResolvedValue({ messages: [{ id: 'wamid.media-1' }] }),
      sendLocation: jest.fn().mockResolvedValue({ messages: [{ id: 'wamid.loc-1' }] }),
    };

    conversationService = {
      updateLastMessage: jest.fn().mockResolvedValue({}),
    };

    windowChecker = {
      isWindowOpen: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaMessageSenderService,
        { provide: PrismaService, useValue: prisma },
        { provide: WaApiService, useValue: waApiService },
        { provide: WaConversationService, useValue: conversationService },
        { provide: WaWindowCheckerService, useValue: windowChecker },
      ],
    }).compile();

    service = module.get<WaMessageSenderService>(WaMessageSenderService);
  });

  it('should send text message', async () => {
    const result = await service.sendText('waba-1', 'conv-1', 'Hello world', 'user-1');

    expect(waApiService.sendText).toHaveBeenCalledWith('waba-1', '919876543210', 'Hello world');
    expect(prisma.waMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        wabaId: 'waba-1',
        conversationId: 'conv-1',
        direction: 'OUTBOUND',
        messageType: 'TEXT',
        status: 'SENT',
        textBody: 'Hello world',
        senderUserId: 'user-1',
      }),
    });
    expect(conversationService.updateLastMessage).toHaveBeenCalledWith(
      'conv-1',
      'Hello world',
      'OUTBOUND',
    );
    expect(result).toEqual({ id: 'msg-1' });
  });

  it('should send template message and bypass window check', async () => {
    await service.sendTemplate('waba-1', 'conv-1', 'tpl-1', undefined, 'user-1');

    expect(waApiService.sendTemplate).toHaveBeenCalledWith(
      'waba-1',
      '919876543210',
      'hello_world',
      'en',
      undefined,
    );
    // Template messages bypass window check, so isWindowOpen should NOT be called
    expect(windowChecker.isWindowOpen).not.toHaveBeenCalled();
    expect(prisma.waMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        messageType: 'TEMPLATE',
        templateId: 'tpl-1',
        templateName: 'hello_world',
      }),
    });
    expect(prisma.waTemplate.update).toHaveBeenCalledWith({
      where: { id: 'tpl-1' },
      data: { sentCount: { increment: 1 } },
    });
  });

  it('should reject if contact opted out', async () => {
    prisma.waOptOut.findFirst.mockResolvedValue({
      id: 'opt-1',
      wabaId: 'waba-1',
      phoneNumber: '919876543210',
    });

    await expect(
      service.sendText('waba-1', 'conv-1', 'Hello'),
    ).rejects.toThrow(BadRequestException);

    expect(waApiService.sendText).not.toHaveBeenCalled();
    expect(prisma.waMessage.create).not.toHaveBeenCalled();
  });

  it('should reject if window closed', async () => {
    windowChecker.isWindowOpen.mockReturnValue(false);

    await expect(
      service.sendText('waba-1', 'conv-1', 'Hello'),
    ).rejects.toThrow(BadRequestException);

    expect(waApiService.sendText).not.toHaveBeenCalled();
    expect(prisma.waMessage.create).not.toHaveBeenCalled();
  });

  it('should send location message', async () => {
    const result = await service.sendLocation('waba-1', 'conv-1', 28.6139, 77.209, 'New Delhi', '123 Main St', 'user-1');

    expect(waApiService.sendLocation).toHaveBeenCalledWith(
      'waba-1',
      '919876543210',
      28.6139,
      77.209,
      'New Delhi',
      '123 Main St',
    );
    expect(prisma.waMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        messageType: 'LOCATION',
        latitude: 28.6139,
        longitude: 77.209,
        locationName: 'New Delhi',
        locationAddress: '123 Main St',
      }),
    });
    expect(result).toEqual({ id: 'msg-1' });
  });
});
