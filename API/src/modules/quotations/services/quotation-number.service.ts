import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class QuotationNumberService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate unique quotation number: QTN-YYYY-NNNNN
   * Sequential per year, zero-padded to 5 digits.
   */
  async generateNumber(tenantId?: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `QTN-${year}-`;
    const where: any = { quotationNo: { startsWith: prefix } };
    if (tenantId) where.tenantId = tenantId;

    const last = await this.prisma.quotation.findFirst({
      where,
      orderBy: { quotationNo: 'desc' },
      select: { quotationNo: true },
    });

    let seq = 1;
    if (last) {
      const parts = last.quotationNo.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }

    return `${prefix}${String(seq).padStart(5, '0')}`;
  }

  /**
   * Generate revision number: QTN-2026-00001-R1, R2, R3...
   */
  generateRevisionNumber(parentNo: string, version: number): string {
    // Strip any existing -Rn suffix
    const base = parentNo.replace(/-R\d+$/, '');
    return `${base}-R${version - 1}`;
  }
}
