import { ApiResponse } from '../../../../../common/utils/api-response';
import { SystemHealthService } from '../services/system-health.service';
export declare class SystemHealthController {
    private readonly systemHealthService;
    constructor(systemHealthService: SystemHealthService);
    getHealth(): Promise<ApiResponse<{
        api: {
            status: string;
            uptime: number;
            responseTimeMs: number;
            requestsPerMin: number;
        };
        database: {
            status: string;
            connectionPool: number;
            queryTimeMs: number;
        };
        redis: {
            status: "DOWN";
            memoryUsedMb: number;
            connectedClients: number;
        };
        queue: {
            status: "DOWN";
            pending: number;
            active: number;
            failed: number;
            completed: number;
        };
    }>>;
    getMetric(metric: string): Promise<ApiResponse<never[]>>;
}
