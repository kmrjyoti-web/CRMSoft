import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class TicketContextService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    captureContext(userId: string, tenantId: string, userAgent?: string, referer?: string): Promise<{
        browserInfo: string | undefined;
        currentPageUrl: string | undefined;
        appVersion: string;
        tenantPlan: string | undefined;
        industryCode: string | undefined;
        recentErrors: {
            id: string;
            createdAt: Date;
            severity: import("@prisma/platform-client").$Enums.ErrorSeverity;
            errorCode: string;
            message: string;
            path: string;
        }[];
        lastActions: string[];
        capturedAt: string;
    }>;
}
