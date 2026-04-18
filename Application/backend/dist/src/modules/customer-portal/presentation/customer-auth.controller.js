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
exports.CustomerAuthController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const customer_auth_guard_1 = require("../infrastructure/guards/customer-auth.guard");
const customer_login_dto_1 = require("./dto/customer-login.dto");
const update_customer_profile_dto_1 = require("./dto/update-customer-profile.dto");
const customer_login_command_1 = require("../application/commands/customer-login/customer-login.command");
const refresh_customer_token_command_1 = require("../application/commands/refresh-customer-token/refresh-customer-token.command");
const forgot_customer_password_command_1 = require("../application/commands/forgot-customer-password/forgot-customer-password.command");
const reset_customer_password_command_1 = require("../application/commands/reset-customer-password/reset-customer-password.command");
const change_customer_password_command_1 = require("../application/commands/change-customer-password/change-customer-password.command");
const get_customer_menu_query_1 = require("../application/queries/get-customer-menu/get-customer-menu.query");
const get_customer_profile_query_1 = require("../application/queries/get-customer-profile/get-customer-profile.query");
class RefreshTokenDto {
}
__decorate([
    (0, swagger_2.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
class ForgotPasswordDto {
}
__decorate([
    (0, swagger_2.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
__decorate([
    (0, swagger_2.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "tenantId", void 0);
class ResetPasswordDto {
}
__decorate([
    (0, swagger_2.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
__decorate([
    (0, swagger_2.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
class ChangePasswordDto {
}
__decorate([
    (0, swagger_2.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_2.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
let CustomerAuthController = class CustomerAuthController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    login(dto, req) {
        return this.commandBus.execute(new customer_login_command_1.CustomerLoginCommand(dto.email, dto.password, dto.tenantId, req.ip, req.headers['user-agent']));
    }
    refresh(dto) {
        return this.commandBus.execute(new refresh_customer_token_command_1.RefreshCustomerTokenCommand(dto.refreshToken));
    }
    forgotPassword(dto) {
        return this.commandBus.execute(new forgot_customer_password_command_1.ForgotCustomerPasswordCommand(dto.email, dto.tenantId));
    }
    resetPassword(dto) {
        return this.commandBus.execute(new reset_customer_password_command_1.ResetCustomerPasswordCommand(dto.token, dto.newPassword));
    }
    changePassword(req, dto) {
        return this.commandBus.execute(new change_customer_password_command_1.ChangeCustomerPasswordCommand(req.customerUser.id, dto.currentPassword, dto.newPassword));
    }
    getMenu(req) {
        return this.queryBus.execute(new get_customer_menu_query_1.GetCustomerMenuQuery(req.customerUser.id));
    }
    getProfile(req) {
        return this.queryBus.execute(new get_customer_profile_query_1.GetCustomerProfileQuery(req.customerUser.id));
    }
    updateProfile(req, dto) {
        return { id: req.customerUser.id, ...dto, message: 'Profile updated' };
    }
};
exports.CustomerAuthController = CustomerAuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, roles_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Customer portal login' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_login_dto_1.CustomerLoginDto, Object]),
    __metadata("design:returntype", void 0)
], CustomerAuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, roles_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh customer access token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RefreshTokenDto]),
    __metadata("design:returntype", void 0)
], CustomerAuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, roles_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset link' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ForgotPasswordDto]),
    __metadata("design:returntype", void 0)
], CustomerAuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, roles_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password with token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ResetPasswordDto]),
    __metadata("design:returntype", void 0)
], CustomerAuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Patch)('change-password'),
    (0, roles_decorator_1.Public)(),
    (0, common_1.UseGuards)(customer_auth_guard_1.CustomerAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Change password (authenticated)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ChangePasswordDto]),
    __metadata("design:returntype", void 0)
], CustomerAuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('menu'),
    (0, roles_decorator_1.Public)(),
    (0, common_1.UseGuards)(customer_auth_guard_1.CustomerAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get resolved menu for current customer' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerAuthController.prototype, "getMenu", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, roles_decorator_1.Public)(),
    (0, common_1.UseGuards)(customer_auth_guard_1.CustomerAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get my profile' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerAuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, roles_decorator_1.Public)(),
    (0, common_1.UseGuards)(customer_auth_guard_1.CustomerAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update my profile' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_customer_profile_dto_1.UpdateCustomerProfileDto]),
    __metadata("design:returntype", void 0)
], CustomerAuthController.prototype, "updateProfile", null);
exports.CustomerAuthController = CustomerAuthController = __decorate([
    (0, swagger_1.ApiTags)('Customer Portal — Auth'),
    (0, common_1.Controller)('customer/auth'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], CustomerAuthController);
//# sourceMappingURL=customer-auth.controller.js.map