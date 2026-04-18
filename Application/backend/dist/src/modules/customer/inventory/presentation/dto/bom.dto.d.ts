export declare class CreateBOMFormulaItemDto {
    rawMaterialId: string;
    quantity: number;
    unit: string;
    wastagePercent?: number;
    isCritical?: boolean;
    substituteProductId?: string;
    sortOrder?: number;
}
export declare class CreateBOMFormulaDto {
    formulaName: string;
    formulaCode?: string;
    finishedProductId: string;
    yieldQuantity?: number;
    yieldUnit?: string;
    prepTime?: number;
    cookTime?: number;
    instructions?: string;
    industryCode?: string;
    items: CreateBOMFormulaItemDto[];
}
export declare class UpdateBOMFormulaDto {
    formulaName?: string;
    yieldQuantity?: number;
    yieldUnit?: string;
    prepTime?: number;
    cookTime?: number;
    instructions?: string;
    industryCode?: string;
    items?: CreateBOMFormulaItemDto[];
}
export declare class CheckStockDto {
    quantity: number;
    locationId: string;
}
export declare class StartProductionDto {
    formulaId: string;
    quantity: number;
    locationId: string;
    forcePartial?: boolean;
}
export declare class CompleteProductionDto {
    actualQuantity?: number;
    locationId: string;
    scrapQuantity?: number;
    scrapReason?: string;
}
export declare class CancelProductionDto {
    reason: string;
}
export declare class RecordScrapDto {
    productId: string;
    scrapType: string;
    quantity: number;
    reason: string;
    locationId?: string;
    bomProductionId?: string;
    serialMasterId?: string;
    batchId?: string;
    unitCost?: number;
    isRawMaterial?: boolean;
    isFinishedProduct?: boolean;
    disposalMethod?: string;
}
export declare class WriteOffScrapDto {
    disposalMethod?: string;
}
