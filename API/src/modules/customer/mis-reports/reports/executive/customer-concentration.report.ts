import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class CustomerConcentrationReport implements IReport {
  readonly code = 'CUSTOMER_CONCENTRATION';
  readonly name = 'Customer Concentration';
  readonly category = 'EXECUTIVE';
  readonly description = 'Pareto analysis of revenue by organization showing concentration risk and cumulative revenue distribution';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'industry', label: 'Industry', type: 'text' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = {
      tenantId: params.tenantId,
      status: 'WON',
      updatedAt: { gte: params.dateFrom, lte: params.dateTo },
      organizationId: { not: null },
    };

    const wonLeads = await this.prisma.working.lead.findMany({
      where,
      select: {
        id: true, expectedValue: true,
        organization: { select: { id: true, name: true, industry: true } },
      },
    });

    // Filter by industry if specified
    const filtered = params.filters?.industry
      ? wonLeads.filter(l => l.organization?.industry === params.filters!.industry)
      : wonLeads;

    // Aggregate revenue per organization
    const orgMap = new Map<string, { name: string; industry: string; revenue: number; dealCount: number }>();
    filtered.forEach(l => {
      const orgId = l.organization?.id;
      if (!orgId) return;
      if (!orgMap.has(orgId)) {
        orgMap.set(orgId, {
          name: l.organization!.name, industry: l.organization!.industry || 'N/A',
          revenue: 0, dealCount: 0,
        });
      }
      const entry = orgMap.get(orgId)!;
      entry.revenue += Number(l.expectedValue || 0);
      entry.dealCount++;
    });

    // Rank by revenue descending
    const ranked = [...orgMap.entries()].map(([orgId, d]) => ({
      orgId, name: d.name, industry: d.industry, revenue: d.revenue, dealCount: d.dealCount,
    })).sort((a, b) => b.revenue - a.revenue);

    const totalRevenue = ranked.reduce((s, r) => s + r.revenue, 0);
    const totalOrgs = ranked.length;

    // Pareto cumulative percentage
    let cumulative = 0;
    const paretoRows = ranked.map((r, idx) => {
      cumulative += r.revenue;
      const percent = totalRevenue > 0 ? Math.round((r.revenue / totalRevenue) * 10000) / 100 : 0;
      const cumulativePercent = totalRevenue > 0 ? Math.round((cumulative / totalRevenue) * 10000) / 100 : 0;
      return { rank: idx + 1, ...r, percent, cumulativePercent };
    });

    // Concentration metrics
    const top10Pct = Math.ceil(totalOrgs * 0.1);
    const top20Pct = Math.ceil(totalOrgs * 0.2);
    const top10Revenue = ranked.slice(0, top10Pct).reduce((s, r) => s + r.revenue, 0);
    const top20Revenue = ranked.slice(0, top20Pct).reduce((s, r) => s + r.revenue, 0);
    const top10PercentRevenueShare = totalRevenue > 0
      ? Math.round((top10Revenue / totalRevenue) * 10000) / 100
      : 0;
    const top20PercentRevenueShare = totalRevenue > 0
      ? Math.round((top20Revenue / totalRevenue) * 10000) / 100
      : 0;

    let riskLevel: string;
    if (top20PercentRevenueShare > 70) riskLevel = 'HIGH';
    else if (top20PercentRevenueShare > 50) riskLevel = 'MEDIUM';
    else riskLevel = 'LOW';

    const summary: ReportMetric[] = [
      { key: 'totalOrgs', label: 'Total Organizations', value: totalOrgs, format: 'number' },
      { key: 'top10PercentRevenueShare', label: 'Top 10% Revenue Share', value: top10PercentRevenueShare, format: 'percent' },
      { key: 'top20PercentRevenueShare', label: 'Top 20% Revenue Share', value: top20PercentRevenueShare, format: 'percent' },
      { key: 'riskScore', label: 'Concentration Risk Score', value: top20PercentRevenueShare, format: 'percent' },
    ];

    // Top 20 orgs bar chart
    const topN = paretoRows.slice(0, 20);
    const charts: ChartData[] = [
      {
        type: 'BAR', title: 'Top 20 Organizations by Revenue',
        labels: topN.map(r => r.name),
        datasets: [{ label: 'Revenue', data: topN.map(r => r.revenue), color: '#FF9800' }],
      },
      {
        type: 'LINE', title: 'Pareto Cumulative Curve',
        labels: paretoRows.map(r => r.name),
        datasets: [{ label: 'Cumulative %', data: paretoRows.map(r => r.cumulativePercent), color: '#E91E63' }],
      },
    ];

    const tableCols: ColumnDef[] = [
      { key: 'rank', header: 'Rank', width: 8, format: 'number' },
      { key: 'name', header: 'Organization', width: 25 },
      { key: 'industry', header: 'Industry', width: 16 },
      { key: 'dealCount', header: 'Deals', width: 10, format: 'number' },
      { key: 'revenue', header: 'Revenue', width: 16, format: 'currency' },
      { key: 'percent', header: '% of Total', width: 12, format: 'percent' },
      { key: 'cumulativePercent', header: 'Cumulative %', width: 14, format: 'percent' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Organization Revenue Ranking', columns: tableCols, rows: paretoRows }],
      metadata: { riskLevel, totalRevenue },
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      status: 'WON',
      updatedAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.dimension === 'organization') where.organizationId = params.value;
    const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
