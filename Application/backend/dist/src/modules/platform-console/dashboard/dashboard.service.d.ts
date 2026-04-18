import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
export declare class DashboardService {
    private readonly db;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService);
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
    getErrorsSummary(): Promise<{
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
    getTestsSummary(): Promise<{
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
