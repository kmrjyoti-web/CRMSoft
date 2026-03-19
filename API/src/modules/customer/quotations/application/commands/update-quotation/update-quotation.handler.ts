import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateQuotationCommand } from './update-quotation.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { QuotationCalculatorService } from '../../../services/quotation-calculator.service';

@CommandHandler(UpdateQuotationCommand)
export class UpdateQuotationHandler implements ICommandHandler<UpdateQuotationCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: QuotationCalculatorService,
  ) {}

  async execute(cmd: UpdateQuotationCommand) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: cmd.id },
      include: { lead: { include: { organization: { select: { state: true } } } } },
    });
    if (!quotation) throw new NotFoundException('Quotation not found');
    if (!['DRAFT', 'INTERNAL_REVIEW'].includes(quotation.status)) {
      throw new BadRequestException('Only DRAFT or INTERNAL_REVIEW quotations can be edited');
    }

    const data: any = {};
    if (cmd.title !== undefined) data.title = cmd.title;
    if (cmd.summary !== undefined) data.summary = cmd.summary;
    if (cmd.coverNote !== undefined) data.coverNote = cmd.coverNote;
    if (cmd.priceType !== undefined) data.priceType = cmd.priceType;
    if (cmd.minAmount !== undefined) data.minAmount = cmd.minAmount;
    if (cmd.maxAmount !== undefined) data.maxAmount = cmd.maxAmount;
    if (cmd.plusMinusPercent !== undefined) data.plusMinusPercent = cmd.plusMinusPercent;
    if (cmd.validFrom !== undefined) data.validFrom = cmd.validFrom;
    if (cmd.validUntil !== undefined) data.validUntil = cmd.validUntil;
    if (cmd.paymentTerms !== undefined) data.paymentTerms = cmd.paymentTerms;
    if (cmd.deliveryTerms !== undefined) data.deliveryTerms = cmd.deliveryTerms;
    if (cmd.warrantyTerms !== undefined) data.warrantyTerms = cmd.warrantyTerms;
    if (cmd.termsConditions !== undefined) data.termsConditions = cmd.termsConditions;
    if (cmd.discountType !== undefined) data.discountType = cmd.discountType;
    if (cmd.discountValue !== undefined) data.discountValue = cmd.discountValue;
    if (cmd.tags !== undefined) data.tags = cmd.tags;
    if (cmd.internalNotes !== undefined) data.internalNotes = cmd.internalNotes;

    await this.prisma.quotation.update({ where: { id: cmd.id }, data });

    // Recalculate if discount changed
    if (cmd.discountType !== undefined || cmd.discountValue !== undefined) {
      const customerState = quotation.lead?.organization?.state || undefined;
      await this.calculator.recalculate(cmd.id, customerState);
    }

    await this.prisma.quotationActivity.create({
      data: {
        quotationId: cmd.id, action: 'UPDATED',
        description: `Quotation ${quotation.quotationNo} updated`,
        performedById: cmd.userId, performedByName: cmd.userName,
      },
    });

    return this.prisma.quotation.findUnique({
      where: { id: cmd.id },
      include: { lineItems: true, lead: true },
    });
  }
}
