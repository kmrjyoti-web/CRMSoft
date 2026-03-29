// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class WhatsAppPerformanceReport implements IReport {
  readonly code = 'WHATSAPP_PERFORMANCE';
  readonly name = 'WhatsApp Performance';
  readonly category = 'COMMUNICATION';
  readonly description = 'Measures WhatsApp activity volume, quotation sends via WhatsApp, and per-user engagement metrics';
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
    const where: any = {
      tenantId: params.tenantId,
      type: 'WHATSAPP',
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.userId) where.createdById = params.userId;

    const waActivities = await this.prisma.working.activity.findMany({
      where,
      select: {
        id: true, createdAt: true, leadId: true,
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Quotation sends via WhatsApp
    const waSendLogs = await this.prisma.working.quotationSendLog.findMany({
      where: {
        tenantId: params.tenantId,
        channel: 'WHATSAPP',
        sentAt: { gte: params.dateFrom, lte: params.dateTo },
      },
      select: {
        id: true, sentAt: true,
        quotation: { select: { createdById: true } },
      },
    });

    const totalWhatsAppActivities = waActivities.length;
    const dayCount = Math.max(1, Math.ceil(
      (params.dateTo.getTime() - params.dateFrom.getTime()) / 86400000,
    ));
    const avgPerDay = Math.round((totalWhatsAppActivities / dayCount) * 100) / 100;

    // Per-user aggregation
    const userMap = new Map<string, {
      name: string; activities: number; leadIds: Set<string>; quotationsSentViaWA: number;
    }>();

    waActivities.forEach(a => {
      const uid = a.createdByUser.id;
      const uName = `${a.createdByUser.firstName} ${a.createdByUser.lastName}`;
      if (!userMap.has(uid)) {
        userMap.set(uid, { name: uName, activities: 0, leadIds: new Set(), quotationsSentViaWA: 0 });
      }
      const entry = userMap.get(uid)!;
      entry.activities++;
      if (a.leadId) entry.leadIds.add(a.leadId);
    });

    waSendLogs.forEach(log => {
      const uid = log.quotation?.createdById;
      if (uid && userMap.has(uid)) {
        userMap.get(uid)!.quotationsSentViaWA++;
      }
    });

    const userStats = [...userMap.entries()].map(([userId, d]) => ({
      userId, name: d.name, whatsappActivities: d.activities,
      leadsContacted: d.leadIds.size, quotationsSentViaWA: d.quotationsSentViaWA,
    })).sort((a, b) => b.whatsappActivities - a.whatsappActivities);

    const topUser = userStats[0]?.name || 'N/A';

    // Lead touch rate
    const allLeadIds = new Set<string>();
    waActivities.forEach(a => { if (a.leadId) allLeadIds.add(a.leadId); });
    const totalLeads = await this.prisma.working.lead.count({
      where: { tenantId: params.tenantId, createdAt: { lte: params.dateTo } },
    });
    const leadTouchRate = totalLeads > 0
      ? Math.round((allLeadIds.size / totalLeads) * 10000) / 100
      : 0;

    // Daily trend
    const dailyMap = new Map<string, number>();
    waActivities.forEach(a => {
      const day = a.createdAt.toISOString().slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
    });
    const sortedDays = [...dailyMap.keys()].sort();

    const summary: ReportMetric[] = [
      { key: 'totalWhatsAppActivities', label: 'Total WhatsApp Activities', value: totalWhatsAppActivities, format: 'number' },
      { key: 'avgPerDay', label: 'Avg per Day', value: avgPerDay, format: 'number' },
      { key: 'topUserCount', label: 'Top User Count', value: userStats[0]?.whatsappActivities || 0, format: 'number' },
      { key: 'leadTouchRate', label: 'Lead Touch Rate', value: leadTouchRate, format: 'percent' },
    ];

    const charts: ChartData[] = [
      {
        type: 'BAR', title: 'WhatsApp Activity by User',
        labels: userStats.map(u => u.name),
        datasets: [{ label: 'Activities', data: userStats.map(u => u.whatsappActivities), color: '#25D366' }],
      },
      {
        type: 'LINE', title: 'Daily WhatsApp Trend',
        labels: sortedDays,
        datasets: [{ label: 'Activities', data: sortedDays.map(d => dailyMap.get(d)!), color: '#128C7E' }],
      },
    ];

    const tableCols: ColumnDef[] = [
      { key: 'name', header: 'User', width: 22 },
      { key: 'whatsappActivities', header: 'WA Activities', width: 14, format: 'number' },
      { key: 'leadsContacted', header: 'Leads Contacted', width: 16, format: 'number' },
      { key: 'quotationsSentViaWA', header: 'Quotations via WA', width: 18, format: 'number' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Per User WhatsApp Metrics', columns: tableCols, rows: userStats }],
      metadata: { topUser },
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      type: 'WHATSAPP',
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.dimension === 'user') where.createdById = params.value;
    const result = await this.drillDownSvc.getActivities(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
