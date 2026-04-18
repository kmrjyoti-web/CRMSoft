import { ICommandHandler } from '@nestjs/cqrs';
import { UpdatePriceListCommand } from './update-price-list.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class UpdatePriceListHandler implements ICommandHandler<UpdatePriceListCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: UpdatePriceListCommand): Promise<{
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
