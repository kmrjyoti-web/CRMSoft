// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddPriceListItemCommand } from './add-price-list-item.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(AddPriceListItemCommand)
export class AddPriceListItemHandler implements ICommandHandler<AddPriceListItemCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: AddPriceListItemCommand) {
    const { priceListId, dto } = cmd;
    const minQty = dto.minQuantity ?? 1;

    return this.prisma.working.priceListItem.upsert({
      where: {
        priceListId_productId_minQuantity: {
          priceListId,
          productId: dto.productId,
          minQuantity: minQty,
        },
      },
      create: {
        priceListId,
        productId: dto.productId,
        sellingPrice: dto.sellingPrice,
        minQuantity: minQty,
        maxQuantity: dto.maxQuantity,
        marginPercent: dto.marginPercent,
      },
      update: {
        sellingPrice: dto.sellingPrice,
        maxQuantity: dto.maxQuantity,
        marginPercent: dto.marginPercent,
      },
    });
  }
}
