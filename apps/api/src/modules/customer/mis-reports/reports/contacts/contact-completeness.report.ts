import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

interface ContactScore {
  id: string;
  name: string;
  organization: string;
  score: number;
  tier: string;
}

@Injectable()
export class ContactCompletenessReport implements IReport {
  readonly code = 'CONTACT_COMPLETENESS';
  readonly name = 'Contact Completeness';
  readonly category = 'CONTACT_ORG';
  readonly description = 'Scores each contact on data completeness and groups them into quality tiers';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = false;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'isActive', label: 'Active Only', type: 'boolean', defaultValue: true },
    { key: 'tier', label: 'Quality Tier', type: 'select', options: [
      { value: 'Complete', label: 'Complete (80-100)' },
      { value: 'Good', label: 'Good (60-79)' },
      { value: 'Partial', label: 'Partial (40-59)' },
      { value: 'Poor', label: 'Poor (0-39)' },
    ]},
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
    if (params.filters?.isActive !== undefined) where.isActive = params.filters.isActive;

    const contacts = await this.prisma.working.contact.findMany({
      where,
      select: {
        id: true, firstName: true, lastName: true,
        designation: true, department: true, notes: true,
        organization: { select: { name: true } },
      },
    });

    const scored: ContactScore[] = contacts.map(c => {
      let score = 0;
      if (c.firstName) score += 20;
      if (c.organization) score += 20;
      if (c.designation) score += 20;
      if (c.department) score += 20;
      if (c.notes) score += 20;
      return {
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        organization: c.organization?.name || '',
        score,
        tier: this.getTier(score),
      };
    });

    const tierCounts = { Complete: 0, Good: 0, Partial: 0, Poor: 0 };
    scored.forEach(s => tierCounts[s.tier as keyof typeof tierCounts]++);
    const totalContacts = scored.length;
    const avgScore = totalContacts > 0
      ? Math.round(scored.reduce((sum, s) => sum + s.score, 0) / totalContacts)
      : 0;

    const summary: ReportMetric[] = [
      { key: 'avgScore', label: 'Average Score', value: avgScore, format: 'number' },
      { key: 'completeCount', label: 'Complete Contacts', value: tierCounts.Complete, format: 'number' },
      { key: 'poorCount', label: 'Poor Contacts', value: tierCounts.Poor, format: 'number' },
      { key: 'totalContacts', label: 'Total Contacts', value: totalContacts, format: 'number' },
    ];

    const tierLabels = ['Complete', 'Good', 'Partial', 'Poor'];
    const charts: ChartData[] = [
      {
        type: 'PIE', title: 'Quality Tier Distribution',
        labels: tierLabels,
        datasets: [{
          label: 'Contacts',
          data: tierLabels.map(t => tierCounts[t as keyof typeof tierCounts]),
          color: '#FF9800',
        }],
      },
    ];

    // Bottom 20 contacts by score
    const bottom20 = [...scored].sort((a, b) => a.score - b.score).slice(0, 20);
    const tableColumns: ColumnDef[] = [
      { key: 'name', header: 'Name', width: 22 },
      { key: 'organization', header: 'Organization', width: 25 },
      { key: 'score', header: 'Score', width: 10, format: 'number' },
      { key: 'tier', header: 'Tier', width: 12 },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Bottom 20 Contacts by Score', columns: tableColumns, rows: bottom20 }],
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };

    // Filter by tier requires fetching and scoring contacts
    const contacts = await this.prisma.working.contact.findMany({
      where,
      select: {
        id: true, firstName: true, lastName: true,
        designation: true, department: true, notes: true,
        organization: { select: { name: true } },
        createdAt: true,
      },
    });

    const filtered = contacts.filter(c => {
      let score = 0;
      if (c.firstName) score += 20;
      if (c.organization) score += 20;
      if (c.designation) score += 20;
      if (c.department) score += 20;
      if (c.notes) score += 20;
      return this.getTier(score) === params.value;
    });

    const total = filtered.length;
    const page = params.page;
    const limit = params.limit;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    const columns: ColumnDef[] = [
      { key: 'name', header: 'Name', width: 22 },
      { key: 'designation', header: 'Designation', width: 20 },
      { key: 'department', header: 'Department', width: 20 },
      { key: 'organization', header: 'Organization', width: 25 },
      { key: 'score', header: 'Score', width: 10, format: 'number' },
      { key: 'createdAt', header: 'Created', width: 15, format: 'date' },
    ];

    const rows = paged.map(c => {
      let score = 0;
      if (c.firstName) score += 20;
      if (c.organization) score += 20;
      if (c.designation) score += 20;
      if (c.department) score += 20;
      if (c.notes) score += 20;
      return {
        name: `${c.firstName} ${c.lastName}`,
        designation: c.designation || '',
        department: c.department || '',
        organization: c.organization?.name || '',
        score,
        createdAt: c.createdAt,
      };
    });

    return { dimension: params.dimension, value: params.value, columns, rows, total, page, limit };
  }

  private getTier(score: number): string {
    if (score >= 80) return 'Complete';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Partial';
    return 'Poor';
  }
}
