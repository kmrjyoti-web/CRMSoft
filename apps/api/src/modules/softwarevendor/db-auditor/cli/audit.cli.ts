#!/usr/bin/env ts-node
/**
 * DB Schema Auditor — CLI entry point
 *
 * Usage:
 *   pnpm audit:db                    # all checks, all DBs
 *   pnpm audit:db --check=naming     # single check
 *   pnpm audit:db --db=working       # single DB
 *   pnpm audit:db --format=json      # JSON output for CI
 *   pnpm audit:db --skip=fkOrphan    # skip specific check (CI: no DB needed)
 *   pnpm audit:db --deep             # include large tables in FK check
 *   pnpm audit:db --soft-fail        # report errors but exit 0 (Week 2 rename window)
 */
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/prisma/prisma.module';
import { DbAuditorService } from '../db-auditor.service';
import { NamingCheckService } from '../checks/naming-check.service';
import { CrossDbIncludeCheckService } from '../checks/cross-db-include-check.service';
import { FkOrphanCheckService } from '../checks/fk-orphan-check.service';
import { AuditCheckId } from '../dto/audit-finding.dto';

@Module({
  imports: [PrismaModule],
  providers: [DbAuditorService, NamingCheckService, CrossDbIncludeCheckService, FkOrphanCheckService],
})
class AuditCliModule {}

async function main() {
  const args = process.argv.slice(2);
  const checkArg = args.find((a) => a.startsWith('--check='))?.split('=')[1] as AuditCheckId | undefined;
  const skipArg = args.find((a) => a.startsWith('--skip='))?.split('=')[1];
  const dbArg = args.find((a) => a.startsWith('--db='))?.split('=')[1];
  const formatArg = args.find((a) => a.startsWith('--format='))?.split('=')[1] ?? 'table';
  const deep = args.includes('--deep');
  const softFail = args.includes('--soft-fail');
  const skipChecks = skipArg ? skipArg.split(',') as AuditCheckId[] : [];

  const app = await NestFactory.createApplicationContext(AuditCliModule, { logger: ['error', 'warn'] });
  const service = app.get(DbAuditorService);

  const report = checkArg
    ? await service.runCheck(checkArg, { db: dbArg, deep })
    : await service.runAll({ db: dbArg, deep, skip: skipChecks });

  await app.close();

  if (formatArg === 'json') {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  } else {
    // Table format
    console.log(`\n=== DB Schema Audit Report ===`);
    console.log(`Run ID: ${report.runId}`);
    console.log(`Duration: ${report.durationMs}ms`);
    console.log(`Findings: ${report.summary.totalFindings} (${report.summary.errors} errors, ${report.summary.warnings} warnings)\n`);

    if (report.findings.length === 0) {
      console.log('  No findings. All checks passed.\n');
    } else {
      for (const f of report.findings) {
        const icon = f.severity === 'error' ? 'ERR' : 'WARN';
        const location = [f.db, f.table, f.file ? `${f.file}:${f.line}` : ''].filter(Boolean).join(' / ');
        console.log(`  [${icon}] ${f.check}/${f.rule}: ${f.message}`);
        console.log(`         ${location}\n`);
      }
    }
  }

  if (softFail) {
    console.log(`\n⚠️  --soft-fail active: ${report.summary.errors} error(s) reported but NOT failing the build.`);
    console.log(`   Remove --soft-fail after Week 2 renames complete.\n`);
    process.exit(0);
  }
  process.exit(report.summary.errors > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Audit CLI failed:', err);
  process.exit(2);
});
