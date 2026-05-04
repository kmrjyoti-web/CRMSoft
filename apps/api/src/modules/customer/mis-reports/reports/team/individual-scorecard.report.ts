import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class IndividualScorecardReport implements IReport {
  readonly code = 'INDIVIDUAL_SCORECARD';
  readonly name = 'Individual Scorecard';
  readonly category = 'TEAM';
  readonly description = 'Comprehensive per-employee scorecard covering leads, activities, demos, quotations, revenue, and efficiency';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'userId', label: 'Employee', type: 'user' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const tenantId = params.tenantId;
    const dateFilter = { gte: params.dateFrom, lte: params.dateTo };
    const dayCount = Math.max(1, Math.ceil((params.dateTo.getTime() - params.dateFrom.getTime()) / 86400000));

    const userWhere: any = { tenantId, status: 'ACTIVE', userType: 'EMPLOYEE' };
    if (params.userId) userWhere.id = params.userId;
    const users = await this.prisma.user.findMany({
      where: userWhere,
      select: { id: true, firstName: true, lastName: true },
    });
    const userIds = users.map(u => u.id);

    const [leads, activities, demos, quotations, targets] = await Promise.all([
      this.prisma.working.lead.findMany({
        where: { tenantId, allocatedToId: { in: userIds }, createdAt: dateFilter },
        select: { id: true, allocatedToId: true, status: true, expectedValue: true, allocatedAt: true, createdAt: true, updatedAt: true },
      }),
      this.prisma.working.activity.findMany({
        where: { tenantId, createdById: { in: userIds }, createdAt: dateFilter },
        select: { id: true, createdById: true, type: true, leadId: true, createdAt: true },
      }),
      this.prisma.working.demo.findMany({
        where: { tenantId, conductedById: { in: userIds }, scheduledAt: dateFilter },
        select: { conductedById: true, status: true },
      }),
      this.prisma.working.quotation.findMany({
        where: { tenantId, createdById: { in: userIds }, createdAt: dateFilter },
        select: { createdById: true, status: true, totalAmount: true },
      }),
      this.prisma.working.salesTarget.findMany({
        where: { tenantId, userId: { in: userIds }, isActive: true, periodStart: { lte: params.dateTo }, periodEnd: { gte: params.dateFrom } },
        select: { userId: true, achievedPercent: true },
      }),
    ]);

    // First activity per lead for response time calculation
    const leadIds = leads.filter(l => l.allocatedAt).map(l => l.id);
    const firstActivities = leadIds.length > 0
      ? await this.prisma.working.activity.findMany({
          where: { leadId: { in: leadIds } },
          orderBy: { createdAt: 'asc' },
          distinct: ['leadId'],
          select: { leadId: true, createdAt: true },
        })
      : [];
    const firstActivityMap = new Map(firstActivities.map(a => [a.leadId, a.createdAt]));

    const userStats = users.map(u => {
      const uLeads = leads.filter(l => l.allocatedToId === u.id);
      const won = uLeads.filter(l => l.status === 'WON').length;
      const lost = uLeads.filter(l => l.status === 'LOST').length;
      const active = uLeads.filter(l => !['WON', 'LOST'].includes(l.status)).length;
      const conversionRate = uLeads.length > 0 ? Math.round((won / uLeads.length) * 10000) / 100 : 0;

      const uActivities = activities.filter(a => a.createdById === u.id);
      const calls = uActivities.filter(a => a.type === 'CALL').length;
      const emails = uActivities.filter(a => a.type === 'EMAIL').length;
      const meetings = uActivities.filter(a => a.type === 'MEETING').length;
      const visits = uActivities.filter(a => a.type === 'VISIT').length;
      const avgPerDay = Math.round((uActivities.length / dayCount) * 100) / 100;

      const uDemos = demos.filter(d => d.conductedById === u.id);
      const dScheduled = uDemos.length;
      const dCompleted = uDemos.filter(d => d.status === 'COMPLETED').length;
      const dNoShow = uDemos.filter(d => d.status === 'NO_SHOW').length;
      const dCancelled = uDemos.filter(d => d.status === 'CANCELLED').length;
      const completionRate = dScheduled > 0 ? Math.round((dCompleted / dScheduled) * 10000) / 100 : 0;

      const uQuotations = quotations.filter(q => q.createdById === u.id);
      const qCreated = uQuotations.length;
      const qSent = uQuotations.filter(q => q.status !== 'DRAFT').length;
      const qAccepted = uQuotations.filter(q => q.status === 'ACCEPTED').length;
      const acceptanceRate = qSent > 0 ? Math.round((qAccepted / qSent) * 10000) / 100 : 0;
      const totalValue = Math.round(uQuotations.reduce((s, q) => s + Number(q.totalAmount || 0), 0));

      const wonRevenue = Math.round(uLeads.filter(l => l.status === 'WON').reduce((s, l) => s + Number(l.expectedValue || 0), 0));
      const pipelineValue = Math.round(uLeads.filter(l => !['WON', 'LOST'].includes(l.status)).reduce((s, l) => s + Number(l.expectedValue || 0), 0));

      // Response time
      const responseTimes = uLeads.filter(l => l.allocatedAt && firstActivityMap.has(l.id)).map(l => {
        const first = firstActivityMap.get(l.id)!;
        return (first.getTime() - l.allocatedAt!.getTime()) / 3600000;
      });
      const avgResponseHours = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((s, v) => s + v, 0) / responseTimes.length * 100) / 100
        : 0;

      // Close time
      const wonLeads = uLeads.filter(l => l.status === 'WON');
      const closeTimes = wonLeads.map(l => (l.updatedAt.getTime() - l.createdAt.getTime()) / 86400000);
      const avgCloseTimeDays = closeTimes.length > 0
        ? Math.round(closeTimes.reduce((s, v) => s + v, 0) / closeTimes.length * 100) / 100
        : 0;

      // Target achievement
      const uTargets = targets.filter(t => t.userId === u.id);
      const avgTargetAchievement = uTargets.length > 0
        ? Math.round(uTargets.reduce((s, t) => s + Number(t.achievedPercent), 0) / uTargets.length * 100) / 100
        : 0;

      // Performance score (0-100)
      const scoreConversion = Math.min(25, (conversionRate / 100) * 25);
      const scoreActivity = Math.min(20, (Math.min(100, avgPerDay * 10) / 100) * 20);
      const scoreDemo = Math.min(15, (completionRate / 100) * 15);
      const scoreQuotation = Math.min(15, (acceptanceRate / 100) * 15);
      const scoreTarget = Math.min(15, (avgTargetAchievement / 100) * 15);
      const scoreResponse = Math.min(10, Math.max(0, (24 - avgResponseHours) / 24) * 10);
      const performanceScore = Math.round(scoreConversion + scoreActivity + scoreDemo + scoreQuotation + scoreTarget + scoreResponse);

      return {
        userId: u.id, userName: `${u.firstName} ${u.lastName}`,
        leadsAssigned: uLeads.length, won, lost, active, conversionRate,
        totalActivities: uActivities.length, calls, emails, meetings, visits, avgPerDay,
        dScheduled, dCompleted, dNoShow, dCancelled, completionRate,
        qCreated, qSent, qAccepted, acceptanceRate, totalValue,
        wonRevenue, pipelineValue, avgResponseHours, avgCloseTimeDays,
        performanceScore,
      };
    });

    userStats.sort((a, b) => b.performanceScore - a.performanceScore);

    const scores = userStats.map(u => u.performanceScore);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const topPerformer = userStats[0];
    const bottomPerformer = userStats[userStats.length - 1];

    const summary: ReportMetric[] = [
      { key: 'avgPerformanceScore', label: 'Avg Performance Score', value: avgScore, format: 'number' },
      { key: 'topPerformerScore', label: 'Top Performer Score', value: topPerformer?.performanceScore || 0, format: 'number' },
      { key: 'bottomPerformerScore', label: 'Bottom Performer Score', value: bottomPerformer?.performanceScore || 0, format: 'number' },
      { key: 'teamSize', label: 'Team Size', value: userStats.length, format: 'number' },
    ];

    const top = topPerformer;
    const breakdownData = top ? [
      Math.round(Math.min(25, (top.conversionRate / 100) * 25)),
      Math.round(Math.min(20, (Math.min(100, top.avgPerDay * 10) / 100) * 20)),
      Math.round(Math.min(15, (top.completionRate / 100) * 15)),
      Math.round(Math.min(15, (top.acceptanceRate / 100) * 15)),
      Math.round(Math.min(15, 15)),
      Math.round(Math.min(10, Math.max(0, (24 - top.avgResponseHours) / 24) * 10)),
    ] : [0, 0, 0, 0, 0, 0];
    const charts: ChartData[] = [
      { type: 'BAR', title: top ? `Score Breakdown - ${top.userName}` : 'Score Breakdown',
        labels: ['Conversion', 'Activity', 'Demo', 'Quotation', 'Target', 'Response'],
        datasets: [{ label: 'Score', data: breakdownData, color: '#3F51B5' }] },
      { type: 'LINE', title: 'Performance Score Distribution',
        labels: userStats.map(u => u.userName),
        datasets: [{ label: 'Score', data: userStats.map(u => u.performanceScore), color: '#4CAF50' }] },
    ];

    const columns: ColumnDef[] = [
      { key: 'userName', header: 'Employee', width: 20 },
      { key: 'performanceScore', header: 'Score', width: 8, format: 'number' },
      { key: 'leadsAssigned', header: 'Leads', width: 8, format: 'number' },
      { key: 'won', header: 'Won', width: 7, format: 'number' },
      { key: 'conversionRate', header: 'Conv %', width: 9, format: 'percent' },
      { key: 'totalActivities', header: 'Activities', width: 10, format: 'number' },
      { key: 'avgPerDay', header: 'Act/Day', width: 9, format: 'number' },
      { key: 'dCompleted', header: 'Demos', width: 8, format: 'number' },
      { key: 'qAccepted', header: 'Quotes', width: 8, format: 'number' },
      { key: 'wonRevenue', header: 'Revenue', width: 12, format: 'currency' },
      { key: 'avgResponseHours', header: 'Resp Hrs', width: 10, format: 'number' },
      { key: 'avgCloseTimeDays', header: 'Close Days', width: 10, format: 'number' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Individual Scorecards', columns, rows: userStats }],
      metadata: {
        topPerformer: topPerformer ? `${topPerformer.userName} (${topPerformer.performanceScore})` : 'N/A',
        bottomPerformer: bottomPerformer ? `${bottomPerformer.userName} (${bottomPerformer.performanceScore})` : 'N/A',
      },
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
