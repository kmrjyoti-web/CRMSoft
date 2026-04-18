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
var ListScheduledTestsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListScheduledTestsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const list_scheduled_tests_query_1 = require("./list-scheduled-tests.query");
const scheduled_test_repository_1 = require("../../../infrastructure/repositories/scheduled-test.repository");
let ListScheduledTestsHandler = ListScheduledTestsHandler_1 = class ListScheduledTestsHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(ListScheduledTestsHandler_1.name);
    }
    async execute(query) {
        try {
            return this.repo.findByTenantId(query.tenantId, {
                isActive: query.isActive,
                page: query.page,
                limit: query.limit,
            });
        }
        catch (error) {
            this.logger.error(`ListScheduledTestsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListScheduledTestsHandler = ListScheduledTestsHandler;
exports.ListScheduledTestsHandler = ListScheduledTestsHandler = ListScheduledTestsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_scheduled_tests_query_1.ListScheduledTestsQuery),
    __param(0, (0, common_1.Inject)(scheduled_test_repository_1.SCHEDULED_TEST_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ListScheduledTestsHandler);
//# sourceMappingURL=list-scheduled-tests.handler.js.map