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
var CompareTestRunsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompareTestRunsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const common_1 = require("@nestjs/common");
const compare_test_runs_query_1 = require("./compare-test-runs.query");
let CompareTestRunsHandler = CompareTestRunsHandler_1 = class CompareTestRunsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CompareTestRunsHandler_1.name);
    }
    async execute(query) {
        try {
            const [run1, run2] = await Promise.all([
                this.prisma.platform.testRun.findUnique({
                    where: { id: query.runId1 },
                    include: { results: true },
                }),
                this.prisma.platform.testRun.findUnique({
                    where: { id: query.runId2 },
                    include: { results: true },
                }),
            ]);
            if (!run1)
                throw new common_1.NotFoundException(`TestRun not found: ${query.runId1}`);
            if (!run2)
                throw new common_1.NotFoundException(`TestRun not found: ${query.runId2}`);
            const run1Map = new Map((run1.results ?? []).map((r) => [`${r.testType}::${r.suiteName}::${r.testName}`, r]));
            const run2Map = new Map((run2.results ?? []).map((r) => [`${r.testType}::${r.suiteName}::${r.testName}`, r]));
            const allKeys = new Set([...run1Map.keys(), ...run2Map.keys()]);
            const diff = [];
            for (const key of allKeys) {
                const r1 = run1Map.get(key);
                const r2 = run2Map.get(key);
                if (!r1) {
                    diff.push({ key, change: 'ADDED', run2: r2 });
                }
                else if (!r2) {
                    diff.push({ key, change: 'REMOVED', run1: r1 });
                }
                else if (r1.status !== r2.status) {
                    diff.push({
                        key, change: 'STATUS_CHANGED',
                        run1: { status: r1.status },
                        run2: { status: r2.status },
                        regression: r1.status === 'PASS' && r2.status !== 'PASS',
                        improvement: r1.status !== 'PASS' && r2.status === 'PASS',
                    });
                }
            }
            const regressions = diff.filter(d => d.regression).length;
            const improvements = diff.filter(d => d.improvement).length;
            return {
                run1: { id: run1.id, createdAt: run1.createdAt, passed: run1.passed, failed: run1.failed, total: run1.totalTests },
                run2: { id: run2.id, createdAt: run2.createdAt, passed: run2.passed, failed: run2.failed, total: run2.totalTests },
                summary: { regressions, improvements, added: diff.filter(d => d.change === 'ADDED').length, removed: diff.filter(d => d.change === 'REMOVED').length },
                diff,
            };
        }
        catch (error) {
            this.logger.error(`CompareTestRunsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CompareTestRunsHandler = CompareTestRunsHandler;
exports.CompareTestRunsHandler = CompareTestRunsHandler = CompareTestRunsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(compare_test_runs_query_1.CompareTestRunsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompareTestRunsHandler);
//# sourceMappingURL=compare-test-runs.handler.js.map