import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
export declare class ErrorCenterService {
    private readonly db;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService);
    listErrors(params: {
        page?: number;
        limit?: number;
        severity?: string;
        brandId?: string;
        verticalType?: string;
        resolved?: boolean;
    }): Promise<{
        items: {
            id: string;
            createdAt: Date;
            module: string | null;
            brandId: string | null;
            severity: string;
            errorCode: string;
            message: string;
            resolvedAt: Date | null;
            httpStatus: number | null;
            endpoint: string | null;
            verticalType: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getError(id: string): Promise<{
        escalation: {
            id: string;
            level: number;
            resolvedAt: Date | null;
            escalatedAt: Date;
            errorLogId: string;
            customerNotes: string | null;
            brandNotes: string | null;
            developerNotes: string | null;
            autoEscalated: boolean;
        } | null;
    } & {
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
    getStats(): Promise<{
        total: number;
        resolvedRate: number;
        bySeverity: (import(".prisma/platform-console-client").Prisma.PickEnumerable<import(".prisma/platform-console-client").Prisma.GlobalErrorLogGroupByOutputType, "severity"[]> & {
            _count: {
                id: number;
            };
        })[];
        byBrand: (import(".prisma/platform-console-client").Prisma.PickEnumerable<import(".prisma/platform-console-client").Prisma.GlobalErrorLogGroupByOutputType, "brandId"[]> & {
            _count: {
                id: number;
            };
        })[];
        byVertical: (import(".prisma/platform-console-client").Prisma.PickEnumerable<import(".prisma/platform-console-client").Prisma.GlobalErrorLogGroupByOutputType, "verticalType"[]> & {
            _count: {
                id: number;
            };
        })[];
    }>;
    getTrends(period?: 'DAILY' | 'WEEKLY' | 'MONTHLY'): Promise<{
        id: string;
        createdAt: Date;
        brandId: string | null;
        period: string;
        totalErrors: number;
        verticalType: string | null;
        periodDate: string;
        criticalCount: number;
        highCount: number;
        resolvedCount: number;
        avgResolutionMs: number | null;
        topErrors: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
    }[]>;
}
