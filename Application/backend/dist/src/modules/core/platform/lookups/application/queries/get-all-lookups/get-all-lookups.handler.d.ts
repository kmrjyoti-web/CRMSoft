import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetAllLookupsQuery } from './get-all-lookups.query';
export declare class GetAllLookupsHandler implements IQueryHandler<GetAllLookupsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetAllLookupsQuery): Promise<({
        _count: {
            values: number;
        };
    } & {
        id: string;
        tenantId: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        category: string;
        displayName: string;
        isSystem: boolean;
    })[]>;
}
