"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmountInWordsService = void 0;
const common_1 = require("@nestjs/common");
let AmountInWordsService = class AmountInWordsService {
    constructor() {
        this.ones = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen',
        ];
        this.tens = [
            '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
        ];
    }
    convert(amount, currency = 'INR') {
        if (amount === 0)
            return 'Zero Rupees Only';
        const isNegative = amount < 0;
        amount = Math.abs(amount);
        const rupees = Math.floor(amount);
        const paise = Math.round((amount - rupees) * 100);
        let words = '';
        if (currency === 'INR') {
            words = this.convertIndian(rupees);
            if (words)
                words += ' Rupees';
            if (paise > 0) {
                const paiseWords = this.convertBelow100(paise);
                words += (words ? ' and ' : '') + paiseWords + ' Paise';
            }
        }
        else {
            words = this.convertWestern(rupees);
            if (words)
                words += ' ' + currency;
        }
        if (!words)
            words = 'Zero Rupees';
        return (isNegative ? 'Minus ' : '') + words + ' Only';
    }
    convertIndian(n) {
        if (n === 0)
            return '';
        const parts = [];
        const crore = Math.floor(n / 10000000);
        n %= 10000000;
        const lakh = Math.floor(n / 100000);
        n %= 100000;
        const thousand = Math.floor(n / 1000);
        n %= 1000;
        const hundred = Math.floor(n / 100);
        const remainder = n % 100;
        if (crore > 0)
            parts.push(this.convertBelow100(crore) + ' Crore');
        if (lakh > 0)
            parts.push(this.convertBelow100(lakh) + ' Lakh');
        if (thousand > 0)
            parts.push(this.convertBelow100(thousand) + ' Thousand');
        if (hundred > 0)
            parts.push(this.ones[hundred] + ' Hundred');
        if (remainder > 0)
            parts.push(this.convertBelow100(remainder));
        return parts.join(' ');
    }
    convertWestern(n) {
        if (n === 0)
            return '';
        const parts = [];
        const billion = Math.floor(n / 1000000000);
        n %= 1000000000;
        const million = Math.floor(n / 1000000);
        n %= 1000000;
        const thousand = Math.floor(n / 1000);
        n %= 1000;
        const hundred = Math.floor(n / 100);
        const remainder = n % 100;
        if (billion > 0)
            parts.push(this.convertBelow1000(billion) + ' Billion');
        if (million > 0)
            parts.push(this.convertBelow1000(million) + ' Million');
        if (thousand > 0)
            parts.push(this.convertBelow1000(thousand) + ' Thousand');
        if (hundred > 0)
            parts.push(this.ones[hundred] + ' Hundred');
        if (remainder > 0)
            parts.push(this.convertBelow100(remainder));
        return parts.join(' ');
    }
    convertBelow100(n) {
        if (n < 20)
            return this.ones[n];
        return this.tens[Math.floor(n / 10)] + (n % 10 ? ' ' + this.ones[n % 10] : '');
    }
    convertBelow1000(n) {
        const hundred = Math.floor(n / 100);
        const remainder = n % 100;
        const parts = [];
        if (hundred > 0)
            parts.push(this.ones[hundred] + ' Hundred');
        if (remainder > 0)
            parts.push(this.convertBelow100(remainder));
        return parts.join(' ');
    }
};
exports.AmountInWordsService = AmountInWordsService;
exports.AmountInWordsService = AmountInWordsService = __decorate([
    (0, common_1.Injectable)()
], AmountInWordsService);
//# sourceMappingURL=amount-in-words.service.js.map