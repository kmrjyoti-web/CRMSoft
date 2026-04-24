import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class TestsService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    collectTestResults(partnerId: string, result: {
        testType: string;
        totalTests: number;
        passed: number;
        failed: number;
        warnings?: number;
        triggeredBy?: string;
        startedAt?: Date;
        completedAt?: Date;
        categories?: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        partnerId: string;
        testType: string;
        totalTests: number;
        passed: number;
        failed: number;
        warnings: number;
        passRate: number | null;
        categories: import("@prisma/client/runtime/client").JsonValue | null;
        reportFilePath: string | null;
        triggeredBy: string | null;
        startedAt: Date | null;
        completedAt: Date | null;
    }>;
    triggerPartnerTest(partnerId: string, testType: string): Promise<{
        triggered: boolean;
        logId: string;
        testType: string;
        message: string;
    }>;
    getPartnerTests(partnerId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            partnerId: string;
            testType: string;
            totalTests: number;
            passed: number;
            failed: number;
            warnings: number;
            passRate: number | null;
            categories: import("@prisma/client/runtime/client").JsonValue | null;
            reportFilePath: string | null;
            triggeredBy: string | null;
            startedAt: Date | null;
            completedAt: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getTestDashboard(partnerId?: string): Promise<{
        totalRuns: number;
        avgPassRate: number;
        recentLogs: {
            id: string;
            createdAt: Date;
            partnerId: string;
            testType: string;
            totalTests: number;
            passed: number;
            failed: number;
            warnings: number;
            passRate: number | null;
            categories: import("@prisma/client/runtime/client").JsonValue | null;
            reportFilePath: string | null;
            triggeredBy: string | null;
            startedAt: Date | null;
            completedAt: Date | null;
        }[];
    }>;
}
