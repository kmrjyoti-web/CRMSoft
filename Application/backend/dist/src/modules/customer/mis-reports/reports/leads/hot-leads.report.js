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
exports.HotLeadsReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
const PRIORITY_SCORE = { URGENT: 40, HIGH: 30, MEDIUM: 0, LOW: 0 };
let HotLeadsReport = class HotLeadsReport {
    constructor(prisma, drillDownService) {
        this.prisma = prisma;
        this.drillDownService = drillDownService;
        this.code = 'HOT_LEADS';
        this.name = 'Hot Leads Report';
        this.category = 'LEAD';
        this.description = 'Identifies high-priority leads with imminent close dates and significant value, scored for urgency';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = false;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'minValue', label: 'Minimum Expected Value', type: 'text', defaultValue: '50000' },
            { key: 'allocatedTo', label: 'Allocated To', type: 'user' },
        ];
    }
    async generate(params) {
        const now = new Date();
        const thirtyDaysLater = new Date(now.getTime() + 30 * 86400000);
        const threshold = Number(params.filters?.minValue) || 50000;
        const where = {
            tenantId: params.tenantId,
            status: { notIn: ['WON', 'LOST'] },
            priority: { in: ['HIGH', 'URGENT'] },
            expectedCloseDate: { lte: thirtyDaysLater },
            expectedValue: { gte: threshold },
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.userId)
            where.allocatedToId = params.userId;
        const leads = await this.prisma.working.lead.findMany({
            where,
            include: {
                contact: { select: { firstName: true, lastName: true } },
                organization: { select: { name: true } },
            },
        });
        const scored = leads.map(lead => {
            const value = Number(lead.expectedValue || 0);
            let score = PRIORITY_SCORE[lead.priority] || 0;
            if (lead.expectedCloseDate) {
                const daysToClose = Math.ceil((lead.expectedCloseDate.getTime() - now.getTime()) / 86400000);
                score += daysToClose <= 7 ? 30 : daysToClose <= 14 ? 20 : daysToClose <= 30 ? 10 : 0;
            }
            score += value > 500000 ? 30 : value > 100000 ? 20 : value > 50000 ? 10 : 0;
            return {
                leadNumber: lead.leadNumber,
                contact: lead.contact ? `${lead.contact.firstName} ${lead.contact.lastName}` : '',
                organization: lead.organization?.name || '',
                status: lead.status,
                priority: lead.priority,
                value,
                expectedCloseDate: lead.expectedCloseDate,
                score,
                id: lead.id,
            };
        }).sort((a, b) => b.score - a.score);
        const totalHotValue = scored.reduce((s, l) => s + l.value, 0);
        const avgHotValue = scored.length > 0 ? Math.round(totalHotValue / scored.length) : 0;
        const urgentCount = scored.filter(l => l.priority === 'URGENT').length;
        const summary = [
            { key: 'hotLeadCount', label: 'Hot Leads', value: scored.length, format: 'number' },
            { key: 'totalHotValue', label: 'Total Hot Value', value: totalHotValue, format: 'currency' },
            { key: 'avgHotValue', label: 'Avg Hot Lead Value', value: avgHotValue, format: 'currency' },
            { key: 'urgentCount', label: 'Urgent Leads', value: urgentCount, format: 'number' },
        ];
        const dist = [
            { label: '90-100', count: scored.filter(l => l.score >= 90).length },
            { label: '70-89', count: scored.filter(l => l.score >= 70 && l.score < 90).length },
            { label: '50-69', count: scored.filter(l => l.score >= 50 && l.score < 70).length },
        ];
        const charts = [
            {
                type: 'BAR', title: 'Score Distribution',
                labels: dist.map(d => d.label),
                datasets: [{ label: 'Leads', data: dist.map(d => d.count) }],
            },
        ];
        const columns = [
            { key: 'leadNumber', header: 'Lead #', width: 18 },
            { key: 'contact', header: 'Contact', width: 22 },
            { key: 'organization', header: 'Organization', width: 25 },
            { key: 'status', header: 'Status', width: 14 },
            { key: 'value', header: 'Value', width: 18, format: 'currency' },
            { key: 'expectedCloseDate', header: 'Expected Close', width: 16, format: 'date' },
            { key: 'score', header: 'Score', width: 10, format: 'number' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Hot Leads', columns, rows: scored }],
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            priority: params.value,
            status: { notIn: ['WON', 'LOST'] },
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        const result = await this.drillDownService.getLeads(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.HotLeadsReport = HotLeadsReport;
exports.HotLeadsReport = HotLeadsReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], HotLeadsReport);
//# sourceMappingURL=hot-leads.report.js.map