import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { TenantContextService } from '../infrastructure/tenant-context.service';
export declare class TenantProvisioningService {
    private readonly prisma;
    private readonly tenantContext;
    private readonly logger;
    constructor(prisma: PrismaService, tenantContext: TenantContextService);
    provision(data: {
        name: string;
        slug: string;
        adminEmail: string;
        adminPassword: string;
        adminFirstName: string;
        adminLastName: string;
        planId: string;
    }): Promise<{
        tenant: any;
        adminUser: any;
        subscription: any;
    }>;
    private seedMenus;
}
