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
exports.ErrorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const client_1 = require("@prisma/client");
let ErrorsService = class ErrorsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async collectErrors(partnerId, errors) {
        const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
        if (!partner)
            throw new common_1.NotFoundException('Partner not found');
        const created = await Promise.all(errors.map((e) => this.prisma.partnerErrorLog.create({
            data: {
                partnerId,
                ...e,
                isReportedToMaster: e.severity === client_1.ErrorSeverity.CRITICAL,
            },
        })));
        const criticals = created.filter((e) => e.severity === client_1.ErrorSeverity.CRITICAL);
        if (criticals.length > 0) {
            await this.audit.log({
                partnerId,
                action: 'CRITICAL_ERRORS_COLLECTED',
                performedBy: 'system',
                performedByRole: 'MASTER_ADMIN',
                details: { count: criticals.length },
            });
        }
        return { collected: created.length, critical: criticals.length };
    }
    async getPartnerErrors(partnerId, params) {
        const { page = 1, limit = 20, severity } = params;
        const skip = (page - 1) * limit;
        const where = { partnerId };
        if (severity)
            where.severity = severity;
        const [data, total] = await Promise.all([
            this.prisma.partnerErrorLog.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
            this.prisma.partnerErrorLog.count({ where }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getErrorDashboard(partnerId) {
        const where = partnerId ? { partnerId } : {};
        const [bySeverity, unresolved, critical, recentErrors] = await Promise.all([
            this.prisma.partnerErrorLog.groupBy({
                by: ['severity'],
                where,
                _count: { id: true },
            }),
            this.prisma.partnerErrorLog.count({ where: { ...where, resolvedAt: null } }),
            this.prisma.partnerErrorLog.count({ where: { ...where, severity: 'CRITICAL' } }),
            this.prisma.partnerErrorLog.findMany({ where, take: 10, orderBy: { createdAt: 'desc' } }),
        ]);
        return {
            bySeverity: bySeverity.map((g) => ({ severity: g.severity, count: g._count.id })),
            unresolved,
            critical,
            recentErrors,
        };
    }
    async resolveError(errorId, resolution) {
        const error = await this.prisma.partnerErrorLog.findUnique({ where: { id: errorId } });
        if (!error)
            throw new common_1.NotFoundException('Error not found');
        return this.prisma.partnerErrorLog.update({
            where: { id: errorId },
            data: { resolvedAt: new Date(), resolvedBy: 'admin', resolution },
        });
    }
};
exports.ErrorsService = ErrorsService;
exports.ErrorsService = ErrorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], ErrorsService);
//# sourceMappingURL=errors.service.js.map