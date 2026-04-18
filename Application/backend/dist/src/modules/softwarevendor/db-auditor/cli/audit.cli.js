#!/usr/bin/env ts-node
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../core/prisma/prisma.module");
const db_auditor_service_1 = require("../db-auditor.service");
const naming_check_service_1 = require("../checks/naming-check.service");
const cross_db_include_check_service_1 = require("../checks/cross-db-include-check.service");
const fk_orphan_check_service_1 = require("../checks/fk-orphan-check.service");
let AuditCliModule = class AuditCliModule {
};
AuditCliModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [db_auditor_service_1.DbAuditorService, naming_check_service_1.NamingCheckService, cross_db_include_check_service_1.CrossDbIncludeCheckService, fk_orphan_check_service_1.FkOrphanCheckService],
    })
], AuditCliModule);
async function main() {
    const args = process.argv.slice(2);
    const checkArg = args.find((a) => a.startsWith('--check='))?.split('=')[1];
    const skipArg = args.find((a) => a.startsWith('--skip='))?.split('=')[1];
    const dbArg = args.find((a) => a.startsWith('--db='))?.split('=')[1];
    const formatArg = args.find((a) => a.startsWith('--format='))?.split('=')[1] ?? 'table';
    const deep = args.includes('--deep');
    const softFail = args.includes('--soft-fail');
    const skipChecks = skipArg ? skipArg.split(',') : [];
    const app = await core_1.NestFactory.createApplicationContext(AuditCliModule, { logger: ['error', 'warn'] });
    const service = app.get(db_auditor_service_1.DbAuditorService);
    const report = checkArg
        ? await service.runCheck(checkArg, { db: dbArg, deep })
        : await service.runAll({ db: dbArg, deep, skip: skipChecks });
    await app.close();
    if (formatArg === 'json') {
        process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    }
    else {
        console.log(`\n=== DB Schema Audit Report ===`);
        console.log(`Run ID: ${report.runId}`);
        console.log(`Duration: ${report.durationMs}ms`);
        console.log(`Findings: ${report.summary.totalFindings} (${report.summary.errors} errors, ${report.summary.warnings} warnings)\n`);
        if (report.findings.length === 0) {
            console.log('  No findings. All checks passed.\n');
        }
        else {
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
//# sourceMappingURL=audit.cli.js.map