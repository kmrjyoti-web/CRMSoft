import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class PipelineHealthReport implements IReport {
  readonly code = 'PIPELINE_HEALTH';
  readonly name = 'Pipeline Health';
  readonly category = 'EXECUTIVE';
  readonly description = 'Assesses pipeline health by identifying stuck, at-risk, and inactive deals with an overall health score';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = false;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'allocatedToId', label: 'Sales Rep', type: 'user' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const tenantId = params.tenantId;
    const now = new Date();
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 86400000);
    const tenDaysAgo = new Date(now.getTime() - 10 * 86400000);
    const weekFromNow = new Date(now.getTime() + 7 * 86400000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const where: any = {
      tenantId,
      status: { notIn: ['WON', 'LOST'] },
    };
    if (params.userId) where.allocatedToId = params.userId;

    const activeLeads = await this.prisma.lead.findMany({
      where,
      select: {
        id: true, leadNumber: true, status: true, expectedValue: true,
        expectedCloseDate: true, updatedAt: true, createdAt: true,
        contact: { select: { firstName: true, lastName: true } },
        organization: { select: { name: true } },
        allocatedTo: { select: { firstName: true, lastName: true } },
      },
    });

    const totalActive = activeLeads.length;

    // Stuck deals: no status change for 15+ days
    const stuckDeals = activeLeads.filter(l => l.updatedAt < fifteenDaysAgo);

    // At-risk deals: expected close date has passed
    const atRiskDeals = activeLeads.filter(l =>
      l.expectedCloseDate && l.expectedCloseDate < now,
    );

    // Closing this month
    const closingThisMonth = activeLeads.filter(l =>
      l.expectedCloseDate && l.expectedCloseDate >= monthStart && l.expectedCloseDate <= monthEnd,
    );

    // Closing this week
    const closingThisWeek = activeLeads.filter(l =>
      l.expectedCloseDate && l.expectedCloseDate >= now && l.expectedCloseDate <= weekFromNow,
    );

    // No activity deals: check max activity date per lead
    const leadIds = activeLeads.map(l => l.id);
    const recentActivities = leadIds.length > 0
      ? await this.prisma.activity.findMany({
          where: { tenantId, leadId: { in: leadIds } },
          select: { leadId: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    const lastActivityMap = new Map<string, Date>();
    recentActivities.forEach(a => {
      if (a.leadId && !lastActivityMap.has(a.leadId)) {
        lastActivityMap.set(a.leadId, a.createdAt);
      }
    });

    const noActivityDeals = activeLeads.filter(l => {
      const lastAct = lastActivityMap.get(l.id);
      return !lastAct || lastAct < tenDaysAgo;
    });

    // Health score: 100 - penalties
    const stuckPenalty = totalActive > 0 ? (stuckDeals.length / totalActive) * 33 : 0;
    const riskPenalty = totalActive > 0 ? (atRiskDeals.length / totalActive) * 33 : 0;
    const inactivityPenalty = totalActive > 0 ? (noActivityDeals.length / totalActive) * 33 : 0;
    const healthScore = Math.max(0, Math.round(100 - stuckPenalty - riskPenalty - inactivityPenalty));

    const summary: ReportMetric[] = [
      { key: 'healthScore', label: 'Health Score', value: healthScore, format: 'number' },
      { key: 'stuckDeals', label: 'Stuck Deals', value: stuckDeals.length, format: 'number' },
      { key: 'atRiskDeals', label: 'At-Risk Deals', value: atRiskDeals.length, format: 'number' },
      { key: 'closingThisMonth', label: 'Closing This Month', value: closingThisMonth.length, format: 'number' },
      { key: 'noActivityDeals', label: 'No Activity (10+ days)', value: noActivityDeals.length, format: 'number' },
    ];

    const charts: ChartData[] = [
      {
        type: 'BAR', title: 'Pipeline Health Indicators',
        labels: ['Stuck', 'At Risk', 'No Activity', 'Closing This Week', 'Closing This Month'],
        datasets: [{
          label: 'Deals',
          data: [stuckDeals.length, atRiskDeals.length, noActivityDeals.length,
            closingThisWeek.length, closingThisMonth.length],
          color: '#F44336',
        }],
      },
    ];

    const dealCols: ColumnDef[] = [
      { key: 'leadNumber', header: 'Lead #', width: 16 },
      { key: 'contact', header: 'Contact', width: 20 },
      { key: 'organization', header: 'Organization', width: 22 },
      { key: 'status', header: 'Status', width: 14 },
      { key: 'expectedValue', header: 'Value', width: 16, format: 'currency' },
      { key: 'allocatedTo', header: 'Owner', width: 18 },
      { key: 'daysSinceUpdate', header: 'Days Since Update', width: 18, format: 'number' },
    ];

    const mapDeals = (deals: typeof activeLeads) => deals.map(l => ({
      leadNumber: l.leadNumber,
      contact: l.contact ? `${l.contact.firstName} ${l.contact.lastName}` : '',
      organization: l.organization?.name || '',
      status: l.status,
      expectedValue: Number(l.expectedValue || 0),
      allocatedTo: l.allocatedTo ? `${l.allocatedTo.firstName} ${l.allocatedTo.lastName}` : 'Unassigned',
      daysSinceUpdate: Math.floor((now.getTime() - l.updatedAt.getTime()) / 86400000),
    }));

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [
        { title: 'Stuck Deals (15+ days no update)', columns: dealCols, rows: mapDeals(stuckDeals) },
        { title: 'At-Risk Deals (past close date)', columns: dealCols, rows: mapDeals(atRiskDeals) },
      ],
      metadata: { healthScore, totalActive, closingThisWeek: closingThisWeek.length },
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const tenantId = params.filters?.tenantId;
    const now = new Date();

    let where: any = { tenantId, status: { notIn: ['WON', 'LOST'] } };

    if (params.dimension === 'stuck') {
      where.updatedAt = { lt: new Date(now.getTime() - 15 * 86400000) };
    } else if (params.dimension === 'atRisk') {
      where.expectedCloseDate = { lt: now };
    } else if (params.dimension === 'noActivity') {
      // Fetch leads with no activity in 10+ days
      const allActive = await this.prisma.lead.findMany({
        where, select: { id: true },
      });
      const leadIds = allActive.map(l => l.id);
      const activities = await this.prisma.activity.findMany({
        where: { tenantId, leadId: { in: leadIds }, createdAt: { gte: new Date(now.getTime() - 10 * 86400000) } },
        select: { leadId: true },
      });
      const activeLeadIds = new Set(activities.map(a => a.leadId));
      const inactiveIds = leadIds.filter(id => !activeLeadIds.has(id));
      where = { id: { in: inactiveIds }, tenantId };
    }

    const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
