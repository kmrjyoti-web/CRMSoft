import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { LinkProductsCommand } from './link-products.command';
export declare class LinkProductsHandler implements ICommandHandler<LinkProductsCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: LinkProductsCommand): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        sortOrder: number;
        relationType: string;
        toProductId: string;
        fromProductId: string;
    }>;
}
