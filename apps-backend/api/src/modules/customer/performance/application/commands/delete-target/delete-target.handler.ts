// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DeleteTargetCommand } from './delete-target.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(DeleteTargetCommand)
export class DeleteTargetHandler implements ICommandHandler<DeleteTargetCommand> {
    private readonly logger = new Logger(DeleteTargetHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: DeleteTargetCommand) {
    try {
      return this.prisma.working.salesTarget.update({
        where: { id: cmd.id },
        data: { isDeleted: true, isActive: false },
      });
    } catch (error) {
      this.logger.error(`DeleteTargetHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
