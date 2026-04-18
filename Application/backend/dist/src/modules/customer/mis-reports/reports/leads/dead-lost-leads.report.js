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
exports.DeadLostLeadsReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
const NON_RECOVERABLE_REASONS = ['BUDGET', 'COMPETITOR_CHOSEN', 'NO_REQUIREMENT'];
let DeadLostLeadsReport = class DeadLostLeadsReport {
    constructor(prisma, drillDownService) {
        this.prisma = prisma;
        this.drillDownService = drillDownService;
        this.code = 'DEAD_LOST_LEADS';
        this.name = 'Dead & Lost Leads';
        this.category = 'LEAD';
        this.description = 'Analyses lost and stale on-hold leads with reason breakdown and recovery potential';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'lostReason', label: 'Lost Reason', type: 'text' },
            { key: 'allocatedTo', label: 'Allocated To', type: 'user' },
            { key: 'recoverable', label: 'Recoverable Only', type: 'boolean', defaultValue: false },
        ];
    }
    async generate(params) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
        const [lostLeads, staleOnHold] = await Promise.all([
            this.prisma.working.lead.findMany({
                where: {
                    tenantId: params.tenantId,
                    status: 'LOST',
                    createdAt: { gte: params.dateFrom, lte: params.dateTo },
                },
                include: {
                    contact: { select: { firstName: true, lastName: true } },
                    organization: { select: { name: true } },
                },
            }),
            this.prisma.working.lead.findMany({
                where: {
                    tenantId: params.tenantId,
                    status: 'ON_HOLD',
                    updatedAt: { lte: thirtyDaysAgo },
                    createdAt: { gte: params.dateFrom, lte: params.dateTo },
                },
                include: {
                    contact: { select: { firstName: true, lastName: true } },
                    organization: { select: { name: true } },
                },
            }),
        ]);
        const allDead = [...lostLeads, ...staleOnHold];
        const lostCount = lostLeads.length;
        const staleOnHoldCount = staleOnHold.length;
        const totalDead = allDead.length;
        const totalLostValue = lostLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
        const avgLostValue = lostCount > 0 ? Math.round(totalLostValue / lostCount) : 0;
        const summary = [
            { key: 'totalDead', label: 'Total Dead Leads', value: totalDead, format: 'number' },
            { key: 'lostCount', label: 'Lost Leads', value: lostCount, format: 'number' },
            { key: 'staleOnHoldCount', label: 'Stale On-Hold Leads', value: staleOnHoldCount, format: 'number' },
            { key: 'totalLostValue', label: 'Total Lost Value', value: totalLostValue, format: 'currency' },
            { key: 'avgLostValue', label: 'Avg Lost Value', value: avgLostValue, format: 'currency' },
        ];
        const reasonMap = new Map();
        for (const lead of lostLeads) {
            const reason = lead.lostReason || 'Not Specified';
            reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
        }
        const reasons = Array.from(reasonMap.entries()).sort((a, b) => b[1] - a[1]);
        const monthMap = new Map();
        for (const lead of lostLeads) {
            const key = `${lead.updatedAt.getFullYear()}-${String(lead.updatedAt.getMonth() + 1).padStart(2, '0')}`;
            monthMap.set(key, (monthMap.get(key) || 0) + 1);
        }
        const months = Array.from(monthMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        const charts = [
            {
                type: 'PIE', title: 'Lost Reasons',
                labels: reasons.map(r => r[0]),
                datasets: [{ label: 'Leads', data: reasons.map(r => r[1]) }],
            },
            {
                type: 'BAR', title: 'Monthly Lost Leads',
                labels: months.map(m => m[0]),
                datasets: [{ label: 'Lost', data: months.map(m => m[1]) }],
            },
        ];
        const tableRows = allDead.map(lead => {
            const deadSince = lead.status === 'LOST' ? lead.updatedAt : lead.updatedAt;
            const recoverable = lead.status === 'ON_HOLD' ||
                (lead.lostReason ? !NON_RECOVERABLE_REASONS.includes(lead.lostReason) : true);
            return {
                leadNumber: lead.leadNumber,
                contact: lead.contact ? `${lead.contact.firstName} ${lead.contact.lastName}` : '',
                organization: lead.organization?.name || '',
                status: lead.status,
                lostReason: lead.lostReason || 'Not Specified',
                value: Number(lead.expectedValue || 0),
                deadSince,
                recoverable,
            };
        });
        const filtered = params.filters?.recoverable
            ? tableRows.filter(r => r.recoverable)
            : tableRows;
        const columns = [
            { key: 'leadNumber', header: 'Lead #', width: 18 },
            { key: 'contact', header: 'Contact', width: 22 },
            { key: 'organization', header: 'Organization', width: 25 },
            { key: 'status', header: 'Status', width: 12 },
            { key: 'lostReason', header: 'Lost Reason', width: 20 },
            { key: 'value', header: 'Value', width: 16, format: 'currency' },
            { key: 'deadSince', header: 'Dead Since', width: 15, format: 'date' },
            { key: 'recoverable', header: 'Recoverable', width: 12 },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Dead & Lost Leads', columns, rows: filtered }],
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.value === 'LOST') {
            where.status = 'LOST';
        }
        else if (params.value === 'ON_HOLD') {
            where.status = 'ON_HOLD';
            where.updatedAt = { lte: new Date(Date.now() - 30 * 86400000) };
        }
        else {
            where.status = { in: ['LOST', 'ON_HOLD'] };
        }
        const result = await this.drillDownService.getLeads(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.DeadLostLeadsReport = DeadLostLeadsReport;
exports.DeadLostLeadsReport = DeadLostLeadsReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], DeadLostLeadsReport);
//# sourceMappingURL=dead-lost-leads.report.js.map