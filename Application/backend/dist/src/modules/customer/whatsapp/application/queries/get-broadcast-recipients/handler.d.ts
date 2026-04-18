import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetBroadcastRecipientsQuery } from './query';
export declare class GetBroadcastRecipientsHandler implements IQueryHandler<GetBroadcastRecipientsQuery> {
    private readonly prisma;
    constructor(prisma: PrismaService);
    execute(query: GetBroadcastRecipientsQuery): Promise<{
        data: {
            id: string;
            tenantId: string;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            status: import("@prisma/working-client").$Enums.WaBroadcastRecipientStatus;
            variables: import("@prisma/working-client/runtime/library").JsonValue | null;
            sentAt: Date | null;
            contactName: string | null;
            deliveredAt: Date | null;
            readAt: Date | null;
            failedAt: Date | null;
            failureReason: string | null;
            phoneNumber: string;
            waMessageId: string | null;
            broadcastId: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
