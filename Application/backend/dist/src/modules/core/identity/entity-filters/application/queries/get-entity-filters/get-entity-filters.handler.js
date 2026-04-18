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
var GetEntityFiltersHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEntityFiltersHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const get_entity_filters_query_1 = require("./get-entity-filters.query");
const entity_filter_types_1 = require("../../../entity-filter.types");
let GetEntityFiltersHandler = GetEntityFiltersHandler_1 = class GetEntityFiltersHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetEntityFiltersHandler_1.name);
    }
    async execute(query) {
        try {
            const config = entity_filter_types_1.ENTITY_FILTER_CONFIG[query.entityType];
            const filters = await this.prisma[config.filterModel].findMany({
                where: { [config.fkField]: query.entityId },
                include: {
                    lookupValue: {
                        select: {
                            id: true, value: true, label: true, icon: true, color: true,
                            lookup: { select: { category: true, displayName: true } },
                        },
                    },
                },
            });
            const grouped = {};
            for (const f of filters) {
                const cat = f.lookupValue.lookup.category;
                if (!grouped[cat]) {
                    grouped[cat] = {
                        category: cat,
                        displayName: f.lookupValue.lookup.displayName,
                        values: [],
                    };
                }
                grouped[cat].values.push({
                    id: f.lookupValue.id,
                    value: f.lookupValue.value,
                    label: f.lookupValue.label,
                    icon: f.lookupValue.icon,
                    color: f.lookupValue.color,
                });
            }
            const flat = filters.map((f) => ({
                id: f.lookupValue.id,
                value: f.lookupValue.value,
                label: f.lookupValue.label,
                category: f.lookupValue.lookup.category,
            }));
            return { grouped, flat, count: flat.length };
        }
        catch (error) {
            this.logger.error(`GetEntityFiltersHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetEntityFiltersHandler = GetEntityFiltersHandler;
exports.GetEntityFiltersHandler = GetEntityFiltersHandler = GetEntityFiltersHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_entity_filters_query_1.GetEntityFiltersQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetEntityFiltersHandler);
//# sourceMappingURL=get-entity-filters.handler.js.map