import { PartnersService } from '../modules/partners/partners.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockPrisma = {
  whiteLabelPartner: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const makeService = () => new PartnersService(mockPrisma as any);

describe('PartnersService', () => {
  afterEach(() => jest.clearAllMocks());

  it('create partner saves record with TRIAL status', async () => {
    mockPrisma.whiteLabelPartner.findFirst.mockResolvedValue(null);
    mockPrisma.whiteLabelPartner.create.mockResolvedValue({
      id: 'p1', companyName: 'ABC CRM', email: 'abc@crm.in', partnerCode: 'abc-crm',
      status: 'TRIAL', plan: 'STARTER', passwordHash: 'hash', branding: null, domains: [],
    });
    const svc = makeService();
    const result = await svc.create({ companyName: 'ABC CRM', contactName: 'John', email: 'abc@crm.in' });
    expect(result.status).toBe('TRIAL');
    expect(result.partnerCode).toBe('abc-crm');
  });

  it('create partner throws 409 on duplicate email', async () => {
    mockPrisma.whiteLabelPartner.findFirst.mockResolvedValue({ id: 'existing' });
    const svc = makeService();
    await expect(svc.create({ companyName: 'Test', email: 'existing@test.com', contactName: 'X' }))
      .rejects.toThrow(ConflictException);
  });

  it('list partners returns paginated results', async () => {
    mockPrisma.whiteLabelPartner.findMany.mockResolvedValue([{ id: 'p1', passwordHash: 'h', branding: null, _count: { domains: 0 } }]);
    mockPrisma.whiteLabelPartner.count.mockResolvedValue(1);
    const svc = makeService();
    const result = await svc.findAll(1, 20);
    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('get partner returns detail with branding', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue({
      id: 'p1', companyName: 'Test', email: 'test@t.com', passwordHash: 'h',
      branding: { brandName: 'Test Brand' }, domains: [], deployment: null, gitBranches: [], featureFlags: [],
    });
    const svc = makeService();
    const result = await svc.findOne('p1');
    expect(result.branding?.brandName).toBe('Test Brand');
    expect((result as any).passwordHash).toBeUndefined();
  });

  it('get partner throws 404 for unknown id', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue(null);
    const svc = makeService();
    await expect(svc.findOne('unknown')).rejects.toThrow(NotFoundException);
  });

  it('update partner updates fields', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue({ id: 'p1', passwordHash: 'h', branding: null, domains: [], deployment: null, gitBranches: [], featureFlags: [] });
    mockPrisma.whiteLabelPartner.update.mockResolvedValue({ id: 'p1', companyName: 'Updated', passwordHash: 'h', branding: null });
    const svc = makeService();
    const result = await svc.update('p1', { companyName: 'Updated' });
    expect(result.companyName).toBe('Updated');
  });

  it('suspend partner sets status and reason', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue({ id: 'p1', passwordHash: 'h', branding: null, domains: [], deployment: null, gitBranches: [], featureFlags: [] });
    mockPrisma.whiteLabelPartner.update.mockResolvedValue({ id: 'p1', status: 'SUSPENDED', suspendedReason: 'Non-payment', passwordHash: 'h' });
    const svc = makeService();
    const result = await svc.suspend('p1', 'Non-payment');
    expect(result.status).toBe('SUSPENDED');
    expect(result.suspendedReason).toBe('Non-payment');
  });

  it('activate partner resets status', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue({ id: 'p1', passwordHash: 'h', branding: null, domains: [], deployment: null, gitBranches: [], featureFlags: [] });
    mockPrisma.whiteLabelPartner.update.mockResolvedValue({ id: 'p1', status: 'ACTIVE', suspendedAt: null, passwordHash: 'h' });
    const svc = makeService();
    const result = await svc.activate('p1');
    expect(result.status).toBe('ACTIVE');
  });

  it('generateCode slugifies company name', () => {
    const svc = makeService();
    expect(svc.generateCode('ABC Innovations Pvt Ltd')).toMatch(/^abc-innovations/);
  });

  it('dashboard returns aggregate stats', async () => {
    mockPrisma.whiteLabelPartner.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(6)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0);
    mockPrisma.whiteLabelPartner.findMany.mockResolvedValue([]);
    const svc = makeService();
    const result = await svc.getDashboard();
    expect(result.stats.total).toBe(10);
    expect(result.stats.active).toBe(6);
    expect(result.stats.trial).toBe(3);
  });
});
