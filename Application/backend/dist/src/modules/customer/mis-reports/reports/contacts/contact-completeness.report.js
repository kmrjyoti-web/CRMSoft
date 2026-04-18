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
exports.ContactCompletenessReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let ContactCompletenessReport = class ContactCompletenessReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'CONTACT_COMPLETENESS';
        this.name = 'Contact Completeness';
        this.category = 'CONTACT_ORG';
        this.description = 'Scores each contact on data completeness and groups them into quality tiers';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = false;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'isActive', label: 'Active Only', type: 'boolean', defaultValue: true },
            { key: 'tier', label: 'Quality Tier', type: 'select', options: [
                    { value: 'Complete', label: 'Complete (80-100)' },
                    { value: 'Good', label: 'Good (60-79)' },
                    { value: 'Partial', label: 'Partial (40-59)' },
                    { value: 'Poor', label: 'Poor (0-39)' },
                ] },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.filters?.isActive !== undefined)
            where.isActive = params.filters.isActive;
        const contacts = await this.prisma.working.contact.findMany({
            where,
            select: {
                id: true, firstName: true, lastName: true,
                designation: true, department: true, notes: true,
                organization: { select: { name: true } },
            },
        });
        const scored = contacts.map(c => {
            let score = 0;
            if (c.firstName)
                score += 20;
            if (c.organization)
                score += 20;
            if (c.designation)
                score += 20;
            if (c.department)
                score += 20;
            if (c.notes)
                score += 20;
            return {
                id: c.id,
                name: `${c.firstName} ${c.lastName}`,
                organization: c.organization?.name || '',
                score,
                tier: this.getTier(score),
            };
        });
        const tierCounts = { Complete: 0, Good: 0, Partial: 0, Poor: 0 };
        scored.forEach(s => tierCounts[s.tier]++);
        const totalContacts = scored.length;
        const avgScore = totalContacts > 0
            ? Math.round(scored.reduce((sum, s) => sum + s.score, 0) / totalContacts)
            : 0;
        const summary = [
            { key: 'avgScore', label: 'Average Score', value: avgScore, format: 'number' },
            { key: 'completeCount', label: 'Complete Contacts', value: tierCounts.Complete, format: 'number' },
            { key: 'poorCount', label: 'Poor Contacts', value: tierCounts.Poor, format: 'number' },
            { key: 'totalContacts', label: 'Total Contacts', value: totalContacts, format: 'number' },
        ];
        const tierLabels = ['Complete', 'Good', 'Partial', 'Poor'];
        const charts = [
            {
                type: 'PIE', title: 'Quality Tier Distribution',
                labels: tierLabels,
                datasets: [{
                        label: 'Contacts',
                        data: tierLabels.map(t => tierCounts[t]),
                        color: '#FF9800',
                    }],
            },
        ];
        const bottom20 = [...scored].sort((a, b) => a.score - b.score).slice(0, 20);
        const tableColumns = [
            { key: 'name', header: 'Name', width: 22 },
            { key: 'organization', header: 'Organization', width: 25 },
            { key: 'score', header: 'Score', width: 10, format: 'number' },
            { key: 'tier', header: 'Tier', width: 12 },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Bottom 20 Contacts by Score', columns: tableColumns, rows: bottom20 }],
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        const contacts = await this.prisma.working.contact.findMany({
            where,
            select: {
                id: true, firstName: true, lastName: true,
                designation: true, department: true, notes: true,
                organization: { select: { name: true } },
                createdAt: true,
            },
        });
        const filtered = contacts.filter(c => {
            let score = 0;
            if (c.firstName)
                score += 20;
            if (c.organization)
                score += 20;
            if (c.designation)
                score += 20;
            if (c.department)
                score += 20;
            if (c.notes)
                score += 20;
            return this.getTier(score) === params.value;
        });
        const total = filtered.length;
        const page = params.page;
        const limit = params.limit;
        const start = (page - 1) * limit;
        const paged = filtered.slice(start, start + limit);
        const columns = [
            { key: 'name', header: 'Name', width: 22 },
            { key: 'designation', header: 'Designation', width: 20 },
            { key: 'department', header: 'Department', width: 20 },
            { key: 'organization', header: 'Organization', width: 25 },
            { key: 'score', header: 'Score', width: 10, format: 'number' },
            { key: 'createdAt', header: 'Created', width: 15, format: 'date' },
        ];
        const rows = paged.map(c => {
            let score = 0;
            if (c.firstName)
                score += 20;
            if (c.organization)
                score += 20;
            if (c.designation)
                score += 20;
            if (c.department)
                score += 20;
            if (c.notes)
                score += 20;
            return {
                name: `${c.firstName} ${c.lastName}`,
                designation: c.designation || '',
                department: c.department || '',
                organization: c.organization?.name || '',
                score,
                createdAt: c.createdAt,
            };
        });
        return { dimension: params.dimension, value: params.value, columns, rows, total, page, limit };
    }
    getTier(score) {
        if (score >= 80)
            return 'Complete';
        if (score >= 60)
            return 'Good';
        if (score >= 40)
            return 'Partial';
        return 'Poor';
    }
};
exports.ContactCompletenessReport = ContactCompletenessReport;
exports.ContactCompletenessReport = ContactCompletenessReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], ContactCompletenessReport);
//# sourceMappingURL=contact-completeness.report.js.map