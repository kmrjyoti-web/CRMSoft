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
var GetValuesByCategoryHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetValuesByCategoryHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const get_values_by_category_query_1 = require("./get-values-by-category.query");
let GetValuesByCategoryHandler = GetValuesByCategoryHandler_1 = class GetValuesByCategoryHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetValuesByCategoryHandler_1.name);
    }
    async execute(query) {
        try {
            const category = query.category.toUpperCase();
            const lookup = await this.prisma.platform.masterLookup.findFirst({
                where: { category },
            });
            if (!lookup)
                throw new common_1.NotFoundException(`Lookup category "${category}" not found`);
            const where = { lookupId: lookup.id };
            if (query.activeOnly !== false)
                where.isActive = true;
            const values = await this.prisma.platform.lookupValue.findMany({
                where,
                orderBy: { rowIndex: 'asc' },
                select: {
                    id: true, value: true, label: true, icon: true,
                    color: true, isDefault: true, rowIndex: true,
                    parentId: true, configJson: true,
                },
            });
            return { lookupId: lookup.id, category: lookup.category, displayName: lookup.displayName, values };
        }
        catch (error) {
            this.logger.error(`GetValuesByCategoryHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetValuesByCategoryHandler = GetValuesByCategoryHandler;
exports.GetValuesByCategoryHandler = GetValuesByCategoryHandler = GetValuesByCategoryHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_values_by_category_query_1.GetValuesByCategoryQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetValuesByCategoryHandler);
//# sourceMappingURL=get-values-by-category.handler.js.map