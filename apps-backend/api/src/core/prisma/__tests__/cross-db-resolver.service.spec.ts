import { CrossDbResolverService } from '../cross-db-resolver.service';

// ─── Prisma mock factory ──────────────────────────────────────────────────────

function makePrisma(overrides: Record<string, any> = {}) {
  return {
    identity: {
      user: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      role: { findMany: jest.fn().mockResolvedValue([]) },
    },
    platform: {
      lookupValue: { findMany: jest.fn().mockResolvedValue([]) },
    },
    globalReference: {
      glCfgCountry: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null) },
      glCfgState: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null) },
      glCfgCity: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null) },
      glCfgLookupValue: { findMany: jest.fn().mockResolvedValue([]) },
      glCfgPincode: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null) },
      glCfgGstRate: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null) },
      glCfgHsnCode: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null) },
      glCfgCurrency: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null), findFirst: jest.fn().mockResolvedValue(null) },
      glCfgTimezone: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null), findFirst: jest.fn().mockResolvedValue(null) },
      glCfgIndustryType: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null) },
      glCfgLanguage: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn().mockResolvedValue(null) },
    },
    ...overrides,
  };
}

function makeService(prismaOverrides?: any) {
  const prisma = makePrisma(prismaOverrides);
  return { service: new CrossDbResolverService(prisma as any), prisma };
}

// ─── resolveUsers ─────────────────────────────────────────────────────────────

describe('CrossDbResolverService — resolveUsers()', () => {
  const mockUsers = [
    { id: 'u-1', firstName: 'Raj', lastName: 'Patel', email: 'raj@crm.com' },
    { id: 'u-2', firstName: 'Priya', lastName: 'Shah', email: 'priya@crm.com' },
  ];

  it('should attach resolved users under relation name (strip Id suffix)', async () => {
    const prisma = makePrisma();
    prisma.identity.user.findMany.mockResolvedValue(mockUsers);
    const service = new CrossDbResolverService(prisma as any);

    const records: any[] = [
      { id: 'r-1', createdById: 'u-1', updatedById: 'u-2' },
    ];
    const result = await service.resolveUsers(records, ['createdById', 'updatedById']);

    expect(result[0].createdBy).toEqual(mockUsers[0]);
    expect(result[0].updatedBy).toEqual(mockUsers[1]);
    expect(prisma.identity.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: expect.arrayContaining(['u-1', 'u-2']) } } }),
    );
  });

  it('should return records unchanged when input array is empty', async () => {
    const { service, prisma } = makeService();
    const result = await service.resolveUsers([], ['createdById']);
    expect(result).toEqual([]);
    expect(prisma.identity.user.findMany).not.toHaveBeenCalled();
  });

  it('should return records unchanged when fkFields is empty', async () => {
    const { service, prisma } = makeService();
    const records: any[] = [{ id: 'r-1', name: 'Test' }];
    const result = await service.resolveUsers(records, []);
    expect(result).toEqual(records);
    expect(prisma.identity.user.findMany).not.toHaveBeenCalled();
  });

  it('should return records unchanged (no relation added) when all FK values are null', async () => {
    const { service, prisma } = makeService();
    const records: any[] = [{ id: 'r-1', createdById: null }];
    const result = await service.resolveUsers(records, ['createdById']);
    // allUserIds is empty → returns records as-is; no createdBy property added
    expect(result[0]).not.toHaveProperty('createdBy');
    expect(prisma.identity.user.findMany).not.toHaveBeenCalled();
  });

  it('should set relation to null when user not found in DB', async () => {
    const { service } = makeService();
    const records: any[] = [{ id: 'r-1', createdById: 'u-ghost' }];
    const result = await service.resolveUsers(records, ['createdById']);
    // identity.user.findMany returns [] → userMap is empty → null for unknown ID
    expect(result[0].createdBy).toBeNull();
  });

  it('should deduplicate user IDs in batch query', async () => {
    const prisma = makePrisma();
    prisma.identity.user.findMany.mockResolvedValue([mockUsers[0]]);
    const service = new CrossDbResolverService(prisma as any);

    // Both records reference the same user
    const records: any[] = [
      { id: 'r-1', createdById: 'u-1' },
      { id: 'r-2', createdById: 'u-1' },
    ];
    await service.resolveUsers(records, ['createdById']);
    const calledIds = prisma.identity.user.findMany.mock.calls[0][0].where.id.in;
    expect(calledIds).toHaveLength(1);
    expect(calledIds).toContain('u-1');
  });
});

// ─── resolveUser (single) ─────────────────────────────────────────────────────

