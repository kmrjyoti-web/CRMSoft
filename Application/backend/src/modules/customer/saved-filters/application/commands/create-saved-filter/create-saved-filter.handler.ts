// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSavedFilterCommand } from './create-saved-filter.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CreateSavedFilterCommand)
export class CreateSavedFilterHandler implements ICommandHandler<CreateSavedFilterCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateSavedFilterCommand) {
    // If isDefault, unset any existing default for this entityType+user
    if (cmd.isDefault) {
      await this.prisma.working.savedFilter.updateMany({
        where: { createdById: cmd.createdById, entityType: cmd.entityType, isDefault: true, isDeleted: false },
        data: { isDefault: false },
      });
    }
    return this.prisma.working.savedFilter.create({
      data: {
        name: cmd.name,
        entityType: cmd.entityType,
        filterConfig: cmd.filterConfig,
        description: cmd.description,
        isDefault: cmd.isDefault ?? false,
        isShared: cmd.isShared ?? false,
        sharedWithRoles: cmd.sharedWithRoles ?? [],
        createdById: cmd.createdById,
      },
    });
  }
}
