import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { SetGroupPriceCommand } from './set-group-price.command';

@CommandHandler(SetGroupPriceCommand)
export class SetGroupPriceHandler
  implements ICommandHandler<SetGroupPriceCommand>
{
  private readonly logger = new Logger(SetGroupPriceHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: SetGroupPriceCommand) {
    const { productId, priceGroupId, priceType, amount } = command;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException(`Product "${productId}" not found`);
    }

    const group = await this.prisma.customerPriceGroup.findUnique({
      where: { id: priceGroupId },
      select: { id: true, name: true },
    });
    if (!group) {
      throw new NotFoundException(
        `Price group "${priceGroupId}" not found`,
      );
    }

    const existing = await this.prisma.productPrice.findFirst({
      where: {
        productId,
        priceType: priceType as any,
        priceGroupId,
        OR: [{ minQty: null }, { minQty: 0 }],
      },
    });

    let price;
    if (existing) {
      price = await this.prisma.productPrice.update({
        where: { id: existing.id },
        data: { amount, isActive: true },
      });
    } else {
      price = await this.prisma.productPrice.create({
        data: {
          productId,
          priceType: priceType as any,
          priceGroupId,
          amount,
        },
      });
    }

    this.logger.log(
      `Set group price: product=${productId}, ` +
        `group=${group.name}, type=${priceType}, amount=${amount}`,
    );

    return price;
  }
}
