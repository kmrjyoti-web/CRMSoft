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
export class DemoConversionReport implements IReport {
  readonly code = 'DEMO_CONVERSION';
  readonly name = 'Demo Conversion';
  readonly category = 'DEMO';
  readonly description = 'Tracks the Demo to Quotation to Won pipeline with conversion rates at each stage';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'conductedById', label: 'Conducted By', type: 'user' },
    { key: 'mode', label: 'Demo Mode', type: 'select', options: [
      { value: 'ONLINE', label: 'Online' }, { value: 'OFFLINE', label: 'Offline' },
    ]},
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = {
      tenantId: params.tenantId,
      scheduledAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.userId) where.conductedById = params.userId;
    if (params.filters?.mode) where.mode = params.filters.mode;

    const demos = await this.prisma.working.demo.findMany({
      where,
      select: {
        id: true, scheduledAt: true, completedAt: true,
        leadId: true,
        conductedBy: { select: { id: true, firstName: true, lastName: true } },
        lead: {
          select: {
            id: true, status: true, updatedAt: true,
            quotations: { select: { id: true } },
          },
        },
      },
    });

    const totalDemos = demos.length;
    const demosWithQuotation = demos.filter(d => d.lead.quotations.length > 0);
    const demosWithWon = demos.filter(d => d.lead.status === 'WON');

    const demoToQuotationRate = totalDemos > 0
      ? Math.round((demosWithQuotation.length / totalDemos) * 10000) / 100
      : 0;
    const demoToWonRate = totalDemos > 0
      ? Math.round((demosWithWon.length / totalDemos) * 10000) / 100
      : 0;

    // Avg days from demo to won
    const daysToWon = demosWithWon
      .filter(d => d.completedAt)
      .map(d => (d.lead.updatedAt.getTime() - d.completedAt!.getTime()) / 86400000)
      .filter(days => days >= 0);
    const avgDemoToWonDays = daysToWon.length > 0
      ? Math.round(daysToWon.reduce((a, b) => a + b, 0) / daysToWon.length)
      : 0;

    const summary: ReportMetric[] = [
      { key: 'totalDemos', label: 'Total Demos', value: totalDemos, format: 'number' },
      { key: 'demoToQuotationRate', label: 'Demo to Quotation Rate', value: demoToQuotationRate, format: 'percent' },
      { key: 'demoToWonRate', label: 'Demo to Won Rate', value: demoToWonRate, format: 'percent' },
      { key: 'avgDemoToWonDays', label: 'Avg Demo to Won (Days)', value: avgDemoToWonDays, format: 'days' },
    ];

    const charts: ChartData[] = [
      {
        type: 'FUNNEL', title: 'Demo Conversion Funnel',
        labels: ['Demos', 'Quotations', 'Won'],
        datasets: [{
          label: 'Count',
          data: [totalDemos, demosWithQuotation.length, demosWithWon.length],
          color: '#009688',
        }],
      },
    ];

    // Per user conversion table
    const userMap = new Map<string, {
      name: string; demos: number; quotations: number; won: number;
    }>();

    demos.forEach(d => {
      const userId = d.conductedBy.id;
      const name = `${d.conductedBy.firstName} ${d.conductedBy.lastName}`;
      if (!userMap.has(userId)) {
        userMap.set(userId, { name, demos: 0, quotations: 0, won: 0 });
      }
      const entry = userMap.get(userId)!;
      entry.demos++;
      if (d.lead.quotations.length > 0) entry.quotations++;
      if (d.lead.status === 'WON') entry.won++;
    });

    const userStats = [...userMap.entries()].map(([userId, data]) => ({
      userId,
      name: data.name,
      demos: data.demos,
      quotations: data.quotations,
      won: data.won,
      demoToQuotation: data.demos > 0
        ? Math.round((data.quotations / data.demos) * 10000) / 100
        : 0,
      demoToWon: data.demos > 0
        ? Math.round((data.won / data.demos) * 10000) / 100
        : 0,
    }));

    userStats.sort((a, b) => b.demoToWon - a.demoToWon);

    const tableColumns: ColumnDef[] = [
      { key: 'name', header: 'User', width: 22 },
      { key: 'demos', header: 'Demos', width: 10, format: 'number' },
      { key: 'quotations', header: 'Quotations', width: 12, format: 'number' },
      { key: 'won', header: 'Won', width: 10, format: 'number' },
      { key: 'demoToQuotation', header: 'Demo?Quote %', width: 14, format: 'percent' },
      { key: 'demoToWon', header: 'Demo?Won %', width: 14, format: 'percent' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Per User Conversion Metrics', columns: tableColumns, rows: userStats }],
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      scheduledAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.dimension === 'user') where.conductedById = params.value;
    const result = await this.drillDownSvc.getDemos(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
