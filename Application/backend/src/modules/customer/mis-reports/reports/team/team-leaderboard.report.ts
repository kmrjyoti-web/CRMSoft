import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class TeamLeaderboardReport implements IReport {
  readonly code = 'TEAM_LEADERBOARD';
  readonly name = 'Team Leaderboard';
  readonly category = 'TEAM';
  readonly description = 'Ranked leaderboard of team members by selected performance metric with trend analysis';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'rankBy', label: 'Rank By', type: 'select', options: [
      { value: 'REVENUE', label: 'Revenue' },
      { value: 'CONVERSION_RATE', label: 'Conversion Rate' },
      { value: 'DEALS_WON', label: 'Deals Won' },
      { value: 'ACTIVITIES', label: 'Activities' },
      { value: 'PERFORMANCE_SCORE', label: 'Performance Score' },
    ]},
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const tenantId = params.tenantId;
    const dateFilter = { gte: params.dateFrom, lte: params.dateTo };
    const rankBy = params.filters?.rankBy || 'REVENUE';
    const dayCount = Math.max(1, Math.ceil((params.dateTo.getTime() - params.dateFrom.getTime()) / 86400000));

    // Previous period for trend
    const periodMs = params.dateTo.getTime() - params.dateFrom.getTime();
    const prevFrom = new Date(params.dateFrom.getTime() - periodMs);
    const prevTo = new Date(params.dateFrom.getTime() - 1);
    const prevDateFilter = { gte: prevFrom, lte: prevTo };

    const users = await this.prisma.user.findMany({
      where: { tenantId, status: 'ACTIVE', userType: 'EMPLOYEE' },
      select: { id: true, firstName: true, lastName: true },
    });
    const userIds = users.map(u => u.id);

    const [leads, prevLeads, activities, prevActivities] = await Promise.all([
      this.prisma.working.lead.findMany({
        where: { tenantId, allocatedToId: { in: userIds }, createdAt: dateFilter },
        select: { allocatedToId: true, status: true, expectedValue: true },
      }),
      this.prisma.working.lead.findMany({
        where: { tenantId, allocatedToId: { in: userIds }, createdAt: prevDateFilter },
        select: { allocatedToId: true, status: true, expectedValue: true },
      }),
      this.prisma.working.activity.findMany({
        where: { tenantId, createdById: { in: userIds }, createdAt: dateFilter },
        select: { createdById: true },
      }),
      this.prisma.working.activity.findMany({
        where: { tenantId, createdById: { in: userIds }, createdAt: prevDateFilter },
        select: { createdById: true },
      }),
    ]);

    const computeMetrics = (
      uLeads: typeof leads,
      uActivities: typeof activities,
      uid: string,
    ) => {
      const myLeads = uLeads.filter(l => l.allocatedToId === uid);
      const won = myLeads.filter(l => l.status === 'WON');
      const revenue = Math.round(won.reduce((s, l) => s + Number(l.expectedValue || 0), 0));
      const convRate = myLeads.length > 0 ? Math.round((won.length / myLeads.length) * 10000) / 100 : 0;
      const dealsWon = won.length;
      const actCount = uActivities.filter(a => a.createdById === uid).length;
      const avgPerDay = Math.round((actCount / dayCount) * 100) / 100;
      // Simplified performance score: conv(30) + activity(30) + deals(40 capped at 20 deals)
      const perfScore = Math.round(
        (convRate / 100) * 30 +
        Math.min(30, avgPerDay * 3) +
        Math.min(40, dealsWon * 2),
      );
      return { revenue, convRate, dealsWon, actCount, perfScore };
    };

    const userStats = users.map(u => {
      const current = computeMetrics(leads, activities, u.id);
      const prev = computeMetrics(prevLeads, prevActivities, u.id);
      const metricValue = rankBy === 'REVENUE' ? current.revenue
        : rankBy === 'CONVERSION_RATE' ? current.convRate
        : rankBy === 'DEALS_WON' ? current.dealsWon
        : rankBy === 'ACTIVITIES' ? current.actCount
        : current.perfScore;
      const prevValue = rankBy === 'REVENUE' ? prev.revenue
        : rankBy === 'CONVERSION_RATE' ? prev.convRate
        : rankBy === 'DEALS_WON' ? prev.dealsWon
        : rankBy === 'ACTIVITIES' ? prev.actCount
        : prev.perfScore;
      const trendPercent = prevValue > 0 ? Math.round(((metricValue - prevValue) / prevValue) * 10000) / 100 : 0;
      const trend = trendPercent > 0 ? 'UP' : trendPercent < 0 ? 'DOWN' : 'FLAT';

      return {
        userId: u.id, userName: `${u.firstName} ${u.lastName}`,
        metricValue, previousValue: prevValue, trend, trendPercent,
        conversionRate: current.convRate, deals: current.dealsWon, activities: current.actCount,
        rank: 0,
      };
    });

    userStats.sort((a, b) => b.metricValue - a.metricValue);
    userStats.forEach((u, i) => { u.rank = i + 1; });

    const values = userStats.map(u => u.metricValue).sort((a, b) => a - b);
    const topValue = values[values.length - 1] || 0;
    const bottomValue = values[0] || 0;
    const medianValue = values.length > 0 ? values[Math.floor(values.length / 2)] : 0;

    const metricFormat = rankBy === 'REVENUE' ? 'currency' as const
      : rankBy === 'CONVERSION_RATE' ? 'percent' as const
      : 'number' as const;

    const summary: ReportMetric[] = [
      { key: 'teamSize', label: 'Team Size', value: userStats.length, format: 'number' },
      { key: 'topValue', label: 'Top Value', value: topValue, format: metricFormat },
      { key: 'medianValue', label: 'Median Value', value: medianValue, format: metricFormat },
      { key: 'bottomValue', label: 'Bottom Value', value: bottomValue, format: metricFormat },
    ];

    const charts: ChartData[] = [{
      type: 'BAR', title: `Leaderboard - ${rankBy.replace('_', ' ')}`,
      labels: userStats.map(u => u.userName),
      datasets: [{ label: rankBy, data: userStats.map(u => u.metricValue), color: '#FF9800' }],
    }];

    const columns: ColumnDef[] = [
      { key: 'rank', header: '#', width: 5, format: 'number' },
      { key: 'userName', header: 'Employee', width: 20 },
      { key: 'metricValue', header: rankBy.replace('_', ' '), width: 14, format: metricFormat },
      { key: 'previousValue', header: 'Previous', width: 14, format: metricFormat },
      { key: 'trend', header: 'Trend', width: 8 },
      { key: 'trendPercent', header: 'Change %', width: 10, format: 'percent' },
      { key: 'conversionRate', header: 'Conv %', width: 9, format: 'percent' },
      { key: 'deals', header: 'Deals Won', width: 10, format: 'number' },
      { key: 'activities', header: 'Activities', width: 10, format: 'number' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Team Leaderboard', columns, rows: userStats }],
      metadata: { rankBy },
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.dimension === 'user') where.allocatedToId = params.value;
    const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
