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
var GetReminderListHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReminderListHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_reminder_list_query_1 = require("./get-reminder-list.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetReminderListHandler = GetReminderListHandler_1 = class GetReminderListHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetReminderListHandler_1.name);
    }
    async execute(query) {
        try {
            const where = { isActive: true };
            if (query.recipientId)
                where.recipientId = query.recipientId;
            if (query.channel)
                where.channel = query.channel;
            if (query.isSent !== undefined)
                where.isSent = query.isSent;
            const [data, total] = await Promise.all([
                this.prisma.working.reminder.findMany({
                    where,
                    orderBy: { scheduledAt: 'asc' },
                    skip: (query.page - 1) * query.limit,
                    take: query.limit,
                }),
                this.prisma.working.reminder.count({ where }),
            ]);
            return { data, total, page: query.page, limit: query.limit };
        }
        catch (error) {
            this.logger.error(`GetReminderListHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetReminderListHandler = GetReminderListHandler;
exports.GetReminderListHandler = GetReminderListHandler = GetReminderListHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_reminder_list_query_1.GetReminderListQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetReminderListHandler);
//# sourceMappingURL=get-reminder-list.handler.js.map