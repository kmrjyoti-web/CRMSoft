import { CreateCommentHandler } from '../application/commands/create-comment/create-comment.handler';
import { UpdateCommentHandler } from '../application/commands/update-comment/update-comment.handler';
import { GetCommentsByEntityHandler } from '../application/queries/get-comments-by-entity/get-comments-by-entity.handler';
import { CommentController } from '../presentation/comment.controller';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockComment = {
  id: 'c-1',
  tenantId: 't-1',
  entityType: 'LEAD',
  entityId: 'lead-1',
  content: 'This is a test comment',
  authorId: 'user-1',
  isEdited: false,
  isActive: true,
  createdAt: new Date('2026-01-01'),
  parentId: null,
  visibility: 'PUBLIC',
  author: { id: 'user-1', firstName: 'Raj', lastName: 'Patel' },
  replies: [],
};

const mockVisibilityService = {
  validateCanMarkPrivate: jest.fn(),
  buildVisibilityFilter: jest.fn().mockResolvedValue({ isActive: true }),
};

// ── CreateCommentHandler ────────────────────────────────────────────────────

describe('CreateCommentHandler', () => {
  let prisma: any;
  let handler: CreateCommentHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = {
      comment: { create: jest.fn().mockResolvedValue(mockComment) },
    };
    prisma.working = prisma;
    handler = new CreateCommentHandler(prisma, mockVisibilityService as any);
  });

  it('creates a public comment', async () => {
    const result = await handler.execute({
      entityType: 'LEAD', entityId: 'lead-1', content: 'Hello',
      authorId: 'user-1', authorRoleLevel: 5, tenantId: 't-1',
      visibility: 'PUBLIC', parentId: undefined, taskId: undefined,
      mentionedUserIds: [], attachments: [],
    } as any);
    expect(prisma.comment.create).toHaveBeenCalled();
    expect(result.id).toBe('c-1');
  });

  it('validates RBAC before creating private comment', async () => {
    mockVisibilityService.validateCanMarkPrivate.mockImplementationOnce(() => { throw new ForbiddenException(); });
    await expect(
      handler.execute({ entityType: 'LEAD', entityId: 'lead-1', content: 'Secret', authorId: 'user-1', authorRoleLevel: 5, tenantId: 't-1', visibility: 'PRIVATE' } as any),
    ).rejects.toThrow(ForbiddenException);
  });
});

// ── UpdateCommentHandler ────────────────────────────────────────────────────

describe('UpdateCommentHandler', () => {
  let prisma: any;
  let handler: UpdateCommentHandler;

  beforeEach(() => {
    prisma = {
      comment: {
        findUnique: jest.fn().mockResolvedValue({ ...mockComment, createdAt: new Date() }),
        update: jest.fn().mockResolvedValue({ ...mockComment, isEdited: true }),
      },
      taskLogicConfig: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    prisma.working = prisma;
    handler = new UpdateCommentHandler(prisma);
  });

  it('allows author to update comment within edit window', async () => {
    const result = await handler.execute({ commentId: 'c-1', userId: 'user-1', content: 'Updated', roleLevel: 5 } as any);
    expect(result.isEdited).toBe(true);
  });

  it('throws NotFoundException when comment not found', async () => {
    prisma.comment.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ commentId: 'c-x', userId: 'user-1', content: 'x', roleLevel: 5 } as any)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when non-author tries to update', async () => {
    await expect(handler.execute({ commentId: 'c-1', userId: 'user-99', content: 'Hack', roleLevel: 5 } as any)).rejects.toThrow(ForbiddenException);
  });

  it('allows admin to bypass edit window', async () => {
    prisma.comment.findUnique.mockResolvedValue({ ...mockComment, createdAt: new Date('2020-01-01'), authorId: 'admin-1' });
    await expect(handler.execute({ commentId: 'c-1', userId: 'admin-1', content: 'Admin edit', roleLevel: 0 } as any)).resolves.toBeDefined();
  });
});

// ── GetCommentsByEntityHandler ──────────────────────────────────────────────

describe('GetCommentsByEntityHandler', () => {
  let prisma: any;
  let handler: GetCommentsByEntityHandler;

  beforeEach(() => {
    prisma = {
      comment: {
        findMany: jest.fn().mockResolvedValue([mockComment]),
        count: jest.fn().mockResolvedValue(1),
      },
    };
    prisma.working = prisma;
    handler = new GetCommentsByEntityHandler(prisma, mockVisibilityService as any);
  });

  it('returns paginated comments for entity', async () => {
    const result = await handler.execute({ entityType: 'LEAD', entityId: 'lead-1', userId: 'user-1', roleLevel: 5, page: 1, limit: 20 } as any);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
  });
});

// ── CommentController ───────────────────────────────────────────────────────

describe('CommentController', () => {
  let commandBus: any;
  let queryBus: any;
  let controller: CommentController;
  const user = { id: 'user-1', roleLevel: 5, tenantId: 't-1' };

  beforeEach(() => {
    commandBus = { execute: jest.fn().mockResolvedValue(mockComment) };
    queryBus = { execute: jest.fn().mockResolvedValue({ data: [mockComment], total: 1, page: 1 }) };
    controller = new CommentController(commandBus, queryBus);
  });

  it('creates comment via commandBus', async () => {
    const result = await controller.create({ entityType: 'LEAD', entityId: 'lead-1', content: 'Hello' } as any, user);
    expect(commandBus.execute).toHaveBeenCalled();
    expect(result.data).toEqual(mockComment);
  });

  it('fetches comments by entity via queryBus', async () => {
    const result = await controller.getByEntity('LEAD', 'lead-1', user, 1, 20);
    expect(queryBus.execute).toHaveBeenCalled();
    expect(result.data.data).toHaveLength(1);
  });

  it('updates comment via commandBus', async () => {
    await controller.update('c-1', 'Updated content', user);
    expect(commandBus.execute).toHaveBeenCalled();
  });

  it('deletes comment via commandBus', async () => {
    await controller.delete('c-1', user);
    expect(commandBus.execute).toHaveBeenCalled();
  });
});
