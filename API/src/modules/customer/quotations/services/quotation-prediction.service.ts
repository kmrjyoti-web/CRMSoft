import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

export interface PredictionResult {
  score: number;
  confidence: string;
  recommendations: {
    suggestedProducts: { productId: string; name: string; reason: string }[];
    suggestedPriceRange: { min: number; max: number; optimal: number } | null;
    suggestedDiscount: { min: number; max: number; sweet_spot: number };
    suggestedPriceType: string;
    suggestedPaymentTerms: string;
    suggestedValidityDays: number;
    estimatedTimeToClose: number;
  };
  warnings: string[];
  similarDeals: any[];
}

@Injectable()
export class QuotationPredictionService {
  constructor(private readonly prisma: PrismaService) {}

  /** Rule-based prediction matrix for a lead. */
  async predict(leadId: string): Promise<PredictionResult> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        contact: { select: { designation: true, department: true } },
        organization: { select: { industry: true, city: true, state: true } },
        filters: { include: { lookupValue: { select: { value: true, lookup: { select: { category: true } } } } } },
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    const industry = lead.organization?.industry || 'Unknown';
    const expectedValue = lead.expectedValue ? Number(lead.expectedValue) : 0;

    // Find similar historical leads: same industry, similar value ±30%
    const valueLow = expectedValue * 0.7;
    const valueHigh = expectedValue * 1.3;

    const similarLeads = await this.prisma.lead.findMany({
      where: {
        id: { not: leadId },
        status: { in: ['WON', 'LOST'] },
        organization: industry !== 'Unknown' ? { industry } : undefined,
        expectedValue: expectedValue > 0 ? { gte: valueLow, lte: valueHigh } : undefined,
      },
      include: {
        quotations: {
          select: {
            id: true, status: true, totalAmount: true, discountValue: true,
            priceType: true, paymentTerms: true, acceptedAt: true, createdAt: true,
            rejectedReason: true,
            lineItems: { select: { productId: true, productName: true } },
          },
        },
      },
      take: 50,
    });

    // Analyze accepted vs rejected
    const acceptedQuotations = similarLeads.flatMap((l) => l.quotations.filter((q) => q.status === 'ACCEPTED'));
    const rejectedQuotations = similarLeads.flatMap((l) => l.quotations.filter((q) => q.status === 'REJECTED'));

    const avgAcceptedDiscount = this.avg(acceptedQuotations.map((q) => Number(q.discountValue || 0)));
    const avgAcceptedValue = this.avg(acceptedQuotations.map((q) => Number(q.totalAmount)));
    const avgRejectedValue = this.avg(rejectedQuotations.map((q) => Number(q.totalAmount)));

    // Top products from accepted quotations
    const productCounts: Record<string, { count: number; id: string; name: string }> = {};
    for (const q of acceptedQuotations) {
      for (const item of q.lineItems) {
        const key = item.productId || item.productName;
        if (!productCounts[key]) productCounts[key] = { count: 0, id: item.productId || '', name: item.productName };
        productCounts[key].count++;
      }
    }
    const topProducts = Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((p) => ({ productId: p.id, name: p.name, reason: `Appeared in ${p.count} won deals` }));

    // Avg time to close
    const closeTimes = acceptedQuotations
      .filter((q) => q.acceptedAt && q.createdAt)
      .map((q) => (q.acceptedAt!.getTime() - q.createdAt.getTime()) / 86400000);
    const avgTimeToClose = closeTimes.length > 0 ? Math.round(this.avg(closeTimes)) : 14;

    // Calculate score
    let score = 50;
    if (lead.priority === 'URGENT') score += 15;
    else if (lead.priority === 'HIGH') score += 12;
    else if (lead.priority === 'MEDIUM') score += 8;
    else score += 3;

    // Industry conversion bonus
    const totalSimilar = acceptedQuotations.length + rejectedQuotations.length;
    if (totalSimilar > 0) {
      const industryRate = acceptedQuotations.length / totalSimilar;
      score += Math.round(industryRate * 15);
    }

    // Budget match bonus
    if (expectedValue > 0 && avgAcceptedValue > 0) {
      const ratio = expectedValue / avgAcceptedValue;
      if (ratio >= 0.8 && ratio <= 1.2) score += 10;
    }

