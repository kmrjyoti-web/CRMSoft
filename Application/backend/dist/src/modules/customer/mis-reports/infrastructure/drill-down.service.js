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
exports.DrillDownService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let DrillDownService = class DrillDownService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLeads(where, page, limit, columns) {
        const skip = (page - 1) * limit;
        const [records, total] = await Promise.all([
            this.prisma.working.lead.findMany({
                where,
                include: {
                    contact: { select: { firstName: true, lastName: true } },
                    organization: { select: { name: true } },
                    allocatedTo: { select: { firstName: true, lastName: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.working.lead.count({ where }),
        ]);
        const cols = columns || [
            { key: 'leadNumber', header: 'Lead #', width: 18 },
            { key: 'contactName', header: 'Contact', width: 22 },
            { key: 'organization', header: 'Organization', width: 25 },
            { key: 'status', header: 'Status', width: 14 },
            { key: 'expectedValue', header: 'Expected Value', width: 18, format: 'currency' },
            { key: 'allocatedTo', header: 'Allocated To', width: 20 },
            { key: 'createdAt', header: 'Created', width: 15, format: 'date' },
        ];
        const rows = records.map(l => ({
            leadNumber: l.leadNumber,
            contactName: l.contact ? `${l.contact.firstName} ${l.contact.lastName}` : '',
            organization: l.organization?.name || '',
            status: l.status,
            expectedValue: Number(l.expectedValue || 0),
            allocatedTo: l.allocatedTo ? `${l.allocatedTo.firstName} ${l.allocatedTo.lastName}` : 'Unassigned',
            createdAt: l.createdAt,
        }));
        return { dimension: '', value: '', columns: cols, rows, total, page, limit };
    }
    async getActivities(where, page, limit) {
        const skip = (page - 1) * limit;
        const [records, total] = await Promise.all([
            this.prisma.working.activity.findMany({
                where,
                include: {
                    lead: { select: { leadNumber: true } },
                    createdByUser: { select: { firstName: true, lastName: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.working.activity.count({ where }),
        ]);
        const columns = [
            { key: 'date', header: 'Date', width: 15, format: 'date' },
            { key: 'type', header: 'Type', width: 14 },
            { key: 'subject', header: 'Subject', width: 30 },
            { key: 'outcome', header: 'Outcome', width: 20 },
            { key: 'leadNumber', header: 'Lead #', width: 18 },
            { key: 'performedBy', header: 'Performed By', width: 20 },
        ];
        const rows = records.map(a => ({
            date: a.createdAt,
            type: a.type,
            subject: a.subject,
            outcome: a.outcome || '',
            leadNumber: a.lead?.leadNumber || '',
            performedBy: `${a.createdByUser.firstName} ${a.createdByUser.lastName}`,
        }));
        return { dimension: '', value: '', columns, rows, total, page, limit };
    }
    async getDemos(where, page, limit) {
        const skip = (page - 1) * limit;
        const [records, total] = await Promise.all([
            this.prisma.working.demo.findMany({
                where,
                include: {
                    lead: { select: { leadNumber: true } },
                    conductedBy: { select: { firstName: true, lastName: true } },
                },
                orderBy: { scheduledAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.working.demo.count({ where }),
        ]);
        const columns = [
            { key: 'scheduledAt', header: 'Scheduled', width: 18, format: 'date' },
            { key: 'status', header: 'Status', width: 14 },
            { key: 'leadNumber', header: 'Lead #', width: 18 },
            { key: 'conductedBy', header: 'Conducted By', width: 20 },
            { key: 'outcome', header: 'Outcome', width: 20 },
        ];
        const rows = records.map(d => ({
            scheduledAt: d.scheduledAt,
            status: d.status,
            leadNumber: d.lead?.leadNumber || '',
            conductedBy: d.conductedBy ? `${d.conductedBy.firstName} ${d.conductedBy.lastName}` : '',
            outcome: d.outcome || '',
        }));
        return { dimension: '', value: '', columns, rows, total, page, limit };
    }
    async getContacts(where, page, limit) {
        const skip = (page - 1) * limit;
        const [records, total] = await Promise.all([
            this.prisma.working.contact.findMany({
                where,
                include: { organization: { select: { name: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.working.contact.count({ where }),
        ]);
        const columns = [
            { key: 'name', header: 'Name', width: 22 },
            { key: 'designation', header: 'Designation', width: 20 },
            { key: 'department', header: 'Department', width: 20 },
            { key: 'organization', header: 'Organization', width: 25 },
            { key: 'createdAt', header: 'Created', width: 15, format: 'date' },
        ];
        const rows = records.map(c => ({
            name: `${c.firstName} ${c.lastName}`,
            designation: c.designation || '',
            department: c.department || '',
            organization: c.organization?.name || '',
            createdAt: c.createdAt,
        }));
        return { dimension: '', value: '', columns, rows, total, page, limit };
    }
};
exports.DrillDownService = DrillDownService;
exports.DrillDownService = DrillDownService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DrillDownService);
//# sourceMappingURL=drill-down.service.js.map