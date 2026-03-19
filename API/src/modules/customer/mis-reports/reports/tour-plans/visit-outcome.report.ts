import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class VisitOutcomeReport implements IReport {
  readonly code = 'VISIT_OUTCOME';
  readonly name = 'Visit Outcome Analysis';
  readonly category = 'TOUR_PLAN';
  readonly description = 'Analyzes tour plan visit outcomes, productive visit rates, and average time spent per visit';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = false;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'salesPersonId', label: 'Sales Person', type: 'user' },
    { key: 'outcome', label: 'Outcome', type: 'text' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = {
      tenantId: params.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
      outcome: { not: null },
    };
    if (params.userId) where.tourPlan = { salesPersonId: params.userId };
    if (params.filters?.outcome) where.outcome = { contains: params.filters.outcome, mode: 'insensitive' };

    const visits = await this.prisma.tourPlanVisit.findMany({
      where,
      select: {
        id: true, outcome: true, notes: true, actualArrival: true, actualDeparture: true, createdAt: true,
        tourPlan: {
          select: {
            salesPerson: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        lead: {
          select: {
            organization: { select: { name: true } },
          },
        },
      },
    });

    // Group by outcome
    const outcomeMap = new Map<string, number>();
    visits.forEach(v => {
      const key = v.outcome || 'Unknown';
      outcomeMap.set(key, (outcomeMap.get(key) || 0) + 1);
    });
    const outcomeEntries = [...outcomeMap.entries()].sort((a, b) => b[1] - a[1]);

    // Productive keywords
    const productiveKeywords = ['PRODUCTIVE', 'POSITIVE', 'INTERESTED', 'ORDER', 'DEMO_SCHEDULED', 'CONVERTED', 'SUCCESS'];
    const productiveVisits = visits.filter(v =>
      productiveKeywords.some(kw => (v.outcome || '').toUpperCase().includes(kw)),
    ).length;

    const followUpKeywords = ['FOLLOW_UP', 'FOLLOWUP', 'FOLLOW UP', 'CALLBACK', 'REVISIT'];
    const followUpNeeded = visits.filter(v =>
      followUpKeywords.some(kw => (v.outcome || '').toUpperCase().includes(kw)),
    ).length;

    // Avg time spent in minutes
    const timeDiffs = visits
      .filter(v => v.actualArrival && v.actualDeparture)
      .map(v => (v.actualDeparture!.getTime() - v.actualArrival!.getTime()) / 60000)
      .filter(m => m > 0 && m < 480); // cap at 8 hours
    const avgTimeSpent = timeDiffs.length > 0
      ? Math.round(timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length)
      : 0;

    const totalVisits = visits.length;

    const summary: ReportMetric[] = [
      { key: 'totalVisits', label: 'Total Visits', value: totalVisits, format: 'number' },
      { key: 'productiveVisits', label: 'Productive Visits', value: productiveVisits, format: 'number' },
      { key: 'followUpNeeded', label: 'Follow-Up Needed', value: followUpNeeded, format: 'number' },
      { key: 'avgTimeSpentMinutes', label: 'Avg Time Spent (min)', value: avgTimeSpent, format: 'number' },
    ];

    const charts: ChartData[] = [
      {
        type: 'PIE', title: 'Visit Outcome Distribution',
        labels: outcomeEntries.map(e => e[0]),
        datasets: [{ label: 'Visits', data: outcomeEntries.map(e => e[1]), color: '#FF9800' }],
      },
    ];

    // Visit detail table
    const rows = visits.slice(0, 200).map(v => {
      const timeSpent = v.actualArrival && v.actualDeparture
        ? Math.round((v.actualDeparture.getTime() - v.actualArrival.getTime()) / 60000)
        : null;
      return {
        date: v.createdAt,
        userName: `${v.tourPlan.salesPerson.firstName} ${v.tourPlan.salesPerson.lastName}`,
        organization: v.lead?.organization?.name || '-',
        outcome: v.outcome || '',
        timeSpent: timeSpent != null ? `${timeSpent} min` : '-',
        notes: v.notes || '',
      };
    });

    const tableColumns: ColumnDef[] = [
      { key: 'date', header: 'Date', width: 14, format: 'date' },
      { key: 'userName', header: 'Sales Person', width: 20 },
      { key: 'organization', header: 'Organization', width: 22 },
      { key: 'outcome', header: 'Outcome', width: 18 },
      { key: 'timeSpent', header: 'Time Spent', width: 12 },
      { key: 'notes', header: 'Notes', width: 28 },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Visit Outcome Details', columns: tableColumns, rows }],
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.dimension === 'outcome') where.outcome = params.value;

    const skip = (params.page - 1) * params.limit;
    const [records, total] = await Promise.all([
      this.prisma.tourPlanVisit.findMany({
        where,
        include: {
          tourPlan: { select: { salesPerson: { select: { firstName: true, lastName: true } } } },
          lead: { select: { leadNumber: true, organization: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: params.limit,
      }),
      this.prisma.tourPlanVisit.count({ where }),
    ]);

    const columns: ColumnDef[] = [
      { key: 'date', header: 'Date', width: 14, format: 'date' },
      { key: 'salesPerson', header: 'Sales Person', width: 20 },
      { key: 'leadNumber', header: 'Lead #', width: 16 },
      { key: 'organization', header: 'Organization', width: 22 },
      { key: 'outcome', header: 'Outcome', width: 18 },
      { key: 'notes', header: 'Notes', width: 24 },
    ];

    const rows = records.map(r => ({
      date: r.createdAt,
      salesPerson: `${r.tourPlan.salesPerson.firstName} ${r.tourPlan.salesPerson.lastName}`,
      leadNumber: r.lead?.leadNumber || '',
      organization: r.lead?.organization?.name || '',
      outcome: r.outcome || '',
      notes: r.notes || '',
    }));

    return { dimension: params.dimension, value: params.value, columns, rows, total, page: params.page, limit: params.limit };
  }
}
