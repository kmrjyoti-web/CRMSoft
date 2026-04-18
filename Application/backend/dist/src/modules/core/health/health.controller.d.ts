import { PrismaService } from '../../../core/prisma/prisma.service';
export declare class HealthController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    health(): Promise<{
        status: string;
        uptime: number;
        version: string;
        timestamp: string;
        environment: string;
    }>;
    deepHealth(): Promise<{
        status: "healthy" | "degraded" | "unhealthy";
        timestamp: string;
        version: string;
        checks: Record<string, any>;
    }>;
}
