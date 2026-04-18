import { PrismaService } from '../../../../core/prisma/prisma.service';
import { WaConversationService } from './wa-conversation.service';
import { WaWindowCheckerService } from './wa-window-checker.service';
import { WaEntityLinkerService } from './wa-entity-linker.service';
import { WaChatbotEngineService } from './wa-chatbot-engine.service';
export declare class WaWebhookService {
    private readonly prisma;
    private readonly conversationService;
    private readonly windowChecker;
    private readonly entityLinker;
    private readonly chatbotEngine;
    private readonly logger;
    constructor(prisma: PrismaService, conversationService: WaConversationService, windowChecker: WaWindowCheckerService, entityLinker: WaEntityLinkerService, chatbotEngine: WaChatbotEngineService);
    verifyWebhook(mode: string, token: string, challenge: string, expectedToken: string): string | null;
    processWebhook(body: any): Promise<void>;
    private handleInboundMessage;
    private handleStatusUpdate;
    private mapMessageType;
}
