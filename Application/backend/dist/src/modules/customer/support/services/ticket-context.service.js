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
exports.TicketContextService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let TicketContextService = class TicketContextService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async captureContext(userId, tenantId, userAgent, referer) {
        const recentErrors = await this.prisma.errorLog.findMany({
            where: {
                tenantId,
                userId,
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                errorCode: true,
                message: true,
                severity: true,
                path: true,
                createdAt: true,
            },
        });
        let lastActions = [];
        try {
            const recentAuditLogs = await this.prisma.tenantAuditLog.findMany({
                where: {
                    tenantId,
                    userId,
                    createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { description: true },
            });
            lastActions = recentAuditLogs.map((a) => a.description);
        }
        catch {
        }
        let tenantPlan;
        let industryCode;
        try {
            const tenant = await this.prisma.tenant.findUnique({
                where: { id: tenantId },
                select: { industryCode: true, name: true },
            });
            industryCode = tenant?.industryCode || undefined;
        }
        catch {
        }
        return {
            browserInfo: userAgent,
            currentPageUrl: referer,
            appVersion: process.env.npm_package_version || '1.0.0',
            tenantPlan,
            industryCode,
            recentErrors,
            lastActions,
            capturedAt: new Date().toISOString(),
        };
    }
};
exports.TicketContextService = TicketContextService;
exports.TicketContextService = TicketContextService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketContextService);
//# sourceMappingURL=ticket-context.service.js.map