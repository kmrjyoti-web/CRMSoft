import { PrismaService } from '../../../core/prisma/prisma.service';
export declare class PluginMenuService {
    private readonly prisma;
    private readonly logger;
    enableMenusForPlugin(tenantId: string, pluginCode: string): Promise<{
        enabled: string[];
    }>;
    disableMenusForPlugin(tenantId: string, pluginCode: string): Promise<{
        disabled: string[];
    }>;
    private getPluginMenuCodes;
    constructor(prisma: PrismaService);
}
