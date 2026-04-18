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
var ListTargetsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListTargetsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const list_targets_query_1 = require("./list-targets.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let ListTargetsHandler = ListTargetsHandler_1 = class ListTargetsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ListTargetsHandler_1.name);
    }
    async execute(query) {
        try {
            const where = { isDeleted: false };
            if (query.userId)
                where.userId = query.userId;
            if (query.period)
                where.period = query.period;
            if (query.metric)
                where.metric = query.metric;
            if (query.isActive !== undefined)
                where.isActive = query.isActive;
            const page = Number(query.page) || 1;
            const limit = Number(query.limit) || 20;
            const [data, total] = await Promise.all([
                this.prisma.working.salesTarget.findMany({
                    where,
                    orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
                    skip: (page - 1) * limit,
                    take: limit,
                }),
                this.prisma.working.salesTarget.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        catch (error) {
            this.logger.error(`ListTargetsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListTargetsHandler = ListTargetsHandler;
exports.ListTargetsHandler = ListTargetsHandler = ListTargetsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_targets_query_1.ListTargetsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ListTargetsHandler);
//# sourceMappingURL=list-targets.handler.js.map