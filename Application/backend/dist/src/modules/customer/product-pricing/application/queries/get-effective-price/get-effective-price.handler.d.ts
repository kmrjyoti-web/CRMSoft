import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetEffectivePriceQuery } from './get-effective-price.query';
export declare class GetEffectivePriceHandler implements IQueryHandler<GetEffectivePriceQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetEffectivePriceQuery): Promise<{
        productId: string;
        productName: string;
        basePrice: number;
        priceType: any;
        priceGroup: any;
        quantity: number;
        slabApplied: {
            minQty: number;
            maxQty: number | null;
        } | null;
        subtotal: number;
        tax: import("./tax-calculator.helper").TaxBreakup;
        grandTotal: number;
        currency: string;
    }>;
    private resolvePriceGroup;
    private resolvePrice;
    private findSlabMatch;
    private findBasePrice;
}
