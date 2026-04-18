import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetUnsubscribesQuery } from './query';
export declare class GetUnsubscribesHandler implements IQueryHandler<GetUnsubscribesQuery> {
    private readonly prisma;
    constructor(prisma: PrismaService);
    execute(query: GetUnsubscribesQuery): Promise<{
        data: {
            id: string;
            tenantId: string;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            contactId: string | null;
            email: string;
            reason: string | null;
            campaignId: string | null;
            unsubscribedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
