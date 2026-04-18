import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class PageScannerService {
    private readonly prisma;
    private readonly logger;
    private readonly crmAdminBase;
    private readonly vendorPanelBase;
    constructor(prisma: PrismaService);
    scanAndRegister(): Promise<{
        total: number;
        created: number;
        updated: number;
    }>;
    private scanDirectory;
    private findPageFiles;
    private filePathToRoute;
    private extractParams;
    private inferPageType;
    private inferFriendlyName;
    private extractComponentName;
}
