import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class SalesTrendReport implements IReport {
  readonly code = 'SALES_TREND';
  readonly name = 'Sales Trend';
  readonly category = 'SALES';
  readonly description = 'Rolling monthly revenue trend with cumulative view and month-over-month growth';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'allocatedToId', label: 'Sales Rep', type: 'user' },
    { key: 'months', label: 'Months to Show', type: 'select', options: [
      { value: '6', label: '6 Months' }, { value: '9', label: '9 Months' },
      { value: '12', label: '12 Months' },
    ], defaultValue: '12' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const monthCount = parseInt(params.filters?.months || '12', 10);
    const endDate = params.dateTo;
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - monthCount);

    const where: any = {
      tenantId: params.tenantId,
      status: 'WON',
      updatedAt: { gte: startDate, lte: endDate },
    };
    if (params.userId) where.allocatedToId = params.userId;

    const wonLeads = await this.prisma.lead.findMany({
      where,
      select: { expectedValue: true, updatedAt: true },
    });

    // Build monthly data
    const monthlyMap = new Map<string, { revenue: number; deals: number }>();
    const months: string[] = [];
    for (let i = 0; i < monthCount; i++) {
      const d = new Date(endDate);
      d.setMonth(d.getMonth() - (monthCount - 1 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(key);
      monthlyMap.set(key, { revenue: 0, deals: 0 });
    }

    wonLeads.forEach(l => {
      const key = `${l.updatedAt.getFullYear()}-${String(l.updatedAt.getMonth() + 1).padStart(2, '0')}`;
      const entry = monthlyMap.get(key);
      if (entry) {
        entry.revenue += Number(l.expectedValue || 0);
        entry.deals++;
      }
    });

    const monthlyData = months.map(m => monthlyMap.get(m)!);
    const revenueValues = monthlyData.map(d => d.revenue);
    const currentMonthRevenue = revenueValues[revenueValues.length - 1] || 0;
    const prevMonthRevenue = revenueValues.length >= 2 ? revenueValues[revenueValues.length - 2] : 0;
    const monthOverMonthGrowth = prevMonthRevenue > 0
      ? Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 10000) / 100
      : 0;
    const avgMonthlyRevenue = revenueValues.length > 0
      ? Math.round(revenueValues.reduce((a, b) => a + b, 0) / revenueValues.length)
      : 0;

    const summary: ReportMetric[] = [
      { key: 'currentMonthRevenue', label: 'Current Month Revenue', value: currentMonthRevenue, format: 'currency' },
      { key: 'prevMonthRevenue', label: 'Previous Month Revenue', value: prevMonthRevenue, format: 'currency' },
      { key: 'monthOverMonthGrowth', label: 'MoM Growth', value: monthOverMonthGrowth, format: 'percent' },
      { key: 'avgMonthlyRevenue', label: 'Avg Monthly Revenue', value: avgMonthlyRevenue, format: 'currency' },
    ];

    // LINE chart: monthly revenue trend
    const revenueLine: ChartData = {
      type: 'LINE', title: 'Monthly Revenue Trend',
      labels: months,
      datasets: [{ label: 'Revenue', data: revenueValues, color: '#2196F3' }],
    };

    // AREA chart: cumulative revenue
    let cumulative = 0;
    const cumulativeData = revenueValues.map(v => { cumulative += v; return cumulative; });
    const cumulativeArea: ChartData = {
      type: 'AREA', title: 'Cumulative Revenue',
      labels: months,
      datasets: [{ label: 'Cumulative Revenue', data: cumulativeData, color: '#4CAF50' }],
    };

    // Monthly data table
    const tableRows = months.map((month, idx) => {
      const data = monthlyData[idx];
      const prevRev = idx > 0 ? monthlyData[idx - 1].revenue : 0;
      const growth = prevRev > 0
        ? Math.round(((data.revenue - prevRev) / prevRev) * 10000) / 100
        : 0;
      return {
        month,
        revenue: data.revenue,
        deals: data.deals,
        avgDealSize: data.deals > 0 ? Math.round(data.revenue / data.deals) : 0,
        growthPercent: growth,
      };
    });

    const tableCols: ColumnDef[] = [
      { key: 'month', header: 'Month', width: 12 },
      { key: 'revenue', header: 'Revenue', width: 16, format: 'currency' },
      { key: 'deals', header: 'Deals', width: 10, format: 'number' },
      { key: 'avgDealSize', header: 'Avg Deal Size', width: 16, format: 'currency' },
      { key: 'growthPercent', header: 'Growth %', width: 12, format: 'percent' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary,
      charts: [revenueLine, cumulativeArea],
      tables: [{ title: 'Monthly Revenue Data', columns: tableCols, rows: tableRows }],
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      status: 'WON',
    };
    if (params.dimension === 'month') {
      const [year, month] = params.value.split('-').map(Number);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      where.updatedAt = { gte: start, lte: end };
    }
    const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
