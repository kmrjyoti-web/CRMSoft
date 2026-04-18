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
var GetPendingRemindersHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPendingRemindersHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_pending_reminders_query_1 = require("./get-pending-reminders.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetPendingRemindersHandler = GetPendingRemindersHandler_1 = class GetPendingRemindersHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetPendingRemindersHandler_1.name);
    }
    async execute(query) {
        try {
            const where = { isActive: true, isSent: false, scheduledAt: { lte: new Date() } };
            if (query.recipientId)
                where.recipientId = query.recipientId;
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
            this.logger.error(`GetPendingRemindersHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetPendingRemindersHandler = GetPendingRemindersHandler;
exports.GetPendingRemindersHandler = GetPendingRemindersHandler = GetPendingRemindersHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_pending_reminders_query_1.GetPendingRemindersQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetPendingRemindersHandler);
//# sourceMappingURL=get-pending-reminders.handler.js.map