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
var GetTaskListHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTaskListHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_task_list_query_1 = require("./get-task-list.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const task_visibility_service_1 = require("../../services/task-visibility.service");
let GetTaskListHandler = GetTaskListHandler_1 = class GetTaskListHandler {
    constructor(prisma, visibility) {
        this.prisma = prisma;
        this.visibility = visibility;
        this.logger = new common_1.Logger(GetTaskListHandler_1.name);
    }
    async execute(query) {
        try {
            const where = await this.visibility.buildWhereClause({
                userId: query.userId,
                roleLevel: query.roleLevel,
                tenantId: query.tenantId,
            });
            if (query.status)
                where.status = query.status;
            if (query.priority)
                where.priority = query.priority;
            if (query.assignedToId)
                where.assignedToId = query.assignedToId;
            if (query.search) {
                where.OR = [
                    ...(where.OR || []),
                    { title: { contains: query.search, mode: 'insensitive' } },
                    { taskNumber: { contains: query.search, mode: 'insensitive' } },
                ];
                if (where.OR && where.OR.length > 2) {
                    const visibilityOr = where.OR.slice(0, -2);
                    const searchOr = where.OR.slice(-2);
                    delete where.OR;
                    where.AND = [{ OR: visibilityOr }, { OR: searchOr }];
                }
            }
            const skip = (query.page - 1) * query.limit;
            const orderBy = { [query.sortBy]: query.sortOrder };
            const [data, total] = await Promise.all([
                this.prisma.working.task.findMany({
                    where,
                    skip,
                    take: query.limit,
                    orderBy,
                    include: {
                        assignedTo: { select: { id: true, firstName: true, lastName: true } },
                        createdBy: { select: { id: true, firstName: true, lastName: true } },
                        _count: { select: { comments: true, watchers: true, reminders: true } },
                    },
                }),
                this.prisma.working.task.count({ where }),
            ]);
            return { data, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
        }
        catch (error) {
            this.logger.error(`GetTaskListHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetTaskListHandler = GetTaskListHandler;
exports.GetTaskListHandler = GetTaskListHandler = GetTaskListHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_task_list_query_1.GetTaskListQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        task_visibility_service_1.TaskVisibilityService])
], GetTaskListHandler);
//# sourceMappingURL=get-task-list.handler.js.map