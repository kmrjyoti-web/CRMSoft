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
var GetManualTestLogHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetManualTestLogHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_manual_test_log_query_1 = require("./get-manual-test-log.query");
const manual_test_log_repository_1 = require("../../../infrastructure/repositories/manual-test-log.repository");
let GetManualTestLogHandler = GetManualTestLogHandler_1 = class GetManualTestLogHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(GetManualTestLogHandler_1.name);
    }
    async execute(query) {
        try {
            const log = await this.repo.findById(query.id);
            if (!log)
                throw new common_1.NotFoundException(`ManualTestLog not found: ${query.id}`);
            return log;
        }
        catch (error) {
            this.logger.error(`GetManualTestLogHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetManualTestLogHandler = GetManualTestLogHandler;
exports.GetManualTestLogHandler = GetManualTestLogHandler = GetManualTestLogHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_manual_test_log_query_1.GetManualTestLogQuery),
    __param(0, (0, common_1.Inject)(manual_test_log_repository_1.MANUAL_TEST_LOG_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetManualTestLogHandler);
//# sourceMappingURL=get-manual-test-log.handler.js.map