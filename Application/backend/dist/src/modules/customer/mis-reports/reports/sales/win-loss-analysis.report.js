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
exports.WinLossAnalysisReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
const cross_db_resolver_service_1 = require("../../../../../core/prisma/cross-db-resolver.service");
let WinLossAnalysisReport = class WinLossAnalysisReport {
    constructor(prisma, drillDownSvc, resolver) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.resolver = resolver;
        this.code = 'WIN_LOSS_ANALYSIS';
        this.name = 'Win/Loss Analysis';
        this.category = 'SALES';
        this.description = 'Detailed analysis of won vs lost deals by source, user, and lost reason';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'allocatedToId', label: 'Sales Rep', type: 'user' },
            { key: 'priority', label: 'Priority', type: 'select', options: [
                    { value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' },
                    { value: 'HIGH', label: 'High' }, { value: 'URGENT', label: 'Urgent' },
                ] },
            { key: 'outcome', label: 'Outcome', type: 'select', options: [
                    { value: 'WON', label: 'Won' }, { value: 'LOST', label: 'Lost' },
                ] },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId,
            status: { in: ['WON', 'LOST'] },
            updatedAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.userId)
            where.allocatedToId = params.userId;
        if (params.filters?.priority)
            where.priority = params.filters.priority;
        if (params.filters?.outcome)
            where.status = params.filters.outcome;
        const rawLeads = await this.prisma.working.lead.findMany({
            where,
            include: { filters: true },
        });
        const allFilters = rawLeads.flatMap(l => l.filters || []);
        const enrichedFilters = await this.resolver.resolveLookupValues(allFilters, 'lookupValueId', true);
        let filterIdx = 0;
        const leadsWithFilters = rawLeads.map(lead => {
            const count = (lead.filters || []).length;
            const resolved = enrichedFilters.slice(filterIdx, filterIdx + count);
            filterIdx += count;
            return { ...lead, filters: resolved };
        });
        const leads = await this.resolver.resolveUsers(leadsWithFilters, ['allocatedToId'], { id: true, firstName: true, lastName: true });
        const wonLeads = leads.filter(l => l.status === 'WON');
        const lostLeads = leads.filter(l => l.status === 'LOST');
        const totalDecided = leads.length;
        const won = wonLeads.length;
        const lost = lostLeads.length;
        const winRate = totalDecided > 0 ? Math.round((won / totalDecided) * 10000) / 100 : 0;
        const avgWonValue = won > 0
            ? Math.round(wonLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0) / won)
            : 0;
        const avgLostValue = lost > 0
            ? Math.round(lostLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0) / lost)
            : 0;
        const summary = [
            { key: 'totalDecided', label: 'Total Decided', value: totalDecided, format: 'number' },
            { key: 'won', label: 'Won', value: won, format: 'number' },
            { key: 'lost', label: 'Lost', value: lost, format: 'number' },
            { key: 'winRate', label: 'Win Rate', value: winRate, format: 'percent' },
            { key: 'avgWonValue', label: 'Avg Won Value', value: avgWonValue, format: 'currency' },
            { key: 'avgLostValue', label: 'Avg Lost Value', value: avgLostValue, format: 'currency' },
        ];
        const winLossPie = {
            type: 'PIE', title: 'Won vs Lost',
            labels: ['Won', 'Lost'],
            datasets: [{ label: 'Deals', data: [won, lost], color: '#4CAF50' }],
        };
        const reasonMap = new Map();
        lostLeads.forEach(l => {
            const reason = l.lostReason || 'Not Specified';
            reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
        });
        const reasonLabels = [...reasonMap.keys()].sort((a, b) => reasonMap.get(b) - reasonMap.get(a));
        const lostReasonsChart = {
            type: 'BAR', title: 'Lost Reasons',
            labels: reasonLabels,
            datasets: [{ label: 'Count', data: reasonLabels.map(r => reasonMap.get(r)), color: '#F44336' }],
        };
        const sourceMap = new Map();
        leads.forEach(l => {
            const sourceFilter = l.filters?.find((f) => f.lookupValue?.lookup?.category === 'LEAD_SOURCE');
            const source = sourceFilter?.lookupValue?.label || 'Unknown';
            const entry = sourceMap.get(source) || { won: 0, lost: 0 };
            if (l.status === 'WON')
                entry.won++;
            else
                entry.lost++;
            sourceMap.set(source, entry);
        });
        const sourceRows = [...sourceMap.entries()].map(([source, data]) => ({
            source,
            won: data.won,
            lost: data.lost,
            total: data.won + data.lost,
            winRate: data.won + data.lost > 0
                ? Math.round((data.won / (data.won + data.lost)) * 10000) / 100
                : 0,
        })).sort((a, b) => b.total - a.total);
        const sourceCols = [
            { key: 'source', header: 'Source', width: 20 },
            { key: 'won', header: 'Won', width: 10, format: 'number' },
            { key: 'lost', header: 'Lost', width: 10, format: 'number' },
            { key: 'total', header: 'Total', width: 10, format: 'number' },
            { key: 'winRate', header: 'Win Rate', width: 12, format: 'percent' },
        ];
        const userMap = new Map();
        leads.forEach(l => {
            const uid = l.allocatedToId || 'unassigned';
            const name = l.allocatedTo ? `${l.allocatedTo.firstName} ${l.allocatedTo.lastName}` : 'Unassigned';
            const entry = userMap.get(uid) || { name, won: 0, lost: 0 };
            if (l.status === 'WON')
                entry.won++;
            else
                entry.lost++;
            userMap.set(uid, entry);
        });
        const userRows = [...userMap.values()].map(u => ({
            userName: u.name,
            won: u.won,
            lost: u.lost,
            total: u.won + u.lost,
            winRate: u.won + u.lost > 0
                ? Math.round((u.won / (u.won + u.lost)) * 10000) / 100
                : 0,
        })).sort((a, b) => b.total - a.total);
        const userCols = [
            { key: 'userName', header: 'Sales Rep', width: 20 },
            { key: 'won', header: 'Won', width: 10, format: 'number' },
            { key: 'lost', header: 'Lost', width: 10, format: 'number' },
            { key: 'total', header: 'Total', width: 10, format: 'number' },
            { key: 'winRate', header: 'Win Rate', width: 12, format: 'percent' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary,
            charts: [winLossPie, lostReasonsChart],
            tables: [
                { title: 'Win/Loss by Source', columns: sourceCols, rows: sourceRows },
                { title: 'Win/Loss by Sales Rep', columns: userCols, rows: userRows },
            ],
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            updatedAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.dimension === 'status')
            where.status = params.value;
        const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.WinLossAnalysisReport = WinLossAnalysisReport;
exports.WinLossAnalysisReport = WinLossAnalysisReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService,
        cross_db_resolver_service_1.CrossDbResolverService])
], WinLossAnalysisReport);
//# sourceMappingURL=win-loss-analysis.report.js.map