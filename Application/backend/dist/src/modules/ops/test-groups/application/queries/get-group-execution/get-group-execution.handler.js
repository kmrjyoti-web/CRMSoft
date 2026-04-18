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
var GetGroupExecutionHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetGroupExecutionHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_group_execution_query_1 = require("./get-group-execution.query");
const test_group_repository_1 = require("../../../infrastructure/repositories/test-group.repository");
let GetGroupExecutionHandler = GetGroupExecutionHandler_1 = class GetGroupExecutionHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(GetGroupExecutionHandler_1.name);
    }
    async execute(query) {
        try {
            const exec = await this.repo.findExecution(query.executionId);
            if (!exec)
                throw new common_1.NotFoundException(`Execution not found: ${query.executionId}`);
            return exec;
        }
        catch (error) {
            this.logger.error(`GetGroupExecutionHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetGroupExecutionHandler = GetGroupExecutionHandler;
exports.GetGroupExecutionHandler = GetGroupExecutionHandler = GetGroupExecutionHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_group_execution_query_1.GetGroupExecutionQuery),
    __param(0, (0, common_1.Inject)(test_group_repository_1.TEST_GROUP_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetGroupExecutionHandler);
//# sourceMappingURL=get-group-execution.handler.js.map