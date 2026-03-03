import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { DeactivateProductCommand } from './deactivate-product.command';

@CommandHandler(DeactivateProductCommand)
export class DeactivateProductHandler
  implements ICommandHandler<DeactivateProductCommand>
{
  private readonly logger = new Logger(DeactivateProductHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeactivateProductCommand) {
    const { id } = command;

    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product "${id}" not found`);
    }

    // Deactivate the product
    await this.prisma.product.update({
      where: { id },
      data: { isActive: false, status: 'INACTIVE' },
    });

    // Cascade deactivation to children
    await this.prisma.product.updateMany({
      where: { parentId: id },
      data: { isActive: false, status: 'INACTIVE' },
    });

    this.logger.log(`Product deactivated (with children): ${id}`);
    return { id, deactivated: true };
  }
}
