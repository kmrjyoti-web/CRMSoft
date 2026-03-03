import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class CampaignReport implements IReport {
  readonly code = 'CAMPAIGN_REPORT';
  readonly name = 'Campaign Report';
  readonly category = 'COMMUNICATION';
  readonly description = 'Analyzes batch quotation sends grouped by date and user as campaigns, with channel breakdown and view rates';
  readonly supportsDrillDown = false;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'userId', label: 'User', type: 'user' },
    { key: 'channel', label: 'Channel', type: 'select', options: [
      { value: 'EMAIL', label: 'Email' }, { value: 'WHATSAPP', label: 'WhatsApp' },
      { value: 'PORTAL', label: 'Portal' }, { value: 'MANUAL', label: 'Manual' },
      { value: 'DOWNLOAD', label: 'Download' },
    ]},
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = {
      tenantId: params.tenantId,
      sentAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.filters?.channel) where.channel = params.filters.channel;

    const sendLogs = await this.prisma.quotationSendLog.findMany({
      where,
      include: {
        quotation: { select: { id: true, totalAmount: true } },
      },
      orderBy: { sentAt: 'desc' },
    });

    // Filter by user if specified
    const filtered = params.userId
      ? sendLogs.filter((l: any) => l.sentById === params.userId)
      : sendLogs;

    // Group by date + user = batch / campaign
    const batchMap = new Map<string, {
      date: string; userId: string; userName: string;
      quotationIds: Set<string>; totalValue: number;
      channels: Set<string>; viewedCount: number; totalCount: number;
    }>();

    filtered.forEach((log: any) => {
      const date = log.sentAt.toISOString().slice(0, 10);
      const uid = log.sentById || 'unknown';
      const uName = log.sentByName || 'Unknown';
      const key = `${date}|${uid}`;

      if (!batchMap.has(key)) {
        batchMap.set(key, {
          date, userId: uid, userName: uName,
          quotationIds: new Set(), totalValue: 0,
          channels: new Set(), viewedCount: 0, totalCount: 0,
        });
      }
      const batch = batchMap.get(key)!;
      if (log.quotation?.id) batch.quotationIds.add(log.quotation.id);
      batch.totalValue += Number(log.quotation?.totalAmount || 0);
      batch.channels.add(log.channel);
      batch.totalCount++;
      if (log.viewedAt) batch.viewedCount++;
    });

    const batches = [...batchMap.values()].map(b => ({
      date: b.date, userName: b.userName,
      quotationCount: b.quotationIds.size, totalValue: b.totalValue,
      channels: [...b.channels].join(', '),
      viewedCount: b.viewedCount, totalSent: b.totalCount,
      viewRate: b.totalCount > 0 ? Math.round((b.viewedCount / b.totalCount) * 10000) / 100 : 0,
    })).sort((a, b) => b.date.localeCompare(a.date));

    const totalBatchSends = batches.length;
    const totalQuotationsSent = filtered.length;
    const avgBatchSize = totalBatchSends > 0
      ? Math.round((totalQuotationsSent / totalBatchSends) * 100) / 100
      : 0;
    const bestBatchViewRate = batches.reduce((max, b) => Math.max(max, b.viewRate), 0);

    // Channel distribution
    const channelCounts = new Map<string, number>();
    filtered.forEach(log => {
      channelCounts.set(log.channel, (channelCounts.get(log.channel) || 0) + 1);
    });
    const channelLabels = [...channelCounts.keys()];

    // Daily batch sends for bar chart
    const dailyBatchMap = new Map<string, number>();
    batches.forEach(b => {
      dailyBatchMap.set(b.date, (dailyBatchMap.get(b.date) || 0) + 1);
    });
    const sortedDays = [...dailyBatchMap.keys()].sort();

    const summary: ReportMetric[] = [
      { key: 'totalBatchSends', label: 'Total Batch Sends', value: totalBatchSends, format: 'number' },
      { key: 'totalQuotationsSent', label: 'Total Quotations Sent', value: totalQuotationsSent, format: 'number' },
      { key: 'avgBatchSize', label: 'Avg Batch Size', value: avgBatchSize, format: 'number' },
      { key: 'bestBatchViewRate', label: 'Best Batch View Rate', value: bestBatchViewRate, format: 'percent' },
    ];

    const charts: ChartData[] = [
      {
        type: 'BAR', title: 'Batch Sends Over Time',
        labels: sortedDays,
        datasets: [{ label: 'Batches', data: sortedDays.map(d => dailyBatchMap.get(d)!), color: '#3F51B5' }],
      },
      {
        type: 'PIE', title: 'Sends by Channel',
        labels: channelLabels,
        datasets: [{ label: 'Count', data: channelLabels.map(c => channelCounts.get(c)!) }],
      },
    ];

    const tableCols: ColumnDef[] = [
      { key: 'date', header: 'Date', width: 12, format: 'date' },
      { key: 'userName', header: 'User', width: 20 },
      { key: 'quotationCount', header: 'Quotations', width: 12, format: 'number' },
      { key: 'totalValue', header: 'Total Value', width: 16, format: 'currency' },
      { key: 'channels', header: 'Channels', width: 18 },
      { key: 'viewedCount', header: 'Viewed', width: 10, format: 'number' },
      { key: 'viewRate', header: 'View Rate', width: 12, format: 'percent' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Batch Send List', columns: tableCols, rows: batches }],
    };
  }
}
