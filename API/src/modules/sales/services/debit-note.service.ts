import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateDebitNoteDto, AdjustNoteDto } from '../presentation/dto/sales.dto';

@Injectable()
export class DebitNoteService {
  constructor(private readonly prisma: PrismaService) {}

  async generateNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.debitNote.count({
      where: { tenantId, debitNoteNumber: { startsWith: `DN-${year}-` } },
    });
    return `DN-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async create(tenantId: string, userId: string, dto: CreateDebitNoteDto) {
    const debitNoteNumber = await this.generateNumber(tenantId);

    let subtotal = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    const itemsData = dto.items.map((item) => {
      subtotal += item.taxableAmount;
      cgstAmount += item.cgstAmount ?? 0;
      sgstAmount += item.sgstAmount ?? 0;
      igstAmount += item.igstAmount ?? 0;

      const totalAmount = item.taxableAmount + (item.cgstAmount ?? 0) + (item.sgstAmount ?? 0) + (item.igstAmount ?? 0);

      return {
        tenantId,
        productId: item.productId,
        quantity: item.quantity,
        unitId: item.unitId,
        unitPrice: item.unitPrice,
        taxableAmount: item.taxableAmount,
        cgstAmount: item.cgstAmount ?? 0,
        sgstAmount: item.sgstAmount ?? 0,
        igstAmount: item.igstAmount ?? 0,
        hsnCode: item.hsnCode,
        totalAmount,
      };
    });

    const grandTotal = subtotal + cgstAmount + sgstAmount + igstAmount;

    return this.prisma.debitNote.create({
      data: {
        tenantId,
        debitNoteNumber,
        vendorId: dto.vendorId,
        purchaseInvoiceId: dto.purchaseInvoiceId,
        goodsReceiptId: dto.goodsReceiptId,
        reason: dto.reason,
        inventoryEffect: dto.inventoryEffect ?? true,
        accountsEffect: dto.accountsEffect ?? true,
        subtotal,
        cgstAmount,
        sgstAmount,
        igstAmount,
        grandTotal,
        status: 'DRAFT',
        createdById: userId,
        items: { create: itemsData },
      },
      include: { items: true },
    });
  }

  async findAll(tenantId: string, filters?: { status?: string; vendorId?: string; page?: number; limit?: number }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.vendorId) where.vendorId = filters.vendorId;

    const [data, total] = await Promise.all([
      this.prisma.debitNote.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.debitNote.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string) {
    const note = await this.prisma.debitNote.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });
    if (!note) throw new NotFoundException('Debit note not found');
    return note;
  }

  /**
   * Issue a debit note:
   * - If inventoryEffect: Stock OUT for each item (return goods to vendor)
   * - If accountsEffect: Create AccountTransaction (Debit Vendor, Credit Purchase Return)
   */
  async issue(tenantId: string, id: string, userId: string) {
    const note = await this.prisma.debitNote.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });
    if (!note) throw new NotFoundException('Debit note not found');
    if (note.status !== 'DRAFT') throw new BadRequestException('Only DRAFT debit notes can be issued');

    // Inventory effect: Stock OUT (return goods to vendor)
    if (note.inventoryEffect) {
      for (const item of note.items) {
        const inventoryItem = await this.prisma.inventoryItem.findFirst({
          where: { tenantId, productId: item.productId },
        });

        if (inventoryItem) {
          // Find default location
          const locationId = inventoryItem.defaultLocationId ?? 'DEFAULT';

          await this.prisma.stockTransaction.create({
            data: {
              tenantId,
              inventoryItemId: inventoryItem.id,
              productId: item.productId,
              transactionType: 'SALE_OUT',
              quantity: -Number(item.quantity),
              locationId,
              referenceType: 'DEBIT_NOTE',
              referenceId: note.id,
              transactionDate: new Date(),
              createdById: userId,
            },
          });

          await this.prisma.inventoryItem.updateMany({
            where: { tenantId, productId: item.productId },
            data: { currentStock: { decrement: Number(item.quantity) } },
          });
        }
      }
    }

    // Accounts effect: Create accounting entry
    if (note.accountsEffect) {
      await this.prisma.accountTransaction.create({
        data: {
          tenantId,
          transactionDate: new Date(),
          voucherType: 'DEBIT_NOTE',
          voucherNumber: note.debitNoteNumber,
          referenceType: 'DEBIT_NOTE',
          referenceId: note.id,
          debitLedgerId: 'VENDOR',           // placeholder ledger ID
          creditLedgerId: 'PURCHASE_RETURN', // placeholder ledger ID
          amount: note.grandTotal,
          narration: `Debit Note ${note.debitNoteNumber} - ${note.reason}`,
          createdById: userId,
        },
      });
    }

    return this.prisma.debitNote.update({
      where: { id },
      data: {
        status: 'ISSUED',
        accountTransactionId: note.accountsEffect ? undefined : null,
      },
      include: { items: true },
    });
  }

  /**
   * Adjust a debit note against a purchase invoice balance.
   */
  async adjust(tenantId: string, id: string, dto: AdjustNoteDto) {
    const note = await this.prisma.debitNote.findFirst({ where: { id, tenantId } });
    if (!note) throw new NotFoundException('Debit note not found');
    if (note.status !== 'ISSUED') throw new BadRequestException('Only ISSUED debit notes can be adjusted');

    if (!dto.invoiceId) {
      throw new BadRequestException('invoiceId is required to adjust debit note against purchase invoice');
    }

    // Find purchase invoice and reduce balance
    const purchaseInvoice = await this.prisma.purchaseInvoice.findFirst({
      where: { id: dto.invoiceId, tenantId },
    });
    if (!purchaseInvoice) throw new NotFoundException('Purchase invoice not found');

    const currentBalance = Number(purchaseInvoice.balanceAmount ?? purchaseInvoice.grandTotal);
    const debitAmount = Number(note.grandTotal);
    const newBalance = Math.max(0, currentBalance - debitAmount);

    await this.prisma.purchaseInvoice.update({
      where: { id: dto.invoiceId },
      data: { balanceAmount: newBalance },
    });

    return this.prisma.debitNote.update({
      where: { id },
      data: { status: 'ADJUSTED', purchaseInvoiceId: dto.invoiceId },
    });
  }
}
