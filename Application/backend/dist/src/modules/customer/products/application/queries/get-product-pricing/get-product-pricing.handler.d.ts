import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetProductPricingQuery } from './get-product-pricing.query';
export declare class GetProductPricingHandler implements IQueryHandler<GetProductPricingQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetProductPricingQuery): Promise<{
        productId: string;
        prices: ({
            priceGroup: {
                id: string;
                name: string;
                code: string;
            } | null;
        } & {
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
            currency: string;
            productId: string;
            amount: import("@prisma/working-client/runtime/library").Decimal;
            validFrom: Date | null;
            validTo: Date | null;
            priceType: import("@prisma/working-client").$Enums.PriceType;
            priceGroupId: string | null;
            minQty: import("@prisma/working-client/runtime/library").Decimal | null;
            maxQty: import("@prisma/working-client/runtime/library").Decimal | null;
        })[];
        grouped: Record<string, ({
            priceGroup: {
                id: string;
                name: string;
                code: string;
            } | null;
        } & {
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
            currency: string;
            productId: string;
            amount: import("@prisma/working-client/runtime/library").Decimal;
            validFrom: Date | null;
            validTo: Date | null;
            priceType: import("@prisma/working-client").$Enums.PriceType;
            priceGroupId: string | null;
            minQty: import("@prisma/working-client/runtime/library").Decimal | null;
            maxQty: import("@prisma/working-client/runtime/library").Decimal | null;
        })[]>;
    }>;
}
