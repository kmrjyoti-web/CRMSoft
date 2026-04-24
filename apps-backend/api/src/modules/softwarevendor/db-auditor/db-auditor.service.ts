import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { NamingCheckService } from './checks/naming-check.service';
import { CrossDbIncludeCheckService } from './checks/cross-db-include-check.service';
import { FkOrphanCheckService } from './checks/fk-orphan-check.service';
import { AuditReport, AuditCheckId, AuditFinding } from './dto/audit-finding.dto';

@Injectable()
export class DbAuditorService {
  private readonly logger = new Logger(DbAuditorService.name);
  private lastReport: AuditReport | null = null;

  constructor(
    private readonly namingCheck: NamingCheckService,
    private readonly crossDbCheck: CrossDbIncludeCheckService,
    private readonly fkOrphanCheck: FkOrphanCheckService,
  ) {}

  async runAll(options?: { db?: string; deep?: boolean; skip?: AuditCheckId[] }): Promise<AuditReport> {
    const allChecks: AuditCheckId[] = ['naming', 'crossDbInclude', 'fkOrphan'];
    const checks = options?.skip?.length
      ? allChecks.filter((c) => !options.skip!.includes(c))
      : allChecks;
    return this.run(checks, options);
  }

  async runCheck(checkId: AuditCheckId, options?: { db?: string; deep?: boolean }): Promise<AuditReport> {
    return this.run([checkId], options);
  }

  private async run(
    checks: AuditCheckId[],
    options?: { db?: string; deep?: boolean },
  ): Promise<AuditReport> {
    const runId = randomUUID();
    const startedAt = new Date();
    const allFindings: AuditFinding[] = [];

    for (const check of checks) {
      try {
        let findings: AuditFinding[] = [];
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
      } catch (error) {
        this.logger.error(`Check '${check}' failed`, error);
        allFindings.push({
          severity: 'error',
          check,
          db: options?.db ?? 'all',
          rule: 'check-failed',
          message: `Check '${check}' threw an exception: ${(error as Error).message}`,
        });
      }
    }

    const finishedAt = new Date();
    const report: AuditReport = {
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

  getLastReport(): AuditReport | null {
    return this.lastReport;
  }

  private buildSummary(findings: AuditFinding[]): AuditReport['summary'] {
    const byCheck: Record<AuditCheckId, number> = { naming: 0, crossDbInclude: 0, fkOrphan: 0 };
    const byDb: Record<string, number> = {};

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

  private persistReport(report: AuditReport) {
    try {
      const auditDir = path.resolve(process.cwd(), 'docs/health-reports/audit-runs');
      if (!fs.existsSync(auditDir)) {
        fs.mkdirSync(auditDir, { recursive: true });
      }

      const reportJson = JSON.stringify(report, null, 2);
      fs.writeFileSync(path.join(auditDir, `${report.runId}.json`), reportJson);

      const latestPath = path.resolve(process.cwd(), 'docs/health-reports/latest-audit.json');
      fs.writeFileSync(latestPath, reportJson);
    } catch (error) {
      this.logger.warn('Failed to persist audit report to disk', error);
    }
  }
}
