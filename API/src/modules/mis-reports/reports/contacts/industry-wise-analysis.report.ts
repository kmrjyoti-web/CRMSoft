import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class IndustryWiseAnalysisReport implements IReport {
  readonly code = 'INDUSTRY_WISE_ANALYSIS';
  readonly name = 'Industry-Wise Analysis';
  readonly category = 'CONTACT_ORG';
  readonly description = 'Analyzes lead performance, conversion rates, and revenue grouped by organization industry';
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
    const where: any = {
      tenantId: params.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.userId) where.allocatedToId = params.userId;

    const leads = await this.prisma.lead.findMany({
      where,
      select: {
        status: true,
        expectedValue: true,
        organization: { select: { industry: true } },
      },
    });

    const industryMap = new Map<string, {
      leads: number; won: number; lost: number; revenue: number;
    }>();

    for (const lead of leads) {
      const industry = lead.organization?.industry || 'Unknown';
      if (!industryMap.has(industry)) {
        industryMap.set(industry, { leads: 0, won: 0, lost: 0, revenue: 0 });
      }
      const entry = industryMap.get(industry)!;
      entry.leads++;
      if (lead.status === 'WON') {
        entry.won++;
        entry.revenue += Number(lead.expectedValue || 0);
      }
      if (lead.status === 'LOST') entry.lost++;
    }

    const industries = [...industryMap.entries()].map(([industry, data]) => ({
      industry,
      ...data,
      conversionRate: data.leads > 0
        ? Math.round((data.won / data.leads) * 10000) / 100
        : 0,
    }));

    industries.sort((a, b) => b.revenue - a.revenue);

    const totalIndustries = industries.length;
    const allConversions = industries.filter(i => i.leads > 0).map(i => i.conversionRate);
    const avgConversion = allConversions.length > 0
      ? Math.round(allConversions.reduce((a, b) => a + b, 0) / allConversions.length * 100) / 100
      : 0;
    const bestIndustry = industries.length > 0 ? industries[0].industry : 'N/A';
    const worstIndustry = industries.length > 0 ? industries[industries.length - 1].industry : 'N/A';

    const summary: ReportMetric[] = [
      { key: 'totalIndustries', label: 'Total Industries', value: totalIndustries, format: 'number' },
      { key: 'avgConversion', label: 'Avg Conversion Rate', value: avgConversion, format: 'percent' },
      { key: 'bestIndustry', label: 'Best Industry (Revenue)', value: industries[0]?.revenue || 0, format: 'currency' },
      { key: 'worstIndustry', label: 'Worst Industry (Revenue)', value: industries[industries.length - 1]?.revenue || 0, format: 'currency' },
    ];

    const charts: ChartData[] = [
      {
        type: 'BAR', title: 'Leads by Industry',
        labels: industries.map(i => i.industry),
        datasets: [
          { label: 'Total Leads', data: industries.map(i => i.leads), color: '#2196F3' },
          { label: 'Won', data: industries.map(i => i.won), color: '#4CAF50' },
          { label: 'Lost', data: industries.map(i => i.lost), color: '#F44336' },
        ],
      },
      {
        type: 'DONUT', title: 'Revenue by Industry',
        labels: industries.map(i => i.industry),
        datasets: [{ label: 'Revenue', data: industries.map(i => i.revenue) }],
      },
    ];

    const tableColumns: ColumnDef[] = [
      { key: 'industry', header: 'Industry', width: 22 },
      { key: 'leads', header: 'Leads', width: 10, format: 'number' },
      { key: 'won', header: 'Won', width: 10, format: 'number' },
      { key: 'lost', header: 'Lost', width: 10, format: 'number' },
      { key: 'conversionRate', header: 'Conversion %', width: 14, format: 'percent' },
      { key: 'revenue', header: 'Revenue', width: 16, format: 'currency' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Industry Breakdown', columns: tableColumns, rows: industries }],
      metadata: { bestIndustry, worstIndustry },
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.dimension === 'industry') {
      where.organization = { industry: params.value === 'Unknown' ? null : params.value };
    }
    const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
