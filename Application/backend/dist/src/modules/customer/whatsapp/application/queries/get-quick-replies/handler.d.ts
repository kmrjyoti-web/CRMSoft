import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetQuickRepliesQuery } from './query';
export declare class GetQuickRepliesHandler implements IQueryHandler<GetQuickRepliesQuery> {
    private readonly prisma;
    constructor(prisma: PrismaService);
    execute(query: GetQuickRepliesQuery): Promise<{
        id: string;
        tenantId: string;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        category: string | null;
        message: string;
        wabaId: string;
        shortcut: string;
    }[]>;
}
