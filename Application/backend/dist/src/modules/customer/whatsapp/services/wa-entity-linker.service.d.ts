import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class WaEntityLinkerService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    normalizePhone(phone: string): string;
    autoLinkByPhone(conversationId: string, phoneNumber: string): Promise<{
        entityType?: string;
        entityId?: string;
    }>;
    manualLink(conversationId: string, entityType: string, entityId: string): Promise<void>;
    unlink(conversationId: string): Promise<void>;
}
