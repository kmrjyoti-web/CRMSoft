import { ICommandHandler } from '@nestjs/cqrs';
import { UpdatePriceListItemCommand } from './update-price-list-item.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class UpdatePriceListItemHandler implements ICommandHandler<UpdatePriceListItemCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: UpdatePriceListItemCommand): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        sellingPrice: import("@prisma/working-client/runtime/library").Decimal;
        minQuantity: number;
        maxQuantity: number | null;
        marginPercent: import("@prisma/working-client/runtime/library").Decimal | null;
        priceListId: string;
    }>;
}
