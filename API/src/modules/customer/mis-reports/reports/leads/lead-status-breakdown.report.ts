import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

const ALL_STATUSES = [
  'NEW', 'VERIFIED', 'ALLOCATED', 'IN_PROGRESS', 'DEMO_SCHEDULED',
  'QUOTATION_SENT', 'NEGOTIATION', 'WON', 'LOST', 'ON_HOLD',
] as const;

@Injectable()
export class LeadStatusBreakdownReport implements IReport {
  readonly code = 'LEAD_STATUS_BREAKDOWN';
  readonly name = 'Lead Status Breakdown';
  readonly category = 'LEAD';
  readonly description = 'Snapshot of leads grouped by current status with count and value distribution';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;
  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'priority', label: 'Priority', type: 'select', options: [
      { value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' },
      { value: 'HIGH', label: 'High' }, { value: 'URGENT', label: 'Urgent' },
    ]},
    { key: 'allocatedTo', label: 'Allocated To', type: 'user' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownService: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = { tenantId: params.tenantId, createdAt: { gte: params.dateFrom, lte: params.dateTo } };
    if (params.userId) where.allocatedToId = params.userId;
    if (params.filters?.priority) where.priority = params.filters.priority;

    const leads = await this.prisma.working.lead.findMany({
      where,
      select: { status: true, expectedValue: true },
    });

    const statusMap = new Map<string, { count: number; value: number }>();
    ALL_STATUSES.forEach(s => statusMap.set(s, { count: 0, value: 0 }));

    for (const lead of leads) {
      const entry = statusMap.get(lead.status);
      if (entry) {
        entry.count++;
        entry.value += Number(lead.expectedValue || 0);
      }
    }

    const totalLeads = leads.length;
    const totalValue = Array.from(statusMap.values()).reduce((s, e) => s + e.value, 0);
    const pipelineStatuses = ['NEW', 'VERIFIED', 'ALLOCATED', 'IN_PROGRESS', 'DEMO_SCHEDULED', 'QUOTATION_SENT', 'NEGOTIATION'];
    const pipelineValue = pipelineStatuses.reduce((s, st) => s + (statusMap.get(st)?.value || 0), 0);
    const weightedPipeline = pipelineStatuses.reduce((s, st, i) => {
      const weight = (i + 1) / pipelineStatuses.length;
      return s + (statusMap.get(st)?.value || 0) * weight;
    }, 0);
    const avgValue = totalLeads > 0 ? Math.round(totalValue / totalLeads) : 0;

    const summary: ReportMetric[] = [
      { key: 'totalLeads', label: 'Total Leads', value: totalLeads, format: 'number' },
      { key: 'totalPipelineValue', label: 'Total Pipeline Value', value: Math.round(pipelineValue), format: 'currency' },
      { key: 'weightedPipelineValue', label: 'Weighted Pipeline Value', value: Math.round(weightedPipeline), format: 'currency' },
      { key: 'avgValuePerLead', label: 'Avg Value per Lead', value: avgValue, format: 'currency' },
    ];

    const statusList = ALL_STATUSES.map(s => ({ status: s, ...statusMap.get(s)! })).filter(s => s.count > 0);
    const charts: ChartData[] = [
      {
        type: 'PIE', title: 'Leads by Status',
        labels: statusList.map(s => s.status),
        datasets: [{ label: 'Count', data: statusList.map(s => s.count) }],
      },
      {
        type: 'BAR', title: 'Value by Status',
        labels: statusList.map(s => s.status),
        datasets: [{ label: 'Value', data: statusList.map(s => s.value) }],
      },
    ];

    const tableRows = statusList.map(s => ({
      status: s.status, count: s.count, value: s.value,
      avgValue: s.count > 0 ? Math.round(s.value / s.count) : 0,
      percentOfTotal: totalLeads > 0 ? Math.round((s.count / totalLeads) * 10000) / 100 : 0,
    }));

    const columns: ColumnDef[] = [
      { key: 'status', header: 'Status', width: 18 },
      { key: 'count', header: 'Count', width: 10, format: 'number' },
      { key: 'value', header: 'Total Value', width: 18, format: 'currency' },
      { key: 'avgValue', header: 'Avg Value', width: 16, format: 'currency' },
      { key: 'percentOfTotal', header: '% of Total', width: 12, format: 'percent' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Status Breakdown', columns, rows: tableRows }],
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      status: params.value,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    const result = await this.drillDownService.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
