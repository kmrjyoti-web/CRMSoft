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
var CloneWorkflowHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloneWorkflowHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const working_client_1 = require("@prisma/working-client");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const clone_workflow_command_1 = require("./clone-workflow.command");
let CloneWorkflowHandler = CloneWorkflowHandler_1 = class CloneWorkflowHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CloneWorkflowHandler_1.name);
    }
    async execute(cmd) {
        try {
            const source = await this.prisma.workflow.findUnique({
                where: { id: cmd.sourceId },
                include: { states: true, transitions: true },
            });
            if (!source)
                throw new common_1.NotFoundException(`Source workflow "${cmd.sourceId}" not found`);
            return this.prisma.$transaction(async (tx) => {
                const clone = await tx.workflow.create({
                    data: {
                        name: `${source.name} (Copy)`,
                        code: `${source.code}_COPY_${Date.now()}`,
                        entityType: source.entityType,
                        description: source.description,
                        isDefault: false,
                        configJson: source.configJson === null ? working_client_1.Prisma.JsonNull : source.configJson ?? undefined,
                        createdById: cmd.createdById,
                    },
                });
                const stateMap = new Map();
                for (const state of source.states) {
                    const newState = await tx.workflowState.create({
                        data: {
                            workflowId: clone.id,
                            name: state.name,
                            code: state.code,
                            stateType: state.stateType,
                            category: state.category,
                            color: state.color,
                            icon: state.icon,
                            sortOrder: state.sortOrder,
                            metadata: state.metadata === null ? working_client_1.Prisma.JsonNull : state.metadata ?? undefined,
                        },
                    });
                    stateMap.set(state.id, newState.id);
                }
                for (const t of source.transitions) {
                    await tx.workflowTransition.create({
                        data: {
                            workflowId: clone.id,
                            fromStateId: stateMap.get(t.fromStateId),
                            toStateId: stateMap.get(t.toStateId),
                            name: t.name,
                            code: t.code,
                            triggerType: t.triggerType,
                            conditions: t.conditions === null ? working_client_1.Prisma.JsonNull : t.conditions ?? undefined,
                            actions: t.actions === null ? working_client_1.Prisma.JsonNull : t.actions ?? undefined,
                            requiredPermission: t.requiredPermission,
                            requiredRole: t.requiredRole,
                            sortOrder: t.sortOrder,
                        },
                    });
                }
                this.logger.log(`Cloned workflow ${source.code} ? ${clone.code}`);
                return clone;
            });
        }
        catch (error) {
            this.logger.error(`CloneWorkflowHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CloneWorkflowHandler = CloneWorkflowHandler;
exports.CloneWorkflowHandler = CloneWorkflowHandler = CloneWorkflowHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(clone_workflow_command_1.CloneWorkflowCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CloneWorkflowHandler);
//# sourceMappingURL=clone-workflow.handler.js.map