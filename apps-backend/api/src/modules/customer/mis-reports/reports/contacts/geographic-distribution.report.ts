import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class GeographicDistributionReport implements IReport {
  readonly code = 'GEOGRAPHIC_DISTRIBUTION';
  readonly name = 'Geographic Distribution';
  readonly category = 'CONTACT_ORG';
  readonly description = 'Analyzes organization and lead distribution by state and city with revenue breakdown';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'state', label: 'State', type: 'text' },
    { key: 'city', label: 'City', type: 'text' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const orgs = await this.prisma.working.organization.findMany({
      where: {
        tenantId: params.tenantId,
        isActive: true,
        ...(params.filters?.state ? { state: params.filters.state } : {}),
        ...(params.filters?.city ? { city: params.filters.city } : {}),
      },
      select: { id: true, state: true, city: true },
    });

    const orgIds = orgs.map(o => o.id);

    const leads = await this.prisma.working.lead.findMany({
      where: {
        tenantId: params.tenantId,
        createdAt: { gte: params.dateFrom, lte: params.dateTo },
        organizationId: { in: orgIds },
      },
      select: { organizationId: true, status: true, expectedValue: true },
    });

    // Build org-to-location map
    const orgLocationMap = new Map<string, { state: string; city: string }>();
    orgs.forEach(o => orgLocationMap.set(o.id, {
      state: o.state || 'STATE_NOT_PROVIDED',
      city: o.city || 'CITY_NOT_PROVIDED',
    }));

    // Aggregate by state and city
    const stateMap = new Map<string, { orgCount: number; leadCount: number; revenue: number }>();
    const cityMap = new Map<string, { state: string; orgCount: number; leadCount: number; revenue: number }>();

    // Count orgs per location
    orgs.forEach(o => {
      const state = o.state || 'STATE_NOT_PROVIDED';
      const city = o.city || 'CITY_NOT_PROVIDED';
      if (!stateMap.has(state)) stateMap.set(state, { orgCount: 0, leadCount: 0, revenue: 0 });
      stateMap.get(state)!.orgCount++;
      const cityKey = `${state}|${city}`;
      if (!cityMap.has(cityKey)) cityMap.set(cityKey, { state, orgCount: 0, leadCount: 0, revenue: 0 });
      cityMap.get(cityKey)!.orgCount++;
    });

    // Count leads and revenue per location
    leads.forEach(l => {
      const loc = orgLocationMap.get(l.organizationId!);
      if (!loc) return;
      const revenue = l.status === 'WON' ? Number(l.expectedValue || 0) : 0;

      if (stateMap.has(loc.state)) {
        stateMap.get(loc.state)!.leadCount++;
        stateMap.get(loc.state)!.revenue += revenue;
      }

      const cityKey = `${loc.state}|${loc.city}`;
      if (cityMap.has(cityKey)) {
        cityMap.get(cityKey)!.leadCount++;
        cityMap.get(cityKey)!.revenue += revenue;
      }
    });

    const states = [...stateMap.entries()]
      .map(([state, data]) => ({ state, ...data }))
      .sort((a, b) => b.orgCount - a.orgCount);

    const cities = [...cityMap.entries()]
      .map(([key, data]) => ({ city: key.split('|')[1], ...data }))
      .sort((a, b) => b.orgCount - a.orgCount);

    const totalStates = states.filter(s => s.state !== 'STATE_NOT_PROVIDED').length;
    const totalCities = cities.filter(c => c.city !== 'CITY_NOT_PROVIDED').length;
    const topCity = cities.length > 0 ? cities[0].city : 'NO_CITIES_RECORDED';
    const topState = states.length > 0 ? states[0].state : 'NO_STATES_RECORDED';

    const summary: ReportMetric[] = [
      { key: 'totalStates', label: 'Total States', value: totalStates, format: 'number' },
      { key: 'totalCities', label: 'Total Cities', value: totalCities, format: 'number' },
      { key: 'topCity', label: 'Top City (Org Count)', value: cities[0]?.orgCount || 0, format: 'number' },
      { key: 'topState', label: 'Top State (Org Count)', value: states[0]?.orgCount || 0, format: 'number' },
    ];

    const top10Cities = cities.slice(0, 10);
    const charts: ChartData[] = [
      {
        type: 'BAR', title: 'Top 10 Cities by Organization Count',
        labels: top10Cities.map(c => c.city),
        datasets: [{ label: 'Organizations', data: top10Cities.map(c => c.orgCount), color: '#3F51B5' }],
      },
    ];

    const tableColumns: ColumnDef[] = [
      { key: 'state', header: 'State', width: 18 },
      { key: 'city', header: 'City', width: 18 },
      { key: 'orgCount', header: 'Organizations', width: 14, format: 'number' },
      { key: 'leadCount', header: 'Leads', width: 10, format: 'number' },
      { key: 'revenue', header: 'Revenue', width: 16, format: 'currency' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Geographic Breakdown', columns: tableColumns, rows: cities }],
      metadata: { topCity, topState },
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.dimension === 'city') {
      where.organization = { city: params.value };
    }
    const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
