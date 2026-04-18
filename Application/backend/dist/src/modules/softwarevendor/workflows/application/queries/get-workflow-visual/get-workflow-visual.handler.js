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
var GetWorkflowVisualHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWorkflowVisualHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_workflow_visual_query_1 = require("./get-workflow-visual.query");
let GetWorkflowVisualHandler = GetWorkflowVisualHandler_1 = class GetWorkflowVisualHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetWorkflowVisualHandler_1.name);
    }
    async execute(query) {
        try {
            const workflow = await this.prisma.workflow.findUnique({
                where: { id: query.id },
                include: {
                    states: { orderBy: { sortOrder: 'asc' } },
                    transitions: {
                        include: {
                            fromState: { select: { id: true, name: true, code: true, color: true } },
                            toState: { select: { id: true, name: true, code: true, color: true } },
                        },
                    },
                },
            });
            if (!workflow)
                throw new common_1.NotFoundException(`Workflow "${query.id}" not found`);
            const SPACING_X = 250;
            const SPACING_Y = 120;
            const START_X = 100;
            const START_Y = 80;
            return {
                id: workflow.id,
                name: workflow.name,
                nodes: workflow.states.map((s, i) => ({
                    id: s.id, code: s.code, name: s.name,
                    type: 'default',
                    position: {
                        x: START_X + (i % 4) * SPACING_X,
                        y: START_Y + Math.floor(i / 4) * SPACING_Y,
                    },
                    data: {
                        label: s.name,
                        description: s.code,
                        nodeCategory: s.category ?? 'action',
                        nodeSubType: s.stateType ?? 'default',
                        icon: s.icon ?? 'circle',
                        color: s.color ?? '#6B7280',
                        config: {},
                        isConfigured: true,
                    },
                    stateType: s.stateType, category: s.category,
                    color: s.color, icon: s.icon, sortOrder: s.sortOrder,
                })),
                edges: workflow.transitions.map((t) => ({
                    id: t.id,
                    source: t.fromStateId,
                    target: t.toStateId,
                    label: t.name,
                    type: 'smoothstep',
                    animated: true,
                    markerEnd: { type: 'arrowclosed', width: 16, height: 16 },
                    style: { stroke: '#94a3b8', strokeWidth: 2 },
                })),
            };
        }
        catch (error) {
            this.logger.error(`GetWorkflowVisualHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetWorkflowVisualHandler = GetWorkflowVisualHandler;
exports.GetWorkflowVisualHandler = GetWorkflowVisualHandler = GetWorkflowVisualHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_workflow_visual_query_1.GetWorkflowVisualQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetWorkflowVisualHandler);
//# sourceMappingURL=get-workflow-visual.handler.js.map