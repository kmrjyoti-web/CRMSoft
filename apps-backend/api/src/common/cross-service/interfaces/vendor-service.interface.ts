/**
 * IVendorService — Cross-Service Interface
 *
 * Defines the contract for reading vendor/platform data from other service boundaries.
 *
 * Monolith:      Implemented as direct Prisma queries (VendorServiceMonolith).
 * Microservice:  Implemented as HTTP/gRPC client to the Vendor service.
 *
 * Covered cross-service patterns (from MS1 audit):
 *   - Work → Vendor: read lookup values for entity dropdowns
 *   - Work → Vendor: read package/module list to gate feature access
 *   - Identity → Vendor: read industry/business-type during tenant provisioning
 */

export const VENDOR_SERVICE = Symbol('VENDOR_SERVICE');

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
  /** Fetch dropdown values for a lookup category — e.g. LEAD_SOURCE, CONTACT_TYPE */
  getLookupValues(category: string): Promise<VendorLookupValue[]>;

  /** Fetch the package assigned to a tenant to determine module access */
  getPackageByTenantId(tenantId: string): Promise<VendorPackage | null>;

  /** Fetch the list of active module codes in a package */
  getModulesByPackageId(packageId: string): Promise<Array<{ id: string; code: string; name: string }>>;

  /** Fetch industry/business-type configuration — used during tenant setup */
  getIndustryType(code: string): Promise<VendorIndustryType | null>;
}
