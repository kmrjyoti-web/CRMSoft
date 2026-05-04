import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RestoreContactHandler } from '../../application/commands/restore-contact/restore-contact.handler';
import { RestoreContactCommand } from '../../application/commands/restore-contact/restore-contact.command';
import { SoftDeleteContactHandler } from '../../application/commands/soft-delete-contact/soft-delete-contact.handler';
import { SoftDeleteContactCommand } from '../../application/commands/soft-delete-contact/soft-delete-contact.command';
import { PermanentDeleteContactHandler } from '../../application/commands/permanent-delete-contact/permanent-delete-contact.handler';
import { PermanentDeleteContactCommand } from '../../application/commands/permanent-delete-contact/permanent-delete-contact.command';
import { GetContactsDashboardHandler } from '../../application/queries/get-contacts-dashboard/get-contacts-dashboard.handler';
import { GetContactsDashboardQuery } from '../../application/queries/get-contacts-dashboard/get-contacts-dashboard.query';

// ─── Contact entity stub ─────────────────────────────────────────────────────

function makeContactEntity(isDeleted = false) {
  return {
    id: 'c-1',
    isDeleted,
    restore: jest.fn(),
    softDelete: jest.fn(),
    commit: jest.fn(),
  };
}

function makePublisher(entity: any) {
  return {
    mergeObjectContext: jest.fn(() => {
      entity.commit = jest.fn();
      return entity;
    }),
  };
}

// ─── RestoreContactHandler ───────────────────────────────────────────────────

describe('RestoreContactHandler', () => {
  it('should restore a soft-deleted contact', async () => {
    const contact = makeContactEntity(true);
    const repo = { findById: jest.fn().mockResolvedValue(contact), save: jest.fn() };
    const publisher = makePublisher(contact);

    const handler = new RestoreContactHandler(repo as any, publisher as any);
    await handler.execute(new RestoreContactCommand('c-1'));

    expect(contact.restore).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledWith(contact);
    expect(contact.commit).toHaveBeenCalled();
  });

  it('should throw NotFoundException when contact not found', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) };
    const publisher = { mergeObjectContext: jest.fn() };

    const handler = new RestoreContactHandler(repo as any, publisher as any);
    await expect(handler.execute(new RestoreContactCommand('c-999')))
      .rejects.toThrow(NotFoundException);
    expect(repo.findById).toHaveBeenCalledWith('c-999');
  });
});

// ─── SoftDeleteContactHandler ─────────────────────────────────────────────────

describe('SoftDeleteContactHandler', () => {
  it('should soft-delete a contact', async () => {
    const contact = makeContactEntity(false);
    const repo = { findById: jest.fn().mockResolvedValue(contact), save: jest.fn() };
    const publisher = makePublisher(contact);

    const handler = new SoftDeleteContactHandler(repo as any, publisher as any);
    await handler.execute(new SoftDeleteContactCommand('c-1', 'admin-1'));

    expect(contact.softDelete).toHaveBeenCalledWith('admin-1');
    expect(repo.save).toHaveBeenCalledWith(contact);
    expect(contact.commit).toHaveBeenCalled();
  });

  it('should throw NotFoundException when contact not found', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) };
    const publisher = { mergeObjectContext: jest.fn() };

    const handler = new SoftDeleteContactHandler(repo as any, publisher as any);
    await expect(handler.execute(new SoftDeleteContactCommand('c-999', 'admin-1')))
      .rejects.toThrow(NotFoundException);
  });

  it('should enforce tenant isolation — find called with contactId', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) };
    const publisher = { mergeObjectContext: jest.fn() };

    const handler = new SoftDeleteContactHandler(repo as any, publisher as any);
    await handler.execute(new SoftDeleteContactCommand('c-1', 'admin-1')).catch(() => {});
    expect(repo.findById).toHaveBeenCalledWith('c-1');
  });
});

// ─── PermanentDeleteContactHandler ───────────────────────────────────────────

