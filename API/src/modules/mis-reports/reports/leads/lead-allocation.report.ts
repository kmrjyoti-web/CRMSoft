import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

interface UserBucket {
  userId: string; userName: string;
  assigned: number; active: number; won: number; lost: number; totalValue: number;
}

@Injectable()
export class LeadAllocationReport implements IReport {
  readonly code = 'LEAD_ALLOCATION';
  readonly name = 'Lead Allocation Report';
  readonly category = 'LEAD';
  readonly description = 'Analyses lead distribution across team members with performance and workload metrics';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;
  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'status', label: 'Status', type: 'multi_select' },
    { key: 'allocatedTo', label: 'Allocated To', type: 'user' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownService: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = { tenantId: params.tenantId, createdAt: { gte: params.dateFrom, lte: params.dateTo } };

    const leads = await this.prisma.lead.findMany({
      where,
      select: {
        status: true, expectedValue: true, allocatedToId: true,
        allocatedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const activeStatuses = ['NEW', 'VERIFIED', 'ALLOCATED', 'IN_PROGRESS', 'DEMO_SCHEDULED', 'QUOTATION_SENT', 'NEGOTIATION', 'ON_HOLD'];
    const userMap = new Map<string, UserBucket>();
    const unallocated: any[] = [];

    for (const lead of leads) {
      if (!lead.allocatedToId) {
        unallocated.push(lead);
        continue;
      }
      const uid = lead.allocatedToId;
      if (!userMap.has(uid)) {
        const name = lead.allocatedTo ? `${lead.allocatedTo.firstName} ${lead.allocatedTo.lastName}` : 'Unknown';
        userMap.set(uid, { userId: uid, userName: name, assigned: 0, active: 0, won: 0, lost: 0, totalValue: 0 });
      }
      const bucket = userMap.get(uid)!;
      bucket.assigned++;
      bucket.totalValue += Number(lead.expectedValue || 0);
      if (lead.status === 'WON') bucket.won++;
      else if (lead.status === 'LOST') bucket.lost++;
      if (activeStatuses.includes(lead.status)) bucket.active++;
    }

    const users = Array.from(userMap.values()).sort((a, b) => b.assigned - a.assigned);
    const totalAllocated = users.reduce((s, u) => s + u.assigned, 0);
    const avgPerUser = users.length > 0 ? Math.round(totalAllocated / users.length) : 0;
    const topPerformer = users.reduce((best, u) => {
      const rate = u.assigned > 0 ? u.won / u.assigned : 0;
      const bestRate = best.assigned > 0 ? best.won / best.assigned : 0;
      return rate > bestRate ? u : best;
    }, users[0] || { userName: 'N/A', assigned: 0, won: 0 } as any);

    const summary: ReportMetric[] = [
      { key: 'totalAllocated', label: 'Total Allocated Leads', value: totalAllocated, format: 'number' },
      { key: 'unallocated', label: 'Unallocated Leads', value: unallocated.length, format: 'number' },
      { key: 'avgLeadsPerUser', label: 'Avg Leads per User', value: avgPerUser, format: 'number' },
      { key: 'topPerformer', label: 'Top Performer Conversion %', value: topPerformer?.assigned > 0
        ? Math.round((topPerformer.won / topPerformer.assigned) * 10000) / 100 : 0, format: 'percent' },
    ];

    const charts: ChartData[] = [
      {
        type: 'BAR', title: 'Leads per User',
        labels: users.map(u => u.userName),
        datasets: [
          { label: 'Assigned', data: users.map(u => u.assigned), color: '#4A90D9' },
          { label: 'Won', data: users.map(u => u.won), color: '#27AE60' },
          { label: 'Lost', data: users.map(u => u.lost), color: '#E74C3C' },
        ],
      },
    ];

    const userRows = users.map(u => ({
      userName: u.userName, assigned: u.assigned, active: u.active,
      won: u.won, lost: u.lost,
      conversionRate: u.assigned > 0 ? Math.round((u.won / u.assigned) * 10000) / 100 : 0,
      avgValue: u.assigned > 0 ? Math.round(u.totalValue / u.assigned) : 0,
    }));

    const userColumns: ColumnDef[] = [
      { key: 'userName', header: 'User', width: 22 },
      { key: 'assigned', header: 'Assigned', width: 10, format: 'number' },
      { key: 'active', header: 'Active', width: 10, format: 'number' },
      { key: 'won', header: 'Won', width: 10, format: 'number' },
      { key: 'lost', header: 'Lost', width: 10, format: 'number' },
      { key: 'conversionRate', header: 'Conversion %', width: 14, format: 'percent' },
      { key: 'avgValue', header: 'Avg Value', width: 16, format: 'currency' },
    ];

    const unallocRows = unallocated.slice(0, 20).map(l => ({
      leadNumber: l.leadNumber || '', status: l.status,
      value: Number(l.expectedValue || 0),
    }));
    const unallocColumns: ColumnDef[] = [
      { key: 'leadNumber', header: 'Lead #', width: 18 },
      { key: 'status', header: 'Status', width: 14 },
      { key: 'value', header: 'Value', width: 18, format: 'currency' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [
        { title: 'Allocation by User', columns: userColumns, rows: userRows },
        { title: 'Unallocated Leads (Top 20)', columns: unallocColumns, rows: unallocRows },
      ],
      metadata: { topPerformer: topPerformer?.userName },
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.value === 'unallocated') {
      where.allocatedToId = null;
    } else {
      where.allocatedToId = params.value;
    }
    const result = await this.drillDownService.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
