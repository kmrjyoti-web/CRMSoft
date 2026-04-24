import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
} from '../../interfaces/report.interface';

@Injectable()
export class NewJoinerRampUpReport implements IReport {
  readonly code = 'NEW_JOINER_RAMP_UP';
  readonly name = 'New Joiner Ramp-Up';
  readonly category = 'TEAM';
  readonly description = 'Tracks new joiners week-by-week ramp-up in activities, deals, and revenue compared to team averages';
  readonly supportsDrillDown = false;
  readonly supportsPeriodComparison = false;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'months', label: 'Joining Lookback (months)', type: 'text' },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const tenantId = params.tenantId;
    const months = Number(params.filters?.months) || 6;
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    // New joiners: ACTIVE EMPLOYEE with joiningDate within lookback
    const newJoiners = await this.prisma.user.findMany({
      where: { tenantId, status: 'ACTIVE', userType: 'EMPLOYEE', joiningDate: { gte: cutoffDate } },
      select: { id: true, firstName: true, lastName: true, joiningDate: true },
    });

    // All employees for team average comparison
    const allEmployees = await this.prisma.user.findMany({
      where: { tenantId, status: 'ACTIVE', userType: 'EMPLOYEE' },
      select: { id: true },
    });
    const allIds = allEmployees.map(u => u.id);
    const joinerIds = newJoiners.map(u => u.id);
    const combinedIds = Array.from(new Set([...allIds, ...joinerIds]));

    const [activities, wonLeads] = await Promise.all([
      this.prisma.working.activity.findMany({
        where: { tenantId, createdById: { in: combinedIds }, createdAt: { gte: cutoffDate } },
        select: { createdById: true, createdAt: true },
      }),
      this.prisma.working.lead.findMany({
        where: { tenantId, allocatedToId: { in: combinedIds }, status: 'WON', updatedAt: { gte: cutoffDate } },
        select: { allocatedToId: true, expectedValue: true, updatedAt: true },
      }),
    ]);

    // Helper: get week number from a date relative to a start date
    const getWeek = (from: Date, date: Date): number =>
      Math.floor((date.getTime() - from.getTime()) / (7 * 86400000)) + 1;

    // Team average weekly activities (non-joiners)
    const nonJoinerIds = allIds.filter(id => !joinerIds.includes(id));
    const teamWeeklyActivities = new Map<number, number[]>();
    const teamRefDate = cutoffDate;
    activities.filter(a => nonJoinerIds.includes(a.createdById)).forEach(a => {
      const w = getWeek(teamRefDate, a.createdAt);
      if (w > 0 && w <= months * 4) {
        if (!teamWeeklyActivities.has(w)) teamWeeklyActivities.set(w, []);
        teamWeeklyActivities.get(w)!.push(1);
      }
    });
    const weeklyValues = Array.from(teamWeeklyActivities.values());
    const teamAvgWeeklyAct = weeklyValues.length > 0
      ? Math.round(weeklyValues.reduce((s, arr) => s + arr.length, 0) / weeklyValues.length / Math.max(1, nonJoinerIds.length) * 100) / 100
      : 0;

    // Per joiner: weekly breakdown + time to first deal
    const joinerStats = newJoiners.map(u => {
      const joinDate = u.joiningDate!;
      const weekCount = Math.min(26, Math.ceil((Date.now() - joinDate.getTime()) / (7 * 86400000)));

      const uActivities = activities.filter(a => a.createdById === u.id);
      const uWonLeads = wonLeads.filter(l => l.allocatedToId === u.id);

      // Weekly breakdown
      const weeklyData: Array<{ week: number; activities: number; leadsWon: number; revenue: number }> = [];
      for (let w = 1; w <= weekCount; w++) {
        const weekStart = new Date(joinDate.getTime() + (w - 1) * 7 * 86400000);
        const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
        const wActs = uActivities.filter(a => a.createdAt >= weekStart && a.createdAt < weekEnd).length;
        const wWon = uWonLeads.filter(l => l.updatedAt >= weekStart && l.updatedAt < weekEnd);
        const wRevenue = Math.round(wWon.reduce((s, l) => s + Number(l.expectedValue || 0), 0));
        weeklyData.push({ week: w, activities: wActs, leadsWon: wWon.length, revenue: wRevenue });
      }

      // Time to first deal
      const firstDeal = uWonLeads.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime())[0];
      const timeToFirstDealDays = firstDeal
        ? Math.round((firstDeal.updatedAt.getTime() - joinDate.getTime()) / 86400000)
        : null;

      const totalActivities = uActivities.length;
      const avgWeeklyAct = weekCount > 0 ? Math.round((totalActivities / weekCount) * 100) / 100 : 0;

      return {
        userId: u.id, userName: `${u.firstName} ${u.lastName}`,
        joiningDate: joinDate, weekCount, timeToFirstDealDays,
        totalActivities, avgWeeklyActivities: avgWeeklyAct,
        totalDealsWon: uWonLeads.length,
        totalRevenue: Math.round(uWonLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0)),
        weeklyData, teamAvgWeeklyActivities: teamAvgWeeklyAct,
      };
    });

    joinerStats.sort((a, b) => (a.timeToFirstDealDays ?? 999) - (b.timeToFirstDealDays ?? 999));

    const withDeals = joinerStats.filter(j => j.timeToFirstDealDays !== null);
    const avgTimeToFirstDeal = withDeals.length > 0
      ? Math.round(withDeals.reduce((s, j) => s + j.timeToFirstDealDays!, 0) / withDeals.length)
      : 0;
    const fastestRampUp = withDeals[0];
    const avgWeeklyAll = joinerStats.length > 0
      ? Math.round(joinerStats.reduce((s, j) => s + j.avgWeeklyActivities, 0) / joinerStats.length * 100) / 100
      : 0;

    const summary: ReportMetric[] = [
      { key: 'totalNewJoiners', label: 'New Joiners', value: joinerStats.length, format: 'number' },
      { key: 'avgTimeToFirstDeal', label: 'Avg Time to First Deal', value: avgTimeToFirstDeal, format: 'days' },
      { key: 'fastestRampUpDays', label: 'Fastest Ramp-Up (days)', value: fastestRampUp?.timeToFirstDealDays || 0, format: 'days' },
      { key: 'avgWeeklyActivities', label: 'Avg Weekly Activities', value: avgWeeklyAll, format: 'number' },
    ];

    // LINE chart: weekly activities trend per joiner (top 5)
    const topJoiners = joinerStats.slice(0, 5);
    const maxWeeks = Math.max(1, ...topJoiners.map(j => j.weekCount));
    const weekLabels = Array.from({ length: Math.min(maxWeeks, 12) }, (_, i) => `W${i + 1}`);

    const lineChart: ChartData = {
      type: 'LINE', title: 'Weekly Activities Trend',
      labels: weekLabels,
      datasets: topJoiners.map((j, idx) => ({
        label: j.userName,
        data: weekLabels.map((_, i) => j.weeklyData[i]?.activities || 0),
        color: ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336'][idx],
      })),
    };

    // BAR chart: time to first deal per joiner
    const dealJoiners = joinerStats.filter(j => j.timeToFirstDealDays !== null);
    const barChart: ChartData = {
      type: 'BAR', title: 'Time to First Deal (days)',
      labels: dealJoiners.map(j => j.userName),
      datasets: [{ label: 'Days', data: dealJoiners.map(j => j.timeToFirstDealDays!), color: '#009688' }],
    };

    const columns: ColumnDef[] = [
      { key: 'userName', header: 'Employee', width: 20 },
      { key: 'joiningDate', header: 'Joined', width: 12, format: 'date' },
      { key: 'weekCount', header: 'Weeks', width: 8, format: 'number' },
      { key: 'totalActivities', header: 'Activities', width: 10, format: 'number' },
      { key: 'avgWeeklyActivities', header: 'Avg/Week', width: 10, format: 'number' },
      { key: 'teamAvgWeeklyActivities', header: 'Team Avg/Week', width: 12, format: 'number' },
      { key: 'totalDealsWon', header: 'Deals Won', width: 10, format: 'number' },
      { key: 'totalRevenue', header: 'Revenue', width: 12, format: 'currency' },
      { key: 'timeToFirstDealDays', header: '1st Deal (days)', width: 13, format: 'number' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary,
      charts: [lineChart, barChart],
      tables: [{ title: 'New Joiner Ramp-Up', columns, rows: joinerStats }],
      metadata: {
        lookbackMonths: months,
        fastestRampUp: fastestRampUp ? `${fastestRampUp.userName} (${fastestRampUp.timeToFirstDealDays} days)` : 'N/A',
      },
    };
  }
}
