import { CreateTourPlanHandler } from '../application/commands/create-tour-plan/create-tour-plan.handler';
import { SubmitTourPlanHandler } from '../application/commands/submit-tour-plan/submit-tour-plan.handler';
import { ApproveTourPlanHandler } from '../application/commands/approve-tour-plan/approve-tour-plan.handler';
import { CheckInVisitHandler } from '../application/commands/check-in-visit/check-in-visit.handler';
import { GetTourPlanByIdHandler } from '../application/queries/get-tour-plan-by-id/get-tour-plan-by-id.handler';
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
      },
      tourPlanVisit: {
        findUnique: jest.fn().mockResolvedValue({ id: 'v-1', tourPlan: mockTourPlan, lead: { id: 'lead-1' }, actualArrival: null }),
        update: jest.fn().mockResolvedValue({ id: 'v-1', actualArrival: new Date() }),
      },
      tourPlanPhoto: { create: jest.fn().mockResolvedValue({}) },
      lead: { findUnique: jest.fn().mockResolvedValue({ id: 'lead-1', organization: null }) },
      reminder: { create: jest.fn().mockResolvedValue({}) },
      calendarEvent: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
      },
    };
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
});
