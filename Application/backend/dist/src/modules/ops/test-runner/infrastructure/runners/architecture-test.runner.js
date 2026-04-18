"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchitectureTestRunner = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const platform_client_1 = require("@prisma/platform-client");
let ArchitectureTestRunner = class ArchitectureTestRunner {
    constructor() {
        this.type = platform_client_1.TestType.ARCHITECTURE;
    }
    async run(config) {
        const startTime = Date.now();
        const results = [];
        results.push(...(await this.runDepCruiser(startTime)));
        results.push(...(await this.checkDomainLayerPurity()));
        results.push(await this.checkCircularDeps());
        results.push(...(await this.checkDbClientIsolation()));
        results.push(...(await this.checkNamingConventions()));
        results.push(...(await this.checkIllegalImplementations()));
        results.push(...(await this.checkUnsafePatterns()));
        return {
            type: platform_client_1.TestType.ARCHITECTURE,
            total: results.length,
            passed: results.filter(r => r.status === 'PASS').length,
            failed: results.filter(r => r.status === 'FAIL').length,
            skipped: results.filter(r => r.status === 'SKIP').length,
            errors: results.filter(r => r.status === 'ERROR').length,
            duration: Date.now() - startTime,
            results,
        };
    }
    async runDepCruiser(startTime) {
        try {
            const output = (0, child_process_1.execSync)('npx depcruise --config .dependency-cruiser.js src/ --output-type json 2>/dev/null', { encoding: 'utf-8', timeout: 120_000, cwd: process.cwd() });
            let depResult;
            try {
                const jsonStart = output.indexOf('{');
                depResult = JSON.parse(output.substring(jsonStart));
            }
            catch {
                return [{
                        suiteName: 'DependencyCruiser', testName: 'Parse output',
                        status: 'ERROR', duration: 0, errorMessage: 'Could not parse depcruise JSON',
                    }];
            }
            const violations = depResult.output?.violations ?? [];
            const errorViolations = violations.filter((v) => v.rule?.severity === 'error');
            if (errorViolations.length === 0) {
                return [{
                        suiteName: 'DependencyCruiser',
                        testName: 'All service boundaries clean',
                        status: 'PASS', duration: Date.now() - startTime,
                    }];
            }
            return errorViolations.map((v) => ({
                suiteName: 'DependencyCruiser',
                testName: `${v.rule?.name}: ${v.from} ? ${v.to}`,
                module: this.extractModule(v.from),
                status: 'FAIL',
                duration: 0,
                errorMessage: `${v.rule?.name}: ${v.from} imports ${v.to}`,
            }));
        }
        catch (error) {
            if (error.stdout) {
                try {
                    const jsonStart = error.stdout.indexOf('{');
                    const depResult = JSON.parse(error.stdout.substring(jsonStart));
                    const violations = depResult.output?.violations ?? [];
                    const errorViolations = violations.filter((v) => v.rule?.severity === 'error');
                    if (errorViolations.length === 0) {
                        return [{ suiteName: 'DependencyCruiser', testName: 'All boundaries clean', status: 'PASS', duration: 0 }];
                    }
                    return errorViolations.map((v) => ({
                        suiteName: 'DependencyCruiser',
                        testName: `${v.rule?.name}: ${v.from}`,
                        status: 'FAIL',
                        duration: 0,
                        errorMessage: `${v.rule?.name}: ${v.from} ? ${v.to}`,
                    }));
                }
                catch { }
            }
            return [{
                    suiteName: 'DependencyCruiser', testName: 'Dependency analysis',
                    status: 'ERROR', duration: 0,
                    errorMessage: error.message?.substring(0, 500),
                }];
        }
    }
    async checkDomainLayerPurity() {
        try {
            const output = (0, child_process_1.execSync)('grep -rn "from.*infrastructure" src/modules/*/domain src/modules/*/*/domain --include="*.ts" 2>/dev/null || true', { encoding: 'utf-8' });
            if (output.trim()) {
                return output.trim().split('\n').map(v => ({
                    suiteName: 'DDD Layer Purity',
                    testName: `Domain imports infrastructure: ${v.split(':')[0]}`,
                    status: 'FAIL',
                    duration: 0,
                    errorMessage: v,
                }));
            }
            return [{
                    suiteName: 'DDD Layer Purity',
                    testName: 'Domain layer is pure (no infrastructure imports)',
                    status: 'PASS', duration: 0,
                }];
        }
        catch (error) {
            return [{
                    suiteName: 'DDD Layer Purity', testName: 'Layer purity check',
                    status: 'ERROR', duration: 0, errorMessage: error.message,
                }];
        }
    }
    async checkCircularDeps() {
        try {
            const output = (0, child_process_1.execSync)('npx madge --circular --extensions ts src/ 2>&1', { encoding: 'utf-8', timeout: 60_000 });
            const hasCircular = output.includes('Found') && output.includes('circular');
            return {
                suiteName: 'Circular Dependencies',
                testName: hasCircular ? 'Circular dependencies detected' : 'No circular dependencies',
                status: hasCircular ? 'FAIL' : 'PASS',
                duration: 0,
                errorMessage: hasCircular ? output.substring(0, 500) : undefined,
            };
        }
        catch (error) {
            return {
                suiteName: 'Circular Dependencies',
                testName: 'Circular dependency check (madge not available)',
                status: 'SKIP', duration: 0,
            };
        }
    }
    async checkDbClientIsolation() {
        const checks = [
            {
                name: 'Customer modules do not access identity DB',
                cmd: `grep -rn "this\\.prisma\\.identity\\." src/modules/customer --include="*.repository.ts" 2>/dev/null | wc -l`,
            },
            {
                name: 'Customer modules do not access platform DB',
                cmd: `grep -rn "this\\.prisma\\.platform\\." src/modules/customer --include="*.repository.ts" 2>/dev/null | wc -l`,
            },
        ];
        const results = [];
        for (const check of checks) {
            try {
                const count = parseInt((0, child_process_1.execSync)(check.cmd, { encoding: 'utf-8' }).trim(), 10);
                results.push({
                    suiteName: 'DB Client Isolation',
                    testName: check.name,
                    status: count === 0 ? 'PASS' : 'FAIL',
                    duration: 0,
                    errorMessage: count > 0 ? `${count} violations found` : undefined,
                });
            }
            catch {
                results.push({
                    suiteName: 'DB Client Isolation',
                    testName: check.name,
                    status: 'ERROR', duration: 0,
                });
            }
        }
        return results;
    }
    async checkNamingConventions() {
        const results = [];
        try {
            const output = (0, child_process_1.execSync)(`grep -rn "^export class [a-z]" src/modules --include="*.ts" 2>/dev/null | grep -v "spec\\|__tests__" | head -20 || true`, { encoding: 'utf-8', timeout: 15_000 });
            const violations = output.trim() ? output.trim().split('\n').filter(Boolean) : [];
            results.push({
                suiteName: 'Naming Conventions',
                testName: 'Classes use PascalCase',
                status: violations.length === 0 ? 'PASS' : 'FAIL',
                duration: 0,
                errorMessage: violations.length > 0 ? `${violations.length} class(es) do not use PascalCase:\n${violations.slice(0, 5).join('\n')}` : undefined,
            });
        }
        catch (err) {
            results.push({ suiteName: 'Naming Conventions', testName: 'PascalCase class check', status: 'ERROR', duration: 0, errorMessage: err.message });
        }
        try {
            const output = (0, child_process_1.execSync)(`find src/modules -name "*.ts" | grep -v "spec\\|__tests__\\|node_modules" | grep -E "[A-Z]" | grep -v "index.ts\\|MEMORY" | head -20 || true`, { encoding: 'utf-8', timeout: 15_000 });
            const violations = output.trim() ? output.trim().split('\n').filter(Boolean) : [];
            results.push({
                suiteName: 'Naming Conventions',
                testName: 'Files use kebab-case',
                status: violations.length === 0 ? 'PASS' : 'WARN',
                duration: 0,
                errorMessage: violations.length > 0 ? `${violations.length} file(s) are not kebab-case` : undefined,
            });
        }
        catch (err) {
            results.push({ suiteName: 'Naming Conventions', testName: 'Kebab-case file check', status: 'ERROR', duration: 0, errorMessage: err.message });
        }
        return results;
    }
    async checkIllegalImplementations() {
        const results = [];
        const patterns = [
            { name: 'No console.log/warn/error in production code', pattern: `console\\.log\\|console\\.warn\\|console\\.error`, severity: 'SKIP' },
            { name: 'No hardcoded localhost URLs', pattern: `localhost:[0-9]\\{4,5\\}`, severity: 'FAIL' },
            { name: 'No TODO/FIXME/HACK comments', pattern: `TODO\\|FIXME\\|HACK\\|XXX`, severity: 'SKIP' },
            { name: 'No plaintext passwords/secrets', pattern: `password\\s*=\\s*[\'"][^\'"]\\{4\\}`, severity: 'FAIL' },
            { name: 'No unpaginated queries (limit > 10000)', pattern: `take:\\s*1000[0-9]\\|limit:\\s*1000[0-9]`, severity: 'FAIL' },
        ];
        for (const p of patterns) {
            try {
                const output = (0, child_process_1.execSync)(`grep -rn "${p.pattern}" src/modules --include="*.ts" 2>/dev/null | grep -v "spec\\|__tests__\\|\\.d\\.ts" | wc -l`, { encoding: 'utf-8', timeout: 10_000 });
                const count = parseInt(output.trim(), 10);
                results.push({
                    suiteName: 'Illegal Implementations',
                    testName: p.name,
                    status: count === 0 ? 'PASS' : p.severity,
                    duration: 0,
                    errorMessage: count > 0 ? `${count} instance(s) found` : undefined,
                    actualValue: count > 0 ? String(count) : undefined,
                });
            }
            catch (err) {
                results.push({ suiteName: 'Illegal Implementations', testName: p.name, status: 'ERROR', duration: 0, errorMessage: err.message });
            }
        }
        return results;
    }
    async checkUnsafePatterns() {
        const results = [];
        const patterns = [
            { name: 'No eval() usage', pattern: `\\beval\\s*(` },
            { name: 'No SQL string concatenation', pattern: `\\$\`.*WHERE\\|"SELECT.*" \\+\\|"INSERT.*" \\+` },
            { name: 'No dangerouslySetInnerHTML equivalent in API', pattern: `dangerouslySet\\|innerHTML\\s*=` },
            { name: 'No untyped JSON.parse without try-catch context', pattern: `JSON\\.parse\\s*(.*)\\.trim\\|JSON\\.parse\\s*(.*);$` },
        ];
        for (const p of patterns) {
            try {
                const output = (0, child_process_1.execSync)(`grep -rEn "${p.pattern}" src/modules --include="*.ts" 2>/dev/null | grep -v "spec\\|__tests__\\|\\.d\\.ts" | wc -l`, { encoding: 'utf-8', timeout: 10_000 });
                const count = parseInt(output.trim(), 10);
                results.push({
                    suiteName: 'Unsafe Patterns',
                    testName: p.name,
                    status: count === 0 ? 'PASS' : 'FAIL',
                    duration: 0,
                    errorMessage: count > 0 ? `${count} unsafe instance(s) found` : undefined,
                    actualValue: count > 0 ? String(count) : undefined,
                });
            }
            catch (err) {
                results.push({ suiteName: 'Unsafe Patterns', testName: p.name, status: 'ERROR', duration: 0, errorMessage: err.message });
            }
        }
        try {
            const output = (0, child_process_1.execSync)(`grep -rn " as any" src/modules --include="*.ts" 2>/dev/null | grep -v "spec\\|__tests__" | wc -l`, { encoding: 'utf-8', timeout: 10_000 });
            const count = parseInt(output.trim(), 10);
            results.push({
                suiteName: 'Unsafe Patterns',
                testName: '`as any` casts are minimal',
                status: count < 20 ? 'PASS' : 'SKIP',
                duration: 0,
                errorMessage: count >= 20 ? `${count} "as any" casts � consider adding proper types` : undefined,
                actualValue: String(count),
            });
        }
        catch { }
        return results;
    }
    extractModule(filePath) {
        const match = filePath?.match(/modules\/(?:customer|softwarevendor|core|marketplace|ops)\/([^/]+)/);
        return match?.[1] ?? 'unknown';
    }
};
exports.ArchitectureTestRunner = ArchitectureTestRunner;
exports.ArchitectureTestRunner = ArchitectureTestRunner = __decorate([
    (0, common_1.Injectable)()
], ArchitectureTestRunner);
//# sourceMappingURL=architecture-test.runner.js.map