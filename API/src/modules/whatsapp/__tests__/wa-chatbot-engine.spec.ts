import { Test, TestingModule } from '@nestjs/testing';
import { WaChatbotEngineService } from '../services/wa-chatbot-engine.service';
import { WaApiService } from '../services/wa-api.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('WaChatbotEngineService', () => {
  let service: WaChatbotEngineService;
  let prisma: any;
  let waApiService: any;

  const mockConversation = {
    id: 'conv-1',
    wabaId: 'waba-1',
    contactPhone: '+1111111111',
    contactName: 'Alice',
    assignedToId: null,
    status: 'OPEN',
  };

  const mockFlow = {
    id: 'flow-1',
    wabaId: 'waba-1',
    name: 'Welcome Flow',
    status: 'ACTIVE',
    isDefault: false,
    triggerKeywords: ['hello', 'hi'],
    nodes: [
      { type: 'TEXT_REPLY', text: 'Welcome! How can I help?' },
    ],
    triggeredCount: 0,
    completedCount: 0,
  };

  const mockDefaultFlow = {
    id: 'flow-default',
    wabaId: 'waba-1',
    name: 'Default Flow',
    status: 'ACTIVE',
    isDefault: true,
    triggerKeywords: [],
    nodes: [
      { type: 'TEXT_REPLY', text: 'Sorry, I did not understand. Let me connect you to an agent.' },
    ],
    triggeredCount: 0,
    completedCount: 0,
  };

  beforeEach(async () => {
    prisma = {
      waConversation: {
        findUniqueOrThrow: jest.fn().mockResolvedValue(mockConversation),
        update: jest.fn().mockResolvedValue({}),
      },
      waChatbotFlow: {
        findMany: jest.fn().mockResolvedValue([mockFlow]),
        update: jest.fn().mockResolvedValue({}),
      },
      waMessage: {
        create: jest.fn().mockResolvedValue({ id: 'msg-bot-1' }),
      },
    };

    waApiService = {
      sendText: jest.fn().mockResolvedValue({}),
      sendInteractive: jest.fn().mockResolvedValue({}),
      sendMedia: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaChatbotEngineService,
        { provide: PrismaService, useValue: prisma },
        { provide: WaApiService, useValue: waApiService },
      ],
    }).compile();

    service = module.get<WaChatbotEngineService>(WaChatbotEngineService);
  });

  it('should trigger flow on keyword match', async () => {
    const message = { textBody: 'hello there' };

    await service.checkAndTrigger('waba-1', 'conv-1', message);

    // triggeredCount should be incremented
    expect(prisma.waChatbotFlow.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'flow-1' },
        data: { triggeredCount: { increment: 1 } },
      }),
    );

    // The flow node should trigger a text message send
    expect(waApiService.sendText).toHaveBeenCalledWith(
      'waba-1',
      '+1111111111',
      'Welcome! How can I help?',
    );
  });

  it('should trigger default flow when no keyword match', async () => {
    // Return both keyword flow and default flow
    prisma.waChatbotFlow.findMany.mockResolvedValue([mockFlow, mockDefaultFlow]);

    const message = { textBody: 'random question' };

    await service.checkAndTrigger('waba-1', 'conv-1', message);

    // Default flow should be triggered (no keyword matches 'random question')
    expect(prisma.waChatbotFlow.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'flow-default' },
        data: { triggeredCount: { increment: 1 } },
      }),
    );

    expect(waApiService.sendText).toHaveBeenCalledWith(
      'waba-1',
      '+1111111111',
      'Sorry, I did not understand. Let me connect you to an agent.',
    );
  });

  it('should skip if conversation is assigned to agent', async () => {
    prisma.waConversation.findUniqueOrThrow.mockResolvedValue({
      ...mockConversation,
      assignedToId: 'agent-1',
    });

    const message = { textBody: 'hello' };

    await service.checkAndTrigger('waba-1', 'conv-1', message);

    // No flows should be fetched or triggered
    expect(prisma.waChatbotFlow.findMany).not.toHaveBeenCalled();
    expect(prisma.waChatbotFlow.update).not.toHaveBeenCalled();
    expect(waApiService.sendText).not.toHaveBeenCalled();
  });

  it('should handle empty flow nodes', async () => {
    const emptyNodeFlow = {
      ...mockFlow,
      id: 'flow-empty',
      nodes: [],
    };
    prisma.waChatbotFlow.findMany.mockResolvedValue([emptyNodeFlow]);

    const message = { textBody: 'hello' };

    // Should not throw
    await expect(
      service.checkAndTrigger('waba-1', 'conv-1', message),
    ).resolves.not.toThrow();

    // triggeredCount should still be incremented
    expect(prisma.waChatbotFlow.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'flow-empty' },
        data: { triggeredCount: { increment: 1 } },
      }),
    );

    // No text/media sent since nodes are empty
    expect(waApiService.sendText).not.toHaveBeenCalled();
  });
});
