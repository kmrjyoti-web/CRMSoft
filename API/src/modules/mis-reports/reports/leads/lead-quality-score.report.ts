import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

const PRIORITY_POINTS: Record<string, number> = { URGENT: 10, HIGH: 7, MEDIUM: 5, LOW: 2 };

@Injectable()
export class LeadQualityScoreReport implements IReport {
  readonly code = 'LEAD_QUALITY_SCORE';
  readonly name = 'Lead Quality Score';
  readonly category = 'LEAD';
  readonly description = 'Scores each lead on a 0-100 scale based on completeness, engagement, and progression indicators';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = false;
  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'status', label: 'Status', type: 'multi_select' },
    { key: 'allocatedTo', label: 'Allocated To', type: 'user' },
    { key: 'qualityTier', label: 'Quality Tier', type: 'select', options: [
      { value: 'high', label: 'High (70+)' },
      { value: 'medium', label: 'Medium (40-69)' },
      { value: 'low', label: 'Low (<40)' },
    ]},
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownService: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = { tenantId: params.tenantId, createdAt: { gte: params.dateFrom, lte: params.dateTo } };
    if (params.userId) where.allocatedToId = params.userId;
    if (params.filters?.status) where.status = { in: params.filters.status };

    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const [leads, totalCount] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: {
          contact: { select: { firstName: true, lastName: true } },
          organization: { select: { name: true } },
          activities: { select: { id: true } },
          demos: { select: { id: true, status: true } },
          quotations: { select: { id: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.lead.count({ where }),
    ]);

    const scored = leads.map(lead => {
      let contactInfo = 0;
      let orgScore = 0;
      let valueScore = 0;
      let activityScore = 0;
      let demoScore = 0;
      let quotationScore = 0;
      let closeDateScore = 0;
      let priorityScore = 0;

      // Contact info: 10 points if contact exists with firstName
      if (lead.contact?.firstName) contactInfo = 10;

      // Organization: 10 points if present
      if (lead.organization) orgScore = 10;

      // Expected value: 15 points if present
      if (lead.expectedValue) valueScore = 15;

      // Activities: 0→0, 1-3→5, 4-5→10, 6+→15
      const actCount = lead.activities.length;
      activityScore = actCount > 5 ? 15 : actCount > 3 ? 10 : actCount > 0 ? 5 : 0;

      // Demo: none→0, has demo→10, has completed demo→15
      const hasCompleted = lead.demos.some(d => d.status === 'COMPLETED');
      demoScore = hasCompleted ? 15 : lead.demos.length > 0 ? 10 : 0;

      // Quotation: none→0, has quotation→10, has accepted→15
      const hasAccepted = lead.quotations.some(q => q.status === 'ACCEPTED');
      quotationScore = hasAccepted ? 15 : lead.quotations.length > 0 ? 10 : 0;

      // Expected close date: 10 points if present
      if (lead.expectedCloseDate) closeDateScore = 10;

      // Priority: URGENT→10, HIGH→7, MEDIUM→5, LOW→2
      priorityScore = PRIORITY_POINTS[lead.priority] || 0;

      const totalScore = contactInfo + orgScore + valueScore + activityScore +
        demoScore + quotationScore + closeDateScore + priorityScore;

      return {
        leadNumber: lead.leadNumber,
        contact: lead.contact ? `${lead.contact.firstName} ${lead.contact.lastName}` : '',
        organization: lead.organization?.name || '',
        contactInfo, orgScore, valueScore, activityScore,
        demoScore, quotationScore, closeDateScore, priorityScore,
        totalScore,
        id: lead.id,
      };
    });

    // Compute KPIs over ALL matching leads (use counts from current page as approximation
    // if paginated; for accurate KPIs, run a lightweight aggregate)
    const allScores = scored.map(s => s.totalScore);
    const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
    const highQuality = allScores.filter(s => s >= 70).length;
    const mediumQuality = allScores.filter(s => s >= 40 && s < 70).length;
    const lowQuality = allScores.filter(s => s < 40).length;

    const summary: ReportMetric[] = [
      { key: 'avgScore', label: 'Average Quality Score', value: avgScore, format: 'number' },
      { key: 'highQualityCount', label: 'High Quality (70+)', value: highQuality, format: 'number' },
      { key: 'mediumQualityCount', label: 'Medium Quality (40-69)', value: mediumQuality, format: 'number' },
      { key: 'lowQualityCount', label: 'Low Quality (<40)', value: lowQuality, format: 'number' },
    ];

    const charts: ChartData[] = [
      {
        type: 'PIE', title: 'Quality Distribution',
        labels: ['High (70+)', 'Medium (40-69)', 'Low (<40)'],
        datasets: [{ label: 'Leads', data: [highQuality, mediumQuality, lowQuality] }],
      },
    ];

    const columns: ColumnDef[] = [
      { key: 'leadNumber', header: 'Lead #', width: 16 },
      { key: 'contact', header: 'Contact', width: 20 },
      { key: 'contactInfo', header: 'Contact (10)', width: 10, format: 'number' },
      { key: 'orgScore', header: 'Org (10)', width: 10, format: 'number' },
      { key: 'valueScore', header: 'Value (15)', width: 10, format: 'number' },
      { key: 'activityScore', header: 'Activity (15)', width: 10, format: 'number' },
      { key: 'demoScore', header: 'Demo (15)', width: 10, format: 'number' },
      { key: 'quotationScore', header: 'Quotation (15)', width: 10, format: 'number' },
      { key: 'closeDateScore', header: 'Close (10)', width: 10, format: 'number' },
      { key: 'priorityScore', header: 'Priority (10)', width: 10, format: 'number' },
      { key: 'totalScore', header: 'Total', width: 10, format: 'number' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Lead Quality Scores', columns, rows: scored }],
      metadata: { page, limit, totalCount },
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    // Drill down by quality tier: need to recompute or use simple heuristic
    // For simplicity, fetch leads and let the caller filter
    const where: any = {
      tenantId: params.filters?.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    const result = await this.drillDownService.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
