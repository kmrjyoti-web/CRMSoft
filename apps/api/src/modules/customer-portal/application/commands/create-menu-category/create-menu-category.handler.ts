import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException } from '@nestjs/common';
import { CreateMenuCategoryCommand } from './create-menu-category.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(CreateMenuCategoryCommand)
export class CreateMenuCategoryHandler implements ICommandHandler<CreateMenuCategoryCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateMenuCategoryCommand) {
    const {
      tenantId, adminId, name, enabledRoutes, nameHi,
      description, icon, color, isDefault, sortOrder,
    } = command;

    // If setting as default, unset existing default first
    if (isDefault) {
      await this.prisma.identity.customerMenuCategory.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false },
      });
    }

    try {
      const category = await this.prisma.identity.customerMenuCategory.create({
        data: {
          tenantId,
          name,
          nameHi: nameHi ?? null,
          description: description ?? null,
          icon: icon ?? null,
          color: color ?? null,
          enabledRoutes,
          isDefault: isDefault ?? false,
          sortOrder: sortOrder ?? 0,
          createdById: adminId,
        },
      });
      return category;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Unique constraint')) {
        throw new ConflictException(`A menu category named "${name}" already exists`);
      }
      throw err;
    }
  }
}
