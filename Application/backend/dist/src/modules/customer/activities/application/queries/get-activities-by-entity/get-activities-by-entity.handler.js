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
var GetActivitiesByEntityHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetActivitiesByEntityHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_activities_by_entity_query_1 = require("./get-activities-by-entity.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetActivitiesByEntityHandler = GetActivitiesByEntityHandler_1 = class GetActivitiesByEntityHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetActivitiesByEntityHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {};
            if (query.entityType === 'LEAD')
                where.leadId = query.entityId;
            else if (query.entityType === 'CONTACT')
                where.contactId = query.entityId;
            const [data, total] = await Promise.all([
                this.prisma.working.activity.findMany({
                    where,
                    include: {
                        createdByUser: { select: { id: true, firstName: true, lastName: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip: (query.page - 1) * query.limit,
                    take: query.limit,
                }),
                this.prisma.working.activity.count({ where }),
            ]);
            return { data, total, page: query.page, limit: query.limit };
        }
        catch (error) {
            this.logger.error(`GetActivitiesByEntityHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetActivitiesByEntityHandler = GetActivitiesByEntityHandler;
exports.GetActivitiesByEntityHandler = GetActivitiesByEntityHandler = GetActivitiesByEntityHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_activities_by_entity_query_1.GetActivitiesByEntityQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetActivitiesByEntityHandler);
//# sourceMappingURL=get-activities-by-entity.handler.js.map