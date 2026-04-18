import { PrismaService } from "../../../../../core/prisma/prisma.service";
import type { TestErrorCategory, TestSeverity } from '@prisma/platform-client';
export interface ErrorCategorization {
    category: TestErrorCategory;
    severity: TestSeverity;
    isReportable: boolean;
}
export interface ErrorDashboardData {
    period: {
        days: number;
        from: Date;
        to: Date;
    };
    total: number;
    unresolved: number;
    critical: number;
    resolutionRate: number;
    meanTimeToResolutionMs: number | null;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    trend: Array<{
        date: string;
        count: number;
    }>;
    top10: Array<{
        message: string;
        count: number;
        category: string;
    }>;
}
export declare class TestErrorAnalyzerService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    categorizeError(errorMessage: string, context?: {
        filePath?: string;
        suiteName?: string;
    }): ErrorCategorization;
    persistRunErrors(testRunId: string): Promise<number>;
    reportToVendor(errorId: string, context?: string): Promise<void>;
    markResolved(errorId: string, resolvedBy: string, resolution: string): Promise<void>;
    getErrorDashboard(tenantId: string | null, days?: number): Promise<ErrorDashboardData>;
    generateReport(testRunId: string): Promise<string>;
}
