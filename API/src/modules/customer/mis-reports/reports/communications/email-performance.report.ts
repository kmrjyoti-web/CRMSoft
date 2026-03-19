import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class EmailPerformanceReport implements IReport {
  readonly code = 'EMAIL_PERFORMANCE';
  readonly name = 'Email Performance';
  readonly category = 'COMMUNICATION';
  readonly description = 'Tracks email activity volume, per-user email metrics, and lead touch rates via email channel';
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
    const where: any = {
      tenantId: params.tenantId,
      type: 'EMAIL',
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.userId) where.createdById = params.userId;

    const emailActivities = await this.prisma.activity.findMany({
      where,
      select: {
        id: true, createdAt: true, leadId: true,
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Quotation send logs via EMAIL channel in period
    const sendLogs = await this.prisma.quotationSendLog.findMany({
      where: {
        tenantId: params.tenantId,
        channel: 'EMAIL',
        sentAt: { gte: params.dateFrom, lte: params.dateTo },
      },
      select: { id: true, sentAt: true },
    });

    const totalEmailActivities = emailActivities.length + sendLogs.length;
    const dayCount = Math.max(1, Math.ceil(
      (params.dateTo.getTime() - params.dateFrom.getTime()) / 86400000,
    ));
    const avgPerDay = Math.round((totalEmailActivities / dayCount) * 100) / 100;

    // Per-user aggregation
    const userMap = new Map<string, { name: string; emailsSent: number; leadIds: Set<string> }>();
    emailActivities.forEach(a => {
      const uid = a.createdByUser.id;
      const uName = `${a.createdByUser.firstName} ${a.createdByUser.lastName}`;
      if (!userMap.has(uid)) userMap.set(uid, { name: uName, emailsSent: 0, leadIds: new Set() });
      const entry = userMap.get(uid)!;
      entry.emailsSent++;
      if (a.leadId) entry.leadIds.add(a.leadId);
    });

    const userStats = [...userMap.entries()].map(([userId, d]) => ({
      userId, name: d.name, emailsSent: d.emailsSent, uniqueLeads: d.leadIds.size,
    })).sort((a, b) => b.emailsSent - a.emailsSent);

    const topEmailer = userStats[0]?.name || 'N/A';

    // Lead touch rate: unique leads with email activity / total leads
    const allLeadIds = new Set<string>();
    emailActivities.forEach(a => { if (a.leadId) allLeadIds.add(a.leadId); });
    const totalLeads = await this.prisma.lead.count({
      where: { tenantId: params.tenantId, createdAt: { lte: params.dateTo } },
    });
    const emailLeadTouchRate = totalLeads > 0
      ? Math.round((allLeadIds.size / totalLeads) * 10000) / 100
      : 0;

    // Daily email trend
    const dailyMap = new Map<string, number>();
    emailActivities.forEach(a => {
      const day = a.createdAt.toISOString().slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
    });
    const sortedDays = [...dailyMap.keys()].sort();

    const summary: ReportMetric[] = [
      { key: 'totalEmailActivities', label: 'Total Email Activities', value: totalEmailActivities, format: 'number' },
      { key: 'avgPerDay', label: 'Avg Emails per Day', value: avgPerDay, format: 'number' },
      { key: 'topEmailerCount', label: 'Top Emailer Count', value: userStats[0]?.emailsSent || 0, format: 'number' },
      { key: 'emailLeadTouchRate', label: 'Email Lead Touch Rate', value: emailLeadTouchRate, format: 'percent' },
    ];

    const charts: ChartData[] = [
      {
        type: 'BAR', title: 'Emails by User',
        labels: userStats.map(u => u.name),
        datasets: [{ label: 'Emails Sent', data: userStats.map(u => u.emailsSent), color: '#2196F3' }],
      },
      {
        type: 'LINE', title: 'Daily Email Trend',
        labels: sortedDays,
        datasets: [{ label: 'Emails', data: sortedDays.map(d => dailyMap.get(d)!), color: '#FF9800' }],
      },
    ];

    const tableCols: ColumnDef[] = [
      { key: 'name', header: 'User', width: 22 },
      { key: 'emailsSent', header: 'Emails Sent', width: 14, format: 'number' },
      { key: 'uniqueLeads', header: 'Unique Leads', width: 14, format: 'number' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Per User Email Metrics', columns: tableCols, rows: userStats }],
      metadata: { topEmailer },
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      type: 'EMAIL',
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.dimension === 'user') where.createdById = params.value;
    const result = await this.drillDownSvc.getActivities(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
