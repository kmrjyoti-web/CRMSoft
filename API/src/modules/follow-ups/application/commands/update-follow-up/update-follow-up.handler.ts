import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateFollowUpCommand } from './update-follow-up.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateFollowUpCommand)
export class UpdateFollowUpHandler implements ICommandHandler<UpdateFollowUpCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateFollowUpCommand) {
    const existing = await this.prisma.followUp.findUnique({ where: { id: cmd.id } });
    if (!existing) throw new NotFoundException('Follow-up not found');

    return this.prisma.followUp.update({
      where: { id: cmd.id },
      data: cmd.data as any,
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}
