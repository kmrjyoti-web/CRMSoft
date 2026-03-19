import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class VisitToConversionReport implements IReport {
  readonly code = 'VISIT_TO_CONVERSION';
  readonly name = 'Visit to Conversion';
  readonly category = 'TOUR_PLAN';
  readonly description = 'Measures field visit effectiveness by tracking conversion from visit to demo, quotation, and won stages';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'salesPersonId', label: 'Sales Person', type: 'user' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const dateFilter = { gte: params.dateFrom, lte: params.dateTo };
    const tenantId = params.tenantId;

    // Get visits with their lead data (demos, quotations, lead status)
    const visitWhere: any = { tenantId, createdAt: dateFilter };
    if (params.userId) visitWhere.tourPlan = { salesPersonId: params.userId };

    const visits = await this.prisma.tourPlanVisit.findMany({
      where: visitWhere,
      select: {
        id: true, leadId: true,
        tourPlan: { select: { salesPerson: { select: { id: true, firstName: true, lastName: true } } } },
        lead: {
          select: {
            id: true, status: true,
            demos: { select: { id: true } },
            quotations: { select: { id: true } },
          },
        },
      },
    });

    // Unique field leads (visited via tour plan)
    const fieldLeadIds = new Set<string>();
    visits.forEach(v => { if (v.leadId) fieldLeadIds.add(v.leadId); });

    const fieldLeads = visits
      .filter(v => v.lead)
      .reduce((map, v) => { map.set(v.lead!.id, v.lead!); return map; }, new Map<string, any>());

    const totalFieldVisits = visits.length;
    const withDemo = [...fieldLeads.values()].filter(l => l.demos.length > 0).length;
    const withQuotation = [...fieldLeads.values()].filter(l => l.quotations.length > 0).length;
    const withWon = [...fieldLeads.values()].filter(l => l.status === 'WON').length;
    const fieldLeadCount = fieldLeads.size;

    const visitToDemoRate = fieldLeadCount > 0 ? Math.round((withDemo / fieldLeadCount) * 10000) / 100 : 0;
    const visitToQuotationRate = fieldLeadCount > 0 ? Math.round((withQuotation / fieldLeadCount) * 10000) / 100 : 0;
    const visitToWonRate = fieldLeadCount > 0 ? Math.round((withWon / fieldLeadCount) * 10000) / 100 : 0;

    // Non-field leads: leads created in period that do NOT have any tour plan visits
    const nonFieldLeads = await this.prisma.lead.findMany({
      where: {
        tenantId, createdAt: dateFilter,
        id: { notIn: [...fieldLeadIds] },
      },
      select: {
        id: true, status: true,
        demos: { select: { id: true } },
        quotations: { select: { id: true } },
      },
    });

    const nonFieldTotal = nonFieldLeads.length;
    const nonFieldWon = nonFieldLeads.filter(l => l.status === 'WON').length;
    const fieldConversion = fieldLeadCount > 0 ? Math.round((withWon / fieldLeadCount) * 10000) / 100 : 0;
    const nonFieldConversion = nonFieldTotal > 0 ? Math.round((nonFieldWon / nonFieldTotal) * 10000) / 100 : 0;

    const summary: ReportMetric[] = [
      { key: 'totalFieldVisits', label: 'Total Field Visits', value: totalFieldVisits, format: 'number' },
      { key: 'visitToDemoRate', label: 'Visit to Demo Rate', value: visitToDemoRate, format: 'percent' },
      { key: 'visitToQuotationRate', label: 'Visit to Quotation Rate', value: visitToQuotationRate, format: 'percent' },
      { key: 'visitToWonRate', label: 'Visit to Won Rate', value: visitToWonRate, format: 'percent' },
      { key: 'fieldLeadConversion', label: 'Field Lead Conversion', value: fieldConversion, format: 'percent' },
      { key: 'nonFieldLeadConversion', label: 'Non-Field Lead Conversion', value: nonFieldConversion, format: 'percent' },
    ];

    const charts: ChartData[] = [
      {
        type: 'FUNNEL', title: 'Field Visit Conversion Funnel',
        labels: ['Visits', 'Demo', 'Quotation', 'Won'],
        datasets: [{
          label: 'Count',
          data: [totalFieldVisits, withDemo, withQuotation, withWon],
          color: '#009688',
        }],
      },
      {
        type: 'BAR', title: 'Field vs Non-Field Lead Conversion',
        labels: ['Field Leads', 'Non-Field Leads'],
        datasets: [{ label: 'Conversion %', data: [fieldConversion, nonFieldConversion], color: '#FF5722' }],
      },
    ];

    // Per-user conversion table
    const userMap = new Map<string, {
      name: string; visits: number; leadIds: Set<string>; leadsMap: Map<string, any>;
    }>();

    visits.forEach(v => {
      const uid = v.tourPlan.salesPerson.id;
      const uName = `${v.tourPlan.salesPerson.firstName} ${v.tourPlan.salesPerson.lastName}`;
      if (!userMap.has(uid)) {
        userMap.set(uid, { name: uName, visits: 0, leadIds: new Set(), leadsMap: new Map() });
      }
      const e = userMap.get(uid)!;
      e.visits++;
      if (v.lead) {
        e.leadIds.add(v.lead.id);
        e.leadsMap.set(v.lead.id, v.lead);
      }
    });

    const userStats = [...userMap.entries()].map(([userId, d]) => {
      const leads = [...d.leadsMap.values()];
      const demos = leads.filter(l => l.demos.length > 0).length;
      const quotations = leads.filter(l => l.quotations.length > 0).length;
      const won = leads.filter(l => l.status === 'WON').length;
      const uniqueLeads = d.leadIds.size;
      return {
        userId, name: d.name, visits: d.visits, uniqueLeads,
        demos, quotations, won,
        demoRate: uniqueLeads > 0 ? Math.round((demos / uniqueLeads) * 10000) / 100 : 0,
        quotationRate: uniqueLeads > 0 ? Math.round((quotations / uniqueLeads) * 10000) / 100 : 0,
        wonRate: uniqueLeads > 0 ? Math.round((won / uniqueLeads) * 10000) / 100 : 0,
      };
    });
    userStats.sort((a, b) => b.wonRate - a.wonRate);

    const tableColumns: ColumnDef[] = [
      { key: 'name', header: 'Sales Person', width: 20 },
      { key: 'visits', header: 'Visits', width: 10, format: 'number' },
      { key: 'uniqueLeads', header: 'Leads', width: 10, format: 'number' },
      { key: 'demos', header: 'Demos', width: 10, format: 'number' },
      { key: 'quotations', header: 'Quotations', width: 12, format: 'number' },
      { key: 'won', header: 'Won', width: 8, format: 'number' },
      { key: 'demoRate', header: 'Demo %', width: 10, format: 'percent' },
      { key: 'quotationRate', header: 'Quote %', width: 10, format: 'percent' },
      { key: 'wonRate', header: 'Won %', width: 10, format: 'percent' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Per User Visit-to-Conversion Metrics', columns: tableColumns, rows: userStats }],
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
      tourPlanVisits: { some: {} },
    };
    if (params.dimension === 'user') where.allocatedToId = params.value;
    const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
