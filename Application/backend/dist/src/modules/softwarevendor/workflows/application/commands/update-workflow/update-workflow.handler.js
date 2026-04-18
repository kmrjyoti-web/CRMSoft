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
var UpdateWorkflowHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWorkflowHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const update_workflow_command_1 = require("./update-workflow.command");
let UpdateWorkflowHandler = UpdateWorkflowHandler_1 = class UpdateWorkflowHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateWorkflowHandler_1.name);
    }
    async execute(cmd) {
        try {
            const workflow = await this.prisma.workflow.findUnique({ where: { id: cmd.id } });
            if (!workflow)
                throw new common_1.NotFoundException(`Workflow "${cmd.id}" not found`);
            return this.prisma.workflow.update({
                where: { id: cmd.id },
                data: cmd.data,
            });
        }
        catch (error) {
            this.logger.error(`UpdateWorkflowHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateWorkflowHandler = UpdateWorkflowHandler;
exports.UpdateWorkflowHandler = UpdateWorkflowHandler = UpdateWorkflowHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_workflow_command_1.UpdateWorkflowCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateWorkflowHandler);
//# sourceMappingURL=update-workflow.handler.js.map