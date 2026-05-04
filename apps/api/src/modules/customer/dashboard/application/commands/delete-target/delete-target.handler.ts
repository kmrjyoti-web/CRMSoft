import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteTargetCommand } from './delete-target.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { NotFoundException, Logger } from '@nestjs/common';

@CommandHandler(DeleteTargetCommand)
export class DeleteTargetHandler implements ICommandHandler<DeleteTargetCommand> {
    private readonly logger = new Logger(DeleteTargetHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteTargetCommand) {
    try {
      const target = await this.prisma.working.salesTarget.findUnique({ where: { id: command.id } });
      if (!target) throw new NotFoundException('Target not found');

      await this.prisma.working.salesTarget.update({
        where: { id: command.id },
        data: { isActive: false },
      });
      return { deleted: true };
    } catch (error) {
      this.logger.error(`DeleteTargetHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
