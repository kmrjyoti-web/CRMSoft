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
var GetTestPlanHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTestPlanHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_test_plan_query_1 = require("./get-test-plan.query");
const test_plan_repository_1 = require("../../../infrastructure/repositories/test-plan.repository");
let GetTestPlanHandler = GetTestPlanHandler_1 = class GetTestPlanHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(GetTestPlanHandler_1.name);
    }
    async execute(query) {
        try {
            const plan = await this.repo.findById(query.id);
            if (!plan || plan.tenantId !== query.tenantId) {
                throw new common_1.NotFoundException('Test plan not found');
            }
            return plan;
        }
        catch (error) {
            this.logger.error(`GetTestPlanHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetTestPlanHandler = GetTestPlanHandler;
exports.GetTestPlanHandler = GetTestPlanHandler = GetTestPlanHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_test_plan_query_1.GetTestPlanQuery),
    __param(0, (0, common_1.Inject)(test_plan_repository_1.TEST_PLAN_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetTestPlanHandler);
//# sourceMappingURL=get-test-plan.handler.js.map