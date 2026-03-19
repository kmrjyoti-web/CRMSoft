import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class SalesSummaryReport implements IReport {
  readonly code = 'SALES_SUMMARY';
  readonly name = 'Sales Summary';
  readonly category = 'SALES';
  readonly description = 'Overall sales KPIs including leads, revenue, conversion rate, and pipeline value';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'status', label: 'Lead Status', type: 'multi_select', options: [
      { value: 'NEW', label: 'New' }, { value: 'VERIFIED', label: 'Verified' },
      { value: 'ALLOCATED', label: 'Allocated' }, { value: 'IN_PROGRESS', label: 'In Progress' },
      { value: 'DEMO_SCHEDULED', label: 'Demo Scheduled' }, { value: 'QUOTATION_SENT', label: 'Quotation Sent' },
      { value: 'NEGOTIATION', label: 'Negotiation' }, { value: 'WON', label: 'Won' },
      { value: 'LOST', label: 'Lost' }, { value: 'ON_HOLD', label: 'On Hold' },
    ]},
    { key: 'allocatedToId', label: 'Sales Rep', type: 'user' },
    { key: 'priority', label: 'Priority', type: 'select', options: [
      { value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' },
      { value: 'HIGH', label: 'High' }, { value: 'URGENT', label: 'Urgent' },
    ]},
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = { tenantId: params.tenantId, createdAt: { gte: params.dateFrom, lte: params.dateTo } };
    if (params.userId) where.allocatedToId = params.userId;
    if (params.filters?.status) where.status = { in: params.filters.status };
    if (params.filters?.priority) where.priority = params.filters.priority;

    const leads = await this.prisma.lead.findMany({
      where,
      select: { id: true, status: true, expectedValue: true, createdAt: true, updatedAt: true },
    });

    const totalLeads = leads.length;
    const wonLeads = leads.filter(l => l.status === 'WON');
    const wonCount = wonLeads.length;
    const wonRevenue = wonLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
    const conversionRate = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 10000) / 100 : 0;
    const avgDealSize = wonCount > 0 ? Math.round(wonRevenue / wonCount) : 0;

    const cycleDays = wonLeads.map(l => (l.updatedAt.getTime() - l.createdAt.getTime()) / 86400000);
    const avgCloseDays = cycleDays.length > 0 ? Math.round(cycleDays.reduce((a, b) => a + b, 0) / cycleDays.length) : 0;

    const pipelineStatuses = ['NEW', 'VERIFIED', 'ALLOCATED', 'IN_PROGRESS', 'DEMO_SCHEDULED', 'QUOTATION_SENT', 'NEGOTIATION'];
    const pipelineValue = leads
      .filter(l => pipelineStatuses.includes(l.status))
      .reduce((s, l) => s + Number(l.expectedValue || 0), 0);

    const summary: ReportMetric[] = [
      { key: 'totalLeads', label: 'Total Leads', value: totalLeads, format: 'number' },
      { key: 'wonLeads', label: 'Won Leads', value: wonCount, format: 'number' },
      { key: 'wonRevenue', label: 'Won Revenue', value: wonRevenue, format: 'currency' },
      { key: 'conversionRate', label: 'Conversion Rate', value: conversionRate, format: 'percent' },
      { key: 'avgDealSize', label: 'Avg Deal Size', value: avgDealSize, format: 'currency' },
      { key: 'avgCloseDays', label: 'Avg Close Days', value: avgCloseDays, format: 'days' },
      { key: 'pipelineValue', label: 'Pipeline Value', value: pipelineValue, format: 'currency' },
    ];

    // Line chart: leads created by month
    const monthMap = new Map<string, number>();
    leads.forEach(l => {
      const key = `${l.createdAt.getFullYear()}-${String(l.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, (monthMap.get(key) || 0) + 1);
    });
    const sortedMonths = [...monthMap.keys()].sort();
    const leadsLineChart: ChartData = {
      type: 'LINE', title: 'Leads Created Over Time',
      labels: sortedMonths,
      datasets: [{ label: 'Leads', data: sortedMonths.map(m => monthMap.get(m)!) }],
    };

    // Pie chart: status distribution
    const statusCounts = new Map<string, number>();
    leads.forEach(l => statusCounts.set(l.status, (statusCounts.get(l.status) || 0) + 1));
    const statusLabels = [...statusCounts.keys()];
    const statusPieChart: ChartData = {
      type: 'PIE', title: 'Lead Status Distribution',
      labels: statusLabels,
      datasets: [{ label: 'Count', data: statusLabels.map(s => statusCounts.get(s)!) }],
    };

    // Table: monthly breakdown
    const monthlyRows = sortedMonths.map(month => {
      const mLeads = leads.filter(l =>
        `${l.createdAt.getFullYear()}-${String(l.createdAt.getMonth() + 1).padStart(2, '0')}` === month,
      );
      const mWon = mLeads.filter(l => l.status === 'WON');
      const mRevenue = mWon.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
      const mConversion = mLeads.length > 0 ? Math.round((mWon.length / mLeads.length) * 10000) / 100 : 0;
      return { month, leads: mLeads.length, won: mWon.length, revenue: mRevenue, conversion: mConversion };
    });

    const tableColumns: ColumnDef[] = [
      { key: 'month', header: 'Month', width: 12 },
      { key: 'leads', header: 'Leads', width: 10, format: 'number' },
      { key: 'won', header: 'Won', width: 10, format: 'number' },
      { key: 'revenue', header: 'Revenue', width: 16, format: 'currency' },
      { key: 'conversion', header: 'Conversion %', width: 14, format: 'percent' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params,
      summary,
      charts: [leadsLineChart, statusPieChart],
      tables: [{ title: 'Monthly Breakdown', columns: tableColumns, rows: monthlyRows }],
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.dimension === 'status') where.status = params.value;
    const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
