import { ApiResponse } from '../../../../common/utils/api-response';
import { TestErrorAnalyzerService } from '../infrastructure/services/test-error-analyzer.service';
import { PrismaService } from "../../../../core/prisma/prisma.service";
export declare class TestErrorController {
    private readonly errorAnalyzer;
    private readonly prisma;
    constructor(errorAnalyzer: TestErrorAnalyzerService, prisma: PrismaService);
    getDashboard(user: any, days: number): Promise<ApiResponse<import("../infrastructure/services/test-error-analyzer.service").ErrorDashboardData>>;
    listErrors(testRunId?: string, category?: string, severity?: string, isResolved?: string, page?: number, limit?: number): Promise<ApiResponse<{
        data: {
            id: string;
            createdAt: Date;
            moduleName: string | null;
            filePath: string | null;
            componentName: string | null;
            severity: import("@prisma/platform-client").$Enums.TestSeverity;
            errorCode: string | null;
            message: string;
            details: string | null;
            resolvedAt: Date | null;
            resolution: string | null;
            isResolved: boolean;
            resolvedBy: string | null;
            vendorResponse: string | null;
            testRunId: string;
            isReportable: boolean;
            testResultId: string | null;
            errorCategory: import("@prisma/platform-client").$Enums.TestErrorCategory;
            stackTrace: string | null;
            reportedToVendor: boolean;
            reportedAt: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>>;
    getError(id: string): Promise<ApiResponse<({
        testRun: {
            id: string;
            createdAt: Date;
            status: import("@prisma/platform-client").$Enums.TestRunStatus;
        };
    } & {
        id: string;
        createdAt: Date;
        moduleName: string | null;
        filePath: string | null;
        componentName: string | null;
        severity: import("@prisma/platform-client").$Enums.TestSeverity;
        errorCode: string | null;
        message: string;
        details: string | null;
        resolvedAt: Date | null;
        resolution: string | null;
        isResolved: boolean;
        resolvedBy: string | null;
        vendorResponse: string | null;
        testRunId: string;
        isReportable: boolean;
        testResultId: string | null;
        errorCategory: import("@prisma/platform-client").$Enums.TestErrorCategory;
        stackTrace: string | null;
        reportedToVendor: boolean;
        reportedAt: Date | null;
    }) | null>>;
    reportToVendor(id: string, context?: string): Promise<ApiResponse<{
        reported: boolean;
    }>>;
    resolveError(id: string, user: any, resolution: string): Promise<ApiResponse<{
        resolved: boolean;
    }>>;
    generateFromRun(testRunId: string): Promise<ApiResponse<{
        generated: number;
    }>>;
}
