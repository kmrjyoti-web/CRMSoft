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
var LeadAutoExpireHandler_1, QuotationExpiryHandler_1, RecalcSalesTargetsHandler_1, ProcessRemindersHandler_1, CheckOverdueFollowUpsHandler_1, GenerateRecurrencesHandler_1, CheckSlaBreachesHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckSlaBreachesHandler = exports.GenerateRecurrencesHandler = exports.CheckOverdueFollowUpsHandler = exports.ProcessRemindersHandler = exports.RecalcSalesTargetsHandler = exports.QuotationExpiryHandler = exports.LeadAutoExpireHandler = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let LeadAutoExpireHandler = LeadAutoExpireHandler_1 = class LeadAutoExpireHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'LEAD_AUTO_EXPIRE';
        this.logger = new common_1.Logger(LeadAutoExpireHandler_1.name);
    }
    async execute(params) {
        try {
            const expiryDays = params.expiryDays ?? 90;
            const cutoff = new Date(Date.now() - expiryDays * 86400000);
            const result = await this.prisma.working.lead.updateMany({
                where: {
                    status: { in: ['NEW', 'VERIFIED', 'ALLOCATED', 'IN_PROGRESS'] },
                    updatedAt: { lt: cutoff },
                },
                data: { status: 'LOST' },
            });
            return { recordsProcessed: result.count };
        }
        catch (error) {
            const err = error;
            this.logger.error(`LeadAutoExpireHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.LeadAutoExpireHandler = LeadAutoExpireHandler;
exports.LeadAutoExpireHandler = LeadAutoExpireHandler = LeadAutoExpireHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadAutoExpireHandler);
let QuotationExpiryHandler = QuotationExpiryHandler_1 = class QuotationExpiryHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'QUOTATION_EXPIRY';
        this.logger = new common_1.Logger(QuotationExpiryHandler_1.name);
    }
    async execute() {
        try {
            const now = new Date();
            const result = await this.prisma.working.quotation.updateMany({
                where: {
                    status: { in: ['SENT', 'VIEWED', 'NEGOTIATION'] },
                    validUntil: { lt: now },
                },
                data: { status: 'EXPIRED' },
            });
            return { recordsProcessed: result.count };
        }
        catch (error) {
            const err = error;
            this.logger.error(`QuotationExpiryHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.QuotationExpiryHandler = QuotationExpiryHandler;
exports.QuotationExpiryHandler = QuotationExpiryHandler = QuotationExpiryHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuotationExpiryHandler);
let RecalcSalesTargetsHandler = RecalcSalesTargetsHandler_1 = class RecalcSalesTargetsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'RECALC_SALES_TARGETS';
        this.logger = new common_1.Logger(RecalcSalesTargetsHandler_1.name);
    }
    async execute() {
        try {
            const targets = await this.prisma.working.salesTarget.findMany({
                where: { periodEnd: { gte: new Date() } },
            });
            for (const target of targets) {
                const wonLeads = await this.prisma.working.lead.aggregate({
                    where: {
                        allocatedToId: target.userId,
                        status: 'WON',
                        updatedAt: { gte: target.periodStart, lte: target.periodEnd },
                    },
                    _sum: { expectedValue: true },
                });
                const achieved = wonLeads._sum?.expectedValue?.toNumber() ?? 0;
                await this.prisma.working.salesTarget.update({
                    where: { id: target.id },
                    data: {
                        currentValue: achieved,
                        achievedPercent: target.targetValue.toNumber() > 0
                            ? (achieved / target.targetValue.toNumber()) * 100 : 0,
                    },
                });
            }
            return { recordsProcessed: targets.length, recordsSucceeded: targets.length };
        }
        catch (error) {
            const err = error;
            this.logger.error(`RecalcSalesTargetsHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.RecalcSalesTargetsHandler = RecalcSalesTargetsHandler;
exports.RecalcSalesTargetsHandler = RecalcSalesTargetsHandler = RecalcSalesTargetsHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecalcSalesTargetsHandler);
let ProcessRemindersHandler = ProcessRemindersHandler_1 = class ProcessRemindersHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'PROCESS_REMINDERS';
        this.logger = new common_1.Logger(ProcessRemindersHandler_1.name);
    }
    async execute() {
        try {
            const now = new Date();
            const due = await this.prisma.working.reminder.findMany({
                where: { scheduledAt: { lte: now }, isSent: false, isActive: true },
            });
            for (const r of due) {
                await this.prisma.working.reminder.update({
                    where: { id: r.id },
                    data: { isSent: true, sentAt: now },
                });
            }
            return { recordsProcessed: due.length, recordsSucceeded: due.length };
        }
        catch (error) {
            const err = error;
            this.logger.error(`ProcessRemindersHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.ProcessRemindersHandler = ProcessRemindersHandler;
exports.ProcessRemindersHandler = ProcessRemindersHandler = ProcessRemindersHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProcessRemindersHandler);
let CheckOverdueFollowUpsHandler = CheckOverdueFollowUpsHandler_1 = class CheckOverdueFollowUpsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'CHECK_OVERDUE_FOLLOWUPS';
        this.logger = new common_1.Logger(CheckOverdueFollowUpsHandler_1.name);
    }
    async execute() {
        try {
            const now = new Date();
            const result = await this.prisma.working.followUp.updateMany({
                where: { dueDate: { lt: now }, isOverdue: false, isActive: true, completedAt: null },
                data: { isOverdue: true },
            });
            return { recordsProcessed: result.count };
        }
        catch (error) {
            const err = error;
            this.logger.error(`CheckOverdueFollowUpsHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.CheckOverdueFollowUpsHandler = CheckOverdueFollowUpsHandler;
exports.CheckOverdueFollowUpsHandler = CheckOverdueFollowUpsHandler = CheckOverdueFollowUpsHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CheckOverdueFollowUpsHandler);
let GenerateRecurrencesHandler = GenerateRecurrencesHandler_1 = class GenerateRecurrencesHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'GENERATE_RECURRENCES';
        this.logger = new common_1.Logger(GenerateRecurrencesHandler_1.name);
    }
    async execute() {
        try {
            const events = await this.prisma.working.recurringEvent.findMany({
                where: { isActive: true },
            });
            return { recordsProcessed: events.length };
        }
        catch (error) {
            const err = error;
            this.logger.error(`GenerateRecurrencesHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.GenerateRecurrencesHandler = GenerateRecurrencesHandler;
exports.GenerateRecurrencesHandler = GenerateRecurrencesHandler = GenerateRecurrencesHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GenerateRecurrencesHandler);
let CheckSlaBreachesHandler = CheckSlaBreachesHandler_1 = class CheckSlaBreachesHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'CHECK_SLA_BREACHES';
        this.logger = new common_1.Logger(CheckSlaBreachesHandler_1.name);
    }
    async execute() {
        try {
            const instances = await this.prisma.working.workflowInstance.findMany({
                where: { isActive: true, completedAt: null },
                include: { currentState: true },
            });
            let breached = 0;
            for (const instance of instances) {
                const metadata = instance.currentState?.metadata;
                if (!metadata?.slaHours)
                    continue;
                const slaHours = Number(metadata.slaHours);
                const hoursInState = (Date.now() - new Date(instance.updatedAt).getTime()) / (1000 * 60 * 60);
                if (hoursInState <= slaHours)
                    continue;
                const escalationLevel = Math.min(Math.floor(hoursInState / slaHours), 3);
                const exists = await this.prisma.working.workflowSlaEscalation.findFirst({
                    where: { instanceId: instance.id, stateId: instance.currentStateId, escalationLevel, isResolved: false },
                });
                if (!exists) {
                    await this.prisma.working.workflowSlaEscalation.create({
                        data: { instanceId: instance.id, stateId: instance.currentStateId, slaHours, escalationLevel },
                    });
                    breached++;
                }
            }
            return { recordsProcessed: instances.length, recordsSucceeded: breached };
        }
        catch (error) {
            const err = error;
            this.logger.error(`CheckSlaBreachesHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.CheckSlaBreachesHandler = CheckSlaBreachesHandler;
exports.CheckSlaBreachesHandler = CheckSlaBreachesHandler = CheckSlaBreachesHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CheckSlaBreachesHandler);
//# sourceMappingURL=crm-handlers.js.map