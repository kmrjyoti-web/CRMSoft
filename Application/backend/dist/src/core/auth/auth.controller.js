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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const api_response_1 = require("../../common/utils/api-response");
const permission_chain_service_1 = require("../permissions/services/permission-chain.service");
let AuthController = class AuthController {
    constructor(auth, permissionChain) {
        this.auth = auth;
        this.permissionChain = permissionChain;
    }
    async adminLogin(dto) {
        return api_response_1.ApiResponse.success(await this.auth.adminLogin(dto.email, dto.password), 'Admin login successful');
    }
    async employeeLogin(dto) {
        return api_response_1.ApiResponse.success(await this.auth.employeeLogin(dto.email, dto.password), 'Employee login successful');
    }
    async customerLogin(dto) {
        return api_response_1.ApiResponse.success(await this.auth.customerLogin(dto.email, dto.password), 'Customer login successful');
    }
    async partnerLogin(dto) {
        return api_response_1.ApiResponse.success(await this.auth.partnerLogin(dto.email, dto.password), 'Partner login successful');
    }
    async vendorLogin(dto) {
        return api_response_1.ApiResponse.success(await this.auth.vendorLogin(dto.email, dto.password), 'Vendor login successful');
    }
    async superAdminLogin(dto) {
        return api_response_1.ApiResponse.success(await this.auth.superAdminLogin(dto.email, dto.password), 'Super admin login successful');
    }
    async customerRegister(dto) {
        return api_response_1.ApiResponse.success(await this.auth.registerCustomer(dto), 'Customer registered');
    }
    async partnerRegister(dto) {
        return api_response_1.ApiResponse.success(await this.auth.registerPartner(dto), 'Partner registered');
    }
    async checkSlug(slug) {
        const available = await this.auth.isSlugAvailable(slug);
        return api_response_1.ApiResponse.success({ available });
    }
    async tenantRegister(dto) {
        return api_response_1.ApiResponse.success(await this.auth.registerTenant(dto), 'Registration successful');
    }
    async registerStaff(dto, userId) {
        return api_response_1.ApiResponse.success(await this.auth.registerStaff({ ...dto, createdBy: userId }), 'Staff registered');
    }
    async refresh(dto) {
        return api_response_1.ApiResponse.success(await this.auth.refreshToken(dto.refreshToken), 'Token refreshed');
    }
    async changePassword(dto, userId) {
        return api_response_1.ApiResponse.success(await this.auth.changePassword(userId, dto.currentPassword, dto.newPassword));
    }
    async permissions(user) {
        if (user.isSuperAdmin) {
            const all = await this.permissionChain.getAllPermissionCodes();
            return api_response_1.ApiResponse.success(all);
        }
        if (user.vendorId || user.userType === 'VENDOR') {
            const all = await this.permissionChain.getAllPermissionCodes();
            return api_response_1.ApiResponse.success(all);
        }
        const codes = await this.permissionChain.getEffectivePermissions(user.id);
        return api_response_1.ApiResponse.success(codes);
    }
    async me(user) {
        if (user.isSuperAdmin) {
            const admin = await this.auth.getSuperAdminProfile(user.id);
            return api_response_1.ApiResponse.success(admin);
        }
        if (user.vendorId || user.userType === 'VENDOR') {
            const vendor = await this.auth.getVendorProfile(user.vendorId ?? user.sub);
            return api_response_1.ApiResponse.success(vendor);
        }
        return api_response_1.ApiResponse.success(await this.auth.getProfile(user.id));
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('admin/login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Admin Portal Login' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminLogin", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('employee/login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Employee Portal Login' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "employeeLogin", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('customer/login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Customer Portal Login' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "customerLogin", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('partner/login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Referral Partner Portal Login' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "partnerLogin", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('vendor/login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Vendor Portal Login � VENDORS ONLY' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "vendorLogin", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('super-admin/login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Platform Super Admin Login' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "superAdminLogin", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('customer/register'),
    (0, swagger_1.ApiOperation)({ summary: 'Customer Self-Registration (public)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.CustomerRegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "customerRegister", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('partner/register'),
    (0, swagger_1.ApiOperation)({ summary: 'Referral Partner Self-Registration (public)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.PartnerRegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "partnerRegister", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Get)('tenant/check-slug/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if company slug is available (public)' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkSlug", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('tenant/register'),
    (0, swagger_1.ApiOperation)({ summary: 'Tenant Self-Registration (public)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.TenantRegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "tenantRegister", null);
__decorate([
    (0, common_1.Post)('staff/register'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin creates Admin/Employee (requires ADMIN role)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerStaff", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh token (all user types)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Change password (all user types)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ChangePasswordDto, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user effective permissions' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "permissions", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile (all user types)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        permission_chain_service_1.PermissionChainService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map