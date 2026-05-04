import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SoftDeleteUserHandler } from '../application/commands/soft-delete-user/soft-delete-user.handler';
import { SoftDeleteUserCommand } from '../application/commands/soft-delete-user/soft-delete-user.command';
import { RestoreUserHandler } from '../application/commands/restore-user/restore-user.handler';
import { RestoreUserCommand } from '../application/commands/restore-user/restore-user.command';
import { PermanentDeleteUserHandler } from '../application/commands/permanent-delete-user/permanent-delete-user.handler';
import { PermanentDeleteUserCommand } from '../application/commands/permanent-delete-user/permanent-delete-user.command';

const activeUser = { id: 'u-1', tenantId: 't-1', isDeleted: false, deletedAt: null, deletedById: null };
const deletedUser = { ...activeUser, isDeleted: true, deletedAt: new Date(), deletedById: 'admin-1' };

function makePrisma(userFindResult: any) {
  return {
    identity: {
      user: {
        findUnique: jest.fn().mockResolvedValue(userFindResult),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
      },
    },
  };
}

// ─── SoftDeleteUserHandler ───────────────────────────────────────────────────

describe('SoftDeleteUserHandler', () => {
  it('should soft-delete an active user', async () => {
    const prisma = makePrisma(activeUser);
    const handler = new SoftDeleteUserHandler(prisma as any);
    await handler.execute(new SoftDeleteUserCommand('u-1', 'admin-1'));

    expect(prisma.identity.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'u-1' },
        data: expect.objectContaining({ isDeleted: true, deletedById: 'admin-1' }),
      }),
    );
  });

  it('should throw NotFoundException when user does not exist', async () => {
    const prisma = makePrisma(null);
    const handler = new SoftDeleteUserHandler(prisma as any);
    await expect(handler.execute(new SoftDeleteUserCommand('u-999', 'admin-1')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when user is already soft-deleted', async () => {
    const prisma = makePrisma(deletedUser);
    const handler = new SoftDeleteUserHandler(prisma as any);
    await expect(handler.execute(new SoftDeleteUserCommand('u-1', 'admin-1')))
      .rejects.toThrow('User is already deleted');
    expect(prisma.identity.user.update).not.toHaveBeenCalled();
  });
});

// ─── RestoreUserHandler ───────────────────────────────────────────────────────

describe('RestoreUserHandler', () => {
  it('should restore a soft-deleted user', async () => {
    const prisma = makePrisma(deletedUser);
    const handler = new RestoreUserHandler(prisma as any);
    await handler.execute(new RestoreUserCommand('u-1'));

    expect(prisma.identity.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'u-1' },
        data: expect.objectContaining({ isDeleted: false, deletedAt: null, deletedById: null }),
      }),
    );
  });

  it('should throw NotFoundException when user does not exist', async () => {
    const prisma = makePrisma(null);
    const handler = new RestoreUserHandler(prisma as any);
    await expect(handler.execute(new RestoreUserCommand('u-999')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when user is not deleted (nothing to restore)', async () => {
    const prisma = makePrisma(activeUser);
    const handler = new RestoreUserHandler(prisma as any);
    await expect(handler.execute(new RestoreUserCommand('u-1')))
      .rejects.toThrow('User is not deleted');
    expect(prisma.identity.user.update).not.toHaveBeenCalled();
  });
});

// ─── PermanentDeleteUserHandler ───────────────────────────────────────────────

describe('PermanentDeleteUserHandler', () => {
  it('should permanently delete a soft-deleted user', async () => {
    const prisma = makePrisma(deletedUser);
    const handler = new PermanentDeleteUserHandler(prisma as any);
    await handler.execute(new PermanentDeleteUserCommand('u-1'));

    expect(prisma.identity.user.delete).toHaveBeenCalledWith({ where: { id: 'u-1' } });
  });

  it('should throw NotFoundException when user does not exist', async () => {
    const prisma = makePrisma(null);
    const handler = new PermanentDeleteUserHandler(prisma as any);
    await expect(handler.execute(new PermanentDeleteUserCommand('u-999')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when user is not soft-deleted first', async () => {
    const prisma = makePrisma(activeUser);
    const handler = new PermanentDeleteUserHandler(prisma as any);
    await expect(handler.execute(new PermanentDeleteUserCommand('u-1')))
      .rejects.toThrow(BadRequestException);
    expect(prisma.identity.user.delete).not.toHaveBeenCalled();
  });

  it('should enforce two-step deletion — active user cannot be permanently deleted', async () => {
    const prisma = makePrisma(activeUser);
    const handler = new PermanentDeleteUserHandler(prisma as any);
    await expect(handler.execute(new PermanentDeleteUserCommand('u-1')))
      .rejects.toThrow('User must be soft-deleted before permanent deletion');
  });
});
