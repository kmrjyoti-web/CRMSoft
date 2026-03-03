import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

const FUNNEL_STAGES = [
  'NEW', 'VERIFIED', 'ALLOCATED', 'IN_PROGRESS',
  'DEMO_SCHEDULED', 'QUOTATION_SENT', 'NEGOTIATION', 'WON',
] as const;

@Injectable()
export class LeadFunnelReport implements IReport {
  readonly code = 'LEAD_FUNNEL';
  readonly name = 'Lead Funnel Analysis';
  readonly category = 'LEAD';
  readonly description = 'Visualises the lead pipeline as a funnel with stage counts and drop-off percentages';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;
  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'source', label: 'Lead Source', type: 'select' },
    { key: 'allocatedTo', label: 'Allocated To', type: 'user' },
    { key: 'groupBy', label: 'Group By', type: 'select', options: [{ value: 'source', label: 'Source' }] },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownService: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = { tenantId: params.tenantId, createdAt: { gte: params.dateFrom, lte: params.dateTo } };
    if (params.userId) where.allocatedToId = params.userId;

    const leads = await this.prisma.lead.findMany({
      where,
      select: {
        status: true,
        expectedValue: true,
        filters: { include: { lookupValue: { include: { lookup: true } } } },
      },
    });

    const stageMap = new Map<string, { count: number; value: number }>();
    FUNNEL_STAGES.forEach(s => stageMap.set(s, { count: 0, value: 0 }));

    for (const lead of leads) {
      const entry = stageMap.get(lead.status);
      if (entry) {
        entry.count++;
        entry.value += Number(lead.expectedValue || 0);
      }
    }

    const stages = FUNNEL_STAGES.map(s => ({ stage: s, ...stageMap.get(s)! }));
    const totalLeads = leads.length;
    const wonCount = stageMap.get('WON')!.count;
    const overallConversion = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 10000) / 100 : 0;

    let biggestLeakStage = 'N/A';
    let maxDrop = 0;
    const tableRows: any[] = [];
    for (let i = 0; i < stages.length; i++) {
      const prev = i > 0 ? stages[i - 1].count : stages[i].count;
      const dropOff = prev > 0 ? Math.round(((prev - stages[i].count) / prev) * 10000) / 100 : 0;
      if (i > 0 && prev - stages[i].count > maxDrop) {
        maxDrop = prev - stages[i].count;
        biggestLeakStage = stages[i].stage;
      }
      tableRows.push({
        stage: stages[i].stage, count: stages[i].count,
        value: stages[i].value, dropOffPercent: i === 0 ? 0 : dropOff,
      });
    }

    const funnelHealth = overallConversion >= 15 ? 'Healthy' : overallConversion >= 5 ? 'Average' : 'Poor';

    const summary: ReportMetric[] = [
      { key: 'totalLeads', label: 'Total Leads', value: totalLeads, format: 'number' },
      { key: 'biggestLeakStage', label: 'Biggest Leak Stage', value: maxDrop, format: 'number' },
      { key: 'overallConversion', label: 'Overall Conversion (NEW to WON)', value: overallConversion, format: 'percent' },
      { key: 'funnelHealth', label: 'Funnel Health', value: overallConversion, format: 'percent' },
    ];

    const charts: ChartData[] = [
      {
        type: 'FUNNEL', title: 'Lead Funnel',
        labels: stages.map(s => s.stage),
        datasets: [{ label: 'Leads', data: stages.map(s => s.count) }],
      },
    ];

    if (params.groupBy === 'source') {
      const sourceMap = new Map<string, number[]>();
      for (const lead of leads) {
        const src = lead.filters.find(f => f.lookupValue?.lookup?.category === 'LEAD_SOURCE');
        const srcLabel = src?.lookupValue?.label || 'Unknown';
        if (!sourceMap.has(srcLabel)) sourceMap.set(srcLabel, new Array(FUNNEL_STAGES.length).fill(0));
        const idx = FUNNEL_STAGES.indexOf(lead.status as any);
        if (idx >= 0) sourceMap.get(srcLabel)![idx]++;
      }
      charts.push({
        type: 'STACKED_BAR', title: 'Funnel by Source',
        labels: [...FUNNEL_STAGES],
        datasets: Array.from(sourceMap.entries()).map(([label, data]) => ({ label, data })),
      });
    }

    const columns: ColumnDef[] = [
      { key: 'stage', header: 'Stage', width: 20 },
      { key: 'count', header: 'Count', width: 10, format: 'number' },
      { key: 'value', header: 'Value', width: 18, format: 'currency' },
      { key: 'dropOffPercent', header: 'Drop-off %', width: 12, format: 'percent' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Funnel Stages', columns, rows: tableRows }],
      metadata: { funnelHealth, biggestLeakStage },
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
