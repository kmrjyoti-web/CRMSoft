import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class WorkloadDistributionReport implements IReport {
  readonly code = 'WORKLOAD_DISTRIBUTION';
  readonly name = 'Workload Distribution';
  readonly category = 'TEAM';
  readonly description = 'Visualizes active workload per team member with overload detection and rebalance suggestions';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = false;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'maxLeads', label: 'Max Leads per User', type: 'text' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const tenantId = params.tenantId;
    const maxLeads = Number(params.filters?.maxLeads) || 50;

    const users = await this.prisma.user.findMany({
      where: { tenantId, status: 'ACTIVE', userType: 'EMPLOYEE' },
      select: { id: true, firstName: true, lastName: true },
    });
    const userIds = users.map(u => u.id);

    const [activeLeads, activeDemos, activeQuotations, lastActivities] = await Promise.all([
      this.prisma.working.lead.findMany({
        where: { tenantId, allocatedToId: { in: userIds }, status: { notIn: ['WON', 'LOST'] } },
        select: { allocatedToId: true },
      }),
      this.prisma.working.demo.findMany({
        where: { tenantId, conductedById: { in: userIds }, status: 'SCHEDULED' },
        select: { conductedById: true },
      }),
      this.prisma.working.quotation.findMany({
        where: { tenantId, createdById: { in: userIds }, status: { in: ['SENT', 'VIEWED'] } },
        select: { createdById: true },
      }),
      this.prisma.working.activity.findMany({
        where: { tenantId, createdById: { in: userIds } },
        orderBy: { createdAt: 'desc' },
        distinct: ['createdById'],
        select: { createdById: true, createdAt: true },
      }),
    ]);

    const lastActivityMap = new Map(lastActivities.map(a => [a.createdById, a.createdAt]));

    const getStatus = (pct: number): string => {
      if (pct > 90) return 'CRITICAL';
      if (pct > 75) return 'OVERLOADED';
      if (pct > 50) return 'HEAVY';
      return 'NORMAL';
    };

    const getColor = (status: string): string => {
      if (status === 'CRITICAL') return '#F44336';
      if (status === 'OVERLOADED') return '#FF9800';
      if (status === 'HEAVY') return '#FFC107';
      return '#4CAF50';
    };

    const userStats = users.map(u => {
      const leadCount = activeLeads.filter(l => l.allocatedToId === u.id).length;
      const loadPercent = Math.round((leadCount / maxLeads) * 10000) / 100;
      const status = getStatus(loadPercent);
      const demoCount = activeDemos.filter(d => d.conductedById === u.id).length;
      const quotationCount = activeQuotations.filter(q => q.createdById === u.id).length;
      const lastActivityAt = lastActivityMap.get(u.id) || null;

      return {
        userId: u.id, userName: `${u.firstName} ${u.lastName}`,
        activeLeads: leadCount, maxLeads, loadPercent, status,
        activeDemos: demoCount, activeQuotations: quotationCount, lastActivityAt,
      };
    });

    userStats.sort((a, b) => b.loadPercent - a.loadPercent);

    // Rebalance suggestions
    const overloaded = userStats.filter(u => u.status === 'CRITICAL' || u.status === 'OVERLOADED');
    const underloaded = userStats.filter(u => u.loadPercent < 25);
    const suggestions: Array<{ from: string; to: string; leadsToTransfer: number; reason: string }> = [];

    overloaded.forEach(over => {
      const excess = over.activeLeads - Math.round(maxLeads * 0.6);
      if (excess > 0 && underloaded.length > 0) {
        const target = underloaded.find(u => u.loadPercent < 40) || underloaded[0];
        const transfer = Math.min(excess, Math.round(maxLeads * 0.2));
        suggestions.push({
          from: over.userName, to: target.userName, leadsToTransfer: transfer,
          reason: `${over.userName} is ${over.status} at ${over.loadPercent}% while ${target.userName} is at ${target.loadPercent}%`,
        });
      }
    });

    const totalUsers = userStats.length;
    const overloadedCount = overloaded.length;
    const underutilized = underloaded.length;
    const avgLoad = totalUsers > 0
      ? Math.round(userStats.reduce((s, u) => s + u.loadPercent, 0) / totalUsers * 100) / 100
      : 0;

    const summary: ReportMetric[] = [
      { key: 'totalUsers', label: 'Total Users', value: totalUsers, format: 'number' },
      { key: 'overloaded', label: 'Overloaded', value: overloadedCount, format: 'number' },
      { key: 'underutilized', label: 'Underutilized', value: underutilized, format: 'number' },
      { key: 'avgLoad', label: 'Avg Load %', value: avgLoad, format: 'percent' },
    ];

    const charts: ChartData[] = [{
      type: 'BAR', title: 'Workload per User',
      labels: userStats.map(u => u.userName),
      datasets: [{
        label: 'Load %',
        data: userStats.map(u => u.loadPercent),
        color: userStats.length > 0 ? getColor(userStats[0].status) : '#4CAF50',
      }],
    }];

    const columns: ColumnDef[] = [
      { key: 'userName', header: 'Employee', width: 20 },
      { key: 'activeLeads', header: 'Active Leads', width: 12, format: 'number' },
      { key: 'maxLeads', header: 'Max Leads', width: 10, format: 'number' },
      { key: 'loadPercent', header: 'Load %', width: 10, format: 'percent' },
      { key: 'status', header: 'Status', width: 12 },
      { key: 'activeDemos', header: 'Demos', width: 8, format: 'number' },
      { key: 'activeQuotations', header: 'Quotes', width: 8, format: 'number' },
      { key: 'lastActivityAt', header: 'Last Activity', width: 15, format: 'date' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Workload Distribution', columns, rows: userStats }],
      metadata: { suggestions, maxLeads },
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      status: { notIn: ['WON', 'LOST'] },
    };
    if (params.dimension === 'user') where.allocatedToId = params.value;
    const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
