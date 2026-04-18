"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DbAuditorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbAuditorService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const fs = require("fs");
const path = require("path");
const naming_check_service_1 = require("./checks/naming-check.service");
const cross_db_include_check_service_1 = require("./checks/cross-db-include-check.service");
const fk_orphan_check_service_1 = require("./checks/fk-orphan-check.service");
let DbAuditorService = DbAuditorService_1 = class DbAuditorService {
    constructor(namingCheck, crossDbCheck, fkOrphanCheck) {
        this.namingCheck = namingCheck;
        this.crossDbCheck = crossDbCheck;
        this.fkOrphanCheck = fkOrphanCheck;
        this.logger = new common_1.Logger(DbAuditorService_1.name);
        this.lastReport = null;
    }
    async runAll(options) {
        const allChecks = ['naming', 'crossDbInclude', 'fkOrphan'];
        const checks = options?.skip?.length
            ? allChecks.filter((c) => !options.skip.includes(c))
            : allChecks;
        return this.run(checks, options);
    }
    async runCheck(checkId, options) {
        return this.run([checkId], options);
    }
    async run(checks, options) {
        const runId = (0, crypto_1.randomUUID)();
        const startedAt = new Date();
        const allFindings = [];
        for (const check of checks) {
            try {
                let findings = [];
                switch (check) {
                    case 'naming':
                        findings = await this.namingCheck.run(options?.db);
                        break;
                    case 'crossDbInclude':
                        findings = await this.crossDbCheck.run();
                        break;
                    case 'fkOrphan':
                        findings = await this.fkOrphanCheck.run(options?.db, options?.deep);
                        break;
                }
                allFindings.push(...findings);
            }
            catch (error) {
                this.logger.error(`Check '${check}' failed`, error);
                allFindings.push({
                    severity: 'error',
                    check,
                    db: options?.db ?? 'all',
                    rule: 'check-failed',
                    message: `Check '${check}' threw an exception: ${error.message}`,
                });
            }
        }
        const finishedAt = new Date();
        const report = {
            runId,
            startedAt,
            finishedAt,
            durationMs: finishedAt.getTime() - startedAt.getTime(),
            summary: this.buildSummary(allFindings),
            findings: allFindings,
        };
        this.lastReport = report;
        this.persistReport(report);
        return report;
    }
    getLastReport() {
        return this.lastReport;
    }
    buildSummary(findings) {
        const byCheck = { naming: 0, crossDbInclude: 0, fkOrphan: 0 };
        const byDb = {};
        for (const f of findings) {
            byCheck[f.check] = (byCheck[f.check] || 0) + 1;
            byDb[f.db] = (byDb[f.db] || 0) + 1;
        }
        return {
            totalFindings: findings.length,
            errors: findings.filter((f) => f.severity === 'error').length,
            warnings: findings.filter((f) => f.severity === 'warn').length,
            byCheck,
            byDb,
        };
    }
    persistReport(report) {
        try {
            const auditDir = path.resolve(process.cwd(), 'docs/health-reports/audit-runs');
            if (!fs.existsSync(auditDir)) {
                fs.mkdirSync(auditDir, { recursive: true });
            }
            const reportJson = JSON.stringify(report, null, 2);
            fs.writeFileSync(path.join(auditDir, `${report.runId}.json`), reportJson);
            const latestPath = path.resolve(process.cwd(), 'docs/health-reports/latest-audit.json');
            fs.writeFileSync(latestPath, reportJson);
        }
        catch (error) {
            this.logger.warn('Failed to persist audit report to disk', error);
        }
    }
};
exports.DbAuditorService = DbAuditorService;
exports.DbAuditorService = DbAuditorService = DbAuditorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [naming_check_service_1.NamingCheckService,
        cross_db_include_check_service_1.CrossDbIncludeCheckService,
        fk_orphan_check_service_1.FkOrphanCheckService])
], DbAuditorService);
//# sourceMappingURL=db-auditor.service.js.map