import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class PlatformBootstrapService implements OnModuleInit {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService);
    onModuleInit(): Promise<void>;
    private runBackgroundTasks;
    private ensureSuperAdmin;
    private ensureDemoVendor;
    private ensureMissingPermissions;
    private ensureTenantMenus;
    private deduplicateMenus;
    private countExpectedMenus;
    private ensureBusinessTypes;
    private repairMenusForTenant;
}
