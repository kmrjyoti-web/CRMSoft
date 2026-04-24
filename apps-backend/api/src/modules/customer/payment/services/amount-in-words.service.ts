import { Injectable } from '@nestjs/common';

/**
 * Converts numeric amounts to Indian numbering system words.
 * e.g. 1,23,45,678.50 → "One Crore Twenty Three Lakh Forty Five Thousand
 *       Six Hundred Seventy Eight Rupees and Fifty Paise Only"
 */
@Injectable()
export class AmountInWordsService {
  private readonly ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];

  private readonly tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
  ];

  convert(amount: number, currency = 'INR'): string {
    if (amount === 0) return 'Zero Rupees Only';

    const isNegative = amount < 0;
    amount = Math.abs(amount);

    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    let words = '';

    if (currency === 'INR') {
      words = this.convertIndian(rupees);
      if (words) words += ' Rupees';
      if (paise > 0) {
        const paiseWords = this.convertBelow100(paise);
        words += (words ? ' and ' : '') + paiseWords + ' Paise';
      }
    } else {
      words = this.convertWestern(rupees);
      if (words) words += ' ' + currency;
    }

    if (!words) words = 'Zero Rupees';

    return (isNegative ? 'Minus ' : '') + words + ' Only';
  }

  /**
   * Indian numbering: Crore, Lakh, Thousand, Hundred
   */
  private convertIndian(n: number): string {
    if (n === 0) return '';

    const parts: string[] = [];

    const crore = Math.floor(n / 10000000);
    n %= 10000000;
    const lakh = Math.floor(n / 100000);
    n %= 100000;
    const thousand = Math.floor(n / 1000);
    n %= 1000;
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;

    if (crore > 0) parts.push(this.convertBelow100(crore) + ' Crore');
    if (lakh > 0) parts.push(this.convertBelow100(lakh) + ' Lakh');
    if (thousand > 0) parts.push(this.convertBelow100(thousand) + ' Thousand');
    if (hundred > 0) parts.push(this.ones[hundred] + ' Hundred');
    if (remainder > 0) parts.push(this.convertBelow100(remainder));

    return parts.join(' ');
  }

  /**
   * Western numbering: Billion, Million, Thousand, Hundred
   */
  private convertWestern(n: number): string {
    if (n === 0) return '';

    const parts: string[] = [];

    const billion = Math.floor(n / 1000000000);
    n %= 1000000000;
    const million = Math.floor(n / 1000000);
    n %= 1000000;
    const thousand = Math.floor(n / 1000);
    n %= 1000;
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;

    if (billion > 0) parts.push(this.convertBelow1000(billion) + ' Billion');
    if (million > 0) parts.push(this.convertBelow1000(million) + ' Million');
    if (thousand > 0) parts.push(this.convertBelow1000(thousand) + ' Thousand');
    if (hundred > 0) parts.push(this.ones[hundred] + ' Hundred');
    if (remainder > 0) parts.push(this.convertBelow100(remainder));

    return parts.join(' ');
  }

  private convertBelow100(n: number): string {
    if (n < 20) return this.ones[n];
    return this.tens[Math.floor(n / 10)] + (n % 10 ? ' ' + this.ones[n % 10] : '');
  }

  private convertBelow1000(n: number): string {
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    const parts: string[] = [];
    if (hundred > 0) parts.push(this.ones[hundred] + ' Hundred');
    if (remainder > 0) parts.push(this.convertBelow100(remainder));
    return parts.join(' ');
  }
}
