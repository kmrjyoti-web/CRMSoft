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
var DeleteAssignmentRuleHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteAssignmentRuleHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_assignment_rule_command_1 = require("./delete-assignment-rule.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let DeleteAssignmentRuleHandler = DeleteAssignmentRuleHandler_1 = class DeleteAssignmentRuleHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DeleteAssignmentRuleHandler_1.name);
    }
    async execute(command) {
        try {
            const rule = await this.prisma.working.assignmentRule.findUnique({ where: { id: command.id } });
            if (!rule)
                throw new common_1.NotFoundException('Assignment rule not found');
            await this.prisma.working.assignmentRule.update({
                where: { id: command.id },
                data: { isActive: false, status: 'INACTIVE' },
            });
            return { success: true };
        }
        catch (error) {
            this.logger.error(`DeleteAssignmentRuleHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeleteAssignmentRuleHandler = DeleteAssignmentRuleHandler;
exports.DeleteAssignmentRuleHandler = DeleteAssignmentRuleHandler = DeleteAssignmentRuleHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(delete_assignment_rule_command_1.DeleteAssignmentRuleCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeleteAssignmentRuleHandler);
//# sourceMappingURL=delete-assignment-rule.handler.js.map