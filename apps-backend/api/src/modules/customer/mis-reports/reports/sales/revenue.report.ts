// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
import { CrossDbResolverService } from '../../../../../core/prisma/cross-db-resolver.service';

@Injectable()
export class RevenueReport implements IReport {
  readonly code = 'REVENUE';
  readonly name = 'Revenue Analysis';
  readonly category = 'SALES';
  readonly description = 'Revenue breakdown by month, source, and industry with deal size distribution';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'groupBy', label: 'Group By', type: 'select', options: [
      { value: 'month', label: 'Month' }, { value: 'source', label: 'Lead Source' },
      { value: 'industry', label: 'Industry' },
    ], defaultValue: 'month' },
    { key: 'allocatedToId', label: 'Sales Rep', type: 'user' },
    { key: 'minValue', label: 'Min Deal Value', type: 'text' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
    private readonly resolver: CrossDbResolverService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = {
      tenantId: params.tenantId,
      status: 'WON',
      updatedAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.userId) where.allocatedToId = params.userId;

    const rawLeads = await this.prisma.working.lead.findMany({
      where,
      include: {
        contact: { select: { firstName: true, lastName: true } },
        organization: { select: { name: true, industry: true } },
        filters: true,
      },
      orderBy: { expectedValue: 'desc' },
    });
    const allFilters = rawLeads.flatMap(l => l.filters || []);
    const enrichedFilters = await this.resolver.resolveLookupValues(allFilters, 'lookupValueId', true);
    let filterIdx = 0;
    const wonLeads = rawLeads.map(lead => {
      const count = (lead.filters || []).length;
      const resolved = enrichedFilters.slice(filterIdx, filterIdx + count);
      filterIdx += count;
      return { ...lead, filters: resolved };
    });

    const totalRevenue = wonLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
    const dealCount = wonLeads.length;
    const avgDealSize = dealCount > 0 ? Math.round(totalRevenue / dealCount) : 0;
    const largestDeal = wonLeads.length > 0 ? Number(wonLeads[0].expectedValue || 0) : 0;

    const summary: ReportMetric[] = [
      { key: 'totalRevenue', label: 'Total Revenue', value: totalRevenue, format: 'currency' },
      { key: 'avgDealSize', label: 'Avg Deal Size', value: avgDealSize, format: 'currency' },
      { key: 'dealCount', label: 'Deal Count', value: dealCount, format: 'number' },
      { key: 'largestDeal', label: 'Largest Deal', value: largestDeal, format: 'currency' },
    ];

    // Revenue by month BAR chart
    const monthMap = new Map<string, number>();
    wonLeads.forEach(l => {
      const key = `${l.updatedAt.getFullYear()}-${String(l.updatedAt.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, (monthMap.get(key) || 0) + Number(l.expectedValue || 0));
    });
    const sortedMonths = [...monthMap.keys()].sort();
    const revenueBarChart: ChartData = {
      type: 'BAR', title: 'Revenue by Month',
      labels: sortedMonths,
      datasets: [{ label: 'Revenue', data: sortedMonths.map(m => monthMap.get(m)!), color: '#4CAF50' }],
    };

    // Deal size distribution PIE chart
    const ranges = [
      { label: '0-50K', min: 0, max: 50000 },
      { label: '50K-1L', min: 50000, max: 100000 },
      { label: '1L-5L', min: 100000, max: 500000 },
      { label: '5L+', min: 500000, max: Infinity },
    ];
    const sizeDistribution = ranges.map(r =>
      wonLeads.filter(l => { const v = Number(l.expectedValue || 0); return v >= r.min && v < r.max; }).length,
    );
    const sizePieChart: ChartData = {
      type: 'PIE', title: 'Deal Size Distribution',
      labels: ranges.map(r => r.label),
      datasets: [{ label: 'Deals', data: sizeDistribution }],
    };

    // Revenue by timeline table
    const timelineRows = sortedMonths.map(month => {
      const mLeads = wonLeads.filter(l =>
        `${l.updatedAt.getFullYear()}-${String(l.updatedAt.getMonth() + 1).padStart(2, '0')}` === month,
      );
      const revenue = mLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
      return { month, deals: mLeads.length, revenue, avgDeal: mLeads.length > 0 ? Math.round(revenue / mLeads.length) : 0 };
    });
    const timelineCols: ColumnDef[] = [
      { key: 'month', header: 'Month', width: 12 },
      { key: 'deals', header: 'Deals', width: 10, format: 'number' },
      { key: 'revenue', header: 'Revenue', width: 16, format: 'currency' },
      { key: 'avgDeal', header: 'Avg Deal', width: 16, format: 'currency' },
    ];

    // Top 10 deals table
    const topDeals = wonLeads.slice(0, 10).map(l => ({
      leadNumber: l.leadNumber,
      contact: l.contact ? `${l.contact.firstName} ${l.contact.lastName}` : '',
      organization: l.organization?.name || '',
      value: Number(l.expectedValue || 0),
      source: this.getLeadSource(l),
      closedAt: l.updatedAt,
    }));
    const topDealsCols: ColumnDef[] = [
      { key: 'leadNumber', header: 'Lead #', width: 16 },
      { key: 'contact', header: 'Contact', width: 20 },
      { key: 'organization', header: 'Organization', width: 22 },
      { key: 'value', header: 'Value', width: 16, format: 'currency' },
      { key: 'source', header: 'Source', width: 16 },
      { key: 'closedAt', header: 'Closed', width: 14, format: 'date' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary,
      charts: [revenueBarChart, sizePieChart],
      tables: [
        { title: 'Revenue by Month', columns: timelineCols, rows: timelineRows },
        { title: 'Top 10 Deals', columns: topDealsCols, rows: topDeals },
      ],
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      status: 'WON',
      updatedAt: { gte: params.dateFrom, lte: params.dateTo },
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

  private getLeadSource(lead: Record<string, unknown>): string {
    const sourceFilter = lead.filters?.find(
      (f: Record<string, unknown>) => f.lookupValue?.lookup?.category === 'LEAD_SOURCE',
    );
    return sourceFilter?.lookupValue?.label || 'Unknown';
  }
}
