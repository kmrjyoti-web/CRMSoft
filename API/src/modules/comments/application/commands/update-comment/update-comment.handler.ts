import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCommentCommand } from './update-comment.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const DEFAULT_EDIT_WINDOW_MINUTES = 30;

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler implements ICommandHandler<UpdateCommentCommand> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch the COMMENT_EDIT_WINDOW_MINUTES config from task_logic_configs.
   * Falls back to the default (30 minutes) if no row exists.
   */
  private async getEditWindowMinutes(tenantId: string): Promise<number> {
    const config = await this.prisma.taskLogicConfig.findFirst({
      where: {
        tenantId,
        configKey: 'COMMENT_EDIT_WINDOW_MINUTES',
        isActive: true,
      },
    });

    if (config?.value != null) {
      // value is Json — could be a raw number or { "minutes": N }
      const val = config.value as any;
      const minutes = typeof val === 'number' ? val : val?.minutes;
      if (typeof minutes === 'number' && minutes > 0) return minutes;
    }

    return DEFAULT_EDIT_WINDOW_MINUTES;
  }

  async execute(cmd: UpdateCommentCommand) {
    const comment = await this.prisma.comment.findUnique({ where: { id: cmd.commentId } });
    if (!comment || !comment.isActive) throw new NotFoundException('Comment not found');
    if (comment.authorId !== cmd.userId) throw new ForbiddenException('Only the author can edit a comment');

    // Enforce edit time window for non-admin users (roleLevel > 1)
    const isAdmin = cmd.roleLevel <= 1;
    if (!isAdmin) {
      const windowMinutes = await this.getEditWindowMinutes(comment.tenantId);
      const cutoff = new Date(comment.createdAt.getTime() + windowMinutes * 60 * 1000);

      if (new Date() > cutoff) {
        throw new ForbiddenException('Edit window has expired');
      }
    }

    return this.prisma.comment.update({
      where: { id: cmd.commentId },
      data: {
        content: cmd.content,
        isEdited: true,
        editedAt: new Date(),
      },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    });
  }
}
