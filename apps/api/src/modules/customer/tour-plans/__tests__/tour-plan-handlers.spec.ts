// @ts-nocheck
import { CreateTourPlanHandler } from '../application/commands/create-tour-plan/create-tour-plan.handler';
import { SubmitTourPlanHandler } from '../application/commands/submit-tour-plan/submit-tour-plan.handler';
import { ApproveTourPlanHandler } from '../application/commands/approve-tour-plan/approve-tour-plan.handler';
import { CheckInVisitHandler } from '../application/commands/check-in-visit/check-in-visit.handler';
import { CheckOutVisitHandler } from '../application/commands/check-out-visit/check-out-visit.handler';
import { CancelTourPlanHandler } from '../application/commands/cancel-tour-plan/cancel-tour-plan.handler';
import { RejectTourPlanHandler } from '../application/commands/reject-tour-plan/reject-tour-plan.handler';
import { UpdateTourPlanHandler } from '../application/commands/update-tour-plan/update-tour-plan.handler';
import { GetTourPlanByIdHandler } from '../application/queries/get-tour-plan-by-id/get-tour-plan-by-id.handler';
import { GetTourPlanListHandler } from '../application/queries/get-tour-plan-list/get-tour-plan-list.handler';
import { GetTourPlanStatsHandler } from '../application/queries/get-tour-plan-stats/get-tour-plan-stats.handler';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('Tour Plan Handlers', () => {
  let prisma: any;
  const mockTourPlan = {
    id: 'tp-1', title: 'Mumbai Tour', status: 'DRAFT', planDate: new Date(),
    leadId: 'lead-1', salesPersonId: 'user-1',
    lead: { id: 'lead-1' }, salesPerson: { id: 'user-1' }, visits: [],
  };

  beforeEach(() => {
    prisma = {
      tourPlan: {
        create: jest.fn().mockResolvedValue(mockTourPlan),
        findUnique: jest.fn().mockResolvedValue(mockTourPlan),
        update: jest.fn().mockResolvedValue({ ...mockTourPlan, status: 'PENDING_APPROVAL' }),
        findMany: jest.fn().mockResolvedValue([mockTourPlan]),
        count: jest.fn().mockResolvedValue(1),
        groupBy: jest.fn().mockResolvedValue([{ status: 'DRAFT', _count: 1 }]),
      },
      tourPlanVisit: {
        findUnique: jest.fn().mockResolvedValue({ id: 'v-1', tourPlan: mockTourPlan, lead: { id: 'lead-1' }, actualArrival: null, actualDeparture: null }),
        update: jest.fn().mockResolvedValue({ id: 'v-1', actualArrival: new Date() }),
        count: jest.fn().mockResolvedValue(2),
      },
      tourPlanPhoto: { create: jest.fn().mockResolvedValue({}) },
      lead: { findUnique: jest.fn().mockResolvedValue({ id: 'lead-1', organization: null }) },
      reminder: { create: jest.fn().mockResolvedValue({}) },
      calendarEvent: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    (prisma as any).working = prisma;
  });

  it('should create a tour plan with visits', async () => {
    const handler = new CreateTourPlanHandler(prisma);
    const result = await handler.execute({
      title: 'Mumbai Tour', planDate: new Date(), userId: 'user-1', leadId: 'lead-1',
      visits: [{ leadId: 'lead-1', sortOrder: 0 }],
    } as any);
    expect(prisma.tourPlan.create).toHaveBeenCalled();
    expect(prisma.calendarEvent.create).toHaveBeenCalled();
    expect(result.id).toBe('tp-1');
  });

  it('should submit a DRAFT tour plan for approval', async () => {
    const handler = new SubmitTourPlanHandler(prisma);
    await handler.execute({ id: 'tp-1', userId: 'user-1' });
    expect(prisma.tourPlan.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'PENDING_APPROVAL' } }),
    );
  });

  it('should not submit non-DRAFT tour plan', async () => {
    prisma.tourPlan.findUnique.mockResolvedValue({ ...mockTourPlan, status: 'APPROVED' });
    const handler = new SubmitTourPlanHandler(prisma);
    await expect(handler.execute({ id: 'tp-1', userId: 'user-1' })).rejects.toThrow(BadRequestException);
  });

  it('should approve a PENDING_APPROVAL tour plan', async () => {
    prisma.tourPlan.findUnique.mockResolvedValue({ ...mockTourPlan, status: 'PENDING_APPROVAL' });
    prisma.tourPlan.update.mockResolvedValue({ ...mockTourPlan, status: 'APPROVED' });
    const handler = new ApproveTourPlanHandler(prisma);
    await handler.execute({ id: 'tp-1', userId: 'mgr-1' });
    expect(prisma.tourPlan.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'APPROVED' }) }),
    );
  });

  it('should check in a visit with GPS coordinates', async () => {
    const handler = new CheckInVisitHandler(prisma);
    await handler.execute({ visitId: 'v-1', userId: 'user-1', latitude: 19.076, longitude: 72.877, photoUrl: 'photo.jpg' });
    expect(prisma.tourPlanVisit.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ checkInLat: 19.076, checkInLng: 72.877 }) }),
    );
    expect(prisma.tourPlanPhoto.create).toHaveBeenCalled();
  });

  it('should throw when checking in to already checked-in visit', async () => {
    prisma.tourPlanVisit.findUnique.mockResolvedValue({ id: 'v-1', actualArrival: new Date() });
    const handler = new CheckInVisitHandler(prisma);
    await expect(handler.execute({ visitId: 'v-1', userId: 'user-1', latitude: 19.076, longitude: 72.877 })).rejects.toThrow(BadRequestException);
  });

  // ─── CheckOutVisitHandler ─────────────────────────────────────────────────

  it('should check out after a check-in', async () => {
    prisma.tourPlanVisit.findUnique.mockResolvedValue({ id: 'v-1', actualArrival: new Date(), actualDeparture: null });
    prisma.tourPlanVisit.update.mockResolvedValue({ id: 'v-1', actualDeparture: new Date() });
    const handler = new CheckOutVisitHandler(prisma);
    await handler.execute({ visitId: 'v-1', userId: 'user-1', latitude: 19.1, longitude: 72.9 });
    expect(prisma.tourPlanVisit.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ checkOutLat: 19.1, checkOutLng: 72.9 }) }),
    );
  });

  it('should throw when checking out without checking in', async () => {
    prisma.tourPlanVisit.findUnique.mockResolvedValue({ id: 'v-1', actualArrival: null, actualDeparture: null });
    const handler = new CheckOutVisitHandler(prisma);
    await expect(handler.execute({ visitId: 'v-1', userId: 'user-1', latitude: 19.1, longitude: 72.9 })).rejects.toThrow(BadRequestException);
  });

  it('should throw when already checked out', async () => {
    prisma.tourPlanVisit.findUnique.mockResolvedValue({ id: 'v-1', actualArrival: new Date(), actualDeparture: new Date() });
    const handler = new CheckOutVisitHandler(prisma);
    await expect(handler.execute({ visitId: 'v-1', userId: 'user-1', latitude: 19.1, longitude: 72.9 })).rejects.toThrow(BadRequestException);
  });

  // ─── CancelTourPlanHandler ────────────────────────────────────────────────

  it('should cancel a tour plan', async () => {
    prisma.tourPlan.update.mockResolvedValue({ ...mockTourPlan, status: 'CANCELLED' });
    const handler = new CancelTourPlanHandler(prisma);
    await handler.execute({ id: 'tp-1', userId: 'user-1' } as any);
    expect(prisma.tourPlan.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'CANCELLED' } }),
    );
  });

  it('should not cancel a COMPLETED tour plan', async () => {
    prisma.tourPlan.findUnique.mockResolvedValue({ ...mockTourPlan, status: 'COMPLETED' });
    const handler = new CancelTourPlanHandler(prisma);
    await expect(handler.execute({ id: 'tp-1', userId: 'user-1' } as any)).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when tour plan not found for cancel', async () => {
    prisma.tourPlan.findUnique.mockResolvedValue(null);
    const handler = new CancelTourPlanHandler(prisma);
    await expect(handler.execute({ id: 'missing', userId: 'user-1' } as any)).rejects.toThrow(NotFoundException);
  });

  // ─── RejectTourPlanHandler ────────────────────────────────────────────────

  it('should reject a PENDING_APPROVAL tour plan with reason', async () => {
    prisma.tourPlan.findUnique.mockResolvedValue({ ...mockTourPlan, status: 'PENDING_APPROVAL' });
    prisma.tourPlan.update.mockResolvedValue({ ...mockTourPlan, status: 'REJECTED', rejectedReason: 'Too many visits' });
    const handler = new RejectTourPlanHandler(prisma);
    await handler.execute({ id: 'tp-1', reason: 'Too many visits' } as any);
    expect(prisma.tourPlan.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'REJECTED', rejectedReason: 'Too many visits' }) }),
    );
  });

  it('should throw BadRequestException when rejecting non-pending tour plan', async () => {
    prisma.tourPlan.findUnique.mockResolvedValue({ ...mockTourPlan, status: 'DRAFT' });
    const handler = new RejectTourPlanHandler(prisma);
    await expect(handler.execute({ id: 'tp-1', reason: 'x' } as any)).rejects.toThrow(BadRequestException);
  });

  // ─── UpdateTourPlanHandler ────────────────────────────────────────────────

  it('should update a DRAFT tour plan', async () => {
    prisma.tourPlan.update.mockResolvedValue({ ...mockTourPlan, title: 'Updated Tour' });
    const handler = new UpdateTourPlanHandler(prisma);
    await handler.execute({ id: 'tp-1', data: { title: 'Updated Tour' } } as any);
    expect(prisma.tourPlan.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'tp-1' }, data: { title: 'Updated Tour' } }),
    );
  });

  it('should throw BadRequestException when updating an APPROVED tour plan', async () => {
    prisma.tourPlan.findUnique.mockResolvedValue({ ...mockTourPlan, status: 'APPROVED' });
    const handler = new UpdateTourPlanHandler(prisma);
    await expect(handler.execute({ id: 'tp-1', data: { title: 'X' } } as any)).rejects.toThrow(BadRequestException);
  });

  it('should allow updating a REJECTED tour plan (re-submit cycle)', async () => {
    prisma.tourPlan.findUnique.mockResolvedValue({ ...mockTourPlan, status: 'REJECTED' });
    prisma.tourPlan.update.mockResolvedValue({ ...mockTourPlan, status: 'REJECTED', title: 'Fixed Tour' });
    const handler = new UpdateTourPlanHandler(prisma);
    await handler.execute({ id: 'tp-1', data: { title: 'Fixed Tour' } } as any);
    expect(prisma.tourPlan.update).toHaveBeenCalled();
  });

  // ─── GetTourPlanListHandler ───────────────────────────────────────────────

  it('should return paginated tour plan list', async () => {
    const handler = new GetTourPlanListHandler(prisma);
    const result = await handler.execute({ page: 1, limit: 10 } as any);
    expect(prisma.tourPlan.findMany).toHaveBeenCalled();
    expect(prisma.tourPlan.count).toHaveBeenCalled();
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should filter by status', async () => {
    prisma.tourPlan.findMany.mockResolvedValue([]);
    prisma.tourPlan.count.mockResolvedValue(0);
    const handler = new GetTourPlanListHandler(prisma);
    await handler.execute({ page: 1, limit: 10, status: 'APPROVED' } as any);
    expect(prisma.tourPlan.findMany.mock.calls[0][0].where.status).toBe('APPROVED');
  });

  it('should filter by salesPersonId', async () => {
    prisma.tourPlan.findMany.mockResolvedValue([]);
    prisma.tourPlan.count.mockResolvedValue(0);
    const handler = new GetTourPlanListHandler(prisma);
    await handler.execute({ page: 1, limit: 10, salesPersonId: 'user-2' } as any);
    expect(prisma.tourPlan.findMany.mock.calls[0][0].where.salesPersonId).toBe('user-2');
  });

  // ─── GetTourPlanStatsHandler ──────────────────────────────────────────────

  it('should return tour plan stats with visit completion rate', async () => {
    prisma.tourPlan.count.mockResolvedValue(5);
    prisma.tourPlan.groupBy.mockResolvedValue([
      { status: 'COMPLETED', _count: 3 },
      { status: 'DRAFT', _count: 2 },
    ]);
    prisma.tourPlanVisit.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(7);
    const handler = new GetTourPlanStatsHandler(prisma);
    const result = await handler.execute({ userId: 'user-1' } as any);
    expect(result.total).toBe(5);
    expect(result.byStatus).toBeDefined();
  });
});
