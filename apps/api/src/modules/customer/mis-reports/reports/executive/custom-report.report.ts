import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

type EntityType = 'LEAD' | 'CONTACT' | 'ORGANIZATION' | 'ACTIVITY' | 'DEMO' | 'QUOTATION' | 'TOUR_PLAN';
type AggFunction = 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';

const ENTITY_MODEL_MAP: Record<EntityType, string> = {
  LEAD: 'lead', CONTACT: 'contact', ORGANIZATION: 'organization',
  ACTIVITY: 'activity', DEMO: 'demo', QUOTATION: 'quotation', TOUR_PLAN: 'tourPlan',
};

@Injectable()
export class CustomReportReport implements IReport {
  readonly code = 'CUSTOM_REPORT';
  readonly name = 'Custom Report';
  readonly category = 'CUSTOM';
  readonly description = 'Dynamic report builder allowing flexible entity selection, column picking, filtering, grouping, and aggregation';
  readonly supportsDrillDown = false;
  readonly supportsPeriodComparison = false;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'entity', label: 'Entity', type: 'select', required: true, options: [
      { value: 'LEAD', label: 'Lead' }, { value: 'CONTACT', label: 'Contact' },
      { value: 'ORGANIZATION', label: 'Organization' }, { value: 'ACTIVITY', label: 'Activity' },
      { value: 'DEMO', label: 'Demo' }, { value: 'QUOTATION', label: 'Quotation' },
      { value: 'TOUR_PLAN', label: 'Tour Plan' },
    ]},
    { key: 'columns', label: 'Columns', type: 'text' },
    { key: 'groupByField', label: 'Group By', type: 'text' },
    { key: 'sortByField', label: 'Sort By', type: 'text' },
    { key: 'sortDirection', label: 'Sort Direction', type: 'select', options: [
      { value: 'asc', label: 'Ascending' }, { value: 'desc', label: 'Descending' },
    ]},
    { key: 'chartType', label: 'Chart Type', type: 'select', options: [
      { value: 'BAR', label: 'Bar' }, { value: 'LINE', label: 'Line' },
      { value: 'PIE', label: 'Pie' }, { value: 'DONUT', label: 'Donut' },
    ]},
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const filters = params.filters || {};
    const entity = (filters.entity || 'LEAD') as EntityType;
    const columns: string[] = filters.columns || [];
    const entityFilters: Record<string, any> = filters.entityFilters || {};
    const groupByField: string | undefined = filters.groupByField;
    const sortByField: string | undefined = filters.sortByField;
    const sortDirection: 'asc' | 'desc' = filters.sortDirection || 'desc';
    const aggregations: Array<{ column: string; function: AggFunction }> = filters.aggregations || [];
    const chartType: string | undefined = filters.chartType;

    const modelName = ENTITY_MODEL_MAP[entity];
    if (!modelName) {
      return this.emptyReport(params, `Unknown entity: ${entity}`);
    }

    const model = (this.prisma as any)[modelName];
    if (!model) {
      return this.emptyReport(params, `Model not found: ${modelName}`);
    }

    // Build where clause
    const where: any = { tenantId: params.tenantId, ...entityFilters };
    if (params.dateFrom && params.dateTo) {
      where.createdAt = { gte: params.dateFrom, lte: params.dateTo };
    }

    let rows: any[] = [];
    let totalRecords = 0;
    let groupCount = 0;
    let dynamicColumns: ColumnDef[] = [];
    const charts: ChartData[] = [];

    if (groupByField && aggregations.length > 0) {
      // Grouped aggregation query
      const aggArgs: any = { by: [groupByField], where };

      aggregations.forEach(agg => {
        const prismaAgg = `_${agg.function.toLowerCase()}`;
        if (!aggArgs[prismaAgg]) aggArgs[prismaAgg] = {};
        aggArgs[prismaAgg][agg.column] = true;
      });

      // Always include count
      aggArgs._count = true;

      if (sortByField) {
        aggArgs.orderBy = { [sortByField]: sortDirection };
      }

      const grouped = await model.groupBy(aggArgs);
      totalRecords = grouped.length;
      groupCount = grouped.length;

      // Build columns dynamically
      dynamicColumns = [{ key: groupByField, header: groupByField, width: 20 }];
      dynamicColumns.push({ key: '_count', header: 'Count', width: 12, format: 'number' });

      aggregations.forEach(agg => {
        const key = `${agg.function.toLowerCase()}_${agg.column}`;
        dynamicColumns.push({ key, header: `${agg.function}(${agg.column})`, width: 16, format: 'number' });
      });

      rows = grouped.map((g: any) => {
        const row: any = { [groupByField]: g[groupByField], _count: g._count };
        aggregations.forEach(agg => {
          const prismaKey = `_${agg.function.toLowerCase()}`;
          const colKey = `${agg.function.toLowerCase()}_${agg.column}`;
          row[colKey] = g[prismaKey]?.[agg.column] ?? 0;
          if (typeof row[colKey] === 'object' && row[colKey] !== null) {
            row[colKey] = Number(row[colKey]);
          }
        });
        return row;
      });

      // Chart for grouped data
      if (chartType && rows.length > 0) {
        const firstAgg = aggregations[0];
        const dataKey = firstAgg ? `${firstAgg.function.toLowerCase()}_${firstAgg.column}` : '_count';
        charts.push({
          type: chartType as any,
          title: `${entity} by ${groupByField}`,
          labels: rows.map(r => String(r[groupByField] || 'N/A')),
          datasets: [{ label: dataKey, data: rows.map(r => Number(r[dataKey] || 0)), color: '#2196F3' }],
        });
      }
    } else {
      // Simple findMany query
      const findArgs: any = { where };

      if (columns.length > 0) {
        const select: any = {};
        columns.forEach(c => { select[c] = true; });
        findArgs.select = select;
      }

      if (sortByField) {
        findArgs.orderBy = { [sortByField]: sortDirection };
      }

      const page = params.page || 1;
      const limit = params.limit || 50;
      findArgs.skip = (page - 1) * limit;
      findArgs.take = limit;

      const [records, count] = await Promise.all([
        model.findMany(findArgs),
        model.count({ where }),
      ]);

      totalRecords = count;
      rows = records.map((r: Record<string, unknown>) => {
        const row: any = {};
        const keys = columns.length > 0 ? columns : Object.keys(r);
        keys.forEach(k => {
          const val = r[k];
          row[k] = val instanceof Date ? val.toISOString() : (typeof val === 'object' && val !== null ? Number(val) : val);
        });
        return row;
      });

      // Build columns from data
      const colKeys = columns.length > 0 ? columns : (rows.length > 0 ? Object.keys(rows[0]) : []);
      dynamicColumns = colKeys.map(k => ({ key: k, header: k, width: 18 }));

      // Chart for flat data
      if (chartType && rows.length > 0 && columns.length >= 2) {
        const labelCol = columns[0];
        const dataCol = columns[1];
        charts.push({
          type: chartType as any,
          title: `${entity}: ${dataCol} by ${labelCol}`,
          labels: rows.map(r => String(r[labelCol] || '')),
          datasets: [{ label: dataCol, data: rows.map(r => Number(r[dataCol] || 0)), color: '#FF9800' }],
        });
      }
    }

    const summary: ReportMetric[] = [
      { key: 'totalRecords', label: 'Total Records', value: totalRecords, format: 'number' },
    ];
    if (groupCount > 0) {
      summary.push({ key: 'groupCount', label: 'Group Count', value: groupCount, format: 'number' });
    }

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: `${entity} Data`, columns: dynamicColumns, rows }],
      metadata: { entity, groupByField, totalRecords, groupCount },
    };
  }

  private emptyReport(params: ReportParams, error: string): ReportData {
    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params,
      summary: [{ key: 'totalRecords', label: 'Total Records', value: 0, format: 'number' }],
      charts: [], tables: [],
      metadata: { error },
    };
  }
}
