import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

export interface CompareWeights {
  priceWeight: number;
  deliveryWeight: number;
  creditWeight: number;
  qualityWeight: number;
}

@Injectable()
export class CompareEngineService {
  constructor(private readonly prisma: PrismaService) {}

  async compareQuotations(tenantId: string, rfqId: string, weights?: Partial<CompareWeights>) {
    const w: CompareWeights = {
      priceWeight: weights?.priceWeight ?? 40,
      deliveryWeight: weights?.deliveryWeight ?? 25,
      creditWeight: weights?.creditWeight ?? 20,
      qualityWeight: weights?.qualityWeight ?? 15,
    };

    const totalWeight = w.priceWeight + w.deliveryWeight + w.creditWeight + w.qualityWeight;
    w.priceWeight = (w.priceWeight / totalWeight) * 100;
    w.deliveryWeight = (w.deliveryWeight / totalWeight) * 100;
    w.creditWeight = (w.creditWeight / totalWeight) * 100;
    w.qualityWeight = (w.qualityWeight / totalWeight) * 100;

    const quotations = await this.prisma.working.purchaseQuotation.findMany({
      where: { tenantId, rfqId, status: { in: ['RECEIVED', 'UNDER_REVIEW'] } },
      include: { items: true },
    });

    if (quotations.length < 2) {
      throw new BadRequestException('At least 2 quotations required for comparison');
    }

    const metrics = quotations.map((q) => ({
      quotationId: q.id,
      vendorId: q.vendorId,
      grandTotal: q.grandTotal?.toNumber() ?? 0,
      deliveryDays: q.deliveryDays ?? 30,
      creditDays: q.creditDays ?? 0,
    }));

    const prices = metrics.map((m) => m.grandTotal);
    const deliveries = metrics.map((m) => m.deliveryDays);
    const credits = metrics.map((m) => m.creditDays);

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const minDelivery = Math.min(...deliveries);
    const maxDelivery = Math.max(...deliveries);
    const minCredit = Math.min(...credits);
    const maxCredit = Math.max(...credits);

    const scores = metrics.map((m) => {
      const priceScore = maxPrice === minPrice ? 100
        : 100 - ((m.grandTotal - minPrice) / (maxPrice - minPrice)) * 100;
      const deliveryScore = maxDelivery === minDelivery ? 100
        : 100 - ((m.deliveryDays - minDelivery) / (maxDelivery - minDelivery)) * 100;
      const creditScore = maxCredit === minCredit ? 100
        : ((m.creditDays - minCredit) / (maxCredit - minCredit)) * 100;
      const qualityScore = 75;

      const totalScore = (
        priceScore * (w.priceWeight / 100) +
        deliveryScore * (w.deliveryWeight / 100) +
        creditScore * (w.creditWeight / 100) +
        qualityScore * (w.qualityWeight / 100)
      );

      return {
        quotationId: m.quotationId,
        vendorId: m.vendorId,
        priceScore: Math.round(priceScore * 10) / 10,
        deliveryScore: Math.round(deliveryScore * 10) / 10,
        creditScore: Math.round(creditScore * 10) / 10,
        qualityScore,
        totalScore: Math.round(totalScore * 10) / 10,
        grandTotal: m.grandTotal,
        deliveryDays: m.deliveryDays,
        creditDays: m.creditDays,
      };
    });

    scores.sort((a, b) => b.totalScore - a.totalScore);

    const comparison = await this.prisma.working.quotationComparison.create({
      data: {
        tenantId,
        rfqId,
        compareBy: 'WEIGHTED_SCORE',
        customWeights: w as any,
        comparisonData: scores as any,
        selectedQuotationId: scores[0].quotationId,
        status: 'COMPLETED',
        createdById: '',
      },
    });

    return { comparison, scores, weights: w };
  }

  async getComparison(tenantId: string, id: string) {
    const comparison = await this.prisma.working.quotationComparison.findFirst({
      where: { id, tenantId },
    });
    if (!comparison) throw new NotFoundException('Comparison not found');
    return comparison;
  }

  async listByRfq(tenantId: string, rfqId: string) {
    return this.prisma.working.quotationComparison.findMany({
      where: { tenantId, rfqId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async selectWinner(tenantId: string, comparisonId: string, quotationId: string, remarks?: string) {
    const comparison = await this.prisma.working.quotationComparison.findFirst({
      where: { id: comparisonId, tenantId },
    });
    if (!comparison) throw new NotFoundException('Comparison not found');

    await this.prisma.working.quotationComparison.update({
      where: { id: comparisonId },
      data: { selectedQuotationId: quotationId },
    });

    await this.prisma.working.purchaseQuotation.update({
      where: { id: quotationId },
      data: { status: 'ACCEPTED' },
    });

    await this.prisma.working.purchaseQuotation.updateMany({
      where: {
        tenantId,
        rfqId: comparison.rfqId,
        id: { not: quotationId },
        status: { in: ['RECEIVED', 'UNDER_REVIEW'] },
      },
      data: { status: 'REJECTED' },
    });

    return this.getComparison(tenantId, comparisonId);
  }
}
