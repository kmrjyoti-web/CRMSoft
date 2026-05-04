// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreatePriceListCommand } from './create-price-list.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CreatePriceListCommand)
export class CreatePriceListHandler implements ICommandHandler<CreatePriceListCommand> {
    private readonly logger = new Logger(CreatePriceListHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreatePriceListCommand) {
    try {
      const { dto, createdById } = cmd;
      return this.prisma.working.priceList.create({
        data: {
          name: dto.name,
          description: dto.description,
          currency: dto.currency ?? 'INR',
          validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
          validTo: dto.validTo ? new Date(dto.validTo) : undefined,
          isActive: dto.isActive ?? true,
          priority: dto.priority ?? 0,
          createdById,
        },
      });
    } catch (error) {
      this.logger.error(`CreatePriceListHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
