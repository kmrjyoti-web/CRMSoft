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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestEnvController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const rxjs_1 = require("rxjs");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_test_env_dto_1 = require("./dto/create-test-env.dto");
const create_test_env_command_1 = require("../application/commands/create-test-env/create-test-env.command");
const cleanup_test_env_command_1 = require("../application/commands/cleanup-test-env/cleanup-test-env.command");
const extend_test_env_ttl_command_1 = require("../application/commands/extend-test-env-ttl/extend-test-env-ttl.command");
const list_test_envs_query_1 = require("../application/queries/list-test-envs/list-test-envs.query");
const get_test_env_query_1 = require("../application/queries/get-test-env/get-test-env.query");
const test_env_repository_1 = require("../infrastructure/repositories/test-env.repository");
const db_operations_service_1 = require("../infrastructure/db-operations.service");
const common_2 = require("@nestjs/common");
let TestEnvController = class TestEnvController {
    constructor(commandBus, queryBus, repo, dbOps) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.repo = repo;
        this.dbOps = dbOps;
    }
    async create(tenantId, userId, dto) {
        const result = await this.commandBus.execute(new create_test_env_command_1.CreateTestEnvCommand(tenantId, userId, dto.sourceType, dto.displayName, dto.backupId, dto.sourceDbUrl, dto.ttlHours));
        return api_response_1.ApiResponse.success(result, 'Test environment queued for creation');
    }
    async list(tenantId, status, page = 1, limit = 20) {
        const data = await this.queryBus.execute(new list_test_envs_query_1.ListTestEnvsQuery(tenantId, status, page, limit));
        return api_response_1.ApiResponse.success(data);
    }
    async getById(id) {
        const data = await this.queryBus.execute(new get_test_env_query_1.GetTestEnvQuery(id));
        return api_response_1.ApiResponse.success(data);
    }
    progress(id) {
        const TERMINAL_STATES = ['READY', 'FAILED', 'CLEANED', 'COMPLETED'];
        return (0, rxjs_1.interval)(3000).pipe((0, rxjs_1.map)(() => {
            return { data: { id, message: 'polling' } };
        }));
    }
    async cleanup(id, userId) {
        const result = await this.commandBus.execute(new cleanup_test_env_command_1.CleanupTestEnvCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Test environment cleanup initiated');
    }
    async extendTtl(id, body) {
        if (!body.additionalHours || typeof body.additionalHours !== 'number') {
            throw new common_1.BadRequestException('additionalHours is required');
        }
        const result = await this.commandBus.execute(new extend_test_env_ttl_command_1.ExtendTestEnvTtlCommand(id, body.additionalHours));
        return api_response_1.ApiResponse.success(result, `TTL extended by ${body.additionalHours} hours`);
    }
    async getConnectionInfo(id) {
        const testEnv = await this.repo.findById(id);
        if (!testEnv)
            throw new common_1.BadRequestException('TestEnvironment not found');
        if (!['READY', 'TESTING'].includes(testEnv.status)) {
            throw new common_1.BadRequestException(`Connection info only available when status is READY or TESTING (current: ${testEnv.status})`);
        }
        if (!testEnv.testDbUrl) {
            throw new common_1.BadRequestException('Test DB URL not available yet');
        }
        const parsed = this.dbOps.parseDbUrl(testEnv.testDbUrl);
        return api_response_1.ApiResponse.success({
            host: parsed.host,
            port: parseInt(parsed.port, 10),
            database: parsed.database,
            user: parsed.user,
            passwordHint: '(contact your admin for credentials)',
            jdbcUrl: `jdbc:postgresql://${parsed.host}:${parsed.port}/${parsed.database}`,
            status: testEnv.status,
            expiresAt: testEnv.expiresAt,
        });
    }
};
exports.TestEnvController = TestEnvController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_test_env_dto_1.CreateTestEnvDto]),
    __metadata("design:returntype", Promise)
], TestEnvController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], TestEnvController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestEnvController.prototype, "getById", null);
__decorate([
    (0, common_1.Sse)(':id/progress'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", rxjs_1.Observable)
], TestEnvController.prototype, "progress", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TestEnvController.prototype, "cleanup", null);
__decorate([
    (0, common_1.Patch)(':id/extend'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TestEnvController.prototype, "extendTtl", null);
__decorate([
    (0, common_1.Get)(':id/connection'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestEnvController.prototype, "getConnectionInfo", null);
exports.TestEnvController = TestEnvController = __decorate([
    (0, common_1.Controller)('ops/test-env'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_permissions_decorator_1.RequirePermissions)('ops:manage'),
    __param(2, (0, common_2.Inject)(test_env_repository_1.TEST_ENV_REPOSITORY)),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus, Object, db_operations_service_1.DbOperationsService])
], TestEnvController);
//# sourceMappingURL=test-env.controller.js.map