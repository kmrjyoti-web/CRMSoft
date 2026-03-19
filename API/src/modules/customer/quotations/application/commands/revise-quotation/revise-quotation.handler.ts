import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ReviseQuotationCommand } from './revise-quotation.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { QuotationNumberService } from '../../../services/quotation-number.service';

@CommandHandler(ReviseQuotationCommand)
export class ReviseQuotationHandler implements ICommandHandler<ReviseQuotationCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberService: QuotationNumberService,
  ) {}

  async execute(cmd: ReviseQuotationCommand) {
    const old = await this.prisma.quotation.findUnique({
      where: { id: cmd.id },
      include: { lineItems: true },
    });
    if (!old) throw new NotFoundException('Quotation not found');

    const allowed = ['SENT', 'VIEWED', 'NEGOTIATION'];
    if (!allowed.includes(old.status)) {
      throw new BadRequestException(`Cannot revise quotation with status ${old.status}`);
    }

    const newVersion = old.version + 1;
    const newNo = this.numberService.generateRevisionNumber(old.quotationNo, newVersion);

    // Clone as new quotation
    const revised = await this.prisma.quotation.create({
      data: {
        quotationNo: newNo, status: 'DRAFT', version: newVersion,
        title: old.title, summary: old.summary, coverNote: old.coverNote,
        subtotal: old.subtotal, discountType: old.discountType,
        discountValue: old.discountValue, discountAmount: old.discountAmount,
        taxableAmount: old.taxableAmount, cgstAmount: old.cgstAmount,
        sgstAmount: old.sgstAmount, igstAmount: old.igstAmount,
        cessAmount: old.cessAmount, totalTax: old.totalTax,
        roundOff: old.roundOff, totalAmount: old.totalAmount,
        priceType: old.priceType, minAmount: old.minAmount,
        maxAmount: old.maxAmount, plusMinusPercent: old.plusMinusPercent,
        validFrom: old.validFrom, validUntil: old.validUntil,
        paymentTerms: old.paymentTerms, deliveryTerms: old.deliveryTerms,
        warrantyTerms: old.warrantyTerms, termsConditions: old.termsConditions,
        leadId: old.leadId, contactPersonId: old.contactPersonId,
        organizationId: old.organizationId,
        parentQuotationId: old.id,
        tags: old.tags, internalNotes: old.internalNotes,
        createdById: cmd.userId,
        lineItems: {
          create: old.lineItems.map((li) => ({
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

    // Mark old as REVISED
    await this.prisma.quotation.update({
      where: { id: old.id },
      data: { status: 'REVISED' },
    });

    // Activity on old
    await this.prisma.quotationActivity.create({
      data: {
        quotationId: old.id, action: 'REVISED',
        description: `Revised — new version ${newNo} created`,
        previousValue: old.status, newValue: 'REVISED', changedField: 'status',
        performedById: cmd.userId, performedByName: cmd.userName,
      },
    });

    // Activity on new
    await this.prisma.quotationActivity.create({
      data: {
        quotationId: revised.id, action: 'CREATED',
        description: `Created as revision of ${old.quotationNo}`,
        newValue: 'DRAFT', changedField: 'status',
        performedById: cmd.userId, performedByName: cmd.userName,
      },
    });

    return revised;
  }
}
