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
var LogManualTestHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogManualTestHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const log_manual_test_command_1 = require("./log-manual-test.command");
const manual_test_log_repository_1 = require("../../../infrastructure/repositories/manual-test-log.repository");
let LogManualTestHandler = LogManualTestHandler_1 = class LogManualTestHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(LogManualTestHandler_1.name);
    }
    async execute(cmd) {
        try {
            const { tenantId, userId, dto } = cmd;
            return this.repo.create({ tenantId, userId, ...dto });
        }
        catch (error) {
            this.logger.error(`LogManualTestHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.LogManualTestHandler = LogManualTestHandler;
exports.LogManualTestHandler = LogManualTestHandler = LogManualTestHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(log_manual_test_command_1.LogManualTestCommand),
    __param(0, (0, common_1.Inject)(manual_test_log_repository_1.MANUAL_TEST_LOG_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], LogManualTestHandler);
//# sourceMappingURL=log-manual-test.handler.js.map