import { PrismaService } from '../../../../core/prisma/prisma.service';
export interface CompareWeights {
    priceWeight: number;
    deliveryWeight: number;
    creditWeight: number;
    qualityWeight: number;
}
export declare class CompareEngineService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    compareQuotations(tenantId: string, rfqId: string, weights?: Partial<CompareWeights>): Promise<{
        comparison: {
            id: string;
            tenantId: string;
            createdById: string;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            status: string;
            rfqId: string;
            compareBy: string;
            customWeights: import("@prisma/working-client/runtime/library").JsonValue | null;
            comparisonData: import("@prisma/working-client/runtime/library").JsonValue;
            selectedQuotationId: string | null;
        };
        scores: {
            quotationId: string;
            vendorId: string;
            priceScore: number;
            deliveryScore: number;
            creditScore: number;
            qualityScore: number;
            totalScore: number;
            grandTotal: number;
            deliveryDays: number;
            creditDays: number;
        }[];
        weights: CompareWeights;
    }>;
    getComparison(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        createdById: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: string;
        rfqId: string;
        compareBy: string;
        customWeights: import("@prisma/working-client/runtime/library").JsonValue | null;
        comparisonData: import("@prisma/working-client/runtime/library").JsonValue;
        selectedQuotationId: string | null;
    }>;
    listByRfq(tenantId: string, rfqId: string): Promise<{
        id: string;
        tenantId: string;
        createdById: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: string;
        rfqId: string;
        compareBy: string;
        customWeights: import("@prisma/working-client/runtime/library").JsonValue | null;
        comparisonData: import("@prisma/working-client/runtime/library").JsonValue;
        selectedQuotationId: string | null;
    }[]>;
    selectWinner(tenantId: string, comparisonId: string, quotationId: string, remarks?: string): Promise<{
        id: string;
        tenantId: string;
        createdById: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: string;
        rfqId: string;
        compareBy: string;
        customWeights: import("@prisma/working-client/runtime/library").JsonValue | null;
        comparisonData: import("@prisma/working-client/runtime/library").JsonValue;
        selectedQuotationId: string | null;
    }>;
}
