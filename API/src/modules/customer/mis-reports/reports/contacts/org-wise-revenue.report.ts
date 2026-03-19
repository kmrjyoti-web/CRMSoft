import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class OrgWiseRevenueReport implements IReport {
  readonly code = 'ORG_WISE_REVENUE';
  readonly name = 'Organization-Wise Revenue';
  readonly category = 'CONTACT_ORG';
  readonly description = 'Revenue analysis per organization including deal counts, lifetime value, and Pareto distribution';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'industry', label: 'Industry', type: 'text' },
    { key: 'allocatedToId', label: 'Sales Rep', type: 'user' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const baseWhere: any = {
      tenantId: params.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.userId) baseWhere.allocatedToId = params.userId;

    const orgs = await this.prisma.organization.findMany({
      where: {
        tenantId: params.tenantId,
        isActive: true,
        ...(params.filters?.industry ? { industry: params.filters.industry } : {}),
      },
      select: { id: true, name: true },
    });

    const orgStats: Array<{
      orgId: string; orgName: string; leads: number; won: number;
      revenue: number; lifetime: number; avgDealSize: number;
    }> = [];

    for (const org of orgs) {
      const periodLeads = await this.prisma.lead.findMany({
        where: { ...baseWhere, organizationId: org.id },
        select: { status: true, expectedValue: true },
      });

      const wonPeriod = periodLeads.filter(l => l.status === 'WON');
      const revenue = wonPeriod.reduce((s, l) => s + Number(l.expectedValue || 0), 0);

      // Lifetime value: all-time WON leads
      const lifetimeWon = await this.prisma.lead.findMany({
        where: { tenantId: params.tenantId, organizationId: org.id, status: 'WON' },
        select: { expectedValue: true },
      });
      const lifetime = lifetimeWon.reduce((s, l) => s + Number(l.expectedValue || 0), 0);

      if (periodLeads.length > 0) {
        orgStats.push({
          orgId: org.id,
          orgName: org.name,
          leads: periodLeads.length,
          won: wonPeriod.length,
          revenue,
          lifetime,
          avgDealSize: wonPeriod.length > 0 ? Math.round(revenue / wonPeriod.length) : 0,
        });
      }
    }

    orgStats.sort((a, b) => b.revenue - a.revenue);

    const totalOrgs = orgStats.length;
    const totalRevenue = orgStats.reduce((s, o) => s + o.revenue, 0);
    const topOrgRevenue = orgStats.length > 0 ? orgStats[0].revenue : 0;
    const avgOrgRevenue = totalOrgs > 0 ? Math.round(totalRevenue / totalOrgs) : 0;

    // Pareto: what % of orgs produce 80% of revenue
    let runningRevenue = 0;
    let paretoCount = 0;
    for (const o of orgStats) {
      runningRevenue += o.revenue;
      paretoCount++;
      if (runningRevenue >= totalRevenue * 0.8) break;
    }
    const paretoPercent = totalOrgs > 0
      ? Math.round((paretoCount / totalOrgs) * 10000) / 100
      : 0;

    const summary: ReportMetric[] = [
      { key: 'totalOrgs', label: 'Total Organizations', value: totalOrgs, format: 'number' },
      { key: 'topOrgRevenue', label: 'Top Org Revenue', value: topOrgRevenue, format: 'currency' },
      { key: 'avgOrgRevenue', label: 'Avg Org Revenue', value: avgOrgRevenue, format: 'currency' },
      { key: 'paretoPercent', label: 'Pareto % (80% Revenue)', value: paretoPercent, format: 'percent' },
    ];

    const top20 = orgStats.slice(0, 20);
    const charts: ChartData[] = [
      {
        type: 'BAR', title: 'Top 20 Organizations by Revenue',
        labels: top20.map(o => o.orgName),
        datasets: [{ label: 'Revenue', data: top20.map(o => o.revenue), color: '#4CAF50' }],
      },
    ];

    const tableColumns: ColumnDef[] = [
      { key: 'orgName', header: 'Organization', width: 25 },
      { key: 'leads', header: 'Leads', width: 10, format: 'number' },
      { key: 'won', header: 'Won', width: 10, format: 'number' },
      { key: 'revenue', header: 'Revenue', width: 16, format: 'currency' },
      { key: 'lifetime', header: 'Lifetime Value', width: 16, format: 'currency' },
      { key: 'avgDealSize', header: 'Avg Deal Size', width: 16, format: 'currency' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Organization Revenue Breakdown', columns: tableColumns, rows: orgStats }],
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.dimension === 'org') where.organizationId = params.value;
    const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
