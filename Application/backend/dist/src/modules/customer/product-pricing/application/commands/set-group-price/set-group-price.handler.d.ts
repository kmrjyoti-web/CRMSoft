import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { SetGroupPriceCommand } from './set-group-price.command';
export declare class SetGroupPriceHandler implements ICommandHandler<SetGroupPriceCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: SetGroupPriceCommand): Promise<{
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
    }>;
}
