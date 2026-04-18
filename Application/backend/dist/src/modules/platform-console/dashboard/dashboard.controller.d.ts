import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getOverview(): Promise<{
        services: {
            total: number;
            healthy: number;
            allHealthy: boolean;
        };
        errors: {
            today: number;
        };
        tests: {
            total: number;
            passed: number;
            failed: number;
            status: string;
        };
        lastDeploy: {
            version: string;
            status: string;
            deployedAt: Date;
            branch: string;
        } | null;
    }>;
    getHealth(): Promise<{
        id: string;
        status: string;
        responseTimeMs: number | null;
        service: string;
        metrics: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
        checkedAt: Date;
    }[]>;
    getErrors(): Promise<{
        recent: {
            id: string;
            createdAt: Date;
            module: string | null;
            severity: string;
            errorCode: string;
            message: string;
            httpStatus: number | null;
            endpoint: string | null;
        }[];
        bySeverity: (import(".prisma/platform-console-client").Prisma.PickEnumerable<import(".prisma/platform-console-client").Prisma.GlobalErrorLogGroupByOutputType, "severity"[]> & {
            _count: {
                id: number;
            };
        })[];
    }>;
    getTests(): Promise<{
        id: string;
        triggerType: string;
        status: string;
        duration: number | null;
        startedAt: Date;
        passed: number;
        failed: number;
        totalTests: number;
        coverage: number | null;
    }[]>;
}
