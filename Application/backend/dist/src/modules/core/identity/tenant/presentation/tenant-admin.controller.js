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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantAdminController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const super_admin_guard_1 = require("../infrastructure/super-admin.guard");
const super_admin_route_decorator_1 = require("../infrastructure/decorators/super-admin-route.decorator");
const create_tenant_command_1 = require("../application/commands/create-tenant/create-tenant.command");
const update_tenant_command_1 = require("../application/commands/update-tenant/update-tenant.command");
const suspend_tenant_command_1 = require("../application/commands/suspend-tenant/suspend-tenant.command");
const activate_tenant_command_1 = require("../application/commands/activate-tenant/activate-tenant.command");
const create_super_admin_command_1 = require("../application/commands/create-super-admin/create-super-admin.command");
const query_1 = require("../application/queries/list-tenants/query");
const query_2 = require("../application/queries/get-tenant-by-id/query");
const query_3 = require("../application/queries/get-tenant-usage/query");
const query_4 = require("../application/queries/get-tenant-dashboard/query");
const query_5 = require("../application/queries/list-super-admins/query");
const create_tenant_dto_1 = require("./dto/create-tenant.dto");
const update_tenant_dto_1 = require("./dto/update-tenant.dto");
const tenant_query_dto_1 = require("./dto/tenant-query.dto");
const create_super_admin_dto_1 = require("./dto/create-super-admin.dto");
const api_response_1 = require("../../../../../common/utils/api-response");
let TenantAdminController = class TenantAdminController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto) {
        const tenantId = await this.commandBus.execute(new create_tenant_command_1.CreateTenantCommand(dto.name, dto.slug, dto.adminEmail, dto.adminPassword, dto.adminFirstName, dto.adminLastName, dto.planId));
        const tenant = await this.queryBus.execute(new query_2.GetTenantByIdQuery(tenantId));
        return api_response_1.ApiResponse.success(tenant, 'Tenant created');
    }
    async findAll(query) {
        const result = await this.queryBus.execute(new query_1.ListTenantsQuery(query.page ?? 1, query.limit ?? 20, query.status, query.search));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async listSuperAdmins() {
        const result = await this.queryBus.execute(new query_5.ListSuperAdminsQuery());
        return api_response_1.ApiResponse.success(result);
    }
    async createSuperAdmin(dto) {
        const result = await this.commandBus.execute(new create_super_admin_command_1.CreateSuperAdminCommand(dto.email, dto.password, dto.firstName, dto.lastName));
        return api_response_1.ApiResponse.success(result, 'Super admin created');
    }
    async findById(id) {
        const tenant = await this.queryBus.execute(new query_2.GetTenantByIdQuery(id));
        return api_response_1.ApiResponse.success(tenant);
    }
    async update(id, dto) {
        await this.commandBus.execute(new update_tenant_command_1.UpdateTenantCommand(id, dto.name, dto.domain, dto.logo, dto.settings));
        const tenant = await this.queryBus.execute(new query_2.GetTenantByIdQuery(id));
        return api_response_1.ApiResponse.success(tenant, 'Tenant updated');
    }
    async suspend(id) {
        await this.commandBus.execute(new suspend_tenant_command_1.SuspendTenantCommand(id));
        const tenant = await this.queryBus.execute(new query_2.GetTenantByIdQuery(id));
        return api_response_1.ApiResponse.success(tenant, 'Tenant suspended');
    }
    async activate(id) {
        await this.commandBus.execute(new activate_tenant_command_1.ActivateTenantCommand(id));
        const tenant = await this.queryBus.execute(new query_2.GetTenantByIdQuery(id));
        return api_response_1.ApiResponse.success(tenant, 'Tenant activated');
    }
    async getUsage(id) {
        const usage = await this.queryBus.execute(new query_3.GetTenantUsageQuery(id));
        return api_response_1.ApiResponse.success(usage);
    }
    async getDashboard(id) {
        const dashboard = await this.queryBus.execute(new query_4.GetTenantDashboardQuery(id));
        return api_response_1.ApiResponse.success(dashboard);
    }
};
exports.TenantAdminController = TenantAdminController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new tenant with admin user' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tenant_dto_1.CreateTenantDto]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all tenants (paginated, filterable)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tenant_query_dto_1.TenantQueryDto]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('super-admins'),
    (0, swagger_1.ApiOperation)({ summary: 'List all super admins' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "listSuperAdmins", null);
__decorate([
    (0, common_1.Post)('super-admins'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new super admin' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_super_admin_dto_1.CreateSuperAdminDto]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "createSuperAdmin", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tenant by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant details' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tenant_dto_1.UpdateTenantDto]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/suspend'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Suspend a tenant' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "suspend", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Activate a tenant' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "activate", null);
__decorate([
    (0, common_1.Get)(':id/usage'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tenant usage statistics' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "getUsage", null);
__decorate([
    (0, common_1.Get)(':id/dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tenant dashboard data' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "getDashboard", null);
exports.TenantAdminController = TenantAdminController = __decorate([
    (0, swagger_1.ApiTags)('Tenant Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, super_admin_route_decorator_1.SuperAdminRoute)(),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    (0, common_1.Controller)('admin/tenants'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], TenantAdminController);
//# sourceMappingURL=tenant-admin.controller.js.map