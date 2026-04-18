import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
export declare class HealthMonitorService {
    private readonly db;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService);
    getAllHealth(): Promise<({
        id: string;
        status: string;
        responseTimeMs: number | null;
        service: string;
        metrics: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
        checkedAt: Date;
    } | {
        service: string;
        status: string;
        responseTimeMs: null;
        metrics: null;
        checkedAt: null;
    })[]>;
    getServiceHealth(service: string): Promise<{
        id: string;
        status: string;
        responseTimeMs: number | null;
        service: string;
        metrics: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
        checkedAt: Date;
    }[]>;
    triggerHealthCheck(): Promise<{
        checked: number;
        timestamp: Date;
    }>;
}
