// @ts-nocheck
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SubmitApprovalHandler } from '../application/commands/submit-approval/submit-approval.handler';
import { SubmitApprovalCommand } from '../application/commands/submit-approval/submit-approval.command';
import { ApproveRequestHandler } from '../application/commands/approve-request/approve-request.handler';
import { ApproveRequestCommand } from '../application/commands/approve-request/approve-request.command';
import { RejectRequestHandler } from '../application/commands/reject-request/reject-request.handler';
import { RejectRequestCommand } from '../application/commands/reject-request/reject-request.command';
import { GetMyRequestsHandler } from '../application/queries/get-my-requests/get-my-requests.handler';
import { GetMyRequestsQuery } from '../application/queries/get-my-requests/get-my-requests.query';
import { GetPendingHandler } from '../application/queries/get-pending/get-pending.handler';
import { GetPendingQuery } from '../application/queries/get-pending/get-pending.query';
import { GetRequestDetailHandler } from '../application/queries/get-request-detail/get-request-detail.handler';
import { GetRequestDetailQuery } from '../application/queries/get-request-detail/get-request-detail.query';

const makeRequest = (overrides = {}) => ({
  id: 'req-1',
  entityType: 'QUOTATION',
  entityId: 'q-1',
  makerId: 'user-1',
  checkerRole: 'SALES_MANAGER',
  status: 'PENDING',
  ...overrides,
});

