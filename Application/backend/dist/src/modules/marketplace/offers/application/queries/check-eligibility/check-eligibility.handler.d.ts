import { IQueryHandler } from '@nestjs/cqrs';
import { CheckEligibilityQuery } from './check-eligibility.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class CheckEligibilityHandler implements IQueryHandler<CheckEligibilityQuery> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(query: CheckEligibilityQuery): Promise<{
        discountAmount: number;
        offer: {
            id: string;
            title: string;
            discountType: import("@prisma/marketplace-client").$Enums.DiscountType;
            discountValue: number;
        };
        eligible: boolean;
        reason?: string;
    }>;
}
