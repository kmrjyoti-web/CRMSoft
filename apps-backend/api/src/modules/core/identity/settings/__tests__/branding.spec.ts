import { BrandingService } from '../services/branding.service';
import { DomainVerifierService } from '../services/domain-verifier.service';

const mockPrisma = {
  tenantBranding: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    upsert: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
} as any;
(mockPrisma as any).identity = mockPrisma;
(mockPrisma as any).platform = mockPrisma;

describe('BrandingService', () => {
  let service: BrandingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BrandingService(mockPrisma);
  });

  it('should return branding for tenant', async () => {
    const branding = { tenantId: 't1', primaryColor: '#1976D2' };
    mockPrisma.tenantBranding.findUnique.mockResolvedValue(branding);

    const result = await service.get('t1');
    expect(result.primaryColor).toBe('#1976D2');
  });

  it('should generate CSS variables from branding', async () => {
    mockPrisma.tenantBranding.findUnique.mockResolvedValue({
      primaryColor: '#FF0000', secondaryColor: '#00FF00', accentColor: '#0000FF',
      sidebarColor: '#111', sidebarTextColor: '#FFF', headerColor: '#FFF',
      headerTextColor: '#333', buttonColor: '#FF0000', buttonTextColor: '#FFF',
      linkColor: '#0000FF', dangerColor: '#D32F2F', successColor: '#388E3C',
      warningColor: '#F57C00', fontFamily: 'Inter', headingFontFamily: null,
      fontSize: '14px',
    });

    const vars = await service.getCssVariables('t1');
    expect(vars['--primary']).toBe('#FF0000');
    expect(vars['--secondary']).toBe('#00FF00');
    expect(vars['--font-family']).toBe('Inter');
    expect(Object.keys(vars).length).toBe(16);
  });

  it('should reject non-image files on upload', async () => {
    const file = { mimetype: 'application/pdf', size: 1000, buffer: Buffer.from(''), originalname: 'test.pdf' } as Express.Multer.File;
    await expect(service.uploadLogo('t1', file, 'logo')).rejects.toThrow();
  });

  it('should reject files larger than 2MB', async () => {
    const file = { mimetype: 'image/png', size: 3 * 1024 * 1024, buffer: Buffer.from(''), originalname: 'big.png' } as Express.Multer.File;
    await expect(service.uploadLogo('t1', file, 'logo')).rejects.toThrow();
  });
});

describe('DomainVerifierService', () => {
  let service: DomainVerifierService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DomainVerifierService(mockPrisma);
  });

  it('should generate a verify token on initiate', async () => {
    mockPrisma.tenantBranding.upsert.mockResolvedValue({});
    const result = await service.initiate('t1', 'crm.example.com');

    expect(result.domain).toBe('crm.example.com');
    expect(result.verifyMethod).toBe('DNS_TXT');
    expect(result.verifyToken).toMatch(/^crm-verify-/);
    expect(result.instructions).toContain('_crm-verify.crm.example.com');
  });
});
