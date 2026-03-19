import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class TargetVsAchievementReport implements IReport {
  readonly code = 'TARGET_VS_ACHIEVEMENT';
  readonly name = 'Target vs Achievement';
  readonly category = 'SALES';
  readonly description = 'Compare sales targets against actual achievements with projected outcomes';
  readonly supportsDrillDown = false;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'userId', label: 'Sales Rep', type: 'user' },
    { key: 'metric', label: 'Target Metric', type: 'select', options: [
      { value: 'REVENUE', label: 'Revenue' }, { value: 'DEALS_WON', label: 'Deals Won' },
      { value: 'LEADS_CREATED', label: 'Leads Created' },
    ]},
    { key: 'status', label: 'Target Status', type: 'select', options: [
      { value: 'ON_TRACK', label: 'On Track' }, { value: 'AT_RISK', label: 'At Risk' },
      { value: 'BEHIND', label: 'Behind' }, { value: 'ACHIEVED', label: 'Achieved' },
    ]},
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = {
      tenantId: params.tenantId,
      isActive: true,
      periodStart: { lte: params.dateTo },
      periodEnd: { gte: params.dateFrom },
    };
    if (params.userId) where.userId = params.userId;
    if (params.filters?.metric) where.metric = params.filters.metric;

    const targets = await this.prisma.salesTarget.findMany({ where });

    // Fetch user names for targets that have userId
    const userIds = [...new Set(targets.filter(t => t.userId).map(t => t.userId!))];
    const users = userIds.length > 0
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, firstName: true, lastName: true },
        })
      : [];
    const userMap = new Map(users.map(u => [u.id, `${u.firstName} ${u.lastName}`]));

    const now = new Date();
    const totalTargets = targets.length;
    let achievedCount = 0;
    let onTrackCount = 0;
    const achievedPercents: number[] = [];

    const rows = targets.map(t => {
      const targetVal = Number(t.targetValue);
      const currentVal = Number(t.currentValue);
      const achievedPct = Number(t.achievedPercent);
      achievedPercents.push(achievedPct);

      const periodStart = new Date(t.periodStart);
      const periodEnd = new Date(t.periodEnd);
      const totalDays = Math.max(1, (periodEnd.getTime() - periodStart.getTime()) / 86400000);
      const elapsed = Math.max(1, (Math.min(now.getTime(), periodEnd.getTime()) - periodStart.getTime()) / 86400000);
      const projected = Math.round((currentVal / elapsed) * totalDays);

      let status: string;
      if (achievedPct >= 100) { status = 'ACHIEVED'; achievedCount++; onTrackCount++; }
      else if (projected >= targetVal) { status = 'ON_TRACK'; onTrackCount++; }
      else if (projected >= targetVal * 0.7) { status = 'AT_RISK'; }
      else { status = 'BEHIND'; }

      return {
        userName: t.userId ? (userMap.get(t.userId) || 'Unknown') : 'Team',
        metric: t.metric,
        name: t.name || t.metric,
        target: targetVal,
        current: currentVal,
        achievedPercent: achievedPct,
        projected,
        status,
      };
    });

    // Apply status filter if present
    const filteredRows = params.filters?.status
      ? rows.filter(r => r.status === params.filters!.status)
      : rows;

    const avgAchievedPercent = achievedPercents.length > 0
      ? Math.round(achievedPercents.reduce((a, b) => a + b, 0) / achievedPercents.length * 100) / 100
      : 0;

    const summary: ReportMetric[] = [
      { key: 'totalTargets', label: 'Total Targets', value: totalTargets, format: 'number' },
      { key: 'onTrack', label: 'On Track', value: onTrackCount, format: 'number' },
      { key: 'achieved', label: 'Achieved', value: achievedCount, format: 'number' },
      { key: 'avgAchievedPercent', label: 'Avg Achievement', value: avgAchievedPercent, format: 'percent' },
    ];

    // BAR chart: target vs current per user
    const userLabels = filteredRows.map(r => r.userName);
    const targetVsCurrentChart: ChartData = {
      type: 'BAR', title: 'Target vs Current Achievement',
      labels: userLabels,
      datasets: [
        { label: 'Target', data: filteredRows.map(r => r.target), color: '#90CAF9' },
        { label: 'Current', data: filteredRows.map(r => r.current), color: '#4CAF50' },
      ],
    };

    const tableCols: ColumnDef[] = [
      { key: 'userName', header: 'User', width: 20 },
      { key: 'name', header: 'Target Name', width: 18 },
      { key: 'metric', header: 'Metric', width: 14 },
      { key: 'target', header: 'Target', width: 14, format: 'number' },
      { key: 'current', header: 'Current', width: 14, format: 'number' },
      { key: 'achievedPercent', header: 'Achieved %', width: 12, format: 'percent' },
      { key: 'projected', header: 'Projected', width: 14, format: 'number' },
      { key: 'status', header: 'Status', width: 12 },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary,
      charts: [targetVsCurrentChart],
      tables: [{ title: 'Target vs Achievement Details', columns: tableCols, rows: filteredRows }],
    };
  }
}
