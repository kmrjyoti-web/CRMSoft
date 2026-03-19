import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteCommentCommand } from './delete-comment.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler implements ICommandHandler<DeleteCommentCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: DeleteCommentCommand) {
    const comment = await this.prisma.working.comment.findUnique({ where: { id: cmd.commentId } });
    if (!comment || !comment.isActive) throw new NotFoundException('Comment not found');

    // Only author or admin can delete
    if (comment.authorId !== cmd.userId && cmd.userRoleLevel > 1) {
      throw new ForbiddenException('Only the author or an admin can delete a comment');
    }

    return this.prisma.working.comment.update({
      where: { id: cmd.commentId },
      data: { isActive: false },
    });
  }
}
