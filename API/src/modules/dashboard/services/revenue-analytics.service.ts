import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

const STAGE_PROBABILITY: Record<string, number> = {
  IN_PROGRESS: 40, DEMO_SCHEDULED: 50, QUOTATION_SENT: 70, NEGOTIATION: 85,
};

@Injectable()
export class RevenueAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueAnalytics(params: { dateFrom: Date; dateTo: Date; groupBy?: string }) {
    const { dateFrom, dateTo } = params;

    const wonLeads = await this.prisma.lead.findMany({
      where: { status: 'WON', updatedAt: { gte: dateFrom, lte: dateTo } },
      select: { leadNumber: true, expectedValue: true, updatedAt: true, createdAt: true,
        organization: { select: { name: true } }, contact: { select: { firstName: true, lastName: true } } },
      orderBy: { expectedValue: 'desc' },
    });

    const wonTotal = wonLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
    const avgDealSize = wonLeads.length > 0 ? Math.round(wonTotal / wonLeads.length) : 0;

    // Pipeline by stage
    const pipelineLeads = await this.prisma.lead.groupBy({
      by: ['status'],
      where: { status: { in: ['IN_PROGRESS', 'DEMO_SCHEDULED', 'QUOTATION_SENT', 'NEGOTIATION'] } },
      _sum: { expectedValue: true },
      _count: true,
    });

    const byStage = pipelineLeads.map(s => ({
      stage: s.status, value: Number(s._sum.expectedValue || 0),
      weighted: Math.round(Number(s._sum.expectedValue || 0) * (STAGE_PROBABILITY[s.status] || 0) / 100),
      count: s._count,
    }));
    const pipelineTotal = byStage.reduce((s, st) => s + st.value, 0);
    const weightedTotal = byStage.reduce((s, st) => s + st.weighted, 0);

    // Deal size distribution
    const ranges = [
      { range: '₹0 - ₹50K', min: 0, max: 50000 },
      { range: '₹50K - ₹1L', min: 50000, max: 100000 },
      { range: '₹1L - ₹5L', min: 100000, max: 500000 },
      { range: '₹5L+', min: 500000, max: Infinity },
    ];

    const dealSizeDistribution = ranges.map(r => {
      const deals = wonLeads.filter(l => {
        const v = Number(l.expectedValue || 0);
        return v >= r.min && v < r.max;
      });
      return { range: r.range, count: deals.length, value: deals.reduce((s, l) => s + Number(l.expectedValue || 0), 0) };
    });

    // Forecast
    const projected = Math.round(wonTotal * 1.1 + weightedTotal * 0.5);
    const optimistic = Math.round(wonTotal + pipelineTotal * 0.8);
    const pessimistic = Math.round(wonTotal + weightedTotal * 0.3);

