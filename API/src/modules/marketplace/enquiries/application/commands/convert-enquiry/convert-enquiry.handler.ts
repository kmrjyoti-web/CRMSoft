import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConvertEnquiryCommand } from './convert-enquiry.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@CommandHandler(ConvertEnquiryCommand)
@Injectable()
export class ConvertEnquiryHandler implements ICommandHandler<ConvertEnquiryCommand> {
  private readonly logger = new Logger(ConvertEnquiryHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(command: ConvertEnquiryCommand): Promise<void> {
    const enquiry = await this.mktPrisma.client.mktEnquiry.findFirst({
      where: { id: command.enquiryId, tenantId: command.tenantId, isDeleted: false },
    });

    if (!enquiry) throw new NotFoundException(`Enquiry ${command.enquiryId} not found`);

    await this.mktPrisma.client.mktEnquiry.update({
      where: { id: command.enquiryId },
      data: {
        status: 'CONVERTED',
        crmLeadId: command.crmLeadId,
      },
    });

    this.logger.log(
      `Enquiry ${command.enquiryId} converted to CRM lead ${command.crmLeadId ?? 'N/A'}`,
    );
  }
}
