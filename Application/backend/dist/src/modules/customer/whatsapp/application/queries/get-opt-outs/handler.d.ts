import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetOptOutsQuery } from './query';
export declare class GetOptOutsHandler implements IQueryHandler<GetOptOutsQuery> {
    private readonly prisma;
    constructor(prisma: PrismaService);
    execute(query: GetOptOutsQuery): Promise<{
        data: {
            id: string;
            tenantId: string;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            contactId: string | null;
            reason: string | null;
            wabaId: string;
            phoneNumber: string;
            optedOutAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
