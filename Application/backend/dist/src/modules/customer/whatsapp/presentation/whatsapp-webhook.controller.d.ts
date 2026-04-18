import { WaWebhookService } from '../services/wa-webhook.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class WhatsAppWebhookController {
    private readonly webhookService;
    private readonly prisma;
    constructor(webhookService: WaWebhookService, prisma: PrismaService);
    verifyWebhook(mode: string, token: string, challenge: string): Promise<string>;
    receiveWebhook(body: any): Promise<string>;
}
