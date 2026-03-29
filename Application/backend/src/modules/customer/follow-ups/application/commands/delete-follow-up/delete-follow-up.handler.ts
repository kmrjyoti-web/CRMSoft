import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DeleteFollowUpCommand } from './delete-follow-up.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(DeleteFollowUpCommand)
export class DeleteFollowUpHandler implements ICommandHandler<DeleteFollowUpCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: DeleteFollowUpCommand) {
    const existing = await this.prisma.working.followUp.findUnique({ where: { id: cmd.id } });
    if (!existing) throw new NotFoundException('Follow-up not found');

    await this.prisma.working.followUp.update({
      where: { id: cmd.id },
      data: { isActive: false },
    });

    return { id: cmd.id, deleted: true };
  }
}
