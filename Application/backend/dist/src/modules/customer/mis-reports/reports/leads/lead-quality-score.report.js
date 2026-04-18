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
exports.LeadQualityScoreReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
const PRIORITY_POINTS = { URGENT: 10, HIGH: 7, MEDIUM: 5, LOW: 2 };
let LeadQualityScoreReport = class LeadQualityScoreReport {
    constructor(prisma, drillDownService) {
        this.prisma = prisma;
        this.drillDownService = drillDownService;
        this.code = 'LEAD_QUALITY_SCORE';
        this.name = 'Lead Quality Score';
        this.category = 'LEAD';
        this.description = 'Scores each lead on a 0-100 scale based on completeness, engagement, and progression indicators';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = false;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'status', label: 'Status', type: 'multi_select' },
            { key: 'allocatedTo', label: 'Allocated To', type: 'user' },
            { key: 'qualityTier', label: 'Quality Tier', type: 'select', options: [
                    { value: 'high', label: 'High (70+)' },
                    { value: 'medium', label: 'Medium (40-69)' },
                    { value: 'low', label: 'Low (<40)' },
                ] },
        ];
    }
    async generate(params) {
        const where = { tenantId: params.tenantId, createdAt: { gte: params.dateFrom, lte: params.dateTo } };
        if (params.userId)
            where.allocatedToId = params.userId;
        if (params.filters?.status)
            where.status = { in: params.filters.status };
        const page = params.page || 1;
        const limit = params.limit || 50;
        const skip = (page - 1) * limit;
        const [leads, totalCount] = await Promise.all([
            this.prisma.working.lead.findMany({
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
            this.prisma.working.lead.count({ where }),
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
            if (lead.contact?.firstName)
                contactInfo = 10;
            if (lead.organization)
                orgScore = 10;
            if (lead.expectedValue)
                valueScore = 15;
            const actCount = lead.activities.length;
            activityScore = actCount > 5 ? 15 : actCount > 3 ? 10 : actCount > 0 ? 5 : 0;
            const hasCompleted = lead.demos.some(d => d.status === 'COMPLETED');
            demoScore = hasCompleted ? 15 : lead.demos.length > 0 ? 10 : 0;
            const hasAccepted = lead.quotations.some(q => q.status === 'ACCEPTED');
            quotationScore = hasAccepted ? 15 : lead.quotations.length > 0 ? 10 : 0;
            if (lead.expectedCloseDate)
                closeDateScore = 10;
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
        const allScores = scored.map(s => s.totalScore);
        const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
        const highQuality = allScores.filter(s => s >= 70).length;
        const mediumQuality = allScores.filter(s => s >= 40 && s < 70).length;
        const lowQuality = allScores.filter(s => s < 40).length;
        const summary = [
            { key: 'avgScore', label: 'Average Quality Score', value: avgScore, format: 'number' },
            { key: 'highQualityCount', label: 'High Quality (70+)', value: highQuality, format: 'number' },
            { key: 'mediumQualityCount', label: 'Medium Quality (40-69)', value: mediumQuality, format: 'number' },
            { key: 'lowQualityCount', label: 'Low Quality (<40)', value: lowQuality, format: 'number' },
        ];
        const charts = [
            {
                type: 'PIE', title: 'Quality Distribution',
                labels: ['High (70+)', 'Medium (40-69)', 'Low (<40)'],
                datasets: [{ label: 'Leads', data: [highQuality, mediumQuality, lowQuality] }],
            },
        ];
        const columns = [
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
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        const result = await this.drillDownService.getLeads(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.LeadQualityScoreReport = LeadQualityScoreReport;
exports.LeadQualityScoreReport = LeadQualityScoreReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], LeadQualityScoreReport);
//# sourceMappingURL=lead-quality-score.report.js.map