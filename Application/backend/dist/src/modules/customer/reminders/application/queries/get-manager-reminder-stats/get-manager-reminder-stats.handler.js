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
var GetManagerReminderStatsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetManagerReminderStatsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_manager_reminder_stats_query_1 = require("./get-manager-reminder-stats.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetManagerReminderStatsHandler = GetManagerReminderStatsHandler_1 = class GetManagerReminderStatsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetManagerReminderStatsHandler_1.name);
    }
    async execute(query) {
        try {
            if (query.roleLevel > 3) {
                return this.getOwnStats(query.userId);
            }
            const reportees = await this.prisma.$queryRaw `
        WITH RECURSIVE chain AS (
          SELECT id FROM users WHERE reporting_to_id = ${query.userId} AND is_deleted = false
          UNION ALL
          SELECT u.id FROM users u INNER JOIN chain c ON u.reporting_to_id = c.id WHERE u.is_deleted = false
        )
        SELECT id FROM chain
      `;
            const allIds = [query.userId, ...reportees.map(r => r.id)];
            const where = { recipientId: { in: allIds }, isActive: true };
            const [total, pending, sent, missed, snoozed] = await Promise.all([
                this.prisma.working.reminder.count({ where }),
                this.prisma.working.reminder.count({ where: { ...where, status: 'PENDING' } }),
                this.prisma.working.reminder.count({ where: { ...where, status: 'SENT' } }),
                this.prisma.working.reminder.count({ where: { ...where, status: 'MISSED' } }),
                this.prisma.working.reminder.count({ where: { ...where, status: 'SNOOZED' } }),
            ]);
            return { total, pending, sent, missed, snoozed, reporteeCount: reportees.length };
        }
        catch (error) {
            this.logger.error(`GetManagerReminderStatsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getOwnStats(userId) {
        const where = { recipientId: userId, isActive: true };
        const [total, pending, sent, missed, snoozed] = await Promise.all([
            this.prisma.working.reminder.count({ where }),
            this.prisma.working.reminder.count({ where: { ...where, status: 'PENDING' } }),
            this.prisma.working.reminder.count({ where: { ...where, status: 'SENT' } }),
            this.prisma.working.reminder.count({ where: { ...where, status: 'MISSED' } }),
            this.prisma.working.reminder.count({ where: { ...where, status: 'SNOOZED' } }),
        ]);
        return { total, pending, sent, missed, snoozed, reporteeCount: 0 };
    }
};
exports.GetManagerReminderStatsHandler = GetManagerReminderStatsHandler;
exports.GetManagerReminderStatsHandler = GetManagerReminderStatsHandler = GetManagerReminderStatsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_manager_reminder_stats_query_1.GetManagerReminderStatsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetManagerReminderStatsHandler);
//# sourceMappingURL=get-manager-reminder-stats.handler.js.map