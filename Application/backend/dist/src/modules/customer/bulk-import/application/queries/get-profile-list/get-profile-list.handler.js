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
var GetProfileListHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProfileListHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_profile_list_query_1 = require("./get-profile-list.query");
let GetProfileListHandler = GetProfileListHandler_1 = class GetProfileListHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetProfileListHandler_1.name);
    }
    async execute(query) {
        try {
            const page = query.page || 1;
            const limit = query.limit || 20;
            const where = {};
            if (query.targetEntity)
                where.targetEntity = query.targetEntity;
            if (query.status)
                where.status = query.status;
            else
                where.status = { not: 'ARCHIVED' };
            const [data, total] = await Promise.all([
                this.prisma.working.importProfile.findMany({
                    where, skip: (page - 1) * limit, take: limit,
                    orderBy: { usageCount: 'desc' },
                }),
                this.prisma.working.importProfile.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        catch (error) {
            this.logger.error(`GetProfileListHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetProfileListHandler = GetProfileListHandler;
exports.GetProfileListHandler = GetProfileListHandler = GetProfileListHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_profile_list_query_1.GetProfileListQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetProfileListHandler);
//# sourceMappingURL=get-profile-list.handler.js.map