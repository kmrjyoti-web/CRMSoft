"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseListQueryHandler = void 0;
const paginated_type_1 = require("../types/paginated.type");
class BaseListQueryHandler {
    constructor(prisma) {
        this.prisma = prisma;
    }
    buildWhere(params) {
        const where = {
            tenantId: params.tenantId,
            isDeleted: params.isDeleted ?? false,
            ...params.where,
        };
        if (params.search) {
            where['OR'] = this.buildSearchConditions(params.search);
        }
        return where;
    }
    buildSearchConditions(search) {
        return [
            { name: { contains: search, mode: 'insensitive' } },
        ];
    }
    async executeList(params) {
        const where = this.buildWhere(params);
        const skip = (params.page - 1) * params.limit;
        const model = this.prisma[this.modelName];
        if (!model) {
            throw new Error(`Prisma model "${this.modelName}" not found. Check the modelName getter.`);
        }
        const [data, total] = await Promise.all([
            model.findMany({
                where,
                skip,
                take: params.limit,
                orderBy: { [params.sortBy]: params.sortOrder },
                ...(params.include ? { include: params.include } : {}),
                ...(params.select ? { select: params.select } : {}),
            }),
            model.count({ where }),
        ]);
        return (0, paginated_type_1.paginate)(data, total, params.page, params.limit);
    }
}
exports.BaseListQueryHandler = BaseListQueryHandler;
//# sourceMappingURL=base-list-query.handler.js.map