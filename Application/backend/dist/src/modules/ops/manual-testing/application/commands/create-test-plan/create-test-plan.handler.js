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
var CreateTestPlanHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTestPlanHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_test_plan_command_1 = require("./create-test-plan.command");
const test_plan_repository_1 = require("../../../infrastructure/repositories/test-plan.repository");
let CreateTestPlanHandler = CreateTestPlanHandler_1 = class CreateTestPlanHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(CreateTestPlanHandler_1.name);
    }
    async execute(cmd) {
        try {
            const plan = await this.repo.create({
                tenantId: cmd.tenantId,
                name: cmd.name,
                description: cmd.description,
                version: cmd.version,
                targetModules: cmd.targetModules,
                createdById: cmd.userId,
            });
            if (cmd.items.length > 0) {
                for (let i = 0; i < cmd.items.length; i++) {
                    await this.repo.createItem({ planId: plan.id, ...cmd.items[i], sortOrder: i });
                }
                await this.repo.recalcStats(plan.id);
                return this.repo.findById(plan.id);
            }
            return plan;
        }
        catch (error) {
            this.logger.error(`CreateTestPlanHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateTestPlanHandler = CreateTestPlanHandler;
exports.CreateTestPlanHandler = CreateTestPlanHandler = CreateTestPlanHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_test_plan_command_1.CreateTestPlanCommand),
    __param(0, (0, common_1.Inject)(test_plan_repository_1.TEST_PLAN_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], CreateTestPlanHandler);
//# sourceMappingURL=create-test-plan.handler.js.map