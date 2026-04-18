import { ICommandHandler } from '@nestjs/cqrs';
import { AssignConversationCommand } from './assign-conversation.command';
import { WaConversationService } from '../../../services/wa-conversation.service';
export declare class AssignConversationHandler implements ICommandHandler<AssignConversationCommand> {
    private readonly conversationService;
    private readonly logger;
    constructor(conversationService: WaConversationService);
    execute(cmd: AssignConversationCommand): Promise<{
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
