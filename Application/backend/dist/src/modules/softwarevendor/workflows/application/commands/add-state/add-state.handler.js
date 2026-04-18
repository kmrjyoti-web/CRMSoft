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
var AddStateHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddStateHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const add_state_command_1 = require("./add-state.command");
let AddStateHandler = AddStateHandler_1 = class AddStateHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AddStateHandler_1.name);
    }
    async execute(cmd) {
        try {
            const workflow = await this.prisma.workflow.findUnique({ where: { id: cmd.workflowId } });
            if (!workflow)
                throw new common_1.NotFoundException(`Workflow "${cmd.workflowId}" not found`);
            const existing = await this.prisma.workflowState.findFirst({
                where: { workflowId: cmd.workflowId, code: cmd.code },
            });
            if (existing)
                throw new common_1.ConflictException(`State code "${cmd.code}" already exists in this workflow`);
            return this.prisma.workflowState.create({
                data: {
                    workflowId: cmd.workflowId,
                    name: cmd.name,
                    code: cmd.code,
                    stateType: cmd.stateType,
                    category: cmd.category,
                    color: cmd.color,
                    icon: cmd.icon,
                    sortOrder: cmd.sortOrder ?? 0,
                    metadata: cmd.metadata,
                },
            });
        }
        catch (error) {
            this.logger.error(`AddStateHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AddStateHandler = AddStateHandler;
exports.AddStateHandler = AddStateHandler = AddStateHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(add_state_command_1.AddStateCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddStateHandler);
//# sourceMappingURL=add-state.handler.js.map