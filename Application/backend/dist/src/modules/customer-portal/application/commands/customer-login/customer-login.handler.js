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
var CustomerLoginHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerLoginHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
const customer_login_command_1 = require("./customer-login.command");
const customer_user_repository_interface_1 = require("../../../domain/interfaces/customer-user.repository.interface");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let CustomerLoginHandler = CustomerLoginHandler_1 = class CustomerLoginHandler {
    constructor(userRepo, jwtService, config, prisma) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.config = config;
        this.prisma = prisma;
        this.logger = new common_1.Logger(CustomerLoginHandler_1.name);
    }
    async execute(command) {
        try {
            const { email, password, tenantId, ipAddress, userAgent } = command;
            const user = await this.userRepo.findByEmail(tenantId, email);
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            if (!user.isActive) {
                throw new common_1.ForbiddenException('Your portal account has been deactivated. Contact support.');
            }
            if (user.isLocked) {
                throw new common_1.ForbiddenException('Account temporarily locked due to too many failed attempts. Try again in 30 minutes.');
            }
            const valid = await user.validatePassword(password);
            if (!valid) {
                user.recordFailedLogin();
                await this.userRepo.update(user);
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            user.recordSuccessfulLogin();
            const accessToken = this.jwtService.sign({
                sub: user.id,
                type: 'CUSTOMER',
                tenantId: user.tenantId,
                email: user.email,
                linkedEntityType: user.linkedEntityType,
                linkedEntityId: user.linkedEntityId,
            }, { secret: this.config.get('JWT_SECRET'), expiresIn: this.config.get('JWT_EXPIRES_IN', '24h') });
            const refreshToken = (0, uuid_1.v4)();
            user.setRefreshToken(refreshToken, 7 * 24 * 3600);
            await this.userRepo.update(user);
            await this.prisma.identity.customerPortalLog.create({
                data: {
                    tenantId,
                    customerUserId: user.id,
                    action: 'LOGIN',
                    ipAddress: ipAddress ?? null,
                    userAgent: userAgent ?? null,
                    metadata: {},
                },
            });
            let menu = [];
            if (user.menuCategoryId) {
                const category = await this.prisma.identity.customerMenuCategory.findUnique({
                    where: { id: user.menuCategoryId },
                });
                if (category) {
                    menu = user.resolveMenu(category.enabledRoutes);
                }
            }
            return {
                accessToken,
                refreshToken,
                isFirstLogin: user.isFirstLogin,
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName,
                    companyName: user.companyName,
                    avatarUrl: user.avatarUrl,
                    linkedEntityType: user.linkedEntityType,
                    linkedEntityId: user.linkedEntityId,
                    linkedEntityName: user.linkedEntityName,
                },
                menu,
            };
        }
        catch (error) {
            this.logger.error(`CustomerLoginHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CustomerLoginHandler = CustomerLoginHandler;
exports.CustomerLoginHandler = CustomerLoginHandler = CustomerLoginHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(customer_login_command_1.CustomerLoginCommand),
    __param(0, (0, common_1.Inject)(customer_user_repository_interface_1.CUSTOMER_USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], CustomerLoginHandler);
//# sourceMappingURL=customer-login.handler.js.map