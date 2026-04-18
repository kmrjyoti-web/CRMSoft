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
var CreateWorkflowHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWorkflowHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const create_workflow_command_1 = require("./create-workflow.command");
let CreateWorkflowHandler = CreateWorkflowHandler_1 = class CreateWorkflowHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateWorkflowHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.workflow.findFirst({ where: { code: cmd.code } });
            if (existing)
                throw new common_1.ConflictException(`Workflow code "${cmd.code}" already exists`);
            const workflow = await this.prisma.workflow.create({
                data: {
                    name: cmd.name,
                    code: cmd.code,
                    entityType: cmd.entityType,
                    description: cmd.description,
                    isDefault: cmd.isDefault ?? false,
                    configJson: cmd.configJson,
                    createdById: cmd.createdById,
                },
            });
            this.logger.log(`Workflow created: ${workflow.id} (${workflow.code})`);
            return workflow;
        }
        catch (error) {
            this.logger.error(`CreateWorkflowHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateWorkflowHandler = CreateWorkflowHandler;
exports.CreateWorkflowHandler = CreateWorkflowHandler = CreateWorkflowHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_workflow_command_1.CreateWorkflowCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateWorkflowHandler);
//# sourceMappingURL=create-workflow.handler.js.map