import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetBroadcastsQuery } from './query';
export declare class GetBroadcastsHandler implements IQueryHandler<GetBroadcastsQuery> {
    private readonly prisma;
    constructor(prisma: PrismaService);
    execute(query: GetBroadcastsQuery): Promise<{
        data: {
            id: string;
            tenantId: string;
            name: string;
            createdById: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            status: import("@prisma/working-client").$Enums.WaBroadcastStatus;
            templateId: string;
            scheduledAt: Date | null;
            completedAt: Date | null;
            startedAt: Date | null;
            failedCount: number;
            createdByName: string;
            wabaId: string;
            totalRecipients: number;
            sentCount: number;
            deliveredCount: number;
            readCount: number;
            throttlePerSecond: number;
            optOutCount: number;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
