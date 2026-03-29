// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteTargetCommand } from './delete-target.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(DeleteTargetCommand)
export class DeleteTargetHandler implements ICommandHandler<DeleteTargetCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: DeleteTargetCommand) {
    return this.prisma.working.salesTarget.update({
      where: { id: cmd.id },
      data: { isDeleted: true, isActive: false },
    });
  }
}
