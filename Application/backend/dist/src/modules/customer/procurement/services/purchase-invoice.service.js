"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseInvoiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const transaction_service_1 = require("../../../customer/inventory/services/transaction.service");
let PurchaseInvoiceService = class PurchaseInvoiceService {
    constructor(prisma, transactionService) {
        this.prisma = prisma;
        this.transactionService = transactionService;
    }
    async list(tenantId, filters) {
        const page = filters?.page ?? 1;
        const limit = filters?.limit ?? 20;
        const where = { tenantId };
        if (filters?.vendorId)
            where.vendorId = filters.vendorId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.purchaseOrderId)
            where.poId = filters.purchaseOrderId;
        const [data, total] = await Promise.all([
            this.prisma.working.purchaseInvoice.findMany({
                where,
                include: {
                    po: { select: { id: true, poNumber: true } },
                    items: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.purchaseInvoice.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async getById(tenantId, id) {
        const invoice = await this.prisma.working.purchaseInvoice.findFirst({
            where: { id, tenantId },
            include: {
                po: { select: { id: true, poNumber: true } },
                items: true,
            },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Purchase invoice not found');
        return invoice;
    }
    async create(tenantId, userId, dto) {
        let subtotal = 0;
        let taxTotal = 0;
        const itemsData = dto.items.map((item) => {
            const lineTotal = item.quantity * item.unitPrice;
            const disc = item.discount ?? 0;
            const afterDiscount = lineTotal - (lineTotal * disc / 100);
            const tax = afterDiscount * ((item.taxRate ?? 0) / 100);
            const total = afterDiscount + tax;
            subtotal += afterDiscount;
            taxTotal += tax;
            return {
                tenantId,
                productId: item.productId,
                quantity: item.quantity,
                unitId: '',
                unitPrice: item.unitPrice,
                discount: item.discount ?? 0,
                taxableAmount: afterDiscount,
                totalAmount: total,
                poItemId: item.grnItemId,
            };
        });
        return this.prisma.working.purchaseInvoice.create({
            data: {
                tenantId,
                ourReference: dto.invoiceNumber,
                vendorId: dto.vendorId,
                poId: dto.purchaseOrderId,
                goodsReceiptId: dto.goodsReceiptId,
                vendorInvoiceNo: dto.vendorInvoiceNo,
                invoiceDate: dto.vendorInvoiceDate ? new Date(dto.vendorInvoiceDate) : new Date(),
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
                subtotal,
                taxableAmount: subtotal,
                grandTotal: subtotal + taxTotal,
                balanceAmount: subtotal + taxTotal,
                status: 'DRAFT',
                createdById: userId,
                remarks: dto.notes,
                items: { create: itemsData },
            },
            include: { items: true },
        });
    }
    async approve(tenantId, id, userId) {
        const invoice = await this.prisma.working.purchaseInvoice.findFirst({
            where: { id, tenantId },
            include: { items: true },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Purchase invoice not found');
        if (invoice.status !== 'PENDING_APPROVAL') {
            throw new common_1.BadRequestException('Invoice not pending approval');
        }
        const hasChallan = !!invoice.goodsReceiptId;
        if (!hasChallan) {
            const defaultLoc = await this.prisma.working.stockLocation.findFirst({
                where: { tenantId, isDefault: true },
            });
            const locationId = defaultLoc?.id ?? '';
            if (locationId) {
                for (const item of invoice.items) {
                    await this.transactionService.record(tenantId, {
                        productId: item.productId,
                        transactionType: 'PURCHASE_IN',
                        quantity: item.quantity.toNumber(),
                        locationId,
                        unitPrice: item.unitPrice.toNumber(),
                        referenceType: 'PURCHASE_INVOICE',
                        referenceId: invoice.id,
                        remarks: `Invoice ${invoice.ourReference} (no GRN)`,
                        createdById: userId,
                    });
                }
            }
        }
        await this.createAccountingEntries(tenantId, invoice, userId);
        return this.prisma.working.purchaseInvoice.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedById: userId,
                inventoryEffect: !hasChallan,
                accountsEffect: true,
            },
        });
    }
    async submitForApproval(tenantId, id) {
        const invoice = await this.prisma.working.purchaseInvoice.findFirst({ where: { id, tenantId } });
        if (!invoice)
            throw new common_1.NotFoundException('Purchase invoice not found');
        if (invoice.status !== 'DRAFT')
            throw new common_1.BadRequestException('Only draft invoices can be submitted');
        return this.prisma.working.purchaseInvoice.update({
            where: { id },
            data: { status: 'PENDING_APPROVAL' },
        });
    }
    async reject(tenantId, id, userId, remarks) {
        const invoice = await this.prisma.working.purchaseInvoice.findFirst({ where: { id, tenantId } });
        if (!invoice)
            throw new common_1.NotFoundException('Purchase invoice not found');
        return this.prisma.working.purchaseInvoice.update({
            where: { id },
            data: { status: 'REJECTED' },
        });
    }
    async cancel(tenantId, id) {
        const invoice = await this.prisma.working.purchaseInvoice.findFirst({ where: { id, tenantId } });
        if (!invoice)
            throw new common_1.NotFoundException('Purchase invoice not found');
        if (['PAID', 'CANCELLED'].includes(invoice.status)) {
            throw new common_1.BadRequestException('Cannot cancel paid/cancelled invoice');
        }
        return this.prisma.working.purchaseInvoice.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
    }
    async generateNumber(tenantId) {
        const count = await this.prisma.working.purchaseInvoice.count({ where: { tenantId } });
        return `PINV-${String(count + 1).padStart(5, '0')}`;
    }
    async createAccountingEntries(tenantId, invoice, userId) {
        const purchaseLedger = await this.prisma.working.ledgerMaster.findFirst({
            where: { tenantId, code: 'PURCHASE' },
        });
        const payableLedger = await this.prisma.working.ledgerMaster.findFirst({
            where: { tenantId, code: 'ACCOUNTS_PAYABLE' },
        });
        const grandTotal = invoice.grandTotal?.toNumber?.() ?? invoice.grandTotal ?? 0;
        if (purchaseLedger && payableLedger) {
            await this.prisma.working.accountTransaction.create({
                data: {
                    tenantId,
                    transactionDate: new Date(),
                    voucherType: 'PURCHASE',
                    voucherNumber: invoice.ourReference,
                    referenceType: 'PURCHASE_INVOICE',
                    referenceId: invoice.id,
                    debitLedgerId: purchaseLedger.id,
                    creditLedgerId: payableLedger.id,
                    amount: grandTotal,
                    narration: `Purchase Invoice ${invoice.ourReference} - ${invoice.vendorInvoiceNo}`,
                    createdById: userId,
                },
            });
        }
        const taxLedger = await this.prisma.working.ledgerMaster.findFirst({
            where: { tenantId, code: 'INPUT_GST' },
        });
        const taxTotal = invoice.cgstAmount?.toNumber?.() ?? 0 +
            (invoice.sgstAmount?.toNumber?.() ?? 0) +
            (invoice.igstAmount?.toNumber?.() ?? 0);
        if (taxLedger && payableLedger && taxTotal > 0) {
            await this.prisma.working.accountTransaction.create({
                data: {
                    tenantId,
                    transactionDate: new Date(),
                    voucherType: 'PURCHASE',
                    voucherNumber: `${invoice.ourReference}-TAX`,
                    referenceType: 'PURCHASE_INVOICE',
                    referenceId: invoice.id,
                    debitLedgerId: taxLedger.id,
                    creditLedgerId: payableLedger.id,
                    amount: taxTotal,
                    narration: `Input GST - Invoice ${invoice.ourReference}`,
                    createdById: userId,
                },
            });
        }
    }
};
exports.PurchaseInvoiceService = PurchaseInvoiceService;
exports.PurchaseInvoiceService = PurchaseInvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        transaction_service_1.TransactionService])
], PurchaseInvoiceService);
//# sourceMappingURL=purchase-invoice.service.js.map