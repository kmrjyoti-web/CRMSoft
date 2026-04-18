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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let CustomerAuthGuard = class CustomerAuthGuard {
    constructor(jwtService, config, prisma) {
        this.jwtService = jwtService;
        this.config = config;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);
        if (!token)
            throw new common_1.UnauthorizedException('No authentication token provided');
        let payload;
        try {
            payload = this.jwtService.verify(token, {
                secret: this.config.get('JWT_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        if (payload.type !== 'CUSTOMER') {
            throw new common_1.ForbiddenException('This endpoint is for customer portal access only');
        }
        const customerUser = await this.prisma.identity.customerUser.findFirst({
            where: { id: payload.sub, isActive: true, isDeleted: false },
            include: {
                menuCategory: { select: { id: true, name: true, enabledRoutes: true } },
            },
        });
        if (!customerUser) {
            throw new common_1.UnauthorizedException('Customer account not found or deactivated');
        }
        request.customerUser = customerUser;
        request.tenantId = customerUser.tenantId;
        request.user = { id: payload.sub, type: 'CUSTOMER', tenantId: customerUser.tenantId };
        return true;
    }
    extractToken(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.CustomerAuthGuard = CustomerAuthGuard;
exports.CustomerAuthGuard = CustomerAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], CustomerAuthGuard);
//# sourceMappingURL=customer-auth.guard.js.map