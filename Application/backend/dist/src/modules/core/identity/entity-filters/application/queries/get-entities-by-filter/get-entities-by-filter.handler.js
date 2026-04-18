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
var GetEntitiesByFilterHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEntitiesByFilterHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const get_entities_by_filter_query_1 = require("./get-entities-by-filter.query");
const entity_filter_types_1 = require("../../../entity-filter.types");
let GetEntitiesByFilterHandler = GetEntitiesByFilterHandler_1 = class GetEntitiesByFilterHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetEntitiesByFilterHandler_1.name);
    }
    async execute(query) {
        try {
            const config = entity_filter_types_1.ENTITY_FILTER_CONFIG[query.entityType];
            if (query.matchAll) {
                const results = await this.prisma[config.filterModel].groupBy({
                    by: [config.fkField],
                    where: { lookupValueId: { in: query.lookupValueIds } },
                    _count: { lookupValueId: true },
                    having: { lookupValueId: { _count: { gte: query.lookupValueIds.length } } },
                });
                return results.map((r) => r[config.fkField]);
            }
            else {
                const results = await this.prisma[config.filterModel].findMany({
                    where: { lookupValueId: { in: query.lookupValueIds } },
                    select: { [config.fkField]: true },
                    distinct: [config.fkField],
                });
                return results.map((r) => r[config.fkField]);
            }
        }
        catch (error) {
            this.logger.error(`GetEntitiesByFilterHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetEntitiesByFilterHandler = GetEntitiesByFilterHandler;
exports.GetEntitiesByFilterHandler = GetEntitiesByFilterHandler = GetEntitiesByFilterHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_entities_by_filter_query_1.GetEntitiesByFilterQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetEntitiesByFilterHandler);
//# sourceMappingURL=get-entities-by-filter.handler.js.map