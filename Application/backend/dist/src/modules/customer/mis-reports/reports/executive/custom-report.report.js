"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomReportReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
const ENTITY_MODEL_MAP = {
    LEAD: 'lead', CONTACT: 'contact', ORGANIZATION: 'organization',
    ACTIVITY: 'activity', DEMO: 'demo', QUOTATION: 'quotation', TOUR_PLAN: 'tourPlan',
};
let CustomReportReport = class CustomReportReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'CUSTOM_REPORT';
        this.name = 'Custom Report';
        this.category = 'CUSTOM';
        this.description = 'Dynamic report builder allowing flexible entity selection, column picking, filtering, grouping, and aggregation';
        this.supportsDrillDown = false;
        this.supportsPeriodComparison = false;
        this.availableFilters = [
            { key: 'entity', label: 'Entity', type: 'select', required: true, options: [
                    { value: 'LEAD', label: 'Lead' }, { value: 'CONTACT', label: 'Contact' },
                    { value: 'ORGANIZATION', label: 'Organization' }, { value: 'ACTIVITY', label: 'Activity' },
                    { value: 'DEMO', label: 'Demo' }, { value: 'QUOTATION', label: 'Quotation' },
                    { value: 'TOUR_PLAN', label: 'Tour Plan' },
                ] },
            { key: 'columns', label: 'Columns', type: 'text' },
            { key: 'groupByField', label: 'Group By', type: 'text' },
            { key: 'sortByField', label: 'Sort By', type: 'text' },
            { key: 'sortDirection', label: 'Sort Direction', type: 'select', options: [
                    { value: 'asc', label: 'Ascending' }, { value: 'desc', label: 'Descending' },
                ] },
            { key: 'chartType', label: 'Chart Type', type: 'select', options: [
                    { value: 'BAR', label: 'Bar' }, { value: 'LINE', label: 'Line' },
                    { value: 'PIE', label: 'Pie' }, { value: 'DONUT', label: 'Donut' },
                ] },
        ];
    }
    async generate(params) {
        const filters = params.filters || {};
        const entity = (filters.entity || 'LEAD');
        const columns = filters.columns || [];
        const entityFilters = filters.entityFilters || {};
        const groupByField = filters.groupByField;
        const sortByField = filters.sortByField;
        const sortDirection = filters.sortDirection || 'desc';
        const aggregations = filters.aggregations || [];
        const chartType = filters.chartType;
        const modelName = ENTITY_MODEL_MAP[entity];
        if (!modelName) {
            return this.emptyReport(params, `Unknown entity: ${entity}`);
        }
        const model = this.prisma[modelName];
        if (!model) {
            return this.emptyReport(params, `Model not found: ${modelName}`);
        }
        const where = { tenantId: params.tenantId, ...entityFilters };
        if (params.dateFrom && params.dateTo) {
            where.createdAt = { gte: params.dateFrom, lte: params.dateTo };
        }
        let rows = [];
        let totalRecords = 0;
        let groupCount = 0;
        let dynamicColumns = [];
        const charts = [];
        if (groupByField && aggregations.length > 0) {
            const aggArgs = { by: [groupByField], where };
            aggregations.forEach(agg => {
                const prismaAgg = `_${agg.function.toLowerCase()}`;
                if (!aggArgs[prismaAgg])
                    aggArgs[prismaAgg] = {};
                aggArgs[prismaAgg][agg.column] = true;
            });
            aggArgs._count = true;
            if (sortByField) {
                aggArgs.orderBy = { [sortByField]: sortDirection };
            }
            const grouped = await model.groupBy(aggArgs);
            totalRecords = grouped.length;
            groupCount = grouped.length;
            dynamicColumns = [{ key: groupByField, header: groupByField, width: 20 }];
            dynamicColumns.push({ key: '_count', header: 'Count', width: 12, format: 'number' });
            aggregations.forEach(agg => {
                const key = `${agg.function.toLowerCase()}_${agg.column}`;
                dynamicColumns.push({ key, header: `${agg.function}(${agg.column})`, width: 16, format: 'number' });
            });
            rows = grouped.map((g) => {
                const row = { [groupByField]: g[groupByField], _count: g._count };
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
            if (chartType && rows.length > 0) {
                const firstAgg = aggregations[0];
                const dataKey = firstAgg ? `${firstAgg.function.toLowerCase()}_${firstAgg.column}` : '_count';
                charts.push({
                    type: chartType,
                    title: `${entity} by ${groupByField}`,
                    labels: rows.map(r => String(r[groupByField] || 'N/A')),
                    datasets: [{ label: dataKey, data: rows.map(r => Number(r[dataKey] || 0)), color: '#2196F3' }],
                });
            }
        }
        else {
            const findArgs = { where };
            if (columns.length > 0) {
                const select = {};
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
            rows = records.map((r) => {
                const row = {};
                const keys = columns.length > 0 ? columns : Object.keys(r);
                keys.forEach(k => {
                    const val = r[k];
                    row[k] = val instanceof Date ? val.toISOString() : (typeof val === 'object' && val !== null ? Number(val) : val);
                });
                return row;
            });
            const colKeys = columns.length > 0 ? columns : (rows.length > 0 ? Object.keys(rows[0]) : []);
            dynamicColumns = colKeys.map(k => ({ key: k, header: k, width: 18 }));
            if (chartType && rows.length > 0 && columns.length >= 2) {
                const labelCol = columns[0];
                const dataCol = columns[1];
                charts.push({
                    type: chartType,
                    title: `${entity}: ${dataCol} by ${labelCol}`,
                    labels: rows.map(r => String(r[labelCol] || '')),
                    datasets: [{ label: dataCol, data: rows.map(r => Number(r[dataCol] || 0)), color: '#FF9800' }],
                });
            }
        }
        const summary = [
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
    emptyReport(params, error) {
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params,
            summary: [{ key: 'totalRecords', label: 'Total Records', value: 0, format: 'number' }],
            charts: [], tables: [],
            metadata: { error },
        };
    }
};
exports.CustomReportReport = CustomReportReport;
exports.CustomReportReport = CustomReportReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], CustomReportReport);
//# sourceMappingURL=custom-report.report.js.map