// @ts-nocheck
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@Injectable()
export class LicenseService {
  private readonly logger = new Logger(LicenseService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a license key in CRM-XXXX-XXXX-XXXX-XXXX format.
   * Each group is 4 alphanumeric characters (uppercase + digits).
   */
  generateKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const group = () =>
      Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `CRM-${group()}-${group()}-${group()}-${group()}`;
  }

  /**
   * Generate a new license key for a tenant.
   */
  async generate(data: {
    tenantId: string;
    planId: string;
    maxUsers?: number;
    expiresAt?: Date;
    allowedModules?: Record<string, unknown>;
    notes?: string;
  }) {
    // Verify tenant exists
    const tenant = await this.prisma.identity.tenant.findUnique({ where: { id: data.tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant ${data.tenantId} not found`);
    }

    // Verify plan exists
    const plan = await this.prisma.identity.plan.findUnique({ where: { id: data.planId } });
    if (!plan) {
      throw new NotFoundException(`Plan ${data.planId} not found`);
    }

    const licenseKey = this.generateKey();

    const license = await this.prisma.platform.licenseKey.create({
      data: {
        tenantId: data.tenantId,
        licenseKey,
        planId: data.planId,
        status: 'LIC_ACTIVE',
        activatedAt: new Date(),
        expiresAt: data.expiresAt ?? null,
        maxUsers: data.maxUsers ?? 5,
        allowedModules: data.allowedModules ?? null,
        notes: data.notes ?? null,
      },
    });

    this.logger.log(`License generated: ${licenseKey} for tenant ${data.tenantId}`);
    return license;
  }

  /**
   * Validate a license key. Checks status and expiry, updates lastValidatedAt.
   */
  async validate(key: string): Promise<{ valid: boolean; license?: Record<string, unknown>; reason?: string }> {
    const license = await this.prisma.platform.licenseKey.findUnique({
      where: { licenseKey: key },
      include: {
        tenant: { select: { id: true, name: true, status: true } },
      },
    });

    if (!license) {
      return { valid: false, reason: 'License key not found' };
    }

    if (license.status !== 'LIC_ACTIVE') {
      return { valid: false, license, reason: `License status is ${license.status}` };
    }

    if (license.expiresAt && license.expiresAt < new Date()) {
      // Auto-expire
      await this.prisma.platform.licenseKey.update({
        where: { id: license.id },
        data: { status: 'LIC_EXPIRED' },
      });
      return { valid: false, license, reason: 'License has expired' };
    }

    // Update last validated timestamp
    await this.prisma.platform.licenseKey.update({
      where: { id: license.id },
      data: { lastValidatedAt: new Date() },
    });

    return { valid: true, license };
  }

  /**
   * Revoke a license key.
   */
  async revoke(id: string) {
    const license = await this.prisma.platform.licenseKey.findUnique({ where: { id } });
    if (!license) {
      throw new NotFoundException(`License ${id} not found`);
    }

    return this.prisma.platform.licenseKey.update({
      where: { id },
      data: { status: 'LIC_REVOKED' },
    });
  }

  /**
   * Suspend a license key.
   */
  async suspend(id: string) {
    const license = await this.prisma.platform.licenseKey.findUnique({ where: { id } });
    if (!license) {
      throw new NotFoundException(`License ${id} not found`);
    }

    return this.prisma.platform.licenseKey.update({
      where: { id },
      data: { status: 'LIC_SUSPENDED' },
    });
  }

  /**
   * Re-activate a license key.
   */
  async activate(id: string) {
    const license = await this.prisma.platform.licenseKey.findUnique({ where: { id } });
    if (!license) {
      throw new NotFoundException(`License ${id} not found`);
    }

    return this.prisma.platform.licenseKey.update({
      where: { id },
      data: { status: 'LIC_ACTIVE', activatedAt: new Date() },
    });
  }

  /**
   * Get all license keys for a tenant, ordered by creation date descending.
   */
  async getByTenant(tenantId: string) {
    return this.prisma.platform.licenseKey.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single license key by ID.
   */
  async getById(id: string) {
    const license = await this.prisma.platform.licenseKey.findUnique({
      where: { id },
      include: {
        tenant: { select: { id: true, name: true, slug: true, status: true } },
      },
    });

    if (!license) {
      throw new NotFoundException(`License ${id} not found`);
    }

    return license;
  }

  /**
   * Paginated list of all license keys with search/filter support.
   */
  async listAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    // Map frontend-friendly status values to Prisma enum
    const STATUS_MAP: Record<string, string> = {
      ACTIVE: 'LIC_ACTIVE',
      EXPIRED: 'LIC_EXPIRED',
      REVOKED: 'LIC_REVOKED',
      SUSPENDED: 'LIC_SUSPENDED',
    };

    const where: any = {};

    if (query.status) {
      where.status = STATUS_MAP[query.status] ?? query.status;
    }

    if (query.search) {
      where.OR = [
        { licenseKey: { contains: query.search, mode: 'insensitive' } },
        { tenant: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.platform.licenseKey.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.platform.licenseKey.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Check for expired licenses and update their status (for cron job).
   * Finds all LIC_ACTIVE licenses where expiresAt is in the past.
   */
  async checkExpiry() {
    const now = new Date();

    const expiredLicenses = await this.prisma.platform.licenseKey.findMany({
      where: {
        status: 'LIC_ACTIVE',
        expiresAt: { lt: now },
      },
    });

    if (expiredLicenses.length === 0) {
      return { expired: 0 };
    }

    const result = await this.prisma.platform.licenseKey.updateMany({
      where: {
        status: 'LIC_ACTIVE',
        expiresAt: { lt: now },
      },
      data: { status: 'LIC_EXPIRED' },
    });

    this.logger.log(`License expiry check: ${result.count} licenses expired`);
    return { expired: result.count };
  }
}
