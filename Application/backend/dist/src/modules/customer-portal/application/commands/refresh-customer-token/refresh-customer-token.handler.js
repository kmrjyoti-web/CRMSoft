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
var RefreshCustomerTokenHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshCustomerTokenHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
const refresh_customer_token_command_1 = require("./refresh-customer-token.command");
const customer_user_repository_interface_1 = require("../../../domain/interfaces/customer-user.repository.interface");
let RefreshCustomerTokenHandler = RefreshCustomerTokenHandler_1 = class RefreshCustomerTokenHandler {
    constructor(userRepo, jwtService, config) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.config = config;
        this.logger = new common_1.Logger(RefreshCustomerTokenHandler_1.name);
    }
    async execute(command) {
        try {
            const user = await this.userRepo.findByRefreshToken(command.refreshToken);
            if (!user)
                throw new common_1.UnauthorizedException('Invalid or expired refresh token');
            if (!user.refreshTokenExp || new Date() > user.refreshTokenExp) {
                user.clearRefreshToken();
                await this.userRepo.update(user);
                throw new common_1.UnauthorizedException('Refresh token expired. Please login again.');
            }
            if (!user.isActive)
                throw new common_1.UnauthorizedException('Account deactivated');
            const accessToken = this.jwtService.sign({
                sub: user.id,
                type: 'CUSTOMER',
                tenantId: user.tenantId,
                email: user.email,
                linkedEntityType: user.linkedEntityType,
                linkedEntityId: user.linkedEntityId,
            }, { secret: this.config.get('JWT_SECRET'), expiresIn: this.config.get('JWT_EXPIRES_IN', '24h') });
            const newRefreshToken = (0, uuid_1.v4)();
            user.setRefreshToken(newRefreshToken, 7 * 24 * 3600);
            await this.userRepo.update(user);
            return { accessToken, refreshToken: newRefreshToken };
        }
        catch (error) {
            this.logger.error(`RefreshCustomerTokenHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RefreshCustomerTokenHandler = RefreshCustomerTokenHandler;
exports.RefreshCustomerTokenHandler = RefreshCustomerTokenHandler = RefreshCustomerTokenHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(refresh_customer_token_command_1.RefreshCustomerTokenCommand),
    __param(0, (0, common_1.Inject)(customer_user_repository_interface_1.CUSTOMER_USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, jwt_1.JwtService,
        config_1.ConfigService])
], RefreshCustomerTokenHandler);
//# sourceMappingURL=refresh-customer-token.handler.js.map