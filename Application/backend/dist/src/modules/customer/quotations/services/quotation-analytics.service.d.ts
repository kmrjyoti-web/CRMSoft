import { PrismaService } from '../../../../core/prisma/prisma.service';
interface DateFilter {
    dateFrom?: Date;
    dateTo?: Date;
    userId?: string;
}
export declare class QuotationAnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getOverview(params: DateFilter): Promise<{
        totalQuotations: number;
        totalValue: number;
        byStatus: Record<string, number>;
        conversionRate: number;
        avgDealSize: number;
        avgTimeToClose: number;
        thisMonth: {
            total: number;
            accepted: number;
        };
        lastMonth: {
            total: number;
            accepted: number;
        };
        trend: string;
    }>;
    getConversionFunnel(params: DateFilter): Promise<{
        stages: {
            stage: string;
            count: number;
            value: number;
            dropOff: string;
        }[];
        overallConversion: string;
    }>;
    getIndustryAnalysis(params: DateFilter): Promise<{
        industry: string;
        totalQuotations: number;
        accepted: number;
        rejected: number;
        pending: number;
        conversionRate: number;
        totalValue: unknown;
        avgDealSize: number;
    }[]>;
    getProductAnalysis(params: DateFilter): Promise<{
        productId: unknown;
        productName: unknown;
        productCode: unknown;
        timesQuoted: any;
        totalQuantity: unknown;
        totalRevenue: number;
        conversionRate: number;
    }[]>;
    getBestQuotations(params: {
        limit?: number;
    }): Promise<{
        id: string;
        tenantId: string;
        version: number;
        configJson: import("@prisma/working-client/runtime/library").JsonValue | null;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/working-client").$Enums.QuotationStatus;
        organizationId: string | null;
        leadId: string;
        tags: string[];
        totalAmount: import("@prisma/working-client/runtime/library").Decimal;
        title: string | null;
        taxableAmount: import("@prisma/working-client/runtime/library").Decimal;
        subtotal: import("@prisma/working-client/runtime/library").Decimal;
        discountAmount: import("@prisma/working-client/runtime/library").Decimal;
        totalTax: import("@prisma/working-client/runtime/library").Decimal;
        roundOff: import("@prisma/working-client/runtime/library").Decimal;
        summary: string | null;
        validFrom: Date | null;
        cgstAmount: import("@prisma/working-client/runtime/library").Decimal;
        sgstAmount: import("@prisma/working-client/runtime/library").Decimal;
        igstAmount: import("@prisma/working-client/runtime/library").Decimal;
        cessAmount: import("@prisma/working-client/runtime/library").Decimal;
        discountType: string | null;
        discountValue: import("@prisma/working-client/runtime/library").Decimal;
        internalNotes: string | null;
        priceType: import("@prisma/working-client").$Enums.QuotationPriceType;
        rejectedReason: string | null;
        quotationNo: string;
        coverNote: string | null;
        minAmount: import("@prisma/working-client/runtime/library").Decimal | null;
        maxAmount: import("@prisma/working-client/runtime/library").Decimal | null;
        plusMinusPercent: import("@prisma/working-client/runtime/library").Decimal | null;
        validUntil: Date | null;
        paymentTerms: string | null;
        deliveryTerms: string | null;
        warrantyTerms: string | null;
        termsConditions: string | null;
        contactPersonId: string | null;
        parentQuotationId: string | null;
        acceptedAt: Date | null;
        acceptedNote: string | null;
        rejectedAt: Date | null;
        aiScore: number | null;
        aiSuggestions: import("@prisma/working-client/runtime/library").JsonValue | null;
    }[]>;
    compareQuotations(ids: string[]): Promise<{
        quotations: {
            id: string;
            quotationNo: string;
            status: import("@prisma/working-client").$Enums.QuotationStatus;
            version: number;
            totalAmount: import("@prisma/working-client/runtime/library").Decimal;
            discountType: string | null;
            discountValue: import("@prisma/working-client/runtime/library").Decimal;
            itemCount: number;
        }[];
        products: string[];
        differences: {
            pricing: {
                quotationNo: string;
                subtotal: import("@prisma/working-client/runtime/library").Decimal;
                totalAmount: import("@prisma/working-client/runtime/library").Decimal;
                totalTax: import("@prisma/working-client/runtime/library").Decimal;
            }[];
        };
    }>;
    private buildDateWhere;
}
export {};
