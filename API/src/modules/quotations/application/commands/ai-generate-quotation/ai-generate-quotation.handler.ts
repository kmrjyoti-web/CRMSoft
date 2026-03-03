import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { AiGenerateQuotationCommand } from './ai-generate-quotation.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { QuotationNumberService } from '../../../services/quotation-number.service';
import { QuotationCalculatorService } from '../../../services/quotation-calculator.service';
import { QuotationPredictionService } from '../../../services/quotation-prediction.service';

@CommandHandler(AiGenerateQuotationCommand)
export class AiGenerateQuotationHandler implements ICommandHandler<AiGenerateQuotationCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberService: QuotationNumberService,
    private readonly calculator: QuotationCalculatorService,
    private readonly prediction: QuotationPredictionService,
  ) {}

  async execute(cmd: AiGenerateQuotationCommand) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: cmd.leadId },
      include: { organization: { select: { id: true, state: true, name: true } }, contact: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    // Get AI prediction
    const predictionResult = await this.prediction.predict(cmd.leadId);
    const recs = predictionResult.recommendations;

    const quotationNo = await this.numberService.generateNumber();
    const customerState = lead.organization?.state || undefined;
    const interState = this.calculator.isInterState(customerState);

    // Build line items from suggested products
    const lineItemData: any[] = [];
    for (const sp of recs.suggestedProducts) {
      const product = await this.prisma.product.findUnique({
        where: { id: sp.productId },
        select: { name: true, code: true, hsnCode: true, gstRate: true, salePrice: true, mrp: true },
      });
      if (!product) continue;

      const unitPrice = recs.suggestedPriceRange?.optimal
        ? Number(recs.suggestedPriceRange.optimal) / recs.suggestedProducts.length
        : Number(product.salePrice || product.mrp || 0);

      const discountValue = recs.suggestedDiscount?.sweet_spot || 0;
      const calc = this.calculator.calculateLineItem({
        quantity: 1, unitPrice,
        discountType: discountValue > 0 ? 'PERCENTAGE' : undefined,
        discountValue: discountValue > 0 ? discountValue : undefined,
        gstRate: product.gstRate ? Number(product.gstRate) : undefined,
      }, interState);

      lineItemData.push({
        productId: sp.productId, productCode: product.code,
        productName: product.name, hsnCode: product.hsnCode,
        quantity: 1, unitPrice, mrp: product.mrp,
        discountType: discountValue > 0 ? 'PERCENTAGE' : null,
        discountValue: discountValue > 0 ? discountValue : null,
        discountAmount: calc.discountAmount, lineTotal: calc.lineTotal,
        gstRate: product.gstRate,
        cgstAmount: calc.cgstAmount, sgstAmount: calc.sgstAmount, igstAmount: calc.igstAmount,
        taxAmount: calc.taxAmount, totalWithTax: calc.totalWithTax,
        sortOrder: lineItemData.length,
      });
    }

    // Generate cover note
    const contactName = lead.contact ? `${lead.contact.firstName} ${lead.contact.lastName}` : 'Valued Customer';
    const productNames = lineItemData.map((i) => i.productName).join(', ');
    const coverNote = `Dear ${contactName},\n\nThank you for your interest. Based on your requirements, we are pleased to offer ${productNames || 'our products'}.\n\nWe look forward to working with you.`;

    const quotation = await this.prisma.quotation.create({
      data: {
        quotationNo, status: 'DRAFT',
        title: `AI Generated — ${lead.organization?.name || contactName}`,
        coverNote,
        priceType: (recs.suggestedPriceType as any) || 'FIXED',
        validUntil: new Date(Date.now() + (recs.suggestedValidityDays || 30) * 86400000),
        paymentTerms: recs.suggestedPaymentTerms,
        leadId: cmd.leadId, organizationId: lead.organization?.id,
        contactPersonId: lead.contactId,
        aiScore: predictionResult.score,
        aiSuggestions: predictionResult as any,
        createdById: cmd.userId,
        lineItems: { create: lineItemData },
      },
      include: { lineItems: true, lead: true },
    });

    await this.calculator.recalculate(quotation.id, customerState);

    await this.prisma.quotationActivity.create({
      data: {
        quotationId: quotation.id, action: 'CREATED',
        description: `AI-generated quotation (score: ${predictionResult.score}%)`,
        newValue: 'DRAFT', changedField: 'status',
        performedById: cmd.userId, performedByName: cmd.userName,
      },
    });

    return this.prisma.quotation.findUnique({
      where: { id: quotation.id },
      include: { lineItems: true, lead: true },
    });
  }
}
