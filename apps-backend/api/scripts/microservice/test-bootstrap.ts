#!/usr/bin/env ts-node
/**
 * Microservice Bootstrap Test  (X6-2)
 *
 * Verifies that each of the 3 service boundaries can resolve their full
 * NestJS DI graph independently — without database connections.
 *
 * Uses Test.createTestingModule().compile() which resolves providers without
 * calling lifecycle hooks (onModuleInit). PrismaService is overridden with a
 * stub so no DB URL is needed.
 *
 * Usage:
 *   npm run test:microservice-bootstrap
 *
 * Exit code:
 *   0 — all 3 DI graphs resolve (extraction is safe)
 *   1 — at least one service has an unresolvable DI error
 *
 * Failure categories:
 *   DI error  — cross-service dep not stubbed → MUST FIX before extraction
 *   OK        — DI resolves → ready for extraction
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/core/prisma/prisma.service';
import { TenantContextService } from '../../src/modules/core/identity/tenant/infrastructure/tenant-context.service';
import { WorkflowEngineService } from '../../src/core/workflow/workflow-engine.service';
import { ConditionEvaluatorService } from '../../src/core/workflow/condition-evaluator.service';
import { MakerCheckerEngine } from '../../src/core/permissions/engines/maker-checker.engine';

// ─── Stubs — prevent DB connections and cross-service injection failures ──────
const PRISMA_STUB = {
  identity: { user: {}, tenant: {}, role: {}, permission: {}, $queryRawUnsafe: async () => [] },
  platform: { package: {}, plugin: {}, lookup: {}, $queryRawUnsafe: async () => [] },
  working:  { contact: {}, lead: {}, organization: {}, $queryRawUnsafe: async () => [] },
  $transaction: async (fn: (tx: unknown) => unknown) => fn({}),
  $connect: async () => {},
  $disconnect: async () => {},
};

const TENANT_CONTEXT_STUB = {
  getTenantId: () => null,
  setTenantId: () => {},
  getWorkingClient: () => PRISMA_STUB.working,
};

const WORKFLOW_ENGINE_STUB = {
  execute: async () => ({}),
  initialize: async () => ({}),
  rollback: async () => ({}),
  getActiveInstances: async () => [],
};

const CONDITION_EVAL_STUB = {
  evaluate: async () => true,
  evaluateAll: async () => true,
};

const MAKER_CHECKER_STUB = {
  approve: async () => ({}),
  reject: async () => ({}),
  submit: async () => ({}),
  getPending: async () => [],
};

interface BootResult {
  passed: boolean;
  detail?: string;
}

async function testBootstrap(serviceName: string, moduleImportPath: string): Promise<BootResult> {
  process.stdout.write(`\n  🔄  ${serviceName} — resolving DI...`);

  try {
    const moduleFile = await import(moduleImportPath);

    const ModuleClass = Object.values(moduleFile).find(
      (v): v is new (...args: unknown[]) => unknown =>
        typeof v === 'function' && v.name.includes('Module'),
    );

    if (!ModuleClass) {
      return { passed: false, detail: `No Module class found in ${moduleImportPath}` };
    }

    // Override all cross-service providers globally so nested modules can resolve them
    const moduleRef: TestingModule = await Test.createTestingModule({ imports: [ModuleClass as any] })
      .overrideProvider(PrismaService).useValue(PRISMA_STUB)
      .overrideProvider(TenantContextService).useValue(TENANT_CONTEXT_STUB)
      .overrideProvider(WorkflowEngineService).useValue(WORKFLOW_ENGINE_STUB)
      .overrideProvider(ConditionEvaluatorService).useValue(CONDITION_EVAL_STUB)
      .overrideProvider(MakerCheckerEngine).useValue(MAKER_CHECKER_STUB)
      .compile();

    await moduleRef.close();

    process.stdout.write(' ✅\n');
    return { passed: true };
  } catch (err: unknown) {
    const error = err as Error;
    process.stdout.write(' ❌\n');
    return { passed: false, detail: error.message };
  }
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║   MICROSERVICE BOOTSTRAP TEST  (X6-2)            ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('  Method: Test.createTestingModule().compile()');
  console.log('  PrismaService: stubbed (no DB connection needed)');

  const tests = [
    { name: 'Vendor Service',   path: '../../src/vendor-service.module' },
    { name: 'Identity Service', path: '../../src/identity-service.module' },
    { name: 'Work Service',     path: '../../src/work-service.module' },
  ];

  const results: Array<{ name: string; result: BootResult }> = [];
  for (const t of tests) {
    results.push({ name: t.name, result: await testBootstrap(t.name, t.path) });
  }

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║   RESULTS                                        ║');
  console.log('╠══════════════════════════════════════════════════╣');

  let failures = 0;
  for (const { name, result } of results) {
    if (result.passed) {
      console.log(`║  ✅  ${name.padEnd(44)} ║`);
    } else {
      console.log(`║  ❌  ${name.padEnd(44)} ║`);
      const msg = (result.detail ?? '').slice(0, 44).padEnd(44);
      console.log(`║      ${msg} ║`);
      failures++;
    }
  }

  console.log('╠══════════════════════════════════════════════════╣');

  if (failures === 0) {
    console.log('║  🎉  ALL 3 SERVICES BOOT INDEPENDENTLY           ║');
    console.log('║      Microservice extraction is DI-safe          ║');
    console.log('╚══════════════════════════════════════════════════╝\n');
    process.exit(0);
  } else {
    console.log(`║  ⚠️   ${failures} FAILURE${failures > 1 ? 'S' : ''} — fix DI before extraction           ║`);
    console.log('╚══════════════════════════════════════════════════╝\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\nUnexpected failure:', err);
  process.exit(1);
});
