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
var ExtendTestEnvTtlHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendTestEnvTtlHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const extend_test_env_ttl_command_1 = require("./extend-test-env-ttl.command");
const test_env_repository_1 = require("../../../infrastructure/repositories/test-env.repository");
const MAX_EXTENSION_HOURS = 168;
let ExtendTestEnvTtlHandler = ExtendTestEnvTtlHandler_1 = class ExtendTestEnvTtlHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(ExtendTestEnvTtlHandler_1.name);
    }
    async execute(cmd) {
        try {
            const { testEnvId, additionalHours } = cmd;
            if (additionalHours < 1 || additionalHours > MAX_EXTENSION_HOURS) {
                throw new common_1.BadRequestException(`additionalHours must be between 1 and ${MAX_EXTENSION_HOURS}`);
            }
            const testEnv = await this.repo.findById(testEnvId);
            if (!testEnv)
                throw new common_1.NotFoundException(`TestEnvironment ${testEnvId} not found`);
            if (['CLEANED', 'CLEANING', 'FAILED'].includes(testEnv.status)) {
                throw new common_1.BadRequestException(`Cannot extend TTL for a test environment with status: ${testEnv.status}`);
            }
            const currentExpiry = testEnv.expiresAt ?? new Date();
            const newExpiry = new Date(currentExpiry.getTime() + additionalHours * 60 * 60 * 1000);
            await this.repo.update(testEnvId, {
                expiresAt: newExpiry,
                statusMessage: `TTL extended by ${additionalHours}h — expires at ${newExpiry.toISOString()}`,
            });
            return { expiresAt: newExpiry };
        }
        catch (error) {
            this.logger.error(`ExtendTestEnvTtlHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ExtendTestEnvTtlHandler = ExtendTestEnvTtlHandler;
exports.ExtendTestEnvTtlHandler = ExtendTestEnvTtlHandler = ExtendTestEnvTtlHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(extend_test_env_ttl_command_1.ExtendTestEnvTtlCommand),
    __param(0, (0, common_1.Inject)(test_env_repository_1.TEST_ENV_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ExtendTestEnvTtlHandler);
//# sourceMappingURL=extend-test-env-ttl.handler.js.map