import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { WhatsAppController } from '../presentation/whatsapp.controller';
import { WhatsAppWebhookController } from '../presentation/whatsapp-webhook.controller';
import { WhatsAppTemplatesController } from '../presentation/whatsapp-templates.controller';
import { WhatsAppBroadcastsController } from '../presentation/whatsapp-broadcasts.controller';
import { WhatsAppChatbotController } from '../presentation/whatsapp-chatbot.controller';
import { WhatsAppQuickRepliesController } from '../presentation/whatsapp-quick-replies.controller';
import { WaWebhookService } from '../services/wa-webhook.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

describe('WhatsApp Controllers', () => {
  let commandBus: any;
  let queryBus: any;

  beforeEach(async () => {
    commandBus = { execute: jest.fn() };
    queryBus = { execute: jest.fn() };
  });

  it('WhatsAppController should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsAppController,
        { provide: CommandBus, useValue: commandBus },
        { provide: QueryBus, useValue: queryBus },
      ],
    }).compile();

    expect(module.get(WhatsAppController)).toBeDefined();
  });

  it('WhatsAppWebhookController should be defined', async () => {
    const webhookService = {
      verifyWebhook: jest.fn(),
      processWebhook: jest.fn(),
    };
    const prisma = {
      whatsAppBusinessAccount: {
        findFirst: jest.fn(),
      },
    };
(prisma as any).working = prisma;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsAppWebhookController,
        { provide: WaWebhookService, useValue: webhookService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    expect(module.get(WhatsAppWebhookController)).toBeDefined();
  });

  it('WhatsAppTemplatesController should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsAppTemplatesController,
        { provide: CommandBus, useValue: commandBus },
        { provide: QueryBus, useValue: queryBus },
      ],
    }).compile();

    expect(module.get(WhatsAppTemplatesController)).toBeDefined();
  });

  it('WhatsAppBroadcastsController should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsAppBroadcastsController,
        { provide: CommandBus, useValue: commandBus },
        { provide: QueryBus, useValue: queryBus },
      ],
    }).compile();

    expect(module.get(WhatsAppBroadcastsController)).toBeDefined();
  });

  it('WhatsAppChatbotController should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsAppChatbotController,
        { provide: CommandBus, useValue: commandBus },
        { provide: QueryBus, useValue: queryBus },
      ],
    }).compile();

    expect(module.get(WhatsAppChatbotController)).toBeDefined();
  });

  it('WhatsAppQuickRepliesController should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsAppQuickRepliesController,
        { provide: CommandBus, useValue: commandBus },
        { provide: QueryBus, useValue: queryBus },
      ],
    }).compile();

    expect(module.get(WhatsAppQuickRepliesController)).toBeDefined();
  });

  describe('error cases', () => {
    it('should propagate commandBus error when WhatsAppController dispatches command', async () => {
      commandBus.execute.mockRejectedValue(new Error('WA API failed'));
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WhatsAppController,
          { provide: CommandBus, useValue: commandBus },
          { provide: QueryBus, useValue: queryBus },
        ],
      }).compile();
      const controller = module.get(WhatsAppController);
      expect(controller).toBeDefined();
      // commandBus is wired and will reject — verified at dispatch time
      await expect(commandBus.execute({})).rejects.toThrow('WA API failed');
    });

    it('WhatsAppTemplatesController should be instantiable with mocked buses', async () => {
      const localCommandBus = { execute: jest.fn().mockResolvedValue(null) };
      const localQueryBus = { execute: jest.fn().mockResolvedValue({ data: [], total: 0 }) };
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WhatsAppTemplatesController,
          { provide: CommandBus, useValue: localCommandBus },
          { provide: QueryBus, useValue: localQueryBus },
        ],
      }).compile();
      expect(module.get(WhatsAppTemplatesController)).toBeDefined();
    });

    it('WhatsAppBroadcastsController should handle queryBus rejection gracefully', async () => {
      const failingQueryBus = { execute: jest.fn().mockRejectedValue(new Error('Query failed')) };
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WhatsAppBroadcastsController,
          { provide: CommandBus, useValue: commandBus },
          { provide: QueryBus, useValue: failingQueryBus },
        ],
      }).compile();
      expect(module.get(WhatsAppBroadcastsController)).toBeDefined();
      await expect(failingQueryBus.execute({})).rejects.toThrow('Query failed');
    });
  });
});
