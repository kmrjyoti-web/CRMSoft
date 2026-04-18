import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteCommentCommand } from './delete-comment.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class DeleteCommentHandler implements ICommandHandler<DeleteCommentCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: DeleteCommentCommand): Promise<{
        id: string;
        tenantId: string;
        entityType: import("@prisma/working-client").$Enums.CommentEntityType;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        parentId: string | null;
        taskId: string | null;
        entityId: string;
        content: string;
        attachments: import("@prisma/working-client/runtime/library").JsonValue | null;
        visibility: import("@prisma/working-client").$Enums.CommentVisibility;
        mentionedUserIds: import("@prisma/working-client/runtime/library").JsonValue | null;
        authorId: string;
        createdByRole: string | null;
        isEdited: boolean;
        editedAt: Date | null;
    }>;
}
