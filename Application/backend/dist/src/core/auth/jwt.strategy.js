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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(config, prisma) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get('JWT_SECRET'),
        });
        this.config = config;
        this.prisma = prisma;
    }
    async validate(payload) {
        if (payload.isSuperAdmin) {
            return {
                id: payload.sub,
                email: payload.email,
                role: payload.role ?? 'PLATFORM_ADMIN',
                userType: payload.userType ?? 'SUPER_ADMIN',
                tenantId: payload.tenantId,
                isSuperAdmin: true,
            };
        }
        if (payload.vendorId || payload.userType === 'VENDOR') {
            return {
                id: payload.sub,
                email: payload.email,
                role: 'VENDOR',
                userType: 'VENDOR',
                vendorId: payload.vendorId ?? payload.sub,
            };
        }
        const user = await this.prisma.identity.user.findFirst({
            where: { id: payload.sub, tenantId: payload.tenantId },
            select: {
                id: true, email: true, firstName: true, lastName: true,
                status: true, userType: true, tenantId: true,
                role: { select: { id: true, name: true, displayName: true, level: true } },
                departmentId: true,
                department: { select: { id: true, name: true, path: true } },
            },
        });
        if (!user || user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        let businessTypeCode;
        if (user.tenantId) {
            const tenant = await this.prisma.identity.tenant.findUnique({
                where: { id: user.tenantId },
                select: { industryCode: true },
            });
            businessTypeCode = tenant?.industryCode ?? undefined;
        }
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role.name,
            roleId: user.role.id,
            roleLevel: user.role.level,
            userType: user.userType,
            departmentId: user.departmentId,
            departmentPath: user.department?.path,
            tenantId: user.tenantId,
            businessTypeCode,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, prisma_service_1.PrismaService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map