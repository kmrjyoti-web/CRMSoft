// ─── BOM / Recipe Types ───

export type ScrapType = 'SCRAP_EXPIRED' | 'SCRAP_DAMAGED' | 'SCRAP_PRODUCTION_WASTE' | 'SCRAP_RETURNED_DEFECTIVE' | 'SCRAP_QUALITY_FAILURE';
export type ProductionStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface BOMFormulaItem {
  id: string;
  formulaId: string;
  rawMaterialId: string;
  quantity: number;
  unit: string;
  wastagePercent: number | null;
  effectiveQuantity: number | null;
  isCritical: boolean;
  substituteProductId: string | null;
  sortOrder: number;
  rawMaterial?: {
    id: string;
    productId: string;
    defaultUnit: string | null;
    avgCostPrice: number | null;
    currentStock: number;
  };
  currentStock?: number;
}

export interface BOMFormula {
  id: string;
  tenantId: string;
  finishedProductId: string;
  formulaName: string;
  formulaCode: string;
  yieldQuantity: number;
  yieldUnit: string;
  prepTime: number | null;
  cookTime: number | null;
  instructions: string | null;
  industryCode: string | null;
  isActive: boolean;
  version: number;
  items: BOMFormulaItem[];
  finishedProduct?: { id: string; productId: string; defaultUnit: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface StockCheckItem {
  rawMaterialId: string;
  rawMaterialName: string;
  requiredQty: number;
  availableQty: number;
  unit: string;
  sufficient: boolean;
  shortageQty: number;
  isCritical: boolean;
  substituteAvailable: boolean;
}

export interface StockCheckResult {
  formulaId: string;
  formulaName: string;
  requestedQuantity: number;
  canProduce: boolean;
  maxProducible: number;
  shortage: StockCheckItem[];
  allItems: StockCheckItem[];
  estimatedCost: CostBreakdown;
}

export interface CostBreakdownItem {
  rawMaterialId: string;
  requiredQty: number;
  unit: string;
  unitCost: number;
  lineCost: number;
}

export interface CostBreakdown {
  totalRawMaterialCost: number;
  costPerUnit: number;
  quantity: number;
  wastagePercent: number;
  breakdown: CostBreakdownItem[];
  suggestedMRP2x: number;
  suggestedMRP3x: number;
}

export interface BOMProduction {
  id: string;
  tenantId: string;
  formulaId: string;
  quantityOrdered: number;
  quantityProduced: number;
  scrapQuantity: number;
  scrapReason: string | null;
  status: ProductionStatus;
  productionDate: string;
  completedDate: string | null;
  createdById: string | null;
  formula?: BOMFormula;
  stockCheck?: StockCheckResult;
  scrapRecords?: ScrapRecord[];
  transactions?: Record<string, unknown>[];
}

export interface ScrapRecord {
  id: string;
  tenantId: string;
  productId: string;
  serialMasterId: string | null;
  batchId: string | null;
  bomProductionId: string | null;
  scrapType: ScrapType;
  quantity: number;
  unitCost: number | null;
  totalLoss: number | null;
  reason: string;
  locationId: string | null;
  isRawMaterial: boolean;
  isFinishedProduct: boolean;
  disposalMethod: string | null;
  createdById: string | null;
  createdAt: string;
}

export interface ScrapReport {
  totalScrapValue: number;
  totalRecords: number;
  scrapByType: Array<{ type: string; value: number }>;
  scrapByProduct: Array<{ productId: string; quantity: number; value: number }>;
  rawMaterialWasteCount: number;
  finishedProductWasteCount: number;
}

export interface ProductionReport {
  runs: BOMProduction[];
  summary: {
    totalRuns: number;
    totalOrdered: number;
    totalProduced: number;
    totalScrap: number;
    completedRuns: number;
    cancelledRuns: number;
    yieldRate: number;
  };
}

export interface YieldReport {
  runs: Array<{
    id: string;
    formulaName: string;
    ordered: number;
    produced: number;
    scrap: number;
    yieldRate: number;
    date: string;
  }>;
  averageYieldRate: number;
}

// ─── Payloads ───

export interface CreateFormulaItemPayload {
  rawMaterialId: string;
  quantity: number;
  unit: string;
  wastagePercent?: number;
  isCritical?: boolean;
  substituteProductId?: string;
  sortOrder?: number;
}

export interface CreateFormulaPayload {
  formulaName: string;
  formulaCode?: string;
  finishedProductId: string;
  yieldQuantity?: number;
  yieldUnit?: string;
  prepTime?: number;
  cookTime?: number;
  instructions?: string;
  industryCode?: string;
  items: CreateFormulaItemPayload[];
}

export interface UpdateFormulaPayload {
  formulaName?: string;
  yieldQuantity?: number;
  yieldUnit?: string;
  prepTime?: number;
  cookTime?: number;
  instructions?: string;
  industryCode?: string;
  items?: CreateFormulaItemPayload[];
}

export interface StartProductionPayload {
  formulaId: string;
  quantity: number;
  locationId: string;
  forcePartial?: boolean;
}

export interface CompleteProductionPayload {
  actualQuantity?: number;
  locationId: string;
  scrapQuantity?: number;
  scrapReason?: string;
}

export interface RecordScrapPayload {
  productId: string;
  scrapType: string;
  quantity: number;
  reason: string;
  locationId?: string;
  bomProductionId?: string;
  unitCost?: number;
  isRawMaterial?: boolean;
  isFinishedProduct?: boolean;
}
