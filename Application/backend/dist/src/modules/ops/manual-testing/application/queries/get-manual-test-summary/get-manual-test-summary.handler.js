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
var GetManualTestSummaryHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetManualTestSummaryHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_manual_test_summary_query_1 = require("./get-manual-test-summary.query");
const manual_test_log_repository_1 = require("../../../infrastructure/repositories/manual-test-log.repository");
let GetManualTestSummaryHandler = GetManualTestSummaryHandler_1 = class GetManualTestSummaryHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(GetManualTestSummaryHandler_1.name);
    }
    async execute(query) {
        try {
            return this.repo.getSummary(query.tenantId, query.filters);
        }
        catch (error) {
            this.logger.error(`GetManualTestSummaryHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetManualTestSummaryHandler = GetManualTestSummaryHandler;
exports.GetManualTestSummaryHandler = GetManualTestSummaryHandler = GetManualTestSummaryHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_manual_test_summary_query_1.GetManualTestSummaryQuery),
    __param(0, (0, common_1.Inject)(manual_test_log_repository_1.MANUAL_TEST_LOG_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetManualTestSummaryHandler);
//# sourceMappingURL=get-manual-test-summary.handler.js.map