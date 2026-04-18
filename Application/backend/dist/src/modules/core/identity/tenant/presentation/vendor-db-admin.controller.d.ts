import { ApiResponse } from '../../../../../common/utils/api-response';
import { VendorTenantsService } from '../services/vendor-tenants.service';
export declare class VendorDbAdminController {
    private readonly vendorTenantsService;
    constructor(vendorTenantsService: VendorTenantsService);
    listDatabases(page?: number, limit?: number): Promise<ApiResponse<{
        id: string;
        name: string;
        createdAt: Date;
        status: import("@prisma/identity-client").$Enums.TenantStatus;
        slug: string;
    }[]>>;
    migrate(tenantId: string): Promise<ApiResponse<{
        tenantId: string;
        status: string;
        message: string;
    }>>;
    repair(tenantId: string): Promise<ApiResponse<{
        tenantId: string;
        status: string;
        message: string;
    }>>;
    backup(tenantId: string): Promise<ApiResponse<{
        tenantId: string;
        url: string;
        message: string;
    }>>;
}
