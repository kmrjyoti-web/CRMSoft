import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { AssignProductFiltersCommand } from './assign-product-filters.command';
export declare class AssignProductFiltersHandler implements ICommandHandler<AssignProductFiltersCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: AssignProductFiltersCommand): Promise<{
        id: string;
        tenantId: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        productId: string;
        lookupValueId: string;
    }[]>;
}
