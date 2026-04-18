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
var GetTaskHistoryHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTaskHistoryHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_task_history_query_1 = require("./get-task-history.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetTaskHistoryHandler = GetTaskHistoryHandler_1 = class GetTaskHistoryHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetTaskHistoryHandler_1.name);
    }
    async execute(query) {
        try {
            const skip = (query.page - 1) * query.limit;
            const [data, total] = await Promise.all([
                this.prisma.working.taskHistory.findMany({
                    where: { taskId: query.taskId },
                    skip,
                    take: query.limit,
                    orderBy: { createdAt: 'desc' },
                    include: { changedBy: { select: { id: true, firstName: true, lastName: true } } },
                }),
                this.prisma.working.taskHistory.count({ where: { taskId: query.taskId } }),
            ]);
            return { data, total, page: query.page, limit: query.limit };
        }
        catch (error) {
            this.logger.error(`GetTaskHistoryHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetTaskHistoryHandler = GetTaskHistoryHandler;
exports.GetTaskHistoryHandler = GetTaskHistoryHandler = GetTaskHistoryHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_task_history_query_1.GetTaskHistoryQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetTaskHistoryHandler);
//# sourceMappingURL=get-task-history.handler.js.map