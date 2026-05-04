/**
 * VendorServiceMonolith
 *
 * Monolith implementation of IVendorService.
 * Reads from PlatformDB (prisma.platform.*) directly.
 *
 * When extracting Vendor as a microservice, replace this class with an
 * HTTP or gRPC client implementation that calls the Vendor service API.
 * The calling code (Work/Identity service) will not change — only this class swaps out.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import {
  IVendorService,
  VendorLookupValue,
  VendorPackage,
  VendorIndustryType,
} from '../interfaces/vendor-service.interface';

@Injectable()
export class VendorServiceMonolith implements IVendorService {
  constructor(private readonly prisma: PrismaService) {}

  async getLookupValues(category: string): Promise<VendorLookupValue[]> {
    const master = await this.prisma.platform.masterLookup.findFirst({
      where: { category: category.toUpperCase() },
    });

    if (!master) return [];

    const values = await this.prisma.platform.lookupValue.findMany({
      where: { lookupId: master.id, isActive: true },
      orderBy: { rowIndex: 'asc' },
      select: { value: true, label: true, rowIndex: true },
    });

    return values.map((v) => ({
      code: v.value,
      label: v.label,
      sortOrder: v.rowIndex ?? undefined,
    }));
  }

  async getPackageByTenantId(tenantId: string): Promise<VendorPackage | null> {
    // In the current schema, Package has its own tenantId linking it to a tenant.
    // We fetch the active package for this tenant.
    const pkg = await this.prisma.platform.package.findFirst({
      where: { tenantId, isActive: true },
      select: { id: true, name: true },
    });

    if (!pkg) return null;

    // Fetch module codes via module-manager
    const modules = await this.prisma.platform.moduleDefinition
      .findMany({ where: { isActive: true }, select: { code: true } })
      .catch(() => []);

    return {
      id: pkg.id,
      name: pkg.name,
      modules: modules.map((m) => m.code),
    };
  }

  async getModulesByPackageId(packageId: string): Promise<Array<{ id: string; code: string; name: string }>> {
    // Module definitions are global (not per-package in the current schema).
    // This will need to be refined when package–module linking is implemented.
    const defs = await this.prisma.platform.moduleDefinition
      .findMany({ where: { isActive: true }, select: { id: true, code: true, name: true } })
      .catch(() => []);

    return defs.map((d) => ({ id: d.id, code: d.code, name: d.name }));
  }

  async getIndustryType(code: string): Promise<VendorIndustryType | null> {
    const bt = await this.prisma.platform.businessTypeRegistry.findFirst({
      where: { typeCode: code, isActive: true },
      select: { id: true, typeCode: true, typeName: true },
    });

    if (!bt) return null;
    return { id: bt.id, code: bt.typeCode, name: bt.typeName, config: {} };
  }
}
