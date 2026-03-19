import { CreateFollowUpHandler } from '../application/commands/create-follow-up/create-follow-up.handler';
import { CompleteFollowUpHandler } from '../application/commands/complete-follow-up/complete-follow-up.handler';
import { SnoozeFollowUpHandler } from '../application/commands/snooze-follow-up/snooze-follow-up.handler';
import { ReassignFollowUpHandler } from '../application/commands/reassign-follow-up/reassign-follow-up.handler';
import { OverdueCheckerService } from '../application/services/overdue-checker.service';
import { NotFoundException } from '@nestjs/common';

describe('Follow-up Handlers', () => {
  let prisma: any;
  const mockFollowUp = {
    id: 'fu-1', title: 'Call client', dueDate: new Date(), assignedToId: 'user-1',
    createdById: 'user-2', isOverdue: false, isActive: true,
    assignedTo: { id: 'user-1', firstName: 'Raj', lastName: 'Patel' },
    createdBy: { id: 'user-2', firstName: 'Admin', lastName: 'User' },
  };

  beforeEach(() => {
    prisma = {
      followUp: {
        create: jest.fn().mockResolvedValue(mockFollowUp),
        findUnique: jest.fn().mockResolvedValue(mockFollowUp),
        update: jest.fn().mockResolvedValue({ ...mockFollowUp, completedAt: new Date() }),
        updateMany: jest.fn().mockResolvedValue({ count: 3 }),
      },
      reminder: { create: jest.fn().mockResolvedValue({}) },
    };
(prisma as any).working = prisma;
  });

  it('should create a follow-up with auto-reminder', async () => {
    const handler = new CreateFollowUpHandler(prisma);
    const result = await handler.execute({
      title: 'Call client', dueDate: new Date(Date.now() + 86400000),
      assignedToId: 'user-1', createdById: 'user-2', entityType: 'LEAD', entityId: 'lead-1',
    } as any);
    expect(prisma.followUp.create).toHaveBeenCalled();
    expect(result.id).toBe('fu-1');
  });

  it('should complete a follow-up', async () => {
    const handler = new CompleteFollowUpHandler(prisma);
    await handler.execute({ id: 'fu-1', userId: 'user-1' });
    expect(prisma.followUp.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ completedAt: expect.any(Date), isOverdue: false }) }),
    );
  });

  it('should snooze a follow-up', async () => {
    prisma.followUp.update.mockResolvedValue({ ...mockFollowUp, snoozedUntil: new Date() });
    const handler = new SnoozeFollowUpHandler(prisma);
    const snoozedUntil = new Date(Date.now() + 86400000);
    await handler.execute({ id: 'fu-1', userId: 'user-1', snoozedUntil });
    expect(prisma.followUp.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { snoozedUntil, isOverdue: false } }),
    );
  });

  it('should reassign a follow-up', async () => {
    prisma.followUp.update.mockResolvedValue({ ...mockFollowUp, assignedToId: 'user-3' });
    const handler = new ReassignFollowUpHandler(prisma);
    await handler.execute({ id: 'fu-1', userId: 'user-1', newAssigneeId: 'user-3' });
    expect(prisma.followUp.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { assignedToId: 'user-3' } }),
    );
  });

  it('should throw NotFoundException for non-existent follow-up', async () => {
    prisma.followUp.findUnique.mockResolvedValue(null);
    const handler = new CompleteFollowUpHandler(prisma);
    await expect(handler.execute({ id: 'bad', userId: 'user-1' })).rejects.toThrow(NotFoundException);
  });

  it('should mark overdue follow-ups via CRON', async () => {
    const service = new OverdueCheckerService(prisma);
    await service.checkOverdueFollowUps();
    expect(prisma.followUp.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isOverdue: true } }),
    );
  });
});
