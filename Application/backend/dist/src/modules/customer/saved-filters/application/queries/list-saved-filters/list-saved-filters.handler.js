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
var ListSavedFiltersHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListSavedFiltersHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const list_saved_filters_query_1 = require("./list-saved-filters.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let ListSavedFiltersHandler = ListSavedFiltersHandler_1 = class ListSavedFiltersHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ListSavedFiltersHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {
                isDeleted: false,
                OR: [
                    { createdById: query.userId },
                    { isShared: true },
                ],
            };
            if (query.entityType)
                where.entityType = query.entityType;
            if (query.search)
                where.name = { contains: query.search, mode: 'insensitive' };
            const page = Math.max(1, +query.page);
            const limit = Math.min(100, Math.max(1, +query.limit));
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                this.prisma.working.savedFilter.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
                }),
                this.prisma.working.savedFilter.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        catch (error) {
            this.logger.error(`ListSavedFiltersHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListSavedFiltersHandler = ListSavedFiltersHandler;
exports.ListSavedFiltersHandler = ListSavedFiltersHandler = ListSavedFiltersHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_saved_filters_query_1.ListSavedFiltersQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ListSavedFiltersHandler);
//# sourceMappingURL=list-saved-filters.handler.js.map