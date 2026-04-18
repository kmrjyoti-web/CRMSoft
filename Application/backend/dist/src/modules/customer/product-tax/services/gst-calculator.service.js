"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductTaxGstCalculatorService = void 0;
const common_1 = require("@nestjs/common");
let ProductTaxGstCalculatorService = class ProductTaxGstCalculatorService {
    calculateGST(params) {
        const { amount, gstRate, isInterState, taxInclusive } = params;
        const cessRate = params.cessRate || 0;
        const totalRate = gstRate + cessRate;
        const baseAmount = taxInclusive
            ? this.round(amount / (1 + totalRate / 100))
            : amount;
        let cgst = null;
        let sgst = null;
        let igst = null;
        if (isInterState) {
            igst = {
                rate: gstRate,
                amount: this.round(baseAmount * gstRate / 100),
            };
        }
        else {
            cgst = {
                rate: gstRate / 2,
                amount: this.round(baseAmount * gstRate / 200),
            };
            sgst = {
                rate: gstRate / 2,
                amount: this.round(baseAmount * gstRate / 200),
            };
        }
        const cess = {
            rate: cessRate,
            amount: this.round(baseAmount * cessRate / 100),
        };
        const totalTax = (cgst?.amount || 0) +
            (sgst?.amount || 0) +
            (igst?.amount || 0) +
            cess.amount;
        const grandTotal = this.round(baseAmount + totalTax);
        return {
            baseAmount: this.round(baseAmount),
            gstRate,
            isInterState,
            cgst,
            sgst,
            igst,
            cess,
            totalTax: this.round(totalTax),
            grandTotal,
        };
    }
    round(value) {
        return Math.round(value * 100) / 100;
    }
};
exports.ProductTaxGstCalculatorService = ProductTaxGstCalculatorService;
exports.ProductTaxGstCalculatorService = ProductTaxGstCalculatorService = __decorate([
    (0, common_1.Injectable)()
], ProductTaxGstCalculatorService);
//# sourceMappingURL=gst-calculator.service.js.map