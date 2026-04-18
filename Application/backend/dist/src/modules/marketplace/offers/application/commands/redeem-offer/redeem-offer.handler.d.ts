import { ICommandHandler } from '@nestjs/cqrs';
import { RedeemOfferCommand } from './redeem-offer.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class RedeemOfferHandler implements ICommandHandler<RedeemOfferCommand> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(command: RedeemOfferCommand): Promise<{
        redemptionId: string;
        discountAmount: number;
    }>;
}
