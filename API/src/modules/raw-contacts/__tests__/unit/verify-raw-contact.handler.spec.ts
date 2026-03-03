import { NotFoundException } from '@nestjs/common';
import { VerifyRawContactHandler } from '../../application/commands/verify-raw-contact/verify-raw-contact.handler';
import { VerifyRawContactCommand } from '../../application/commands/verify-raw-contact/verify-raw-contact.command';
import { RawContactEntity } from '../../domain/entities/raw-contact.entity';

describe('VerifyRawContactHandler', () => {
  let handler: VerifyRawContactHandler;
  let repo: any;
  let publisher: any;
  let prisma: any;

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    prisma = {
      contact: { create: jest.fn() },
      communication: { updateMany: jest.fn() },
      rawContactFilter: { findMany: jest.fn().mockResolvedValue([]) },
      contactFilter: { createMany: jest.fn() },
      contactOrganization: { create: jest.fn() },
    };
    handler = new VerifyRawContactHandler(repo, publisher, prisma);
  });

  it('should verify RAW contact and create Contact', async () => {
    const rc = RawContactEntity.create('rc-1', {
      firstName: 'Vikram', lastName: 'Sharma', createdById: 'user-1',
    });
    repo.findById.mockResolvedValue(rc);

    const contactId = await handler.execute(new VerifyRawContactCommand('rc-1', 'verifier-1'));
    expect(contactId).toBeDefined();
    expect(contactId.length).toBe(36);
    expect(prisma.contact.create).toHaveBeenCalledTimes(1);
    expect(prisma.communication.updateMany).toHaveBeenCalledTimes(1);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should copy filters from raw_contact to contact', async () => {
    const rc = RawContactEntity.create('rc-1', {
      firstName: 'Test', lastName: 'User', createdById: 'user-1',
    });
    repo.findById.mockResolvedValue(rc);
    prisma.rawContactFilter.findMany.mockResolvedValue([
      { lookupValueId: 'lv-1' }, { lookupValueId: 'lv-2' },
    ]);

    await handler.execute(new VerifyRawContactCommand('rc-1', 'v-1'));
    expect(prisma.contactFilter.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ lookupValueId: 'lv-1' }),
        ]),
      }),
    );
  });

  it('should create ContactOrganization when org provided', async () => {
    const rc = RawContactEntity.create('rc-1', {
      firstName: 'Test', lastName: 'User', createdById: 'user-1',
    });
    repo.findById.mockResolvedValue(rc);

    await handler.execute(new VerifyRawContactCommand('rc-1', 'v-1', 'org-1', 'PRIMARY_CONTACT'));
    expect(prisma.contactOrganization.create).toHaveBeenCalledTimes(1);
    // Should also update primary comms with orgId
    expect(prisma.communication.updateMany).toHaveBeenCalledTimes(2);
  });

  it('should throw NotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new VerifyRawContactCommand('rc-999', 'v-1')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when already VERIFIED', async () => {
    const rc = RawContactEntity.fromPersistence({
      id: 'rc-1', firstName: 'T', lastName: 'U', status: 'VERIFIED',
      source: 'MANUAL', contactId: 'c-1', verifiedById: 'v-1',
      verifiedAt: new Date(), createdById: 'u-1',
      createdAt: new Date(), updatedAt: new Date(),
    });
    repo.findById.mockResolvedValue(rc);

    await expect(handler.execute(new VerifyRawContactCommand('rc-1', 'v-2')))
      .rejects.toThrow('Cannot verify');
  });
});
