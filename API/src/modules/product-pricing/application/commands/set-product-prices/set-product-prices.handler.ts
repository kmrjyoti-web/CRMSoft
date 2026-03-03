import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { SetProductPricesCommand } from './set-product-prices.command';

@CommandHandler(SetProductPricesCommand)
export class SetProductPricesHandler
  implements ICommandHandler<SetProductPricesCommand>
{
  private readonly logger = new Logger(SetProductPricesHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: SetProductPricesCommand) {
    const { productId, prices } = command;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException(`Product "${productId}" not found`);
    }

    const upserted: any[] = [];

    for (const p of prices) {
      const existing = await this.prisma.productPrice.findFirst({
        where: {
          productId,
          priceType: p.priceType as any,
          priceGroupId: p.priceGroupId ?? null,
          minQty: p.minQty ?? null,
        },
      });

      const record = existing
        ? await this.prisma.productPrice.update({
            where: { id: existing.id },
            data: {
              amount: p.amount,
              validFrom: p.validFrom ? new Date(p.validFrom) : null,
              validTo: p.validTo ? new Date(p.validTo) : null,
              maxQty: p.maxQty ?? null,
              isActive: true,
            },
          })
        : await this.prisma.productPrice.create({
            data: {
              productId,
              priceType: p.priceType as any,
              amount: p.amount,
              priceGroupId: p.priceGroupId || null,
              minQty: p.minQty ?? null,
              maxQty: p.maxQty ?? null,
              validFrom: p.validFrom ? new Date(p.validFrom) : null,
              validTo: p.validTo ? new Date(p.validTo) : null,
            },
          });
      upserted.push(record);
    }

    this.logger.log(
      `Set ${upserted.length} price(s) for product ${productId}`,
    );

    return { productId, pricesSet: upserted.length };
  }
}
