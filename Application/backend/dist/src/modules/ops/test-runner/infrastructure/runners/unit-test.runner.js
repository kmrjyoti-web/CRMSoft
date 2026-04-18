"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitTestRunner = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const platform_client_1 = require("@prisma/platform-client");
let UnitTestRunner = class UnitTestRunner {
    constructor() {
        this.type = platform_client_1.TestType.UNIT;
    }
    async run(config) {
        const startTime = Date.now();
        const args = ['--json', '--forceExit', '--passWithNoTests'];
        if (config.targetModules?.length) {
            const pattern = config.targetModules.map(m => `src/modules/${m}/`).join('|');
            args.push('--testPathPattern', `"${pattern}"`);
        }
        args.push('--testPathIgnorePatterns', '".*\\.e2e-spec\\.ts$"');
        const env = { ...process.env };
        if (config.testEnvDbUrl) {
            env.PLATFORM_DATABASE_URL = config.testEnvDbUrl;
            env.IDENTITY_DATABASE_URL = config.testEnvDbUrl;
            env.GLOBAL_WORKING_DATABASE_URL = config.testEnvDbUrl;
            env.MARKETPLACE_DATABASE_URL = config.testEnvDbUrl;
        }
        try {
            const output = (0, child_process_1.execSync)(`npx jest ${args.join(' ')} 2>/dev/null`, {
                encoding: 'utf-8',
                timeout: config.timeout ?? 300_000,
                cwd: process.cwd(),
                env,
            });
            return this.parseJestOutput(output, startTime);
        }
        catch (error) {
            if (error.stdout)
                return this.parseJestOutput(error.stdout, startTime);
            return {
                type: platform_client_1.TestType.UNIT,
                total: 1, passed: 0, failed: 0, skipped: 0, errors: 1,
                duration: Date.now() - startTime,
                results: [{
                        suiteName: 'UnitTests', testName: 'Jest execution',
                        status: 'ERROR', duration: 0,
                        errorMessage: error.message?.substring(0, 500),
                    }],
            };
        }
    }
    parseJestOutput(raw, startTime) {
        const jsonStart = raw.indexOf('{');
        const jsonEnd = raw.lastIndexOf('}');
        if (jsonStart === -1) {
            return {
                type: platform_client_1.TestType.UNIT, total: 0, passed: 0, failed: 0, skipped: 0, errors: 1,
                duration: Date.now() - startTime,
                results: [{ suiteName: 'UnitTests', testName: 'Parse', status: 'ERROR', duration: 0, errorMessage: 'No JSON in Jest output' }],
            };
        }
        const jestResult = JSON.parse(raw.substring(jsonStart, jsonEnd + 1));
        const results = [];
        for (const suite of jestResult.testResults ?? []) {
            const filePath = (suite.testFilePath ?? '').replace(process.cwd() + '/', '');
            const module = this.extractModule(filePath);
            const suiteName = suite.testResults?.[0]?.ancestorTitles?.[0] ||
                filePath.split('/').pop()?.replace('.spec.ts', '') ||
                'Unknown';
            for (const test of suite.testResults ?? []) {
                const errorMsg = (test.failureMessages ?? []).join('\n');
                results.push({
                    suiteName,
                    testName: test.title ?? test.fullName ?? 'Unknown',
                    filePath,
                    module,
                    status: this.mapStatus(test.status),
                    duration: test.duration ?? 0,
                    errorMessage: errorMsg ? errorMsg.substring(0, 2000) : undefined,
                    errorStack: test.failureDetails?.[0]?.stack?.substring(0, 3000),
                });
            }
        }
        const totalDuration = (jestResult.testResults ?? []).reduce((sum, s) => sum + ((s.endTime ?? 0) - (s.startTime ?? 0)), 0);
        return {
            type: platform_client_1.TestType.UNIT,
            total: jestResult.numTotalTests ?? 0,
            passed: jestResult.numPassedTests ?? 0,
            failed: jestResult.numFailedTests ?? 0,
            skipped: jestResult.numPendingTests ?? 0,
            errors: 0,
            duration: totalDuration || (Date.now() - startTime),
            results,
        };
    }
    extractModule(filePath) {
        const match = filePath.match(/modules\/(?:customer|softwarevendor|core|marketplace|ops)\/([^/]+)/);
        return match?.[1] ?? 'unknown';
    }
    mapStatus(jestStatus) {
        switch (jestStatus) {
            case 'passed': return 'PASS';
            case 'failed': return 'FAIL';
            case 'pending':
            case 'skipped':
            case 'todo': return 'SKIP';
            default: return 'ERROR';
        }
    }
};
exports.UnitTestRunner = UnitTestRunner;
exports.UnitTestRunner = UnitTestRunner = __decorate([
    (0, common_1.Injectable)()
], UnitTestRunner);
//# sourceMappingURL=unit-test.runner.js.map