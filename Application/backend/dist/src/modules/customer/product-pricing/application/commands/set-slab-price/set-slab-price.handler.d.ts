import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { SetSlabPriceCommand } from './set-slab-price.command';
export declare class SetSlabPriceHandler implements ICommandHandler<SetSlabPriceCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: SetSlabPriceCommand): Promise<{
        productId: string;
        priceType: string;
        slabCount: number;
    }>;
    private validateSlabsNoOverlap;
}
