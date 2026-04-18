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
var GetLookupByIdHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetLookupByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const get_lookup_by_id_query_1 = require("./get-lookup-by-id.query");
let GetLookupByIdHandler = GetLookupByIdHandler_1 = class GetLookupByIdHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetLookupByIdHandler_1.name);
    }
    async execute(query) {
        try {
            const lookup = await this.prisma.platform.masterLookup.findUnique({
                where: { id: query.lookupId },
                include: {
                    values: {
                        where: { isActive: true },
                        orderBy: { rowIndex: 'asc' },
                        include: {
                            children: { where: { isActive: true }, orderBy: { rowIndex: 'asc' } },
                        },
                    },
                },
            });
            if (!lookup)
                throw new common_1.NotFoundException(`Lookup ${query.lookupId} not found`);
            return lookup;
        }
        catch (error) {
            this.logger.error(`GetLookupByIdHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetLookupByIdHandler = GetLookupByIdHandler;
exports.GetLookupByIdHandler = GetLookupByIdHandler = GetLookupByIdHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_lookup_by_id_query_1.GetLookupByIdQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetLookupByIdHandler);
//# sourceMappingURL=get-lookup-by-id.handler.js.map