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
var GetTenantByIdHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTenantByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const query_1 = require("./query");
let GetTenantByIdHandler = GetTenantByIdHandler_1 = class GetTenantByIdHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetTenantByIdHandler_1.name);
    }
    async execute(query) {
        this.logger.log(`Fetching tenant by id: ${query.tenantId}`);
        const tenant = await this.prisma.identity.tenant.findUnique({
            where: { id: query.tenantId },
            include: {
                subscriptions: {
                    include: { plan: true },
                },
                usage: true,
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant ${query.tenantId} not found`);
        }
        return tenant;
    }
};
exports.GetTenantByIdHandler = GetTenantByIdHandler;
exports.GetTenantByIdHandler = GetTenantByIdHandler = GetTenantByIdHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(query_1.GetTenantByIdQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetTenantByIdHandler);
//# sourceMappingURL=handler.js.map