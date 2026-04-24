import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class TeamPerformanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeamPerformance(params: { dateFrom: Date; dateTo: Date; roleId?: string }) {
    const { dateFrom, dateTo } = params;
    const userWhere: any = { status: 'ACTIVE', userType: 'EMPLOYEE' };
    if (params.roleId) userWhere.roleId = params.roleId;

    const users = await this.prisma.user.findMany({
      where: userWhere,
      select: { id: true, firstName: true, lastName: true, avatar: true, role: { select: { name: true } } },
    });

    const userMetrics = await Promise.all(users.map(async u => {
      const [leadsWon, leadsLost, leadsActive, leadsNew,
             activities, demos, quotations, tourPlans] = await Promise.all([
        this.prisma.working.lead.count({ where: { allocatedToId: u.id, status: 'WON', updatedAt: { gte: dateFrom, lte: dateTo } } }),
        this.prisma.working.lead.count({ where: { allocatedToId: u.id, status: 'LOST', updatedAt: { gte: dateFrom, lte: dateTo } } }),
        this.prisma.working.lead.count({ where: { allocatedToId: u.id, status: { notIn: ['WON', 'LOST'] } } }),
        this.prisma.working.lead.count({ where: { allocatedToId: u.id, createdAt: { gte: dateFrom, lte: dateTo } } }),
        this.prisma.working.activity.findMany({ where: { createdById: u.id, createdAt: { gte: dateFrom, lte: dateTo } }, select: { type: true } }),
        this.prisma.working.demo.groupBy({ by: ['status'], where: { conductedById: u.id, scheduledAt: { gte: dateFrom, lte: dateTo } }, _count: true }),
        this.prisma.working.quotation.findMany({ where: { createdById: u.id, createdAt: { gte: dateFrom, lte: dateTo } }, select: { status: true, totalAmount: true } }),
        this.prisma.working.tourPlan.count({ where: { salesPersonId: u.id, status: 'COMPLETED', planDate: { gte: dateFrom, lte: dateTo } } }),
      ]);

      const totalDays = Math.max(1, Math.ceil((dateTo.getTime() - dateFrom.getTime()) / 86400000));
      const convRate = (leadsWon + leadsLost) > 0 ? Math.round((leadsWon / (leadsWon + leadsLost)) * 1000) / 10 : 0;

      const actByType: Record<string, number> = {};
      for (const a of activities) actByType[a.type] = (actByType[a.type] || 0) + 1;

      const demoMap: Record<string, number> = {};
      for (const d of demos) demoMap[d.status] = d._count;

      const quotSent = quotations.filter(q => q.status !== 'DRAFT').length;
      const quotAccepted = quotations.filter(q => q.status === 'ACCEPTED').length;
      const wonValue = quotations.filter(q => q.status === 'ACCEPTED').reduce((s, q) => s + Number(q.totalAmount), 0);

      const demoCompleted = demoMap['COMPLETED'] || 0;
      const demoScheduled = (demoMap['SCHEDULED'] || 0) + demoCompleted + (demoMap['NO_SHOW'] || 0) + (demoMap['CANCELLED'] || 0);
      const demoCompRate = demoScheduled > 0 ? Math.round((demoCompleted / demoScheduled) * 1000) / 10 : 0;
      const quotAcceptRate = quotSent > 0 ? Math.round((quotAccepted / quotSent) * 1000) / 10 : 0;

      // Performance score
      const activityScore = Math.min(100, (activities.length / totalDays) * 10);
      const score = Math.round(
        convRate * 0.25 + activityScore * 0.20 + demoCompRate * 0.15 +
        quotAcceptRate * 0.15 + Math.min(100, convRate) * 0.15 +
        Math.min(100, 100 - Math.min(100, 0)) * 0.10
      );

      return {
        userId: u.id,
        name: `${u.firstName} ${u.lastName}`,
        avatar: u.avatar,
        role: u.role?.name || '',
        leads: { assigned: leadsActive + leadsWon + leadsLost, new: leadsNew, won: leadsWon, lost: leadsLost, active: leadsActive, conversionRate: convRate },
        activities: { total: activities.length, calls: actByType['CALL'] || 0, emails: actByType['EMAIL'] || 0, meetings: actByType['MEETING'] || 0, visits: actByType['VISIT'] || 0, avgPerDay: Math.round((activities.length / totalDays) * 10) / 10 },
        demos: { scheduled: demoScheduled, completed: demoCompleted, noShow: demoMap['NO_SHOW'] || 0, cancelled: demoMap['CANCELLED'] || 0, completionRate: demoCompRate },
        quotations: { created: quotations.length, sent: quotSent, accepted: quotAccepted, wonValue, acceptanceRate: quotAcceptRate },
        tourPlans: { completed: tourPlans },
        revenue: { won: wonValue },
        performanceScore: score,
      };
    }));

    userMetrics.sort((a, b) => b.performanceScore - a.performanceScore);
    const totalRevenue = userMetrics.reduce((s, u) => s + u.revenue.won, 0);
    const avgScore = userMetrics.length > 0 ? Math.round(userMetrics.reduce((s, u) => s + u.performanceScore, 0) / userMetrics.length) : 0;

    return {
      users: userMetrics,
      teamSummary: {
        totalUsers: userMetrics.length,
        totalLeadsWon: userMetrics.reduce((s, u) => s + u.leads.won, 0),
        totalRevenue,
        avgConversionRate: userMetrics.length > 0 ? Math.round(userMetrics.reduce((s, u) => s + u.leads.conversionRate, 0) / userMetrics.length * 10) / 10 : 0,
        avgPerformanceScore: avgScore,
        topPerformer: userMetrics[0] ? { name: userMetrics[0].name, score: userMetrics[0].performanceScore } : null,
        needsAttention: userMetrics.length > 0 ? { name: userMetrics[userMetrics.length - 1].name, score: userMetrics[userMetrics.length - 1].performanceScore } : null,
      },
    };
  }

  async getLeaderboard(params: {
    dateFrom: Date; dateTo: Date; metric: string; limit?: number; currentUserId?: string;
  }) {
    const perf = await this.getTeamPerformance({ dateFrom: params.dateFrom, dateTo: params.dateTo });
    const limit = params.limit || 10;

    let sorted = [...perf.users];
    switch (params.metric) {
      case 'revenue': sorted.sort((a, b) => b.revenue.won - a.revenue.won); break;
      case 'activities': sorted.sort((a, b) => b.activities.total - a.activities.total); break;
      case 'deals_won': sorted.sort((a, b) => b.leads.won - a.leads.won); break;
      case 'conversion': sorted.sort((a, b) => b.leads.conversionRate - a.leads.conversionRate); break;
      default: sorted.sort((a, b) => b.performanceScore - a.performanceScore);
    }

    const getValue = (u: any) => {
      switch (params.metric) {
        case 'revenue': return u.revenue.won;
        case 'activities': return u.activities.total;
        case 'deals_won': return u.leads.won;
        case 'conversion': return u.leads.conversionRate;
        default: return u.performanceScore;
      }
    };

    const badges = ['??', '??', '??'];
    const rankings = sorted.slice(0, limit).map((u, i) => ({
      rank: i + 1, userId: u.userId, name: u.name, avatar: u.avatar,
      value: getValue(u), badge: badges[i] || null,
    }));

    let myRank: any = null;
    if (params.currentUserId) {
      const idx = sorted.findIndex(u => u.userId === params.currentUserId);
      if (idx >= 0) myRank = { rank: idx + 1, value: getValue(sorted[idx]), outOf: sorted.length };
    }

    return { metric: params.metric, rankings, myRank };
  }
}
