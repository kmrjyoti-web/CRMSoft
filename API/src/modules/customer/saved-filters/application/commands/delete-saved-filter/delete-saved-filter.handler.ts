// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DeleteSavedFilterCommand } from './delete-saved-filter.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(DeleteSavedFilterCommand)
export class DeleteSavedFilterHandler implements ICommandHandler<DeleteSavedFilterCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: DeleteSavedFilterCommand) {
    const existing = await this.prisma.working.savedFilter.findFirst({ where: { id: cmd.id, isDeleted: false } });
    if (!existing) throw new NotFoundException('SavedFilter not found');
    return this.prisma.working.savedFilter.update({
      where: { id: cmd.id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }
}
