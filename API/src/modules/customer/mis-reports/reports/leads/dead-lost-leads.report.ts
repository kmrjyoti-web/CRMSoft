import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

const NON_RECOVERABLE_REASONS = ['BUDGET', 'COMPETITOR_CHOSEN', 'NO_REQUIREMENT'];

@Injectable()
export class DeadLostLeadsReport implements IReport {
  readonly code = 'DEAD_LOST_LEADS';
  readonly name = 'Dead & Lost Leads';
  readonly category = 'LEAD';
  readonly description = 'Analyses lost and stale on-hold leads with reason breakdown and recovery potential';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;
  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'lostReason', label: 'Lost Reason', type: 'text' },
    { key: 'allocatedTo', label: 'Allocated To', type: 'user' },
    { key: 'recoverable', label: 'Recoverable Only', type: 'boolean', defaultValue: false },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownService: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    const [lostLeads, staleOnHold] = await Promise.all([
      this.prisma.lead.findMany({
        where: {
          tenantId: params.tenantId,
          status: 'LOST',
          createdAt: { gte: params.dateFrom, lte: params.dateTo },
        },
        include: {
          contact: { select: { firstName: true, lastName: true } },
          organization: { select: { name: true } },
        },
      }),
      this.prisma.lead.findMany({
        where: {
          tenantId: params.tenantId,
          status: 'ON_HOLD',
          updatedAt: { lte: thirtyDaysAgo },
          createdAt: { gte: params.dateFrom, lte: params.dateTo },
        },
        include: {
          contact: { select: { firstName: true, lastName: true } },
          organization: { select: { name: true } },
        },
      }),
    ]);

    const allDead = [...lostLeads, ...staleOnHold];
    const lostCount = lostLeads.length;
    const staleOnHoldCount = staleOnHold.length;
    const totalDead = allDead.length;
    const totalLostValue = lostLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
    const avgLostValue = lostCount > 0 ? Math.round(totalLostValue / lostCount) : 0;

    const summary: ReportMetric[] = [
      { key: 'totalDead', label: 'Total Dead Leads', value: totalDead, format: 'number' },
      { key: 'lostCount', label: 'Lost Leads', value: lostCount, format: 'number' },
      { key: 'staleOnHoldCount', label: 'Stale On-Hold Leads', value: staleOnHoldCount, format: 'number' },
      { key: 'totalLostValue', label: 'Total Lost Value', value: totalLostValue, format: 'currency' },
      { key: 'avgLostValue', label: 'Avg Lost Value', value: avgLostValue, format: 'currency' },
    ];

    // Lost reasons chart
    const reasonMap = new Map<string, number>();
    for (const lead of lostLeads) {
      const reason = lead.lostReason || 'Not Specified';
      reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
    }
    const reasons = Array.from(reasonMap.entries()).sort((a, b) => b[1] - a[1]);

    // Monthly lost leads chart
    const monthMap = new Map<string, number>();
    for (const lead of lostLeads) {
      const key = `${lead.updatedAt.getFullYear()}-${String(lead.updatedAt.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, (monthMap.get(key) || 0) + 1);
    }
    const months = Array.from(monthMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    const charts: ChartData[] = [
      {
        type: 'PIE', title: 'Lost Reasons',
        labels: reasons.map(r => r[0]),
        datasets: [{ label: 'Leads', data: reasons.map(r => r[1]) }],
      },
      {
        type: 'BAR', title: 'Monthly Lost Leads',
        labels: months.map(m => m[0]),
        datasets: [{ label: 'Lost', data: months.map(m => m[1]) }],
      },
    ];

    const tableRows = allDead.map(lead => {
      const deadSince = lead.status === 'LOST' ? lead.updatedAt : lead.updatedAt;
      const recoverable = lead.status === 'ON_HOLD' ||
        (lead.lostReason ? !NON_RECOVERABLE_REASONS.includes(lead.lostReason) : true);
      return {
        leadNumber: lead.leadNumber,
        contact: lead.contact ? `${lead.contact.firstName} ${lead.contact.lastName}` : '',
        organization: lead.organization?.name || '',
        status: lead.status,
        lostReason: lead.lostReason || 'Not Specified',
        value: Number(lead.expectedValue || 0),
        deadSince,
        recoverable,
      };
    });

    const filtered = params.filters?.recoverable
      ? tableRows.filter(r => r.recoverable)
      : tableRows;

    const columns: ColumnDef[] = [
      { key: 'leadNumber', header: 'Lead #', width: 18 },
      { key: 'contact', header: 'Contact', width: 22 },
      { key: 'organization', header: 'Organization', width: 25 },
      { key: 'status', header: 'Status', width: 12 },
      { key: 'lostReason', header: 'Lost Reason', width: 20 },
      { key: 'value', header: 'Value', width: 16, format: 'currency' },
      { key: 'deadSince', header: 'Dead Since', width: 15, format: 'date' },
      { key: 'recoverable', header: 'Recoverable', width: 12 },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Dead & Lost Leads', columns, rows: filtered }],
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.value === 'LOST') {
      where.status = 'LOST';
    } else if (params.value === 'ON_HOLD') {
      where.status = 'ON_HOLD';
      where.updatedAt = { lte: new Date(Date.now() - 30 * 86400000) };
    } else {
      where.status = { in: ['LOST', 'ON_HOLD'] };
    }
    const result = await this.drillDownService.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
