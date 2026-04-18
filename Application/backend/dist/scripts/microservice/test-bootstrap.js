#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const prisma_service_1 = require("../../src/core/prisma/prisma.service");
const tenant_context_service_1 = require("../../src/modules/core/identity/tenant/infrastructure/tenant-context.service");
const workflow_engine_service_1 = require("../../src/core/workflow/workflow-engine.service");
const condition_evaluator_service_1 = require("../../src/core/workflow/condition-evaluator.service");
const maker_checker_engine_1 = require("../../src/core/permissions/engines/maker-checker.engine");
const PRISMA_STUB = {
    identity: { user: {}, tenant: {}, role: {}, permission: {}, $queryRawUnsafe: async () => [] },
    platform: { package: {}, plugin: {}, lookup: {}, $queryRawUnsafe: async () => [] },
    working: { contact: {}, lead: {}, organization: {}, $queryRawUnsafe: async () => [] },
    $transaction: async (fn) => fn({}),
    $connect: async () => { },
    $disconnect: async () => { },
};
const TENANT_CONTEXT_STUB = {
    getTenantId: () => null,
    setTenantId: () => { },
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
async function testBootstrap(serviceName, moduleImportPath) {
    process.stdout.write(`\n  🔄  ${serviceName} — resolving DI...`);
    try {
        const moduleFile = await Promise.resolve(`${moduleImportPath}`).then(s => require(s));
        const ModuleClass = Object.values(moduleFile).find((v) => typeof v === 'function' && v.name.includes('Module'));
        if (!ModuleClass) {
            return { passed: false, detail: `No Module class found in ${moduleImportPath}` };
        }
        const moduleRef = await testing_1.Test.createTestingModule({ imports: [ModuleClass] })
            .overrideProvider(prisma_service_1.PrismaService).useValue(PRISMA_STUB)
            .overrideProvider(tenant_context_service_1.TenantContextService).useValue(TENANT_CONTEXT_STUB)
            .overrideProvider(workflow_engine_service_1.WorkflowEngineService).useValue(WORKFLOW_ENGINE_STUB)
            .overrideProvider(condition_evaluator_service_1.ConditionEvaluatorService).useValue(CONDITION_EVAL_STUB)
            .overrideProvider(maker_checker_engine_1.MakerCheckerEngine).useValue(MAKER_CHECKER_STUB)
            .compile();
        await moduleRef.close();
        process.stdout.write(' ✅\n');
        return { passed: true };
    }
    catch (err) {
        const error = err;
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
        { name: 'Vendor Service', path: '../../src/vendor-service.module' },
        { name: 'Identity Service', path: '../../src/identity-service.module' },
        { name: 'Work Service', path: '../../src/work-service.module' },
    ];
    const results = [];
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
        }
        else {
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
    }
    else {
        console.log(`║  ⚠️   ${failures} FAILURE${failures > 1 ? 'S' : ''} — fix DI before extraction           ║`);
        console.log('╚══════════════════════════════════════════════════╝\n');
        process.exit(1);
    }
}
main().catch((err) => {
    console.error('\nUnexpected failure:', err);
    process.exit(1);
});
//# sourceMappingURL=test-bootstrap.js.map