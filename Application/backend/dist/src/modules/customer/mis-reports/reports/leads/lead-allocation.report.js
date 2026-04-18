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
exports.LeadAllocationReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let LeadAllocationReport = class LeadAllocationReport {
    constructor(prisma, drillDownService) {
        this.prisma = prisma;
        this.drillDownService = drillDownService;
        this.code = 'LEAD_ALLOCATION';
        this.name = 'Lead Allocation Report';
        this.category = 'LEAD';
        this.description = 'Analyses lead distribution across team members with performance and workload metrics';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'status', label: 'Status', type: 'multi_select' },
            { key: 'allocatedTo', label: 'Allocated To', type: 'user' },
        ];
    }
    async generate(params) {
        const where = { tenantId: params.tenantId, createdAt: { gte: params.dateFrom, lte: params.dateTo } };
        const leads = await this.prisma.working.lead.findMany({
            where,
            select: {
                status: true, expectedValue: true, allocatedToId: true,
                allocatedTo: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        const activeStatuses = ['NEW', 'VERIFIED', 'ALLOCATED', 'IN_PROGRESS', 'DEMO_SCHEDULED', 'QUOTATION_SENT', 'NEGOTIATION', 'ON_HOLD'];
        const userMap = new Map();
        const unallocated = [];
        for (const lead of leads) {
            if (!lead.allocatedToId) {
                unallocated.push(lead);
                continue;
            }
            const uid = lead.allocatedToId;
            if (!userMap.has(uid)) {
                const name = lead.allocatedTo ? `${lead.allocatedTo.firstName} ${lead.allocatedTo.lastName}` : 'Unknown';
                userMap.set(uid, { userId: uid, userName: name, assigned: 0, active: 0, won: 0, lost: 0, totalValue: 0 });
            }
            const bucket = userMap.get(uid);
            bucket.assigned++;
            bucket.totalValue += Number(lead.expectedValue || 0);
            if (lead.status === 'WON')
                bucket.won++;
            else if (lead.status === 'LOST')
                bucket.lost++;
            if (activeStatuses.includes(lead.status))
                bucket.active++;
        }
        const users = Array.from(userMap.values()).sort((a, b) => b.assigned - a.assigned);
        const totalAllocated = users.reduce((s, u) => s + u.assigned, 0);
        const avgPerUser = users.length > 0 ? Math.round(totalAllocated / users.length) : 0;
        const topPerformer = users.reduce((best, u) => {
            const rate = u.assigned > 0 ? u.won / u.assigned : 0;
            const bestRate = best.assigned > 0 ? best.won / best.assigned : 0;
            return rate > bestRate ? u : best;
        }, users[0] || { userName: 'N/A', assigned: 0, won: 0 });
        const summary = [
            { key: 'totalAllocated', label: 'Total Allocated Leads', value: totalAllocated, format: 'number' },
            { key: 'unallocated', label: 'Unallocated Leads', value: unallocated.length, format: 'number' },
            { key: 'avgLeadsPerUser', label: 'Avg Leads per User', value: avgPerUser, format: 'number' },
            { key: 'topPerformer', label: 'Top Performer Conversion %', value: topPerformer?.assigned > 0
                    ? Math.round((topPerformer.won / topPerformer.assigned) * 10000) / 100 : 0, format: 'percent' },
        ];
        const charts = [
            {
                type: 'BAR', title: 'Leads per User',
                labels: users.map(u => u.userName),
                datasets: [
                    { label: 'Assigned', data: users.map(u => u.assigned), color: '#4A90D9' },
                    { label: 'Won', data: users.map(u => u.won), color: '#27AE60' },
                    { label: 'Lost', data: users.map(u => u.lost), color: '#E74C3C' },
                ],
            },
        ];
        const userRows = users.map(u => ({
            userName: u.userName, assigned: u.assigned, active: u.active,
            won: u.won, lost: u.lost,
            conversionRate: u.assigned > 0 ? Math.round((u.won / u.assigned) * 10000) / 100 : 0,
            avgValue: u.assigned > 0 ? Math.round(u.totalValue / u.assigned) : 0,
        }));
        const userColumns = [
            { key: 'userName', header: 'User', width: 22 },
            { key: 'assigned', header: 'Assigned', width: 10, format: 'number' },
            { key: 'active', header: 'Active', width: 10, format: 'number' },
            { key: 'won', header: 'Won', width: 10, format: 'number' },
            { key: 'lost', header: 'Lost', width: 10, format: 'number' },
            { key: 'conversionRate', header: 'Conversion %', width: 14, format: 'percent' },
            { key: 'avgValue', header: 'Avg Value', width: 16, format: 'currency' },
        ];
        const unallocRows = unallocated.slice(0, 20).map(l => ({
            leadNumber: l.leadNumber || '', status: l.status,
            value: Number(l.expectedValue || 0),
        }));
        const unallocColumns = [
            { key: 'leadNumber', header: 'Lead #', width: 18 },
            { key: 'status', header: 'Status', width: 14 },
            { key: 'value', header: 'Value', width: 18, format: 'currency' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [
                { title: 'Allocation by User', columns: userColumns, rows: userRows },
                { title: 'Unallocated Leads (Top 20)', columns: unallocColumns, rows: unallocRows },
            ],
            metadata: { topPerformer: topPerformer?.userName },
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.value === 'unallocated') {
            where.allocatedToId = null;
        }
        else {
            where.allocatedToId = params.value;
        }
        const result = await this.drillDownService.getLeads(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.LeadAllocationReport = LeadAllocationReport;
exports.LeadAllocationReport = LeadAllocationReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], LeadAllocationReport);
//# sourceMappingURL=lead-allocation.report.js.map