describe('CrossDbResolverService — resolveUser()', () => {
  it('should return user when found', async () => {
    const mockUser = { id: 'u-1', firstName: 'Raj', lastName: 'Patel', email: 'raj@crm.com' };
    const prisma = makePrisma();
    prisma.identity.user.findUnique.mockResolvedValue(mockUser);
    const service = new CrossDbResolverService(prisma as any);
    const result = await service.resolveUser('u-1');
    expect(result).toEqual(mockUser);
  });

  it('should return null when userId is null', async () => {
    const { service, prisma } = makeService();
    const result = await service.resolveUser(null);
    expect(result).toBeNull();
    expect(prisma.identity.user.findUnique).not.toHaveBeenCalled();
  });

  it('should return null when userId is undefined', async () => {
    const { service } = makeService();
    expect(await service.resolveUser(undefined)).toBeNull();
  });
});

// ─── resolveRoles ─────────────────────────────────────────────────────────────

describe('CrossDbResolverService — resolveRoles()', () => {
  it('should attach resolved roles under "role" relation', async () => {
    const mockRoles = [{ id: 'r-1', name: 'ADMIN', displayName: 'Admin' }];
    const prisma = makePrisma();
    prisma.identity.role.findMany.mockResolvedValue(mockRoles);
    const service = new CrossDbResolverService(prisma as any);

    const records: any[] = [{ id: 'u-1', roleId: 'r-1' }];
    const result = await service.resolveRoles(records);
    expect(result[0].role).toEqual(mockRoles[0]);
  });

  it('should return records unchanged when array is empty', async () => {
    const { service, prisma } = makeService();
    const result = await service.resolveRoles([]);
    expect(result).toEqual([]);
    expect(prisma.identity.role.findMany).not.toHaveBeenCalled();
  });

  it('should return records unchanged (no relation added) when all roleIds are null', async () => {
    const { service, prisma } = makeService();
    const records: any[] = [{ id: 'u-1', roleId: null }];
    const result = await service.resolveRoles(records);
    // filter(Boolean) removes null → roleIds empty → returns records as-is
    expect(result[0]).not.toHaveProperty('role');
    expect(prisma.identity.role.findMany).not.toHaveBeenCalled();
  });
});

// ─── resolveLookupValues ──────────────────────────────────────────────────────

describe('CrossDbResolverService — resolveLookupValues()', () => {
  it('should attach resolved lookup values', async () => {
    const mockLookup = { id: 'lv-1', value: 'COLD', label: 'Cold' };
    const prisma = makePrisma();
    prisma.platform.lookupValue.findMany.mockResolvedValue([mockLookup]);
    const service = new CrossDbResolverService(prisma as any);

    const records: any[] = [{ id: 'lead-1', lookupValueId: 'lv-1' }];
    const result = await service.resolveLookupValues(records);
    expect(result[0].lookupValue).toEqual(mockLookup);
  });

  it('should return empty array unchanged', async () => {
    const { service, prisma } = makeService();
    const result = await service.resolveLookupValues([]);
    expect(result).toEqual([]);
    expect(prisma.platform.lookupValue.findMany).not.toHaveBeenCalled();
  });
});

// ─── GlobalReference resolvers ────────────────────────────────────────────────

describe('CrossDbResolverService — GlobalReference resolvers', () => {
  it('resolveCountries() → returns empty array for empty input', async () => {
    const { service, prisma } = makeService();
    const result = await service.resolveCountries([]);
    expect(result).toEqual([]);
    expect(prisma.globalReference.glCfgCountry.findMany).not.toHaveBeenCalled();
  });

  it('resolveCountries() → queries by IDs', async () => {
    const prisma = makePrisma();
    prisma.globalReference.glCfgCountry.findMany.mockResolvedValue([{ id: 'c-1', name: 'India' }]);
    const service = new CrossDbResolverService(prisma as any);
    const result = await service.resolveCountries(['c-1']);
    expect(result[0].name).toBe('India');
  });

  it('resolveCountry() → returns null for null input', async () => {
    const { service, prisma } = makeService();
    const result = await service.resolveCountry(null);
    expect(result).toBeNull();
    expect(prisma.globalReference.glCfgCountry.findUnique).not.toHaveBeenCalled();
  });

  it('resolveStates() → returns empty array for empty input', async () => {
    const { service, prisma } = makeService();
    const result = await service.resolveStates([]);
    expect(result).toEqual([]);
    expect(prisma.globalReference.glCfgState.findMany).not.toHaveBeenCalled();
  });

  it('resolveCities() → returns empty array for empty input', async () => {
    const { service, prisma } = makeService();
    const result = await service.resolveCities([]);
    expect(result).toEqual([]);
    expect(prisma.globalReference.glCfgCity.findMany).not.toHaveBeenCalled();
  });

  it('resolveGlobalLookupValuesByType() → queries with typeCode + isActive', async () => {
    const prisma = makePrisma();
    prisma.globalReference.glCfgLookupValue.findMany.mockResolvedValue([{ id: 'lv-1', value: 'HOT' }]);
    const service = new CrossDbResolverService(prisma as any);
    const result = await service.resolveGlobalLookupValuesByType('LEAD_TEMPERATURE');
    expect(result[0].value).toBe('HOT');
    expect(prisma.globalReference.glCfgLookupValue.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
      }),
    );
  });
});

