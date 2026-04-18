import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { SetProductPricesCommand } from './set-product-prices.command';
export declare class SetProductPricesHandler implements ICommandHandler<SetProductPricesCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: SetProductPricesCommand): Promise<{
        productId: string;
        pricesSet: number;
    }>;
}
