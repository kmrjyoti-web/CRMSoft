import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetTenantUsageQuery } from './query';
export declare class GetTenantUsageHandler implements IQueryHandler<GetTenantUsageQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetTenantUsageQuery): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        usersCount: number;
        contactsCount: number;
        leadsCount: number;
        productsCount: number;
        storageMb: number;
        lastCalculated: Date | null;
    }>;
}
