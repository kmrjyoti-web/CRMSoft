import { RawBodyRequest } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PluginHookService } from '../services/plugin-hook.service';
import { PluginService } from '../services/plugin.service';
import { EncryptionService } from '../../softwarevendor/tenant-config/services/encryption.service';
export declare class PluginWebhookController {
    private readonly prisma;
    private readonly hookService;
    private readonly pluginService;
    private readonly encryption;
    private readonly logger;
    constructor(prisma: PrismaService, hookService: PluginHookService, pluginService: PluginService, encryption: EncryptionService);
    verifyWebhook(pluginCode: string, tenantId: string, mode: string, verifyToken: string, challenge: string, res: Response): Promise<Response<any, Record<string, any>>>;
    handleWebhook(pluginCode: string, tenantId: string, req: RawBodyRequest<Request>): Promise<{
        received: boolean;
        event: string;
    }>;
    private verifySignature;
    private extractEventType;
}
