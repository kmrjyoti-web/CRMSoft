import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

const BUCKETS = [
  { key: '0-2', min: 0, max: 2 },
  { key: '3-5', min: 3, max: 5 },
  { key: '6-10', min: 6, max: 10 },
  { key: '10+', min: 11, max: Infinity },
] as const;

@Injectable()
export class ActivityVsOutcomeReport implements IReport {
  readonly code = 'ACTIVITY_VS_OUTCOME';
  readonly name = 'Activity vs Outcome';
  readonly category = 'ACTIVITY';
  readonly description = 'Correlates activity volume per lead with lead outcomes to identify optimal engagement levels';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'allocatedToId', label: 'Sales Rep', type: 'user' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = {
      tenantId: params.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.userId) where.allocatedToId = params.userId;

    const leads = await this.prisma.working.lead.findMany({
      where,
      select: {
        id: true, status: true,
        _count: { select: { activities: true } },
      },
    });

    // Categorize leads
    const wonLeads = leads.filter(l => l.status === 'WON');
    const lostLeads = leads.filter(l => l.status === 'LOST');
    const activeLeads = leads.filter(l => l.status !== 'WON' && l.status !== 'LOST');

    const avgActivities = (arr: typeof leads) =>
      arr.length > 0
        ? Math.round((arr.reduce((s, l) => s + l._count.activities, 0) / arr.length) * 100) / 100
        : 0;

    const avgActivitiesWon = avgActivities(wonLeads);
    const avgActivitiesLost = avgActivities(lostLeads);
    const avgActivitiesActive = avgActivities(activeLeads);

    const correlationInsight = avgActivitiesWon > avgActivitiesLost
      ? 'Higher activity count correlates with wins'
      : avgActivitiesWon < avgActivitiesLost
        ? 'Activity count alone does not drive wins'
        : 'No clear correlation between activity count and outcome';

    // Find activity threshold for >50% win rate
    let activityThreshold = 0;
    for (let threshold = 1; threshold <= 20; threshold++) {
      const aboveThreshold = leads.filter(l => l._count.activities >= threshold);
      const winsAbove = aboveThreshold.filter(l => l.status === 'WON').length;
      if (aboveThreshold.length > 0 && (winsAbove / aboveThreshold.length) > 0.5) {
        activityThreshold = threshold;
        break;
      }
    }

    // Bucket analysis
    const bucketStats = BUCKETS.map(bucket => {
      const inBucket = leads.filter(l =>
        l._count.activities >= bucket.min && l._count.activities <= bucket.max,
      );
      const wonCount = inBucket.filter(l => l.status === 'WON').length;
      const lostCount = inBucket.filter(l => l.status === 'LOST').length;
      const winRate = (wonCount + lostCount) > 0
        ? Math.round((wonCount / (wonCount + lostCount)) * 10000) / 100
        : 0;
      return {
        bucket: bucket.key,
        totalLeads: inBucket.length,
        wonCount,
        lostCount,
        activeCount: inBucket.length - wonCount - lostCount,
        winRate,
      };
    });

    const summary: ReportMetric[] = [
      { key: 'avgActivitiesWon', label: 'Avg Activities (Won)', value: avgActivitiesWon, format: 'number' },
      { key: 'avgActivitiesLost', label: 'Avg Activities (Lost)', value: avgActivitiesLost, format: 'number' },
      { key: 'correlationInsight', label: 'Total Leads Analyzed', value: leads.length, format: 'number' },
      { key: 'activityThreshold', label: 'Activity Threshold (>50% Win)', value: activityThreshold, format: 'number' },
    ];

    const charts: ChartData[] = [
      {
        type: 'BAR', title: 'Average Activities by Lead Outcome',
        labels: ['Won', 'Lost', 'Active'],
        datasets: [{
          label: 'Avg Activities',
          data: [avgActivitiesWon, avgActivitiesLost, avgActivitiesActive],
          color: '#009688',
        }],
      },
    ];

    const tableColumns: ColumnDef[] = [
      { key: 'bucket', header: 'Activity Bucket', width: 16 },
      { key: 'totalLeads', header: 'Total Leads', width: 12, format: 'number' },
      { key: 'wonCount', header: 'Won', width: 10, format: 'number' },
      { key: 'lostCount', header: 'Lost', width: 10, format: 'number' },
      { key: 'activeCount', header: 'Active', width: 10, format: 'number' },
      { key: 'winRate', header: 'Win Rate', width: 12, format: 'percent' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Activity Bucket Analysis', columns: tableColumns, rows: bucketStats }],
      metadata: { correlationInsight, activityThreshold },
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const bucket = BUCKETS.find(b => b.key === params.value);
    if (!bucket) {
      return {
        dimension: params.dimension, value: params.value,
        columns: [], rows: [], total: 0, page: params.page, limit: params.limit,
      };
    }

    // Get leads in the activity bucket
    const leads = await this.prisma.working.lead.findMany({
      where: {
        tenantId: params.filters?.tenantId,
        createdAt: { gte: params.dateFrom, lte: params.dateTo },
      },
      select: {
        id: true, _count: { select: { activities: true } },
      },
    });

    const leadIds = leads
      .filter(l => l._count.activities >= bucket.min && l._count.activities <= bucket.max)
      .map(l => l.id);

    const where: any = {
      tenantId: params.filters?.tenantId,
      id: { in: leadIds },
    };

    const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
