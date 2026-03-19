import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class ContactGrowthReport implements IReport {
  readonly code = 'CONTACT_GROWTH';
  readonly name = 'Contact Growth';
  readonly category = 'CONTACT_ORG';
  readonly description = 'Tracks new contacts added over time with cumulative growth curve and monthly breakdown';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'createdById', label: 'Created By', type: 'user' },
    { key: 'isActive', label: 'Active Only', type: 'boolean', defaultValue: true },
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
    if (params.filters?.isActive !== undefined) where.isActive = params.filters.isActive;

    const contacts = await this.prisma.contact.findMany({
      where,
      select: { id: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const totalContacts = await this.prisma.contact.count({
      where: { tenantId: params.tenantId },
    });

    const newInPeriod = contacts.length;
    const months = this.getMonthRange(params.dateFrom, params.dateTo);
    const monthlyMap = new Map<string, number>();
    months.forEach(m => monthlyMap.set(m, 0));
    contacts.forEach(c => {
      const key = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
    });

    const monthLabels = [...monthlyMap.keys()].sort();
    const monthlyData = monthLabels.map(m => monthlyMap.get(m)!);
    const avgPerMonth = monthLabels.length > 0
      ? Math.round(newInPeriod / monthLabels.length)
      : 0;

    // Cumulative counts
    const prePeriodCount = await this.prisma.contact.count({
      where: { tenantId: params.tenantId, createdAt: { lt: params.dateFrom } },
    });
    let running = prePeriodCount;
    const cumulativeData = monthlyData.map(v => { running += v; return running; });

    const growthRate = prePeriodCount > 0
      ? Math.round((newInPeriod / prePeriodCount) * 10000) / 100
      : 0;

    const summary: ReportMetric[] = [
      { key: 'totalContacts', label: 'Total Contacts', value: totalContacts, format: 'number' },
      { key: 'newInPeriod', label: 'New in Period', value: newInPeriod, format: 'number' },
      { key: 'growthRate', label: 'Growth Rate', value: growthRate, format: 'percent' },
      { key: 'avgPerMonth', label: 'Avg per Month', value: avgPerMonth, format: 'number' },
    ];

    const charts: ChartData[] = [
      {
        type: 'LINE', title: 'New Contacts by Month',
        labels: monthLabels,
        datasets: [{ label: 'New Contacts', data: monthlyData, color: '#4CAF50' }],
      },
      {
        type: 'AREA', title: 'Cumulative Contacts',
        labels: monthLabels,
        datasets: [{ label: 'Cumulative', data: cumulativeData, color: '#2196F3' }],
      },
    ];

    const tableColumns: ColumnDef[] = [
      { key: 'month', header: 'Month', width: 12 },
      { key: 'newContacts', header: 'New Contacts', width: 14, format: 'number' },
      { key: 'cumulative', header: 'Cumulative', width: 14, format: 'number' },
    ];

    const tableRows = monthLabels.map((m, i) => ({
      month: m,
      newContacts: monthlyData[i],
      cumulative: cumulativeData[i],
    }));

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Monthly Contact Growth', columns: tableColumns, rows: tableRows }],
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = { tenantId: params.filters?.tenantId };
    if (params.dimension === 'month') {
      const [year, month] = params.value.split('-').map(Number);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      where.createdAt = { gte: start, lte: end };
    } else {
      where.createdAt = { gte: params.dateFrom, lte: params.dateTo };
    }
    const result = await this.drillDownSvc.getContacts(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }

  private getMonthRange(from: Date, to: Date): string[] {
    const months: string[] = [];
    const current = new Date(from.getFullYear(), from.getMonth(), 1);
    while (current <= to) {
      months.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  }
}
