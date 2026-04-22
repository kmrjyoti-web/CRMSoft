import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { SendQuotationCommand } from './send-quotation.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(SendQuotationCommand)
export class SendQuotationHandler implements ICommandHandler<SendQuotationCommand> {
    private readonly logger = new Logger(SendQuotationHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: SendQuotationCommand) {
    try {
      const quotation = await this.prisma.working.quotation.findUnique({
        where: { id: cmd.id },
        include: { lead: { include: { organization: true, contact: true } } },
      });
      if (!quotation) throw new NotFoundException('Quotation not found');
      if (!['DRAFT', 'INTERNAL_REVIEW'].includes(quotation.status)) {
        throw new BadRequestException(`Cannot send quotation with status ${quotation.status}`);
      }

      // Update status to SENT
      await this.prisma.working.quotation.update({
        where: { id: cmd.id },
        data: { status: 'SENT' },
      });

      // Resolve receiver info
      let receiverName = cmd.receiverEmail;
      let receiverEmail = cmd.receiverEmail;
      let receiverPhone = cmd.receiverPhone;
      let orgName: string | null = null;
      let orgId: string | null = null;

      if (cmd.receiverContactId) {
        const contact = await this.prisma.working.contact.findUnique({
          where: { id: cmd.receiverContactId },
          select: { firstName: true, lastName: true },
        });
        if (contact) receiverName = `${contact.firstName} ${contact.lastName}`;
      }
      if (quotation.lead?.organization) {
        orgName = quotation.lead.organization.name;
        orgId = quotation.lead.organization.id;
      }

      // Create send log with snapshot
      const sendLog = await this.prisma.working.quotationSendLog.create({
        data: {
          quotationId: cmd.id,
          sentAt: new Date(),
          sentById: cmd.userId,
          sentByName: cmd.userName,
          channel: cmd.channel as any,
          receiverContactId: cmd.receiverContactId,
          receiverName, receiverEmail, receiverPhone,
          organizationId: orgId, organizationName: orgName,
          quotationValue: quotation.totalAmount,
          priceType: quotation.priceType,
          minValue: quotation.minAmount,
          maxValue: quotation.maxAmount,
          plusMinusPercent: quotation.plusMinusPercent,
          message: cmd.message,
        },
      });

      await this.prisma.working.quotationActivity.create({
        data: {
          quotationId: cmd.id, action: 'SENT',
          description: `Quotation sent via ${cmd.channel} to ${receiverName || 'customer'}`,
          previousValue: quotation.status, newValue: 'SENT', changedField: 'status',
          performedById: cmd.userId, performedByName: cmd.userName,
        },
      });

      return sendLog;
    } catch (error) {
      this.logger.error(`SendQuotationHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
