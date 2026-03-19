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
export class CallLogReport implements IReport {
  readonly code = 'CALL_LOG';
  readonly name = 'Call Log';
  readonly category = 'ACTIVITY';
  readonly description = 'Detailed call activity analysis including duration, outcomes, and daily call volume trends';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'createdById', label: 'Performed By', type: 'user' },
    { key: 'outcome', label: 'Outcome', type: 'text' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = {
      tenantId: params.tenantId,
      type: 'CALL',
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.userId) where.createdById = params.userId;
    if (params.filters?.outcome) where.outcome = params.filters.outcome;

    const calls = await this.prisma.activity.findMany({
      where,
      select: {
        id: true, subject: true, outcome: true, duration: true,
        createdAt: true,
        lead: { select: { leadNumber: true } },
        createdByUser: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalCalls = calls.length;
    const dayCount = Math.max(1, Math.ceil(
      (params.dateTo.getTime() - params.dateFrom.getTime()) / 86400000,
    ));
    const callsPerDay = Math.round((totalCalls / dayCount) * 100) / 100;

    const durations = calls.filter(c => c.duration != null).map(c => c.duration!);
    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    // Outcome distribution
    const outcomeCounts = new Map<string, number>();
    calls.forEach(c => {
      const outcome = c.outcome || 'No Outcome';
      outcomeCounts.set(outcome, (outcomeCounts.get(outcome) || 0) + 1);
    });
    const outcomeLabels = [...outcomeCounts.keys()];
    const topOutcome = outcomeLabels.sort((a, b) =>
      outcomeCounts.get(b)! - outcomeCounts.get(a)!,
    )[0] || 'N/A';

    // Daily call volume
    const dailyMap = new Map<string, number>();
    calls.forEach(c => {
      const day = c.createdAt.toISOString().slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
    });
    const sortedDays = [...dailyMap.keys()].sort();

    const summary: ReportMetric[] = [
      { key: 'totalCalls', label: 'Total Calls', value: totalCalls, format: 'number' },
      { key: 'avgDuration', label: 'Avg Duration (min)', value: avgDuration, format: 'number' },
      { key: 'topOutcome', label: 'Top Outcome Count', value: outcomeCounts.get(topOutcome) || 0, format: 'number' },
      { key: 'callsPerDay', label: 'Calls per Day', value: callsPerDay, format: 'number' },
    ];

    const charts: ChartData[] = [
      {
        type: 'BAR', title: 'Calls per Day',
        labels: sortedDays,
        datasets: [{ label: 'Calls', data: sortedDays.map(d => dailyMap.get(d)!), color: '#2196F3' }],
      },
      {
        type: 'PIE', title: 'Calls by Outcome',
        labels: outcomeLabels,
        datasets: [{ label: 'Count', data: outcomeLabels.map(o => outcomeCounts.get(o)!) }],
      },
    ];

    // Call records table
    const tableRows = calls.map(c => ({
      date: c.createdAt,
      subject: c.subject,
      outcome: c.outcome || '',
      duration: c.duration || 0,
      performedBy: `${c.createdByUser.firstName} ${c.createdByUser.lastName}`,
      leadNumber: c.lead?.leadNumber || '',
    }));

    const tableColumns: ColumnDef[] = [
      { key: 'date', header: 'Date', width: 15, format: 'date' },
      { key: 'subject', header: 'Subject', width: 25 },
      { key: 'outcome', header: 'Outcome', width: 18 },
      { key: 'duration', header: 'Duration (min)', width: 14, format: 'number' },
      { key: 'performedBy', header: 'Performed By', width: 20 },
      { key: 'leadNumber', header: 'Lead #', width: 16 },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Call Records', columns: tableColumns, rows: tableRows }],
      metadata: { topOutcome },
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      type: 'CALL',
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.dimension === 'outcome') {
      where.outcome = params.value === 'No Outcome' ? null : params.value;
    }
    const result = await this.drillDownSvc.getActivities(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
