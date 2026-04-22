// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { UpdatePriceListItemCommand } from './update-price-list-item.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdatePriceListItemCommand)
export class UpdatePriceListItemHandler implements ICommandHandler<UpdatePriceListItemCommand> {
    private readonly logger = new Logger(UpdatePriceListItemHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdatePriceListItemCommand) {
    try {
      const existing = await this.prisma.working.priceListItem.findUnique({
        where: { id: cmd.itemId },
      });
      if (!existing) throw new NotFoundException('PriceListItem not found');

      const { dto } = cmd;
      return this.prisma.working.priceListItem.update({
        where: { id: cmd.itemId },
        data: {
          ...(dto.sellingPrice !== undefined && { sellingPrice: dto.sellingPrice }),
          ...(dto.minQuantity !== undefined && { minQuantity: dto.minQuantity }),
          ...(dto.maxQuantity !== undefined && { maxQuantity: dto.maxQuantity }),
          ...(dto.marginPercent !== undefined && { marginPercent: dto.marginPercent }),
        },
      });
    } catch (error) {
      this.logger.error(`UpdatePriceListItemHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
