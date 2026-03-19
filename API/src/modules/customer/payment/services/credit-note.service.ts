import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AppError } from '../../../../common/errors/app-error';
import { AutoNumberService } from '../../../core/identity/settings/services/auto-number.service';
import { InvoiceService } from './invoice.service';
import { CreateCreditNoteDto, ApplyCreditNoteDto, CreditNoteQueryDto } from '../presentation/dto/credit-note.dto';

@Injectable()
export class CreditNoteService {
  private readonly logger = new Logger(CreditNoteService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly autoNumber: AutoNumberService,
    private readonly invoiceService: InvoiceService,
  ) {}

  /** Create a credit note against an invoice */
  async create(tenantId: string, dto: CreateCreditNoteDto, userId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: dto.invoiceId, tenantId },
    });
    if (!invoice) throw AppError.from('INVOICE_NOT_FOUND');

    if (dto.amount > Number(invoice.totalAmount)) {
      throw AppError.from('CREDIT_NOTE_EXCEEDS_INVOICE');
    }

    const creditNoteNo = await this.autoNumber.next(tenantId, 'CreditNote');

    const creditNote = await this.prisma.creditNote.create({
      data: {
        tenantId,
        creditNoteNo,
        invoiceId: dto.invoiceId,
        amount: dto.amount,
        reason: dto.reason,
        status: 'CN_DRAFT',
        createdById: userId,
      },
    });

    this.logger.log(`Credit note ${creditNoteNo} created for invoice ${invoice.invoiceNo}`);
    return creditNote;
  }

  /** Issue credit note — changes status from DRAFT to ISSUED */
  async issue(tenantId: string, creditNoteId: string, userId: string) {
    const cn = await this.prisma.creditNote.findFirst({
      where: { id: creditNoteId, tenantId },
    });
    if (!cn) throw AppError.from('CREDIT_NOTE_NOT_FOUND');

    return this.prisma.creditNote.update({
      where: { id: creditNoteId },
      data: {
        status: 'CN_ISSUED',
        issuedAt: new Date(),
        issuedById: userId,
      },
    });
  }

  /** Apply credit note to an invoice */
  async apply(tenantId: string, creditNoteId: string, dto: ApplyCreditNoteDto) {
    const cn = await this.prisma.creditNote.findFirst({
      where: { id: creditNoteId, tenantId },
    });
    if (!cn) throw AppError.from('CREDIT_NOTE_NOT_FOUND');
    if (cn.status === 'CN_APPLIED') throw AppError.from('CREDIT_NOTE_ALREADY_APPLIED');

    const targetInvoice = await this.prisma.invoice.findFirst({
      where: { id: dto.applyToInvoiceId, tenantId },
    });
    if (!targetInvoice) throw AppError.from('INVOICE_NOT_FOUND');

    const applyAmount = dto.amount || Number(cn.amount);
    if (applyAmount > Number(targetInvoice.balanceAmount)) {
      throw AppError.from('CREDIT_NOTE_EXCEEDS_INVOICE');
    }

    const updated = await this.prisma.creditNote.update({
      where: { id: creditNoteId },
      data: {
        status: 'CN_APPLIED',
        appliedToInvoiceId: dto.applyToInvoiceId,
        appliedAmount: applyAmount,
        appliedAt: new Date(),
      },
    });

    await this.invoiceService.recalculateBalance(dto.applyToInvoiceId);

    this.logger.log(`Credit note ${cn.creditNoteNo} applied to invoice`);
    return updated;
  }

  /** Cancel credit note */
  async cancel(tenantId: string, creditNoteId: string) {
    const cn = await this.prisma.creditNote.findFirst({
      where: { id: creditNoteId, tenantId },
    });
    if (!cn) throw AppError.from('CREDIT_NOTE_NOT_FOUND');
    if (cn.status === 'CN_APPLIED') throw AppError.from('CREDIT_NOTE_ALREADY_APPLIED');

    return this.prisma.creditNote.update({
      where: { id: creditNoteId },
      data: { status: 'CN_CANCELLED' },
    });
  }

  /** Get credit note by ID */
  async getById(tenantId: string, creditNoteId: string) {
    const cn = await this.prisma.creditNote.findFirst({
      where: { id: creditNoteId, tenantId },
      include: { invoice: true },
    });
    if (!cn) throw AppError.from('CREDIT_NOTE_NOT_FOUND');
    return cn;
  }

  /** List credit notes */
  async list(tenantId: string, query: CreditNoteQueryDto) {
    const where: any = { tenantId };
    if (query.invoiceId) where.invoiceId = query.invoiceId;
    if (query.status) where.status = query.status;
    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
      if (query.toDate) where.createdAt.lte = new Date(query.toDate);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;

    const [data, total] = await Promise.all([
      this.prisma.creditNote.findMany({
        where,
        include: { invoice: { select: { invoiceNo: true, billingName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.creditNote.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
