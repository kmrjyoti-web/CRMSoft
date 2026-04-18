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
var ListTenantsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListTenantsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const query_1 = require("./query");
let ListTenantsHandler = ListTenantsHandler_1 = class ListTenantsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ListTenantsHandler_1.name);
    }
    async execute(query) {
        this.logger.log(`Listing tenants - page: ${query.page}, limit: ${query.limit}`);
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        if (query.search) {
            where.name = { contains: query.search, mode: 'insensitive' };
        }
        const [data, total] = await Promise.all([
            this.prisma.identity.tenant.findMany({
                where,
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            this.prisma.identity.tenant.count({ where }),
        ]);
        return { data, total, page: query.page, limit: query.limit };
    }
};
exports.ListTenantsHandler = ListTenantsHandler;
exports.ListTenantsHandler = ListTenantsHandler = ListTenantsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(query_1.ListTenantsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ListTenantsHandler);
//# sourceMappingURL=handler.js.map