describe('PermanentDeleteContactHandler', () => {
  it('should permanently delete a soft-deleted contact', async () => {
    const contact = makeContactEntity(true);
    const repo = { findById: jest.fn().mockResolvedValue(contact), delete: jest.fn() };

    const handler = new PermanentDeleteContactHandler(repo as any);
    await handler.execute(new PermanentDeleteContactCommand('c-1'));

    expect(repo.delete).toHaveBeenCalledWith('c-1');
  });

  it('should throw NotFoundException when contact not found', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null), delete: jest.fn() };

    const handler = new PermanentDeleteContactHandler(repo as any);
    await expect(handler.execute(new PermanentDeleteContactCommand('c-999')))
      .rejects.toThrow(NotFoundException);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when contact is not soft-deleted first', async () => {
    const contact = makeContactEntity(false); // active — not deleted
    const repo = { findById: jest.fn().mockResolvedValue(contact), delete: jest.fn() };

    const handler = new PermanentDeleteContactHandler(repo as any);
    await expect(handler.execute(new PermanentDeleteContactCommand('c-1')))
      .rejects.toThrow(BadRequestException);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('should enforce two-step deletion guard message', async () => {
    const contact = makeContactEntity(false);
    const repo = { findById: jest.fn().mockResolvedValue(contact), delete: jest.fn() };

    const handler = new PermanentDeleteContactHandler(repo as any);
    await expect(handler.execute(new PermanentDeleteContactCommand('c-1')))
      .rejects.toThrow('Contact must be soft-deleted before permanent deletion');
  });
});

// ─── GetContactsDashboardHandler ─────────────────────────────────────────────

describe('GetContactsDashboardHandler', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = {
      working: {
        contact: {
          count: jest.fn().mockResolvedValue(10),
          findMany: jest.fn().mockResolvedValue([]),
          groupBy: jest.fn().mockResolvedValue([]),
        },
        organization: {
          count: jest.fn().mockResolvedValue(5),
          groupBy: jest.fn().mockResolvedValue([]),
        },
        rawContact: {
          groupBy: jest.fn().mockResolvedValue([]),
        },
      },
    };
  });

  it('should return full dashboard shape', async () => {
    const handler = new GetContactsDashboardHandler(prisma as any);
    const result = await handler.execute(
      new GetContactsDashboardQuery('t-1'),
    );

    expect(result).toHaveProperty('stats');
    expect(result).toHaveProperty('industryWise');
    expect(result).toHaveProperty('sourceWise');
    expect(result).toHaveProperty('verificationTrend');
    expect(result).toHaveProperty('departmentWise');
    expect(result).toHaveProperty('recentContacts');
  });

  it('should apply tenantId to all queries', async () => {
    const handler = new GetContactsDashboardHandler(prisma as any);
    await handler.execute(new GetContactsDashboardQuery('t-1'));

    expect(prisma.working.contact.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 't-1' }) }),
    );
  });

  it('should include all 8 stat fields', async () => {
    const handler = new GetContactsDashboardHandler(prisma as any);
    const result = await handler.execute(new GetContactsDashboardQuery('t-1'));

    const { stats } = result;
    expect(stats).toHaveProperty('totalContacts');
    expect(stats).toHaveProperty('activeContacts');
    expect(stats).toHaveProperty('inactiveContacts');
    expect(stats).toHaveProperty('verifiedContacts');
    expect(stats).toHaveProperty('notVerifiedContacts');
    expect(stats).toHaveProperty('totalOrganizations');
    expect(stats).toHaveProperty('verifiedOrganizations');
    expect(stats).toHaveProperty('totalCustomers');
  });

  it('should propagate errors from prisma', async () => {
    prisma.working.contact.count.mockRejectedValue(new Error('DB error'));
    const handler = new GetContactsDashboardHandler(prisma as any);
    await expect(handler.execute(new GetContactsDashboardQuery('t-1')))
      .rejects.toThrow('DB error');
  });
});
