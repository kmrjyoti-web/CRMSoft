"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionalTestRunner = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const platform_client_1 = require("@prisma/platform-client");
let FunctionalTestRunner = class FunctionalTestRunner {
    constructor() {
        this.type = platform_client_1.TestType.FUNCTIONAL;
    }
    async run(config) {
        const startTime = Date.now();
        const args = [
            '--config', 'test/jest-e2e.json',
            '--json', '--forceExit', '--passWithNoTests',
        ];
        if (config.targetModules?.length) {
            args.push('--testPathPattern', `"${config.targetModules.map(m => `test/e2e/${m}`).join('|')}"`);
        }
        try {
            const output = (0, child_process_1.execSync)(`npx jest ${args.join(' ')} 2>/dev/null`, {
                encoding: 'utf-8',
                timeout: config.timeout ?? 600_000,
                cwd: process.cwd(),
            });
            return this.parseOutput(output, startTime);
        }
        catch (error) {
            if (error.stdout)
                return this.parseOutput(error.stdout, startTime);
            return this.errorResult(error.message, startTime);
        }
    }
    parseOutput(raw, startTime) {
        const jsonStart = raw.indexOf('{');
        const jsonEnd = raw.lastIndexOf('}');
        if (jsonStart === -1)
            return this.errorResult('No JSON output from Jest E2E', startTime);
        let jestResult;
        try {
            jestResult = JSON.parse(raw.substring(jsonStart, jsonEnd + 1));
        }
        catch {
            return this.errorResult('Failed to parse Jest E2E output', startTime);
        }
        const results = [];
        for (const suite of jestResult.testResults ?? []) {
            const filePath = (suite.testFilePath ?? '').replace(process.cwd() + '/', '');
            const suiteName = suite.testResults?.[0]?.ancestorTitles?.[0] ||
                filePath.split('/').pop()?.replace('.e2e-spec.ts', '') ||
                'E2E';
            for (const test of suite.testResults ?? []) {
                const errorMsg = (test.failureMessages ?? []).join('\n');
                results.push({
                    suiteName,
                    testName: test.title ?? test.fullName ?? 'Unknown',
                    filePath,
                    status: this.mapStatus(test.status),
                    duration: test.duration ?? 0,
                    errorMessage: errorMsg ? errorMsg.substring(0, 2000) : undefined,
                });
            }
        }
        const totalDuration = (jestResult.testResults ?? []).reduce((sum, s) => sum + ((s.endTime ?? 0) - (s.startTime ?? 0)), 0);
        return {
            type: platform_client_1.TestType.FUNCTIONAL,
            total: jestResult.numTotalTests ?? 0,
            passed: jestResult.numPassedTests ?? 0,
            failed: jestResult.numFailedTests ?? 0,
            skipped: jestResult.numPendingTests ?? 0,
            errors: 0,
            duration: totalDuration || (Date.now() - startTime),
            results,
        };
    }
    mapStatus(jestStatus) {
        switch (jestStatus) {
            case 'passed': return 'PASS';
            case 'failed': return 'FAIL';
            case 'pending':
            case 'skipped': return 'SKIP';
            default: return 'ERROR';
        }
    }
    errorResult(message, startTime) {
        return {
            type: platform_client_1.TestType.FUNCTIONAL,
            total: 1, passed: 0, failed: 0, skipped: 0, errors: 1,
            duration: Date.now() - startTime,
            results: [{
                    suiteName: 'FunctionalTests', testName: 'E2E execution',
                    status: 'ERROR', duration: 0,
                    errorMessage: message?.substring(0, 500),
                }],
        };
    }
};
exports.FunctionalTestRunner = FunctionalTestRunner;
exports.FunctionalTestRunner = FunctionalTestRunner = __decorate([
    (0, common_1.Injectable)()
], FunctionalTestRunner);
//# sourceMappingURL=functional-test.runner.js.map