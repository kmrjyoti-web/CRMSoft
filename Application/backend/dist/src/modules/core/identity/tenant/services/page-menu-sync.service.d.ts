import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class PageMenuSyncService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    syncModulePages(moduleCode: string): Promise<{
        synced: number;
        tenants: number;
    }>;
}
