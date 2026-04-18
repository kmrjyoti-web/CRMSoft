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
exports.QuotationCalculatorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const config_1 = require("@nestjs/config");
let QuotationCalculatorService = class QuotationCalculatorService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.companyState = this.config.get('COMPANY_STATE', 'Maharashtra');
    }
    isInterState(customerState) {
        if (!customerState)
            return false;
        return customerState.toLowerCase() !== this.companyState.toLowerCase();
    }
    calculateLineItem(item, interState) {
        const qty = item.quantity;
        const price = item.unitPrice;
        const gross = qty * price;
        let discountAmount = 0;
        if (item.discountType === 'PERCENTAGE' && item.discountValue) {
            discountAmount = gross * item.discountValue / 100;
        }
        else if (item.discountType === 'FLAT' && item.discountValue) {
            discountAmount = item.discountValue;
        }
        const lineTotal = Math.round((gross - discountAmount) * 100) / 100;
        const gstRate = item.gstRate || 0;
        const taxAmount = Math.round(lineTotal * gstRate / 100 * 100) / 100;
        let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;
        if (interState) {
            igstAmount = taxAmount;
        }
        else {
            cgstAmount = Math.round(taxAmount / 2 * 100) / 100;
            sgstAmount = Math.round((taxAmount - cgstAmount) * 100) / 100;
        }
        const cessRate = item.cessRate || 0;
        const cessAmount = Math.round(lineTotal * cessRate / 100 * 100) / 100;
        const totalWithTax = Math.round((lineTotal + taxAmount + cessAmount) * 100) / 100;
        return { discountAmount, lineTotal, cgstAmount, sgstAmount, igstAmount, cessAmount, taxAmount, totalWithTax };
    }
    async recalculate(quotationId, customerState, tenantId) {
        const where = { id: quotationId };
        if (tenantId)
            where.tenantId = tenantId;
        const quotation = await this.prisma.working.quotation.findFirst({
            where,
            include: { lineItems: true },
        });
        if (!quotation)
            throw new Error('Quotation not found');
        const interState = this.isInterState(customerState);
        let subtotal = 0, totalCgst = 0, totalSgst = 0, totalIgst = 0, totalCess = 0;
        for (const item of quotation.lineItems) {
            const calc = this.calculateLineItem({
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                discountType: item.discountType || undefined,
                discountValue: item.discountValue ? Number(item.discountValue) : undefined,
                gstRate: item.gstRate ? Number(item.gstRate) : undefined,
                cessRate: item.cessRate ? Number(item.cessRate) : undefined,
                isOptional: item.isOptional,
            }, interState);
            await this.prisma.working.quotationLineItem.updateMany({
                where: { id: item.id, ...(tenantId ? { tenantId } : {}) },
                data: {
                    discountAmount: calc.discountAmount,
                    lineTotal: calc.lineTotal,
                    cgstAmount: calc.cgstAmount,
                    sgstAmount: calc.sgstAmount,
                    igstAmount: calc.igstAmount,
                    cessAmount: calc.cessAmount,
                    taxAmount: calc.taxAmount,
                    totalWithTax: calc.totalWithTax,
                },
            });
            if (!item.isOptional) {
                subtotal += calc.lineTotal;
                totalCgst += calc.cgstAmount;
                totalSgst += calc.sgstAmount;
                totalIgst += calc.igstAmount;
                totalCess += calc.cessAmount;
            }
        }
        let globalDiscount = 0;
        if (quotation.discountType === 'PERCENTAGE') {
            globalDiscount = subtotal * Number(quotation.discountValue) / 100;
        }
        else if (quotation.discountType === 'FLAT') {
            globalDiscount = Number(quotation.discountValue);
        }
        globalDiscount = Math.round(globalDiscount * 100) / 100;
        const taxableAmount = Math.round((subtotal - globalDiscount) * 100) / 100;
        const totalTax = Math.round((totalCgst + totalSgst + totalIgst + totalCess) * 100) / 100;
        const rawTotal = taxableAmount + totalTax;
        const roundOff = Math.round(rawTotal) - rawTotal;
        const totalAmount = Math.round(rawTotal + roundOff);
        const totals = {
            subtotal, discountAmount: globalDiscount, taxableAmount,
            cgstAmount: totalCgst, sgstAmount: totalSgst, igstAmount: totalIgst,
            cessAmount: totalCess, totalTax,
            roundOff: Math.round(roundOff * 100) / 100, totalAmount,
        };
        await this.prisma.working.quotation.updateMany({
            where: { id: quotationId, ...(tenantId ? { tenantId } : {}) },
            data: {
                subtotal: totals.subtotal,
                discountAmount: totals.discountAmount,
                taxableAmount: totals.taxableAmount,
                cgstAmount: totals.cgstAmount,
                sgstAmount: totals.sgstAmount,
                igstAmount: totals.igstAmount,
                cessAmount: totals.cessAmount,
                totalTax: totals.totalTax,
                roundOff: totals.roundOff,
                totalAmount: totals.totalAmount,
            },
        });
        return totals;
    }
};
exports.QuotationCalculatorService = QuotationCalculatorService;
exports.QuotationCalculatorService = QuotationCalculatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], QuotationCalculatorService);
//# sourceMappingURL=quotation-calculator.service.js.map