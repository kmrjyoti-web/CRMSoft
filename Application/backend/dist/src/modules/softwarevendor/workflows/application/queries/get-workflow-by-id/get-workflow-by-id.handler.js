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
var GetWorkflowByIdHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWorkflowByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_workflow_by_id_query_1 = require("./get-workflow-by-id.query");
let GetWorkflowByIdHandler = GetWorkflowByIdHandler_1 = class GetWorkflowByIdHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetWorkflowByIdHandler_1.name);
    }
    async execute(query) {
        try {
            const workflow = await this.prisma.workflow.findUnique({
                where: { id: query.id },
                include: {
                    states: { orderBy: { sortOrder: 'asc' } },
                    transitions: {
                        orderBy: { sortOrder: 'asc' },
                        include: {
                            fromState: { select: { id: true, name: true, code: true } },
                            toState: { select: { id: true, name: true, code: true } },
                        },
                    },
                    _count: { select: { instances: true } },
                    createdBy: { select: { id: true, firstName: true, lastName: true } },
                },
            });
            if (!workflow)
                throw new common_1.NotFoundException(`Workflow "${query.id}" not found`);
            return workflow;
        }
        catch (error) {
            this.logger.error(`GetWorkflowByIdHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetWorkflowByIdHandler = GetWorkflowByIdHandler;
exports.GetWorkflowByIdHandler = GetWorkflowByIdHandler = GetWorkflowByIdHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_workflow_by_id_query_1.GetWorkflowByIdQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetWorkflowByIdHandler);
//# sourceMappingURL=get-workflow-by-id.handler.js.map