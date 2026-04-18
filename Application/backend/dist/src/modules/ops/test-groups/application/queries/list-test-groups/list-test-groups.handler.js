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
var ListTestGroupsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListTestGroupsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const list_test_groups_query_1 = require("./list-test-groups.query");
const test_group_repository_1 = require("../../../infrastructure/repositories/test-group.repository");
let ListTestGroupsHandler = ListTestGroupsHandler_1 = class ListTestGroupsHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(ListTestGroupsHandler_1.name);
    }
    async execute(query) {
        try {
            return this.repo.findByTenantId(query.tenantId, query.filters);
        }
        catch (error) {
            this.logger.error(`ListTestGroupsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListTestGroupsHandler = ListTestGroupsHandler;
exports.ListTestGroupsHandler = ListTestGroupsHandler = ListTestGroupsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_test_groups_query_1.ListTestGroupsQuery),
    __param(0, (0, common_1.Inject)(test_group_repository_1.TEST_GROUP_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ListTestGroupsHandler);
//# sourceMappingURL=list-test-groups.handler.js.map