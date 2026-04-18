import { VendorDashboardService } from '../services/vendor-dashboard.service';
import { VendorDashboardQueryDto } from './dto/vendor-dashboard-query.dto';
import { ApiResponse } from '../../../../../common/utils/api-response';
export declare class VendorDashboardController {
    private readonly vendorDashboardService;
    constructor(vendorDashboardService: VendorDashboardService);
    getOverview(query: VendorDashboardQueryDto): Promise<ApiResponse<{
        totalTenants: number;
        activeTenants: number;
        trialTenants: number;
        suspendedTenants: number;
        mrr: number;
        arr: number;
        newTenants: number;
        churnRate: number;
    }>>;
    getMRR(query: VendorDashboardQueryDto): Promise<ApiResponse<{
        month: string;
        mrr: number;
    }[]>>;
    getTenantGrowth(query: VendorDashboardQueryDto): Promise<ApiResponse<{
        date: string;
        count: number;
    }[]>>;
    getPlanDistribution(): Promise<ApiResponse<{
        planName: string;
        planCode: string;
        count: number;
        percentage: number;
    }[]>>;
    getRevenueByPlan(query: VendorDashboardQueryDto): Promise<ApiResponse<{
        planName: string;
        revenue: number;
        invoiceCount: number;
    }[]>>;
}
