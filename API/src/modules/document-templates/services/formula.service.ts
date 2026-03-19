import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { create, all, MathJsInstance } from 'mathjs';

@Injectable()
export class FormulaService {
  private readonly logger = new Logger(FormulaService.name);
  private math: MathJsInstance;

  constructor(private readonly prisma: PrismaService) {
    this.math = create(all, {});
    this.registerCustomFunctions();
  }

  // Register custom formula functions
  private registerCustomFunctions() {
    this.math.import({
      // FORMAT_INR: format number as Indian currency
      FORMAT_INR: (n: number) => {
        if (n == null || isNaN(n)) return '₹0.00';
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n);
      },
      // ROUND_INR: round to N decimals (mathjs already has round(), alias for clarity)
      ROUND2: (n: number, decimals = 2) => {
        const factor = Math.pow(10, decimals);
        return Math.round(n * factor) / factor;
      },
      // IS_INTERSTATE: check if two state codes differ
      IS_INTERSTATE: (companyState: string, customerState: string) => {
        return companyState !== customerState ? 1 : 0;
      },
      // CONCAT: join values into a string
      CONCAT: (...args: unknown[]) => args.join(''),
      // TODAY: current date as ISO string
      TODAY: () => new Date().toISOString().split('T')[0],
      // PAGE_NO: placeholder, resolved at render time
      PAGE_NO: () => 1,
      // AMOUNT_WORDS: number to Indian English words
      AMOUNT_WORDS: (amount: number) => this.numberToWordsINR(amount),
    }, { override: true });
  }

  // ── CRUD ──

  async findAll(tenantId?: string) {
    const orConditions: any[] = [{ isSystem: true }];
    if (tenantId) orConditions.push({ tenantId });
    return this.prisma.savedFormula.findMany({
      where: { OR: orConditions },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(id: string) {
    const formula = await this.prisma.savedFormula.findUnique({ where: { id } });
    if (!formula) throw new NotFoundException(`Formula "${id}" not found`);
    return formula;
  }

  async findByCategory(category: string, tenantId?: string) {
    const orConditions: any[] = [{ isSystem: true }];
    if (tenantId) orConditions.push({ tenantId });
    return this.prisma.savedFormula.findMany({
      where: { category, OR: orConditions },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: {
    name: string;
    category: string;
    expression: string;
    description?: string;
    requiredFields?: string[];
    outputType?: string;
    outputFormat?: string;
    tenantId?: string;
    isSystem?: boolean;
  }) {
    this.logger.log(`Creating formula: ${data.name}`);
    return this.prisma.savedFormula.create({
      data: {
        name: data.name,
        category: data.category,
        expression: data.expression,
        description: data.description,
        requiredFields: data.requiredFields ?? [],
        outputType: data.outputType ?? 'number',
        outputFormat: data.outputFormat,
        tenantId: data.tenantId,
        isSystem: data.isSystem ?? false,
      },
    });
  }

  async update(id: string, data: {
    name?: string;
    category?: string;
    expression?: string;
    description?: string;
    requiredFields?: string[];
    outputType?: string;
    outputFormat?: string;
  }) {
    await this.findById(id);
    this.logger.log(`Updating formula: ${id}`);
    return this.prisma.savedFormula.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    this.logger.log(`Deleting formula: ${id}`);
    return this.prisma.savedFormula.delete({ where: { id } });
  }

  // ── EVALUATE ──

  evaluate(expression: string, variables: Record<string, unknown> = {}): unknown {
    try {
      return this.math.evaluate(expression, variables);
    } catch (error) {
      this.logger.warn(`Formula evaluation failed: ${expression}`, error);
      return null;
    }
  }

  // ── HELPERS ──

  private numberToWordsINR(amount: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertChunk = (n: number): string => {
      if (n === 0) return '';
      if (n < 20) return ones[n];
      if (n < 100) {
        const remainder = n % 10;
        return tens[Math.floor(n / 10)] + (remainder ? '-' + ones[remainder] : '');
      }
      const remainder = n % 100;
      return ones[Math.floor(n / 100)] + ' Hundred' + (remainder ? ' and ' + convertChunk(remainder) : '');
    };

    const convertIndian = (n: number): string => {
      if (n === 0) return 'Zero';
      let result = '';
      let remaining = n;
      if (remaining >= 10000000) {
        result += convertChunk(Math.floor(remaining / 10000000)) + ' Crore ';
        remaining %= 10000000;
      }
      if (remaining >= 100000) {
        result += convertChunk(Math.floor(remaining / 100000)) + ' Lakh ';
        remaining %= 100000;
      }
      if (remaining >= 1000) {
        result += convertChunk(Math.floor(remaining / 1000)) + ' Thousand ';
        remaining %= 1000;
      }
      if (remaining > 0) result += convertChunk(remaining);
      return result.trim();
    };

    const rupees = Math.floor(Math.abs(amount));
    const paise = Math.round((Math.abs(amount) - rupees) * 100);
    let words = convertIndian(rupees) + ' Rupees';
    if (paise > 0) words += ' and ' + convertIndian(paise) + ' Paise';
    words += ' Only';
    return words;
  }
}
