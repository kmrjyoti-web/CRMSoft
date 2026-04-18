import { IQueryHandler } from '@nestjs/cqrs';
import { GetPriceListQuery } from './get-price-list.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetPriceListHandler implements IQueryHandler<GetPriceListQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(q: GetPriceListQuery): Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            sellingPrice: import("@prisma/working-client/runtime/library").Decimal;
            minQuantity: number;
            maxQuantity: number | null;
            marginPercent: import("@prisma/working-client/runtime/library").Decimal | null;
            priceListId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        currency: string;
        priority: number;
        validFrom: Date | null;
        validTo: Date | null;
    }>;
}
