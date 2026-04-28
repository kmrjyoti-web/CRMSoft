import {
  Injectable, UnauthorizedException, ConflictException,
  NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { TenantProvisioningService } from '../../modules/core/identity/tenant/services/tenant-provisioning.service';
import { TalentIdService } from './talent-id.service';
import { MappingService } from './mapping.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private tenantProvisioning: TenantProvisioningService,
    private talentId: TalentIdService,
    private mapping: MappingService,
  ) {}

  // ═══════════════════════════════════════
  // LOGIN — validates userType matches portal
  // ═══════════════════════════════════════

  async adminLogin(email: string, password: string) {
    return this.loginWithType(email, password, ['ADMIN'], [
      'SUPER_ADMIN', 'ADMIN',
    ]);
  }

  async employeeLogin(email: string, password: string) {
    return this.loginWithType(email, password, ['EMPLOYEE'], [
      'MANAGER', 'SALES_EXECUTIVE', 'MARKETING_STAFF',
      'SUPPORT_AGENT', 'ACCOUNT_MANAGER',
    ]);
  }

  async customerLogin(email: string, password: string) {
    return this.loginWithType(email, password, ['CUSTOMER'], ['CUSTOMER']);
  }

  async partnerLogin(email: string, password: string) {
    return this.loginWithType(email, password, ['REFERRAL_PARTNER'], ['REFERRAL_PARTNER']);
  }

  // ═══════════════════════════════════════
  // SUPER ADMIN LOGIN (platform-level)
  // ═══════════════════════════════════════

  async superAdminLogin(email: string, password: string) {
    const admin = await this.prisma.identity.superAdmin.findUnique({
      where: { email },
    });

    if (!admin) throw new UnauthorizedException('Invalid credentials');
    if (!admin.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

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

  // ═══════════════════════════════════════
  // VENDOR LOGIN (marketplace vendor)
  // ═══════════════════════════════════════

  async vendorLogin(email: string, password: string) {
    // Reject SuperAdmin trying to use vendor portal
    const superAdmin = await this.prisma.identity.superAdmin.findUnique({ where: { email } });
    if (superAdmin) {
      throw new ForbiddenException(
        'This portal is for vendors only. Please use the CRM Admin portal.',
      );
    }

    // Reject regular User (admin/employee/customer/partner)
    const regularUser = await this.prisma.identity.user.findFirst({ where: { email } });
    if (regularUser) {
      throw new ForbiddenException(
        'This portal is for vendors only. Please use the CRM Admin portal.',
      );
    }

    // Find vendor by email
    const vendor = await this.prisma.platform.marketplaceVendor.findUnique({
      where: { contactEmail: email },
    });

    if (!vendor) throw new UnauthorizedException('Invalid email or password');
    if (!vendor.password) {
      throw new UnauthorizedException(
        'Password not set. Please contact your administrator.',
      );
    }

    const valid = await bcrypt.compare(password, vendor.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    // Status checks
    if (vendor.status === 'PENDING') {
      throw new ForbiddenException(
        'Your vendor registration is pending approval. Please wait for admin verification.',
      );
    }
    if (vendor.status === 'SUSPENDED') {
      throw new ForbiddenException(
        'Your vendor account has been suspended. Please contact support.',
      );
    }

    // Update last login
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

  // ═══════════════════════════════════════
  // REGISTER — Admin creates staff
  // ═══════════════════════════════════════

  async registerStaff(data: {
    email: string; password: string; firstName: string;
    lastName: string; phone?: string; roleId: string;
    userType?: string; departmentId?: string; designationId?: string;
    createdBy: string;
  }) {
    const existing = await this.prisma.identity.user.findFirst({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const role = await this.prisma.identity.role.findFirst({ where: { id: data.roleId } });
    if (!role) throw new NotFoundException('Role not found');

    const userType = data.userType || 'EMPLOYEE';
    if (!['ADMIN', 'EMPLOYEE'].includes(userType)) {
      throw new ForbiddenException('Can only register ADMIN or EMPLOYEE via this endpoint');
    }

    const hashed = await bcrypt.hash(data.password, this.getSaltRounds());
    const user = await this.prisma.identity.user.create({
      data: {
        email: data.email, password: hashed,
        firstName: data.firstName, lastName: data.lastName,
        phone: data.phone, roleId: data.roleId,
        userType: userType as any, createdBy: data.createdBy,
        departmentId: data.departmentId || undefined,
        designationId: data.designationId || undefined,
      },
      include: { role: true },
    });
    return this.mapUserResponse(user);
  }

  // ═══════════════════════════════════════
  // VERTICAL SELF-REGISTER (brand-aware)
  // ═══════════════════════════════════════

  private static readonly PERMISSION_MATRIX: Record<string, Record<string, boolean | string>> = {
    COMPANY_B2B:   { canOfferToB2b: true,  canOfferToB2c: true,  canViewB2bShopping: true,  canViewB2cShopping: true,  canBrowseB2bOffers: true,  canOfferServicesB2b: false, canOfferServicesB2c: false, marketplaceRole: 'SELLER_B2B_B2C' },
    COMPANY_B2C:   { canOfferToB2b: false, canOfferToB2c: true,  canViewB2bShopping: false, canViewB2cShopping: true,  canBrowseB2bOffers: false, canOfferServicesB2b: false, canOfferServicesB2c: false, marketplaceRole: 'SELLER_B2C_ONLY' },
    INDIVIDUAL_SP: { canOfferToB2b: false, canOfferToB2c: false, canViewB2bShopping: false, canViewB2cShopping: true,  canBrowseB2bOffers: false, canOfferServicesB2b: true,  canOfferServicesB2c: true,  marketplaceRole: 'SERVICE_PROVIDER_DUAL' },
    CUSTOMER:      { canOfferToB2b: false, canOfferToB2c: false, canViewB2bShopping: false, canViewB2cShopping: true,  canBrowseB2bOffers: false, canOfferServicesB2b: false, canOfferServicesB2c: false, marketplaceRole: 'BUYER_B2C' },
    EMPLOYEE:      { canOfferToB2b: false, canOfferToB2c: false, canViewB2bShopping: false, canViewB2cShopping: false, canBrowseB2bOffers: false, canOfferServicesB2b: false, canOfferServicesB2c: false, marketplaceRole: 'INTERNAL' },
  };

  async registerVertical(data: {
    verticalCode: string;
    categoryCode: string;
    subcategoryCode: string;
    brandCode: string;
    email: string;
    password: string;
    registrationFields?: Record<string, any>;
    selectedBusinessModes?: string[];
  }) {
    const existing = await this.prisma.identity.user.findFirst({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already registered');

    const permissions = AuthService.PERMISSION_MATRIX[data.categoryCode];
    if (!permissions) throw new BadRequestException(`Unknown category: ${data.categoryCode}`);

    const requiresApproval = ['DMC_PROVIDER', 'AGENT', 'TOUR_GUIDE'].includes(data.subcategoryCode);

    const role = await this.getOrCreateRole('CUSTOMER', 'Customer');
    const userTalentId = await this.talentId.nextUserId();

    const hashed = await bcrypt.hash(data.password, this.getSaltRounds());
    const user = await this.prisma.identity.user.create({
      data: {
        email: data.email,
        password: hashed,
        firstName: data.registrationFields?.full_name?.split(' ')[0] ?? data.registrationFields?.company_name?.split(' ')[0] ?? data.registrationFields?.agency_name?.split(' ')[0] ?? 'User',
        lastName: data.registrationFields?.full_name?.split(' ').slice(1).join(' ') ?? '',
        userType: 'CUSTOMER',
        roleId: role.id,
        tenantId: '',
        status: 'ACTIVE',
        emailVerified: !requiresApproval,
        categoryCode: data.categoryCode,
        subcategoryCode: data.subcategoryCode,
        brandCode: data.brandCode,
        verticalCode: data.verticalCode,
        permissionsJson: permissions as any,
        registrationFields: (data.registrationFields ?? {}) as any,
        registrationStatus: requiresApproval ? 'PENDING' : 'ACTIVE',
        talentId: userTalentId,
      } as any,
      include: { role: true },
    });

    const companyResult = await this.mapping.createForRegistration({
      userId: user.id,
      categoryCode: data.categoryCode,
      subcategoryCode: data.subcategoryCode,
      brandCode: data.brandCode,
      verticalCode: data.verticalCode,
      registrationFields: data.registrationFields,
      requiresApproval,
      selectedBusinessModes: data.selectedBusinessModes,
    });

    if (!requiresApproval) {
      const companyId = companyResult?.company?.id;
      const tokens = await this.generateTokens(user.id, user.email, role.name, user.userType, user.tenantId, companyId, { companyRole: 'OWNER', combinedCode: (data.registrationFields as any)?._combinedCode ?? null });
      return {
        user: this.mapUserResponse(user),
        requiresApproval: false,
        message: 'Registration successful. Welcome!',
        ...(companyResult && { company: { id: companyResult.company.id, talentId: companyResult.company.talentId, name: companyResult.company.name } }),
        ...tokens,
      };
    }

    return {
      user: { id: user.id, email: user.email, talentId: userTalentId },
      requiresApproval: true,
      message: 'Registration submitted. Our team will review and activate your account.',
    };
  }

  // ═══════════════════════════════════════
  // DYNAMIC REGISTER (M4 — config-driven)
  // ═══════════════════════════════════════

  async registerDynamic(dto: {
    combinedCode: string;
    brandCode: string;
    verticalCode: string;
    userType: string;
    subTypeCode: string;
    email: string;
    password: string;
    mobile?: string;
    fields?: Record<string, any>;
  }) {
    const USER_TYPE_CATEGORY_MAP: Record<string, string> = {
      B2B: 'COMPANY_B2B',
      B2C: 'COMPANY_B2C',
      IND_SP: 'INDIVIDUAL_SP',
      IND_EE: 'EMPLOYEE',
    };
    const categoryCode = USER_TYPE_CATEGORY_MAP[dto.userType] ?? 'COMPANY_B2B';

    // Extract businessModes from wizard fields and remove from registrationFields
    const rawModes = dto.fields?.businessModes;
    const selectedBusinessModes: string[] =
      Array.isArray(rawModes) ? rawModes : (rawModes ? [String(rawModes)] : []);
    const { businessModes: _omit, ...restFields } = dto.fields ?? {};

    return this.registerVertical({
      verticalCode: dto.verticalCode,
      categoryCode,
      subcategoryCode: dto.subTypeCode,
      brandCode: dto.brandCode,
      email: dto.email,
      password: dto.password,
      selectedBusinessModes,
      registrationFields: {
        ...restFields,
        ...(dto.mobile ? { mobile: dto.mobile } : {}),
        _combinedCode: dto.combinedCode,
      },
    });
  }

  // ═══════════════════════════════════════
  // CUSTOMER SELF-REGISTER (public)
  // ═══════════════════════════════════════

  async registerCustomer(data: {
    email: string; password: string; firstName: string;
    lastName: string; phone?: string; companyName?: string;
    gstNumber?: string; city?: string; state?: string;
    country?: string; industry?: string;
  }) {
    const existing = await this.prisma.identity.user.findFirst({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('Email already exists');
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

    const tokens = await this.generateTokens(
      user.id, user.email, user.role.name, 'CUSTOMER', user.tenantId,
    );

    return {
      user: this.mapUserResponse(user),
      ...tokens,
    };
  }

  // ═══════════════════════════════════════
  // PARTNER SELF-REGISTER (public)
  // ═══════════════════════════════════════

  async registerPartner(data: {
    email: string; password: string; firstName: string;
    lastName: string; phone?: string; panNumber?: string;
    bankName?: string; bankAccount?: string; ifscCode?: string;
  }) {
    const existing = await this.prisma.identity.user.findFirst({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('Email already exists');
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

    const tokens = await this.generateTokens(
      user.id, user.email, user.role.name, 'REFERRAL_PARTNER', user.tenantId,
    );

    return {
      user: { ...this.mapUserResponse(user), referralCode },
      ...tokens,
    };
  }

  /** Check if a company slug is available. */
  async isSlugAvailable(slug: string): Promise<boolean> {
    const existing = await this.prisma.identity.tenant.findFirst({ where: { slug } });
    return !existing;
  }

  // ═══════════════════════════════════════
  // TENANT SELF-REGISTER (public)
  // ═══════════════════════════════════════

  async registerTenant(data: {
    companyName: string; slug: string; email: string;
    password: string; firstName: string; lastName: string;
    phone?: string; planId?: string; businessTypeCode?: string;
    registeredOnDomain?: string;
  }) {
    // Check email uniqueness
    const existingUser = await this.prisma.identity.user.findFirst({ where: { email: data.email } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check slug uniqueness
    const existingTenant = await this.prisma.identity.tenant.findFirst({ where: { slug: data.slug } });
    if (existingTenant) {
      throw new ConflictException('Company slug already taken');
    }

    // Resolve WL parent tenant if registering from a branded domain
    let parentTenantId: string | undefined;
    let brandCode: string | undefined;
    let partnerCode: string | undefined;
    let editionCode: string | undefined;
    let verticalCode: string | undefined;

    if (data.registeredOnDomain) {
      const d = data.registeredOnDomain.toLowerCase().trim();
      const parentTenant = await this.prisma.identity.tenant.findFirst({
        where: { OR: [{ domain: d }, { subdomain: d }] },
        select: { id: true, brandCode: true, partnerCode: true, editionCode: true, verticalCode: true },
      });
      if (parentTenant) {
        parentTenantId = parentTenant.id;
        brandCode = parentTenant.brandCode ?? undefined;
        partnerCode = parentTenant.partnerCode ?? undefined;
        editionCode = parentTenant.editionCode ?? undefined;
        verticalCode = parentTenant.verticalCode ?? undefined;
      }
    }

    // Find plan (use provided or first active plan)
    let planId = data.planId;
    if (!planId) {
      const defaultPlan = await this.prisma.identity.plan.findFirst({
        where: { isActive: true },
        orderBy: { price: 'asc' },
      });
      if (!defaultPlan) {
        throw new NotFoundException('No active plans available');
      }
      planId = defaultPlan.id;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, this.getSaltRounds());

    // Provision tenant (creates Tenant + roles + admin User + permissions + lookups + Subscription + TenantUsage)
    const { tenant, adminUser } = await this.tenantProvisioning.provision({
      name: data.companyName,
      slug: data.slug,
      adminEmail: data.email,
      adminPassword: hashedPassword,
      adminFirstName: data.firstName,
      adminLastName: data.lastName,
      planId,
    });

    // Apply WL context + business type in a single update
    const updateData: Record<string, unknown> = {};
    if (parentTenantId) {
      updateData.parentTenantId = parentTenantId;
      if (brandCode)    updateData.brandCode    = brandCode;
      if (partnerCode)  updateData.partnerCode  = partnerCode;
      if (editionCode)  updateData.editionCode  = editionCode;
      if (verticalCode) updateData.verticalCode = verticalCode;
    }
    if (data.businessTypeCode) {
      const bt = await this.prisma.platform.businessTypeRegistry.findUnique({
        where: { typeCode: data.businessTypeCode },
      });
      if (bt) {
        updateData.businessTypeId = bt.id;
        updateData.industryCode   = data.businessTypeCode;
      }
    }
    if (Object.keys(updateData).length > 0) {
      await this.prisma.identity.tenant.update({ where: { id: tenant.id }, data: updateData });
    }

    // Generate JWT tokens (auto-login)
    const tokens = await this.generateTokens(
      adminUser.id, adminUser.email, 'ADMIN', 'ADMIN', tenant.id,
    );

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
        parentTenantId: parentTenantId ?? null,
      },
      ...tokens,
    };
  }

  // ═══════════════════════════════════════
  // SHARED METHODS
  // ═══════════════════════════════════════

  async refreshToken(token: string) {
    try {
      const payload = this.jwt.verify(token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      // Super admin refresh
      if (payload.isSuperAdmin) {
        const admin = await this.prisma.identity.superAdmin.findUnique({
          where: { id: payload.sub },
        });
        if (!admin || !admin.isActive) {
          throw new UnauthorizedException('Invalid');
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

      // Vendor refresh
      if (payload.vendorId || payload.userType === 'VENDOR') {
        const vendor = await this.prisma.platform.marketplaceVendor.findUnique({
          where: { id: payload.sub },
        });
        if (!vendor || vendor.status === 'SUSPENDED') {
          throw new UnauthorizedException('Invalid');
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

      // Regular user refresh
      const user = await this.prisma.identity.user.findFirst({
        where: { id: payload.sub },
        include: { role: true },
      });
      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Invalid');
      }
      return this.generateTokens(
        user.id, user.email, user.role.name, user.userType, user.tenantId,
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(userId: string, current: string, newPass: string) {
    const user = await this.prisma.identity.user.findFirst({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!(await bcrypt.compare(current, user.password))) {
      throw new UnauthorizedException('Wrong current password');
    }
    await this.prisma.identity.user.update({
      where: { id: userId },
      data: { password: await bcrypt.hash(newPass, this.getSaltRounds()) },
    });
    return { message: 'Password changed' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.identity.user.findFirst({
      where: { id: userId },
      include: {
        role: { select: { id: true, name: true, displayName: true } },
        customerProfile: true,
        referralPartner: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getVendorProfile(vendorId: string) {
    const vendor = await this.prisma.platform.marketplaceVendor.findUnique({ where: { id: vendorId } });
    if (!vendor) throw new NotFoundException('Vendor not found');
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

  async getSuperAdminProfile(adminId: string) {
    const admin = await this.prisma.identity.superAdmin.findUnique({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Super admin not found');
    return {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      userType: 'SUPER_ADMIN',
      role: { id: null, name: 'PLATFORM_ADMIN', displayName: 'Platform Admin' },
    };
  }

  // ═══════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════

  private async loginWithType(
    email: string,
    password: string,
    allowedUserTypes: string[],
    allowedRoles: string[],
  ) {
    const user = await this.prisma.identity.user.findFirst({
      where: { email },
      include: {
        role: true,
        customerProfile: true,
        referralPartner: true,
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account inactive or suspended');
    }

    if (!allowedUserTypes.includes(user.userType)) {
      throw new UnauthorizedException(
        'This account cannot login from this portal',
      );
    }

    if (!user.role || !allowedRoles.includes(user.role.name)) {
      throw new UnauthorizedException(
        'This account does not have access to this portal',
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.identity.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Fetch tenant info for response
    const tenant = await this.prisma.identity.tenant.findUnique({
      where: { id: user.tenantId },
      select: { id: true, name: true, slug: true, status: true, onboardingStep: true, industryCode: true },
    });

    // Backward-compat: include companyId so JWT carries the person-centric field
    const companies = await this.mapping.getUserCompanies(user.id);
    const primaryMapping = companies.find((m: any) => m.isDefault) ?? companies[0];
    const companyId = primaryMapping?.company?.id;

    const tokens = await this.generateTokens(
      user.id, user.email, user.role.name, user.userType, user.tenantId, companyId,
    );

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

  // ═══════════════════════════════════════
  // UNIVERSAL LOGIN (brand portal — any email)
  // ═══════════════════════════════════════

  async universalLogin(email: string, password: string) {
    const user = await this.prisma.identity.user.findFirst({
      where: { email },
      include: { role: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.status !== 'ACTIVE') throw new UnauthorizedException('Account inactive or suspended');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.identity.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const companies = await this.mapping.getUserCompanies(user.id);

    let companyId: string | undefined;
    if (companies.length === 1) {
      companyId = companies[0].company.id;
    } else if (companies.length > 1) {
      const defaultMapping = companies.find((m: any) => m.isDefault);
      companyId = defaultMapping?.company?.id;
    }

    const activeCompany = companies.find((m: any) => m.company.id === companyId);
    const activeBrandCode = activeCompany?.company?.brandCode ?? null;
    const activeCompanyRole = activeCompany?.role ?? null;
    const talentId = (user as any).talentId ?? null;

    const purpose = companyId ? undefined : 'dashboard';
    const activeCombinedCode = ((user as any).registrationFields as any)?._combinedCode ?? null;

    const tokens = await this.generateTokens(
      user.id, user.email, user.role.name, user.userType, user.tenantId, companyId,
      { talentId, brandCode: activeBrandCode, purpose, companyRole: activeCompanyRole, combinedCode: activeCombinedCode },
    );

    const redirectPath = '/dashboard';

    return {
      user: {
        ...this.mapUserResponse(user),
        talentId,
      },
      companies: companies.map((m: any) => ({
        id: m.company.id,
        talentId: m.company.talentId,
        name: m.company.name,
        brandCode: m.company.brandCode ?? null,
        verticalCode: m.company.verticalCode ?? null,
        categoryCode: m.company.categoryCode ?? null,
        role: m.role,
        isDefault: m.isDefault,
        status: m.status,
      })),
      activeCompanyId: companyId ?? null,
      activeCompanyBrandCode: activeBrandCode,
      requiresCompanySelection: companies.length > 1 && !companyId,
      hasCompanies: companies.length > 0,
      companyCount: companies.length,
      redirectPath,
      ...tokens,
    };
  }

  // ═══════════════════════════════════════
  // SWITCH COMPANY (exchange JWT companyId)
  // ═══════════════════════════════════════

  async getMyCompanies(userId: string) {
    const companies = await this.mapping.getUserCompanies(userId);
    return companies.map((m: any) => ({
      id: m.company.id,
      talentId: m.company.talentId,
      name: m.company.name,
      brandCode: m.company.brandCode ?? null,
      verticalCode: m.company.verticalCode ?? null,
      categoryCode: m.company.categoryCode ?? null,
      role: m.role,
      isDefault: m.isDefault,
      status: m.status,
      lastAccessedAt: m.lastAccessedAt ?? null,
    }));
  }

  async selectCompany(userId: string, companyId: string) {
    return this.switchCompany(userId, companyId);
  }

  async switchCompany(userId: string, companyId: string) {
    const user = await this.prisma.identity.user.findFirst({
      where: { id: userId },
      include: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const isMember = await this.mapping.verifyMembership(userId, companyId);
    if (!isMember) throw new ForbiddenException('Not a member of this company');

    // Resolve brand from mapping for JWT
    const mapping = await (this.prisma.identity as any).userCompanyMapping.findFirst({
      where: { userId, companyId, status: 'ACTIVE', isDeleted: false },
      include: { company: true },
    });
    const brandCode = mapping?.company?.brandCode ?? null;
    const mappingRole = mapping?.role ?? null;
    const talentId = (user as any).talentId ?? null;

    const tokens = await this.generateTokens(
      user.id, user.email, user.role.name, user.userType, user.tenantId, companyId,
      { talentId, brandCode, companyRole: mappingRole },
    );
    return { activeCompanyId: companyId, activeCompanyBrandCode: brandCode, ...tokens };
  }

  private async generateTokens(
    id: string, email: string, role: string, userType: string, tenantId: string,
    companyId?: string,
    opts?: { talentId?: string | null; brandCode?: string | null; purpose?: string; companyRole?: string | null; combinedCode?: string | null },
  ) {
    // Backward-compat: CUSTOMER/TRAVELER users have tenantId='' in DB (no dedicated tenant yet).
    // Fall back to DEFAULT_TENANT_ID so legacy endpoints don't see an empty tenantId.
    const sharedTenantId = this.config.get<string>('DEFAULT_TENANT_ID') || '';
    const effectiveTenantId = tenantId || sharedTenantId;
    const isSharedTenant = !tenantId || tenantId === sharedTenantId;

    const isSuperAdmin = userType === 'ADMIN' && ['SUPER_ADMIN', 'ADMIN'].includes(role);
    const payload = {
      sub: id, email, role, userType,
      // Legacy field — required by 15+ endpoints via request.user.tenantId
      tenantId: effectiveTenantId,
      // New person-centric field (PR #44) — may be null for FREE plan / no company
      companyId: companyId ?? null,
      isSharedTenant,
      // Person-centric identity fields (Day 2)
      ...(opts?.talentId && { talentId: opts.talentId }),
      ...(opts?.brandCode && { brandCode: opts.brandCode }),
      ...(opts?.purpose && { purpose: opts.purpose }),
      ...(opts?.companyRole && { companyRole: opts.companyRole }),
      ...(opts?.combinedCode && { combinedCode: opts.combinedCode }),
      ...(isSuperAdmin && { isSuperAdmin: true }),
    };
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

  private mapUserResponse(user: any) {
    return {
      id: user.id, email: user.email,
      firstName: user.firstName, lastName: user.lastName,
      userType: user.userType, role: user.role.name,
      roleDisplayName: user.role.displayName,
    };
  }

  private getSaltRounds(): number {
    return +(this.config.get('BCRYPT_SALT_ROUNDS') || 12);
  }

  private async getOrCreateRole(name: string, displayName: string) {
    let role = await this.prisma.identity.role.findFirst({ where: { name } });
    if (!role) {
      role = await this.prisma.identity.role.create({
        data: { name, displayName, description: `${displayName} role` },
      });
    }
    return role;
  }

  private generateReferralCode(firstName: string): string {
    const prefix = firstName.slice(0, 3).toUpperCase();
    const random = randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${random}`;
  }
}
