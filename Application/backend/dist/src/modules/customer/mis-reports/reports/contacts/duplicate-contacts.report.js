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
exports.DuplicateContactsReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let DuplicateContactsReport = class DuplicateContactsReport {
    constructor(prisma) {
        this.prisma = prisma;
        this.code = 'DUPLICATE_CONTACTS';
        this.name = 'Duplicate Contacts';
        this.category = 'CONTACT_ORG';
        this.description = 'Identifies potential duplicate contacts by name matching and groups them by severity';
        this.supportsDrillDown = false;
        this.supportsPeriodComparison = false;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'severity', label: 'Severity', type: 'select', options: [
                    { value: 'exact', label: 'Exact Match' },
                    { value: 'likely', label: 'Likely Match' },
                    { value: 'possible', label: 'Possible Match' },
                ] },
            { key: 'isActive', label: 'Active Only', type: 'boolean', defaultValue: true },
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
                id: true, firstName: true, lastName: true, createdAt: true,
                organization: { select: { id: true, name: true } },
            },
        });
        const nameGroups = new Map();
        for (const contact of contacts) {
            const nameKey = `${contact.firstName.toLowerCase().trim()}|${contact.lastName.toLowerCase().trim()}`;
            if (!nameGroups.has(nameKey))
                nameGroups.set(nameKey, []);
            nameGroups.get(nameKey).push(contact);
        }
        const duplicateGroups = [...nameGroups.entries()]
            .filter(([, group]) => group.length >= 2)
            .map(([nameKey, group]) => {
            const severity = this.classifySeverity(group);
            return { nameKey, contacts: group, severity };
        });
        const filtered = params.filters?.severity
            ? duplicateGroups.filter(g => g.severity === params.filters.severity)
            : duplicateGroups;
        const severityCounts = { exact: 0, likely: 0, possible: 0 };
        duplicateGroups.forEach(g => severityCounts[g.severity]++);
        const totalDuplicateGroups = duplicateGroups.length;
        const exactMatches = severityCounts.exact;
        const totalAffectedContacts = duplicateGroups.reduce((s, g) => s + g.contacts.length, 0);
        const deduplicationPotential = totalAffectedContacts - totalDuplicateGroups;
        const summary = [
            { key: 'totalDuplicateGroups', label: 'Duplicate Groups', value: totalDuplicateGroups, format: 'number' },
            { key: 'exactMatches', label: 'Exact Matches', value: exactMatches, format: 'number' },
            { key: 'totalAffectedContacts', label: 'Affected Contacts', value: totalAffectedContacts, format: 'number' },
            { key: 'deduplicationPotential', label: 'Dedup Potential', value: deduplicationPotential, format: 'number' },
        ];
        const severityLabels = ['exact', 'likely', 'possible'];
        const charts = [
            {
                type: 'PIE', title: 'Duplicate Severity Distribution',
                labels: severityLabels,
                datasets: [{
                        label: 'Groups',
                        data: severityLabels.map(s => severityCounts[s]),
                        color: '#FF5722',
                    }],
            },
        ];
        const tableRows = [];
        for (const group of filtered) {
            const firstName = group.contacts[0].firstName;
            const lastName = group.contacts[0].lastName;
            const orgNames = [...new Set(group.contacts.map(c => c.organization?.name || 'No Org'))].join(', ');
            const dates = group.contacts.map(c => c.createdAt).sort((a, b) => a.getTime() - b.getTime());
            tableRows.push({
                name: `${firstName} ${lastName}`,
                count: group.contacts.length,
                organizations: orgNames,
                severity: group.severity,
                firstCreated: dates[0],
                lastCreated: dates[dates.length - 1],
            });
        }
        tableRows.sort((a, b) => {
            const order = { exact: 0, likely: 1, possible: 2 };
            return (order[a.severity] || 0) - (order[b.severity] || 0);
        });
        const tableColumns = [
            { key: 'name', header: 'Contact Name', width: 22 },
            { key: 'count', header: 'Duplicates', width: 12, format: 'number' },
            { key: 'organizations', header: 'Organizations', width: 30 },
            { key: 'severity', header: 'Severity', width: 12 },
            { key: 'firstCreated', header: 'First Created', width: 15, format: 'date' },
            { key: 'lastCreated', header: 'Last Created', width: 15, format: 'date' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Duplicate Contact Groups', columns: tableColumns, rows: tableRows }],
        };
    }
    classifySeverity(group) {
        const orgIds = group.map(c => c.organization?.id).filter(Boolean);
        const uniqueOrgs = new Set(orgIds);
        if (uniqueOrgs.size <= 1)
            return 'exact';
        if (uniqueOrgs.size < group.length)
            return 'likely';
        return 'possible';
    }
};
exports.DuplicateContactsReport = DuplicateContactsReport;
exports.DuplicateContactsReport = DuplicateContactsReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DuplicateContactsReport);
//# sourceMappingURL=duplicate-contacts.report.js.map