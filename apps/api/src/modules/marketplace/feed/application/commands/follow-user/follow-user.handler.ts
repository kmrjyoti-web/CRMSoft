import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FollowUserCommand } from './follow-user.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@CommandHandler(FollowUserCommand)
@Injectable()
export class FollowUserHandler implements ICommandHandler<FollowUserCommand> {
  private readonly logger = new Logger(FollowUserHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(command: FollowUserCommand): Promise<{ success: boolean }> {
    const { tenantId, followerId, followingId } = command;
    if (followerId === followingId) {
      throw new ConflictException('Cannot follow yourself');
    }
    try {
      await this.mktPrisma.client.mktFollow.create({
        data: {
          id: randomUUID(),
          tenantId,
          followerId,
          followingId,
        },
      });
      this.logger.log(`User ${followerId} followed ${followingId}`);
      return { success: true };
    } catch {
      throw new ConflictException('Already following this user');
    }
  }
}
