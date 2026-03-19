import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { ManageProductImagesCommand } from './manage-product-images.command';

@CommandHandler(ManageProductImagesCommand)
export class ManageProductImagesHandler
  implements ICommandHandler<ManageProductImagesCommand>
{
  private readonly logger = new Logger(ManageProductImagesHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ManageProductImagesCommand) {
    const { productId, images } = command;

    const product = await this.prisma.working.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product "${productId}" not found`);
    }

    const updated = await this.prisma.working.product.update({
      where: { id: productId },
      data: { images: images as any },
    });

    this.logger.log(`Product images updated: ${productId}`);
    return updated;
  }
}
