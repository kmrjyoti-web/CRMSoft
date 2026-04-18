import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { ListProductsQuery } from './list-products.query';
export declare class ListProductsHandler implements IQueryHandler<ListProductsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: ListProductsQuery): Promise<{
        data: ({
            _count: {
                children: number;
            };
            parent: {
                id: string;
                name: string;
            } | null;
            brand: {
                id: string;
                name: string;
                code: string;
            } | null;
            manufacturer: {
                id: string;
                name: string;
                code: string;
            } | null;
        } & {
            id: string;
            tenantId: string;
            name: string;
            code: string;
            description: string | null;
            isActive: boolean;
            configJson: import("@prisma/working-client/runtime/library").JsonValue | null;
            createdById: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            updatedById: string | null;
            updatedByName: string | null;
            sortOrder: number;
            status: import("@prisma/working-client").$Enums.ProductStatus;
            slug: string;
            tags: string[];
            shortDescription: string | null;
            parentId: string | null;
            isMaster: boolean;
            image: string | null;
            images: import("@prisma/working-client/runtime/library").JsonValue | null;
            brochureUrl: string | null;
            videoUrl: string | null;
            mrp: import("@prisma/working-client/runtime/library").Decimal | null;
            salePrice: import("@prisma/working-client/runtime/library").Decimal | null;
            purchasePrice: import("@prisma/working-client/runtime/library").Decimal | null;
            costPrice: import("@prisma/working-client/runtime/library").Decimal | null;
            taxType: import("@prisma/working-client").$Enums.TaxType;
            hsnCode: string | null;
            gstRate: import("@prisma/working-client/runtime/library").Decimal | null;
            cessRate: import("@prisma/working-client/runtime/library").Decimal | null;
            taxInclusive: boolean;
            primaryUnit: import("@prisma/working-client").$Enums.UnitType;
            secondaryUnit: import("@prisma/working-client").$Enums.UnitType | null;
            conversionFactor: import("@prisma/working-client/runtime/library").Decimal | null;
            minOrderQty: import("@prisma/working-client/runtime/library").Decimal | null;
            maxOrderQty: import("@prisma/working-client/runtime/library").Decimal | null;
            weight: import("@prisma/working-client/runtime/library").Decimal | null;
            dimensions: import("@prisma/working-client/runtime/library").JsonValue | null;
            packingSize: number | null;
            packingUnit: import("@prisma/working-client").$Enums.UnitType | null;
            packingDescription: string | null;
            barcode: string | null;
            batchTracking: boolean;
            licenseRequired: boolean;
            licenseType: string | null;
            licenseNumber: string | null;
            individualSale: boolean;
            isReturnable: boolean;
            warrantyMonths: number | null;
            shelfLifeDays: number | null;
            brandId: string | null;
            manufacturerId: string | null;
            verticalData: import("@prisma/working-client/runtime/library").JsonValue | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
}
