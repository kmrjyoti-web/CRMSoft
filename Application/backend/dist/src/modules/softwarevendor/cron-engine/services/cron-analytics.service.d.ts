import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class CronAnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboard(): Promise<Record<string, unknown>>;
    getTimeline(): Promise<any[]>;
    getHealth(): Promise<any[]>;
}
