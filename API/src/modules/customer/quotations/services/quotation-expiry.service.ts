import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class QuotationExpiryService {
  private readonly logger = new Logger(QuotationExpiryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check for expired quotations every hour.
   * Moves SENT/VIEWED/NEGOTIATION quotations past validUntil to EXPIRED.
   * Called by cron-engine (QUOTATION_EXPIRY).
   */
  async checkExpiry(): Promise<void> {
    const now = new Date();

    const expiredQuotations = await this.prisma.quotation.findMany({
      where: {
        status: { in: ['SENT', 'VIEWED', 'NEGOTIATION'] },
        validUntil: { lt: now },
      },
      select: { id: true, quotationNo: true, status: true },
    });

    if (expiredQuotations.length === 0) return;

    for (const q of expiredQuotations) {
      await this.prisma.quotation.update({
        where: { id: q.id },
        data: { status: 'EXPIRED' },
      });

      await this.prisma.quotationActivity.create({
        data: {
          quotationId: q.id,
          action: 'EXPIRED',
          description: `Quotation ${q.quotationNo} expired — validity period ended`,
          previousValue: q.status,
          newValue: 'EXPIRED',
          changedField: 'status',
          performedById: 'SYSTEM',
          performedByName: 'System',
        },
      });
    }

    this.logger.log(`Expired ${expiredQuotations.length} quotation(s)`);
  }
}
