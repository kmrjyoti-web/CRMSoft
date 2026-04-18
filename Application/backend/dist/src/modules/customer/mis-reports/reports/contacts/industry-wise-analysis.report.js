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
exports.IndustryWiseAnalysisReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let IndustryWiseAnalysisReport = class IndustryWiseAnalysisReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'INDUSTRY_WISE_ANALYSIS';
        this.name = 'Industry-Wise Analysis';
        this.category = 'CONTACT_ORG';
        this.description = 'Analyzes lead performance, conversion rates, and revenue grouped by organization industry';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'industry', label: 'Industry', type: 'text' },
            { key: 'allocatedToId', label: 'Sales Rep', type: 'user' },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.userId)
            where.allocatedToId = params.userId;
        const leads = await this.prisma.working.lead.findMany({
            where,
            select: {
                status: true,
                expectedValue: true,
                organization: { select: { industry: true } },
            },
        });
        const industryMap = new Map();
        for (const lead of leads) {
            const industry = lead.organization?.industry || 'Unknown';
            if (!industryMap.has(industry)) {
                industryMap.set(industry, { leads: 0, won: 0, lost: 0, revenue: 0 });
            }
            const entry = industryMap.get(industry);
            entry.leads++;
            if (lead.status === 'WON') {
                entry.won++;
                entry.revenue += Number(lead.expectedValue || 0);
            }
            if (lead.status === 'LOST')
                entry.lost++;
        }
        const industries = [...industryMap.entries()].map(([industry, data]) => ({
            industry,
            ...data,
            conversionRate: data.leads > 0
                ? Math.round((data.won / data.leads) * 10000) / 100
                : 0,
        }));
        industries.sort((a, b) => b.revenue - a.revenue);
        const totalIndustries = industries.length;
        const allConversions = industries.filter(i => i.leads > 0).map(i => i.conversionRate);
        const avgConversion = allConversions.length > 0
            ? Math.round(allConversions.reduce((a, b) => a + b, 0) / allConversions.length * 100) / 100
            : 0;
        const bestIndustry = industries.length > 0 ? industries[0].industry : 'N/A';
        const worstIndustry = industries.length > 0 ? industries[industries.length - 1].industry : 'N/A';
        const summary = [
            { key: 'totalIndustries', label: 'Total Industries', value: totalIndustries, format: 'number' },
            { key: 'avgConversion', label: 'Avg Conversion Rate', value: avgConversion, format: 'percent' },
            { key: 'bestIndustry', label: 'Best Industry (Revenue)', value: industries[0]?.revenue || 0, format: 'currency' },
            { key: 'worstIndustry', label: 'Worst Industry (Revenue)', value: industries[industries.length - 1]?.revenue || 0, format: 'currency' },
        ];
        const charts = [
            {
                type: 'BAR', title: 'Leads by Industry',
                labels: industries.map(i => i.industry),
                datasets: [
                    { label: 'Total Leads', data: industries.map(i => i.leads), color: '#2196F3' },
                    { label: 'Won', data: industries.map(i => i.won), color: '#4CAF50' },
                    { label: 'Lost', data: industries.map(i => i.lost), color: '#F44336' },
                ],
            },
            {
                type: 'DONUT', title: 'Revenue by Industry',
                labels: industries.map(i => i.industry),
                datasets: [{ label: 'Revenue', data: industries.map(i => i.revenue) }],
            },
        ];
        const tableColumns = [
            { key: 'industry', header: 'Industry', width: 22 },
            { key: 'leads', header: 'Leads', width: 10, format: 'number' },
            { key: 'won', header: 'Won', width: 10, format: 'number' },
            { key: 'lost', header: 'Lost', width: 10, format: 'number' },
            { key: 'conversionRate', header: 'Conversion %', width: 14, format: 'percent' },
            { key: 'revenue', header: 'Revenue', width: 16, format: 'currency' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Industry Breakdown', columns: tableColumns, rows: industries }],
            metadata: { bestIndustry, worstIndustry },
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.dimension === 'industry') {
            where.organization = { industry: params.value === 'Unknown' ? null : params.value };
        }
        const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.IndustryWiseAnalysisReport = IndustryWiseAnalysisReport;
exports.IndustryWiseAnalysisReport = IndustryWiseAnalysisReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], IndustryWiseAnalysisReport);
//# sourceMappingURL=industry-wise-analysis.report.js.map