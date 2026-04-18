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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UpdateTestPlanItemHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTestPlanItemHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_test_plan_item_command_1 = require("./update-test-plan-item.command");
const test_plan_repository_1 = require("../../../infrastructure/repositories/test-plan.repository");
let UpdateTestPlanItemHandler = UpdateTestPlanItemHandler_1 = class UpdateTestPlanItemHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(UpdateTestPlanItemHandler_1.name);
    }
    async execute(cmd) {
        try {
            const item = await this.repo.findItemById(cmd.itemId);
            if (!item || item.planId !== cmd.planId) {
                throw new common_1.NotFoundException('Test plan item not found');
            }
            const updates = {};
            if (cmd.status !== undefined) {
                updates.status = cmd.status;
                updates.testedById = cmd.userId;
                updates.testedAt = new Date();
            }
            if (cmd.notes !== undefined)
                updates.notes = cmd.notes;
            if (cmd.errorDetails !== undefined)
                updates.errorDetails = cmd.errorDetails;
            if (cmd.priority !== undefined)
                updates.priority = cmd.priority;
            if (cmd.moduleName !== undefined)
                updates.moduleName = cmd.moduleName;
            if (cmd.componentName !== undefined)
                updates.componentName = cmd.componentName;
            if (cmd.functionality !== undefined)
                updates.functionality = cmd.functionality;
            if (cmd.layer !== undefined)
                updates.layer = cmd.layer;
            const updated = await this.repo.updateItem(cmd.itemId, updates);
            if (cmd.status !== undefined) {
                await this.repo.recalcStats(cmd.planId);
            }
            return updated;
        }
        catch (error) {
            this.logger.error(`UpdateTestPlanItemHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateTestPlanItemHandler = UpdateTestPlanItemHandler;
exports.UpdateTestPlanItemHandler = UpdateTestPlanItemHandler = UpdateTestPlanItemHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_test_plan_item_command_1.UpdateTestPlanItemCommand),
    __param(0, (0, common_1.Inject)(test_plan_repository_1.TEST_PLAN_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], UpdateTestPlanItemHandler);
//# sourceMappingURL=update-test-plan-item.handler.js.map