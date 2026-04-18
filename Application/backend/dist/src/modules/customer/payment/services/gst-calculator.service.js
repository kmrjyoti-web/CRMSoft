"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GstCalculatorService = void 0;
const common_1 = require("@nestjs/common");
let GstCalculatorService = class GstCalculatorService {
    calculate(lines, isInterState, overallDiscountType, overallDiscountValue) {
        let subtotal = 0;
        let totalDiscountAmount = 0;
        let totalTaxable = 0;
        let totalCgst = 0;
        let totalSgst = 0;
        let totalIgst = 0;
        let totalCess = 0;
        const lineResults = lines.map((line) => {
            const gross = this.round(line.quantity * line.unitPrice);
            let lineDiscount = 0;
            if (line.discountType === 'PERCENTAGE' && line.discountValue) {
                lineDiscount = this.round(gross * line.discountValue / 100);
            }
            else if (line.discountType === 'FLAT' && line.discountValue) {
                lineDiscount = this.round(line.discountValue);
            }
            const lineTotal = this.round(gross - lineDiscount);
            const taxable = lineTotal;
            const gstRate = line.gstRate || 0;
            const cessRate = line.cessRate || 0;
            let cgst = 0, sgst = 0, igst = 0;
            if (isInterState) {
                igst = this.round(taxable * gstRate / 100);
            }
            else {
                cgst = this.round(taxable * (gstRate / 2) / 100);
                sgst = this.round(taxable * (gstRate / 2) / 100);
            }
            const cess = this.round(taxable * cessRate / 100);
            const taxAmount = cgst + sgst + igst + cess;
            subtotal += lineTotal;
            totalDiscountAmount += lineDiscount;
            totalCgst += cgst;
            totalSgst += sgst;
            totalIgst += igst;
            totalCess += cess;
            return {
                lineTotal,
                discountAmount: lineDiscount,
                taxableAmount: taxable,
                cgstAmount: cgst,
                sgstAmount: sgst,
                igstAmount: igst,
                cessAmount: cess,
                taxAmount,
                totalWithTax: this.round(taxable + taxAmount),
            };
        });
        let overallDiscount = 0;
        if (overallDiscountType === 'PERCENTAGE' && overallDiscountValue) {
            overallDiscount = this.round(subtotal * overallDiscountValue / 100);
        }
        else if (overallDiscountType === 'FLAT' && overallDiscountValue) {
            overallDiscount = this.round(overallDiscountValue);
        }
        totalTaxable = this.round(subtotal - overallDiscount);
        totalDiscountAmount += overallDiscount;
        const totalTax = totalCgst + totalSgst + totalIgst + totalCess;
        const rawTotal = totalTaxable + totalTax;
        const roundOff = this.round(Math.round(rawTotal) - rawTotal);
        const totalAmount = Math.round(rawTotal);
        return {
            subtotal,
            discountAmount: totalDiscountAmount,
            taxableAmount: totalTaxable,
            cgstAmount: totalCgst,
            sgstAmount: totalSgst,
            igstAmount: totalIgst,
            cessAmount: totalCess,
            totalTax,
            roundOff,
            totalAmount,
            lines: lineResults,
        };
    }
    isInterState(sellerGst, buyerGst) {
        if (!sellerGst || !buyerGst)
            return false;
        return sellerGst.substring(0, 2) !== buyerGst.substring(0, 2);
    }
    isInterStateByName(sellerState, buyerState) {
        if (!sellerState || !buyerState)
            return false;
        return sellerState.toLowerCase().trim() !== buyerState.toLowerCase().trim();
    }
    round(val) {
        return Math.round(val * 100) / 100;
    }
};
exports.GstCalculatorService = GstCalculatorService;
exports.GstCalculatorService = GstCalculatorService = __decorate([
    (0, common_1.Injectable)()
], GstCalculatorService);
//# sourceMappingURL=gst-calculator.service.js.map