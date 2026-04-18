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
var RunTestGroupHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunTestGroupHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const run_test_group_command_1 = require("./run-test-group.command");
const test_group_repository_1 = require("../../../infrastructure/repositories/test-group.repository");
const test_group_processor_1 = require("../../jobs/test-group.processor");
let RunTestGroupHandler = RunTestGroupHandler_1 = class RunTestGroupHandler {
    constructor(repo, queue, prisma) {
        this.repo = repo;
        this.queue = queue;
        this.prisma = prisma;
        this.logger = new common_1.Logger(RunTestGroupHandler_1.name);
    }
    async execute(cmd) {
        try {
            const { tenantId, userId, groupId, testEnvId } = cmd;
            const group = await this.repo.findById(groupId);
            if (!group)
                throw new common_1.NotFoundException(`TestGroup not found: ${groupId}`);
            const steps = group.steps ?? [];
            const execution = await this.prisma.platform.testGroupExecution.create({
                data: {
                    testGroupId: groupId,
                    testEnvId,
                    tenantId,
                    totalSteps: steps.length,
                    executedById: userId,
                },
            });
            await this.queue.add('RUN_TEST_GROUP', { executionId: execution.id }, { attempts: 1, removeOnComplete: 20, removeOnFail: 20 });
            this.logger.log(`TestGroup ${group.name} queued for execution: ${execution.id}`);
            return { executionId: execution.id, status: 'RUNNING' };
        }
        catch (error) {
            this.logger.error(`RunTestGroupHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RunTestGroupHandler = RunTestGroupHandler;
exports.RunTestGroupHandler = RunTestGroupHandler = RunTestGroupHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(run_test_group_command_1.RunTestGroupCommand),
    __param(0, (0, common_1.Inject)(test_group_repository_1.TEST_GROUP_REPOSITORY)),
    __param(1, (0, bull_1.InjectQueue)(test_group_processor_1.TEST_GROUP_QUEUE)),
    __metadata("design:paramtypes", [Object, Object, prisma_service_1.PrismaService])
], RunTestGroupHandler);
//# sourceMappingURL=run-test-group.handler.js.map