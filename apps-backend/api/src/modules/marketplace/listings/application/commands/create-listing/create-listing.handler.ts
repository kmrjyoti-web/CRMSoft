import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateListingCommand } from './create-listing.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@CommandHandler(CreateListingCommand)
@Injectable()
export class CreateListingHandler implements ICommandHandler<CreateListingCommand> {
  private readonly logger = new Logger(CreateListingHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(command: CreateListingCommand): Promise<string> {
    try {
      const id = randomUUID();

      const listing = await this.mktPrisma.client.mktListing.create({
        data: {
          id,
          tenantId: command.tenantId,
          authorId: command.authorId,
          listingType: command.listingType as any,
          title: command.title,
          description: command.description,
          shortDescription: command.shortDescription,
          categoryId: command.categoryId,
          subcategoryId: command.subcategoryId,
          mediaUrls: command.mediaUrls ?? [] as any,
          currency: command.currency ?? 'INR',
          basePrice: command.basePrice ?? 0,
          mrp: command.mrp,
          minOrderQty: command.minOrderQty ?? 1,
          maxOrderQty: command.maxOrderQty,
          hsnCode: command.hsnCode,
          gstRate: command.gstRate,
          trackInventory: command.trackInventory !== false,
          stockAvailable: command.stockAvailable ?? 0,
          visibility: (command.visibility as any) ?? 'PUBLIC',
          visibilityConfig: command.visibilityConfig as any,
          publishAt: command.publishAt,
          expiresAt: command.expiresAt,
          attributes: command.attributes ?? {},
          keywords: command.keywords ?? [],
          shippingConfig: command.shippingConfig as any,
          requirementConfig: command.requirementConfig as any,
          createdById: command.createdById,
          status: command.publishAt && command.publishAt > new Date() ? 'SCHEDULED' : 'DRAFT',
          priceTiers: command.priceTiers?.length
            ? {
                create: command.priceTiers.map((tier) => ({
                  id: randomUUID(),
                  label: tier.label,
                  minQty: tier.minQty,
                  maxQty: tier.maxQty,
                  pricePerUnit: tier.pricePerUnit,
                  requiresVerification: tier.requiresVerification ?? false,
                })),
              }
            : undefined,
        },
      });

      this.logger.log(`Listing created: ${listing.id} (${listing.title}) by tenant ${command.tenantId}`);
      return listing.id;
    } catch (error) {
      this.logger.error(`CreateListingHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
