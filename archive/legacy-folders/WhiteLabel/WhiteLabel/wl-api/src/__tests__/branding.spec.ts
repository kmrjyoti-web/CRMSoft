import { BrandingService } from '../modules/branding/branding.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  partnerBranding: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  partnerDomain: {
    findUnique: jest.fn(),
  },
};

const makeService = () => new BrandingService(mockPrisma as any);

describe('BrandingService', () => {
  afterEach(() => jest.clearAllMocks());

  it('create branding saves with defaults', async () => {
    const created = { id: 'b1', partnerId: 'p1', brandName: 'TestBrand', primaryColor: '#1E40AF' };
    mockPrisma.partnerBranding.create.mockResolvedValue(created);
    const svc = makeService();
    const result = await svc.create({ partnerId: 'p1', brandName: 'TestBrand' });
    expect(result.brandName).toBe('TestBrand');
    expect(mockPrisma.partnerBranding.create).toHaveBeenCalledWith({ data: { partnerId: 'p1', brandName: 'TestBrand' } });
  });

  it('update branding changes colors', async () => {
    mockPrisma.partnerBranding.findUnique.mockResolvedValue({ id: 'b1', partnerId: 'p1' });
    mockPrisma.partnerBranding.update.mockResolvedValue({ id: 'b1', primaryColor: '#FF0000' });
    const svc = makeService();
    const result = await svc.update('p1', { primaryColor: '#FF0000' });
    expect(result.primaryColor).toBe('#FF0000');
  });

  it('get by domain returns correct partner branding', async () => {
    mockPrisma.partnerDomain.findUnique.mockResolvedValue({
      id: 'd1', domain: 'app.testpartner.in',
      partner: { id: 'p1', branding: { brandName: 'Test Brand', primaryColor: '#1E40AF' } },
    });
    const svc = makeService();
    const result = await svc.getByDomain('app.testpartner.in');
    expect(result?.brandName).toBe('Test Brand');
  });

  it('missing domain returns 404', async () => {
    mockPrisma.partnerDomain.findUnique.mockResolvedValue(null);
    const svc = makeService();
    await expect(svc.getByDomain('unknown.domain.com')).rejects.toThrow(NotFoundException);
  });
});
