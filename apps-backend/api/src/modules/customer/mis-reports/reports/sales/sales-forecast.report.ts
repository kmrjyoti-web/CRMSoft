import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

const STAGE_PROBABILITIES: Record<string, number> = {
  NEW: 10, VERIFIED: 20, ALLOCATED: 30, IN_PROGRESS: 40,
  DEMO_SCHEDULED: 50, QUOTATION_SENT: 70, NEGOTIATION: 85,
};

const PIPELINE_STATUSES = Object.keys(STAGE_PROBABILITIES);

@Injectable()
export class SalesForecastReport implements IReport {
  readonly code = 'SALES_FORECAST';
  readonly name = 'Sales Forecast';
  readonly category = 'SALES';
  readonly description = 'Pipeline-weighted revenue forecast with optimistic, realistic, and pessimistic scenarios';
  readonly supportsDrillDown = false;
  readonly supportsPeriodComparison = false;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'allocatedToId', label: 'Sales Rep', type: 'user' },
    { key: 'priority', label: 'Priority', type: 'select', options: [
      { value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' },
      { value: 'HIGH', label: 'High' }, { value: 'URGENT', label: 'Urgent' },
    ]},
    { key: 'minValue', label: 'Min Expected Value', type: 'text' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = {
      tenantId: params.tenantId,
      status: { in: PIPELINE_STATUSES },
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.userId) where.allocatedToId = params.userId;
    if (params.filters?.priority) where.priority = params.filters.priority;

    const leads = await this.prisma.working.lead.findMany({
      where,
      include: {
        contact: { select: { firstName: true, lastName: true } },
        organization: { select: { name: true } },
      },
      orderBy: { expectedValue: 'desc' },
    });

    let realisticTotal = 0;
    const stageValueMap = new Map<string, { total: number; weighted: number; count: number }>();

    const enriched = leads.map(l => {
      const value = Number(l.expectedValue || 0);
      const probability = STAGE_PROBABILITIES[l.status] || 0;
      const weightedValue = Math.round(value * probability / 100);
      realisticTotal += weightedValue;

      const entry = stageValueMap.get(l.status) || { total: 0, weighted: 0, count: 0 };
      entry.total += value;
      entry.weighted += weightedValue;
      entry.count++;
      stageValueMap.set(l.status, entry);

      return {
        id: l.id,
        leadNumber: l.leadNumber,
        contact: l.contact ? `${l.contact.firstName} ${l.contact.lastName}` : '',
        organization: l.organization?.name || '',
        status: l.status,
        value,
        probability,
        weightedValue,
        expectedCloseDate: l.expectedCloseDate,
      };
    });

    const optimisticTotal = Math.round(realisticTotal * 1.3);
    const pessimisticTotal = Math.round(realisticTotal * 0.7);

    const summary: ReportMetric[] = [
      { key: 'realisticForecast', label: 'Realistic Forecast', value: realisticTotal, format: 'currency' },
      { key: 'optimisticForecast', label: 'Optimistic Forecast', value: optimisticTotal, format: 'currency' },
      { key: 'pessimisticForecast', label: 'Pessimistic Forecast', value: pessimisticTotal, format: 'currency' },
      { key: 'pipelineCount', label: 'Pipeline Deals', value: leads.length, format: 'number' },
    ];

    // BAR chart: value and weighted value by stage
    const orderedStages = PIPELINE_STATUSES.filter(s => stageValueMap.has(s));
    const stageChart: ChartData = {
      type: 'BAR', title: 'Pipeline Value by Stage',
      labels: orderedStages,
      datasets: [
        { label: 'Total Value', data: orderedStages.map(s => stageValueMap.get(s)!.total), color: '#90CAF9' },
        { label: 'Weighted Value', data: orderedStages.map(s => stageValueMap.get(s)!.weighted), color: '#4CAF50' },
      ],
    };

    // Top 20 deals by weighted value
    const topDeals = enriched
      .sort((a, b) => b.weightedValue - a.weightedValue)
      .slice(0, 20);

    const tableCols: ColumnDef[] = [
      { key: 'leadNumber', header: 'Lead #', width: 16 },
      { key: 'contact', header: 'Contact', width: 20 },
      { key: 'organization', header: 'Organization', width: 22 },
      { key: 'status', header: 'Stage', width: 16 },
      { key: 'value', header: 'Value', width: 14, format: 'currency' },
      { key: 'probability', header: 'Prob %', width: 10, format: 'percent' },
      { key: 'weightedValue', header: 'Weighted', width: 14, format: 'currency' },
      { key: 'expectedCloseDate', header: 'Exp. Close', width: 14, format: 'date' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary,
      charts: [stageChart],
      tables: [{ title: 'Top 20 Pipeline Deals', columns: tableCols, rows: topDeals }],
      metadata: { stageProbabilities: STAGE_PROBABILITIES },
    };
  }
}
