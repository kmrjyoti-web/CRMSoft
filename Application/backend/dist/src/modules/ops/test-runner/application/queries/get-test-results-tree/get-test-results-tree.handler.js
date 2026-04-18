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
var GetTestResultsTreeHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTestResultsTreeHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_test_results_tree_query_1 = require("./get-test-results-tree.query");
let GetTestResultsTreeHandler = GetTestResultsTreeHandler_1 = class GetTestResultsTreeHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetTestResultsTreeHandler_1.name);
    }
    async execute(query) {
        try {
            const results = await this.prisma.platform.testResult.findMany({
                where: { testRunId: query.testRunId },
                orderBy: [{ testType: 'asc' }, { suiteName: 'asc' }, { testName: 'asc' }],
            });
            const tree = {};
            for (const r of results) {
                const type = r.testType;
                const suite = r.suiteName;
                if (!tree[type])
                    tree[type] = {};
                if (!tree[type][suite])
                    tree[type][suite] = [];
                tree[type][suite].push(r);
            }
            return Object.entries(tree).map(([testType, suites]) => {
                const suiteList = Object.entries(suites).map(([suiteName, tests]) => ({
                    suiteName,
                    total: tests.length,
                    passed: tests.filter(t => t.status === 'PASS').length,
                    failed: tests.filter(t => t.status === 'FAIL').length,
                    skipped: tests.filter(t => t.status === 'SKIP').length,
                    errors: tests.filter(t => ['ERROR', 'TIMEOUT'].includes(t.status)).length,
                    duration: tests.reduce((sum, t) => sum + (t.duration ?? 0), 0),
                    tests,
                }));
                const typeTotal = suiteList.reduce((acc, s) => {
                    acc.total += s.total;
                    acc.passed += s.passed;
                    acc.failed += s.failed;
                    acc.skipped += s.skipped;
                    acc.errors += s.errors;
                    acc.duration += s.duration;
                    return acc;
                }, { total: 0, passed: 0, failed: 0, skipped: 0, errors: 0, duration: 0 });
                return { testType, ...typeTotal, suites: suiteList };
            });
        }
        catch (error) {
            this.logger.error(`GetTestResultsTreeHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetTestResultsTreeHandler = GetTestResultsTreeHandler;
exports.GetTestResultsTreeHandler = GetTestResultsTreeHandler = GetTestResultsTreeHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_test_results_tree_query_1.GetTestResultsTreeQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetTestResultsTreeHandler);
//# sourceMappingURL=get-test-results-tree.handler.js.map