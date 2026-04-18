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
exports.FollowUpComplianceReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let FollowUpComplianceReport = class FollowUpComplianceReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'FOLLOW_UP_COMPLIANCE';
        this.name = 'Follow-Up Compliance';
        this.category = 'ACTIVITY';
        this.description = 'Measures follow-up completion rates and identifies overdue activities per user';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'createdById', label: 'User', type: 'user' },
            { key: 'type', label: 'Activity Type', type: 'select', options: [
                    { value: 'CALL', label: 'Call' }, { value: 'EMAIL', label: 'Email' },
                    { value: 'MEETING', label: 'Meeting' }, { value: 'VISIT', label: 'Visit' },
                ] },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId,
            scheduledAt: { not: null, gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.userId)
            where.createdById = params.userId;
        if (params.filters?.type)
            where.type = params.filters.type;
        const activities = await this.prisma.working.activity.findMany({
            where,
            select: {
                id: true, subject: true, type: true,
                scheduledAt: true, completedAt: true, createdAt: true,
                createdByUser: { select: { id: true, firstName: true, lastName: true } },
                lead: { select: { leadNumber: true } },
            },
        });
        const now = new Date();
        const totalScheduled = activities.length;
        const completed = activities.filter(a => a.completedAt != null).length;
        const overdue = activities.filter(a => !a.completedAt && a.scheduledAt < now).length;
        const complianceRate = totalScheduled > 0
            ? Math.round((completed / totalScheduled) * 10000) / 100
            : 0;
        const userMap = new Map();
        activities.forEach(a => {
            const userId = a.createdByUser.id;
            const userName = `${a.createdByUser.firstName} ${a.createdByUser.lastName}`;
            if (!userMap.has(userId)) {
                userMap.set(userId, { name: userName, scheduled: 0, completed: 0, overdue: 0 });
            }
            const entry = userMap.get(userId);
            entry.scheduled++;
            if (a.completedAt)
                entry.completed++;
            else if (a.scheduledAt < now)
                entry.overdue++;
        });
        const userStats = [...userMap.entries()].map(([userId, data]) => ({
            userId,
            ...data,
            compliancePercent: data.scheduled > 0
                ? Math.round((data.completed / data.scheduled) * 10000) / 100
                : 0,
        }));
        userStats.sort((a, b) => b.compliancePercent - a.compliancePercent);
        const summary = [
            { key: 'totalScheduled', label: 'Total Scheduled', value: totalScheduled, format: 'number' },
            { key: 'completed', label: 'Completed', value: completed, format: 'number' },
            { key: 'overdue', label: 'Overdue', value: overdue, format: 'number' },
            { key: 'complianceRate', label: 'Compliance Rate', value: complianceRate, format: 'percent' },
        ];
        const charts = [
            {
                type: 'BAR', title: 'Compliance % by User',
                labels: userStats.map(u => u.name),
                datasets: [{ label: 'Compliance %', data: userStats.map(u => u.compliancePercent), color: '#4CAF50' }],
            },
        ];
        const complianceColumns = [
            { key: 'name', header: 'User', width: 22 },
            { key: 'scheduled', header: 'Scheduled', width: 12, format: 'number' },
            { key: 'completed', header: 'Completed', width: 12, format: 'number' },
            { key: 'overdue', header: 'Overdue', width: 12, format: 'number' },
            { key: 'compliancePercent', header: 'Compliance %', width: 14, format: 'percent' },
        ];
        const overdueActivities = activities
            .filter(a => !a.completedAt && a.scheduledAt < now)
            .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
            .slice(0, 20)
            .map(a => ({
            subject: a.subject,
            type: a.type,
            scheduledAt: a.scheduledAt,
            user: `${a.createdByUser.firstName} ${a.createdByUser.lastName}`,
            leadNumber: a.lead?.leadNumber || '',
            daysOverdue: Math.ceil((now.getTime() - a.scheduledAt.getTime()) / 86400000),
        }));
        const overdueColumns = [
            { key: 'subject', header: 'Subject', width: 25 },
            { key: 'type', header: 'Type', width: 12 },
            { key: 'scheduledAt', header: 'Scheduled', width: 15, format: 'date' },
            { key: 'user', header: 'User', width: 20 },
            { key: 'leadNumber', header: 'Lead #', width: 16 },
            { key: 'daysOverdue', header: 'Days Overdue', width: 14, format: 'number' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [
                { title: 'User Compliance', columns: complianceColumns, rows: userStats },
                { title: 'Overdue Activities (Top 20)', columns: overdueColumns, rows: overdueActivities },
            ],
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            scheduledAt: { not: null, gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.dimension === 'user')
            where.createdById = params.value;
        const result = await this.drillDownSvc.getActivities(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.FollowUpComplianceReport = FollowUpComplianceReport;
exports.FollowUpComplianceReport = FollowUpComplianceReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], FollowUpComplianceReport);
//# sourceMappingURL=follow-up-compliance.report.js.map