import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { EscalationService } from './escalation.service';
export declare class DeveloperErrorController {
    private readonly db;
    private readonly escalationService;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService, escalationService: EscalationService);
    getEscalated(page?: string, limit?: string): Promise<{
        items: {
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
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getAutoReports(page?: string, limit?: string, acknowledged?: string): Promise<{
        items: {
            id: string;
            severity: string;
            errorCode: string;
            ruleCode: string;
            condition: string;
            notifiedAt: Date;
            acknowledged: boolean;
            occurrences: number;
            notifyChannel: string;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getByBrand(): Promise<(import(".prisma/platform-console-client").Prisma.PickEnumerable<import(".prisma/platform-console-client").Prisma.CustomerErrorReportGroupByOutputType, "brandId"[]> & {
        _count: {
            id: number;
        };
    })[]>;
    getByVertical(): Promise<(import(".prisma/platform-console-client").Prisma.PickEnumerable<import(".prisma/platform-console-client").Prisma.GlobalErrorLogGroupByOutputType, "verticalType"[]> & {
        _count: {
            id: number;
        };
    })[]>;
    resolveError(id: string, body: {
        resolution: string;
        resolvedBy: string;
    }): Promise<{
        success: boolean;
    }>;
    addDeveloperNotes(id: string, notes: string): Promise<{
        id: string;
        level: number;
        resolvedAt: Date | null;
        escalatedAt: Date;
        errorLogId: string;
        customerNotes: string | null;
        brandNotes: string | null;
        developerNotes: string | null;
        autoEscalated: boolean;
    }>;
    assignError(id: string, body: {
        gitIssue?: string;
        assignedTo?: string;
    }): Promise<{
        id: string;
        tenantId: string | null;
        createdAt: Date;
        module: string | null;
        userId: string | null;
        brandId: string | null;
        severity: string;
        errorCode: string;
        message: string;
        userAgent: string | null;
        resolvedAt: Date | null;
        resolution: string | null;
        httpStatus: number | null;
        component: string | null;
        ipAddress: string | null;
        endpoint: string | null;
        resolvedBy: string | null;
        stackTrace: string | null;
        verticalType: string | null;
        requestContext: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
    }>;
}
