export declare const VENDOR_SERVICE: unique symbol;
export interface VendorLookupValue {
    code: string;
    label: string;
    sortOrder?: number;
}
export interface VendorPackage {
    id: string;
    name: string;
    modules: string[];
}
export interface VendorIndustryType {
    id: string;
    code: string;
    name: string;
    config: Record<string, unknown>;
}
export interface IVendorService {
    getLookupValues(category: string): Promise<VendorLookupValue[]>;
    getPackageByTenantId(tenantId: string): Promise<VendorPackage | null>;
    getModulesByPackageId(packageId: string): Promise<Array<{
        id: string;
        code: string;
        name: string;
    }>>;
    getIndustryType(code: string): Promise<VendorIndustryType | null>;
}
