import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ErrorSeverity } from '@prisma/client';
export declare class ErrorsService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    collectErrors(partnerId: string, errors: Array<{
        errorCode?: string;
        severity: ErrorSeverity;
        message: string;
        module?: string;
        component?: string;
        endpoint?: string;
        stackTrace?: string;
    }>): Promise<{
        collected: number;
        critical: number;
    }>;
    getPartnerErrors(partnerId: string, params: {
        severity?: ErrorSeverity;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            id: string;
            createdAt: Date;
            partnerId: string;
            errorCode: string | null;
            severity: import("@prisma/client").$Enums.ErrorSeverity;
            message: string;
            stackTrace: string | null;
            module: string | null;
            component: string | null;
            endpoint: string | null;
            requestContext: import("@prisma/client/runtime/client").JsonValue | null;
            isReportedToMaster: boolean;
            resolvedAt: Date | null;
            resolvedBy: string | null;
            resolution: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getErrorDashboard(partnerId?: string): Promise<{
        bySeverity: {
            severity: import("@prisma/client").$Enums.ErrorSeverity;
            count: number;
        }[];
        unresolved: number;
        critical: number;
        recentErrors: {
            id: string;
            createdAt: Date;
            partnerId: string;
            errorCode: string | null;
            severity: import("@prisma/client").$Enums.ErrorSeverity;
            message: string;
            stackTrace: string | null;
            module: string | null;
            component: string | null;
            endpoint: string | null;
            requestContext: import("@prisma/client/runtime/client").JsonValue | null;
            isReportedToMaster: boolean;
            resolvedAt: Date | null;
            resolvedBy: string | null;
            resolution: string | null;
        }[];
    }>;
    resolveError(errorId: string, resolution: string): Promise<{
        id: string;
        createdAt: Date;
        partnerId: string;
        errorCode: string | null;
        severity: import("@prisma/client").$Enums.ErrorSeverity;
        message: string;
        stackTrace: string | null;
        module: string | null;
        component: string | null;
        endpoint: string | null;
        requestContext: import("@prisma/client/runtime/client").JsonValue | null;
        isReportedToMaster: boolean;
        resolvedAt: Date | null;
        resolvedBy: string | null;
        resolution: string | null;
    }>;
}
