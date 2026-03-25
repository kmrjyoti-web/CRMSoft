import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateMenuCategoryCommand } from './update-menu-category.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateMenuCategoryCommand)
export class UpdateMenuCategoryHandler implements ICommandHandler<UpdateMenuCategoryCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateMenuCategoryCommand) {
    const { id, updates } = command;

    const existing = await this.prisma.identity.customerMenuCategory.findFirst({
      where: { id, isDeleted: false },
    });
    if (!existing) throw new NotFoundException('Menu category not found');

    if (updates.isDefault) {
      await this.prisma.identity.customerMenuCategory.updateMany({
        where: { tenantId: existing.tenantId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.identity.customerMenuCategory.update({
      where: { id },
      data: {
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.nameHi !== undefined ? { nameHi: updates.nameHi } : {}),
        ...(updates.description !== undefined ? { description: updates.description } : {}),
        ...(updates.icon !== undefined ? { icon: updates.icon } : {}),
        ...(updates.color !== undefined ? { color: updates.color } : {}),
        ...(updates.enabledRoutes !== undefined ? { enabledRoutes: updates.enabledRoutes } : {}),
        ...(updates.isDefault !== undefined ? { isDefault: updates.isDefault } : {}),
        ...(updates.isActive !== undefined ? { isActive: updates.isActive } : {}),
        ...(updates.sortOrder !== undefined ? { sortOrder: updates.sortOrder } : {}),
      },
    });
  }
}
