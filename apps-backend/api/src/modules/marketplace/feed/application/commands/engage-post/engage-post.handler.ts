import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EngagePostCommand } from './engage-post.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

const COUNTER_FIELD_MAP: Record<string, string> = {
  LIKE: 'likeCount',
  UNLIKE: 'likeCount',
  SHARE: 'shareCount',
  SAVE: 'saveCount',
  UNSAVE: 'saveCount',
  VIEW: 'viewCount',
};

@CommandHandler(EngagePostCommand)
@Injectable()
export class EngagePostHandler implements ICommandHandler<EngagePostCommand> {
  private readonly logger = new Logger(EngagePostHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(command: EngagePostCommand): Promise<void> {
    const post = await this.mktPrisma.client.mktPost.findFirst({
      where: { id: command.postId, tenantId: command.tenantId, isDeleted: false },
    });

    if (!post) throw new NotFoundException(`Post ${command.postId} not found`);

    // Upsert engagement (unique constraint: postId + userId + action)
    const isDecrement = command.action === 'UNLIKE' || command.action === 'UNSAVE';
    const counterField = COUNTER_FIELD_MAP[command.action];

    await this.mktPrisma.client.$transaction(async (tx: any) => {
      try {
        await tx.mktPostEngagement.create({
          data: {
            id: randomUUID(),
            tenantId: command.tenantId,
            postId: command.postId,
            userId: command.userId,
            action: command.action as any,
            sharedTo: command.sharedTo,
            city: command.city,
            state: command.state,
            deviceType: command.deviceType,
          },
        });
      } catch (_e) {
        // Unique constraint — already engaged with this action, ignore
        this.logger.debug(`Duplicate engagement ignored: ${command.postId}/${command.userId}/${command.action}`);
        return;
      }

      if (counterField) {
        await tx.mktPost.update({
          where: { id: command.postId },
          data: { [counterField]: { [isDecrement ? 'decrement' : 'increment']: 1 } },
        });
      }
    });

    this.logger.log(`Post ${command.postId} engaged with ${command.action} by user ${command.userId}`);
  }
}
