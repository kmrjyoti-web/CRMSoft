// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { RemovePriceListItemCommand } from './remove-price-list-item.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(RemovePriceListItemCommand)
export class RemovePriceListItemHandler implements ICommandHandler<RemovePriceListItemCommand> {
    private readonly logger = new Logger(RemovePriceListItemHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: RemovePriceListItemCommand) {
    try {
      const existing = await this.prisma.working.priceListItem.findUnique({
        where: { id: cmd.itemId },
      });
      if (!existing) throw new NotFoundException('PriceListItem not found');

      await this.prisma.working.priceListItem.delete({ where: { id: cmd.itemId } });

      return { id: cmd.itemId, deleted: true };
    } catch (error) {
      this.logger.error(`RemovePriceListItemHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
