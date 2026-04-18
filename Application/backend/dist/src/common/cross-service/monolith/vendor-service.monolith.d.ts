import { PrismaService } from '../../../core/prisma/prisma.service';
import { IVendorService, VendorLookupValue, VendorPackage, VendorIndustryType } from '../interfaces/vendor-service.interface';
export declare class VendorServiceMonolith implements IVendorService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getLookupValues(category: string): Promise<VendorLookupValue[]>;
    getPackageByTenantId(tenantId: string): Promise<VendorPackage | null>;
    getModulesByPackageId(packageId: string): Promise<Array<{
        id: string;
        code: string;
        name: string;
    }>>;
    getIndustryType(code: string): Promise<VendorIndustryType | null>;
}
