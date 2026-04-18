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
exports.GSTReturnService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let GSTReturnService = class GSTReturnService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateGSTR1(tenantId, period) {
        const fy = this.getFYFromPeriod(period);
        const { start, end } = this.getPeriodDates(period);
        const invoices = await this.prisma.working.invoice.findMany({
            where: {
                tenantId,
                status: { notIn: ['DRAFT', 'CANCELLED', 'VOID'] },
                invoiceDate: { gte: start, lte: end },
            },
            include: { lineItems: true },
        });
        const b2b = invoices
            .filter((inv) => inv.billingGstNumber)
            .map((inv) => ({
            invoiceNo: inv.invoiceNo,
            invoiceDate: inv.invoiceDate,
            gstin: inv.billingGstNumber,
            billingName: inv.billingName,
            taxableAmount: Number(inv.taxableAmount),
            cgst: Number(inv.cgstAmount),
            sgst: Number(inv.sgstAmount),
            igst: Number(inv.igstAmount),
            cess: Number(inv.cessAmount),
            total: Number(inv.totalAmount),
            isInterState: inv.isInterState,
        }));
        const b2cLarge = invoices
            .filter((inv) => !inv.billingGstNumber && Number(inv.totalAmount) > 250000)
            .map((inv) => ({
            invoiceNo: inv.invoiceNo,
            invoiceDate: inv.invoiceDate,
            billingName: inv.billingName,
            taxableAmount: Number(inv.taxableAmount),
            cgst: Number(inv.cgstAmount),
            sgst: Number(inv.sgstAmount),
            igst: Number(inv.igstAmount),
            total: Number(inv.totalAmount),
        }));
        const b2cSmallTotal = invoices
            .filter((inv) => !inv.billingGstNumber && Number(inv.totalAmount) <= 250000)
            .reduce((acc, inv) => ({
            taxableAmount: acc.taxableAmount + Number(inv.taxableAmount),
            cgst: acc.cgst + Number(inv.cgstAmount),
            sgst: acc.sgst + Number(inv.sgstAmount),
            igst: acc.igst + Number(inv.igstAmount),
            total: acc.total + Number(inv.totalAmount),
            count: acc.count + 1,
        }), { taxableAmount: 0, cgst: 0, sgst: 0, igst: 0, total: 0, count: 0 });
        const hsnMap = {};
        for (const inv of invoices) {
            for (const item of inv.lineItems) {
                const hsn = item.hsnCode || 'UNKNOWN';
                if (!hsnMap[hsn])
                    hsnMap[hsn] = { hsn, qty: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0 };
                hsnMap[hsn].qty += Number(item.quantity);
                hsnMap[hsn].taxable += Number(item.lineTotal);
                hsnMap[hsn].cgst += Number(item.cgstAmount);
                hsnMap[hsn].sgst += Number(item.sgstAmount);
                hsnMap[hsn].igst += Number(item.igstAmount);
            }
        }
        const totalTaxable = invoices.reduce((s, i) => s + Number(i.taxableAmount), 0);
        const totalCgst = invoices.reduce((s, i) => s + Number(i.cgstAmount), 0);
        const totalSgst = invoices.reduce((s, i) => s + Number(i.sgstAmount), 0);
        const totalIgst = invoices.reduce((s, i) => s + Number(i.igstAmount), 0);
        const totalCess = invoices.reduce((s, i) => s + Number(i.cessAmount), 0);
        const gstReturn = await this.prisma.working.gSTReturn.upsert({
            where: { tenantId_returnType_period: { tenantId, returnType: 'GSTR_1', period } },
            create: {
                tenantId,
                returnType: 'GSTR_1',
                period,
                financialYear: fy,
                b2bInvoices: b2b,
                b2cLarge,
                b2cSmall: b2cSmallTotal,
                hsnSummary: Object.values(hsnMap),
                totalTaxableValue: totalTaxable,
                totalCgst: totalCgst,
                totalSgst: totalSgst,
                totalIgst: totalIgst,
                totalCess: totalCess,
                status: 'GENERATED',
            },
            update: {
                b2bInvoices: b2b,
                b2cLarge,
                b2cSmall: b2cSmallTotal,
                hsnSummary: Object.values(hsnMap),
                totalTaxableValue: totalTaxable,
                totalCgst: totalCgst,
                totalSgst: totalSgst,
                totalIgst: totalIgst,
                totalCess: totalCess,
                status: 'GENERATED',
            },
        });
        return gstReturn;
    }
    async generateGSTR3B(tenantId, period) {
        const fy = this.getFYFromPeriod(period);
        const { start, end } = this.getPeriodDates(period);
        const saleInvoices = await this.prisma.working.invoice.findMany({
            where: { tenantId, status: { notIn: ['DRAFT', 'CANCELLED', 'VOID'] }, invoiceDate: { gte: start, lte: end } },
        });
        const outputCgst = saleInvoices.reduce((s, i) => s + Number(i.cgstAmount), 0);
        const outputSgst = saleInvoices.reduce((s, i) => s + Number(i.sgstAmount), 0);
        const outputIgst = saleInvoices.reduce((s, i) => s + Number(i.igstAmount), 0);
        const outputCess = saleInvoices.reduce((s, i) => s + Number(i.cessAmount), 0);
        const purchaseInvoices = await this.prisma.working.purchaseInvoice.findMany({
            where: { tenantId, status: { notIn: ['DRAFT', 'CANCELLED'] }, invoiceDate: { gte: start, lte: end } },
        });
        const inputCgst = purchaseInvoices.reduce((s, i) => s + Number(i.cgstAmount ?? 0), 0);
        const inputSgst = purchaseInvoices.reduce((s, i) => s + Number(i.sgstAmount ?? 0), 0);
        const inputIgst = purchaseInvoices.reduce((s, i) => s + Number(i.igstAmount ?? 0), 0);
        const inputCess = purchaseInvoices.reduce((s, i) => s + Number(i.cessAmount ?? 0), 0);
        const totalOutputGst = outputCgst + outputSgst + outputIgst + outputCess;
        const totalInputGst = inputCgst + inputSgst + inputIgst + inputCess;
        const netPayable = Math.round((totalOutputGst - totalInputGst) * 100) / 100;
        const totalTaxable = saleInvoices.reduce((s, i) => s + Number(i.taxableAmount), 0);
        const itc = { cgst: inputCgst, sgst: inputSgst, igst: inputIgst, cess: inputCess, total: totalInputGst };
        const gstReturn = await this.prisma.working.gSTReturn.upsert({
            where: { tenantId_returnType_period: { tenantId, returnType: 'GSTR_3B', period } },
            create: {
                tenantId,
                returnType: 'GSTR_3B',
                period,
                financialYear: fy,
                totalTaxableValue: totalTaxable,
                totalCgst: outputCgst,
                totalSgst: outputSgst,
                totalIgst: outputIgst,
                totalCess: outputCess,
                inputTaxCredit: itc,
                netTaxPayable: netPayable,
                status: 'GENERATED',
            },
            update: {
                totalTaxableValue: totalTaxable,
                totalCgst: outputCgst,
                totalSgst: outputSgst,
                totalIgst: outputIgst,
                totalCess: outputCess,
                inputTaxCredit: itc,
                netTaxPayable: netPayable,
                status: 'GENERATED',
            },
        });
        return gstReturn;
    }
    async getInputTaxCredit(tenantId, period) {
        const { start, end } = this.getPeriodDates(period);
        const purchases = await this.prisma.working.purchaseInvoice.findMany({
            where: { tenantId, status: { notIn: ['DRAFT', 'CANCELLED'] }, invoiceDate: { gte: start, lte: end } },
        });
        return {
            cgst: purchases.reduce((s, i) => s + Number(i.cgstAmount ?? 0), 0),
            sgst: purchases.reduce((s, i) => s + Number(i.sgstAmount ?? 0), 0),
            igst: purchases.reduce((s, i) => s + Number(i.igstAmount ?? 0), 0),
            cess: purchases.reduce((s, i) => s + Number(i.cessAmount ?? 0), 0),
            total: purchases.reduce((s, i) => s + Number(i.cgstAmount ?? 0) + Number(i.sgstAmount ?? 0) + Number(i.igstAmount ?? 0) + Number(i.cessAmount ?? 0), 0),
            invoiceCount: purchases.length,
        };
    }
    async findAll(tenantId) {
        return this.prisma.working.gSTReturn.findMany({ where: { tenantId }, orderBy: { period: 'desc' } });
    }
    async findById(tenantId, id) {
        const ret = await this.prisma.working.gSTReturn.findFirst({ where: { id, tenantId } });
        if (!ret)
            throw new common_1.NotFoundException('GST Return not found');
        return ret;
    }
    async markFiled(tenantId, id, userId, acknowledgementNo) {
        return this.prisma.working.gSTReturn.update({
            where: { id },
            data: { status: 'FILED', filedAt: new Date(), filedById: userId, acknowledgementNo },
        });
    }
    getPeriodDates(period) {
        const [year, month] = period.split('-').map(Number);
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        return { start, end };
    }
    getFYFromPeriod(period) {
        const [year, month] = period.split('-').map(Number);
        const fyStart = month >= 4 ? year : year - 1;
        return `${fyStart}-${(fyStart + 1).toString().slice(2)}`;
    }
};
exports.GSTReturnService = GSTReturnService;
exports.GSTReturnService = GSTReturnService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GSTReturnService);
//# sourceMappingURL=gst-return.service.js.map