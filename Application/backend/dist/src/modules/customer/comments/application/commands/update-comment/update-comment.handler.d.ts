import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateCommentCommand } from './update-comment.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class UpdateCommentHandler implements ICommandHandler<UpdateCommentCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private getEditWindowMinutes;
    execute(cmd: UpdateCommentCommand): Promise<{
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
