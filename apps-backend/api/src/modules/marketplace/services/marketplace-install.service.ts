import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AppError } from '../../../common/errors/app-error';

@Injectable()
export class MarketplaceInstallService {
  private readonly logger = new Logger(MarketplaceInstallService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Install a module for a tenant (TRIAL status, 14-day trial by default).
   */
  async install(tenantId: string, moduleId: string) {
    // Verify module exists and is published
    const mod = await this.prisma.platform.marketplaceModule.findUnique({
      where: { id: moduleId },
    });
    if (!mod) {
      throw AppError.from('NOT_FOUND').withDetails({ entity: 'Module' });
    }
    if (mod.status !== 'PUBLISHED') {
      throw AppError.from('VALIDATION_ERROR').withDetails({
        module: 'Module is not available for installation',
      });
    }

    // Check if already installed
    const existing = await this.prisma.platform.tenantMarketplaceModule.findUnique({
      where: { tenantId_moduleId: { tenantId, moduleId } },
    });
    if (existing && existing.status !== 'CANCELLED') {
      throw AppError.from('VALIDATION_ERROR').withDetails({
        module: 'Module is already installed for this tenant',
      });
    }

    // Calculate trial end date (14 days or launchOfferDays if available)
    const trialDays = mod.launchOfferDays ?? 14;
    const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

    // Upsert in case of re-install after cancellation
    const installation = await this.prisma.platform.tenantMarketplaceModule.upsert({
      where: { tenantId_moduleId: { tenantId, moduleId } },
      update: {
        status: 'TRIAL',
        trialEndsAt,
        subscriptionId: null,
        planId: null,
        installedAt: new Date(),
      },
      create: {
        tenantId,
        moduleId,
        status: 'TRIAL',
        trialEndsAt,
      },
    });

    // Increment install count on the module
    await this.prisma.platform.marketplaceModule.update({
      where: { id: moduleId },
      data: { installCount: { increment: 1 } },
    });

    return installation;
  }

  /**
   * Activate a module subscription (TRIAL -> ACTIVE).
   */
  async activate(tenantId: string, moduleId: string, subscriptionId?: string, planId?: string) {
    const installation = await this.prisma.platform.tenantMarketplaceModule.findUnique({
      where: { tenantId_moduleId: { tenantId, moduleId } },
    });
    if (!installation) {
      throw AppError.from('NOT_FOUND').withDetails({
        entity: 'Installation',
      });
    }
    if (installation.status === 'ACTIVE') {
      throw AppError.from('VALIDATION_ERROR').withDetails({
        status: 'Module is already active',
      });
    }
    if (installation.status === 'CANCELLED') {
      throw AppError.from('VALIDATION_ERROR').withDetails({
        status: 'Cannot activate a cancelled installation. Please re-install first.',
      });
    }

    return this.prisma.platform.tenantMarketplaceModule.update({
      where: { tenantId_moduleId: { tenantId, moduleId } },
      data: {
        status: 'ACTIVE',
        subscriptionId: subscriptionId ?? null,
        planId: planId ?? null,
        trialEndsAt: null,
      },
    });
  }

  /**
   * Cancel/uninstall a module for a tenant.
   */
  async cancel(tenantId: string, moduleId: string) {
    const installation = await this.prisma.platform.tenantMarketplaceModule.findUnique({
      where: { tenantId_moduleId: { tenantId, moduleId } },
    });
    if (!installation) {
      throw AppError.from('NOT_FOUND').withDetails({
        entity: 'Installation',
      });
    }
    if (installation.status === 'CANCELLED') {
      throw AppError.from('VALIDATION_ERROR').withDetails({
        status: 'Module is already cancelled',
      });
    }

    return this.prisma.platform.tenantMarketplaceModule.update({
      where: { tenantId_moduleId: { tenantId, moduleId } },
      data: { status: 'CANCELLED' },
    });
  }

  /**
   * List all installed modules for a tenant.
   */
  async listInstalled(tenantId: string) {
    return this.prisma.platform.tenantMarketplaceModule.findMany({
      where: { tenantId },
      include: {
        module: {
          include: {
            vendor: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: { installedAt: 'desc' },
    });
  }

  /**
   * Check if a module is installed and active for a tenant.
   */
  async checkInstalled(tenantId: string, moduleCode: string): Promise<boolean> {
    const installation = await this.prisma.platform.tenantMarketplaceModule.findFirst({
      where: {
        tenantId,
        module: { moduleCode },
        status: { in: ['TRIAL', 'ACTIVE'] },
      },
    });
    return !!installation;
  }
}
