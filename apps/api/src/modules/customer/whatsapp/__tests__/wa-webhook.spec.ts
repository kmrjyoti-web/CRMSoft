import { Test, TestingModule } from '@nestjs/testing';
import { WaWebhookService } from '../services/wa-webhook.service';
import { WaConversationService } from '../services/wa-conversation.service';
import { WaWindowCheckerService } from '../services/wa-window-checker.service';
import { WaEntityLinkerService } from '../services/wa-entity-linker.service';
import { WaChatbotEngineService } from '../services/wa-chatbot-engine.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

describe('WaWebhookService', () => {
  let service: WaWebhookService;
  let prisma: any;
  let conversationService: any;
  let windowChecker: any;
  let entityLinker: any;
  let chatbotEngine: any;

  const mockWaba = {
    id: 'waba-1',
    phoneNumberId: 'phone-num-1',
    accessToken: 'token',
    apiVersion: 'v17.0',
  };

  const mockConversation = {
    id: 'conv-1',
    wabaId: 'waba-1',
    contactPhone: '919876543210',
    linkedEntityType: null,
    linkedEntityId: null,
  };

  beforeEach(async () => {
    prisma = {
      whatsAppBusinessAccount: {
        findFirst: jest.fn().mockResolvedValue(mockWaba),
        update: jest.fn().mockResolvedValue(mockWaba),
      },
      waMessage: {
        create: jest.fn().mockResolvedValue({ id: 'msg-1' }),
        findFirst: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      waTemplate: {
        update: jest.fn().mockResolvedValue({}),
      },
      waBroadcastRecipient: {
        update: jest.fn().mockResolvedValue({}),
      },
      waBroadcast: {
        update: jest.fn().mockResolvedValue({}),
      },
    };
(prisma as any).working = prisma;

    conversationService = {
      getOrCreate: jest.fn().mockResolvedValue(mockConversation),
      updateLastMessage: jest.fn().mockResolvedValue({}),
    };

    windowChecker = {
      refreshWindow: jest.fn().mockResolvedValue(new Date()),
    };

    entityLinker = {
      autoLinkByPhone: jest.fn().mockResolvedValue({}),
    };

    chatbotEngine = {
      checkAndTrigger: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaWebhookService,
        { provide: PrismaService, useValue: prisma },
        { provide: WaConversationService, useValue: conversationService },
        { provide: WaWindowCheckerService, useValue: windowChecker },
        { provide: WaEntityLinkerService, useValue: entityLinker },
        { provide: WaChatbotEngineService, useValue: chatbotEngine },
      ],
    }).compile();

    service = module.get<WaWebhookService>(WaWebhookService);
  });

  it('should verify webhook with correct token', () => {
    const result = service.verifyWebhook('subscribe', 'my-token', 'challenge-123', 'my-token');

    expect(result).toBe('challenge-123');
  });

  it('should reject webhook with wrong token', () => {
    const result = service.verifyWebhook('subscribe', 'wrong-token', 'challenge-123', 'my-token');

    expect(result).toBeNull();
  });

  it('should process inbound text message', async () => {
    const body = {
      entry: [
        {
          changes: [
            {
              field: 'messages',
              value: {
                metadata: { phone_number_id: 'phone-num-1' },
                contacts: [{ profile: { name: 'John Doe' } }],
                messages: [
                  {
                    id: 'wamid.msg-1',
                    from: '919876543210',
                    type: 'text',
                    text: { body: 'Hello from customer' },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    await service.processWebhook(body);

    expect(conversationService.getOrCreate).toHaveBeenCalledWith(
      'waba-1',
      '919876543210',
      'John Doe',
      'John Doe',
    );
    expect(prisma.waMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        wabaId: 'waba-1',
        conversationId: 'conv-1',
        waMessageId: 'wamid.msg-1',
        direction: 'INBOUND',
        messageType: 'TEXT',
        textBody: 'Hello from customer',
      }),
    });
    expect(conversationService.updateLastMessage).toHaveBeenCalledWith(
      'conv-1',
      'Hello from customer',
      'INBOUND',
    );
  });

  it('should process status update - delivered', async () => {
    const existingMessage = {
      id: 'msg-db-1',
      waMessageId: 'wamid.status-1',
      templateId: null,
      broadcastRecipientId: null,
      broadcastId: null,
    };
    prisma.waMessage.findFirst.mockResolvedValue(existingMessage);

    const body = {
      entry: [
        {
          changes: [
            {
              field: 'messages',
              value: {
                metadata: { phone_number_id: 'phone-num-1' },
                statuses: [
                  {
                    id: 'wamid.status-1',
                    status: 'delivered',
                    timestamp: '1700000000',
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    await service.processWebhook(body);

    expect(prisma.waMessage.findFirst).toHaveBeenCalledWith({
      where: { waMessageId: 'wamid.status-1' },
    });
    expect(prisma.waMessage.update).toHaveBeenCalledWith({
      where: { id: 'msg-db-1' },
      data: expect.objectContaining({
        status: 'DELIVERED',
      }),
    });
  });

  it('should handle missing WABA gracefully', async () => {
    prisma.whatsAppBusinessAccount.findFirst.mockResolvedValue(null);

    const body = {
      entry: [
        {
          changes: [
            {
              field: 'messages',
              value: {
                metadata: { phone_number_id: 'unknown-phone-id' },
                messages: [
                  {
                    id: 'wamid.orphan-1',
                    from: '919999999999',
                    type: 'text',
                    text: { body: 'Hello' },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    await expect(service.processWebhook(body)).resolves.not.toThrow();

    expect(conversationService.getOrCreate).not.toHaveBeenCalled();
    expect(prisma.waMessage.create).not.toHaveBeenCalled();
  });

  it('should auto-link on new conversation when no linkedEntityType', async () => {
    const body = {
      entry: [
        {
          changes: [
            {
              field: 'messages',
              value: {
                metadata: { phone_number_id: 'phone-num-1' },
                contacts: [{ profile: { name: 'Jane' } }],
                messages: [
                  {
                    id: 'wamid.auto-link-1',
                    from: '919876543210',
                    type: 'text',
                    text: { body: 'Hi' },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    // Conversation has no linkedEntityType
    conversationService.getOrCreate.mockResolvedValue({
      ...mockConversation,
      linkedEntityType: null,
    });

    await service.processWebhook(body);

    expect(entityLinker.autoLinkByPhone).toHaveBeenCalledWith('conv-1', '919876543210');
  });
});
