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
var ListGroupExecutionsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListGroupExecutionsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const list_group_executions_query_1 = require("./list-group-executions.query");
const test_group_repository_1 = require("../../../infrastructure/repositories/test-group.repository");
let ListGroupExecutionsHandler = ListGroupExecutionsHandler_1 = class ListGroupExecutionsHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(ListGroupExecutionsHandler_1.name);
    }
    async execute(query) {
        try {
            return this.repo.listExecutions(query.testGroupId);
        }
        catch (error) {
            this.logger.error(`ListGroupExecutionsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListGroupExecutionsHandler = ListGroupExecutionsHandler;
exports.ListGroupExecutionsHandler = ListGroupExecutionsHandler = ListGroupExecutionsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_group_executions_query_1.ListGroupExecutionsQuery),
    __param(0, (0, common_1.Inject)(test_group_repository_1.TEST_GROUP_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ListGroupExecutionsHandler);
//# sourceMappingURL=list-group-executions.handler.js.map