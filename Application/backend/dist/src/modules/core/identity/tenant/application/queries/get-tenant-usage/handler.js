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
var GetTenantUsageHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTenantUsageHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const query_1 = require("./query");
let GetTenantUsageHandler = GetTenantUsageHandler_1 = class GetTenantUsageHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetTenantUsageHandler_1.name);
    }
    async execute(query) {
        this.logger.log(`Fetching usage for tenant: ${query.tenantId}`);
        const usage = await this.prisma.identity.tenantUsage.findUnique({
            where: { tenantId: query.tenantId },
        });
        if (!usage) {
            throw new common_1.NotFoundException(`Usage record not found for tenant ${query.tenantId}`);
        }
        return usage;
    }
};
exports.GetTenantUsageHandler = GetTenantUsageHandler;
exports.GetTenantUsageHandler = GetTenantUsageHandler = GetTenantUsageHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(query_1.GetTenantUsageQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetTenantUsageHandler);
//# sourceMappingURL=handler.js.map