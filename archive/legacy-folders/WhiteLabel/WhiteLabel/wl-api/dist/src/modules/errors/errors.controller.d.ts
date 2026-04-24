import { ErrorsService } from './errors.service';
import { ErrorSeverity } from '@prisma/client';
declare class CollectErrorsDto {
    errors: any[];
}
declare class ResolveDto {
    resolution: string;
}
export declare class ErrorsController {
    private errorsService;
    constructor(errorsService: ErrorsService);
    collect(partnerId: string, dto: CollectErrorsDto): Promise<{
        collected: number;
        critical: number;
    }>;
    dashboard(partnerId?: string): Promise<{
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
    getPartnerErrors(partnerId: string, severity?: ErrorSeverity, page?: string, limit?: string): Promise<{
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
    resolve(errorId: string, dto: ResolveDto): Promise<{
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
export {};
