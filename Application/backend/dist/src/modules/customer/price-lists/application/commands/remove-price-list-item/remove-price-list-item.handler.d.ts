import { ICommandHandler } from '@nestjs/cqrs';
import { RemovePriceListItemCommand } from './remove-price-list-item.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class RemovePriceListItemHandler implements ICommandHandler<RemovePriceListItemCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: RemovePriceListItemCommand): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
