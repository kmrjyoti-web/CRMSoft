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
var GetContactsDashboardHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetContactsDashboardHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_contacts_dashboard_query_1 = require("./get-contacts-dashboard.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetContactsDashboardHandler = GetContactsDashboardHandler_1 = class GetContactsDashboardHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetContactsDashboardHandler_1.name);
    }
    async execute(query) {
        try {
            const { tenantId, dateFrom, dateTo } = query;
            const dateFilter = {};
            if (dateFrom)
                dateFilter.gte = new Date(dateFrom);
            if (dateTo)
                dateFilter.lte = new Date(dateTo + 'T23:59:59.999Z');
            const baseWhere = { tenantId, isDeleted: false };
            const dateWhere = dateFrom || dateTo
                ? { ...baseWhere, createdAt: dateFilter }
                : baseWhere;
            const [totalContacts, activeContacts, inactiveContacts, verifiedContacts, totalOrganizations, verifiedOrganizations, totalCustomers,] = await Promise.all([
                this.prisma.working.contact.count({ where: dateWhere }),
                this.prisma.working.contact.count({ where: { ...dateWhere, isActive: true } }),
                this.prisma.working.contact.count({ where: { ...dateWhere, isActive: false } }),
                this.prisma.working.contact.count({ where: { ...dateWhere, entityVerificationStatus: 'VERIFIED' } }),
                this.prisma.working.organization.count({ where: { tenantId, isDeleted: false } }),
                this.prisma.working.organization.count({ where: { tenantId, isDeleted: false, entityVerificationStatus: 'VERIFIED' } }),
                this.prisma.working.contact.count({ where: { ...dateWhere, isActive: true, entityVerificationStatus: 'VERIFIED' } }),
            ]);
            const notVerifiedContacts = totalContacts - verifiedContacts;
            const industryGroups = await this.prisma.working.organization.groupBy({
                by: ['industry'],
                where: { tenantId, isDeleted: false, industry: { not: null } },
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 10,
            });
            const industryTotal = industryGroups.reduce((s, g) => s + g._count.id, 0) || 1;
            const industryWise = industryGroups.map((g) => ({
                industry: g.industry || 'Unknown',
                count: g._count.id,
                percentage: Math.round((g._count.id / industryTotal) * 100),
            }));
            const sourceGroups = await this.prisma.working.rawContact.groupBy({
                by: ['source'],
                where: { tenantId, isDeleted: false },
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
            });
            const sourceTotal = sourceGroups.reduce((s, g) => s + g._count.id, 0) || 1;
            const sourceWise = sourceGroups.map((g) => ({
                source: g.source || 'MANUAL',
                count: g._count.id,
                percentage: Math.round((g._count.id / sourceTotal) * 100),
            }));
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            const trendContacts = await this.prisma.working.contact.findMany({
                where: { tenantId, isDeleted: false, createdAt: { gte: sixMonthsAgo } },
                select: { createdAt: true, entityVerificationStatus: true },
            });
            const trendMap = {};
            for (const c of trendContacts) {
                const key = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, '0')}`;
                if (!trendMap[key])
                    trendMap[key] = { verified: 0, unverified: 0 };
                if (c.entityVerificationStatus === 'VERIFIED')
                    trendMap[key].verified++;
                else
                    trendMap[key].unverified++;
            }
            const verificationTrend = Object.entries(trendMap)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([period, counts]) => ({ period, ...counts }));
            const deptGroups = await this.prisma.working.contact.groupBy({
                by: ['department'],
                where: { ...dateWhere, department: { not: null } },
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 10,
            });
            const departmentWise = deptGroups.map((g) => ({
                department: g.department || 'Unknown',
                count: g._count.id,
            }));
            const recentRaw = await this.prisma.working.contact.findMany({
                where: { tenantId, isDeleted: false },
                select: {
                    id: true, firstName: true, lastName: true,
                    designation: true, department: true,
                    entityVerificationStatus: true, isActive: true, createdAt: true,
                    organization: { select: { id: true, name: true } },
                    communications: {
                        where: { isDeleted: false },
                        take: 2,
                        select: { type: true, value: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });
            const recentContacts = recentRaw.map((c) => {
                const email = c.communications.find((cm) => cm.type === 'EMAIL')?.value || null;
                const phone = c.communications.find((cm) => cm.type === 'PHONE' || cm.type === 'MOBILE')?.value || null;
                return {
                    id: c.id,
                    firstName: c.firstName,
                    lastName: c.lastName,
                    fullName: `${c.firstName} ${c.lastName}`.trim(),
                    designation: c.designation || null,
                    department: c.department || null,
                    email,
                    phone,
                    organizationId: c.organization?.id || null,
                    organizationName: c.organization?.name || null,
                    entityVerificationStatus: c.entityVerificationStatus,
                    isActive: c.isActive,
                    createdAt: c.createdAt,
                };
            });
            return {
                stats: {
                    totalContacts, activeContacts, inactiveContacts,
                    verifiedContacts, notVerifiedContacts,
                    totalOrganizations, verifiedOrganizations, totalCustomers,
                },
                industryWise,
                sourceWise,
                verificationTrend,
                departmentWise,
                recentContacts,
            };
        }
        catch (error) {
            this.logger.error(`GetContactsDashboardHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetContactsDashboardHandler = GetContactsDashboardHandler;
exports.GetContactsDashboardHandler = GetContactsDashboardHandler = GetContactsDashboardHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_contacts_dashboard_query_1.GetContactsDashboardQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetContactsDashboardHandler);
//# sourceMappingURL=get-contacts-dashboard.handler.js.map