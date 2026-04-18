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
var TestGroupProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestGroupProcessor = exports.TEST_GROUP_QUEUE = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const test_group_runner_service_1 = require("../services/test-group-runner.service");
exports.TEST_GROUP_QUEUE = 'ops-test-groups';
let TestGroupProcessor = TestGroupProcessor_1 = class TestGroupProcessor {
    constructor(runner, prisma) {
        this.runner = runner;
        this.prisma = prisma;
        this.logger = new common_1.Logger(TestGroupProcessor_1.name);
    }
    async handleRunTestGroup(job) {
        const { executionId } = job.data;
        const execution = await this.prisma.platform.testGroupExecution.findUnique({
            where: { id: executionId },
            include: { testGroup: true },
        });
        if (!execution)
            throw new Error(`TestGroupExecution not found: ${executionId}`);
        this.logger.log(`Running TestGroup: ${execution.testGroup.name} (exec=${executionId})`);
        const authToken = process.env.INTERNAL_API_TOKEN ?? 'internal-service-token';
        try {
            await this.runner.execute(executionId, execution.testGroup, authToken);
        }
        catch (error) {
            this.logger.error(`TestGroup execution failed: ${error.message}`);
            await this.prisma.platform.testGroupExecution.update({
                where: { id: executionId },
                data: {
                    status: 'FAILED',
                    completedAt: new Date(),
                },
            });
            throw error;
        }
    }
};
exports.TestGroupProcessor = TestGroupProcessor;
__decorate([
    (0, bull_1.Process)('RUN_TEST_GROUP'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TestGroupProcessor.prototype, "handleRunTestGroup", null);
exports.TestGroupProcessor = TestGroupProcessor = TestGroupProcessor_1 = __decorate([
    (0, bull_1.Processor)(exports.TEST_GROUP_QUEUE),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [test_group_runner_service_1.TestGroupRunnerService,
        prisma_service_1.PrismaService])
], TestGroupProcessor);
//# sourceMappingURL=test-group.processor.js.map