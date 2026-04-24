import { DevRequestsService } from '../modules/dev-requests/dev-requests.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DevRequestStatus, DevRequestType, ErrorSeverity } from '@prisma/client';

const mockPrisma = {
  whiteLabelPartner: {
    findUnique: jest.fn(),
  },
  partnerDevRequest: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    groupBy: jest.fn(),
  },
};

const mockAudit = { log: jest.fn() };

const makeService = () => new DevRequestsService(mockPrisma as any, mockAudit as any);

describe('DevRequestsService', () => {
  afterEach(() => jest.clearAllMocks());

  it('submit() creates a dev request with SUBMITTED status', async () => {
    const partner = { id: 'p1', partnerCode: 'acme', email: 'acme@example.com' };
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue(partner);

    const created = {
      id: 'dr1',
      partnerId: 'p1',
      requestType: DevRequestType.BUG_FIX,
      title: 'Fix login redirect',
      status: DevRequestStatus.SUBMITTED,
      priority: ErrorSeverity.MEDIUM,
    };
    mockPrisma.partnerDevRequest.create.mockResolvedValue(created);

    const svc = makeService();
    const result = await svc.submit({
      partnerId: 'p1',
      requestType: DevRequestType.BUG_FIX,
      title: 'Fix login redirect',
    });

    expect(result.status).toBe(DevRequestStatus.SUBMITTED);
    expect(result.title).toBe('Fix login redirect');
    expect(mockPrisma.partnerDevRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          partnerId: 'p1',
          status: DevRequestStatus.SUBMITTED,
          requestType: DevRequestType.BUG_FIX,
        }),
      }),
    );
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'DEV_REQUEST_SUBMITTED' }),
    );
  });

  it('review() APPROVE moves request from SUBMITTED to APPROVED status', async () => {
    const request = {
      id: 'dr1',
      partnerId: 'p1',
      status: DevRequestStatus.SUBMITTED,
      partner: { companyName: 'Acme', email: 'acme@example.com' },
    };
    // findOne internally calls findUnique
    mockPrisma.partnerDevRequest.findUnique.mockResolvedValue(request);
    const approved = { ...request, status: DevRequestStatus.APPROVED, estimatedHours: 8, quotedPrice: 5000 };
    mockPrisma.partnerDevRequest.update.mockResolvedValue(approved);

    const svc = makeService();
    const result = await svc.review('dr1', { action: 'APPROVE', estimatedHours: 8, quotedPrice: 5000 });

    expect(result.status).toBe(DevRequestStatus.APPROVED);
    expect(mockPrisma.partnerDevRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: DevRequestStatus.APPROVED }),
      }),
    );
  });

  it('review() throws BadRequestException when request is already IN_PROGRESS (cannot review)', async () => {
    const request = {
      id: 'dr1',
      partnerId: 'p1',
      status: DevRequestStatus.IN_PROGRESS,
      partner: { companyName: 'Acme', email: 'acme@example.com' },
    };
    mockPrisma.partnerDevRequest.findUnique.mockResolvedValue(request);

    const svc = makeService();
    await expect(svc.review('dr1', { action: 'APPROVE' })).rejects.toThrow(BadRequestException);
  });

  it('assign() updates assignedDeveloper field and moves status to IN_PROGRESS', async () => {
    const request = {
      id: 'dr1',
      partnerId: 'p1',
      status: DevRequestStatus.APPROVED,
      partner: { companyName: 'Acme', email: 'acme@example.com' },
    };
    mockPrisma.partnerDevRequest.findUnique.mockResolvedValue(request);
    const assigned = { ...request, assignedDeveloper: 'dev@crmsoft.in', status: DevRequestStatus.IN_PROGRESS };
    mockPrisma.partnerDevRequest.update.mockResolvedValue(assigned);

    const svc = makeService();
    const result = await svc.assign('dr1', { assignedDeveloper: 'dev@crmsoft.in' });

    expect(result.assignedDeveloper).toBe('dev@crmsoft.in');
    expect(result.status).toBe(DevRequestStatus.IN_PROGRESS);
    expect(mockPrisma.partnerDevRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          assignedDeveloper: 'dev@crmsoft.in',
          status: DevRequestStatus.IN_PROGRESS,
        }),
      }),
    );
  });

  it('findAll() with status filter queries only matching dev requests', async () => {
    const submittedRequests = [
      { id: 'dr1', partnerId: 'p1', status: DevRequestStatus.SUBMITTED, title: 'Bug A' },
      { id: 'dr2', partnerId: 'p2', status: DevRequestStatus.SUBMITTED, title: 'Feature B' },
    ];
    mockPrisma.partnerDevRequest.findMany.mockResolvedValue(submittedRequests);
    mockPrisma.partnerDevRequest.count.mockResolvedValue(2);

    const svc = makeService();
    const result = await svc.findAll({ status: DevRequestStatus.SUBMITTED });

    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(2);
    expect(mockPrisma.partnerDevRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: DevRequestStatus.SUBMITTED }),
      }),
    );
  });
});
