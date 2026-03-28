// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateSavedFilterCommand } from './update-saved-filter.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateSavedFilterCommand)
export class UpdateSavedFilterHandler implements ICommandHandler<UpdateSavedFilterCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateSavedFilterCommand) {
    const existing = await this.prisma.working.savedFilter.findFirst({ where: { id: cmd.id, isDeleted: false } });
    if (!existing) throw new NotFoundException('SavedFilter not found');
    if (cmd.data.isDefault) {
      await this.prisma.working.savedFilter.updateMany({
        where: {
          createdById: cmd.userId,
          entityType: existing.entityType,
          isDefault: true,
          isDeleted: false,
          id: { not: cmd.id },
        },
        data: { isDefault: false },
      });
    }
    return this.prisma.working.savedFilter.update({ where: { id: cmd.id }, data: cmd.data as any });
  }
}
