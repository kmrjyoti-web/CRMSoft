import { TestsService } from './tests.service';
declare class TriggerTestDto {
    testType: string;
}
export declare class TestsController {
    private testsService;
    constructor(testsService: TestsService);
    collect(partnerId: string, dto: any): Promise<{
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
    trigger(partnerId: string, dto: TriggerTestDto): Promise<{
        triggered: boolean;
        logId: string;
        testType: string;
        message: string;
    }>;
    dashboard(partnerId?: string): Promise<{
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
    getPartnerTests(partnerId: string, page?: string, limit?: string): Promise<{
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
}
export {};