// ─── Indian reference resolvers ───────────────────────────────────────────────

describe('CrossDbResolverService — Indian reference resolvers', () => {
  it('resolvePincodes() → returns empty for empty input', async () => {
    const { service, prisma } = makeService();
    const result = await service.resolvePincodes([]);
    expect(result).toEqual([]);
    expect(prisma.globalReference.glCfgPincode.findMany).not.toHaveBeenCalled();
  });

  it('resolvePincode() → returns null for null input', async () => {
    const { service, prisma } = makeService();
    const result = await service.resolvePincode(null);
    expect(result).toBeNull();
    expect(prisma.globalReference.glCfgPincode.findUnique).not.toHaveBeenCalled();
  });

  it('resolveGstRates() → returns empty for empty input', async () => {
    const { service, prisma } = makeService();
    const result = await service.resolveGstRates([]);
    expect(result).toEqual([]);
    expect(prisma.globalReference.glCfgGstRate.findMany).not.toHaveBeenCalled();
  });

  it('resolveHsnCodes() → returns empty for empty input', async () => {
    const { service, prisma } = makeService();
    const result = await service.resolveHsnCodes([]);
    expect(result).toEqual([]);
    expect(prisma.globalReference.glCfgHsnCode.findMany).not.toHaveBeenCalled();
  });

  it('resolveHsnCode() → returns null for null input', async () => {
    const { service, prisma } = makeService();
    const result = await service.resolveHsnCode(null);
    expect(result).toBeNull();
  });
});

// ─── System reference resolvers ───────────────────────────────────────────────

describe('CrossDbResolverService — System reference resolvers', () => {
  it('resolveCurrency() → returns null for null input', async () => {
    const { service, prisma } = makeService();
    const result = await service.resolveCurrency(null);
    expect(result).toBeNull();
    expect(prisma.globalReference.glCfgCurrency.findUnique).not.toHaveBeenCalled();
  });

  it('resolveDefaultCurrency() → calls findFirst with isDefault: true', async () => {
    const mockCurrency = { id: 'cur-1', code: 'INR', isDefault: true };
    const prisma = makePrisma();
    prisma.globalReference.glCfgCurrency.findFirst.mockResolvedValue(mockCurrency);
    const service = new CrossDbResolverService(prisma as any);
    const result = await service.resolveDefaultCurrency();
    expect(result!.code).toBe('INR');
    expect(prisma.globalReference.glCfgCurrency.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isDefault: true } }),
    );
  });

  it('resolveTimezone() → returns null for undefined input', async () => {
    const { service, prisma } = makeService();
    const result = await service.resolveTimezone(undefined);
    expect(result).toBeNull();
    expect(prisma.globalReference.glCfgTimezone.findUnique).not.toHaveBeenCalled();
  });

  it('resolveDefaultTimezone() → calls findFirst with isDefault: true', async () => {
    const { service, prisma } = makeService();
    await service.resolveDefaultTimezone();
    expect(prisma.globalReference.glCfgTimezone.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isDefault: true } }),
    );
  });

  it('resolveAllLanguages() → filters isIndian when flag is true', async () => {
    const { service, prisma } = makeService();
    await service.resolveAllLanguages(true);
    expect(prisma.globalReference.glCfgLanguage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isIndian: true }),
      }),
    );
  });

  it('resolveAllLanguages() → does not filter isIndian when flag is false', async () => {
    const { service, prisma } = makeService();
    await service.resolveAllLanguages(false);
    const callArg = prisma.globalReference.glCfgLanguage.findMany.mock.calls[0][0];
    expect(callArg.where).not.toHaveProperty('isIndian');
  });

  it('resolveLanguage() → returns null for null input', async () => {
    const { service, prisma } = makeService();
    const result = await service.resolveLanguage(null);
    expect(result).toBeNull();
    expect(prisma.globalReference.glCfgLanguage.findMany).not.toHaveBeenCalled();
  });
});
