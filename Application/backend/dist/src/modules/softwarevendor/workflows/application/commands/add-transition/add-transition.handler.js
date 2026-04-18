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
var AddTransitionHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTransitionHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const add_transition_command_1 = require("./add-transition.command");
let AddTransitionHandler = AddTransitionHandler_1 = class AddTransitionHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AddTransitionHandler_1.name);
    }
    async execute(cmd) {
        try {
            const workflow = await this.prisma.workflow.findUnique({ where: { id: cmd.workflowId } });
            if (!workflow)
                throw new common_1.NotFoundException(`Workflow "${cmd.workflowId}" not found`);
            const [fromState, toState] = await Promise.all([
                this.prisma.workflowState.findUnique({ where: { id: cmd.fromStateId } }),
                this.prisma.workflowState.findUnique({ where: { id: cmd.toStateId } }),
            ]);
            if (!fromState)
                throw new common_1.NotFoundException(`From state "${cmd.fromStateId}" not found`);
            if (!toState)
                throw new common_1.NotFoundException(`To state "${cmd.toStateId}" not found`);
            const existing = await this.prisma.workflowTransition.findFirst({
                where: { workflowId: cmd.workflowId, code: cmd.code },
            });
            if (existing)
                throw new common_1.ConflictException(`Transition code "${cmd.code}" already exists`);
            return this.prisma.workflowTransition.create({
                data: {
                    workflowId: cmd.workflowId,
                    fromStateId: cmd.fromStateId,
                    toStateId: cmd.toStateId,
                    name: cmd.name,
                    code: cmd.code,
                    triggerType: cmd.triggerType || 'MANUAL',
                    conditions: cmd.conditions,
                    actions: cmd.actions,
                    requiredPermission: cmd.requiredPermission,
                    requiredRole: cmd.requiredRole,
                    sortOrder: cmd.sortOrder ?? 0,
                },
                include: { fromState: { select: { name: true, code: true } }, toState: { select: { name: true, code: true } } },
            });
        }
        catch (error) {
            this.logger.error(`AddTransitionHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AddTransitionHandler = AddTransitionHandler;
exports.AddTransitionHandler = AddTransitionHandler = AddTransitionHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(add_transition_command_1.AddTransitionCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddTransitionHandler);
//# sourceMappingURL=add-transition.handler.js.map