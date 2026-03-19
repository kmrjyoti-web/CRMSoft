import { ModuleManagerService } from '../services/module-manager.service';

/* ── helpers ─────────────────────────────────────────────── */

function makeDef(overrides: Record<string, any> = {}) {
  return {
    id: 'def-1',
    code: 'WHATSAPP',
    name: 'WhatsApp',
    description: 'WhatsApp integration',
    category: 'COMMUNICATION',
    isCore: false,
    iconName: 'message-circle',
    sortOrder: 10,
    dependsOn: [] as string[],
    autoEnables: [] as string[],
    applicableTypes: ['ALL'],
    source: 'PLATFORM',
    vendorId: null,
    isFreeInBase: false,
    priceMonthly: null,
    priceYearly: null,
    trialDays: 0,
    requiresCredentials: true,
    credentialSchema: { fields: [{ key: 'apiKey', label: 'API Key' }] },
    isFeatured: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeCoreDef() {
  return makeDef({
    id: 'def-core',
    code: 'CRM_CORE',
    name: 'CRM Core',
    isCore: true,
    requiresCredentials: false,
    credentialSchema: null,
    autoEnables: [],
  });
}

function makeTenantModule(overrides: Record<string, any> = {}) {
  return {
    id: 'tm-1',
    tenantId: 'tenant-1',
    moduleId: 'def-1',
    status: 'ACTIVE',
    enabledAt: new Date(),
    trialEndsAt: null,
    expiresAt: null,
    credentialsEnc: null,
    credentialsValidatedAt: null,
    credentialsStatus: 'NOT_SET',
    enabledBy: 'user-1',
    usageCount: 0,
    lastUsedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makePrisma(overrides: any = {}) {
  return {
    moduleDefinition: {
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    tenantModule: {
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    },
    ...overrides,
  } as any;
}

/* ── tests ───────────────────────────────────────────────── */

describe('ModuleManagerService', () => {
  /* ── listTenantModules ─────────────────────────────────── */

  describe('listTenantModules', () => {
    it('returns all definitions with correct status', async () => {
      const def1 = makeDef({ id: 'def-1', code: 'WHATSAPP' });
      const def2 = makeDef({ id: 'def-2', code: 'EMAIL', name: 'Email' });

      const tm = makeTenantModule({ moduleId: 'def-1', status: 'ACTIVE' });

      const prisma = makePrisma({
        moduleDefinition: {
          findMany: jest.fn().mockResolvedValue([def1, def2]),
        },
        tenantModule: {
          findMany: jest.fn().mockResolvedValue([tm]),
        },
      });

      const service = new ModuleManagerService(prisma);
      const result = await service.listTenantModules('tenant-1');

      expect(result).toHaveLength(2);
      expect(result[0].code).toBe('WHATSAPP');
      expect(result[0].status).toBe('ACTIVE');
      expect(result[1].code).toBe('EMAIL');
      expect(result[1].status).toBe('NOT_INSTALLED');
    });

    it('marks expired trials correctly', async () => {
      const def = makeDef({ id: 'def-1', code: 'AI_ASSIST', trialDays: 14 });

      const tm = makeTenantModule({
        moduleId: 'def-1',
        status: 'TRIAL',
        trialEndsAt: new Date(Date.now() - 86400000), // 1 day ago
      });

      const prisma = makePrisma({
        moduleDefinition: { findMany: jest.fn().mockResolvedValue([def]) },
        tenantModule: { findMany: jest.fn().mockResolvedValue([tm]) },
      });

      const service = new ModuleManagerService(prisma);
      const result = await service.listTenantModules('tenant-1');

      expect(result[0].status).toBe('EXPIRED');
    });
  });

  /* ── enableModule ──────────────────────────────────────── */

  describe('enableModule', () => {
    it('enables a module and auto-enables dependencies', async () => {
      const depDef = makeDef({
        id: 'def-dep',
        code: 'CONTACTS',
        name: 'Contacts',
        autoEnables: [],
      });

      const mainDef = makeDef({
        id: 'def-1',
        code: 'WHATSAPP',
        autoEnables: ['CONTACTS'],
      });

      const prisma = makePrisma({
        moduleDefinition: {
          findUnique: jest.fn().mockImplementation(({ where }) => {
            if (where.code === 'WHATSAPP') return mainDef;
            if (where.code === 'CONTACTS') return depDef;
            return null;
          }),
        },
        tenantModule: {
          findUnique: jest.fn().mockResolvedValue(null),
          upsert: jest.fn().mockResolvedValue({}),
        },
      });

      const service = new ModuleManagerService(prisma);
      const result = await service.enableModule('tenant-1', 'WHATSAPP', 'user-1');

      expect(result).toHaveLength(2);
      expect(result[0].code).toBe('CONTACTS');
      expect(result[1].code).toBe('WHATSAPP');
      expect(prisma.tenantModule.upsert).toHaveBeenCalledTimes(2);
    });

    it('skips already-active modules during enable', async () => {
      const def = makeDef({ id: 'def-1', code: 'WHATSAPP', autoEnables: [] });
      const existing = makeTenantModule({ status: 'ACTIVE' });

      const prisma = makePrisma({
        moduleDefinition: {
          findUnique: jest.fn().mockResolvedValue(def),
        },
        tenantModule: {
          findUnique: jest.fn().mockResolvedValue(existing),
          upsert: jest.fn(),
        },
      });

      const service = new ModuleManagerService(prisma);
      const result = await service.enableModule('tenant-1', 'WHATSAPP', 'user-1');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('ALREADY_ACTIVE');
      expect(prisma.tenantModule.upsert).not.toHaveBeenCalled();
    });

    it('sets trial status when module has trialDays > 0', async () => {
      const def = makeDef({
        id: 'def-1',
        code: 'AI_ASSIST',
        trialDays: 14,
        autoEnables: [],
      });

      const prisma = makePrisma({
        moduleDefinition: {
          findUnique: jest.fn().mockResolvedValue(def),
        },
        tenantModule: {
          findUnique: jest.fn().mockResolvedValue(null),
          upsert: jest.fn().mockResolvedValue({}),
        },
      });

      const service = new ModuleManagerService(prisma);
      const result = await service.enableModule('tenant-1', 'AI_ASSIST', 'user-1');

      expect(result[0].status).toBe('TRIAL');

      const upsertCall = prisma.tenantModule.upsert.mock.calls[0][0];
      expect(upsertCall.create.status).toBe('TRIAL');
      expect(upsertCall.create.trialEndsAt).toBeDefined();
    });

    it('throws NotFoundException for unknown module code', async () => {
      const prisma = makePrisma({
        moduleDefinition: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      });

      const service = new ModuleManagerService(prisma);
      await expect(
        service.enableModule('tenant-1', 'NONEXISTENT', 'user-1'),
      ).rejects.toThrow('Module definition "NONEXISTENT" not found');
    });
  });

  /* ── disableModule ─────────────────────────────────────── */

  describe('disableModule', () => {
    it('prevents disabling core modules', async () => {
      const coreDef = makeCoreDef();

      const prisma = makePrisma({
        moduleDefinition: {
          findUnique: jest.fn().mockResolvedValue(coreDef),
        },
      });

      const service = new ModuleManagerService(prisma);
      await expect(
        service.disableModule('tenant-1', 'CRM_CORE'),
      ).rejects.toThrow('core module and cannot be disabled');
    });

    it('prevents disabling a module depended upon by another active module', async () => {
      const contactsDef = makeDef({
        id: 'def-contacts',
        code: 'CONTACTS',
        name: 'Contacts',
        autoEnables: [],
      });

      const whatsappDef = makeDef({
        id: 'def-wa',
        code: 'WHATSAPP',
        name: 'WhatsApp',
        autoEnables: ['CONTACTS'],
      });

      const prisma = makePrisma({
        moduleDefinition: {
          findUnique: jest.fn().mockResolvedValue(contactsDef),
          findMany: jest.fn().mockResolvedValue([contactsDef, whatsappDef]),
        },
        tenantModule: {
          findMany: jest.fn().mockResolvedValue([
            makeTenantModule({ moduleId: 'def-contacts', status: 'ACTIVE' }),
            makeTenantModule({ id: 'tm-2', moduleId: 'def-wa', status: 'ACTIVE' }),
          ]),
        },
      });

      const service = new ModuleManagerService(prisma);
      await expect(
        service.disableModule('tenant-1', 'CONTACTS'),
      ).rejects.toThrow('Cannot disable "CONTACTS" because the following active modules depend on it: WhatsApp');
    });

    it('disables module successfully when no dependents', async () => {
      const def = makeDef({ id: 'def-1', code: 'WHATSAPP', autoEnables: [] });

      const prisma = makePrisma({
        moduleDefinition: {
          findUnique: jest.fn().mockResolvedValue(def),
          findMany: jest.fn().mockResolvedValue([def]),
        },
        tenantModule: {
          findUnique: jest.fn().mockResolvedValue(makeTenantModule()),
          findMany: jest.fn().mockResolvedValue([
            makeTenantModule({ moduleId: 'def-1' }),
          ]),
          delete: jest.fn().mockResolvedValue({}),
        },
      });

      const service = new ModuleManagerService(prisma);
      const result = await service.disableModule('tenant-1', 'WHATSAPP');

      expect(result).toEqual({ code: 'WHATSAPP', status: 'DISABLED' });
      expect(prisma.tenantModule.delete).toHaveBeenCalled();
    });

    it('throws NotFoundException when module is not installed', async () => {
      const def = makeDef({ id: 'def-1', code: 'WHATSAPP', autoEnables: [] });

      const prisma = makePrisma({
        moduleDefinition: {
          findUnique: jest.fn().mockResolvedValue(def),
          findMany: jest.fn().mockResolvedValue([def]),
        },
        tenantModule: {
          findUnique: jest.fn().mockResolvedValue(null),
          findMany: jest.fn().mockResolvedValue([]),
        },
      });

      const service = new ModuleManagerService(prisma);
      await expect(
        service.disableModule('tenant-1', 'WHATSAPP'),
      ).rejects.toThrow('not installed for this tenant');
    });
  });

  /* ── updateCredentials ─────────────────────────────────── */

  describe('updateCredentials', () => {
    it('stores credentials and sets status to VALID', async () => {
      const def = makeDef({
        id: 'def-1',
        code: 'WHATSAPP',
        requiresCredentials: true,
      });

      const tm = makeTenantModule({ moduleId: 'def-1' });

      const prisma = makePrisma({
        moduleDefinition: {
          findUnique: jest.fn().mockResolvedValue(def),
        },
        tenantModule: {
          findUnique: jest.fn().mockResolvedValue(tm),
          update: jest.fn().mockResolvedValue({}),
        },
      });

      const service = new ModuleManagerService(prisma);
      const result = await service.updateCredentials(
        'tenant-1',
        'WHATSAPP',
        { apiKey: 'test-key' },
      );

      expect(result).toEqual({ code: 'WHATSAPP', credentialsStatus: 'VALID' });

      const updateCall = prisma.tenantModule.update.mock.calls[0][0];
      expect(updateCall.data.credentialsStatus).toBe('VALID');
      expect(updateCall.data.credentialsEnc).toContain('apiKey');
    });

    it('throws BadRequestException when module does not require credentials', async () => {
      const def = makeDef({
        id: 'def-1',
        code: 'CRM_CORE',
        requiresCredentials: false,
      });

      const prisma = makePrisma({
        moduleDefinition: {
          findUnique: jest.fn().mockResolvedValue(def),
        },
      });

      const service = new ModuleManagerService(prisma);
      await expect(
        service.updateCredentials('tenant-1', 'CRM_CORE', { apiKey: 'test' }),
      ).rejects.toThrow('does not require credentials');
    });

    it('throws NotFoundException when module is not installed', async () => {
      const def = makeDef({
        id: 'def-1',
        code: 'WHATSAPP',
        requiresCredentials: true,
      });

      const prisma = makePrisma({
        moduleDefinition: {
          findUnique: jest.fn().mockResolvedValue(def),
        },
        tenantModule: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      });

      const service = new ModuleManagerService(prisma);
      await expect(
        service.updateCredentials('tenant-1', 'WHATSAPP', { apiKey: 'test' }),
      ).rejects.toThrow('not installed for this tenant');
    });
  });

  /* ── validateCredentials ───────────────────────────────── */

  describe('validateCredentials', () => {
    it('updates validation timestamp and returns VALID', async () => {
      const def = makeDef({ id: 'def-1', code: 'WHATSAPP' });
      const tm = makeTenantModule({
        moduleId: 'def-1',
        credentialsEnc: '{"apiKey":"test"}',
      });

      const prisma = makePrisma({
        moduleDefinition: {
          findUnique: jest.fn().mockResolvedValue(def),
        },
        tenantModule: {
          findUnique: jest.fn().mockResolvedValue(tm),
          update: jest.fn().mockResolvedValue({}),
        },
      });

      const service = new ModuleManagerService(prisma);
      const result = await service.validateCredentials('tenant-1', 'WHATSAPP');

      expect(result.code).toBe('WHATSAPP');
      expect(result.credentialsStatus).toBe('VALID');
      expect(result.validatedAt).toBeDefined();

      const updateCall = prisma.tenantModule.update.mock.calls[0][0];
      expect(updateCall.data.credentialsStatus).toBe('VALID');
      expect(updateCall.data.credentialsValidatedAt).toBeDefined();
    });

    it('throws BadRequestException when no credentials are set', async () => {
      const def = makeDef({ id: 'def-1', code: 'WHATSAPP' });
      const tm = makeTenantModule({
        moduleId: 'def-1',
        credentialsEnc: null,
      });

      const prisma = makePrisma({
        moduleDefinition: {
          findUnique: jest.fn().mockResolvedValue(def),
        },
        tenantModule: {
          findUnique: jest.fn().mockResolvedValue(tm),
        },
      });

      const service = new ModuleManagerService(prisma);
      await expect(
        service.validateCredentials('tenant-1', 'WHATSAPP'),
      ).rejects.toThrow('No credentials set');
    });
  });

  /* ── getEnabledModuleCodes ─────────────────────────────── */

  describe('getEnabledModuleCodes', () => {
    it('returns codes of active and non-expired trial modules', async () => {
      const def1 = makeDef({ id: 'def-1', code: 'WHATSAPP' });
      const def2 = makeDef({ id: 'def-2', code: 'EMAIL' });
      const def3 = makeDef({ id: 'def-3', code: 'AI_ASSIST' });

      const prisma = makePrisma({
        tenantModule: {
          findMany: jest.fn().mockResolvedValue([
            {
              ...makeTenantModule({ moduleId: 'def-1', status: 'ACTIVE' }),
              module: def1,
            },
            {
              ...makeTenantModule({
                id: 'tm-2',
                moduleId: 'def-2',
                status: 'TRIAL',
                trialEndsAt: new Date(Date.now() + 86400000), // 1 day from now
              }),
              module: def2,
            },
            {
              ...makeTenantModule({
                id: 'tm-3',
                moduleId: 'def-3',
                status: 'TRIAL',
                trialEndsAt: new Date(Date.now() - 86400000), // 1 day ago (expired)
              }),
              module: def3,
            },
          ]),
        },
      });

      const service = new ModuleManagerService(prisma);
      const codes = await service.getEnabledModuleCodes('tenant-1');

      expect(codes).toEqual(['WHATSAPP', 'EMAIL']);
      expect(codes).not.toContain('AI_ASSIST');
    });

    it('returns empty array when no modules are enabled', async () => {
      const prisma = makePrisma({
        tenantModule: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      });

      const service = new ModuleManagerService(prisma);
      const codes = await service.getEnabledModuleCodes('tenant-1');

      expect(codes).toEqual([]);
    });
  });
});
