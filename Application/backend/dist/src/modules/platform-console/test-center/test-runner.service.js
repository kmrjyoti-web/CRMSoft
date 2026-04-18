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
var TestRunnerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRunnerService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
const test_center_errors_1 = require("./test-center.errors");
let TestRunnerService = TestRunnerService_1 = class TestRunnerService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(TestRunnerService_1.name);
    }
    async runTests(options) {
        try {
            const running = await this.db.pcTestExecution.findFirst({
                where: { status: 'RUNNING' },
            });
            if (running) {
                const err = test_center_errors_1.TEST_CENTER_ERRORS.TEST_ALREADY_RUNNING;
                throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
            }
            const execution = await this.db.pcTestExecution.create({
                data: {
                    planId: options.planId || null,
                    triggerType: options.triggerType || 'MANUAL',
                    moduleScope: options.moduleScope || null,
                    verticalScope: options.verticalScope || null,
                    status: 'RUNNING',
                    startedAt: new Date(),
                },
            });
            let cmd = 'npx jest --no-coverage --json --silent';
            if (options.moduleScope) {
                cmd += ` --testPathPattern="modules/${options.moduleScope}"`;
            }
            if (options.verticalScope) {
                cmd += ` --testPathPattern="modules/vertical/${options.verticalScope}"`;
            }
            const cwd = process.cwd();
            this.logger.log(`Running tests: ${cmd} (cwd: ${cwd})`);
            (0, child_process_1.exec)(cmd, { cwd, maxBuffer: 50 * 1024 * 1024 }, async (error, stdout, stderr) => {
                try {
                    let totalTests = 0;
                    let passed = 0;
                    let failed = 0;
                    let skipped = 0;
                    let duration = null;
                    let status = 'PASSED';
                    try {
                        const result = JSON.parse(stdout);
                        totalTests = result.numTotalTests || 0;
                        passed = result.numPassedTests || 0;
                        failed = result.numFailedTests || 0;
                        skipped = result.numPendingTests || 0;
                        duration = result.testResults
                            ? result.testResults.reduce((sum, r) => sum + (r.endTime - r.startTime), 0)
                            : null;
                        status = failed > 0 ? 'FAILED' : 'PASSED';
                    }
                    catch {
                        if (error) {
                            status = 'ERROR';
                        }
                    }
                    const output = (stdout || stderr || (error ? error.message : '')).substring(0, 10000);
                    await this.db.pcTestExecution.update({
                        where: { id: execution.id },
                        data: {
                            totalTests,
                            passed,
                            failed,
                            skipped,
                            duration,
                            status,
                            output,
                            completedAt: new Date(),
                        },
                    });
                    this.logger.log(`Test execution ${execution.id} completed: ${status} (${passed}/${totalTests} passed)`);
                }
                catch (updateError) {
                    this.logger.error(`Failed to update execution ${execution.id}`, updateError.stack);
                    try {
                        await this.db.pcTestExecution.update({
                            where: { id: execution.id },
                            data: {
                                status: 'ERROR',
                                output: updateError.message?.substring(0, 10000),
                                completedAt: new Date(),
                            },
                        });
                    }
                    catch (finalError) {
                        this.logger.error(`Failed to mark execution as error ${execution.id}`, finalError.stack);
                    }
                }
            });
            return execution;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error('Failed to run tests', error.stack);
            throw error;
        }
    }
    async runForModule(module) {
        try {
            return await this.runTests({ moduleScope: module, triggerType: 'MANUAL' });
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error(`Failed to run tests for module ${module}`, error.stack);
            throw error;
        }
    }
    async runForVertical(code) {
        try {
            return await this.runTests({ verticalScope: code, triggerType: 'MANUAL' });
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error(`Failed to run tests for vertical ${code}`, error.stack);
            throw error;
        }
    }
};
exports.TestRunnerService = TestRunnerService;
exports.TestRunnerService = TestRunnerService = TestRunnerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService])
], TestRunnerService);
//# sourceMappingURL=test-runner.service.js.map