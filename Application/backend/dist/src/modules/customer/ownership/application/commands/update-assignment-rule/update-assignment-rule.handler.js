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
var UpdateAssignmentRuleHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAssignmentRuleHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_assignment_rule_command_1 = require("./update-assignment-rule.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let UpdateAssignmentRuleHandler = UpdateAssignmentRuleHandler_1 = class UpdateAssignmentRuleHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateAssignmentRuleHandler_1.name);
    }
    async execute(command) {
        try {
            const rule = await this.prisma.working.assignmentRule.findUnique({ where: { id: command.id } });
            if (!rule)
                throw new common_1.NotFoundException('Assignment rule not found');
            const updateData = {};
            const d = command.data;
            if (d.name !== undefined)
                updateData.name = d.name;
            if (d.description !== undefined)
                updateData.description = d.description;
            if (d.conditions !== undefined)
                updateData.conditions = d.conditions;
            if (d.assignmentMethod !== undefined)
                updateData.assignmentMethod = d.assignmentMethod;
            if (d.assignToUserId !== undefined)
                updateData.assignToUserId = d.assignToUserId;
            if (d.assignToTeamIds !== undefined)
                updateData.assignToTeamIds = d.assignToTeamIds;
            if (d.assignToRoleId !== undefined)
                updateData.assignToRoleId = d.assignToRoleId;
            if (d.ownerType !== undefined)
                updateData.ownerType = d.ownerType;
            if (d.priority !== undefined)
                updateData.priority = d.priority;
            if (d.status !== undefined)
                updateData.status = d.status;
            if (d.maxPerUser !== undefined)
                updateData.maxPerUser = d.maxPerUser;
            if (d.respectWorkload !== undefined)
                updateData.respectWorkload = d.respectWorkload;
            if (d.escalateAfterHours !== undefined)
                updateData.escalateAfterHours = d.escalateAfterHours;
            if (d.escalateToUserId !== undefined)
                updateData.escalateToUserId = d.escalateToUserId;
            if (d.escalateToRoleId !== undefined)
                updateData.escalateToRoleId = d.escalateToRoleId;
            return this.prisma.working.assignmentRule.update({ where: { id: command.id }, data: updateData });
        }
        catch (error) {
            this.logger.error(`UpdateAssignmentRuleHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateAssignmentRuleHandler = UpdateAssignmentRuleHandler;
exports.UpdateAssignmentRuleHandler = UpdateAssignmentRuleHandler = UpdateAssignmentRuleHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_assignment_rule_command_1.UpdateAssignmentRuleCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateAssignmentRuleHandler);
//# sourceMappingURL=update-assignment-rule.handler.js.map