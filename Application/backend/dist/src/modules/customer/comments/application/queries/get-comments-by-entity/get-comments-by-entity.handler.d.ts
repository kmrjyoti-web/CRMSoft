import { IQueryHandler } from '@nestjs/cqrs';
import { GetCommentsByEntityQuery } from './get-comments-by-entity.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CommentVisibilityService } from '../../services/comment-visibility.service';
export declare class GetCommentsByEntityHandler implements IQueryHandler<GetCommentsByEntityQuery> {
    private readonly prisma;
    private readonly visibilityService;
    private readonly logger;
    constructor(prisma: PrismaService, visibilityService: CommentVisibilityService);
    execute(query: GetCommentsByEntityQuery): Promise<{
        data: {
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
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
