import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteTargetCommand } from './delete-target.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteTargetCommand)
export class DeleteTargetHandler implements ICommandHandler<DeleteTargetCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteTargetCommand) {
    const target = await this.prisma.salesTarget.findUnique({ where: { id: command.id } });
    if (!target) throw new NotFoundException('Target not found');

    await this.prisma.salesTarget.update({
      where: { id: command.id },
      data: { isActive: false },
    });
    return { deleted: true };
  }
}
