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
var GetTestResultsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTestResultsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_test_results_query_1 = require("./get-test-results.query");
let GetTestResultsHandler = GetTestResultsHandler_1 = class GetTestResultsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetTestResultsHandler_1.name);
    }
    async execute(query) {
        try {
            const { testRunId, filters } = query;
            const { testType, status, module, page = 1, limit = 50 } = filters;
            return this.prisma.platform.testResult.findMany({
                where: {
                    testRunId,
                    ...(testType ? { testType: testType } : {}),
                    ...(status ? { status: status } : {}),
                    ...(module ? { module } : {}),
                },
                orderBy: [{ testType: 'asc' }, { suiteName: 'asc' }, { testName: 'asc' }],
                skip: (page - 1) * limit,
                take: limit,
            });
        }
        catch (error) {
            this.logger.error(`GetTestResultsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetTestResultsHandler = GetTestResultsHandler;
exports.GetTestResultsHandler = GetTestResultsHandler = GetTestResultsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_test_results_query_1.GetTestResultsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetTestResultsHandler);
//# sourceMappingURL=get-test-results.handler.js.map