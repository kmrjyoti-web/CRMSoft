import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class InventoryReportService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    stockLedger(tenantId: string, filters: {
        productId?: string;
        locationId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        id: string;
        date: Date;
        productId: string;
        type: import("@prisma/working-client").$Enums.StockTransactionType;
        inQty: number;
        outQty: number;
        balance: number;
        unitPrice: import("@prisma/working-client/runtime/library").Decimal | null;
        totalAmount: import("@prisma/working-client/runtime/library").Decimal | null;
        location: string;
        remarks: string | null;
    }[]>;
    expiryReport(tenantId: string, days?: number): Promise<{
        id: string;
        serialNo: string;
        productId: string;
        expiryDate: Date | null;
        daysLeft: number | null;
        status: import("@prisma/working-client").$Enums.SerialStatus;
        isExpired: boolean;
        locationId: string | null;
        costPrice: import("@prisma/working-client/runtime/library").Decimal | null;
    }[]>;
    valuation(tenantId: string, filters?: {
        locationId?: string;
    }): Promise<{
        totalValue: number;
        totalStock: number;
        totalProducts: number;
        products: {
            productId: string;
            inventoryType: import("@prisma/working-client").$Enums.InventoryType;
            currentStock: number;
            avgCostPrice: number;
            totalValue: number;
            hsnCode: string | null;
        }[];
    }>;
    serialTracking(tenantId: string, filters?: {
        serialNo?: string;
        productId?: string;
        status?: string;
    }): Promise<{
        lifecycle: unknown[];
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        metadata: import("@prisma/working-client/runtime/library").JsonValue | null;
        status: import("@prisma/working-client").$Enums.SerialStatus;
        industryCode: string | null;
        mrp: import("@prisma/working-client/runtime/library").Decimal | null;
        costPrice: import("@prisma/working-client/runtime/library").Decimal | null;
        taxType: import("@prisma/working-client").$Enums.InventoryTaxType | null;
        hsnCode: string | null;
        productId: string;
        taxRate: import("@prisma/working-client/runtime/library").Decimal | null;
        inventoryItemId: string;
        serialNo: string;
        code1: string | null;
        code2: string | null;
        batchNo: string | null;
        expiryType: import("@prisma/working-client").$Enums.ExpiryType;
        expiryValue: number | null;
        expiryDate: Date | null;
        createDate: Date;
        activationDate: Date | null;
        soldDate: Date | null;
        purchaseRate: import("@prisma/working-client/runtime/library").Decimal | null;
        saleRate: import("@prisma/working-client/runtime/library").Decimal | null;
        locationId: string | null;
        customerId: string | null;
        invoiceId: string | null;
        customFields: import("@prisma/working-client/runtime/library").JsonValue | null;
    }[]>;
}
