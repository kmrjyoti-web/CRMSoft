import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { LinkProductsCommand } from './link-products.command';

const BIDIRECTIONAL_TYPES = ['VARIANT', 'SUBSTITUTE'];

@CommandHandler(LinkProductsCommand)
export class LinkProductsHandler implements ICommandHandler<LinkProductsCommand> {
  private readonly logger = new Logger(LinkProductsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: LinkProductsCommand) {
    const { fromProductId, toProductId, relationType } = command;

    if (fromProductId === toProductId) {
      throw new BadRequestException('Cannot link a product to itself');
    }

    // Upsert the forward relation
    const existingForward = await this.prisma.productRelation.findFirst({
      where: { fromProductId, toProductId, relationType },
    });
    let relation;
    if (existingForward) {
      relation = await this.prisma.productRelation.update({
        where: { id: existingForward.id },
        data: { isActive: true },
      });
    } else {
      relation = await this.prisma.productRelation.create({
        data: { fromProductId, toProductId, relationType },
      });
    }

    // For VARIANT and SUBSTITUTE, create reverse (bidirectional)
    if (BIDIRECTIONAL_TYPES.includes(relationType)) {
      const existingReverse = await this.prisma.productRelation.findFirst({
        where: {
          fromProductId: toProductId,
          toProductId: fromProductId,
          relationType,
        },
      });
      if (existingReverse) {
        await this.prisma.productRelation.update({
          where: { id: existingReverse.id },
          data: { isActive: true },
        });
      } else {
        await this.prisma.productRelation.create({
          data: {
            fromProductId: toProductId,
            toProductId: fromProductId,
            relationType,
          },
        });
      }
    }

    this.logger.log(
      `Product relation created: ${fromProductId} -> ${toProductId} (${relationType})`,
    );
    return relation;
  }
}
