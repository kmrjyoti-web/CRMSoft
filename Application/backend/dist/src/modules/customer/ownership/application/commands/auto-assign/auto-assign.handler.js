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
var AutoAssignHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoAssignHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const auto_assign_command_1 = require("./auto-assign.command");
const rule_engine_service_1 = require("../../../services/rule-engine.service");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let AutoAssignHandler = AutoAssignHandler_1 = class AutoAssignHandler {
    constructor(ruleEngine, prisma) {
        this.ruleEngine = ruleEngine;
        this.prisma = prisma;
        this.logger = new common_1.Logger(AutoAssignHandler_1.name);
    }
    async execute(command) {
        try {
            const existing = await this.prisma.working.entityOwner.findFirst({
                where: { entityType: command.entityType, entityId: command.entityId, ownerType: 'PRIMARY_OWNER', isActive: true },
            });
            if (existing)
                return { assigned: false, reason: 'Entity already has a primary owner' };
            const rule = await this.ruleEngine.evaluate({
                entityType: command.entityType, entityId: command.entityId,
                triggerEvent: command.triggerEvent,
            });
            if (!rule)
                return { assigned: false, reason: 'No matching rule found' };
            const owner = await this.ruleEngine.executeRule(rule, command.entityType, command.entityId, command.performedById || 'system');
            return { assigned: true, rule: rule.name, owner };
        }
        catch (error) {
            this.logger.error(`AutoAssignHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AutoAssignHandler = AutoAssignHandler;
exports.AutoAssignHandler = AutoAssignHandler = AutoAssignHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(auto_assign_command_1.AutoAssignCommand),
    __metadata("design:paramtypes", [rule_engine_service_1.RuleEngineService,
        prisma_service_1.PrismaService])
], AutoAssignHandler);
//# sourceMappingURL=auto-assign.handler.js.map