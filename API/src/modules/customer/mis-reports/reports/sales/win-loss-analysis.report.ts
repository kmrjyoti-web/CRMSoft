import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class WinLossAnalysisReport implements IReport {
  readonly code = 'WIN_LOSS_ANALYSIS';
  readonly name = 'Win/Loss Analysis';
  readonly category = 'SALES';
  readonly description = 'Detailed analysis of won vs lost deals by source, user, and lost reason';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'allocatedToId', label: 'Sales Rep', type: 'user' },
    { key: 'priority', label: 'Priority', type: 'select', options: [
      { value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' },
      { value: 'HIGH', label: 'High' }, { value: 'URGENT', label: 'Urgent' },
    ]},
    { key: 'outcome', label: 'Outcome', type: 'select', options: [
      { value: 'WON', label: 'Won' }, { value: 'LOST', label: 'Lost' },
    ]},
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = {
      tenantId: params.tenantId,
      status: { in: ['WON', 'LOST'] },
      updatedAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.userId) where.allocatedToId = params.userId;
    if (params.filters?.priority) where.priority = params.filters.priority;
    if (params.filters?.outcome) where.status = params.filters.outcome;

    const leads = await this.prisma.lead.findMany({
      where,
      include: {
        allocatedTo: { select: { id: true, firstName: true, lastName: true } },
        filters: { include: { lookupValue: { include: { lookup: { select: { category: true } } } } } },
      },
    });

    const wonLeads = leads.filter(l => l.status === 'WON');
    const lostLeads = leads.filter(l => l.status === 'LOST');
    const totalDecided = leads.length;
    const won = wonLeads.length;
    const lost = lostLeads.length;
    const winRate = totalDecided > 0 ? Math.round((won / totalDecided) * 10000) / 100 : 0;
    const avgWonValue = won > 0
      ? Math.round(wonLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0) / won)
      : 0;
    const avgLostValue = lost > 0
      ? Math.round(lostLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0) / lost)
      : 0;

    const summary: ReportMetric[] = [
      { key: 'totalDecided', label: 'Total Decided', value: totalDecided, format: 'number' },
      { key: 'won', label: 'Won', value: won, format: 'number' },
      { key: 'lost', label: 'Lost', value: lost, format: 'number' },
      { key: 'winRate', label: 'Win Rate', value: winRate, format: 'percent' },
      { key: 'avgWonValue', label: 'Avg Won Value', value: avgWonValue, format: 'currency' },
      { key: 'avgLostValue', label: 'Avg Lost Value', value: avgLostValue, format: 'currency' },
    ];

    // PIE chart: won vs lost
    const winLossPie: ChartData = {
      type: 'PIE', title: 'Won vs Lost',
      labels: ['Won', 'Lost'],
      datasets: [{ label: 'Deals', data: [won, lost], color: '#4CAF50' }],
    };

    // BAR chart: lost reasons
    const reasonMap = new Map<string, number>();
    lostLeads.forEach(l => {
      const reason = l.lostReason || 'Not Specified';
      reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
    });
    const reasonLabels = [...reasonMap.keys()].sort((a, b) => reasonMap.get(b)! - reasonMap.get(a)!);
    const lostReasonsChart: ChartData = {
      type: 'BAR', title: 'Lost Reasons',
      labels: reasonLabels,
      datasets: [{ label: 'Count', data: reasonLabels.map(r => reasonMap.get(r)!), color: '#F44336' }],
    };

    // Table: by source
    const sourceMap = new Map<string, { won: number; lost: number }>();
    leads.forEach(l => {
      const sourceFilter = l.filters?.find(
        (f: any) => f.lookupValue?.lookup?.category === 'LEAD_SOURCE',
      );
      const source = sourceFilter?.lookupValue?.label || 'Unknown';
      const entry = sourceMap.get(source) || { won: 0, lost: 0 };
      if (l.status === 'WON') entry.won++;
      else entry.lost++;
      sourceMap.set(source, entry);
    });

    const sourceRows = [...sourceMap.entries()].map(([source, data]) => ({
      source,
      won: data.won,
      lost: data.lost,
      total: data.won + data.lost,
      winRate: data.won + data.lost > 0
        ? Math.round((data.won / (data.won + data.lost)) * 10000) / 100
        : 0,
    })).sort((a, b) => b.total - a.total);

    const sourceCols: ColumnDef[] = [
      { key: 'source', header: 'Source', width: 20 },
      { key: 'won', header: 'Won', width: 10, format: 'number' },
      { key: 'lost', header: 'Lost', width: 10, format: 'number' },
      { key: 'total', header: 'Total', width: 10, format: 'number' },
      { key: 'winRate', header: 'Win Rate', width: 12, format: 'percent' },
    ];

    // Table: by user
    const userMap = new Map<string, { name: string; won: number; lost: number }>();
    leads.forEach(l => {
      const uid = l.allocatedToId || 'unassigned';
      const name = l.allocatedTo ? `${l.allocatedTo.firstName} ${l.allocatedTo.lastName}` : 'Unassigned';
      const entry = userMap.get(uid) || { name, won: 0, lost: 0 };
      if (l.status === 'WON') entry.won++;
      else entry.lost++;
      userMap.set(uid, entry);
    });

    const userRows = [...userMap.values()].map(u => ({
      userName: u.name,
      won: u.won,
      lost: u.lost,
      total: u.won + u.lost,
      winRate: u.won + u.lost > 0
        ? Math.round((u.won / (u.won + u.lost)) * 10000) / 100
        : 0,
    })).sort((a, b) => b.total - a.total);

    const userCols: ColumnDef[] = [
      { key: 'userName', header: 'Sales Rep', width: 20 },
      { key: 'won', header: 'Won', width: 10, format: 'number' },
      { key: 'lost', header: 'Lost', width: 10, format: 'number' },
      { key: 'total', header: 'Total', width: 10, format: 'number' },
      { key: 'winRate', header: 'Win Rate', width: 12, format: 'percent' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary,
      charts: [winLossPie, lostReasonsChart],
      tables: [
        { title: 'Win/Loss by Source', columns: sourceCols, rows: sourceRows },
        { title: 'Win/Loss by Sales Rep', columns: userCols, rows: userRows },
      ],
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      updatedAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.dimension === 'status') where.status = params.value;
    const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
