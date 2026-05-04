import {
  Injectable, NotFoundException, ConflictException, UnauthorizedException, BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type {
  ActivatePortalDto, CreateMenuCategoryDto, UpdateMenuCategoryDto,
  UpdatePageOverridesDto, CustomerPortalLoginDto,
  RequestPasswordResetDto, ResetPasswordDto,
} from './presentation/dto/customer-portal.dto';

/** Default menu routes available in the portal */
export const PORTAL_DEFAULT_ROUTES = [
  { key: 'dashboard',   label: 'Dashboard',   icon: 'layout-dashboard', path: '/portal/dashboard' },
  { key: 'orders',      label: 'My Orders',   icon: 'shopping-cart',    path: '/portal/orders' },
  { key: 'invoices',    label: 'Invoices',    icon: 'file-text',        path: '/portal/invoices' },
  { key: 'payments',    label: 'Payments',    icon: 'credit-card',      path: '/portal/payments' },
  { key: 'support',     label: 'Support',     icon: 'headphones',       path: '/portal/support' },
  { key: 'documents',   label: 'Documents',   icon: 'folder',           path: '/portal/documents' },
  { key: 'profile',     label: 'My Profile',  icon: 'user',             path: '/portal/profile' },
];

@Injectable()
export class CustomerPortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ── Auth ──────────────────────────────────────────────────────────────────

  async login(tenantId: string, dto: CustomerPortalLoginDto) {
    const cu = await this.prisma.identity.customerUser.findFirst({
      where: { tenantId, email: dto.email, isDeleted: false },
      include: { menuCategory: true },
    });

    if (!cu) throw new UnauthorizedException('Invalid credentials');
    if (!cu.isActive) throw new UnauthorizedException('Account is disabled');

    // Brute-force lockout
    if (cu.lockedUntil && cu.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account temporarily locked — try again later');
    }

    const valid = await bcrypt.compare(dto.password, cu.passwordHash);
    if (!valid) {
      const failed = cu.failedAttempts + 1;
      const lockedUntil = failed >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      await this.prisma.identity.customerUser.update({
        where: { id: cu.id },
        data: { failedAttempts: failed, ...(lockedUntil && { lockedUntil }) },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.identity.customerUser.update({
      where: { id: cu.id },
      data: {
        failedAttempts: 0, lockedUntil: null,
        lastLoginAt: new Date(), loginCount: { increment: 1 },
        isFirstLogin: false,
      },
    });

    // Log the login
    await this.prisma.identity.customerPortalLog.create({
      data: { tenantId, customerUserId: cu.id, action: 'LOGIN' },
    });

    const payload = {
      sub: cu.id, email: cu.email, tenantId,
      entityType: cu.linkedEntityType, entityId: cu.linkedEntityId,
      type: 'customer_portal',
    };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_PORTAL_EXPIRES_IN') || '12h',
    });

    return {
      accessToken,
      user: this.mapCustomerUser(cu),
      menuCategory: cu.menuCategory ?? null,
      availableRoutes: this.resolveRoutes(cu.menuCategory?.enabledRoutes as string[] | null, cu.pageOverrides as Record<string, boolean> | null),
      isFirstLogin: cu.isFirstLogin,
    };
  }

  // ── Menu Categories ───────────────────────────────────────────────────────

  async listCategories(tenantId: string) {
    return this.prisma.identity.customerMenuCategory.findMany({
      where: { tenantId, isDeleted: false },
      orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }],
      include: { _count: { select: { users: true } } },
    });
  }

  async createCategory(tenantId: string, createdById: string, dto: CreateMenuCategoryDto) {
    const existing = await this.prisma.identity.customerMenuCategory.findFirst({
      where: { tenantId, name: dto.name, isDeleted: false },
    });
    if (existing) throw new ConflictException(`Category "${dto.name}" already exists`);

    if (dto.isDefault) {
      await this.prisma.identity.customerMenuCategory.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.identity.customerMenuCategory.create({
      data: {
        tenantId, createdById,
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        color: dto.color,
        enabledRoutes: dto.enabledRoutes ?? PORTAL_DEFAULT_ROUTES.map(r => r.key),
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  async updateCategory(tenantId: string, id: string, dto: UpdateMenuCategoryDto) {
    const cat = await this.prisma.identity.customerMenuCategory.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
    if (!cat) throw new NotFoundException('Menu category not found');

    if (dto.name && dto.name !== cat.name) {
      const dup = await this.prisma.identity.customerMenuCategory.findFirst({
        where: { tenantId, name: dto.name, isDeleted: false, id: { not: id } },
      });
      if (dup) throw new ConflictException(`Category "${dto.name}" already exists`);
    }

    if (dto.isDefault) {
      await this.prisma.identity.customerMenuCategory.updateMany({
        where: { tenantId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.identity.customerMenuCategory.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.enabledRoutes !== undefined && { enabledRoutes: dto.enabledRoutes }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async deleteCategory(tenantId: string, id: string) {
    const cat = await this.prisma.identity.customerMenuCategory.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
    if (!cat) throw new NotFoundException('Menu category not found');

    // Unlink users before soft-delete
    await this.prisma.identity.customerUser.updateMany({
      where: { menuCategoryId: id },
      data: { menuCategoryId: null },
    });

    await this.prisma.identity.customerMenuCategory.update({
      where: { id },
      data: { isDeleted: true },
    });
    return { deleted: true };
  }

  // ── Portal Activation / User Management ──────────────────────────────────

  async getEligibleEntities(tenantId: string) {
    const working = await this.prisma.getWorkingClient(tenantId);

    const [contacts, organizations] = await Promise.all([
      working.contact.findMany({
        where: { entityVerificationStatus: 'VERIFIED', isDeleted: false },
        select: { id: true, firstName: true, lastName: true },
        take: 100,
        orderBy: { createdAt: 'desc' },
      }),
      working.organization.findMany({
        where: { entityVerificationStatus: 'VERIFIED', isDeleted: false },
        select: { id: true, name: true },
        take: 100,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Find already-activated ones
    const activatedIds = await this.prisma.identity.customerUser.findMany({
      where: { tenantId, isDeleted: false },
      select: { linkedEntityId: true, linkedEntityType: true },
    });
    const activatedSet = new Set(activatedIds.map((a: Record<string, unknown>) => `${a.linkedEntityType}:${a.linkedEntityId}`));

    return {
      contacts: contacts.map((c: Record<string, unknown>) => ({
        id: c.id, type: 'CONTACT',
        name: `${c.firstName} ${c.lastName}`.trim(),
        activated: activatedSet.has(`CONTACT:${c.id}`),
      })),
      organizations: organizations.map((o: Record<string, unknown>) => ({
        id: o.id, type: 'ORGANIZATION',
        name: o.name,
        activated: activatedSet.has(`ORGANIZATION:${o.id}`),
      })),
    };
  }

  async activatePortal(tenantId: string, createdById: string, dto: ActivatePortalDto) {
    // Check not already activated
    const existing = await this.prisma.identity.customerUser.findFirst({
      where: { tenantId, linkedEntityType: dto.linkedEntityType, linkedEntityId: dto.linkedEntityId, isDeleted: false },
    });
    if (existing) throw new ConflictException('Portal already activated for this entity');

    // Check email uniqueness within tenant
    const emailUsed = await this.prisma.identity.customerUser.findFirst({
      where: { tenantId, email: dto.email, isDeleted: false },
    });
    if (emailUsed) throw new ConflictException('Email already used for another portal user');

    // Get default category if not specified
    let menuCategoryId = dto.menuCategoryId ?? null;
    if (!menuCategoryId) {
      const defaultCat = await this.prisma.identity.customerMenuCategory.findFirst({
        where: { tenantId, isDefault: true, isDeleted: false },
      });
      menuCategoryId = defaultCat?.id ?? null;
    }

    // Generate temporary password
    const tempPassword = this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const cu = await this.prisma.identity.customerUser.create({
      data: {
        tenantId, createdById,
        email: dto.email,
        passwordHash,
        linkedEntityType: dto.linkedEntityType,
        linkedEntityId: dto.linkedEntityId,
        linkedEntityName: dto.linkedEntityName,
        displayName: dto.displayName ?? dto.linkedEntityName,
        ...(menuCategoryId && { menuCategoryId }),
      },
    });

    return { ...this.mapCustomerUser(cu), temporaryPassword: tempPassword };
  }

  async listPortalUsers(tenantId: string) {
    return this.prisma.identity.customerUser.findMany({
      where: { tenantId, isDeleted: false },
      include: { menuCategory: { select: { id: true, name: true, icon: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPortalUser(tenantId: string, id: string) {
    const cu = await this.prisma.identity.customerUser.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: { menuCategory: true },
    });
    if (!cu) throw new NotFoundException('Portal user not found');
    return cu;
  }

  async updatePortalUser(tenantId: string, id: string, data: { isActive?: boolean; menuCategoryId?: string | null }) {
    const cu = await this.prisma.identity.customerUser.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
    if (!cu) throw new NotFoundException('Portal user not found');

    return this.prisma.identity.customerUser.update({ where: { id }, data });
  }

  async updatePageOverrides(tenantId: string, id: string, dto: UpdatePageOverridesDto) {
    const cu = await this.prisma.identity.customerUser.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
    if (!cu) throw new NotFoundException('Portal user not found');

    return this.prisma.identity.customerUser.update({
      where: { id },
      data: { pageOverrides: dto.pageOverrides },
    });
  }

  async deactivatePortalUser(tenantId: string, id: string) {
    const cu = await this.prisma.identity.customerUser.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
    if (!cu) throw new NotFoundException('Portal user not found');

    await this.prisma.identity.customerUser.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    });
    return { deactivated: true };
  }

  async resetUserPassword(tenantId: string, id: string) {
    const cu = await this.prisma.identity.customerUser.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
    if (!cu) throw new NotFoundException('Portal user not found');

    const tempPassword = this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    await this.prisma.identity.customerUser.update({
      where: { id },
      data: { passwordHash, isFirstLogin: true, failedAttempts: 0, lockedUntil: null },
    });
    return { temporaryPassword: tempPassword };
  }

  // ── Password Reset (self-service) ─────────────────────────────────────────

  async requestPasswordReset(tenantId: string, dto: RequestPasswordResetDto) {
    const cu = await this.prisma.identity.customerUser.findFirst({
      where: { tenantId, email: dto.email, isDeleted: false, isActive: true },
    });
    // Don't reveal if email exists
    if (!cu) return { message: 'If the email exists, a reset link has been sent' };

    const token = this.generateToken(32);
    const exp = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await this.prisma.identity.customerUser.update({
      where: { id: cu.id },
      data: { passwordResetToken: token, passwordResetExp: exp },
    });

    // NOTE: actual email sending is handled by email service — return token for now
    return { message: 'Reset link sent', debug_token: token };
  }

  async resetPassword(tenantId: string, dto: ResetPasswordDto) {
    const cu = await this.prisma.identity.customerUser.findFirst({
      where: { tenantId, passwordResetToken: dto.token, isDeleted: false },
    });
    if (!cu) throw new BadRequestException('Invalid or expired reset token');
    if (!cu.passwordResetExp || cu.passwordResetExp < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.identity.customerUser.update({
      where: { id: cu.id },
      data: { passwordHash, passwordResetToken: null, passwordResetExp: null, isFirstLogin: false },
    });
    return { message: 'Password updated successfully' };
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  async getAnalytics(tenantId: string) {
    const [total, active, loginsToday, recentLogs] = await Promise.all([
      this.prisma.identity.customerUser.count({ where: { tenantId, isDeleted: false } }),
      this.prisma.identity.customerUser.count({ where: { tenantId, isDeleted: false, isActive: true } }),
      this.prisma.identity.customerPortalLog.count({
        where: {
          tenantId, action: 'LOGIN',
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      this.prisma.identity.customerPortalLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return { total, active, inactive: total - active, loginsToday, recentLogs };
  }

  // ── Default Category Seed ─────────────────────────────────────────────────

  async seedDefaultCategories(tenantId: string, createdById: string) {
    const defaults = [
      {
        name: 'Standard Portal',
        description: 'Access to orders, invoices, payments and support',
        icon: 'layout-dashboard',
        color: '#2563eb',
        enabledRoutes: ['dashboard', 'orders', 'invoices', 'payments', 'support', 'profile'],
        isDefault: true,
      },
      {
        name: 'Documents Only',
        description: 'Access to shared documents only',
        icon: 'folder',
        color: '#16a34a',
        enabledRoutes: ['documents', 'profile'],
        isDefault: false,
      },
    ];

    for (const d of defaults) {
      const existing = await this.prisma.identity.customerMenuCategory.findFirst({
        where: { tenantId, name: d.name },
      });
      if (!existing) {
        await this.prisma.identity.customerMenuCategory.create({
          data: { ...d, tenantId, createdById },
        });
      }
    }
    return { seeded: true };
  }

  // ── Self-service ──────────────────────────────────────────────────────────

  /** Returns the currently authenticated portal user's profile + available routes */
  async getMe(tenantId: string, userId: string) {
    const cu = await this.prisma.identity.customerUser.findFirst({
      where: { id: userId, tenantId, isDeleted: false },
      include: { menuCategory: true },
    });
    if (!cu) throw new NotFoundException('User not found');

    return {
      ...this.mapCustomerUser(cu),
      availableRoutes: this.resolveRoutes(
        cu.menuCategory?.enabledRoutes as string[] | null,
        cu.pageOverrides as Record<string, boolean> | null,
      ),
    };
  }

  /** Update portal user's own profile */
  async updateMe(tenantId: string, userId: string, data: { displayName?: string; phone?: string }) {
    const cu = await this.prisma.identity.customerUser.findFirst({
      where: { id: userId, tenantId, isDeleted: false },
    });
    if (!cu) throw new NotFoundException('User not found');

    const updated = await this.prisma.identity.customerUser.update({
      where: { id: userId },
      data: {
        ...(data.displayName && { displayName: data.displayName }),
      },
    });
    return this.mapCustomerUser(updated);
  }

  /** Change own password */
  async changeMyPassword(tenantId: string, userId: string, currentPassword: string, newPassword: string) {
    const cu = await this.prisma.identity.customerUser.findFirst({
      where: { id: userId, tenantId, isDeleted: false },
    });
    if (!cu) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(currentPassword, cu.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const newHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.identity.customerUser.update({
      where: { id: userId },
      data: { passwordHash: newHash, isFirstLogin: false },
    });
    return { message: 'Password changed successfully' };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private mapCustomerUser(cu: Record<string, unknown>) {
    const { passwordHash, refreshToken, passwordResetToken, ...safe } = cu;
    return safe;
  }

  private resolveRoutes(enabledRoutes: string[] | null, overrides: Record<string, boolean> | null) {
    const routes = enabledRoutes && enabledRoutes.length > 0 ? enabledRoutes : PORTAL_DEFAULT_ROUTES.map(r => r.key);
    return PORTAL_DEFAULT_ROUTES
      .filter(r => routes.includes(r.key))
      .filter(r => !overrides || overrides[r.key] !== false);
  }

  private generateTempPassword() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  private generateToken(len: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
}
