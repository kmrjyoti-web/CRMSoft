// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class CrossDbResolverService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveUsers<T extends Record<string, any>>(
    records: T[],
    fkFields: string[],
    userSelect?: Record<string, boolean>,
  ): Promise<T[]> {
    if (!records.length || !fkFields.length) return records;

    const allUserIds = new Set<string>();
    for (const record of records) {
      for (const fk of fkFields) {
        const val = record[fk];
        if (val) allUserIds.add(val);
      }
    }
    if (allUserIds.size === 0) return records;

    const users = await this.prisma.identity.user.findMany({
      where: { id: { in: Array.from(allUserIds) } },
      select: userSelect ?? { id: true, firstName: true, lastName: true, email: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return records.map((record) => {
      const merged = { ...record };
      for (const fk of fkFields) {
        const relationName = fk.replace(/Id$/, '');
        merged[relationName] = record[fk] ? userMap.get(record[fk]) ?? null : null;
      }
      return merged;
    });
  }

  async resolveUser(
    userId: string | null | undefined,
  ): Promise<{ id: string; email: string; firstName: string; lastName: string } | null> {
    if (!userId) return null;
    return this.prisma.identity.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
  }

  async resolveRoles<T extends Record<string, any>>(
    records: T[],
    fkField = 'roleId',
    roleSelect?: Record<string, boolean>,
  ): Promise<T[]> {
    if (!records.length) return records;

    const roleIds = [...new Set(records.map((r) => r[fkField]).filter(Boolean))];
    if (roleIds.length === 0) return records;

    const roles = await this.prisma.identity.role.findMany({
      where: { id: { in: roleIds } },
      select: roleSelect ?? { id: true, name: true, displayName: true },
    });
    const roleMap = new Map(roles.map((r) => [r.id, r]));
    const relationName = fkField.replace(/Id$/, '');

    return records.map((record) => ({
      ...record,
      [relationName]: record[fkField] ? roleMap.get(record[fkField]) ?? null : null,
    }));
  }

  async resolveLookupValues<T extends Record<string, any>>(
    records: T[],
    fkField = 'lookupValueId',
    includeCategory = false,
  ): Promise<T[]> {
    if (!records.length) return records;

    const lookupIds = [...new Set(records.map((r) => r[fkField]).filter(Boolean))];
    if (lookupIds.length === 0) return records;

    const lookups = await this.prisma.platform.lookupValue.findMany({
      where: { id: { in: lookupIds } },
      select: {
        id: true,
        value: true,
        label: true,
        ...(includeCategory ? { lookup: { select: { category: true } } } : {}),
      },
    });
    const lookupMap = new Map(lookups.map((l) => [l.id, l]));
    const relationName = fkField.replace(/Id$/, '');

    return records.map((record) => ({
      ...record,
      [relationName]: record[fkField] ? lookupMap.get(record[fkField]) ?? null : null,
    }));
  }

  // ─── GlobalReferenceDB resolvers ─────────────────────────────────

  async resolveCountries(ids: string[]): Promise<any[]> {
    if (!ids.length) return [];
    return this.prisma.globalReference.glCfgCountry.findMany({
      where: { id: { in: ids } },
    });
  }

  async resolveCountry(id: string | null | undefined): Promise<any | null> {
    if (!id) return null;
    return this.prisma.globalReference.glCfgCountry.findUnique({ where: { id } });
  }

  async resolveStates(ids: string[]): Promise<any[]> {
    if (!ids.length) return [];
    return this.prisma.globalReference.glCfgState.findMany({
      where: { id: { in: ids } },
    });
  }

  async resolveState(id: string | null | undefined): Promise<any | null> {
    if (!id) return null;
    return this.prisma.globalReference.glCfgState.findUnique({ where: { id } });
  }

  async resolveCities(ids: string[]): Promise<any[]> {
    if (!ids.length) return [];
    return this.prisma.globalReference.glCfgCity.findMany({
      where: { id: { in: ids } },
    });
  }

  async resolveCity(id: string | null | undefined): Promise<any | null> {
    if (!id) return null;
    return this.prisma.globalReference.glCfgCity.findUnique({ where: { id } });
  }

  async resolveGlobalLookupValues(ids: string[]): Promise<any[]> {
    if (!ids.length) return [];
    return this.prisma.globalReference.glCfgLookupValue.findMany({
      where: { id: { in: ids } },
    });
  }

  async resolveGlobalLookupValuesByType(typeCode: string): Promise<any[]> {
    return this.prisma.globalReference.glCfgLookupValue.findMany({
      where: {
        lookupType: { code: typeCode },
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // ─── Sprint B.2 — Indian reference resolvers ──────────────────────────────

  async resolvePincodes(pincodes: string[]): Promise<any[]> {
    if (!pincodes.length) return [];
    return this.prisma.globalReference.glCfgPincode.findMany({
      where: { pincode: { in: pincodes }, isActive: true },
    });
  }

  async resolvePincode(pincode: string | null | undefined): Promise<any | null> {
    if (!pincode) return null;
    return this.prisma.globalReference.glCfgPincode.findUnique({
      where: { pincode },
    });
  }

  async resolveGstRates(ids: string[]): Promise<any[]> {
    if (!ids.length) return [];
    return this.prisma.globalReference.glCfgGstRate.findMany({
      where: { id: { in: ids } },
    });
  }

  async resolveGstRate(id: string | null | undefined): Promise<any | null> {
    if (!id) return null;
    return this.prisma.globalReference.glCfgGstRate.findUnique({ where: { id } });
  }

  async resolveAllGstRates(): Promise<any[]> {
    return this.prisma.globalReference.glCfgGstRate.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async resolveHsnCode(code: string | null | undefined): Promise<any | null> {
    if (!code) return null;
    return this.prisma.globalReference.glCfgHsnCode.findUnique({ where: { code } });
  }

  async resolveHsnCodes(codes: string[]): Promise<any[]> {
    if (!codes.length) return [];
    return this.prisma.globalReference.glCfgHsnCode.findMany({
      where: { code: { in: codes }, isActive: true },
      include: { defaultGstRate: true },
    });
  }

  // ─── Sprint B.2 — System reference resolvers ─────────────────────────────

  async resolveCurrency(code: string | null | undefined): Promise<any | null> {
    if (!code) return null;
    return this.prisma.globalReference.glCfgCurrency.findUnique({ where: { code } });
  }

  async resolveAllCurrencies(): Promise<any[]> {
    return this.prisma.globalReference.glCfgCurrency.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async resolveDefaultCurrency(): Promise<any | null> {
    return this.prisma.globalReference.glCfgCurrency.findFirst({
      where: { isDefault: true },
    });
  }

  async resolveTimezone(tzIdentifier: string | null | undefined): Promise<any | null> {
    if (!tzIdentifier) return null;
    return this.prisma.globalReference.glCfgTimezone.findUnique({ where: { tzIdentifier } });
  }

  async resolveAllTimezones(): Promise<any[]> {
    return this.prisma.globalReference.glCfgTimezone.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async resolveDefaultTimezone(): Promise<any | null> {
    return this.prisma.globalReference.glCfgTimezone.findFirst({
      where: { isDefault: true },
    });
  }

  async resolveIndustryType(code: string | null | undefined): Promise<any | null> {
    if (!code) return null;
    return this.prisma.globalReference.glCfgIndustryType.findUnique({ where: { code } });
  }

  async resolveAllIndustryTypes(): Promise<any[]> {
    return this.prisma.globalReference.glCfgIndustryType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async resolveLanguage(code: string | null | undefined): Promise<any | null> {
    if (!code) return null;
    return this.prisma.globalReference.glCfgLanguage.findUnique({ where: { code } });
  }

  async resolveAllLanguages(indianOnly = false): Promise<any[]> {
    return this.prisma.globalReference.glCfgLanguage.findMany({
      where: { isActive: true, ...(indianOnly ? { isIndian: true } : {}) },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async resolveDefaultLanguage(): Promise<any | null> {
    return this.prisma.globalReference.glCfgLanguage.findFirst({
      where: { isDefault: true },
    });
  }

  // Backward-compat: resolve companyId → tenantId for TenantGuard resolution chain.
  // Company model does not carry a tenantId field yet (roadmap post-WAR#18).
  // Returns null until Company → Tenant mapping is established.
  async resolveCompanyToTenant(
    companyId: string,
  ): Promise<{ companyId: string; tenantId: string } | null> {
    return null;
  }
}
