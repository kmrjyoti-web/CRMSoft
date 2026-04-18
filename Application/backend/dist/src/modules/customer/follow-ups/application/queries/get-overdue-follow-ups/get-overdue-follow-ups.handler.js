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
var GetOverdueFollowUpsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOverdueFollowUpsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_overdue_follow_ups_query_1 = require("./get-overdue-follow-ups.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetOverdueFollowUpsHandler = GetOverdueFollowUpsHandler_1 = class GetOverdueFollowUpsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetOverdueFollowUpsHandler_1.name);
    }
    async execute(query) {
        try {
            const where = { isActive: true, isOverdue: true, completedAt: null };
            if (query.assignedToId)
                where.assignedToId = query.assignedToId;
            const [data, total] = await Promise.all([
                this.prisma.working.followUp.findMany({
                    where,
                    include: {
                        assignedTo: { select: { id: true, firstName: true, lastName: true } },
                    },
                    orderBy: { dueDate: 'asc' },
                    skip: (query.page - 1) * query.limit,
                    take: query.limit,
                }),
                this.prisma.working.followUp.count({ where }),
            ]);
            return { data, total, page: query.page, limit: query.limit };
        }
        catch (error) {
            this.logger.error(`GetOverdueFollowUpsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetOverdueFollowUpsHandler = GetOverdueFollowUpsHandler;
exports.GetOverdueFollowUpsHandler = GetOverdueFollowUpsHandler = GetOverdueFollowUpsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_overdue_follow_ups_query_1.GetOverdueFollowUpsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetOverdueFollowUpsHandler);
//# sourceMappingURL=get-overdue-follow-ups.handler.js.map