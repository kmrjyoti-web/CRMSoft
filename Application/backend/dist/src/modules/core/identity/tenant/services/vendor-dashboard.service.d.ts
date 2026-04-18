import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class VendorDashboardService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getOverview(days?: number): Promise<{
        totalTenants: number;
        activeTenants: number;
        trialTenants: number;
        suspendedTenants: number;
        mrr: number;
        arr: number;
        newTenants: number;
        churnRate: number;
    }>;
    getMRR(days?: number): Promise<{
        month: string;
        mrr: number;
    }[]>;
    getTenantGrowth(days?: number): Promise<{
        date: string;
        count: number;
    }[]>;
    getPlanDistribution(): Promise<{
        planName: string;
        planCode: string;
        count: number;
        percentage: number;
    }[]>;
    getRevenueByPlan(days?: number): Promise<{
        planName: string;
        revenue: number;
        invoiceCount: number;
    }[]>;
}
