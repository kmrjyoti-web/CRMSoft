import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

const CHANNEL_MAP: Record<string, string> = {
  CALL: 'Phone',
  EMAIL: 'Email',
  WHATSAPP: 'WhatsApp',
  MEETING: 'Meeting',
  VISIT: 'Field Visit',
};

const ACTIVITY_TYPES = Object.keys(CHANNEL_MAP);

@Injectable()
export class ChannelEffectivenessReport implements IReport {
  readonly code = 'CHANNEL_EFFECTIVENESS';
  readonly name = 'Channel Effectiveness';
  readonly category = 'COMMUNICATION';
  readonly description = 'Compares communication channels by activity volume, lead conversion rates, and revenue attribution';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'userId', label: 'User', type: 'user' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const actWhere: any = {
      tenantId: params.tenantId,
      type: { in: ACTIVITY_TYPES },
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.userId) actWhere.createdById = params.userId;

    const activities = await this.prisma.activity.findMany({
      where: actWhere,
      select: { id: true, type: true, leadId: true },
    });

    // Gather unique lead IDs per activity type
    const channelData = new Map<string, { count: number; leadIds: Set<string> }>();
    ACTIVITY_TYPES.forEach(t => channelData.set(t, { count: 0, leadIds: new Set() }));

    activities.forEach(a => {
      const entry = channelData.get(a.type)!;
      entry.count++;
      if (a.leadId) entry.leadIds.add(a.leadId);
    });

    // Fetch WON leads in period to determine conversion per channel
    const wonLeads = await this.prisma.lead.findMany({
      where: {
        tenantId: params.tenantId,
        status: 'WON',
        updatedAt: { gte: params.dateFrom, lte: params.dateTo },
      },
      select: { id: true, expectedValue: true },
    });
    const wonLeadIds = new Set(wonLeads.map(l => l.id));
    const wonValueMap = new Map(wonLeads.map(l => [l.id, Number(l.expectedValue || 0)]));

    // Build per-channel metrics
    const channelRows = ACTIVITY_TYPES.map(type => {
      const channel = CHANNEL_MAP[type];
      const data = channelData.get(type)!;
      const leadsConverted = [...data.leadIds].filter(id => wonLeadIds.has(id)).length;
      const revenue = [...data.leadIds]
        .filter(id => wonLeadIds.has(id))
        .reduce((sum, id) => sum + (wonValueMap.get(id) || 0), 0);
      const conversionRate = data.leadIds.size > 0
        ? Math.round((leadsConverted / data.leadIds.size) * 10000) / 100
        : 0;

      return {
        activityType: type, channel, activities: data.count,
        uniqueLeads: data.leadIds.size, leadsConverted, conversionRate, revenue,
      };
    }).filter(r => r.activities > 0);

    channelRows.sort((a, b) => b.conversionRate - a.conversionRate);

    const bestChannel = channelRows[0]?.channel || 'N/A';
    const mostUsed = [...channelRows].sort((a, b) => b.activities - a.activities)[0]?.channel || 'N/A';
    const highestRevenue = [...channelRows].sort((a, b) => b.revenue - a.revenue)[0]?.channel || 'N/A';

    const summary: ReportMetric[] = [
      { key: 'bestChannel', label: 'Best Channel (Conv Rate)', value: channelRows[0]?.conversionRate || 0, format: 'percent' },
      { key: 'mostUsedCount', label: 'Most Used Channel Count', value: channelRows.reduce((max, r) => Math.max(max, r.activities), 0), format: 'number' },
      { key: 'highestRevenue', label: 'Highest Revenue Channel', value: channelRows.reduce((max, r) => Math.max(max, r.revenue), 0), format: 'currency' },
      { key: 'totalActivities', label: 'Total Activities', value: activities.length, format: 'number' },
    ];

    const charts: ChartData[] = [
      {
        type: 'BAR', title: 'Conversion Rate by Channel',
        labels: channelRows.map(r => r.channel),
        datasets: [{ label: 'Conversion Rate %', data: channelRows.map(r => r.conversionRate), color: '#4CAF50' }],
      },
      {
        type: 'BAR', title: 'Revenue by Channel',
        labels: channelRows.map(r => r.channel),
        datasets: [{ label: 'Revenue', data: channelRows.map(r => r.revenue), color: '#FF9800' }],
      },
    ];

    const tableCols: ColumnDef[] = [
      { key: 'channel', header: 'Channel', width: 16 },
      { key: 'activities', header: 'Activities', width: 12, format: 'number' },
      { key: 'uniqueLeads', header: 'Leads Touched', width: 14, format: 'number' },
      { key: 'leadsConverted', header: 'Leads Converted', width: 16, format: 'number' },
      { key: 'conversionRate', header: 'Conversion Rate', width: 16, format: 'percent' },
      { key: 'revenue', header: 'Revenue', width: 16, format: 'currency' },
    ];

    const insight = `Best converting channel is ${bestChannel}. Most used channel is ${mostUsed}. Highest revenue channel is ${highestRevenue}.`;

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Channel Breakdown', columns: tableCols, rows: channelRows }],
      metadata: { insight, bestChannel, mostUsedChannel: mostUsed, highestRevenueChannel: highestRevenue },
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    // Map channel name back to activity type
    const reverseMap: Record<string, string> = {};
    Object.entries(CHANNEL_MAP).forEach(([k, v]) => { reverseMap[v] = k; });
    const actType = reverseMap[params.value] || params.value;

    // Find leads touched by this activity type
    const activities = await this.prisma.activity.findMany({
      where: {
        tenantId: params.filters?.tenantId,
        type: actType as any,
        createdAt: { gte: params.dateFrom, lte: params.dateTo },
      },
      select: { leadId: true },
    });

    const leadIds = [...new Set(activities.filter(a => a.leadId).map(a => a.leadId!))];
    const where = { id: { in: leadIds }, tenantId: params.filters?.tenantId };
    const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
