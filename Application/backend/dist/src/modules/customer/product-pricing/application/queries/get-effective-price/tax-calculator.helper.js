"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toNum = toNum;
exports.round = round;
exports.calculateTax = calculateTax;
const library_1 = require("@prisma/client/runtime/library");
function toNum(val) {
    if (val instanceof library_1.Decimal)
        return val.toNumber();
    return Number(val) || 0;
}
function round(val) {
    return Math.round(val * 100) / 100;
}
function calculateTax(input) {
    const { basePrice, gstRate, cessRate, taxType, taxInclusive, isInterState, quantity, } = input;
    const isExempt = taxType === 'EXEMPT' || taxType === 'ZERO_RATED';
    let baseAmount;
    let gstAmount;
    if (isExempt) {
        baseAmount = basePrice;
        gstAmount = 0;
    }
    else if (taxInclusive) {
        baseAmount = basePrice / (1 + gstRate / 100);
        gstAmount = basePrice - baseAmount;
    }
    else {
        baseAmount = basePrice;
        gstAmount = baseAmount * (gstRate / 100);
    }
    const cessAmount = isExempt ? 0 : baseAmount * (cessRate / 100);
    const totalTax = gstAmount + cessAmount;
    const unitTotal = taxInclusive ? basePrice : baseAmount + totalTax;
    const tax = buildTaxBreakup(taxType, gstRate, gstAmount, cessRate, cessAmount, totalTax, isInterState, quantity);
    return { baseAmount, totalTax, unitTotal, tax };
}
function buildTaxBreakup(taxType, gstRate, gstAmount, cessRate, cessAmount, totalTax, isInterState, quantity) {
    const isExempt = taxType === 'EXEMPT' || taxType === 'ZERO_RATED';
    if (isExempt) {
        return {
            taxType, gstRate: 0,
            cgst: null, sgst: null, igst: null,
            cess: { rate: 0, amount: 0 },
            totalTax: 0,
        };
    }
    const cgst = !isInterState
        ? { rate: round(gstRate / 2), amount: round((gstAmount / 2) * quantity) }
        : null;
    const sgst = !isInterState
        ? { rate: round(gstRate / 2), amount: round((gstAmount / 2) * quantity) }
        : null;
    const igst = isInterState
        ? { rate: round(gstRate), amount: round(gstAmount * quantity) }
        : null;
    return {
        taxType, gstRate, cgst, sgst, igst,
        cess: { rate: cessRate, amount: round(cessAmount * quantity) },
        totalTax: round(totalTax * quantity),
    };
}
//# sourceMappingURL=tax-calculator.helper.js.map