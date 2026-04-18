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
var GetAllLookupsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllLookupsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const get_all_lookups_query_1 = require("./get-all-lookups.query");
let GetAllLookupsHandler = GetAllLookupsHandler_1 = class GetAllLookupsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetAllLookupsHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {};
            if (query.activeOnly !== false)
                where.isActive = true;
            return this.prisma.platform.masterLookup.findMany({
                where,
                orderBy: { category: 'asc' },
                include: {
                    _count: { select: { values: true } },
                },
            });
        }
        catch (error) {
            this.logger.error(`GetAllLookupsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetAllLookupsHandler = GetAllLookupsHandler;
exports.GetAllLookupsHandler = GetAllLookupsHandler = GetAllLookupsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_all_lookups_query_1.GetAllLookupsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetAllLookupsHandler);
//# sourceMappingURL=get-all-lookups.handler.js.map