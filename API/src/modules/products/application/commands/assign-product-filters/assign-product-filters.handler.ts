import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { AssignProductFiltersCommand } from './assign-product-filters.command';

@CommandHandler(AssignProductFiltersCommand)
export class AssignProductFiltersHandler
  implements ICommandHandler<AssignProductFiltersCommand>
{
  private readonly logger = new Logger(AssignProductFiltersHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: AssignProductFiltersCommand) {
    const { productId, lookupValueIds } = command;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product "${productId}" not found`);
    }

    // Delete all existing filters for this product
    await this.prisma.productFilter.deleteMany({
      where: { productId },
    });

    // Create new filter associations
    if (lookupValueIds.length > 0) {
      await this.prisma.productFilter.createMany({
        data: lookupValueIds.map((lookupValueId) => ({
          productId,
          lookupValueId,
        })),
        skipDuplicates: true,
      });
    }

    this.logger.log(
      `Product filters assigned: ${productId} (${lookupValueIds.length} filters)`,
    );

    return this.prisma.productFilter.findMany({
      where: { productId },
      include: {
        lookupValue: { select: { id: true, value: true, label: true } },
      },
    });
  }
}
