import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetPriceListQuery } from './get-price-list.query';
export declare class GetPriceListHandler implements IQueryHandler<GetPriceListQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetPriceListQuery): Promise<{
        product: {
            id: string;
            name: string;
            code: string;
            mrp: import("@prisma/working-client/runtime/library").Decimal | null;
            salePrice: import("@prisma/working-client/runtime/library").Decimal | null;
        };
        pricesByType: Record<string, unknown[]>;
        totalPriceEntries: number;
    }>;
}
