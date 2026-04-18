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
var GetValidationSummaryHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetValidationSummaryHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_validation_summary_query_1 = require("./get-validation-summary.query");
let GetValidationSummaryHandler = GetValidationSummaryHandler_1 = class GetValidationSummaryHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetValidationSummaryHandler_1.name);
    }
    async execute(query) {
        try {
            const rows = await this.prisma.working.importRow.findMany({
                where: { importJobId: query.jobId },
                select: { rowStatus: true, validationErrors: true },
            });
            const statusCounts = {};
            const topErrors = {};
            for (const row of rows) {
                statusCounts[row.rowStatus] = (statusCounts[row.rowStatus] || 0) + 1;
                if (row.validationErrors && Array.isArray(row.validationErrors)) {
                    for (const err of row.validationErrors) {
                        const key = `${err.field}: ${err.message}`;
                        topErrors[key] = (topErrors[key] || 0) + 1;
                    }
                }
            }
            const sortedErrors = Object.entries(topErrors)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([error, count]) => ({ error, count }));
            return { statusCounts, topErrors: sortedErrors, totalRows: rows.length };
        }
        catch (error) {
            this.logger.error(`GetValidationSummaryHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetValidationSummaryHandler = GetValidationSummaryHandler;
exports.GetValidationSummaryHandler = GetValidationSummaryHandler = GetValidationSummaryHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_validation_summary_query_1.GetValidationSummaryQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetValidationSummaryHandler);
//# sourceMappingURL=get-validation-summary.handler.js.map