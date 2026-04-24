// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { DeleteSavedFilterCommand } from './delete-saved-filter.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(DeleteSavedFilterCommand)
export class DeleteSavedFilterHandler implements ICommandHandler<DeleteSavedFilterCommand> {
    private readonly logger = new Logger(DeleteSavedFilterHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: DeleteSavedFilterCommand) {
    try {
      const existing = await this.prisma.working.savedFilter.findFirst({ where: { id: cmd.id, isDeleted: false } });
      if (!existing) throw new NotFoundException('SavedFilter not found');
      return this.prisma.working.savedFilter.update({
        where: { id: cmd.id },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    } catch (error) {
      this.logger.error(`DeleteSavedFilterHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
