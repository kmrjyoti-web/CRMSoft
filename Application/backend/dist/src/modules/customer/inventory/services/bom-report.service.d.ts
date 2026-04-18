import { PrismaService } from '../../../../core/prisma/prisma.service';
import { BOMCalculationService } from './bom-calculation.service';
export declare class BOMReportService {
    private readonly prisma;
    private readonly calculationService;
    constructor(prisma: PrismaService, calculationService: BOMCalculationService);
    productionReport(tenantId: string, filters?: {
        startDate?: string;
        endDate?: string;
        formulaId?: string;
        status?: string;
    }): Promise<{
        runs: ({
            formula: {
                finishedProduct: {
                    id: string;
                    tenantId: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    isDeleted: boolean;
                    deletedAt: Date | null;
                    deletedById: string | null;
                    updatedById: string | null;
                    updatedByName: string | null;
                    industryCode: string | null;
                    taxType: import("@prisma/working-client").$Enums.InventoryTaxType | null;
                    hsnCode: string | null;
                    productId: string;
                    inventoryType: import("@prisma/working-client").$Enums.InventoryType;
                    currentStock: number;
                    reservedStock: number;
                    minStockLevel: number | null;
                    reorderLevel: number | null;
                    maxStockLevel: number | null;
                    avgCostPrice: import("@prisma/working-client/runtime/library").Decimal | null;
                    lastPurchasePrice: import("@prisma/working-client/runtime/library").Decimal | null;
                    sellingPrice: import("@prisma/working-client/runtime/library").Decimal | null;
                    taxRate: import("@prisma/working-client/runtime/library").Decimal | null;
                    isRawMaterial: boolean;
                    isFinishedProduct: boolean;
                    isScrap: boolean;
                    defaultUnit: string | null;
                    purchaseUnitId: string | null;
                    saleUnitId: string | null;
                    stockUnitId: string | null;
                    defaultLocationId: string | null;
                };
            } & {
                id: string;
                tenantId: string;
                version: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                isDeleted: boolean;
                deletedAt: Date | null;
                deletedById: string | null;
                updatedById: string | null;
                updatedByName: string | null;
                industryCode: string | null;
                prepTime: number | null;
                instructions: string | null;
                finishedProductId: string;
                formulaName: string;
                formulaCode: string;
                yieldQuantity: import("@prisma/working-client/runtime/library").Decimal;
                yieldUnit: string;
                cookTime: number | null;
            };
        } & {
            id: string;
            tenantId: string;
            createdById: string | null;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            status: string;
            formulaId: string;
            quantityOrdered: number;
            quantityProduced: number;
            scrapQuantity: number;
            scrapReason: string | null;
            productionDate: Date;
            completedDate: Date | null;
        })[];
        summary: {
            totalRuns: number;
            totalOrdered: number;
            totalProduced: number;
            totalScrap: number;
            completedRuns: number;
            cancelledRuns: number;
            yieldRate: number;
        };
    }>;
    consumptionReport(tenantId: string, filters?: {
        startDate?: string;
        endDate?: string;
        productId?: string;
    }): Promise<{
        transactions: ({
            inventoryItem: {
                id: string;
                tenantId: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                isDeleted: boolean;
                deletedAt: Date | null;
                deletedById: string | null;
                updatedById: string | null;
                updatedByName: string | null;
                industryCode: string | null;
                taxType: import("@prisma/working-client").$Enums.InventoryTaxType | null;
                hsnCode: string | null;
                productId: string;
                inventoryType: import("@prisma/working-client").$Enums.InventoryType;
                currentStock: number;
                reservedStock: number;
                minStockLevel: number | null;
                reorderLevel: number | null;
                maxStockLevel: number | null;
                avgCostPrice: import("@prisma/working-client/runtime/library").Decimal | null;
                lastPurchasePrice: import("@prisma/working-client/runtime/library").Decimal | null;
                sellingPrice: import("@prisma/working-client/runtime/library").Decimal | null;
                taxRate: import("@prisma/working-client/runtime/library").Decimal | null;
                isRawMaterial: boolean;
                isFinishedProduct: boolean;
                isScrap: boolean;
                defaultUnit: string | null;
                purchaseUnitId: string | null;
                saleUnitId: string | null;
                stockUnitId: string | null;
                defaultLocationId: string | null;
            };
        } & {
            id: string;
            tenantId: string;
            createdById: string | null;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            productId: string;
            inventoryItemId: string;
            locationId: string;
            transactionType: import("@prisma/working-client").$Enums.StockTransactionType;
            quantity: number;
            unitPrice: import("@prisma/working-client/runtime/library").Decimal | null;
            totalAmount: import("@prisma/working-client/runtime/library").Decimal | null;
            toLocationId: string | null;
            serialMasterId: string | null;
            batchId: string | null;
            bomProductionId: string | null;
            referenceType: string | null;
            referenceId: string | null;
            transactionDate: Date;
            remarks: string | null;
        })[];
        summary: {
            productId: string;
            totalConsumed: number;
            totalCost: number;
            count: number;
        }[];
    }>;
    costingReport(tenantId: string, formulaId: string): Promise<{
        totalRawMaterialCost: number;
        costPerUnit: number;
        quantity: number;
        wastagePercent: number;
        breakdown: {
            rawMaterialId: string;
            requiredQty: number;
            unit: string;
            unitCost: number;
            lineCost: number;
        }[];
        suggestedMRP2x: number;
        suggestedMRP3x: number;
    }>;
    yieldReport(tenantId: string, filters?: {
        startDate?: string;
        endDate?: string;
    }): Promise<{
        runs: {
            id: string;
            formulaName: string;
            ordered: number;
            produced: number;
            scrap: number;
            yieldRate: number;
            date: Date;
        }[];
        averageYieldRate: number;
    }>;
}
