import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetConversationDetailQuery } from './query';
export declare class GetConversationDetailHandler implements IQueryHandler<GetConversationDetailQuery> {
    private readonly prisma;
    constructor(prisma: PrismaService);
    execute(query: GetConversationDetailQuery): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/working-client").$Enums.WaConversationStatus;
        tags: string[];
        assignedToId: string | null;
        contactName: string | null;
        unreadCount: number;
        wabaId: string;
        linkedEntityType: string | null;
        linkedEntityId: string | null;
        messageCount: number;
        lastMessageAt: Date | null;
        lastMessageSnippet: string | null;
        contactPhone: string;
        contactPushName: string | null;
        windowExpiresAt: Date | null;
        isWindowOpen: boolean;
        lastMessageDirection: import("@prisma/working-client").$Enums.WaMessageDirection | null;
    }>;
}
