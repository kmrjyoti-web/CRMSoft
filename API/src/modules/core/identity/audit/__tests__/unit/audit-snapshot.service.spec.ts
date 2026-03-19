import { AuditSnapshotService } from '../../services/audit-snapshot.service';

describe('AuditSnapshotService', () => {
  let prisma: any;
  let service: AuditSnapshotService;

  beforeEach(() => {
    prisma = {
      lead: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'lead-1', leadNumber: 'L-2026-00045', status: 'NEW', priority: 'MEDIUM',
          expectedValue: { toNumber: () => 50000, toString: () => '50000' },
          createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-15'),
          contact: { firstName: 'John', lastName: 'Doe' },
          organization: { name: 'Acme Corp' },
          allocatedTo: { firstName: 'Alice', lastName: 'Smith' },
        }),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-1', email: 'test@test.com', firstName: 'Test', lastName: 'User',
          phone: '123', status: 'ACTIVE', userType: 'EMPLOYEE', roleId: 'role-1',
          createdAt: new Date(), updatedAt: new Date(),
        }),
      },
      contact: { findUnique: jest.fn().mockResolvedValue(null) },
      organization: { findUnique: jest.fn().mockResolvedValue(null) },
      quotation: { findUnique: jest.fn().mockResolvedValue(null) },
      activity: { findUnique: jest.fn().mockResolvedValue(null) },
      demo: { findUnique: jest.fn().mockResolvedValue(null) },
      tourPlan: { findUnique: jest.fn().mockResolvedValue(null) },
      followUp: { findUnique: jest.fn().mockResolvedValue(null) },
      role: { findUnique: jest.fn().mockResolvedValue(null) },
      lookupValue: { findUnique: jest.fn().mockResolvedValue(null) },
      salesTarget: { findUnique: jest.fn().mockResolvedValue(null) },
    };
    (prisma as any).identity = prisma;
    (prisma as any).platform = prisma;
    service = new AuditSnapshotService(prisma);
  });

  it('should capture Lead snapshot with contact and organization relations', async () => {
    const snapshot = await service.captureSnapshot('LEAD', 'lead-1');
    expect(snapshot).not.toBeNull();
    expect(snapshot!.leadNumber).toBe('L-2026-00045');
    expect(snapshot!.contact).toEqual({ firstName: 'John', lastName: 'Doe' });
    expect(snapshot!.organization).toEqual({ name: 'Acme Corp' });
    expect(prisma.lead.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'lead-1' },
    }));
  });

  it('should capture User snapshot WITHOUT password field', async () => {
    const snapshot = await service.captureSnapshot('USER', 'user-1');
    expect(snapshot).not.toBeNull();
    expect(snapshot!.firstName).toBe('Test');
    expect(snapshot).not.toHaveProperty('password');
  });

  it('should return null for non-existent entity', async () => {
    prisma.lead.findUnique.mockResolvedValue(null);
    const snapshot = await service.captureSnapshot('LEAD', 'non-existent');
    expect(snapshot).toBeNull();
  });

  it('should convert Decimal to string in snapshot', async () => {
    const snapshot = await service.captureSnapshot('LEAD', 'lead-1');
    expect(typeof snapshot!.expectedValue).toBe('string');
    expect(snapshot!.expectedValue).toBe('50000');
  });

  it('should generate correct entity labels per type', () => {
    expect(service.getEntityLabel('LEAD', 'x', { leadNumber: 'L-2026-00045' })).toBe('Lead #L-2026-00045');
    expect(service.getEntityLabel('CONTACT', 'x', { firstName: 'John', lastName: 'Doe' })).toBe('John Doe');
    expect(service.getEntityLabel('ORGANIZATION', 'x', { name: 'Acme Corp' })).toBe('Acme Corp');
    expect(service.getEntityLabel('QUOTATION', 'x', { quotationNo: 'QTN-001' })).toBe('Quotation QTN-001');
    expect(service.getEntityLabel('USER', 'x', { firstName: 'Alice', lastName: 'Smith' })).toBe('Alice Smith');
  });
});
