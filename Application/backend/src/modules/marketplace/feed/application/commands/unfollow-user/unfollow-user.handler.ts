import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { UnfollowUserCommand } from './unfollow-user.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@CommandHandler(UnfollowUserCommand)
@Injectable()
export class UnfollowUserHandler implements ICommandHandler<UnfollowUserCommand> {
  private readonly logger = new Logger(UnfollowUserHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(command: UnfollowUserCommand): Promise<{ success: boolean }> {
    const { followerId, followingId } = command;

    const existing = await this.mktPrisma.client.mktFollow.findFirst({
      where: { followerId, followingId },
    });

    if (!existing) {
      throw new NotFoundException('Follow relationship not found');
    }

    await this.mktPrisma.client.mktFollow.delete({
      where: { id: existing.id },
    });

    this.logger.log(`User ${followerId} unfollowed ${followingId}`);
    return { success: true };
  }
}
