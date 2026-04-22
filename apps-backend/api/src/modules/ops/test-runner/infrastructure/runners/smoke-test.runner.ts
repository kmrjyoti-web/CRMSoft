import { Injectable } from '@nestjs/common';
import { TestType } from '@prisma/platform-client';
import type { ITestTypeRunner, TestRunConfig, TestTypeResult, SingleTestResult } from './test-runner.interface';

// Predefined health-check routes to smoke test (safe GET endpoints)
const SMOKE_ROUTES: { path: string; module: string }[] = [
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

@Injectable()
export class SmokeTestRunner implements ITestTypeRunner {
  type = TestType.SMOKE;

  async run(config: TestRunConfig): Promise<TestTypeResult> {
    const startTime = Date.now();
    const results: SingleTestResult[] = [];
    const baseUrl = `http://localhost:${process.env.PORT ?? 3000}`;

    const routes = config.targetModules?.length
      ? SMOKE_ROUTES.filter(r => config.targetModules!.includes(r.module))
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

        // 401/403 = auth required (expected), 404 = route doesn't exist yet — still pass
        // 500+ = server error = FAIL
        const passed = response.status < 500;

        results.push({
          suiteName: 'SmokeTests',
          testName: `GET ${route.path}`,
          module: route.module,
          status: passed ? 'PASS' : 'FAIL',
          duration: Date.now() - testStart,
          errorMessage: passed ? undefined : `HTTP ${response.status}`,
        });
      } catch (error: any) {
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
      type: TestType.SMOKE,
      total: results.length,
      passed: results.filter(r => r.status === 'PASS').length,
      failed: results.filter(r => r.status === 'FAIL').length,
      skipped: 0,
      errors: results.filter(r => r.status === 'ERROR' || r.status === 'TIMEOUT').length,
      duration: Date.now() - startTime,
      results,
    };
  }
}
