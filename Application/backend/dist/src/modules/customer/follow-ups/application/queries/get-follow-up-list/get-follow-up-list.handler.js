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
var GetFollowUpListHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFollowUpListHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_follow_up_list_query_1 = require("./get-follow-up-list.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetFollowUpListHandler = GetFollowUpListHandler_1 = class GetFollowUpListHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetFollowUpListHandler_1.name);
    }
    async execute(query) {
        try {
            const where = { isActive: true };
            if (query.priority)
                where.priority = query.priority;
            if (query.assignedToId)
                where.assignedToId = query.assignedToId;
            if (query.isOverdue !== undefined)
                where.isOverdue = query.isOverdue;
            if (query.entityType)
                where.entityType = query.entityType;
            if (query.entityId)
                where.entityId = query.entityId;
            if (query.search) {
                where.OR = [
                    { title: { contains: query.search, mode: 'insensitive' } },
                    { description: { contains: query.search, mode: 'insensitive' } },
                ];
            }
            const [data, total] = await Promise.all([
                this.prisma.working.followUp.findMany({
                    where,
                    include: {
                        assignedTo: { select: { id: true, firstName: true, lastName: true } },
                        createdBy: { select: { id: true, firstName: true, lastName: true } },
                    },
                    orderBy: { [query.sortBy]: query.sortOrder },
                    skip: (query.page - 1) * query.limit,
                    take: query.limit,
                }),
                this.prisma.working.followUp.count({ where }),
            ]);
            return { data, total, page: query.page, limit: query.limit };
        }
        catch (error) {
            this.logger.error(`GetFollowUpListHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetFollowUpListHandler = GetFollowUpListHandler;
exports.GetFollowUpListHandler = GetFollowUpListHandler = GetFollowUpListHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_follow_up_list_query_1.GetFollowUpListQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetFollowUpListHandler);
//# sourceMappingURL=get-follow-up-list.handler.js.map