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
var SlaAlertsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlaAlertsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let SlaAlertsService = SlaAlertsService_1 = class SlaAlertsService {
    prisma;
    audit;
    logger = new common_1.Logger(SlaAlertsService_1.name);
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async checkSlaBreaches() {
        const now = new Date();
        const breached = await this.prisma.partnerDevRequest.findMany({
            where: {
                dueDate: { lt: now },
                status: { notIn: ['DELIVERED', 'ACCEPTED', 'REJECTED'] },
            },
            include: { partner: { select: { companyName: true, email: true } } },
        });
        for (const req of breached) {
            const alreadyAlerted = await this.prisma.slaAlert.findUnique({
                where: { requestId_alertType: { requestId: req.id, alertType: 'BREACH' } },
            });
            if (alreadyAlerted)
                continue;
            await this.prisma.slaAlert.create({
                data: {
                    requestId: req.id,
                    alertType: 'BREACH',
                    metadata: {
                        partnerId: req.partnerId,
                        partnerName: req.partner.companyName,
                        title: req.title,
                        dueDate: req.dueDate,
                        status: req.status,
                    },
                },
            });
            await this.audit.log({
                partnerId: req.partnerId,
                action: 'SLA_BREACH_DETECTED',
                performedBy: 'system',
                performedByRole: 'SYSTEM',
                details: { requestId: req.id, title: req.title, dueDate: req.dueDate },
            });
            this.logger.warn(`SLA breach: request "${req.title}" (${req.id}) for partner ${req.partner.companyName}`);
        }
        if (breached.length > 0) {
            this.logger.log(`SLA breach check complete: ${breached.length} breached requests found`);
        }
    }
    async checkUpcomingBreaches() {
        const now = new Date();
        const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const upcoming = await this.prisma.partnerDevRequest.findMany({
            where: {
                dueDate: { gte: now, lte: in24h },
                status: { notIn: ['DELIVERED', 'ACCEPTED', 'REJECTED'] },
            },
            include: { partner: { select: { companyName: true } } },
        });
        for (const req of upcoming) {
            const alreadyAlerted = await this.prisma.slaAlert.findUnique({
                where: { requestId_alertType: { requestId: req.id, alertType: 'WARNING_24H' } },
            });
            if (alreadyAlerted)
                continue;
            await this.prisma.slaAlert.create({
                data: {
                    requestId: req.id,
                    alertType: 'WARNING_24H',
                    metadata: {
                        partnerId: req.partnerId,
                        partnerName: req.partner.companyName,
                        title: req.title,
                        dueDate: req.dueDate,
                    },
                },
            });
            this.logger.log(`24h SLA warning: "${req.title}" due at ${req.dueDate?.toISOString()}`);
        }
    }
    async checkPaymentOverdue() {
        const now = new Date();
        const overdueInvoices = await this.prisma.partnerInvoice.findMany({
            where: {
                dueDate: { lt: now },
                status: 'SENT',
            },
            include: { partner: { select: { companyName: true } } },
        });
        for (const invoice of overdueInvoices) {
            await this.prisma.partnerInvoice.update({
                where: { id: invoice.id },
                data: { status: 'OVERDUE' },
            });
            const alreadyAlerted = await this.prisma.slaAlert.findUnique({
                where: { requestId_alertType: { requestId: invoice.id, alertType: 'PAYMENT_OVERDUE' } },
            });
            if (!alreadyAlerted) {
                await this.prisma.slaAlert.create({
                    data: {
                        requestId: invoice.id,
                        alertType: 'PAYMENT_OVERDUE',
                        metadata: {
                            partnerId: invoice.partnerId,
                            partnerName: invoice.partner.companyName,
                            invoiceNumber: invoice.invoiceNumber,
                            totalAmount: Number(invoice.totalAmount),
                            dueDate: invoice.dueDate,
                        },
                    },
                });
                await this.audit.log({
                    partnerId: invoice.partnerId,
                    action: 'INVOICE_OVERDUE',
                    performedBy: 'system',
                    performedByRole: 'SYSTEM',
                    details: { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber },
                });
                this.logger.warn(`Invoice overdue: ${invoice.invoiceNumber} for ${invoice.partner.companyName}`);
            }
        }
    }
    async getAlertHistory(params) {
        const { page = 1, limit = 20, alertType } = params;
        const where = {};
        if (alertType)
            where.alertType = alertType;
        const [data, total] = await Promise.all([
            this.prisma.slaAlert.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { sentAt: 'desc' },
            }),
            this.prisma.slaAlert.count({ where }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getDashboard() {
        const now = new Date();
        const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const [totalBreaches, warnings24h, overdueInvoices, overdueRequests, recentAlerts] = await Promise.all([
            this.prisma.slaAlert.count({ where: { alertType: 'BREACH' } }),
            this.prisma.slaAlert.count({ where: { alertType: 'WARNING_24H' } }),
            this.prisma.slaAlert.count({ where: { alertType: 'PAYMENT_OVERDUE' } }),
            this.prisma.partnerDevRequest.count({
                where: { dueDate: { lt: now }, status: { notIn: ['DELIVERED', 'ACCEPTED', 'REJECTED'] } },
            }),
            this.prisma.slaAlert.findMany({
                take: 10,
                orderBy: { sentAt: 'desc' },
            }),
        ]);
        const upcomingCount = await this.prisma.partnerDevRequest.count({
            where: { dueDate: { gte: now, lte: in24h }, status: { notIn: ['DELIVERED', 'ACCEPTED', 'REJECTED'] } },
        });
        return {
            totalBreaches,
            warnings24h,
            overdueInvoices,
            overdueRequests,
            upcomingIn24h: upcomingCount,
            recentAlerts,
        };
    }
};
exports.SlaAlertsService = SlaAlertsService;
exports.SlaAlertsService = SlaAlertsService = SlaAlertsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], SlaAlertsService);
//# sourceMappingURL=sla-alerts.service.js.map