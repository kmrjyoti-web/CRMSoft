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
var ListTestPlansHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListTestPlansHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const list_test_plans_query_1 = require("./list-test-plans.query");
const test_plan_repository_1 = require("../../../infrastructure/repositories/test-plan.repository");
let ListTestPlansHandler = ListTestPlansHandler_1 = class ListTestPlansHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(ListTestPlansHandler_1.name);
    }
    async execute(query) {
        try {
            const { items, total } = await this.repo.findByTenantId(query.tenantId, {
                status: query.status,
                search: query.search,
                page: query.page ?? 1,
                limit: query.limit ?? 20,
            });
            return {
                data: items,
                meta: {
                    total,
                    page: query.page ?? 1,
                    limit: query.limit ?? 20,
                    totalPages: Math.ceil(total / (query.limit ?? 20)),
                },
            };
        }
        catch (error) {
            this.logger.error(`ListTestPlansHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListTestPlansHandler = ListTestPlansHandler;
exports.ListTestPlansHandler = ListTestPlansHandler = ListTestPlansHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_test_plans_query_1.ListTestPlansQuery),
    __param(0, (0, common_1.Inject)(test_plan_repository_1.TEST_PLAN_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ListTestPlansHandler);
//# sourceMappingURL=list-test-plans.handler.js.map