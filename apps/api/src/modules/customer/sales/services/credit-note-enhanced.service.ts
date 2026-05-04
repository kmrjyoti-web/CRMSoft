import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CreateCreditNoteDto, AdjustNoteDto } from '../presentation/dto/sales.dto';

@Injectable()
export class CreditNoteEnhancedService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.working.creditNote.count({
      where: { tenantId, creditNoteNo: { startsWith: `CN-${year}-` } },
    });
    return `CN-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  /**
   * Auto-create a credit note from an accepted sale return.
   * Calculates amount from accepted (or returned) items.
   */
  async createFromReturn(tenantId: string, userId: string, saleReturn: any) {
    if (!saleReturn.invoiceId) {
      // Cannot create credit note without an invoice reference
      return null;
    }

    let totalAmount = 0;
    for (const item of saleReturn.items) {
      const acceptedQty = item.acceptedQty ? Number(item.acceptedQty) : Number(item.returnedQty);
      if (acceptedQty <= 0) continue;
      const itemTotal = acceptedQty * Number(item.unitPrice);
      const taxAmount = itemTotal * (Number(item.taxRate ?? 0) / 100);
      totalAmount += itemTotal + taxAmount;
    }

    if (totalAmount <= 0) return null;

    const creditNoteNo = await this.generateNumber(tenantId);

    return this.prisma.working.creditNote.create({
      data: {
        tenantId,
        creditNoteNo,
        invoiceId: saleReturn.invoiceId,
        amount: totalAmount,
        reason: `Sale Return: ${saleReturn.returnReason ?? saleReturn.returnNumber}`,
        status: 'CN_DRAFT',
        createdById: userId,
      },
    });
  }

  /**
   * Manually create a credit note with itemized details.
   * Stores the total amount on the CreditNote model.
   */
  async createManual(tenantId: string, userId: string, dto: CreateCreditNoteDto) {
    if (!dto.invoiceId) throw new BadRequestException('invoiceId is required for credit note creation');

    const creditNoteNo = await this.generateNumber(tenantId);

    let totalAmount = 0;
    for (const item of dto.items) {
      const itemTotal = item.taxableAmount + (item.cgstAmount ?? 0) + (item.sgstAmount ?? 0) + (item.igstAmount ?? 0);
      totalAmount += itemTotal;
    }

    return this.prisma.working.creditNote.create({
      data: {
        tenantId,
        creditNoteNo,
        invoiceId: dto.invoiceId,
        amount: totalAmount,
        reason: dto.reason,
        status: 'CN_DRAFT',
        createdById: userId,
      },
    });
  }

  async findAll(tenantId: string, filters?: { status?: string; page?: number; limit?: number }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      this.prisma.working.creditNote.findMany({
        where,
        include: { invoice: { select: { id: true, invoiceNo: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.working.creditNote.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string) {
    const note = await this.prisma.working.creditNote.findFirst({
      where: { id, tenantId },
      include: { invoice: true },
    });
    if (!note) throw new NotFoundException('Credit note not found');
    return note;
  }

  /**
   * Issue a credit note: set status to CN_ISSUED and create accounting entry.
   * Debit "Sales Return" ledger, Credit "Customer" ledger.
   */
  async issue(tenantId: string, id: string, userId: string) {
    const note = await this.prisma.working.creditNote.findFirst({ where: { id, tenantId } });
    if (!note) throw new NotFoundException('Credit note not found');
    if (note.status !== 'CN_DRAFT') throw new BadRequestException('Only DRAFT credit notes can be issued');

    // Create accounting transaction
    await this.prisma.working.accountTransaction.create({
      data: {
        tenantId,
        transactionDate: new Date(),
        voucherType: 'CREDIT_NOTE',
        voucherNumber: note.creditNoteNo,
        referenceType: 'CREDIT_NOTE',
        referenceId: note.id,
        debitLedgerId: 'SALES_RETURN',   // placeholder ledger ID
        creditLedgerId: 'CUSTOMER',       // placeholder ledger ID
        amount: note.amount,
        narration: `Credit Note ${note.creditNoteNo} issued - ${note.reason}`,
        createdById: userId,
      },
    });

    return this.prisma.working.creditNote.update({
      where: { id },
      data: { status: 'CN_ISSUED', issuedAt: new Date(), issuedById: userId },
    });
  }

  /**
   * Adjust a credit note: apply against an invoice or issue a refund.
   */
  async adjust(tenantId: string, id: string, dto: AdjustNoteDto) {
    const note = await this.prisma.working.creditNote.findFirst({ where: { id, tenantId } });
    if (!note) throw new NotFoundException('Credit note not found');
    if (note.status !== 'CN_ISSUED') throw new BadRequestException('Only ISSUED credit notes can be adjusted');

    if (dto.invoiceId) {
      // Apply against invoice — reduce invoice balance
      const invoice = await this.prisma.working.invoice.findFirst({
        where: { id: dto.invoiceId, tenantId },
      });
      if (!invoice) throw new NotFoundException('Invoice not found');

      const currentBalance = Number(invoice.balanceAmount ?? invoice.totalAmount);
      const creditAmount = Number(note.amount);
      const newBalance = Math.max(0, currentBalance - creditAmount);

      await this.prisma.working.invoice.update({
        where: { id: dto.invoiceId },
        data: { balanceAmount: newBalance },
      });

      return this.prisma.working.creditNote.update({
        where: { id },
        data: {
          status: 'CN_APPLIED',
          appliedToInvoiceId: dto.invoiceId,
          appliedAmount: note.amount,
          appliedAt: new Date(),
        },
      });
    }

    if (dto.issueRefund) {
      // Mark as applied (refund issued out-of-band)
      return this.prisma.working.creditNote.update({
        where: { id },
        data: {
          status: 'CN_APPLIED',
          appliedAmount: note.amount,
          appliedAt: new Date(),
        },
      });
    }

    throw new BadRequestException('Provide invoiceId to adjust or set issueRefund to true');
  }
}
