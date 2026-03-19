import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

const STAGE_PROBABILITY: Record<string, number> = {
  NEW: 10, VERIFIED: 20, ALLOCATED: 30, IN_PROGRESS: 40,
  DEMO_SCHEDULED: 50, QUOTATION_SENT: 70, NEGOTIATION: 85,
  WON: 100, LOST: 0, ON_HOLD: 0,
};

const STAGE_COLORS: Record<string, string> = {
  NEW: '#94A3B8', VERIFIED: '#3B82F6', ALLOCATED: '#8B5CF6', IN_PROGRESS: '#F59E0B',
  DEMO_SCHEDULED: '#EC4899', QUOTATION_SENT: '#F97316', NEGOTIATION: '#06B6D4',
  WON: '#10B981', LOST: '#EF4444', ON_HOLD: '#9CA3AF',
};

const STAGE_ORDER = ['NEW', 'VERIFIED', 'ALLOCATED', 'IN_PROGRESS', 'DEMO_SCHEDULED', 'QUOTATION_SENT', 'NEGOTIATION', 'WON', 'LOST', 'ON_HOLD'];

@Injectable()
export class PipelineService {
  constructor(private readonly prisma: PrismaService) {}

  async getSalesPipeline(params: { dateFrom?: Date; dateTo?: Date; userId?: string }) {
    const where: any = {};
    if (params.userId) where.allocatedToId = params.userId;

    const leadsGrouped = await this.prisma.working.lead.groupBy({
      by: ['status'],
      where,
      _count: true,
      _sum: { expectedValue: true },
    });

    const stages = STAGE_ORDER.map(status => {
      const group = leadsGrouped.find(g => g.status === status);
      const count = group?._count || 0;
      const value = Number(group?._sum?.expectedValue || 0);
      const prob = STAGE_PROBABILITY[status] || 0;
      return {
        status, label: status.replace(/_/g, ' '), color: STAGE_COLORS[status],
        count, value, weightedValue: Math.round(value * prob / 100),
        probability: prob,
      };
    });

    const activeStages = stages.filter(s => !['WON', 'LOST', 'ON_HOLD'].includes(s.status));
    const totalPipelineValue = activeStages.reduce((s, st) => s + st.value, 0);
    const weightedPipelineValue = activeStages.reduce((s, st) => s + st.weightedValue, 0);
    const wonStage = stages.find(s => s.status === 'WON');
    const lostStage = stages.find(s => s.status === 'LOST');
    const totalLeads = stages.reduce((s, st) => s + st.count, 0);

    // Stage transitions
    const transitions: Array<{ from: string; to: string; count: number; conversionRate: number }> = [];
    for (let i = 0; i < STAGE_ORDER.length - 3; i++) {
      const from = stages[i];
      const to = stages[i + 1];
      if (from.count > 0) {
        transitions.push({
          from: from.status, to: to.status, count: to.count,
          conversionRate: Math.round((to.count / from.count) * 1000) / 10,
        });
      }
    }

    return {
      stages,
      summary: {
        totalLeads, totalPipelineValue, weightedPipelineValue,
        wonValue: wonStage?.value || 0, lostValue: lostStage?.value || 0,
        avgDealSize: totalLeads > 0 ? Math.round(totalPipelineValue / activeStages.reduce((s, st) => s + st.count, 0) || 0) : 0,
      },
      stageTransitions: transitions,
    };
  }

  async getSalesFunnel(params: { dateFrom: Date; dateTo: Date; userId?: string; source?: string }) {
    const { dateFrom, dateTo, userId } = params;
    const where: any = { createdAt: { gte: dateFrom, lte: dateTo } };
    if (userId) where.allocatedToId = userId;

    const totalLeads = await this.prisma.working.lead.count({ where });

    // Leads with at least one activity
    const contacted = await this.prisma.working.lead.count({
      where: { ...where, activities: { some: {} } },
    });

    // Leads with status >= VERIFIED
    const qualified = await this.prisma.working.lead.count({
      where: { ...where, status: { in: ['VERIFIED', 'ALLOCATED', 'IN_PROGRESS', 'DEMO_SCHEDULED', 'QUOTATION_SENT', 'NEGOTIATION', 'WON'] } },
    });

    // Leads with at least one completed demo
    const demoGiven = await this.prisma.working.lead.count({
      where: { ...where, demos: { some: { status: 'COMPLETED' } } },
    });

    // Leads with at least one non-draft quotation
    const quotationSent = await this.prisma.working.lead.count({
      where: { ...where, quotations: { some: { status: { not: 'DRAFT' } } } },
    });

    const negotiation = await this.prisma.working.lead.count({
      where: { ...where, status: { in: ['NEGOTIATION', 'WON'] } },
    });

    const won = await this.prisma.working.lead.count({
      where: { ...where, status: 'WON' },
    });

    const funnel = [
      { stage: 'Total Leads Created', count: totalLeads },
      { stage: 'Contacted (Activity)', count: contacted },
      { stage: 'Qualified (Verified+)', count: qualified },
      { stage: 'Demo Given', count: demoGiven },
      { stage: 'Quotation Sent', count: quotationSent },
      { stage: 'Negotiation', count: negotiation },
      { stage: 'Won', count: won },
    ].map((item, i, arr) => ({
      ...item,
      percent: totalLeads > 0 ? Math.round((item.count / totalLeads) * 1000) / 10 : 0,
      dropOff: i === 0 ? null : (arr[i - 1].count > 0
        ? Math.round(((arr[i - 1].count - item.count) / arr[i - 1].count) * 1000) / 10
        : 0),
    }));

    const overallConversion = totalLeads > 0 ? Math.round((won / totalLeads) * 1000) / 10 : 0;

    let biggestLeakIdx = 1;
    let maxDrop = 0;
    for (let i = 1; i < funnel.length; i++) {
      if ((funnel[i].dropOff || 0) > maxDrop) {
        maxDrop = funnel[i].dropOff || 0;
        biggestLeakIdx = i;
      }
    }

    return {
      funnel, overallConversion,
      biggestLeakPoint: {
        stage: `${funnel[biggestLeakIdx - 1].stage} → ${funnel[biggestLeakIdx].stage}`,
        dropOff: maxDrop,
      },
    };
  }
}
