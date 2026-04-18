import { ApiLoggerService } from '../services/api-logger.service';
import { ApiLogQueryDto } from './dto/api-log.dto';
export declare class ApiLogAdminController {
    private readonly apiLogger;
    constructor(apiLogger: ApiLoggerService);
    listLogs(req: any, query: ApiLogQueryDto): Promise<{
        data: {
            id: string;
            tenantId: string;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            level: import("@prisma/working-client").$Enums.ApiLogLevel;
            requestId: string;
            errorCode: string | null;
            statusCode: number;
            path: string;
            method: string;
            ip: string;
            userAgent: string | null;
            requestBody: import("@prisma/working-client/runtime/library").JsonValue | null;
            queryParams: import("@prisma/working-client/runtime/library").JsonValue | null;
            requestHeaders: import("@prisma/working-client/runtime/library").JsonValue | null;
            responseBody: import("@prisma/working-client/runtime/library").JsonValue | null;
            responseTimeMs: number;
            errorMessage: string | null;
            apiKeyId: string;
            apiKeyName: string;
            rateLimitRemaining: number | null;
            rateLimitUsed: number | null;
            wasRateLimited: boolean;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
