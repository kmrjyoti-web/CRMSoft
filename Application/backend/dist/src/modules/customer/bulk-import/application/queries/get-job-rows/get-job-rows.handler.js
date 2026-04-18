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
var GetJobRowsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetJobRowsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_job_rows_query_1 = require("./get-job-rows.query");
let GetJobRowsHandler = GetJobRowsHandler_1 = class GetJobRowsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetJobRowsHandler_1.name);
    }
    async execute(query) {
        try {
            const page = query.page || 1;
            const limit = query.limit || 50;
            const where = { importJobId: query.jobId };
            if (query.status)
                where.rowStatus = query.status;
            const [data, total] = await Promise.all([
                this.prisma.working.importRow.findMany({
                    where, skip: (page - 1) * limit, take: limit,
                    orderBy: { rowNumber: 'asc' },
                }),
                this.prisma.working.importRow.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        catch (error) {
            this.logger.error(`GetJobRowsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetJobRowsHandler = GetJobRowsHandler;
exports.GetJobRowsHandler = GetJobRowsHandler = GetJobRowsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_job_rows_query_1.GetJobRowsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetJobRowsHandler);
//# sourceMappingURL=get-job-rows.handler.js.map