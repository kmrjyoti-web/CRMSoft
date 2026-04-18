import { PrismaService } from '../../../../core/prisma/prisma.service';
import { WaApiService } from './wa-api.service';
export declare class WaChatbotEngineService {
    private readonly prisma;
    private readonly waApiService;
    private readonly logger;
    constructor(prisma: PrismaService, waApiService: WaApiService);
    checkAndTrigger(wabaId: string, conversationId: string, message: any): Promise<void>;
    executeFlow(wabaId: string, conversationId: string, flow: any, triggerMessage: any): Promise<void>;
    private processNode;
    private sendChatbotMessage;
    private recordChatbotMessage;
}
