// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class ProductivityReport implements IReport {
  readonly code = 'PRODUCTIVITY';
  readonly name = 'Productivity Report';
  readonly category = 'ACTIVITY';
  readonly description = 'Composite productivity scoring per user based on activities, leads, demos, and quotations';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'userId', label: 'User', type: 'user' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const dateFilter = { gte: params.dateFrom, lte: params.dateTo };
    const tenantId = params.tenantId;

    // Get all users with activity in the period
    const activities = await this.prisma.activity.findMany({
      where: { tenantId, createdAt: dateFilter, ...(params.userId ? { createdById: params.userId } : {}) },
      select: { createdById: true, createdByUser: { select: { firstName: true, lastName: true } } },
    });

    const leads = await this.prisma.lead.findMany({
      where: { tenantId, createdAt: dateFilter, allocatedToId: { not: null } },
      select: { allocatedToId: true },
    });

    const demos = await this.prisma.demo.findMany({
      where: { tenantId, createdAt: dateFilter },
      select: { conductedById: true },
    });

    const quotations = await this.prisma.quotation.findMany({
      where: { tenantId, createdAt: dateFilter },
      select: { createdById: true },
    });

    // Aggregate per user
    const dayCount = Math.max(1, Math.ceil(
      (params.dateTo.getTime() - params.dateFrom.getTime()) / 86400000,
    ));

    const userMap = new Map<string, {
      name: string; activities: number; leads: number; demos: number; quotations: number;
    }>();

    activities.forEach(a => {
      if (!userMap.has(a.createdById)) {
        userMap.set(a.createdById, {
          name: `${a.createdByUser.firstName} ${a.createdByUser.lastName}`,
          activities: 0, leads: 0, demos: 0, quotations: 0,
        });
      }
      userMap.get(a.createdById)!.activities++;
    });

    leads.forEach(l => {
      if (l.allocatedToId && userMap.has(l.allocatedToId)) {
        userMap.get(l.allocatedToId)!.leads++;
      }
    });

    demos.forEach(d => {
      if (userMap.has(d.conductedById)) {
        userMap.get(d.conductedById)!.demos++;
      }
    });

    quotations.forEach(q => {
      if (userMap.has(q.createdById)) {
        userMap.get(q.createdById)!.quotations++;
      }
    });

    // Compute max values for normalization
    const users = [...userMap.entries()];
    const maxActivities = Math.max(1, ...users.map(u => u[1].activities));
    const maxLeads = Math.max(1, ...users.map(u => u[1].leads));
    const maxDemos = Math.max(1, ...users.map(u => u[1].demos));
    const maxQuotations = Math.max(1, ...users.map(u => u[1].quotations));

    const userStats = users.map(([userId, data]) => {
      const activityScore = (data.activities / maxActivities) * 30;
      const leadScore = (data.leads / maxLeads) * 20;
      const demoScore = (data.demos / maxDemos) * 25;
      const quotationScore = (data.quotations / maxQuotations) * 25;
      const score = Math.round(activityScore + leadScore + demoScore + quotationScore);
      return {
        userId,
        name: data.name,
        activitiesPerDay: Math.round((data.activities / dayCount) * 100) / 100,
        leadsAssigned: data.leads,
        demosCount: data.demos,
        quotationsCount: data.quotations,
        productivityScore: score,
      };
    });

    userStats.sort((a, b) => b.productivityScore - a.productivityScore);

    const scores = userStats.map(u => u.productivityScore);
    const avgProductivityScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    const topPerformer = userStats[0]?.name || 'N/A';
    const bottomPerformer = userStats[userStats.length - 1]?.name || 'N/A';
    const teamAvgActivitiesPerDay = userStats.length > 0
      ? Math.round(userStats.reduce((s, u) => s + u.activitiesPerDay, 0) / userStats.length * 100) / 100
      : 0;

    const summary: ReportMetric[] = [
      { key: 'avgProductivityScore', label: 'Avg Productivity Score', value: avgProductivityScore, format: 'number' },
      { key: 'topPerformer', label: 'Top Performer Score', value: userStats[0]?.productivityScore || 0, format: 'number' },
      { key: 'bottomPerformer', label: 'Bottom Performer Score', value: userStats[userStats.length - 1]?.productivityScore || 0, format: 'number' },
      { key: 'teamAvgActivitiesPerDay', label: 'Team Avg Activities/Day', value: teamAvgActivitiesPerDay, format: 'number' },
    ];

    const charts: ChartData[] = [
      {
        type: 'BAR', title: 'Productivity Score by User',
        labels: userStats.map(u => u.name),
        datasets: [{ label: 'Score', data: userStats.map(u => u.productivityScore), color: '#673AB7' }],
      },
    ];

    const tableColumns: ColumnDef[] = [
      { key: 'name', header: 'User', width: 22 },
      { key: 'activitiesPerDay', header: 'Activities/Day', width: 14, format: 'number' },
      { key: 'leadsAssigned', header: 'Leads', width: 10, format: 'number' },
      { key: 'demosCount', header: 'Demos', width: 10, format: 'number' },
      { key: 'quotationsCount', header: 'Quotations', width: 12, format: 'number' },
      { key: 'productivityScore', header: 'Score', width: 10, format: 'number' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'User Productivity Breakdown', columns: tableColumns, rows: userStats }],
      metadata: { topPerformer, bottomPerformer },
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.dimension === 'user') where.createdById = params.value;
    const result = await this.drillDownSvc.getActivities(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
