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
var UpdateTestPlanHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTestPlanHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_test_plan_command_1 = require("./update-test-plan.command");
const test_plan_repository_1 = require("../../../infrastructure/repositories/test-plan.repository");
let UpdateTestPlanHandler = UpdateTestPlanHandler_1 = class UpdateTestPlanHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(UpdateTestPlanHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.repo.findById(cmd.id);
            if (!existing || existing.tenantId !== cmd.tenantId) {
                throw new common_1.NotFoundException('Test plan not found');
            }
            const updates = {};
            if (cmd.name !== undefined)
                updates.name = cmd.name;
            if (cmd.description !== undefined)
                updates.description = cmd.description;
            if (cmd.version !== undefined)
                updates.version = cmd.version;
            if (cmd.targetModules !== undefined)
                updates.targetModules = cmd.targetModules;
            if (cmd.status !== undefined)
                updates.status = cmd.status;
            return this.repo.update(cmd.id, updates);
        }
        catch (error) {
            this.logger.error(`UpdateTestPlanHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateTestPlanHandler = UpdateTestPlanHandler;
exports.UpdateTestPlanHandler = UpdateTestPlanHandler = UpdateTestPlanHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_test_plan_command_1.UpdateTestPlanCommand),
    __param(0, (0, common_1.Inject)(test_plan_repository_1.TEST_PLAN_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], UpdateTestPlanHandler);
//# sourceMappingURL=update-test-plan.handler.js.map