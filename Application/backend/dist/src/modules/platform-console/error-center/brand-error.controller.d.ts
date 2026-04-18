import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { EscalationService } from './escalation.service';
export declare class BrandErrorController {
    private readonly db;
    private readonly escalationService;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService, escalationService: EscalationService);
    getBrandErrors(brandId: string, page?: string, limit?: string, status?: string): Promise<{
        items: {
            id: string;
            createdAt: Date;
            status: string;
            title: string;
            errorCode: string | null;
            resolvedAt: Date | null;
            escalatedAt: Date | null;
            reportedBy: string;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getBrandStats(brandId: string): Promise<{
        total: number;
        byStatus: (import(".prisma/platform-console-client").Prisma.PickEnumerable<import(".prisma/platform-console-client").Prisma.CustomerErrorReportGroupByOutputType, "status"[]> & {
            _count: {
                id: number;
            };
        })[];
        recent: {
            id: string;
            createdAt: Date;
            status: string;
            title: string;
        }[];
    }>;
    getBrandError(brandId: string, id: string): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        status: string;
        title: string;
        errorCode: string | null;
        resolvedAt: Date | null;
        screenshots: import(".prisma/platform-console-client/runtime/library").JsonValue;
        escalatedAt: Date | null;
        browserInfo: import(".prisma/platform-console-client/runtime/library").JsonValue;
        lastActions: import(".prisma/platform-console-client/runtime/library").JsonValue;
        reportedBy: string;
    }>;
    acknowledgeError(brandId: string, id: string): Promise<{
        id: string;
        tenantId: string | null;
        description: string;
        createdAt: Date;
        status: string;
        brandId: string;
        title: string;
        errorCode: string | null;
        resolvedAt: Date | null;
        screenshots: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
        escalatedAt: Date | null;
        browserInfo: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
        lastActions: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
        reportedBy: string;
    }>;
    escalateToDeveloper(brandId: string, id: string, brandNotes: string): Promise<{
        success: boolean;
    }>;
    resolveError(brandId: string, id: string, body: {
        resolution: string;
        resolvedBy: string;
    }): Promise<{
        success: boolean;
    }>;
}
