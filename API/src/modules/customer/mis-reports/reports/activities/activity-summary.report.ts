// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

const ACTIVITY_TYPES = ['CALL', 'EMAIL', 'MEETING', 'NOTE', 'WHATSAPP', 'SMS', 'VISIT'] as const;

@Injectable()
export class ActivitySummaryReport implements IReport {
  readonly code = 'ACTIVITY_SUMMARY';
  readonly name = 'Activity Summary';
  readonly category = 'ACTIVITY';
  readonly description = 'Overview of all activities by type and user with daily breakdown and volume trends';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'type', label: 'Activity Type', type: 'multi_select', options: ACTIVITY_TYPES.map(t => ({ value: t, label: t })) },
    { key: 'createdById', label: 'Performed By', type: 'user' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = {
      tenantId: params.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.userId) where.createdById = params.userId;
    if (params.filters?.type) where.type = { in: params.filters.type };

    const activities = await this.prisma.activity.findMany({
      where,
      select: {
        id: true, type: true, createdAt: true,
        createdByUser: { select: { firstName: true, lastName: true } },
      },
    });

    const totalActivities = activities.length;
    const dayCount = Math.max(1, Math.ceil(
      (params.dateTo.getTime() - params.dateFrom.getTime()) / 86400000,
    ));
    const avgPerDay = Math.round((totalActivities / dayCount) * 100) / 100;

    // Type distribution
    const typeCounts = new Map<string, number>();
    ACTIVITY_TYPES.forEach(t => typeCounts.set(t, 0));
    activities.forEach(a => typeCounts.set(a.type, (typeCounts.get(a.type) || 0) + 1));

    const mostCommonType = [...typeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Daily counts to find peak day
    const dailyMap = new Map<string, number>();
    activities.forEach(a => {
      const day = a.createdAt.toISOString().slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
    });
    const peakDayEntry = [...dailyMap.entries()].sort((a, b) => b[1] - a[1])[0];
    const peakDay = peakDayEntry ? peakDayEntry[0] : 'N/A';

    // User distribution
    const userMap = new Map<string, number>();
    activities.forEach(a => {
      const name = `${a.createdByUser.firstName} ${a.createdByUser.lastName}`;
      userMap.set(name, (userMap.get(name) || 0) + 1);
    });
    const usersSorted = [...userMap.entries()].sort((a, b) => b[1] - a[1]);
    const top15Users = usersSorted.slice(0, 15);

    const summary: ReportMetric[] = [
      { key: 'totalActivities', label: 'Total Activities', value: totalActivities, format: 'number' },
      { key: 'avgPerDay', label: 'Avg per Day', value: avgPerDay, format: 'number' },
      { key: 'peakDay', label: 'Peak Day Count', value: peakDayEntry?.[1] || 0, format: 'number' },
      { key: 'mostCommonType', label: 'Most Common Type Count', value: typeCounts.get(mostCommonType) || 0, format: 'number' },
    ];

    const typeLabels = [...typeCounts.keys()].filter(t => typeCounts.get(t)! > 0);
    const charts: ChartData[] = [
      {
        type: 'PIE', title: 'Activities by Type',
        labels: typeLabels,
        datasets: [{ label: 'Count', data: typeLabels.map(t => typeCounts.get(t)!) }],
      },
      {
        type: 'BAR', title: 'Activities by User (Top 15)',
        labels: top15Users.map(u => u[0]),
        datasets: [{ label: 'Activities', data: top15Users.map(u => u[1]), color: '#FF9800' }],
      },
    ];

    // Daily summary table
    const sortedDays = [...dailyMap.keys()].sort();
    const dailyRows = sortedDays.map(day => {
      const dayActivities = activities.filter(a => a.createdAt.toISOString().slice(0, 10) === day);
      const row: any = { date: day, total: dayActivities.length };
      ACTIVITY_TYPES.forEach(t => {
        row[t.toLowerCase()] = dayActivities.filter(a => a.type === t).length;
      });
      return row;
    });

    const tableColumns: ColumnDef[] = [
      { key: 'date', header: 'Date', width: 12, format: 'date' },
      ...ACTIVITY_TYPES.map(t => ({ key: t.toLowerCase(), header: t, width: 10, format: 'number' as const })),
      { key: 'total', header: 'Total', width: 10, format: 'number' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Daily Activity Summary', columns: tableColumns, rows: dailyRows }],
      metadata: { peakDay, mostCommonType },
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.dimension === 'type') where.type = params.value;
    const result = await this.drillDownSvc.getActivities(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
