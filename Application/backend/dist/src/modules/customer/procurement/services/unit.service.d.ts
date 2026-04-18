import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class UnitService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string, category?: string): Promise<{
        symbol: string;
        id: string;
        tenantId: string | null;
        name: string;
        isActive: boolean;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        isSystem: boolean;
        unitCategory: import("@prisma/working-client").$Enums.UnitCategory;
        isBase: boolean;
    }[]>;
    getById(tenantId: string, id: string): Promise<{
        symbol: string;
        id: string;
        tenantId: string | null;
        name: string;
        isActive: boolean;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        isSystem: boolean;
        unitCategory: import("@prisma/working-client").$Enums.UnitCategory;
        isBase: boolean;
    }>;
    create(tenantId: string, dto: {
        name: string;
        symbol: string;
        category: string;
        baseMultiplier?: number;
        isBaseUnit?: boolean;
    }): Promise<{
        symbol: string;
        id: string;
        tenantId: string | null;
        name: string;
        isActive: boolean;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        isSystem: boolean;
        unitCategory: import("@prisma/working-client").$Enums.UnitCategory;
        isBase: boolean;
    }>;
    update(tenantId: string, id: string, dto: {
        name?: string;
        symbol?: string;
    }): Promise<{
        symbol: string;
        id: string;
        tenantId: string | null;
        name: string;
        isActive: boolean;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        isSystem: boolean;
        unitCategory: import("@prisma/working-client").$Enums.UnitCategory;
        isBase: boolean;
    }>;
    delete(tenantId: string, id: string): Promise<{
        deleted: boolean;
    }>;
    listConversions(tenantId: string, productId?: string): Promise<{
        id: string;
        tenantId: string | null;
        isActive: boolean;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        conversionFactor: import("@prisma/working-client/runtime/library").Decimal;
        productId: string | null;
        fromUnitId: string;
        toUnitId: string;
    }[]>;
    createConversion(tenantId: string, dto: {
        fromUnitId: string;
        toUnitId: string;
        factor: number;
        productId?: string;
    }): Promise<{
        id: string;
        tenantId: string | null;
        isActive: boolean;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        conversionFactor: import("@prisma/working-client/runtime/library").Decimal;
        productId: string | null;
        fromUnitId: string;
        toUnitId: string;
    }>;
    deleteConversion(tenantId: string, id: string): Promise<{
        deleted: boolean;
    }>;
    calculate(tenantId: string, dto: {
        fromUnitId: string;
        toUnitId: string;
        quantity: number;
        productId?: string;
    }): Promise<{
        result: number;
        factor: number;
    }>;
}
