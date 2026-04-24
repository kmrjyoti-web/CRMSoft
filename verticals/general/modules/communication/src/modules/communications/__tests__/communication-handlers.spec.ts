// @ts-nocheck
import { NotFoundException } from '@nestjs/common';

// ─── Shared fixtures ─────────────────────────────────────────────────────────
const makeCommunicationEntity = (overrides: any = {}) => ({
  id: 'comm-1',
  type: { value: 'PHONE', isEmail: () => false, isPhone: () => true },
  value: '+91-9876543210',
  priorityType: { value: 'PRIMARY' },
  isPrimary: false,
  isVerified: false,
  contactId: 'contact-1',
  rawContactId: undefined,
  organizationId: undefined,
  leadId: undefined,
  commit: jest.fn(),
  ...overrides,
});

const makePrisma = () => {
  const p: any = {
    communication: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
  };
  p.working = p;
  return p;
};

const makeRepo = (entity: any = null) => ({
  findById: jest.fn().mockResolvedValue(entity ?? makeCommunicationEntity()),
  save: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
});

const makePublisher = () => ({
  mergeObjectContext: jest.fn((e: any) => {
    if (!e.commit) e.commit = jest.fn();
    return e;
  }),
});

// ─── Imports ─────────────────────────────────────────────────────────────────
import { AddCommunicationHandler } from '../application/commands/add-communication/add-communication.handler';
import { AddCommunicationCommand } from '../application/commands/add-communication/add-communication.command';
import { DeleteCommunicationHandler } from '../application/commands/delete-communication/delete-communication.handler';
import { DeleteCommunicationCommand } from '../application/commands/delete-communication/delete-communication.command';
import { LinkToEntityHandler } from '../application/commands/link-to-entity/link-to-entity.handler';
import { LinkToEntityCommand } from '../application/commands/link-to-entity/link-to-entity.command';
import { MarkVerifiedHandler } from '../application/commands/mark-verified/mark-verified.handler';
import { MarkVerifiedCommand } from '../application/commands/mark-verified/mark-verified.command';
import { SetPrimaryHandler } from '../application/commands/set-primary/set-primary.handler';
import { SetPrimaryCommunicationCommand } from '../application/commands/set-primary/set-primary.command';
import { UpdateCommunicationHandler } from '../application/commands/update-communication/update-communication.handler';
import { UpdateCommunicationCommand } from '../application/commands/update-communication/update-communication.command';
import { GetCommunicationByIdHandler } from '../application/queries/get-communication-by-id/get-communication-by-id.handler';
import { GetCommunicationByIdQuery } from '../application/queries/get-communication-by-id/get-communication-by-id.query';
import { GetCommunicationsByEntityHandler } from '../application/queries/get-communications-by-entity/get-communications-by-entity.handler';
import { GetCommunicationsByEntityQuery } from '../application/queries/get-communications-by-entity/get-communications-by-entity.query';

