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
var ListVersionsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListVersionsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const list_versions_query_1 = require("../queries/list-versions.query");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let ListVersionsHandler = ListVersionsHandler_1 = class ListVersionsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ListVersionsHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {};
            if (query.status)
                where.status = query.status;
            if (query.releaseType)
                where.releaseType = query.releaseType;
            const skip = (query.page - 1) * query.limit;
            const [data, total] = await Promise.all([
                this.prisma.platform.appVersion.findMany({
                    where,
                    skip,
                    take: query.limit,
                    orderBy: { createdAt: 'desc' },
                    include: { patches: { select: { id: true, industryCode: true, status: true } } },
                }),
                this.prisma.platform.appVersion.count({ where }),
            ]);
            return { data, total, page: query.page, limit: query.limit };
        }
        catch (error) {
            const err = error;
            this.logger.error(`ListVersionsHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.ListVersionsHandler = ListVersionsHandler;
exports.ListVersionsHandler = ListVersionsHandler = ListVersionsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_versions_query_1.ListVersionsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ListVersionsHandler);
//# sourceMappingURL=list-versions.handler.js.map