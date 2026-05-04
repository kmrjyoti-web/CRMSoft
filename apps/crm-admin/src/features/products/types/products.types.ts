/* ------------------------------------------------------------------ */
/*  Products module types – Package, Unit, Product                     */
/* ------------------------------------------------------------------ */

// ── Common list params ───────────────────────────────────────────────

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
}

// ── Package ──────────────────────────────────────────────────────────

export interface PackageItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  type?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PackageCreateData {
  name: string;
  code: string;
  description?: string;
  type?: string;
}

export interface PackageUpdateData extends Partial<PackageCreateData> {
  isActive?: boolean;
}

// ── Unit (ProductUnit types from backend) ────────────────────────────

export interface UnitTypeOption {
  value: string;
  label: string;
}

// ── Product ──────────────────────────────────────────────────────────

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'DISCONTINUED';

export interface ProductListItem {
  id: string;
  name: string;
  code: string;
  slug: string;
  shortDescription?: string;
  image?: string;
  mrp?: number;
  salePrice?: number;
  primaryUnit: string;
  hsnCode?: string;
  status: ProductStatus;
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductListParams extends ListParams {
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  taxType?: string;
}

export interface ProductCreateData {
  name: string;
  code?: string;
  shortDescription?: string;
  description?: string;
  parentId?: string;
  isMaster?: boolean;
  image?: string;
  mrp?: number;
  salePrice?: number;
  purchasePrice?: number;
  costPrice?: number;
  taxType?: string;
  hsnCode?: string;
  gstRate?: number;
  cessRate?: number;
  taxInclusive?: boolean;
  primaryUnit?: string;
  secondaryUnit?: string;
  conversionFactor?: number;
  packingSize?: number;
  packingUnit?: string;
  packingDescription?: string;
  barcode?: string;
  tags?: string[];
  sortOrder?: number;
}

export interface ProductUpdateData extends Partial<ProductCreateData> {
  isActive?: boolean;
}