describe('Approval Requests', () => {
  let makerChecker: any;
  let prisma: any;

  beforeEach(() => {
    makerChecker = {
      submit: jest.fn().mockResolvedValue(makeRequest()),
      approve: jest.fn().mockResolvedValue({ ...makeRequest(), status: 'APPROVED' }),
      reject: jest.fn().mockResolvedValue({ ...makeRequest(), status: 'REJECTED' }),
      getPending: jest.fn().mockResolvedValue([makeRequest()]),
      getPendingForRole: jest.fn().mockResolvedValue([makeRequest()]),
    };
    prisma = {
      working: {
        approvalRequest: {
          findUnique: jest.fn().mockResolvedValue({
            ...makeRequest(),
            maker: { id: 'user-1', firstName: 'Raj', lastName: 'Patel', email: 'raj@test.com' },
            checker: null,
          }),
          findMany: jest.fn().mockResolvedValue([makeRequest()]),
        },
      },
    };
  });

  afterEach(() => jest.clearAllMocks());

  // ─── SubmitApprovalHandler ────────────────────────────────────────────────

  describe('SubmitApprovalHandler', () => {
    let handler: SubmitApprovalHandler;
    beforeEach(() => { handler = new SubmitApprovalHandler(makerChecker); });

    it('should submit an approval request via MakerCheckerEngine', async () => {
      const cmd = new SubmitApprovalCommand(
        'QUOTATION', 'q-1', 'APPROVE', 'user-1', 'SALES_EXEC', 2,
        { amount: 50000 }, 'Please approve this quotation',
      );
      const result = await handler.execute(cmd);
      expect(makerChecker.submit).toHaveBeenCalledTimes(1);
      expect(makerChecker.submit).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          action: 'APPROVE',
          resourceType: 'QUOTATION',
          resourceId: 'q-1',
        }),
        'Please approve this quotation',
      );
      expect(result).toBeDefined();
    });

    it('should submit without payload or note', async () => {
      const cmd = new SubmitApprovalCommand('LEAD', 'lead-1', 'ALLOCATE', 'user-2', 'SALES_EXEC', 1);
      await handler.execute(cmd);
      expect(makerChecker.submit).toHaveBeenCalledWith(
        expect.objectContaining({ resourceType: 'LEAD', resourceId: 'lead-1' }),
        undefined,
      );
    });

    it('should propagate engine errors', async () => {
      makerChecker.submit.mockRejectedValue(new Error('Engine unavailable'));
      const cmd = new SubmitApprovalCommand('QUOTATION', 'q-1', 'APPROVE', 'user-1', 'EXEC', 1);
      await expect(handler.execute(cmd)).rejects.toThrow('Engine unavailable');
    });
  });

  // ─── ApproveRequestHandler ────────────────────────────────────────────────

  describe('ApproveRequestHandler', () => {
    let handler: ApproveRequestHandler;
    beforeEach(() => { handler = new ApproveRequestHandler(makerChecker, prisma); });

    it('should approve a request when checker role matches', async () => {
      prisma.working.approvalRequest.findUnique.mockResolvedValue(makeRequest({ checkerRole: 'SALES_MANAGER' }));
      const cmd = new ApproveRequestCommand('req-1', 'checker-1', 'SALES_MANAGER', 'Approved');
      const result = await handler.execute(cmd);
      expect(makerChecker.approve).toHaveBeenCalledWith('req-1', 'checker-1', 'Approved');
      expect(result.status).toBe('APPROVED');
    });

    it('should throw ForbiddenException when checker role does not match', async () => {
      prisma.working.approvalRequest.findUnique.mockResolvedValue(makeRequest({ checkerRole: 'SALES_MANAGER' }));
      const cmd = new ApproveRequestCommand('req-1', 'checker-1', 'FINANCE_HEAD', 'Approved');
      await expect(handler.execute(cmd)).rejects.toThrow(ForbiddenException);
      expect(makerChecker.approve).not.toHaveBeenCalled();
    });

    it('should approve when request not found (no role to validate)', async () => {
      prisma.working.approvalRequest.findUnique.mockResolvedValue(null);
      const cmd = new ApproveRequestCommand('req-999', 'checker-1', 'ANY_ROLE');
      await handler.execute(cmd);
      expect(makerChecker.approve).toHaveBeenCalledWith('req-999', 'checker-1', undefined);
    });
  });

  // ─── GetMyRequestsHandler ─────────────────────────────────────────────────

  describe('GetMyRequestsHandler', () => {
    let handler: GetMyRequestsHandler;
    beforeEach(() => { handler = new GetMyRequestsHandler(prisma); });

    it('should return all approval requests for a maker', async () => {
      prisma.working.approvalRequest.findMany.mockResolvedValue([makeRequest()]);
      const result = await handler.execute(new GetMyRequestsQuery('user-1'));
      expect(result).toHaveLength(1);
      expect(prisma.working.approvalRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { makerId: 'user-1' } }),
      );
    });

    it('should return empty array when maker has no requests', async () => {
      prisma.working.approvalRequest.findMany.mockResolvedValue([]);
      const result = await handler.execute(new GetMyRequestsQuery('user-999'));
      expect(result).toEqual([]);
    });

    it('should include checker details in results', async () => {
      prisma.working.approvalRequest.findMany.mockResolvedValue([
        { ...makeRequest(), checker: { id: 'c-1', firstName: 'Priya', lastName: 'S' } },
      ]);
      const result = await handler.execute(new GetMyRequestsQuery('user-1'));
      expect(result[0].checker).toBeDefined();
    });
  });

  // ─── RejectRequestHandler ─────────────────────────────────────────────────

  describe('RejectRequestHandler', () => {
    let handler: RejectRequestHandler;
    beforeEach(() => { handler = new RejectRequestHandler(makerChecker); });

    it('should reject a request via MakerCheckerEngine', async () => {
      const cmd = new RejectRequestCommand('req-1', 'checker-1', 'Does not meet criteria');
      const result = await handler.execute(cmd);
      expect(makerChecker.reject).toHaveBeenCalledWith('req-1', 'checker-1', 'Does not meet criteria');
      expect(result.status).toBe('REJECTED');
    });

    it('should reject without note', async () => {
      const cmd = new RejectRequestCommand('req-1', 'checker-1');
      await handler.execute(cmd);
      expect(makerChecker.reject).toHaveBeenCalledWith('req-1', 'checker-1', undefined);
    });

    it('should propagate engine errors', async () => {
      makerChecker.reject.mockRejectedValue(new Error('Engine error'));
      await expect(handler.execute(new RejectRequestCommand('req-1', 'c-1'))).rejects.toThrow('Engine error');
    });
  });

  // ─── GetPendingHandler ────────────────────────────────────────────────────

  describe('GetPendingHandler', () => {
    let handler: GetPendingHandler;
    beforeEach(() => { handler = new GetPendingHandler(makerChecker); });

    it('should return pending requests for a checker role', async () => {
      const result = await handler.execute(new GetPendingQuery('SALES_MANAGER'));
      expect(makerChecker.getPendingForRole).toHaveBeenCalledWith('SALES_MANAGER');
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no pending requests for role', async () => {
      makerChecker.getPendingForRole.mockResolvedValue([]);
      const result = await handler.execute(new GetPendingQuery('FINANCE_HEAD'));
      expect(result).toHaveLength(0);
    });
  });

  // ─── GetRequestDetailHandler ──────────────────────────────────────────────

  describe('GetRequestDetailHandler', () => {
    let handler: GetRequestDetailHandler;
    beforeEach(() => { handler = new GetRequestDetailHandler(prisma); });

    it('should return request detail with maker and checker', async () => {
      const result = await handler.execute(new GetRequestDetailQuery('req-1'));
      expect(prisma.working.approvalRequest.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'req-1' } }),
      );
      expect(result.id).toBe('req-1');
      expect(result.maker).toBeDefined();
    });

    it('should throw NotFoundException when request not found', async () => {
      prisma.working.approvalRequest.findUnique.mockResolvedValue(null);
      await expect(handler.execute(new GetRequestDetailQuery('missing'))).rejects.toThrow(NotFoundException);
    });
  });
});
