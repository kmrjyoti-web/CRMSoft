import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

const BUCKETS = [
  { label: '0-7 days', min: 0, max: 7 },
  { label: '8-14 days', min: 8, max: 14 },
  { label: '15-30 days', min: 15, max: 30 },
  { label: '31-60 days', min: 31, max: 60 },
  { label: '60+ days', min: 61, max: Infinity },
] as const;

@Injectable()
export class LeadAgingReport implements IReport {
  readonly code = 'LEAD_AGING';
  readonly name = 'Lead Aging Report';
  readonly category = 'LEAD';
  readonly description = 'Analyses active leads by age buckets to identify stale or ageing pipeline items';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = false;
  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'status', label: 'Status', type: 'multi_select' },
    { key: 'allocatedTo', label: 'Allocated To', type: 'user' },
    { key: 'priority', label: 'Priority', type: 'select', options: [
      { value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' },
      { value: 'HIGH', label: 'High' }, { value: 'URGENT', label: 'Urgent' },
    ]},
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownService: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const now = new Date();
    const where: any = {
      tenantId: params.tenantId,
      status: { notIn: ['WON', 'LOST'] },
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.userId) where.allocatedToId = params.userId;
    if (params.filters?.priority) where.priority = params.filters.priority;

    const leads = await this.prisma.lead.findMany({
      where,
      include: {
        contact: { select: { firstName: true, lastName: true } },
        organization: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const bucketCounts = BUCKETS.map(() => 0);
    const ageDays: number[] = [];

    for (const lead of leads) {
      const age = Math.floor((now.getTime() - lead.createdAt.getTime()) / 86400000);
      ageDays.push(age);
      const idx = BUCKETS.findIndex(b => age >= b.min && age <= b.max);
      if (idx >= 0) bucketCounts[idx]++;
    }

    const totalActive = leads.length;
    const avgAge = totalActive > 0 ? Math.round(ageDays.reduce((a, b) => a + b, 0) / totalActive) : 0;
    const stalestAge = ageDays.length > 0 ? Math.max(...ageDays) : 0;
    const staleOver30 = ageDays.filter(d => d > 30).length;
    const stalePct = totalActive > 0 ? Math.round((staleOver30 / totalActive) * 10000) / 100 : 0;

    const summary: ReportMetric[] = [
      { key: 'totalActive', label: 'Total Active Leads', value: totalActive, format: 'number' },
      { key: 'avgAge', label: 'Average Age', value: avgAge, format: 'days' },
      { key: 'stalestAge', label: 'Stalest Lead Age', value: stalestAge, format: 'days' },
      { key: 'stalePctOverThirtyDays', label: 'Stale (>30 days) %', value: stalePct, format: 'percent' },
    ];

    const charts: ChartData[] = [
      {
        type: 'BAR', title: 'Leads by Age Bucket',
        labels: BUCKETS.map(b => b.label),
        datasets: [{ label: 'Leads', data: bucketCounts }],
      },
    ];

    const stalest = leads
      .map(l => ({
        leadNumber: l.leadNumber,
        contact: l.contact ? `${l.contact.firstName} ${l.contact.lastName}` : '',
        organization: l.organization?.name || '',
        status: l.status,
        age: Math.floor((now.getTime() - l.createdAt.getTime()) / 86400000),
        value: Number(l.expectedValue || 0),
      }))
      .sort((a, b) => b.age - a.age)
      .slice(0, 20);

    const columns: ColumnDef[] = [
      { key: 'leadNumber', header: 'Lead #', width: 18 },
      { key: 'contact', header: 'Contact', width: 22 },
      { key: 'organization', header: 'Organization', width: 25 },
      { key: 'status', header: 'Status', width: 14 },
      { key: 'age', header: 'Age (days)', width: 12, format: 'number' },
      { key: 'value', header: 'Value', width: 18, format: 'currency' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Top 20 Stalest Leads', columns, rows: stalest }],
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const bucket = BUCKETS.find(b => b.label === params.value);
    const now = new Date();
    const minDate = bucket ? new Date(now.getTime() - bucket.max * 86400000) : undefined;
    const maxDate = bucket ? new Date(now.getTime() - bucket.min * 86400000) : undefined;

    const where: any = {
      tenantId: params.filters?.tenantId,
      status: { notIn: ['WON', 'LOST'] },
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (minDate && maxDate) {
      where.createdAt = { gte: minDate, lte: maxDate };
    }
    const result = await this.drillDownService.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
