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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
const tenant_provisioning_service_1 = require("../../modules/core/identity/tenant/services/tenant-provisioning.service");
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    constructor(prisma, jwt, config, tenantProvisioning) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.tenantProvisioning = tenantProvisioning;
    }
    async adminLogin(email, password) {
        return this.loginWithType(email, password, ['ADMIN'], [
            'SUPER_ADMIN', 'ADMIN',
        ]);
    }
    async employeeLogin(email, password) {
        return this.loginWithType(email, password, ['EMPLOYEE'], [
            'MANAGER', 'SALES_EXECUTIVE', 'MARKETING_STAFF',
            'SUPPORT_AGENT', 'ACCOUNT_MANAGER',
        ]);
    }
    async customerLogin(email, password) {
        return this.loginWithType(email, password, ['CUSTOMER'], ['CUSTOMER']);
    }
    async partnerLogin(email, password) {
        return this.loginWithType(email, password, ['REFERRAL_PARTNER'], ['REFERRAL_PARTNER']);
    }
    async superAdminLogin(email, password) {
        const admin = await this.prisma.identity.superAdmin.findUnique({
            where: { email },
        });
        if (!admin)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!admin.isActive) {
            throw new common_1.UnauthorizedException('Account is disabled');
        }
        const valid = await bcrypt.compare(password, admin.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        await this.prisma.identity.superAdmin.update({
            where: { id: admin.id },
            data: { lastLoginAt: new Date() },
        });
        const payload = {
            sub: admin.id,
            email: admin.email,
            role: 'PLATFORM_ADMIN',
            userType: 'SUPER_ADMIN',
            isSuperAdmin: true,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(payload, {
                secret: this.config.get('JWT_SECRET'),
                expiresIn: '4h',
            }),
            this.jwt.signAsync(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: '1d',
            }),
        ]);
        return {
            user: {
                id: admin.id,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                role: 'PLATFORM_ADMIN',
            },
            accessToken,
            refreshToken,
        };
    }
    async vendorLogin(email, password) {
        const superAdmin = await this.prisma.identity.superAdmin.findUnique({ where: { email } });
        if (superAdmin) {
            throw new common_1.ForbiddenException('This portal is for vendors only. Please use the CRM Admin portal.');
        }
        const regularUser = await this.prisma.identity.user.findFirst({ where: { email } });
        if (regularUser) {
            throw new common_1.ForbiddenException('This portal is for vendors only. Please use the CRM Admin portal.');
        }
        const vendor = await this.prisma.platform.marketplaceVendor.findUnique({
            where: { contactEmail: email },
        });
        if (!vendor)
            throw new common_1.UnauthorizedException('Invalid email or password');
        if (!vendor.password) {
            throw new common_1.UnauthorizedException('Password not set. Please contact your administrator.');
        }
        const valid = await bcrypt.compare(password, vendor.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid email or password');
        if (vendor.status === 'PENDING') {
            throw new common_1.ForbiddenException('Your vendor registration is pending approval. Please wait for admin verification.');
        }
        if (vendor.status === 'SUSPENDED') {
            throw new common_1.ForbiddenException('Your vendor account has been suspended. Please contact support.');
        }
        await this.prisma.platform.marketplaceVendor.update({
            where: { id: vendor.id },
            data: { lastLoginAt: new Date() },
        });
        const payload = {
            sub: vendor.id,
            email: vendor.contactEmail,
            role: 'VENDOR',
            userType: 'VENDOR',
            vendorId: vendor.id,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(payload, {
                secret: this.config.get('JWT_SECRET'),
                expiresIn: '1d',
            }),
            this.jwt.signAsync(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);
        const firstName = vendor.contactName?.split(' ')[0] ?? vendor.companyName;
        const lastName = vendor.contactName?.split(' ').slice(1).join(' ') ?? '';
        return {
            accessToken,
            refreshToken,
            user: {
                id: vendor.id,
                email: vendor.contactEmail,
                firstName,
                lastName,
                userType: 'VENDOR',
                role: 'VENDOR',
            },
            vendor: {
                id: vendor.id,
                companyName: vendor.companyName,
                contactEmail: vendor.contactEmail,
                gstNumber: vendor.gstNumber,
                status: vendor.status,
                revenueSharePct: Number(vendor.revenueSharePct),
            },
            tenantId: '',
        };
    }
    async registerStaff(data) {
        const existing = await this.prisma.identity.user.findFirst({ where: { email: data.email } });
        if (existing) {
            throw new common_1.ConflictException('Email already exists');
        }
        const role = await this.prisma.identity.role.findFirst({ where: { id: data.roleId } });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        const userType = data.userType || 'EMPLOYEE';
        if (!['ADMIN', 'EMPLOYEE'].includes(userType)) {
            throw new common_1.ForbiddenException('Can only register ADMIN or EMPLOYEE via this endpoint');
        }
        const hashed = await bcrypt.hash(data.password, this.getSaltRounds());
        const user = await this.prisma.identity.user.create({
            data: {
                email: data.email, password: hashed,
                firstName: data.firstName, lastName: data.lastName,
                phone: data.phone, roleId: data.roleId,
                userType: userType, createdBy: data.createdBy,
                departmentId: data.departmentId || undefined,
                designationId: data.designationId || undefined,
            },
            include: { role: true },
        });
        return this.mapUserResponse(user);
    }
    async registerCustomer(data) {
        const existing = await this.prisma.identity.user.findFirst({ where: { email: data.email } });
        if (existing) {
            throw new common_1.ConflictException('Email already exists');
        }
        const role = await this.getOrCreateRole('CUSTOMER', 'Customer');
        const hashed = await bcrypt.hash(data.password, this.getSaltRounds());
        const user = await this.prisma.identity.user.create({
            data: {
                email: data.email, password: hashed,
                firstName: data.firstName, lastName: data.lastName,
                phone: data.phone, roleId: role.id,
                userType: 'CUSTOMER',
                customerProfile: {
                    create: {
                        companyName: data.companyName, gstNumber: data.gstNumber,
                        city: data.city, state: data.state,
                        country: data.country, industry: data.industry,
                    },
                },
            },
            include: { role: true, customerProfile: true },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role.name, 'CUSTOMER', user.tenantId);
        return {
            user: this.mapUserResponse(user),
            ...tokens,
        };
    }
    async registerPartner(data) {
        const existing = await this.prisma.identity.user.findFirst({ where: { email: data.email } });
        if (existing) {
            throw new common_1.ConflictException('Email already exists');
        }
        const role = await this.getOrCreateRole('REFERRAL_PARTNER', 'Referral Partner');
        const referralCode = this.generateReferralCode(data.firstName);
        const hashed = await bcrypt.hash(data.password, this.getSaltRounds());
        const user = await this.prisma.identity.user.create({
            data: {
                email: data.email, password: hashed,
                firstName: data.firstName, lastName: data.lastName,
                phone: data.phone, roleId: role.id,
                userType: 'REFERRAL_PARTNER',
                referralPartner: {
                    create: {
                        referralCode, panNumber: data.panNumber,
                        bankName: data.bankName, bankAccount: data.bankAccount,
                        ifscCode: data.ifscCode,
                    },
                },
            },
            include: { role: true, referralPartner: true },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role.name, 'REFERRAL_PARTNER', user.tenantId);
        return {
            user: { ...this.mapUserResponse(user), referralCode },
            ...tokens,
        };
    }
    async isSlugAvailable(slug) {
        const existing = await this.prisma.identity.tenant.findFirst({ where: { slug } });
        return !existing;
    }
    async registerTenant(data) {
        const existingUser = await this.prisma.identity.user.findFirst({ where: { email: data.email } });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        const existingTenant = await this.prisma.identity.tenant.findFirst({ where: { slug: data.slug } });
        if (existingTenant) {
            throw new common_1.ConflictException('Company slug already taken');
        }
        let planId = data.planId;
        if (!planId) {
            const defaultPlan = await this.prisma.identity.plan.findFirst({
                where: { isActive: true },
                orderBy: { price: 'asc' },
            });
            if (!defaultPlan) {
                throw new common_1.NotFoundException('No active plans available');
            }
            planId = defaultPlan.id;
        }
        const hashedPassword = await bcrypt.hash(data.password, this.getSaltRounds());
        const { tenant, adminUser, subscription } = await this.tenantProvisioning.provision({
            name: data.companyName,
            slug: data.slug,
            adminEmail: data.email,
            adminPassword: hashedPassword,
            adminFirstName: data.firstName,
            adminLastName: data.lastName,
            planId,
        });
        if (data.businessTypeCode) {
            const bt = await this.prisma.platform.businessTypeRegistry.findUnique({
                where: { typeCode: data.businessTypeCode },
            });
            if (bt) {
                await this.prisma.identity.tenant.update({
                    where: { id: tenant.id },
                    data: { businessTypeId: bt.id, industryCode: data.businessTypeCode },
                });
            }
        }
        const tokens = await this.generateTokens(adminUser.id, adminUser.email, 'ADMIN', 'ADMIN', tenant.id);
        return {
            user: {
                id: adminUser.id,
                email: adminUser.email,
                firstName: data.firstName,
                lastName: data.lastName,
                userType: 'ADMIN',
                role: 'ADMIN',
            },
            tenant: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                status: tenant.status,
                onboardingStep: tenant.onboardingStep,
                industryCode: data.businessTypeCode ?? null,
            },
            ...tokens,
        };
    }
    async refreshToken(token) {
        try {
            const payload = this.jwt.verify(token, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
            });
            if (payload.isSuperAdmin) {
                const admin = await this.prisma.identity.superAdmin.findUnique({
                    where: { id: payload.sub },
                });
                if (!admin || !admin.isActive) {
                    throw new common_1.UnauthorizedException('Invalid');
                }
                const newPayload = {
                    sub: admin.id, email: admin.email,
                    role: 'PLATFORM_ADMIN', userType: 'SUPER_ADMIN', isSuperAdmin: true,
                };
                const [accessToken, refreshToken] = await Promise.all([
                    this.jwt.signAsync(newPayload, {
                        secret: this.config.get('JWT_SECRET'), expiresIn: '4h',
                    }),
                    this.jwt.signAsync(newPayload, {
                        secret: this.config.get('JWT_REFRESH_SECRET'), expiresIn: '1d',
                    }),
                ]);
                return { accessToken, refreshToken };
            }
            if (payload.vendorId || payload.userType === 'VENDOR') {
                const vendor = await this.prisma.platform.marketplaceVendor.findUnique({
                    where: { id: payload.sub },
                });
                if (!vendor || vendor.status === 'SUSPENDED') {
                    throw new common_1.UnauthorizedException('Invalid');
                }
                const newPayload = {
                    sub: vendor.id, email: vendor.contactEmail,
                    role: 'VENDOR', userType: 'VENDOR', vendorId: vendor.id,
                };
                const [accessToken, refreshToken] = await Promise.all([
                    this.jwt.signAsync(newPayload, {
                        secret: this.config.get('JWT_SECRET'), expiresIn: '1d',
                    }),
                    this.jwt.signAsync(newPayload, {
                        secret: this.config.get('JWT_REFRESH_SECRET'), expiresIn: '7d',
                    }),
                ]);
                return { accessToken, refreshToken };
            }
            const user = await this.prisma.identity.user.findFirst({
                where: { id: payload.sub },
                include: { role: true },
            });
            if (!user || user.status !== 'ACTIVE') {
                throw new common_1.UnauthorizedException('Invalid');
            }
            return this.generateTokens(user.id, user.email, user.role.name, user.userType, user.tenantId);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async changePassword(userId, current, newPass) {
        const user = await this.prisma.identity.user.findFirst({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!(await bcrypt.compare(current, user.password))) {
            throw new common_1.UnauthorizedException('Wrong current password');
        }
        await this.prisma.identity.user.update({
            where: { id: userId },
            data: { password: await bcrypt.hash(newPass, this.getSaltRounds()) },
        });
        return { message: 'Password changed' };
    }
    async getProfile(userId) {
        const user = await this.prisma.identity.user.findFirst({
            where: { id: userId },
            include: {
                role: { select: { id: true, name: true, displayName: true } },
                customerProfile: true,
                referralPartner: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async getVendorProfile(vendorId) {
        const vendor = await this.prisma.platform.marketplaceVendor.findUnique({ where: { id: vendorId } });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        const firstName = vendor.contactName?.split(' ')[0] ?? vendor.companyName;
        const lastName = vendor.contactName?.split(' ').slice(1).join(' ') ?? '';
        return {
            id: vendor.id,
            email: vendor.contactEmail,
            firstName,
            lastName,
            userType: 'VENDOR',
            role: { id: null, name: 'VENDOR', displayName: 'Vendor' },
            vendor: {
                id: vendor.id,
                companyName: vendor.companyName,
                contactEmail: vendor.contactEmail,
                gstNumber: vendor.gstNumber,
                status: vendor.status,
            },
        };
    }
    async getSuperAdminProfile(adminId) {
        const admin = await this.prisma.identity.superAdmin.findUnique({ where: { id: adminId } });
        if (!admin)
            throw new common_1.NotFoundException('Super admin not found');
        return {
            id: admin.id,
            email: admin.email,
            firstName: admin.firstName,
            lastName: admin.lastName,
            userType: 'SUPER_ADMIN',
            role: { id: null, name: 'PLATFORM_ADMIN', displayName: 'Platform Admin' },
        };
    }
    async loginWithType(email, password, allowedUserTypes, allowedRoles) {
        const user = await this.prisma.identity.user.findFirst({
            where: { email },
            include: {
                role: true,
                customerProfile: true,
                referralPartner: true,
            },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Account inactive or suspended');
        }
        if (!allowedUserTypes.includes(user.userType)) {
            throw new common_1.UnauthorizedException('This account cannot login from this portal');
        }
        if (!user.role || !allowedRoles.includes(user.role.name)) {
            throw new common_1.UnauthorizedException('This account does not have access to this portal');
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        await this.prisma.identity.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const tenant = await this.prisma.identity.tenant.findUnique({
            where: { id: user.tenantId },
            select: { id: true, name: true, slug: true, status: true, onboardingStep: true, industryCode: true },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role.name, user.userType, user.tenantId);
        return {
            user: {
                ...this.mapUserResponse(user),
                ...(user.customerProfile && { profile: user.customerProfile }),
                ...(user.referralPartner && {
                    referralCode: user.referralPartner.referralCode,
                    commissionRate: user.referralPartner.commissionRate,
                    totalReferrals: user.referralPartner.totalReferrals,
                }),
            },
            tenant: tenant ?? undefined,
            ...tokens,
        };
    }
    async generateTokens(id, email, role, userType, tenantId) {
        const isSuperAdmin = userType === 'ADMIN' && ['SUPER_ADMIN', 'ADMIN'].includes(role);
        const payload = { sub: id, email, role, userType, tenantId, ...(isSuperAdmin && { isSuperAdmin: true }) };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(payload, {
                secret: this.config.get('JWT_SECRET'),
                expiresIn: this.config.get('JWT_EXPIRES_IN') || '24h',
            }),
            this.jwt.signAsync(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
            }),
        ]);
        return { accessToken, refreshToken };
    }
    mapUserResponse(user) {
        return {
            id: user.id, email: user.email,
            firstName: user.firstName, lastName: user.lastName,
            userType: user.userType, role: user.role.name,
            roleDisplayName: user.role.displayName,
        };
    }
    getSaltRounds() {
        return +(this.config.get('BCRYPT_SALT_ROUNDS') || 12);
    }
    async getOrCreateRole(name, displayName) {
        let role = await this.prisma.identity.role.findFirst({ where: { name } });
        if (!role) {
            role = await this.prisma.identity.role.create({
                data: { name, displayName, description: `${displayName} role` },
            });
        }
        return role;
    }
    generateReferralCode(firstName) {
        const prefix = firstName.slice(0, 3).toUpperCase();
        const random = (0, crypto_1.randomBytes)(3).toString('hex').toUpperCase();
        return `${prefix}-${random}`;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        tenant_provisioning_service_1.TenantProvisioningService])
], AuthService);
//# sourceMappingURL=auth.service.js.map