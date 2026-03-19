import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

/** All resource keys that can be tracked */
const RESOURCE_MODELS: Record<string, string> = {
  users: 'user',
  contacts: 'contact',
  leads: 'lead',
  products: 'product',
  organizations: 'organization',
  invoices: 'invoice',
  quotations: 'quotation',
  activities: 'activity',
  demos: 'demo',
  tour_plans: 'tourPlan',
  workflows: 'workflow',
  documents: 'document',
  tickets: 'ticket',
  installations: 'installation',
  trainings: 'training',
};

@Injectable()
export class UsageTrackerService {
  private readonly logger = new Logger(UsageTrackerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Full recalculation of ALL resource counts for a tenant.
   * Updates both legacy TenantUsage and new TenantUsageDetail tables.
   */
  async recalculate(tenantId: string) {
    const counts: Record<string, number> = {};

    // Count all resources in parallel
    const countPromises = Object.entries(RESOURCE_MODELS).map(
      async ([resourceKey, modelName]) => {
        try {
          const model = (this.prisma as any)[modelName];
          if (model && typeof model.count === 'function') {
            counts[resourceKey] = await model.count({ where: { tenantId } });
          } else {
            counts[resourceKey] = 0;
          }
        } catch {
          counts[resourceKey] = 0;
        }
      },
    );

    await Promise.all(countPromises);

    const currentMonth = new Date().toISOString().slice(0, 7);

    // Update legacy TenantUsage table
    await this.prisma.tenantUsage.upsert({
      where: { tenantId },
      update: {
        usersCount: counts.users ?? 0,
        contactsCount: counts.contacts ?? 0,
        leadsCount: counts.leads ?? 0,
        productsCount: counts.products ?? 0,
        lastCalculated: new Date(),
      },
      create: {
        tenantId,
        usersCount: counts.users ?? 0,
        contactsCount: counts.contacts ?? 0,
        leadsCount: counts.leads ?? 0,
        productsCount: counts.products ?? 0,
        lastCalculated: new Date(),
      },
    });

    // Update TenantUsageDetail table for all resources
    const detailUpserts = Object.entries(counts).map(([resourceKey, currentCount]) =>
      this.prisma.tenantUsageDetail.upsert({
        where: { tenantId_resourceKey: { tenantId, resourceKey } },
        update: {
          currentCount,
          lastUpdated: new Date(),
        },
        create: {
          tenantId,
          resourceKey,
          currentCount,
          monthlyCount: 0,
          monthYear: currentMonth,
          lastUpdated: new Date(),
        },
      }),
    );

    await Promise.all(detailUpserts);

    this.logger.log(
      `Usage recalculated for tenant ${tenantId}: ${Object.entries(counts)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ')}`,
    );
  }

  /**
   * Increment usage counter when a new entity is created.
   * Updates both currentCount and monthlyCount.
   */
  async incrementUsage(tenantId: string, resourceKey: string) {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const existing = await this.prisma.tenantUsageDetail.findUnique({
      where: { tenantId_resourceKey: { tenantId, resourceKey } },
    });

    if (existing) {
      const monthlyCount = existing.monthYear === currentMonth
        ? existing.monthlyCount + 1
        : 1; // Reset if new month

      await this.prisma.tenantUsageDetail.update({
        where: { tenantId_resourceKey: { tenantId, resourceKey } },
        data: {
          currentCount: { increment: 1 },
          monthlyCount,
          monthYear: currentMonth,
          lastUpdated: new Date(),
        },
      });
    } else {
      await this.prisma.tenantUsageDetail.create({
        data: {
          tenantId,
          resourceKey,
          currentCount: 1,
          monthlyCount: 1,
          monthYear: currentMonth,
          lastUpdated: new Date(),
        },
      });
    }

    // Also update legacy TenantUsage for basic resources
    const legacyField = this.getLegacyField(resourceKey);
    if (legacyField) {
      await this.prisma.tenantUsage.updateMany({
        where: { tenantId },
        data: { [legacyField]: { increment: 1 } },
      });
    }
  }

  /**
   * Decrement usage counter when an entity is deleted.
   */
  async decrementUsage(tenantId: string, resourceKey: string) {
    const existing = await this.prisma.tenantUsageDetail.findUnique({
      where: { tenantId_resourceKey: { tenantId, resourceKey } },
    });

    if (existing && existing.currentCount > 0) {
      await this.prisma.tenantUsageDetail.update({
        where: { tenantId_resourceKey: { tenantId, resourceKey } },
        data: {
          currentCount: { decrement: 1 },
          lastUpdated: new Date(),
        },
      });
    }

    const legacyField = this.getLegacyField(resourceKey);
    if (legacyField) {
      await this.prisma.tenantUsage.updateMany({
        where: { tenantId },
        data: { [legacyField]: { decrement: 1 } },
      });
    }
  }

  /**
   * Get all usage details for a tenant.
   */
  async getUsageDetails(tenantId: string) {
    return this.prisma.tenantUsageDetail.findMany({
      where: { tenantId },
      orderBy: { resourceKey: 'asc' },
    });
  }

  /**
   * Reset monthly counts (should be called by cron at month start).
   */
  async resetMonthlyCounts(tenantId?: string) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const where = tenantId
      ? { tenantId, monthYear: { not: currentMonth } }
      : { monthYear: { not: currentMonth } };

    await this.prisma.tenantUsageDetail.updateMany({
      where,
      data: { monthlyCount: 0, monthYear: currentMonth },
    });
  }

  private getLegacyField(resourceKey: string): string | null {
    const map: Record<string, string> = {
      users: 'usersCount',
      contacts: 'contactsCount',
      leads: 'leadsCount',
      products: 'productsCount',
    };
    return map[resourceKey] ?? null;
  }
}
