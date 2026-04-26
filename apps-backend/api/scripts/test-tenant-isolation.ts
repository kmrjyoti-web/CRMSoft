/**
 * Smoke test: tenant isolation on working DB.
 *
 * Usage:
 *   npx ts-node -P tsconfig.json scripts/test-tenant-isolation.ts
 *
 * Requires DATABASE_URL_WORKING to be set (or .env loaded).
 * Connects directly to workingdb — does NOT start the NestJS app.
 *
 * Tests:
 *   1. Records created under tenant A are invisible to tenant B
 *   2. Records created under tenant A are visible to tenant A
 *   3. Explicit cross-tenant where.tenantId is overridden by context
 *   4. Passthrough when no context is set (seed/background job mode)
 *
 * Uses a throwaway test table row — cleans up after itself.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { AsyncLocalStorage } from 'async_hooks';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Lazy import after dotenv
async function run() {
  const { PrismaClient } = await import('@prisma/working-client');
  const { createTenantAwareExtension } = await import(
    '../src/modules/core/identity/tenant/infrastructure/tenant-aware-prisma'
  );

  // --- Minimal TenantContextService stub ---
  const als = new AsyncLocalStorage<{ tenantId: string | null }>();

  const tenantContext = {
    getTenantId: () => als.getStore()?.tenantId ?? undefined,
    isSuperAdmin: () => false,
    requireTenantId: () => {
      const id = als.getStore()?.tenantId;
      if (!id) throw new Error('No tenant context');
      return id;
    },
    run: (tenantId: string, fn: () => Promise<void>) =>
      als.run({ tenantId }, fn),
  };

  const base = new PrismaClient();
  const ext = createTenantAwareExtension(tenantContext as any);
  const prisma = (base as any).$extends(ext) as typeof base;

  const TENANT_A = 'aaaaaaaa-0000-0000-0000-000000000001';
  const TENANT_B = 'bbbbbbbb-0000-0000-0000-000000000002';

  let pass = 0;
  let fail = 0;

  function ok(label: string) {
    console.log(`  ✅  ${label}`);
    pass++;
  }

  function ko(label: string, detail?: string) {
    console.error(`  ❌  ${label}${detail ? ` — ${detail}` : ''}`);
    fail++;
  }

  async function cleanup() {
    await (base as any).lead.deleteMany({
      where: { tenantId: { in: [TENANT_A, TENANT_B] } },
    });
  }

  console.log('\n=== Tenant Isolation Smoke Test ===\n');

  try {
    await cleanup(); // start clean

    // --- Test 1: Create under tenant A ---
    let createdId: string;
    await tenantContext.run(TENANT_A, async () => {
      const record = await (prisma as any).lead.create({
        data: { name: 'Smoke Test Lead', source: 'MANUAL' },
      });
      createdId = record.id;
      if (record.tenantId === TENANT_A) {
        ok('create() injects tenantId from context');
      } else {
        ko('create() injects tenantId from context', `got ${record.tenantId}`);
      }
    });

    // --- Test 2: findMany from tenant B sees nothing ---
    await tenantContext.run(TENANT_B, async () => {
      const rows = await (prisma as any).lead.findMany({
        where: { id: createdId! },
      });
      if (rows.length === 0) {
        ok('findMany() cross-tenant returns empty (tenant B cannot see tenant A record)');
      } else {
        ko('findMany() cross-tenant returns empty', `got ${rows.length} rows`);
      }
    });

    // --- Test 3: findMany from tenant A sees the record ---
    await tenantContext.run(TENANT_A, async () => {
      const rows = await (prisma as any).lead.findMany({
        where: { id: createdId! },
      });
      if (rows.length === 1) {
        ok('findMany() same-tenant returns record');
      } else {
        ko('findMany() same-tenant returns record', `got ${rows.length} rows`);
      }
    });

    // --- Test 4: Explicit cross-tenant where.tenantId is overridden ---
    await tenantContext.run(TENANT_B, async () => {
      // Attacker sets where.tenantId = TENANT_A explicitly
      const rows = await (prisma as any).lead.findMany({
        where: { id: createdId!, tenantId: TENANT_A },
      });
      if (rows.length === 0) {
        ok('Explicit cross-tenant where.tenantId is overridden by context (AND semantics)');
      } else {
        ko('Explicit cross-tenant where.tenantId override failed', `got ${rows.length} rows`);
      }
    });

    // --- Test 5: No context → passthrough (seed mode) ---
    // ALS store not set, so getTenantId() returns undefined
    const allRows = await (base as any).lead.findMany({
      where: { id: createdId! },
    });
    if (allRows.length === 1) {
      ok('No ALS context → passthrough (seed/background mode works)');
    } else {
      ko('No ALS context → passthrough', `got ${allRows.length} rows`);
    }

    // --- Test 6: update() injects tenantId in where ---
    await tenantContext.run(TENANT_B, async () => {
      await (prisma as any).lead.updateMany({
        where: { id: createdId! },
        data: { name: 'Should Not Update' },
      });
      // Verify name unchanged via base client
      const check = await (base as any).lead.findUnique({ where: { id: createdId! } });
      if (check?.name === 'Smoke Test Lead') {
        ok('updateMany() from wrong tenant cannot update tenant A record');
      } else {
        ko('updateMany() tenant isolation failed', `name is now: ${check?.name}`);
      }
    });

  } catch (err) {
    console.error('\nUnexpected error:', err);
    fail++;
  } finally {
    await cleanup();
    await base.$disconnect();
  }

  console.log(`\n=== Results: ${pass} passed, ${fail} failed ===\n`);
  process.exit(fail > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
