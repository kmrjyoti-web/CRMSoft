import { DomainsService } from '../modules/domains/domains.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockPrisma = {
  partnerDomain: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const makeService = () => new DomainsService(mockPrisma as any);

describe('DomainsService', () => {
  afterEach(() => jest.clearAllMocks());

  it('add domain saves with PENDING SSL and verification token', async () => {
    mockPrisma.partnerDomain.findUnique.mockResolvedValue(null);
    mockPrisma.partnerDomain.create.mockImplementation(({ data }: any) =>
      Promise.resolve({ id: 'd1', ...data, sslStatus: 'PENDING' })
    );
    const svc = makeService();
    const result = await svc.add({ partnerId: 'p1', domain: 'app.test.in', domainType: 'PRIMARY' });
    expect(result.sslStatus).toBe('PENDING');
    expect(result.verificationToken).toBeDefined();
    expect(result.dnsRecords).toBeDefined();
  });

  it('add duplicate domain throws 409', async () => {
    mockPrisma.partnerDomain.findUnique.mockResolvedValue({ id: 'existing' });
    const svc = makeService();
    await expect(svc.add({ partnerId: 'p1', domain: 'app.test.in', domainType: 'PRIMARY' })).rejects.toThrow(ConflictException);
  });

  it('verify DNS updates isVerified and SSL to ACTIVE', async () => {
    mockPrisma.partnerDomain.findUnique.mockResolvedValue({ id: 'd1', domain: 'app.test.in' });
    mockPrisma.partnerDomain.update.mockResolvedValue({ id: 'd1', isVerified: true, sslStatus: 'ACTIVE' });
    const svc = makeService();
    const result = await svc.verify('d1');
    expect(result.isVerified).toBe(true);
    expect(result.sslStatus).toBe('ACTIVE');
  });

  it('remove domain deletes record', async () => {
    mockPrisma.partnerDomain.findUnique.mockResolvedValue({ id: 'd1' });
    mockPrisma.partnerDomain.delete.mockResolvedValue({ id: 'd1' });
    const svc = makeService();
    const result = await svc.remove('d1');
    expect(result.id).toBe('d1');
  });

  it('remove non-existent domain throws 404', async () => {
    mockPrisma.partnerDomain.findUnique.mockResolvedValue(null);
    const svc = makeService();
    await expect(svc.remove('unknown')).rejects.toThrow(NotFoundException);
  });
});
