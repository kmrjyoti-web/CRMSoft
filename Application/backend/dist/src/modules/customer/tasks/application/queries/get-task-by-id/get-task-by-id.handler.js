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
var GetTaskByIdHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTaskByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const get_task_by_id_query_1 = require("./get-task-by-id.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const cross_db_resolver_service_1 = require("../../../../../../core/prisma/cross-db-resolver.service");
const common_1 = require("@nestjs/common");
let GetTaskByIdHandler = GetTaskByIdHandler_1 = class GetTaskByIdHandler {
    constructor(prisma, resolver) {
        this.prisma = prisma;
        this.resolver = resolver;
        this.logger = new common_1.Logger(GetTaskByIdHandler_1.name);
    }
    async execute(query) {
        try {
            const task = await this.prisma.working.task.findUnique({
                where: { id: query.taskId },
                include: {
                    watchers: true,
                    comments: {
                        where: { isActive: true },
                        orderBy: { createdAt: 'desc' },
                        take: 20,
                    },
                    reminders: { where: { isActive: true }, orderBy: { scheduledAt: 'asc' } },
                    _count: { select: { comments: true, watchers: true, history: true, reminders: true } },
                },
            });
            if (!task || !task.isActive)
                throw new common_1.NotFoundException('Task not found');
            const assignedTo = await this.resolver.resolveUser(task.assignedToId);
            const createdBy = await this.resolver.resolveUser(task.createdById);
            const watchers = await this.resolver.resolveUsers(task.watchers, ['userId'], { id: true, firstName: true, lastName: true });
            const comments = await this.resolver.resolveUsers(task.comments, ['authorId'], { id: true, firstName: true, lastName: true });
            return { ...task, assignedTo, createdBy, watchers, comments };
        }
        catch (error) {
            this.logger.error(`GetTaskByIdHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetTaskByIdHandler = GetTaskByIdHandler;
exports.GetTaskByIdHandler = GetTaskByIdHandler = GetTaskByIdHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_task_by_id_query_1.GetTaskByIdQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cross_db_resolver_service_1.CrossDbResolverService])
], GetTaskByIdHandler);
//# sourceMappingURL=get-task-by-id.handler.js.map