    // Contact seniority bonus
    const designation = lead.contact?.designation?.toLowerCase() || '';
    if (['ceo', 'cto', 'cfo', 'director', 'vp', 'president'].some((t) => designation.includes(t))) {
      score += 10;
    } else if (['manager', 'head', 'lead'].some((t) => designation.includes(t))) {
      score += 5;
    }

    // Penalties
    if (!lead.organization) score -= 10;
    const filters = lead.filters.map((f) => f.lookupValue.value.toLowerCase());
    if (filters.includes('cold')) score -= 15;

    score = Math.max(0, Math.min(100, score));

    // Warnings
    const warnings: string[] = [];
    if (avgRejectedValue > 0 && expectedValue > avgRejectedValue) {
      warnings.push(`Similar leads rejected quotations above ₹${Math.round(avgRejectedValue).toLocaleString()}`);
    }
    if (rejectedQuotations.length > acceptedQuotations.length) {
      warnings.push('More similar deals were lost than won — consider competitive pricing');
    }
    if (!lead.organization) {
      warnings.push('No organization linked — conversion rates are typically lower');
    }

    const confidence = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';
    const discountSweet = avgAcceptedDiscount > 0 ? Math.round(avgAcceptedDiscount) : 8;

    return {
      score, confidence,
      recommendations: {
        suggestedProducts: topProducts,
        suggestedPriceRange: avgAcceptedValue > 0
          ? { min: Math.round(avgAcceptedValue * 0.85), max: Math.round(avgAcceptedValue * 1.15), optimal: Math.round(avgAcceptedValue) }
          : null,
        suggestedDiscount: { min: Math.max(0, discountSweet - 3), max: discountSweet + 5, sweet_spot: discountSweet },
        suggestedPriceType: acceptedQuotations.some((q) => q.priceType === 'RANGE') ? 'RANGE' : 'FIXED',
        suggestedPaymentTerms: this.mostCommon(acceptedQuotations.map((q) => q.paymentTerms).filter(Boolean) as string[]) || '50% advance, 50% on delivery',
        suggestedValidityDays: 30,
        estimatedTimeToClose: avgTimeToClose,
      },
      warnings,
      similarDeals: similarLeads.slice(0, 5).map((l) => ({
        leadNumber: l.leadNumber, status: l.status,
        quotations: l.quotations.map((q) => ({
          quotationNo: undefined, status: q.status,
          value: Number(q.totalAmount), daysToClose: q.acceptedAt && q.createdAt
            ? Math.round((q.acceptedAt.getTime() - q.createdAt.getTime()) / 86400000) : null,
        })),
      })),
    };
  }

  /** Smart questions based on lead data gaps. */
  async getQuestions(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { organization: true, contact: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    const questions: any[] = [];

    if (!lead.expectedValue) {
      questions.push({
        id: 'budget', question: "What is the customer's budget range?",
        type: 'RANGE', required: true,
        reason: 'Budget info improves prediction accuracy by 25%',
      });
    }
    if (!lead.expectedCloseDate) {
      questions.push({
        id: 'timeline', question: 'When does the customer need this?',
        type: 'SELECT', options: ['Immediate', '1-3 months', '3-6 months', '6+ months'],
        required: true, reason: 'Urgency affects pricing strategy',
      });
    }
    questions.push({
      id: 'competitor', question: 'Is the customer evaluating competitors?',
      type: 'BOOLEAN', required: false,
      reason: 'Competitor awareness helps set competitive pricing',
    });
    if (!lead.contact?.designation) {
      questions.push({
        id: 'decision_maker', question: 'Is the contact the final decision maker?',
        type: 'BOOLEAN', required: false,
        reason: 'Non-decision-makers need lower initial quotes',
      });
    }
    questions.push({
      id: 'requirements', question: 'Describe specific customer requirements',
      type: 'TEXT', required: false,
      reason: 'Specific requirements help suggest right products',
    });

    return questions;
  }

  private avg(nums: number[]): number {
    if (nums.length === 0) return 0;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  }

  private mostCommon(items: string[]): string | undefined {
    if (items.length === 0) return undefined;
    const freq: Record<string, number> = {};
    for (const i of items) freq[i] = (freq[i] || 0) + 1;
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
  }
}
