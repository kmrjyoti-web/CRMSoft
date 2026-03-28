// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdatePriceListCommand } from './update-price-list.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdatePriceListCommand)
export class UpdatePriceListHandler implements ICommandHandler<UpdatePriceListCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdatePriceListCommand) {
    const existing = await this.prisma.working.priceList.findFirst({
      where: { id: cmd.id, isDeleted: false },
    });
    if (!existing) throw new NotFoundException('PriceList not found');

    const { dto } = cmd;
    return this.prisma.working.priceList.update({
      where: { id: cmd.id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.validFrom !== undefined && { validFrom: dto.validFrom ? new Date(dto.validFrom) : null }),
        ...(dto.validTo !== undefined && { validTo: dto.validTo ? new Date(dto.validTo) : null }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
      },
    });
  }
}
