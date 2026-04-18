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
var CreateTestGroupHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTestGroupHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_test_group_command_1 = require("./create-test-group.command");
const test_group_repository_1 = require("../../../infrastructure/repositories/test-group.repository");
let CreateTestGroupHandler = CreateTestGroupHandler_1 = class CreateTestGroupHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(CreateTestGroupHandler_1.name);
    }
    async execute(cmd) {
        try {
            const { tenantId, userId, dto } = cmd;
            if (!dto.steps || dto.steps.length === 0) {
                throw new common_1.BadRequestException('Test group must have at least one step');
            }
            for (const step of dto.steps) {
                if (!step.id || !step.name || !step.endpoint) {
                    throw new common_1.BadRequestException(`Step is missing required fields: id, name, endpoint`);
                }
            }
            return this.repo.create({
                tenantId,
                createdById: userId,
                name: dto.name,
                nameHi: dto.nameHi,
                description: dto.description,
                icon: dto.icon,
                color: dto.color,
                modules: dto.modules,
                steps: dto.steps,
                estimatedDuration: dto.estimatedDuration,
            });
        }
        catch (error) {
            this.logger.error(`CreateTestGroupHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateTestGroupHandler = CreateTestGroupHandler;
exports.CreateTestGroupHandler = CreateTestGroupHandler = CreateTestGroupHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_test_group_command_1.CreateTestGroupCommand),
    __param(0, (0, common_1.Inject)(test_group_repository_1.TEST_GROUP_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], CreateTestGroupHandler);
//# sourceMappingURL=create-test-group.handler.js.map