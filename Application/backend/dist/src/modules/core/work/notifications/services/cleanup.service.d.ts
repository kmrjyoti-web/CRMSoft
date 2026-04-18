import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class CleanupService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    cleanupOldNotifications(): Promise<void>;
    cleanupInactivePushSubscriptions(): Promise<void>;
}
