// ── Enums ────────────────────────────────────────────────

export type PriceType = "BASE" | "MRP" | "SELLING" | "WHOLESALE" | "DISTRIBUTOR" | "SPECIAL";

// ── Entities ─────────────────────────────────────────────

export interface ProductPrice {
  id: string;
  productId: string;
  priceType: PriceType;
  amount: number;
  currency: string;
  minQty?: number;
  maxQty?: number;
  groupId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceList {
  productId: string;
  productName?: string;
  prices: ProductPrice[];
  slabPrices: SlabPrice[];
  groupPrices: GroupPrice[];
}

export interface SlabPrice {
  id: string;
  productId: string;
  minQty: number;
  maxQty?: number;
  pricePerUnit: number;
  currency: string;
  isActive: boolean;
}

export interface GroupPrice {
  id: string;
  productId: string;
  groupId: string;
  groupName?: string;
  priceType: PriceType;
  amount: number;
  currency: string;
  isActive: boolean;
}

export interface EffectivePrice {
  basePrice: number;
  sellingPrice: number;
  discount?: number;
  gstRate?: number;
  gstAmount?: number;
  totalAmount: number;
  priceBreakup: Record<string, number>;
}

// ── DTOs ─────────────────────────────────────────────────

export interface SetPricesDto {
  prices: { priceType: PriceType; amount: number; currency?: string; minQty?: number; maxQty?: number }[];
}

export interface SetGroupPriceDto {
  groupId: string;
  priceType: PriceType;
  amount: number;
  currency?: string;
}

export interface SetSlabPricesDto {
  slabs: { minQty: number; maxQty?: number; pricePerUnit: number; currency?: string }[];
}

export interface EffectivePriceDto {
  productId: string;
  contactId?: string;
  organizationId?: string;
  quantity: number;
  isInterState?: boolean;
}

export interface BulkUpdatePricesDto {
  updates: { productId: string; priceType: PriceType; amount: number }[];
}
