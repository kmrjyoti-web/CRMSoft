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
var GetTenantDashboardHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTenantDashboardHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const query_1 = require("./query");
let GetTenantDashboardHandler = GetTenantDashboardHandler_1 = class GetTenantDashboardHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetTenantDashboardHandler_1.name);
    }
    async execute(query) {
        this.logger.log(`Fetching dashboard for tenant: ${query.tenantId}`);
        const tenant = await this.prisma.identity.tenant.findUnique({
            where: { id: query.tenantId },
            include: {
                subscriptions: {
                    where: { status: { in: ['ACTIVE', 'TRIALING'] } },
                    include: { plan: true },
                    take: 1,
                },
                usage: true,
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant ${query.tenantId} not found`);
        }
        const subscription = tenant.subscriptions[0] ?? null;
        const plan = subscription?.plan ?? null;
        const usage = tenant.usage;
        return {
            tenant: {
                name: tenant.name,
                status: tenant.status,
                onboardingStep: tenant.onboardingStep,
            },
            plan: plan
                ? {
                    name: plan.name,
                    code: plan.code,
                }
                : null,
            usage: usage
                ? {
                    usersCount: usage.usersCount,
                    contactsCount: usage.contactsCount,
                    leadsCount: usage.leadsCount,
                    productsCount: usage.productsCount,
                }
                : null,
            limits: plan
                ? {
                    maxUsers: plan.maxUsers,
                    maxContacts: plan.maxContacts,
                    maxLeads: plan.maxLeads,
                    maxProducts: plan.maxProducts,
                }
                : null,
        };
    }
};
exports.GetTenantDashboardHandler = GetTenantDashboardHandler;
exports.GetTenantDashboardHandler = GetTenantDashboardHandler = GetTenantDashboardHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(query_1.GetTenantDashboardQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetTenantDashboardHandler);
//# sourceMappingURL=handler.js.map