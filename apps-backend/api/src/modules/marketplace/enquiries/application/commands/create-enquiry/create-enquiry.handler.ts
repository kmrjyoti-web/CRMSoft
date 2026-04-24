import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateEnquiryCommand } from './create-enquiry.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@CommandHandler(CreateEnquiryCommand)
@Injectable()
export class CreateEnquiryHandler implements ICommandHandler<CreateEnquiryCommand> {
  private readonly logger = new Logger(CreateEnquiryHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(command: CreateEnquiryCommand): Promise<string> {
    try {
      // Verify listing exists and is active
      const listing = await this.mktPrisma.client.mktListing.findFirst({
        where: { id: command.listingId, tenantId: command.tenantId, isDeleted: false, status: 'ACTIVE' },
      });
      if (!listing) {
        throw new NotFoundException(`Active listing ${command.listingId} not found`);
      }

      const id = randomUUID();
      const enquiry = await this.mktPrisma.client.mktEnquiry.create({
        data: {
          id,
          tenantId: command.tenantId,
          listingId: command.listingId,
          enquirerId: command.enquirerId,
          message: command.message,
          quantity: command.quantity,
          expectedPrice: command.expectedPrice,
          deliveryPincode: command.deliveryPincode,
          status: 'OPEN',
        },
      });

      // Increment enquiry counter on listing
      await this.mktPrisma.client.mktListing.update({
        where: { id: command.listingId },
        data: { enquiryCount: { increment: 1 } },
      });

      this.logger.log(`Enquiry ${id} created for listing ${command.listingId}`);
      return enquiry.id;
    } catch (error) {
      this.logger.error(`CreateEnquiryHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
