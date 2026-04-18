import { ApiResponse } from '../../../../common/utils/api-response';
import { TestErrorAnalyzerService } from '../infrastructure/services/test-error-analyzer.service';
import { PrismaService } from "../../../../core/prisma/prisma.service";
export declare class TestReportController {
    private readonly errorAnalyzer;
    private readonly prisma;
    constructor(errorAnalyzer: TestErrorAnalyzerService, prisma: PrismaService);
    listReports(page?: number, limit?: number): Promise<ApiResponse<{
        data: ({
            testRun: {
                id: string;
                createdAt: Date;
                status: import("@prisma/platform-client").$Enums.TestRunStatus;
                passed: number;
                failed: number;
                totalTests: number;
            };
        } & {
            id: string;
            createdAt: Date;
            summary: import("@prisma/platform-client/runtime/library").JsonValue;
            testRunId: string;
            categoryResults: import("@prisma/platform-client/runtime/library").JsonValue;
            moduleResults: import("@prisma/platform-client/runtime/library").JsonValue;
            errorSummary: import("@prisma/platform-client/runtime/library").JsonValue;
            recommendations: import("@prisma/platform-client/runtime/library").JsonValue | null;
            reportFilePath: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
        };
    }>>;
    getReport(id: string): Promise<ApiResponse<({
        testRun: {
            id: string;
            tenantId: string;
            createdById: string;
            createdAt: Date;
            status: import("@prisma/platform-client").$Enums.TestRunStatus;
            duration: number;
            completedAt: Date | null;
            startedAt: Date | null;
            passed: number;
            errors: number;
            summary: import("@prisma/platform-client/runtime/library").JsonValue;
            skipped: number;
            failed: number;
            progressPercent: number;
            testEnvId: string | null;
            testTypes: string[];
            targetModules: string[];
            runType: string;
            currentPhase: string | null;
            totalTests: number;
            coveragePercent: number | null;
            coverageReport: import("@prisma/platform-client/runtime/library").JsonValue | null;
        };
    } & {
        id: string;
        createdAt: Date;
        summary: import("@prisma/platform-client/runtime/library").JsonValue;
        testRunId: string;
        categoryResults: import("@prisma/platform-client/runtime/library").JsonValue;
        moduleResults: import("@prisma/platform-client/runtime/library").JsonValue;
        errorSummary: import("@prisma/platform-client/runtime/library").JsonValue;
        recommendations: import("@prisma/platform-client/runtime/library").JsonValue | null;
        reportFilePath: string | null;
    }) | null>>;
    generateReport(testRunId: string): Promise<ApiResponse<{
        reportId: string;
    }>>;
}
