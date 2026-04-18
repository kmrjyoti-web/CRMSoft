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
var TestErrorAnalyzerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestErrorAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let TestErrorAnalyzerService = TestErrorAnalyzerService_1 = class TestErrorAnalyzerService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TestErrorAnalyzerService_1.name);
    }
    categorizeError(errorMessage, context) {
        const msg = (errorMessage ?? '').toLowerCase();
        const suite = (context?.suiteName ?? '').toLowerCase();
        const file = (context?.filePath ?? '').toLowerCase();
        let category = 'OTHER';
        let severity = 'MEDIUM';
        if (/p2002|p2025|p2003|p2000|foreign key|unique constraint|not null|constraint failed|database/.test(msg) ||
            suite.includes('db validation') || suite.includes('foreign key') || suite.includes('null constraint')) {
            category = 'DATABASE';
            severity = /p2002|unique|p2003|foreign key/.test(msg) ? 'HIGH' : 'MEDIUM';
        }
        else if (/validation failed|is required|invalid|must be|should be|too short|too long|pattern/.test(msg) ||
            suite.includes('validation')) {
            category = 'VALIDATION';
            severity = 'LOW';
        }
        else if (/unauthorized|forbidden|401|403|token|auth|injection|xss|csrf|bypass|payload reflected/.test(msg) ||
            suite.includes('sql injection') || suite.includes('xss') || suite.includes('auth bypass') || suite.includes('security')) {
            category = 'SECURITY';
            severity = /sql injection|xss|bypass/.test(msg) ? 'CRITICAL' : 'HIGH';
        }
        else if (/expected.*got|status code|response shape|required field|missing field|api contract/.test(msg) ||
            suite.includes('api') || suite.includes('contract') || suite.includes('smoke')) {
            category = 'API_CONTRACT';
            severity = 'HIGH';
        }
        else if (/circular|import|barrel|module boundary|layer purity|dependency|naming convention|kebab|pascal/.test(msg) ||
            suite.includes('architecture') || suite.includes('dependency') || suite.includes('naming') || suite.includes('illegal')) {
            category = 'ARCHITECTURE';
            severity = /circular dependency/.test(msg) ? 'HIGH' : 'LOW';
        }
        else if (/econnrefused|timeout|cannot connect|connection refused|config|environment/.test(msg)) {
            category = 'CONFIGURATION';
            severity = 'HIGH';
        }
        else if (/slow|memory|large|performance|took.*ms|timeout.*ms/.test(msg)) {
            category = 'PERFORMANCE';
            severity = 'MEDIUM';
        }
        else if (/render|hydration|component|react|dom/.test(msg) || file.includes('/ui/') || file.includes('/components/')) {
            category = 'UI_RENDER';
            severity = 'MEDIUM';
        }
        else if (/cannot read|undefined|null|typeerror|referenceerror|error:/.test(msg)) {
            category = 'FUNCTIONAL';
            severity = 'HIGH';
        }
        if (/data loss|drop table|delete all|truncate|orphan record/.test(msg)) {
            severity = 'CRITICAL';
        }
        const isReportable = severity === 'CRITICAL' || severity === 'HIGH';
        return { category, severity, isReportable };
    }
    async persistRunErrors(testRunId) {
        const failedResults = await this.prisma.platform.testResult.findMany({
            where: { testRunId, status: { in: ['FAIL', 'ERROR'] } },
            select: {
                id: true, suiteName: true, testName: true, module: true,
                filePath: true, errorMessage: true, errorStack: true,
            },
        });
        if (failedResults.length === 0)
            return 0;
        const errorLogs = failedResults.map(r => {
            const { category, severity, isReportable } = this.categorizeError(r.errorMessage ?? r.testName, { suiteName: r.suiteName, filePath: r.filePath ?? undefined });
            return {
                testRunId,
                testResultId: r.id,
                errorCategory: category,
                severity,
                isReportable,
                message: r.errorMessage ?? r.testName,
                stackTrace: r.errorStack,
                moduleName: r.module,
                filePath: r.filePath,
            };
        });
        await this.prisma.platform.testErrorLog.createMany({ data: errorLogs });
        this.logger.log(`Persisted ${errorLogs.length} error log(s) for run ${testRunId}`);
        return errorLogs.length;
    }
    async reportToVendor(errorId, context) {
        const error = await this.prisma.platform.testErrorLog.findUnique({ where: { id: errorId } });
        if (!error)
            throw new common_1.NotFoundException(`TestErrorLog ${errorId} not found`);
        if (error.severity === 'LOW' || error.severity === 'MEDIUM') {
            throw new Error(`Only HIGH or CRITICAL errors can be reported to vendor. Current severity: ${error.severity}`);
        }
        await this.prisma.platform.testErrorLog.update({
            where: { id: errorId },
            data: { reportedToVendor: true, reportedAt: new Date(), vendorResponse: context ?? null },
        });
        this.logger.log(`Error ${errorId} reported to vendor (severity: ${error.severity})`);
    }
    async markResolved(errorId, resolvedBy, resolution) {
        await this.prisma.platform.testErrorLog.update({
            where: { id: errorId },
            data: { isResolved: true, resolvedBy, resolvedAt: new Date(), resolution },
        });
    }
    async getErrorDashboard(tenantId, days = 30) {
        const from = new Date();
        from.setDate(from.getDate() - days);
        const to = new Date();
        const where = { createdAt: { gte: from } };
        const [total, unresolved, critical, byCategoryRaw, bySeverityRaw, trendRaw, resolvedLogs] = await Promise.all([
            this.prisma.platform.testErrorLog.count({ where }),
            this.prisma.platform.testErrorLog.count({ where: { ...where, isResolved: false } }),
            this.prisma.platform.testErrorLog.count({ where: { ...where, severity: 'CRITICAL', isResolved: false } }),
            this.prisma.platform.testErrorLog.groupBy({ by: ['errorCategory'], where, _count: { id: true } }),
            this.prisma.platform.testErrorLog.groupBy({ by: ['severity'], where, _count: { id: true } }),
            this.prisma.platform.$queryRaw `
          SELECT DATE("created_at")::text AS date, COUNT(*) AS count
          FROM "test_error_logs"
          WHERE "created_at" >= ${from}
          GROUP BY DATE("created_at")
          ORDER BY DATE("created_at") ASC
        `,
            this.prisma.platform.testErrorLog.findMany({
                where: { ...where, isResolved: true, resolvedAt: { not: null } },
                select: { createdAt: true, resolvedAt: true },
            }),
        ]);
        const resolutionRate = total > 0 ? Math.round(((total - unresolved) / total) * 100) : 0;
        let meanTimeToResolutionMs = null;
        if (resolvedLogs.length > 0) {
            const totalMs = resolvedLogs.reduce((sum, l) => {
                return sum + (l.resolvedAt.getTime() - l.createdAt.getTime());
            }, 0);
            meanTimeToResolutionMs = Math.round(totalMs / resolvedLogs.length);
        }
        const byCategory = {};
        for (const row of byCategoryRaw) {
            byCategory[row.errorCategory] = row._count.id;
        }
        const bySeverity = {};
        for (const row of bySeverityRaw) {
            bySeverity[row.severity] = row._count.id;
        }
        const trend = trendRaw.map(r => ({ date: r.date, count: Number(r.count) }));
        const allErrors = await this.prisma.platform.testErrorLog.findMany({
            where,
            select: { message: true, errorCategory: true },
        });
        const messageFreq = {};
        for (const e of allErrors) {
            const key = e.message.substring(0, 100);
            if (!messageFreq[key])
                messageFreq[key] = { count: 0, category: e.errorCategory };
            messageFreq[key].count++;
        }
        const top10 = Object.entries(messageFreq)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 10)
            .map(([message, v]) => ({ message, count: v.count, category: v.category }));
        return {
            period: { days, from, to },
            total,
            unresolved,
            critical,
            resolutionRate,
            meanTimeToResolutionMs,
            byCategory,
            bySeverity,
            trend,
            top10,
        };
    }
    async generateReport(testRunId) {
        const run = await this.prisma.platform.testRun.findUnique({
            where: { id: testRunId },
            include: { results: true, errorLogs: true },
        });
        if (!run)
            throw new common_1.NotFoundException(`TestRun ${testRunId} not found`);
        const byCategory = {};
        const byModule = {};
        for (const r of run.results) {
            const cat = r.testType;
            if (!byCategory[cat])
                byCategory[cat] = { total: 0, passed: 0, failed: 0 };
            byCategory[cat].total++;
            if (r.status === 'PASS')
                byCategory[cat].passed++;
            if (r.status === 'FAIL' || r.status === 'ERROR')
                byCategory[cat].failed++;
            const mod = r.module ?? 'general';
            if (!byModule[mod])
                byModule[mod] = { total: 0, passed: 0, failed: 0 };
            byModule[mod].total++;
            if (r.status === 'PASS')
                byModule[mod].passed++;
            if (r.status === 'FAIL' || r.status === 'ERROR')
                byModule[mod].failed++;
        }
        const errorSummary = {
            total: run.errorLogs.length,
            critical: run.errorLogs.filter(e => e.severity === 'CRITICAL').length,
            high: run.errorLogs.filter(e => e.severity === 'HIGH').length,
            reportable: run.errorLogs.filter(e => e.isReportable).length,
        };
        const recommendations = [];
        if (errorSummary.critical > 0)
            recommendations.push(`${errorSummary.critical} CRITICAL error(s) require immediate attention`);
        if (run.failed > run.passed * 0.2)
            recommendations.push('Failure rate exceeds 20% — consider rolling back recent changes');
        const summary = {
            runId: testRunId,
            status: run.status,
            totalTests: run.totalTests,
            passed: run.passed,
            failed: run.failed,
            passRate: run.totalTests > 0 ? Math.round((run.passed / run.totalTests) * 100) : 0,
            duration: run.duration,
        };
        await this.prisma.platform.testReport.upsert({
            where: { testRunId },
            create: {
                testRunId,
                summary,
                categoryResults: byCategory,
                moduleResults: byModule,
                errorSummary,
                recommendations,
            },
            update: {
                summary,
                categoryResults: byCategory,
                moduleResults: byModule,
                errorSummary,
                recommendations,
            },
        });
        return testRunId;
    }
};
exports.TestErrorAnalyzerService = TestErrorAnalyzerService;
exports.TestErrorAnalyzerService = TestErrorAnalyzerService = TestErrorAnalyzerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TestErrorAnalyzerService);
//# sourceMappingURL=test-error-analyzer.service.js.map