import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { SetSlabPriceCommand } from './set-slab-price.command';

@CommandHandler(SetSlabPriceCommand)
export class SetSlabPriceHandler
  implements ICommandHandler<SetSlabPriceCommand>
{
  private readonly logger = new Logger(SetSlabPriceHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: SetSlabPriceCommand) {
    const { productId, priceType, slabs } = command;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException(`Product "${productId}" not found`);
    }

    this.validateSlabsNoOverlap(slabs);

    // Delete existing slabs for this priceType (ones with minQty set)
    await this.prisma.productPrice.deleteMany({
      where: {
        productId,
        priceType: priceType as any,
        priceGroupId: null,
        minQty: { not: null },
      },
    });

    // Create new slabs
    const created = await this.prisma.productPrice.createMany({
      data: slabs.map((slab) => ({
        productId,
        priceType: priceType as any,
        amount: slab.amount,
        minQty: slab.minQty,
        maxQty: slab.maxQty ?? null,
      })),
    });

    this.logger.log(
      `Set ${created.count} slab prices for product ` +
        `${productId}, type=${priceType}`,
    );

    return { productId, priceType, slabCount: created.count };
  }

  private validateSlabsNoOverlap(
    slabs: { minQty: number; maxQty?: number; amount: number }[],
  ) {
    if (slabs.length === 0) {
      throw new BadRequestException('At least one slab is required');
    }

    const sorted = [...slabs].sort((a, b) => a.minQty - b.minQty);

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      if (current.maxQty == null) {
        throw new BadRequestException(
          'Only the last slab can have an open-ended maxQty (null). ' +
            `Slab at minQty=${current.minQty} is not the last slab.`,
        );
      }

      if (current.maxQty >= next.minQty) {
        throw new BadRequestException(
          `Slab overlap: [${current.minQty}-${current.maxQty}] ` +
            `overlaps with [${next.minQty}-${next.maxQty ?? 'inf'}]`,
        );
      }
    }
  }
}
