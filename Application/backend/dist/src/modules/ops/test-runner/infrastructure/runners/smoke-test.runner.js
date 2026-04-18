"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmokeTestRunner = void 0;
const common_1 = require("@nestjs/common");
const platform_client_1 = require("@prisma/platform-client");
const SMOKE_ROUTES = [
    { path: '/api/v1/health', module: 'health' },
    { path: '/api/v1/contacts', module: 'contacts' },
    { path: '/api/v1/leads', module: 'leads' },
    { path: '/api/v1/organizations', module: 'organizations' },
    { path: '/api/v1/products', module: 'products' },
    { path: '/api/v1/activities', module: 'activities' },
    { path: '/api/v1/invoices', module: 'invoices' },
    { path: '/api/v1/payments', module: 'payments' },
    { path: '/api/v1/quotations', module: 'quotations' },
    { path: '/api/v1/tickets', module: 'tickets' },
    { path: '/api/v1/workflows', module: 'workflows' },
    { path: '/api/v1/lookups/categories', module: 'lookups' },
    { path: '/api/v1/users', module: 'users' },
    { path: '/api/v1/roles', module: 'roles' },
];
let SmokeTestRunner = class SmokeTestRunner {
    constructor() {
        this.type = platform_client_1.TestType.SMOKE;
    }
    async run(config) {
        const startTime = Date.now();
        const results = [];
        const baseUrl = `http://localhost:${process.env.PORT ?? 3000}`;
        const routes = config.targetModules?.length
            ? SMOKE_ROUTES.filter(r => config.targetModules.includes(r.module))
            : SMOKE_ROUTES;
        for (const route of routes) {
            const testStart = Date.now();
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                const response = await fetch(`${baseUrl}${route.path}`, {
                    method: 'GET',
                    headers: { 'X-Smoke-Test': 'true' },
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                const passed = response.status < 500;
                results.push({
                    suiteName: 'SmokeTests',
                    testName: `GET ${route.path}`,
                    module: route.module,
                    status: passed ? 'PASS' : 'FAIL',
                    duration: Date.now() - testStart,
                    errorMessage: passed ? undefined : `HTTP ${response.status}`,
                });
            }
            catch (error) {
                const isTimeout = error.name === 'AbortError';
                results.push({
                    suiteName: 'SmokeTests',
                    testName: `GET ${route.path}`,
                    module: route.module,
                    status: isTimeout ? 'TIMEOUT' : 'ERROR',
                    duration: Date.now() - testStart,
                    errorMessage: error.message?.substring(0, 300),
                });
            }
        }
        return {
            type: platform_client_1.TestType.SMOKE,
            total: results.length,
            passed: results.filter(r => r.status === 'PASS').length,
            failed: results.filter(r => r.status === 'FAIL').length,
            skipped: 0,
            errors: results.filter(r => r.status === 'ERROR' || r.status === 'TIMEOUT').length,
            duration: Date.now() - startTime,
            results,
        };
    }
};
exports.SmokeTestRunner = SmokeTestRunner;
exports.SmokeTestRunner = SmokeTestRunner = __decorate([
    (0, common_1.Injectable)()
], SmokeTestRunner);
//# sourceMappingURL=smoke-test.runner.js.map