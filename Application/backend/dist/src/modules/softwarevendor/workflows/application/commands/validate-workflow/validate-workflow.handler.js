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
var ValidateWorkflowHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateWorkflowHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const validate_workflow_command_1 = require("./validate-workflow.command");
let ValidateWorkflowHandler = ValidateWorkflowHandler_1 = class ValidateWorkflowHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ValidateWorkflowHandler_1.name);
    }
    async execute(cmd) {
        try {
            const workflow = await this.prisma.workflow.findUnique({
                where: { id: cmd.id },
                include: { states: true, transitions: true },
            });
            if (!workflow)
                throw new common_1.NotFoundException(`Workflow "${cmd.id}" not found`);
            const errors = [];
            const initialStates = workflow.states.filter((s) => s.stateType === 'INITIAL');
            if (initialStates.length === 0)
                errors.push('No INITIAL state defined');
            if (initialStates.length > 1)
                errors.push('Multiple INITIAL states found');
            const terminalStates = workflow.states.filter((s) => s.stateType === 'TERMINAL');
            if (terminalStates.length === 0)
                errors.push('No TERMINAL state defined');
            const stateIds = new Set(workflow.states.map((s) => s.id));
            for (const t of workflow.transitions) {
                if (!stateIds.has(t.fromStateId))
                    errors.push(`Transition "${t.code}" has invalid fromStateId`);
                if (!stateIds.has(t.toStateId))
                    errors.push(`Transition "${t.code}" has invalid toStateId`);
            }
            if (initialStates.length === 1) {
                const reachable = new Set();
                const queue = [initialStates[0].id];
                while (queue.length > 0) {
                    const current = queue.shift();
                    if (reachable.has(current))
                        continue;
                    reachable.add(current);
                    const outgoing = workflow.transitions.filter((t) => t.fromStateId === current);
                    for (const t of outgoing) {
                        if (!reachable.has(t.toStateId))
                            queue.push(t.toStateId);
                    }
                }
                for (const state of workflow.states) {
                    if (!reachable.has(state.id))
                        errors.push(`State "${state.code}" is not reachable from INITIAL state`);
                }
            }
            return { valid: errors.length === 0, errors, stateCount: workflow.states.length, transitionCount: workflow.transitions.length };
        }
        catch (error) {
            this.logger.error(`ValidateWorkflowHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ValidateWorkflowHandler = ValidateWorkflowHandler;
exports.ValidateWorkflowHandler = ValidateWorkflowHandler = ValidateWorkflowHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(validate_workflow_command_1.ValidateWorkflowCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ValidateWorkflowHandler);
//# sourceMappingURL=validate-workflow.handler.js.map