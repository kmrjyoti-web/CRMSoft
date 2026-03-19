import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GetMyMenuHandler } from '../../application/queries/get-my-menu/get-my-menu.handler';
import { GetMyMenuQuery } from '../../application/queries/get-my-menu/get-my-menu.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

/**
 * Tests for the 5-Check Menu Visibility Chain:
 * 1. isActive (query-level filter)
 * 2. Module access (autoEnableWithModule → tenant has module enabled?)
 * 3. Business type applicability
 * 4. Credential validation (requiresCredential → valid creds?)
 * 5. Role permission (permissionModule:permissionAction)
 */

const BASE_MENU = {
  icon: null,
  route: '/test',
  sortOrder: 0,
  permissionModule: null,
  permissionAction: null,
  badgeColor: null,
  badgeText: null,
  openInNewTab: false,
  parentId: null,
  requiresCredential: false,
  credentialKey: null,
  businessTypeApplicability: ['ALL'],
  autoEnableWithModule: null,
  terminologyKey: null,
};

describe('GetMyMenuHandler - 5-Check Visibility Chain', () => {
  let handler: GetMyMenuHandler;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      menu: { findMany: jest.fn() },
      rolePermission: { findMany: jest.fn() },
      tenantModule: { findMany: jest.fn() },
      tenant: { findUnique: jest.fn(), findFirst: jest.fn() },
      terminologyOverride: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMyMenuHandler,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: { get: () => undefined } },
      ],
    }).compile();

    handler = module.get(GetMyMenuHandler);
    jest.clearAllMocks();
  });

  function setupDefaults() {
    mockPrisma.rolePermission.findMany.mockResolvedValue([]);
    mockPrisma.tenantModule.findMany.mockResolvedValue([]);
    mockPrisma.tenant.findUnique.mockResolvedValue({ id: 't1', businessType: null });
    mockPrisma.terminologyOverride.findMany.mockResolvedValue([]);
  }

  it('Check 2: should hide menus when required module is not enabled', async () => {
    setupDefaults();
    mockPrisma.menu.findMany.mockResolvedValue([
      { ...BASE_MENU, id: '1', name: 'Dashboard', code: 'DASHBOARD', menuType: 'ITEM' },
      { ...BASE_MENU, id: '2', name: 'WhatsApp', code: 'WHATSAPP', menuType: 'ITEM', autoEnableWithModule: 'WHATSAPP' },
    ]);

    const result = await handler.execute(
      new GetMyMenuQuery('u1', 'r1', 'ADMIN', false, 't1'),
    );

    const codes = result.map((m) => m.code);
    expect(codes).toContain('DASHBOARD');
    expect(codes).not.toContain('WHATSAPP'); // module not enabled
  });

  it('Check 2: should show menus when required module IS enabled', async () => {
    setupDefaults();
    // Enable WHATSAPP module
    mockPrisma.tenantModule.findMany.mockImplementation(({ where }: any) => {
      if (where?.status) {
        return [{ module: { code: 'WHATSAPP' } }];
      }
      return []; // credential query
    });

    mockPrisma.menu.findMany.mockResolvedValue([
      { ...BASE_MENU, id: '1', name: 'Dashboard', code: 'DASHBOARD', menuType: 'ITEM' },
      { ...BASE_MENU, id: '2', name: 'WhatsApp', code: 'WHATSAPP', menuType: 'ITEM', autoEnableWithModule: 'WHATSAPP' },
    ]);

    const result = await handler.execute(
      new GetMyMenuQuery('u1', 'r1', 'ADMIN', false, 't1'),
    );

    const codes = result.map((m) => m.code);
    expect(codes).toContain('DASHBOARD');
    expect(codes).toContain('WHATSAPP');
  });

  it('Check 3: should hide menus not applicable to tenant business type', async () => {
    setupDefaults();
    mockPrisma.menu.findMany.mockResolvedValue([
      { ...BASE_MENU, id: '1', name: 'Dashboard', code: 'DASHBOARD', menuType: 'ITEM' },
      {
        ...BASE_MENU, id: '2', name: 'Properties', code: 'PROPERTIES', menuType: 'ITEM',
        businessTypeApplicability: ['REAL_ESTATE'],
      },
    ]);

    const result = await handler.execute(
      new GetMyMenuQuery('u1', 'r1', 'ADMIN', false, 't1', 'IT_SERVICES'),
    );

    const codes = result.map((m) => m.code);
    expect(codes).toContain('DASHBOARD');
    expect(codes).not.toContain('PROPERTIES'); // not applicable to IT_SERVICES
  });

  it('Check 3: should show menus when business type matches', async () => {
    setupDefaults();
    mockPrisma.menu.findMany.mockResolvedValue([
      {
        ...BASE_MENU, id: '1', name: 'Properties', code: 'PROPERTIES', menuType: 'ITEM',
        businessTypeApplicability: ['REAL_ESTATE', 'CONSTRUCTION'],
      },
    ]);

    const result = await handler.execute(
      new GetMyMenuQuery('u1', 'r1', 'ADMIN', false, 't1', 'REAL_ESTATE'),
    );

    expect(result).toHaveLength(1);
    expect(result[0].code).toBe('PROPERTIES');
  });

  it('Check 4: should hide menus requiring credentials when credentials are not valid', async () => {
    setupDefaults();
    mockPrisma.menu.findMany.mockResolvedValue([
      { ...BASE_MENU, id: '1', name: 'Dashboard', code: 'DASHBOARD', menuType: 'ITEM' },
      {
        ...BASE_MENU, id: '2', name: 'WhatsApp Chat', code: 'WA_CHAT', menuType: 'ITEM',
        requiresCredential: true, credentialKey: 'WHATSAPP',
      },
    ]);

    const result = await handler.execute(
      new GetMyMenuQuery('u1', 'r1', 'ADMIN', false, 't1'),
    );

    const codes = result.map((m) => m.code);
    expect(codes).toContain('DASHBOARD');
    expect(codes).not.toContain('WA_CHAT'); // no valid credentials
  });

  it('Check 5: should filter by role permissions', async () => {
    setupDefaults();
    mockPrisma.rolePermission.findMany.mockResolvedValue([
      { permission: { module: 'dashboard', action: 'read' } },
    ]);
    mockPrisma.menu.findMany.mockResolvedValue([
      { ...BASE_MENU, id: '1', name: 'Dashboard', code: 'DASHBOARD', menuType: 'ITEM', permissionModule: 'dashboard', permissionAction: 'read' },
      { ...BASE_MENU, id: '2', name: 'Admin', code: 'ADMIN', menuType: 'ITEM', permissionModule: 'admin', permissionAction: 'manage' },
    ]);

    const result = await handler.execute(
      new GetMyMenuQuery('u1', 'r1', 'VIEWER', false, 't1'),
    );

    const codes = result.map((m) => m.code);
    expect(codes).toContain('DASHBOARD');
    expect(codes).not.toContain('ADMIN');
  });

  it('should resolve terminology key in menu names', async () => {
    mockPrisma.rolePermission.findMany.mockResolvedValue([]);
    mockPrisma.tenantModule.findMany.mockResolvedValue([]);
    mockPrisma.tenant.findUnique.mockResolvedValue({
      id: 't1',
      businessType: { terminologyMap: { Contact: 'Patient', Lead: 'Appointment' } },
    });
    mockPrisma.terminologyOverride.findMany.mockResolvedValue([]);

    mockPrisma.menu.findMany.mockResolvedValue([
      { ...BASE_MENU, id: '1', name: 'Contacts', code: 'CONTACTS', menuType: 'ITEM', terminologyKey: 'Contact' },
      { ...BASE_MENU, id: '2', name: 'Leads', code: 'LEADS', menuType: 'ITEM', terminologyKey: 'Lead' },
    ]);

    const result = await handler.execute(
      new GetMyMenuQuery('u1', 'r1', 'ADMIN', false, 't1'),
    );

    expect(result[0].name).toBe('Patient');
    expect(result[1].name).toBe('Appointment');
  });

  it('should show all menus for SuperAdmin (no filtering)', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue({ id: 'default-t' });
    mockPrisma.menu.findMany.mockResolvedValue([
      { ...BASE_MENU, id: '1', name: 'Dashboard', code: 'DASHBOARD', menuType: 'ITEM' },
      { ...BASE_MENU, id: '2', name: 'Admin', code: 'ADMIN', menuType: 'ITEM', permissionModule: 'admin', permissionAction: 'manage' },
    ]);

    const result = await handler.execute(
      new GetMyMenuQuery('u1', 'r1', 'SUPER_ADMIN', true),
    );

    expect(result).toHaveLength(2);
  });
});