    return {
      won: {
        total: wonTotal, count: wonLeads.length, avgDealSize,
        largestDeal: wonLeads[0] ? { leadNumber: wonLeads[0].leadNumber, value: Number(wonLeads[0].expectedValue), org: wonLeads[0].organization?.name } : null,
      },
      pipeline: { total: pipelineTotal, weighted: weightedTotal, byStage },
      forecast: {
        nextMonth: { projected, optimistic, pessimistic, confidence: projected > pessimistic * 1.3 ? 'HIGH' : 'MEDIUM' },
      },
      dealSizeDistribution,
    };
  }

  async getLeadSourceAnalysis(params: { dateFrom: Date; dateTo: Date }) {
    const leads = await this.prisma.lead.findMany({
      where: { createdAt: { gte: params.dateFrom, lte: params.dateTo } },
      include: { contact: { include: { rawContacts: { select: { source: true }, take: 1 } } } },
    });

    const bySource: Record<string, { total: number; won: number; lost: number; active: number; revenue: number; closeDays: number[] }> = {};

    for (const l of leads) {
      const src = (l.contact as any)?.rawContacts?.[0]?.source || 'UNKNOWN';
      if (!bySource[src]) bySource[src] = { total: 0, won: 0, lost: 0, active: 0, revenue: 0, closeDays: [] };
      bySource[src].total++;
      if (l.status === 'WON') {
        bySource[src].won++;
        bySource[src].revenue += Number(l.expectedValue || 0);
        bySource[src].closeDays.push((l.updatedAt.getTime() - l.createdAt.getTime()) / 86400000);
      } else if (l.status === 'LOST') bySource[src].lost++;
      else bySource[src].active++;
    }

    return Object.entries(bySource).map(([source, data]) => ({
      source, totalLeads: data.total, won: data.won, lost: data.lost, active: data.active,
      conversionRate: (data.won + data.lost) > 0 ? Math.round((data.won / (data.won + data.lost)) * 1000) / 10 : 0,
      revenue: data.revenue,
      avgDealSize: data.won > 0 ? Math.round(data.revenue / data.won) : 0,
      avgDaysToClose: data.closeDays.length > 0 ? Math.round(data.closeDays.reduce((a, b) => a + b, 0) / data.closeDays.length * 10) / 10 : 0,
    })).sort((a, b) => b.revenue - a.revenue);
  }

  async getLostReasonAnalysis(params: { dateFrom: Date; dateTo: Date }) {
    const lostLeads = await this.prisma.lead.findMany({
      where: { status: 'LOST', updatedAt: { gte: params.dateFrom, lte: params.dateTo } },
      select: { lostReason: true, expectedValue: true, updatedAt: true },
    });

    const total = lostLeads.length;
    const totalValue = lostLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0);

    const byReason: Record<string, { count: number; value: number }> = {};
    for (const l of lostLeads) {
      const reason = l.lostReason || 'Not specified';
      if (!byReason[reason]) byReason[reason] = { count: 0, value: 0 };
      byReason[reason].count++;
      byReason[reason].value += Number(l.expectedValue || 0);
    }

    const reasons = Object.entries(byReason)
      .map(([reason, data]) => ({
        reason, count: data.count,
        percent: total > 0 ? Math.round((data.count / total) * 1000) / 10 : 0,
        value: data.value,
      }))
      .sort((a, b) => b.count - a.count);

    return { total, totalLostValue: totalValue, reasons };
  }

  async getAgingAnalysis(params: { userId?: string }) {
    const where: any = { status: { notIn: ['WON', 'LOST'] } };
    if (params.userId) where.allocatedToId = params.userId;

    const leads = await this.prisma.lead.findMany({
      where,
      select: { id: true, leadNumber: true, expectedValue: true, createdAt: true, allocatedToId: true,
        contact: { select: { firstName: true, lastName: true } } },
    });

    const now = Date.now();
    const ranges = [
      { range: '0-7 days', min: 0, max: 7 },
      { range: '8-14 days', min: 8, max: 14 },
      { range: '15-30 days', min: 15, max: 30 },
      { range: '31-60 days', min: 31, max: 60 },
      { range: '60+ days', min: 61, max: Infinity },
    ];

    const distribution = ranges.map(r => {
      const matching = leads.filter(l => {
        const age = (now - l.createdAt.getTime()) / 86400000;
        return age >= r.min && age <= r.max;
      });
      const value = matching.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
      return { range: r.range, count: matching.length, value, percent: leads.length > 0 ? Math.round((matching.length / leads.length) * 1000) / 10 : 0 };
    });

    const avgAge = leads.length > 0
      ? Math.round(leads.reduce((s, l) => s + (now - l.createdAt.getTime()) / 86400000, 0) / leads.length * 10) / 10
      : 0;

    const staleLeads = leads
      .filter(l => (now - l.createdAt.getTime()) / 86400000 > 30)
      .map(l => ({
        leadNumber: l.leadNumber,
        contactName: l.contact ? `${l.contact.firstName} ${l.contact.lastName}` : '',
        daysOld: Math.round((now - l.createdAt.getTime()) / 86400000),
        value: Number(l.expectedValue || 0),
      }))
      .sort((a, b) => b.daysOld - a.daysOld)
      .slice(0, 20);

    return {
      distribution, avgAge,
      staleLeads, staleCount: staleLeads.length,
      staleValue: staleLeads.reduce((s, l) => s + l.value, 0),
    };
  }

  async getVelocityMetrics(params: { dateFrom: Date; dateTo: Date }) {
    const wonLeads = await this.prisma.lead.findMany({
      where: { status: 'WON', updatedAt: { gte: params.dateFrom, lte: params.dateTo } },
      select: { expectedValue: true, createdAt: true, updatedAt: true },
    });

    const totalLeads = await this.prisma.lead.count({
      where: { createdAt: { gte: params.dateFrom, lte: params.dateTo } },
    });

    const numberOfDeals = wonLeads.length;
    const avgDealSize = numberOfDeals > 0
      ? Math.round(wonLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0) / numberOfDeals)
      : 0;
    const conversionRate = totalLeads > 0 ? Math.round((numberOfDeals / totalLeads) * 1000) / 10 : 0;
    const avgCycleDays = numberOfDeals > 0
      ? Math.round(wonLeads.reduce((s, l) => s + (l.updatedAt.getTime() - l.createdAt.getTime()) / 86400000, 0) / numberOfDeals * 10) / 10
      : 1;

    const salesVelocity = avgCycleDays > 0
      ? Math.round((numberOfDeals * avgDealSize * (conversionRate / 100)) / avgCycleDays)
      : 0;

    return {
      salesVelocity,
      components: { numberOfDeals, avgDealSize, conversionRate, avgSalesCycleDays: avgCycleDays },
    };
  }
}
