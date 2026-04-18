import { IQueryHandler } from '@nestjs/cqrs';
import { ListPriceListsQuery } from './list-price-lists.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class ListPriceListsHandler implements IQueryHandler<ListPriceListsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(q: ListPriceListsQuery): Promise<{
        data: ({
            _count: {
                items: number;
            };
        } & {
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
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
}
