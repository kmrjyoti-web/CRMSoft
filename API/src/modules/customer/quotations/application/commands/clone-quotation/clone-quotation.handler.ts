import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CloneQuotationCommand } from './clone-quotation.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { QuotationNumberService } from '../../../services/quotation-number.service';

@CommandHandler(CloneQuotationCommand)
export class CloneQuotationHandler implements ICommandHandler<CloneQuotationCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberService: QuotationNumberService,
  ) {}

  async execute(cmd: CloneQuotationCommand) {
    const source = await this.prisma.working.quotation.findUnique({
      where: { id: cmd.id },
      include: { lineItems: true },
    });
    if (!source) throw new NotFoundException('Quotation not found');

    const quotationNo = await this.numberService.generateNumber();
    const targetLeadId = cmd.leadId || source.leadId;

    const cloned = await this.prisma.working.quotation.create({
      data: {
        quotationNo, status: 'DRAFT', version: 1,
        title: source.title ? `Copy of ${source.title}` : null,
        summary: source.summary, coverNote: source.coverNote,
        priceType: source.priceType,
        minAmount: source.minAmount, maxAmount: source.maxAmount,
        plusMinusPercent: source.plusMinusPercent,
        validUntil: source.validUntil,
        paymentTerms: source.paymentTerms, deliveryTerms: source.deliveryTerms,
        warrantyTerms: source.warrantyTerms, termsConditions: source.termsConditions,
        discountType: source.discountType, discountValue: source.discountValue,
        leadId: targetLeadId,
        contactPersonId: source.contactPersonId, organizationId: source.organizationId,
        tags: source.tags, createdById: cmd.userId,
        lineItems: {
          create: source.lineItems.map((li) => ({
            productId: li.productId, productCode: li.productCode,
            productName: li.productName, description: li.description,
            hsnCode: li.hsnCode, quantity: li.quantity, unit: li.unit,
            unitPrice: li.unitPrice, mrp: li.mrp,
            discountType: li.discountType, discountValue: li.discountValue,
            discountAmount: li.discountAmount, lineTotal: li.lineTotal,
            gstRate: li.gstRate, cgstAmount: li.cgstAmount,
            sgstAmount: li.sgstAmount, igstAmount: li.igstAmount,
            cessRate: li.cessRate, cessAmount: li.cessAmount,
            taxAmount: li.taxAmount, totalWithTax: li.totalWithTax,
            sortOrder: li.sortOrder, notes: li.notes, isOptional: li.isOptional,
          })),
        },
      },
      include: { lineItems: true, lead: true },
    });

    await this.prisma.working.quotationActivity.create({
      data: {
        quotationId: cloned.id, action: 'CREATED',
        description: `Cloned from ${source.quotationNo}`,
        newValue: 'DRAFT', changedField: 'status',
        performedById: cmd.userId, performedByName: cmd.userName,
      },
    });

    return cloned;
  }
}
