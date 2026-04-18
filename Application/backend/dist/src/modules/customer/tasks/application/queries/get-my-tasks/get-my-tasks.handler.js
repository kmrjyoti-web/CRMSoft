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
var GetMyTasksHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMyTasksHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_my_tasks_query_1 = require("./get-my-tasks.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetMyTasksHandler = GetMyTasksHandler_1 = class GetMyTasksHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetMyTasksHandler_1.name);
    }
    async execute(query) {
        try {
            const where = { assignedToId: query.userId, isActive: true };
            if (query.status)
                where.status = query.status;
            const skip = (query.page - 1) * query.limit;
            const [data, total] = await Promise.all([
                this.prisma.working.task.findMany({
                    where,
                    skip,
                    take: query.limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        createdBy: { select: { id: true, firstName: true, lastName: true } },
                        _count: { select: { comments: true, watchers: true } },
                    },
                }),
                this.prisma.working.task.count({ where }),
            ]);
            return { data, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
        }
        catch (error) {
            this.logger.error(`GetMyTasksHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetMyTasksHandler = GetMyTasksHandler;
exports.GetMyTasksHandler = GetMyTasksHandler = GetMyTasksHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_my_tasks_query_1.GetMyTasksQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetMyTasksHandler);
//# sourceMappingURL=get-my-tasks.handler.js.map