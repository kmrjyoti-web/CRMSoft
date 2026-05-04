import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AppError } from '../../../../common/errors/app-error';
import { AutoNumberService } from '../../../core/identity/settings/services/auto-number.service';
import { CrossService } from '../../../../common/decorators/cross-service.decorator';
import { InvoiceService } from './invoice.service';
import { CreateCreditNoteDto, ApplyCreditNoteDto, CreditNoteQueryDto } from '../presentation/dto/credit-note.dto';

@CrossService('identity', 'Uses AutoNumberService from identity settings to generate credit note numbers')
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
    const invoice = await this.prisma.working.invoice.findFirst({
      where: { id: dto.invoiceId, tenantId },
    });
    if (!invoice) throw AppError.from('INVOICE_NOT_FOUND');

    if (dto.amount > Number(invoice.totalAmount)) {
      throw AppError.from('CREDIT_NOTE_EXCEEDS_INVOICE');
    }

    const creditNoteNo = await this.autoNumber.next(tenantId, 'CreditNote');

    const creditNote = await this.prisma.working.creditNote.create({
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

