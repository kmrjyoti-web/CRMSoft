import { CompanyProfileService } from '../services/company-profile.service';

const mockPrisma = {
  companyProfile: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
} as any;
(mockPrisma as any).identity = mockPrisma;
(mockPrisma as any).platform = mockPrisma;

describe('CompanyProfileService', () => {
  let service: CompanyProfileService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CompanyProfileService(mockPrisma);
  });

  it('should return full company profile', async () => {
    const profile = {
      tenantId: 't1',
      companyName: 'ABC Corp',
      gstNumber: '22AAAAA0000A1Z5',
      panNumber: 'ABCDE1234F',
      city: 'Mumbai',
    };
    mockPrisma.companyProfile.findUnique.mockResolvedValue(profile);

    const result = await service.get('t1');
    expect(result.companyName).toBe('ABC Corp');
    expect(result.gstNumber).toBe('22AAAAA0000A1Z5');
  });

  it('should update tax details (GST, PAN)', async () => {
    const updated = {
      tenantId: 't1',
      companyName: 'ABC Corp',
      gstNumber: '29BBBB1234C1Z8',
      panNumber: 'XYZPQ5678R',
    };
    mockPrisma.companyProfile.upsert.mockResolvedValue(updated);

    const result = await service.update('t1', {
      gstNumber: '29BBBB1234C1Z8',
      panNumber: 'XYZPQ5678R',
    } as any);
    expect(result.gstNumber).toBe('29BBBB1234C1Z8');
    expect(result.panNumber).toBe('XYZPQ5678R');
  });
});
