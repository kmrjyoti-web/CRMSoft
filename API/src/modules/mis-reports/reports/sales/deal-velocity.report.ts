import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

const STATUS_ORDER = [
  'NEW', 'VERIFIED', 'ALLOCATED', 'IN_PROGRESS',
  'DEMO_SCHEDULED', 'QUOTATION_SENT', 'NEGOTIATION', 'WON',
];

@Injectable()
export class DealVelocityReport implements IReport {
  readonly code = 'DEAL_VELOCITY';
  readonly name = 'Deal Velocity';
  readonly category = 'SALES';
  readonly description = 'Sales velocity metrics including cycle length, win rate, and per-stage timing';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
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
    const baseWhere: any = {
      tenantId: params.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.filters?.priority) baseWhere.priority = params.filters.priority;

    // All leads in the period
    const allLeads = await this.prisma.lead.findMany({
      where: baseWhere,
      select: {
        id: true, status: true, expectedValue: true,
        createdAt: true, updatedAt: true, allocatedToId: true,
      },
    });

    const wonLeads = allLeads.filter(l => l.status === 'WON');
    const decidedLeads = allLeads.filter(l => l.status === 'WON' || l.status === 'LOST');
    const wonCount = wonLeads.length;
    const wonRevenue = wonLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
    const avgDealSize = wonCount > 0 ? Math.round(wonRevenue / wonCount) : 0;
    const winRate = decidedLeads.length > 0 ? Math.round((wonCount / decidedLeads.length) * 10000) / 100 : 0;

    const cycleDays = wonLeads.map(l => (l.updatedAt.getTime() - l.createdAt.getTime()) / 86400000);
    const avgCycleLength = cycleDays.length > 0
      ? Math.round((cycleDays.reduce((a, b) => a + b, 0) / cycleDays.length) * 10) / 10
      : 0;

    // Sales Velocity = (wonDeals * avgDealSize * winRate%) / avgCycleLength
    const velocity = avgCycleLength > 0
      ? Math.round((wonCount * avgDealSize * (winRate / 100)) / avgCycleLength)
      : 0;

    const summary: ReportMetric[] = [
      { key: 'velocity', label: 'Sales Velocity', value: velocity, format: 'currency' },
      { key: 'avgCycleLength', label: 'Avg Cycle Length', value: avgCycleLength, format: 'days' },
      { key: 'winRate', label: 'Win Rate', value: winRate, format: 'percent' },
      { key: 'avgDealSize', label: 'Avg Deal Size', value: avgDealSize, format: 'currency' },
      { key: 'wonDeals', label: 'Won Deals', value: wonCount, format: 'number' },
    ];

    // BAR chart: approximate avg days per stage (using current status as proxy)
    const stageDaysMap = new Map<string, number[]>();
    allLeads.forEach(l => {
      const days = (l.updatedAt.getTime() - l.createdAt.getTime()) / 86400000;
      const arr = stageDaysMap.get(l.status) || [];
      arr.push(days);
      stageDaysMap.set(l.status, arr);
    });

    const stageLabels = STATUS_ORDER.filter(s => stageDaysMap.has(s));
    const stageAvgDays = stageLabels.map(s => {
      const arr = stageDaysMap.get(s)!;
      return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
    });
    const stageChart: ChartData = {
      type: 'BAR', title: 'Average Days per Stage',
      labels: stageLabels,
      datasets: [{ label: 'Avg Days', data: stageAvgDays, color: '#FF9800' }],
    };

    // Per user velocity table
    const userIds = [...new Set(allLeads.filter(l => l.allocatedToId).map(l => l.allocatedToId!))];
    const users = userIds.length > 0
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, firstName: true, lastName: true },
        })
      : [];
    const userMap = new Map(users.map(u => [u.id, `${u.firstName} ${u.lastName}`]));

    const userRows = userIds.map(uid => {
      const uLeads = allLeads.filter(l => l.allocatedToId === uid);
      const uWon = uLeads.filter(l => l.status === 'WON');
      const uDecided = uLeads.filter(l => l.status === 'WON' || l.status === 'LOST');
      const uWonRev = uWon.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
      const uAvgDeal = uWon.length > 0 ? Math.round(uWonRev / uWon.length) : 0;
      const uWinRate = uDecided.length > 0 ? Math.round((uWon.length / uDecided.length) * 10000) / 100 : 0;
      const uCycleDays = uWon.map(l => (l.updatedAt.getTime() - l.createdAt.getTime()) / 86400000);
      const uAvgCycle = uCycleDays.length > 0
        ? Math.round((uCycleDays.reduce((a, b) => a + b, 0) / uCycleDays.length) * 10) / 10
        : 0;
      const uVelocity = uAvgCycle > 0
        ? Math.round((uWon.length * uAvgDeal * (uWinRate / 100)) / uAvgCycle)
        : 0;

      return {
        userName: userMap.get(uid) || 'Unknown',
        totalLeads: uLeads.length,
        wonDeals: uWon.length,
        winRate: uWinRate,
        avgDealSize: uAvgDeal,
        avgCycleDays: uAvgCycle,
        velocity: uVelocity,
      };
    }).sort((a, b) => b.velocity - a.velocity);

    const tableCols: ColumnDef[] = [
      { key: 'userName', header: 'Sales Rep', width: 20 },
      { key: 'totalLeads', header: 'Total Leads', width: 12, format: 'number' },
      { key: 'wonDeals', header: 'Won', width: 10, format: 'number' },
      { key: 'winRate', header: 'Win Rate', width: 12, format: 'percent' },
      { key: 'avgDealSize', header: 'Avg Deal', width: 14, format: 'currency' },
      { key: 'avgCycleDays', header: 'Avg Days', width: 12, format: 'number' },
      { key: 'velocity', header: 'Velocity', width: 14, format: 'currency' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary,
      charts: [stageChart],
      tables: [{ title: 'Velocity by Sales Rep', columns: tableCols, rows: userRows }],
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.dimension === 'user') where.allocatedToId = params.value;
    const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
