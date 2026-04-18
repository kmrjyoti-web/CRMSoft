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
var GetWorkflowListHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWorkflowListHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_workflow_list_query_1 = require("./get-workflow-list.query");
let GetWorkflowListHandler = GetWorkflowListHandler_1 = class GetWorkflowListHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetWorkflowListHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {};
            if (query.search) {
                where.OR = [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { code: { contains: query.search, mode: 'insensitive' } },
                ];
            }
            if (query.entityType)
                where.entityType = query.entityType;
            const skip = (query.page - 1) * query.limit;
            const [data, total] = await Promise.all([
                this.prisma.workflow.findMany({
                    where, skip, take: query.limit,
                    orderBy: { createdAt: query.sortOrder },
                    include: {
                        _count: { select: { states: true, transitions: true, instances: true } },
                    },
                }),
                this.prisma.workflow.count({ where }),
            ]);
            return { data, total, page: query.page, limit: query.limit };
        }
        catch (error) {
            this.logger.error(`GetWorkflowListHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetWorkflowListHandler = GetWorkflowListHandler;
exports.GetWorkflowListHandler = GetWorkflowListHandler = GetWorkflowListHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_workflow_list_query_1.GetWorkflowListQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetWorkflowListHandler);
//# sourceMappingURL=get-workflow-list.handler.js.map