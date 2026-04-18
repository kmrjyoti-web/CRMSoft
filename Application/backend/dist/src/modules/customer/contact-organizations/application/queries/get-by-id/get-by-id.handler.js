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
var GetContactOrgByIdHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetContactOrgByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_by_id_query_1 = require("./get-by-id.query");
let GetContactOrgByIdHandler = GetContactOrgByIdHandler_1 = class GetContactOrgByIdHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetContactOrgByIdHandler_1.name);
    }
    async execute(query) {
        try {
            const mapping = await this.prisma.working.contactOrganization.findUnique({
                where: { id: query.mappingId },
                include: {
                    contact: {
                        select: {
                            id: true, firstName: true, lastName: true,
                            designation: true, isActive: true,
                        },
                    },
                    organization: {
                        select: {
                            id: true, name: true, city: true, industry: true, isActive: true,
                        },
                    },
                },
            });
            if (!mapping)
                throw new common_1.NotFoundException(`Mapping ${query.mappingId} not found`);
            return mapping;
        }
        catch (error) {
            this.logger.error(`GetContactOrgByIdHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetContactOrgByIdHandler = GetContactOrgByIdHandler;
exports.GetContactOrgByIdHandler = GetContactOrgByIdHandler = GetContactOrgByIdHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_by_id_query_1.GetContactOrgByIdQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetContactOrgByIdHandler);
//# sourceMappingURL=get-by-id.handler.js.map