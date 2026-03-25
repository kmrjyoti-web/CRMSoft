import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DeleteMenuCategoryCommand } from './delete-menu-category.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(DeleteMenuCategoryCommand)
export class DeleteMenuCategoryHandler implements ICommandHandler<DeleteMenuCategoryCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteMenuCategoryCommand) {
    const { id } = command;

    const category = await this.prisma.identity.customerMenuCategory.findFirst({
      where: { id, isDeleted: false },
      include: { _count: { select: { users: { where: { isDeleted: false } } } } },
    });
    if (!category) throw new NotFoundException('Menu category not found');

    if (category._count.users > 0) {
      throw new BadRequestException(
        `Cannot delete: ${category._count.users} portal user(s) are assigned to this category. Reassign them first.`,
      );
    }

    await this.prisma.identity.customerMenuCategory.update({
      where: { id },
      data: { isDeleted: true },
    });

    return { message: 'Menu category deleted' };
  }
}
