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

interface SourceBucket {
  total: number; won: number; revenue: number; closeDays: number[]; label: string;
}

@Injectable()
export class LeadSourceAnalysisReport implements IReport {
  readonly code = 'LEAD_SOURCE_ANALYSIS';
  readonly name = 'Lead Source Analysis';
  readonly category = 'LEAD';
  readonly description = 'Analyses lead generation effectiveness across different sources with conversion and revenue metrics';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;
  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'status', label: 'Status', type: 'multi_select', options: [
      { value: 'WON', label: 'Won' }, { value: 'LOST', label: 'Lost' },
      { value: 'IN_PROGRESS', label: 'In Progress' },
    ]},
    { key: 'allocatedTo', label: 'Allocated To', type: 'user' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownService: DrillDownService,
    private readonly resolver: CrossDbResolverService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = { tenantId: params.tenantId, createdAt: { gte: params.dateFrom, lte: params.dateTo } };
    if (params.userId) where.allocatedToId = params.userId;

    const rawLeads = await this.prisma.working.lead.findMany({
      where,
      select: {
        status: true, expectedValue: true, createdAt: true, updatedAt: true,
        filters: true,
      },
    });
    const allFilters = rawLeads.flatMap(l => l.filters || []);
    const enrichedFilters = await this.resolver.resolveLookupValues(allFilters, 'lookupValueId', true);
    let filterIdx = 0;
    const leads = rawLeads.map(lead => {
      const count = (lead.filters || []).length;
      const resolved = enrichedFilters.slice(filterIdx, filterIdx + count);
      filterIdx += count;
      return { ...lead, filters: resolved };
    });

    const sources = new Map<string, SourceBucket>();
    for (const lead of leads) {
      const srcFilter = lead.filters.find(f => f.lookupValue?.lookup?.category === 'LEAD_SOURCE');
      const label = srcFilter?.lookupValue?.label || 'Unknown';
      if (!sources.has(label)) sources.set(label, { total: 0, won: 0, revenue: 0, closeDays: [], label });
      const bucket = sources.get(label)!;
      bucket.total++;
      if (lead.status === 'WON') {
        bucket.won++;
        bucket.revenue += Number(lead.expectedValue || 0);
        const days = Math.ceil((lead.updatedAt.getTime() - lead.createdAt.getTime()) / 86400000);
        bucket.closeDays.push(days);
      }
    }

    const sourceList = Array.from(sources.values()).sort((a, b) => b.total - a.total);
    const totalSources = sourceList.length;

    const rateOf = (s: SourceBucket) => s.total > 0 ? Math.round((s.won / s.total) * 10000) / 100 : 0;
    const qualityRating = (conv: number) =>
      conv > 30 ? 'Excellent' : conv > 20 ? 'Good' : conv > 10 ? 'Average' : 'Poor';

    const best = sourceList.reduce((a, b) => rateOf(a) > rateOf(b) ? a : b, sourceList[0]);
    const worst = sourceList.reduce((a, b) => rateOf(a) < rateOf(b) ? a : b, sourceList[0]);
    const avgConversion = totalSources > 0
      ? Math.round(sourceList.reduce((s, b) => s + rateOf(b), 0) / totalSources * 100) / 100
      : 0;

    const summary: ReportMetric[] = [
      { key: 'totalSources', label: 'Total Sources', value: totalSources, format: 'number' },
      { key: 'bestSource', label: 'Best Source', value: rateOf(best || { total: 0, won: 0 } as any), format: 'percent' },
      { key: 'worstSource', label: 'Worst Source', value: rateOf(worst || { total: 0, won: 0 } as any), format: 'percent' },
      { key: 'avgConversion', label: 'Avg Conversion Across Sources', value: avgConversion, format: 'percent' },
    ];

    const charts: ChartData[] = [
      {
        type: 'BAR', title: 'Leads by Source',
        labels: sourceList.map(s => s.label),
        datasets: [{ label: 'Leads', data: sourceList.map(s => s.total) }],
      },
      {
        type: 'DONUT', title: 'Revenue by Source',
        labels: sourceList.map(s => s.label),
        datasets: [{ label: 'Revenue', data: sourceList.map(s => s.revenue) }],
      },
    ];

    const avgClose = (days: number[]) => days.length > 0 ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0;
    const tableRows = sourceList.map(s => ({
      source: s.label, totalLeads: s.total, wonLeads: s.won,
      conversionRate: rateOf(s), totalRevenue: s.revenue,
      avgCloseTime: avgClose(s.closeDays), qualityRating: qualityRating(rateOf(s)),
    }));

    const columns: ColumnDef[] = [
      { key: 'source', header: 'Source', width: 20 },
      { key: 'totalLeads', header: 'Total Leads', width: 12, format: 'number' },
      { key: 'wonLeads', header: 'Won', width: 10, format: 'number' },
      { key: 'conversionRate', header: 'Conversion %', width: 14, format: 'percent' },
      { key: 'totalRevenue', header: 'Revenue', width: 18, format: 'currency' },
      { key: 'avgCloseTime', header: 'Avg Close (days)', width: 16, format: 'number' },
      { key: 'qualityRating', header: 'Quality', width: 12 },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Source Breakdown', columns, rows: tableRows }],
      metadata: { bestSource: best?.label, worstSource: worst?.label },
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const leads = await this.prisma.working.lead.findMany({
      where: {
        tenantId: params.filters?.tenantId,
        createdAt: { gte: params.dateFrom, lte: params.dateTo },
        filters: { some: { lookupValue: { label: params.value, lookup: { category: 'LEAD_SOURCE' } } } },
      },
      select: { id: true },
    });
    const where = { tenantId: params.filters?.tenantId, id: { in: leads.map(l => l.id) } };
    const result = await this.drillDownService.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
