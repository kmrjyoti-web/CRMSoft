import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentCommand } from './create-comment.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { CommentVisibilityService } from '../../services/comment-visibility.service';

@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler implements ICommandHandler<CreateCommentCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly visibilityService: CommentVisibilityService,
  ) {}

  /**
   * Derive a human-readable role label from the numeric roleLevel.
   * 0-1 = ADMIN, 2-3 = MANAGER, 4+ = USER
   */
  private deriveRoleLabel(roleLevel: number): string {
    if (roleLevel <= 1) return 'ADMIN';
    if (roleLevel <= 3) return 'MANAGER';
    return 'USER';
  }

  async execute(cmd: CreateCommentCommand) {
    const visibility = cmd.visibility || 'PUBLIC';

    // Validate RBAC for private comments
    if (visibility === 'PRIVATE') {
      this.visibilityService.validateCanMarkPrivate(cmd.authorRoleLevel);
    }

    const createdByRole = this.deriveRoleLabel(cmd.authorRoleLevel);

    return this.prisma.comment.create({
      data: {
        tenantId: cmd.tenantId,
        entityType: cmd.entityType as any,
        entityId: cmd.entityId,
        content: cmd.content,
        visibility: visibility as any,
        authorId: cmd.authorId,
        createdByRole,
        parentId: cmd.parentId,
        taskId: cmd.taskId,
        mentionedUserIds: cmd.mentionedUserIds ?? undefined,
        attachments: cmd.attachments ?? undefined,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}
