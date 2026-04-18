import { HealthMonitorService } from './health-monitor.service';
export declare class HealthMonitorController {
    private readonly healthMonitorService;
    constructor(healthMonitorService: HealthMonitorService);
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
