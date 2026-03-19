// @ts-nocheck
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class TerminologyService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all terminology overrides for a tenant.
   * Resolution chain: BusinessType terminologyMap → tenant overrides (wins).
   */
  async getResolved(tenantId: string): Promise<Record<string, string>> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { businessType: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    // Start with business type defaults
    const result: Record<string, string> = tenant.businessType
      ? { ...(tenant.businessType.terminologyMap as Record<string, string>) }
      : {};

    // Overlay tenant-specific overrides
    const overrides = await this.prisma.terminologyOverride.findMany({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    for (const ov of overrides) {
      result[ov.termKey] = ov.customLabel;
    }

    return result;
  }

  /** List raw override records for a tenant. */
  async list(tenantId: string) {
    return this.prisma.terminologyOverride.findMany({
      where: { tenantId },
      orderBy: { termKey: 'asc' },
    });
  }

  /** Upsert a single terminology override. */
  async upsert(
    tenantId: string,
    data: {
      termKey: string;
      defaultLabel: string;
      customLabel: string;
      scope?: string;
      regionalLabel?: string;
      userHelpText?: string;
    },
  ) {
    const scope = data.scope ?? 'GLOBAL';
    return this.prisma.terminologyOverride.upsert({
      where: {
        tenantId_termKey_scope: { tenantId, termKey: data.termKey, scope },
      },
      update: {
        customLabel: data.customLabel,
        defaultLabel: data.defaultLabel,
        regionalLabel: data.regionalLabel ?? null,
        userHelpText: data.userHelpText ?? null,
      },
      create: {
        tenantId,
        termKey: data.termKey,
        defaultLabel: data.defaultLabel,
        customLabel: data.customLabel,
        scope,
        regionalLabel: data.regionalLabel ?? null,
        userHelpText: data.userHelpText ?? null,
      },
    });
  }

  /** Bulk upsert terminology overrides. */
  async bulkUpsert(
    tenantId: string,
    items: Array<{
      termKey: string;
      defaultLabel: string;
      customLabel: string;
      scope?: string;
    }>,
  ) {
    return Promise.all(items.map((item) => this.upsert(tenantId, item)));
  }

  /** Delete an override (reverts to business type default). */
  async remove(tenantId: string, termKey: string, scope = 'GLOBAL') {
    return this.prisma.terminologyOverride.delete({
      where: {
        tenantId_termKey_scope: { tenantId, termKey, scope },
      },
    });
  }
}
