// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DeletePriceListCommand } from './delete-price-list.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(DeletePriceListCommand)
export class DeletePriceListHandler implements ICommandHandler<DeletePriceListCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: DeletePriceListCommand) {
    const existing = await this.prisma.working.priceList.findFirst({
      where: { id: cmd.id, isDeleted: false },
    });
    if (!existing) throw new NotFoundException('PriceList not found');

    await this.prisma.working.priceList.update({
      where: { id: cmd.id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return { id: cmd.id, deleted: true };
  }
}
