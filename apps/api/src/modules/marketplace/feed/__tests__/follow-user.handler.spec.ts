import { ConflictException } from '@nestjs/common';
import { FollowUserHandler } from '../application/commands/follow-user/follow-user.handler';
import { FollowUserCommand } from '../application/commands/follow-user/follow-user.command';

describe('FollowUserHandler', () => {
  let handler: FollowUserHandler;
  let mockMktPrisma: any;

  beforeEach(() => {
    mockMktPrisma = {
      client: {
        mktFollow: {
          create: jest.fn(),
        },
      },
    };
    handler = new FollowUserHandler(mockMktPrisma);
  });

  it('creates a follow record and returns success', async () => {
    mockMktPrisma.client.mktFollow.create.mockResolvedValue({
      id: 'follow-1',
      followerId: 'user-1',
      followingId: 'user-2',
      tenantId: 'tenant-1',
      createdAt: new Date(),
    });

    const command = new FollowUserCommand('tenant-1', 'user-1', 'user-2');
    const result = await handler.execute(command);

    expect(result).toEqual({ success: true });
    expect(mockMktPrisma.client.mktFollow.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          followerId: 'user-1',
          followingId: 'user-2',
        }),
      }),
    );
  });

  it('throws ConflictException when trying to follow yourself', async () => {
    const command = new FollowUserCommand('tenant-1', 'user-1', 'user-1');
    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
    await expect(handler.execute(command)).rejects.toThrow('Cannot follow yourself');
    expect(mockMktPrisma.client.mktFollow.create).not.toHaveBeenCalled();
  });

  it('throws ConflictException on duplicate follow (unique constraint violation)', async () => {
    mockMktPrisma.client.mktFollow.create.mockRejectedValue(
      new Error('Unique constraint failed on the fields: (`followerId`,`followingId`)'),
    );

    const command = new FollowUserCommand('tenant-1', 'user-1', 'user-2');
    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
    await expect(handler.execute(command)).rejects.toThrow('Already following this user');
  });

  it('includes a UUID id in the created record', async () => {
    mockMktPrisma.client.mktFollow.create.mockResolvedValue({});

    const command = new FollowUserCommand('tenant-1', 'user-1', 'user-2');
    await handler.execute(command);

    const callArgs = mockMktPrisma.client.mktFollow.create.mock.calls[0][0];
    expect(callArgs.data.id).toBeDefined();
    expect(typeof callArgs.data.id).toBe('string');
    expect(callArgs.data.id.length).toBeGreaterThan(0);
  });
});
