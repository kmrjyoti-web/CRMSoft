import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class BOMCalculationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    checkStock(tenantId: string, formulaId: string, quantity: number, locationId: string): Promise<{
        formulaId: string;
        formulaName: string;
        requestedQuantity: number;
        canProduce: boolean;
        maxProducible: number;
        shortage: {
            rawMaterialId: string;
            rawMaterialName: string;
            requiredQty: number;
            availableQty: number;
            unit: string;
            sufficient: boolean;
            shortageQty: number;
            isCritical: boolean;
            substituteAvailable: boolean;
        }[];
        allItems: {
            rawMaterialId: string;
            rawMaterialName: string;
            requiredQty: number;
            availableQty: number;
            unit: string;
            sufficient: boolean;
            shortageQty: number;
            isCritical: boolean;
            substituteAvailable: boolean;
        }[];
        estimatedCost: {
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
        };
    }>;
    calculateCost(tenantId: string, formulaId: string, quantity: number): Promise<{
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
}