// ═══════════════════════════════════════════════════════════════════════════════
// AddCommunicationHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('AddCommunicationHandler', () => {
  let handler: AddCommunicationHandler;
  let repo: any;
  let publisher: any;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    repo = makeRepo();
    publisher = makePublisher();
    handler = new AddCommunicationHandler(repo, publisher, prisma);
  });

  it('should add phone communication and return UUID', async () => {
    const id = await handler.execute(
      new AddCommunicationCommand('PHONE', '+91-9876543210', 'PRIMARY', false, undefined, undefined, 'contact-1'),
    );
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should add email communication', async () => {
    const id = await handler.execute(
      new AddCommunicationCommand('EMAIL', 'test@example.com', 'WORK', false, 'Work', undefined, 'contact-1'),
    );
    expect(id).toBeDefined();
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should unset existing primary when isPrimary=true', async () => {
    await handler.execute(
      new AddCommunicationCommand('PHONE', '+91-9876543210', 'PRIMARY', true, undefined, undefined, 'contact-1'),
    );
    expect(prisma.communication.updateMany).toHaveBeenCalledTimes(1);
  });

  it('should not call updateMany when isPrimary=false', async () => {
    await handler.execute(
      new AddCommunicationCommand('PHONE', '+91-9876543210', 'WORK', false, undefined, undefined, 'contact-1'),
    );
    expect(prisma.communication.updateMany).not.toHaveBeenCalled();
  });

  it('should throw when no entity link provided', async () => {
    await expect(handler.execute(
      new AddCommunicationCommand('EMAIL', 'test@example.com'),
    )).rejects.toThrow('At least one entity link is required');
  });

  it('should propagate repo.save error', async () => {
    repo.save.mockRejectedValue(new Error('save failed'));
    await expect(handler.execute(
      new AddCommunicationCommand('PHONE', '+91-9876543210', undefined, false, undefined, undefined, 'c-1'),
    )).rejects.toThrow('save failed');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DeleteCommunicationHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('DeleteCommunicationHandler', () => {
  let handler: DeleteCommunicationHandler;
  let repo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = makeRepo();
    handler = new DeleteCommunicationHandler(repo);
  });

  it('should delete communication', async () => {
    await handler.execute(new DeleteCommunicationCommand('comm-1'));
    expect(repo.delete).toHaveBeenCalledWith('comm-1');
  });

  it('should throw NotFoundException when communication not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new DeleteCommunicationCommand('missing'))).rejects.toThrow(NotFoundException);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// LinkToEntityHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('LinkToEntityHandler', () => {
  let handler: LinkToEntityHandler;
  let repo: any;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    repo = makeRepo();
    handler = new LinkToEntityHandler(repo, prisma);
  });

  it('should link communication to a contact', async () => {
    prisma.communication.update.mockResolvedValue({});
    await handler.execute(new LinkToEntityCommand('comm-1', 'contact', 'contact-2'));
    expect(prisma.communication.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { contactId: 'contact-2' } }),
    );
  });

  it('should link communication to an organization', async () => {
    prisma.communication.update.mockResolvedValue({});
    await handler.execute(new LinkToEntityCommand('comm-1', 'organization', 'org-1'));
    expect(prisma.communication.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { organizationId: 'org-1' } }),
    );
  });

  it('should link communication to a lead', async () => {
    prisma.communication.update.mockResolvedValue({});
    await handler.execute(new LinkToEntityCommand('comm-1', 'lead', 'lead-1'));
    expect(prisma.communication.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { leadId: 'lead-1' } }),
    );
  });

  it('should throw NotFoundException when communication not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new LinkToEntityCommand('missing', 'contact', 'c1'))).rejects.toThrow(NotFoundException);
  });

  it('should throw for invalid entity type', async () => {
    prisma.communication.update.mockResolvedValue({});
    await expect(handler.execute(new LinkToEntityCommand('comm-1', 'invalid' as any, 'x'))).rejects.toThrow('Invalid entity type');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MarkVerifiedHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('MarkVerifiedHandler', () => {
  let handler: MarkVerifiedHandler;
  let repo: any;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    repo = makeRepo(makeCommunicationEntity({ isVerified: false }));
    handler = new MarkVerifiedHandler(repo, prisma);
  });

  it('should mark communication as verified', async () => {
    prisma.communication.update.mockResolvedValue({});
    await handler.execute(new MarkVerifiedCommand('comm-1'));
    expect(prisma.communication.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isVerified: true } }),
    );
  });

  it('should skip update if already verified', async () => {
    repo.findById.mockResolvedValue(makeCommunicationEntity({ isVerified: true }));
    await handler.execute(new MarkVerifiedCommand('comm-1'));
    expect(prisma.communication.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new MarkVerifiedCommand('missing'))).rejects.toThrow(NotFoundException);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SetPrimaryHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('SetPrimaryHandler', () => {
  let handler: SetPrimaryHandler;
  let repo: any;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    repo = makeRepo(makeCommunicationEntity({ isPrimary: false, contactId: 'c-1' }));
    handler = new SetPrimaryHandler(repo, prisma);
  });

  it('should set communication as primary', async () => {
    prisma.communication.updateMany.mockResolvedValue({ count: 1 });
    prisma.communication.update.mockResolvedValue({});
    await handler.execute(new SetPrimaryCommunicationCommand('comm-1'));
    expect(prisma.communication.updateMany).toHaveBeenCalled();
    expect(prisma.communication.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isPrimary: true } }),
    );
  });

  it('should skip if already primary', async () => {
    repo.findById.mockResolvedValue(makeCommunicationEntity({ isPrimary: true }));
    await handler.execute(new SetPrimaryCommunicationCommand('comm-1'));
    expect(prisma.communication.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new SetPrimaryCommunicationCommand('missing'))).rejects.toThrow(NotFoundException);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// UpdateCommunicationHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('UpdateCommunicationHandler', () => {
  let handler: UpdateCommunicationHandler;
  let repo: any;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    repo = makeRepo();
    handler = new UpdateCommunicationHandler(repo, prisma);
  });

  it('should update communication value', async () => {
    prisma.communication.update.mockResolvedValue({});
    await handler.execute(new UpdateCommunicationCommand('comm-1', { value: '+91-1234567890' }));
    expect(prisma.communication.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { value: '+91-1234567890' } }),
    );
  });

  it('should throw NotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new UpdateCommunicationCommand('missing', { value: 'x' }))).rejects.toThrow(NotFoundException);
  });

  it('should throw when no fields to update', async () => {
    await expect(handler.execute(new UpdateCommunicationCommand('comm-1', {}))).rejects.toThrow('No fields provided to update');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetCommunicationByIdHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetCommunicationByIdHandler', () => {
  let handler: GetCommunicationByIdHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new GetCommunicationByIdHandler(prisma);
  });

  it('should return communication by id', async () => {
    const comm = { id: 'comm-1', type: 'PHONE', value: '+91-9876543210' };
    prisma.communication.findUnique.mockResolvedValue(comm);
    const result = await handler.execute(new GetCommunicationByIdQuery('comm-1'));
    expect(result).toEqual(comm);
  });

  it('should throw NotFoundException when not found', async () => {
    prisma.communication.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new GetCommunicationByIdQuery('missing'))).rejects.toThrow(NotFoundException);
  });

  it('should propagate DB error', async () => {
    prisma.communication.findUnique.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(new GetCommunicationByIdQuery('comm-1'))).rejects.toThrow('DB error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetCommunicationsByEntityHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetCommunicationsByEntityHandler', () => {
  let handler: GetCommunicationsByEntityHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new GetCommunicationsByEntityHandler(prisma);
  });

  it('should query by contactId when entityType=contact', async () => {
    prisma.communication.findMany.mockResolvedValue([]);
    await handler.execute(new GetCommunicationsByEntityQuery('contact', 'contact-1'));
    expect(prisma.communication.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ contactId: 'contact-1' }) }),
    );
  });

  it('should query by leadId when entityType=lead', async () => {
    prisma.communication.findMany.mockResolvedValue([]);
    await handler.execute(new GetCommunicationsByEntityQuery('lead', 'lead-1'));
    expect(prisma.communication.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ leadId: 'lead-1' }) }),
    );
  });

  it('should return list of communications', async () => {
    const comms = [{ id: 'comm-1', type: 'PHONE', value: '+91-9876543210' }];
    prisma.communication.findMany.mockResolvedValue(comms);
    const result = await handler.execute(new GetCommunicationsByEntityQuery('contact', 'contact-1'));
    expect(result).toEqual(comms);
  });

  it('should propagate DB error', async () => {
    prisma.communication.findMany.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(new GetCommunicationsByEntityQuery('contact', 'c-1'))).rejects.toThrow('DB error');
  });
});
