import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class CeoDashboardReport implements IReport {
  readonly code = 'CEO_DASHBOARD';
  readonly name = 'CEO Dashboard';
  readonly category = 'EXECUTIVE';
  readonly description = 'High-level executive dashboard with 10 KPI cards, 7-day trends, top deals, and quick alerts';
  readonly supportsDrillDown = false;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const tenantId = params.tenantId;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000 - 1);

    // Revenue: sum of WON leads in period
    const wonLeads = await this.prisma.lead.findMany({
      where: { tenantId, status: 'WON', updatedAt: { gte: params.dateFrom, lte: params.dateTo } },
      select: { id: true, expectedValue: true, updatedAt: true },
    });
    const revenue = wonLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0);

    // Pipeline value: active leads (not WON/LOST)
    const activeLeads = await this.prisma.lead.findMany({
      where: { tenantId, status: { notIn: ['WON', 'LOST'] } },
      select: { id: true, expectedValue: true, expectedCloseDate: true, leadNumber: true,
        contact: { select: { firstName: true, lastName: true } },
        organization: { select: { name: true } },
      },
      orderBy: { expectedValue: 'desc' },
    });
    const pipelineValue = activeLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0);

    // Leads counts
    const leadsWon = wonLeads.length;
    const totalLeadsInPeriod = await this.prisma.lead.count({
      where: { tenantId, createdAt: { gte: params.dateFrom, lte: params.dateTo } },
    });
    const allLeadsInPeriod = await this.prisma.lead.count({
      where: { tenantId, updatedAt: { gte: params.dateFrom, lte: params.dateTo } },
    });
    const conversionRate = allLeadsInPeriod > 0
      ? Math.round((leadsWon / allLeadsInPeriod) * 10000) / 100
      : 0;

    // Quotations sent
    const quotationsSent = await this.prisma.quotation.count({
      where: { tenantId, createdAt: { gte: params.dateFrom, lte: params.dateTo } },
    });

    const activeDeals = activeLeads.length;
    const avgDealSize = activeDeals > 0
      ? Math.round(pipelineValue / activeDeals)
      : 0;

    // Team score: avg achievedPercent from active sales targets
    const targets = await this.prisma.salesTarget.findMany({
      where: { tenantId, isActive: true },
      select: { achievedPercent: true },
    });
    const teamScore = targets.length > 0
      ? Math.round(targets.reduce((s, t) => s + Number(t.achievedPercent), 0) / targets.length * 100) / 100
      : 0;

    // Activities today
    const activitiesToday = await this.prisma.activity.count({
      where: { tenantId, createdAt: { gte: todayStart, lte: todayEnd } },
    });

    // Quick alerts
    const expiringQuotations = await this.prisma.quotation.count({
      where: { tenantId, status: { notIn: ['ACCEPTED', 'REJECTED', 'CANCELLED'] },
        validUntil: { gte: todayStart, lte: new Date(todayStart.getTime() + 3 * 86400000) } },
    });
    const belowTargetMembers = targets.filter(t => Number(t.achievedPercent) < 50).length;

    // Last 7 days trends
    const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 86400000);
    const revenueByDay = new Map<string, number>();
    const leadsByDay = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo.getTime() + i * 86400000);
      revenueByDay.set(d.toISOString().slice(0, 10), 0);
      leadsByDay.set(d.toISOString().slice(0, 10), 0);
    }

    const recentWon = wonLeads.filter(l => l.updatedAt >= sevenDaysAgo);
    recentWon.forEach(l => {
      const day = l.updatedAt.toISOString().slice(0, 10);
      if (revenueByDay.has(day)) revenueByDay.set(day, revenueByDay.get(day)! + Number(l.expectedValue || 0));
    });

    const recentLeads = await this.prisma.lead.findMany({
      where: { tenantId, createdAt: { gte: sevenDaysAgo, lte: todayEnd } },
      select: { createdAt: true },
    });
    recentLeads.forEach(l => {
      const day = l.createdAt.toISOString().slice(0, 10);
      if (leadsByDay.has(day)) leadsByDay.set(day, leadsByDay.get(day)! + 1);
    });

    const trendDays = [...revenueByDay.keys()].sort();

    const summary: ReportMetric[] = [
      { key: 'revenue', label: 'Revenue', value: revenue, format: 'currency' },
      { key: 'pipelineValue', label: 'Pipeline Value', value: pipelineValue, format: 'currency' },
      { key: 'leadsWon', label: 'Leads Won', value: leadsWon, format: 'number' },
      { key: 'conversionRate', label: 'Conversion Rate', value: conversionRate, format: 'percent' },
      { key: 'newLeads', label: 'New Leads', value: totalLeadsInPeriod, format: 'number' },
      { key: 'quotationsSent', label: 'Quotations Sent', value: quotationsSent, format: 'number' },
      { key: 'activeDeals', label: 'Active Deals', value: activeDeals, format: 'number' },
      { key: 'avgDealSize', label: 'Avg Deal Size', value: avgDealSize, format: 'currency' },
      { key: 'teamScore', label: 'Team Score', value: teamScore, format: 'percent' },
      { key: 'activitiesToday', label: 'Activities Today', value: activitiesToday, format: 'number' },
    ];

    const charts: ChartData[] = [
      {
        type: 'LINE', title: 'Revenue Trend (7 Days)',
        labels: trendDays,
        datasets: [{ label: 'Revenue', data: trendDays.map(d => revenueByDay.get(d)!), color: '#4CAF50' }],
      },
      {
        type: 'LINE', title: 'New Leads Trend (7 Days)',
        labels: trendDays,
        datasets: [{ label: 'New Leads', data: trendDays.map(d => leadsByDay.get(d)!), color: '#2196F3' }],
      },
    ];

    // Top 5 deals by expected value
    const topDeals = activeLeads.slice(0, 5).map(l => ({
      leadNumber: l.leadNumber,
      contact: l.contact ? `${l.contact.firstName} ${l.contact.lastName}` : '',
      organization: l.organization?.name || '',
      expectedValue: Number(l.expectedValue || 0),
      expectedCloseDate: l.expectedCloseDate,
    }));
    const dealCols: ColumnDef[] = [
      { key: 'leadNumber', header: 'Lead #', width: 16 },
      { key: 'contact', header: 'Contact', width: 20 },
      { key: 'organization', header: 'Organization', width: 22 },
      { key: 'expectedValue', header: 'Value', width: 16, format: 'currency' },
      { key: 'expectedCloseDate', header: 'Expected Close', width: 15, format: 'date' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Top 5 Deals', columns: dealCols, rows: topDeals }],
      metadata: {
        alerts: {
          expiringQuotations,
          belowTargetMembers,
          leadsWonToday: recentWon.filter(l => l.updatedAt >= todayStart).length,
        },
      },
    };
  }
}
