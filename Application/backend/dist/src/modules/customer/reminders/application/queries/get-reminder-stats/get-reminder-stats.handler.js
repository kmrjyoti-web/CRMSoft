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
var GetReminderStatsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReminderStatsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_reminder_stats_query_1 = require("./get-reminder-stats.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetReminderStatsHandler = GetReminderStatsHandler_1 = class GetReminderStatsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetReminderStatsHandler_1.name);
    }
    async execute(query) {
        try {
            const where = { isActive: true };
            if (query.userId)
                where.recipientId = query.userId;
            const [total, sent, pending, byChannel] = await Promise.all([
                this.prisma.working.reminder.count({ where }),
                this.prisma.working.reminder.count({ where: { ...where, isSent: true } }),
                this.prisma.working.reminder.count({ where: { ...where, isSent: false } }),
                this.prisma.working.reminder.groupBy({ by: ['channel'], where, _count: true }),
            ]);
            return {
                total, sent, pending,
                byChannel: byChannel.map((g) => ({ channel: g.channel, count: g._count })),
            };
        }
        catch (error) {
            this.logger.error(`GetReminderStatsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetReminderStatsHandler = GetReminderStatsHandler;
exports.GetReminderStatsHandler = GetReminderStatsHandler = GetReminderStatsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_reminder_stats_query_1.GetReminderStatsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetReminderStatsHandler);
//# sourceMappingURL=get-reminder-stats.handler.js.map