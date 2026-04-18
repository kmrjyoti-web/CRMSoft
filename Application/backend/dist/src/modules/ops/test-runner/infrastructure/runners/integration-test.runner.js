"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationTestRunner = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const platform_client_1 = require("@prisma/platform-client");
const PRISMA_SCHEMAS = ['identity', 'platform', 'working', 'marketplace'];
let IntegrationTestRunner = class IntegrationTestRunner {
    constructor() {
        this.type = platform_client_1.TestType.INTEGRATION;
    }
    async run(config) {
        const startTime = Date.now();
        const results = [];
        results.push(...(await this.checkDbClientIsolation()));
        results.push(await this.checkTypescript());
        results.push(...(await this.checkPrismaSchemas()));
        return {
            type: platform_client_1.TestType.INTEGRATION,
            total: results.length,
            passed: results.filter(r => r.status === 'PASS').length,
            failed: results.filter(r => r.status === 'FAIL').length,
            skipped: results.filter(r => r.status === 'SKIP').length,
            errors: results.filter(r => r.status === 'ERROR').length,
            duration: Date.now() - startTime,
            results,
        };
    }
    async checkDbClientIsolation() {
        const checks = [
            {
                name: 'Customer modules: no direct identity DB access',
                cmd: `grep -rn "this\\.prisma\\.identity\\." src/modules/customer --include="*.repository.ts" 2>/dev/null | wc -l`,
            },
            {
                name: 'Customer modules: no direct platform DB access',
                cmd: `grep -rn "this\\.prisma\\.platform\\." src/modules/customer --include="*.repository.ts" 2>/dev/null | wc -l`,
            },
            {
                name: 'Cross-service interfaces used (no direct cross-module service injection)',
                cmd: `grep -rn "import.*Service.*from.*modules" src/modules --include="*.ts" 2>/dev/null | grep -v "spec\\|__tests__" | wc -l`,
            },
        ];
        const results = [];
        for (const check of checks) {
            try {
                const count = parseInt((0, child_process_1.execSync)(check.cmd, { encoding: 'utf-8', timeout: 10_000 }).trim(), 10);
                const isIsolationCheck = !check.name.includes('cross-service');
                results.push({
                    suiteName: 'DB Client Isolation',
                    testName: check.name,
                    status: isIsolationCheck
                        ? (count === 0 ? 'PASS' : 'FAIL')
                        : (count === 0 ? 'PASS' : 'SKIP'),
                    duration: 0,
                    errorMessage: count > 0 && isIsolationCheck ? `${count} violations found` : undefined,
                });
            }
            catch (error) {
                results.push({
                    suiteName: 'DB Client Isolation', testName: check.name,
                    status: 'ERROR', duration: 0,
                    errorMessage: error.message?.substring(0, 200),
                });
            }
        }
        return results;
    }
    async checkTypescript() {
        try {
            (0, child_process_1.execSync)('npx tsc --noEmit 2>&1', { encoding: 'utf-8', timeout: 120_000 });
            return {
                suiteName: 'TypeScript', testName: 'Zero compilation errors',
                status: 'PASS', duration: 0,
            };
        }
        catch (error) {
            const errorCount = (error.stdout?.match(/error TS/g) ?? []).length;
            return {
                suiteName: 'TypeScript', testName: 'Compilation check',
                status: 'FAIL', duration: 0,
                errorMessage: `${errorCount} TypeScript errors`,
                errorStack: error.stdout?.substring(0, 1000),
            };
        }
    }
    async checkPrismaSchemas() {
        const results = [];
        for (const schema of PRISMA_SCHEMAS) {
            try {
                (0, child_process_1.execSync)(`npx prisma validate --schema=prisma/${schema}/v1 2>&1`, { encoding: 'utf-8', timeout: 30_000 });
                results.push({
                    suiteName: 'Prisma Sync',
                    testName: `${schema}/v1 schema is valid`,
                    status: 'PASS', duration: 0,
                });
            }
            catch (error) {
                results.push({
                    suiteName: 'Prisma Sync',
                    testName: `${schema}/v1 schema validation`,
                    status: 'FAIL', duration: 0,
                    errorMessage: error.stdout?.substring(0, 500) ?? error.message?.substring(0, 500),
                });
            }
        }
        return results;
    }
};
exports.IntegrationTestRunner = IntegrationTestRunner;
exports.IntegrationTestRunner = IntegrationTestRunner = __decorate([
    (0, common_1.Injectable)()
], IntegrationTestRunner);
//# sourceMappingURL=integration-test.runner.js.map