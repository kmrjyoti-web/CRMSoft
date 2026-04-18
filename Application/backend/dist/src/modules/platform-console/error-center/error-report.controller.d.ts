import { EscalationService } from './escalation.service';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
export declare class ErrorReportController {
    private readonly escalationService;
    private readonly db;
    private readonly logger;
    constructor(escalationService: EscalationService, db: PlatformConsolePrismaService);
    submitReport(body: {
        brandId: string;
        tenantId?: string;
        reportedBy: string;
        title: string;
        description: string;
        errorCode?: string;
        screenshots?: string[];
        browserInfo?: Record<string, unknown>;
        lastActions?: string[];
    }, userAgent?: string): Promise<{
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
    getMyReports(reportedBy: string, brandId: string, page?: string, limit?: string, status?: string): Promise<{
        items: {
            id: string;
            createdAt: Date;
            status: string;
            title: string;
            errorCode: string | null;
            resolvedAt: Date | null;
            escalatedAt: Date | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getReport(id: string): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        status: string;
        title: string;
        errorCode: string | null;
        resolvedAt: Date | null;
        screenshots: import(".prisma/platform-console-client/runtime/library").JsonValue;
        escalatedAt: Date | null;
    }>;
}
