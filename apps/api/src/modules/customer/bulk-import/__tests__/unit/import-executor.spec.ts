import { ImportExecutorService } from '../../services/import-executor.service';

describe('ImportExecutorService', () => {
  let service: ImportExecutorService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      rawContact: {
        create: jest.fn().mockResolvedValue({ id: 'rc1' }),
        update: jest.fn().mockResolvedValue({ id: 'rc1' }),
      },
      communication: {
        createMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
      organization: {
        create: jest.fn().mockResolvedValue({ id: 'org1' }),
      },
      contact: {
        update: jest.fn().mockResolvedValue({ id: 'c1' }),
      },
    };
(prisma as any).working = prisma;
    service = new ImportExecutorService(prisma);
  });

  it('should CREATE a valid RawContact with communications', async () => {
    const result = await service.executeRow({
      rowNumber: 1,
      mappedData: { firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@test.com', mobile: '9876543210' },
    }, 'CONTACT', 'user1');

    expect(result.success).toBe(true);
    expect(result.action).toBe('CREATED');
    expect(result.entityId).toBe('rc1');
    expect(prisma.rawContact.create).toHaveBeenCalled();
    expect(prisma.communication.createMany).toHaveBeenCalled();
  });

  it('should UPDATE duplicate entity when userAction=ACCEPT', async () => {
    const result = await service.executeRow({
      rowNumber: 1,
      mappedData: { firstName: 'Rahul', lastName: 'K Sharma' },
      userAction: 'ACCEPT',
      duplicateOfEntityId: 'c1',
    }, 'CONTACT', 'user1');

    expect(result.success).toBe(true);
    expect(result.action).toBe('UPDATED');
    expect(prisma.rawContact.update).toHaveBeenCalled();
  });

  it('should SKIP when userAction=SKIP', async () => {
    const result = await service.executeRow({
      rowNumber: 1,
      mappedData: { firstName: 'Test' },
      userAction: 'SKIP',
    }, 'CONTACT', 'user1');

    expect(result.success).toBe(true);
    expect(result.action).toBe('SKIPPED');
  });

  it('should handle per-row errors gracefully', async () => {
    prisma.rawContact.create.mockRejectedValue(new Error('DB constraint violation'));

    const result = await service.executeRow({
      rowNumber: 1,
      mappedData: { firstName: 'Test' },
    }, 'CONTACT', 'user1');

    expect(result.success).toBe(false);
    expect(result.action).toBe('FAILED');
    expect(result.error).toContain('DB constraint');
  });
});
