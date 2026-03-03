import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { WhatsAppController } from '../presentation/whatsapp.controller';
import { WhatsAppWebhookController } from '../presentation/whatsapp-webhook.controller';
import { WhatsAppTemplatesController } from '../presentation/whatsapp-templates.controller';
import { WhatsAppBroadcastsController } from '../presentation/whatsapp-broadcasts.controller';
import { WhatsAppChatbotController } from '../presentation/whatsapp-chatbot.controller';
import { WhatsAppQuickRepliesController } from '../presentation/whatsapp-quick-replies.controller';
import { WaWebhookService } from '../services/wa-webhook.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

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
});
