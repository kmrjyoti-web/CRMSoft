import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateListingCommand } from './update-listing.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@CommandHandler(UpdateListingCommand)
@Injectable()
export class UpdateListingHandler implements ICommandHandler<UpdateListingCommand> {
  private readonly logger = new Logger(UpdateListingHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(command: UpdateListingCommand): Promise<void> {
    try {
      const existing = await this.mktPrisma.client.mktListing.findFirst({
        where: { id: command.id, tenantId: command.tenantId, isDeleted: false },
      });
      if (!existing) {
        throw new NotFoundException(`Listing ${command.id} not found`);
      }

      const updateData: Record<string, any> = { updatedById: command.updatedById };

      if (command.title !== undefined) updateData.title = command.title;
      if (command.description !== undefined) updateData.description = command.description;
      if (command.shortDescription !== undefined) updateData.shortDescription = command.shortDescription;
      if (command.categoryId !== undefined) updateData.categoryId = command.categoryId;
      if (command.subcategoryId !== undefined) updateData.subcategoryId = command.subcategoryId;
      if (command.mediaUrls !== undefined) updateData.mediaUrls = command.mediaUrls;
      if (command.basePrice !== undefined) updateData.basePrice = command.basePrice;
      if (command.mrp !== undefined) updateData.mrp = command.mrp;
      if (command.minOrderQty !== undefined) updateData.minOrderQty = command.minOrderQty;
      if (command.maxOrderQty !== undefined) updateData.maxOrderQty = command.maxOrderQty;
      if (command.hsnCode !== undefined) updateData.hsnCode = command.hsnCode;
      if (command.gstRate !== undefined) updateData.gstRate = command.gstRate;
      if (command.stockAvailable !== undefined) updateData.stockAvailable = command.stockAvailable;
      if (command.visibility !== undefined) updateData.visibility = command.visibility;
      if (command.visibilityConfig !== undefined) updateData.visibilityConfig = command.visibilityConfig;
      if (command.publishAt !== undefined) updateData.publishAt = command.publishAt;
      if (command.expiresAt !== undefined) updateData.expiresAt = command.expiresAt;
      if (command.attributes !== undefined) updateData.attributes = command.attributes;
      if (command.keywords !== undefined) updateData.keywords = command.keywords;
      if (command.shippingConfig !== undefined) updateData.shippingConfig = command.shippingConfig;
      if (command.requirementConfig !== undefined) updateData.requirementConfig = command.requirementConfig;

      await this.mktPrisma.client.mktListing.update({
        where: { id: command.id },
        data: updateData,
      });

      this.logger.log(`Listing updated: ${command.id}`);
    } catch (error) {
      this.logger.error(`UpdateListingHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
