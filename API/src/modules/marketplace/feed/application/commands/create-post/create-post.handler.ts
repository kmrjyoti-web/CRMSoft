import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreatePostCommand } from './create-post.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@CommandHandler(CreatePostCommand)
@Injectable()
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
  private readonly logger = new Logger(CreatePostHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(command: CreatePostCommand): Promise<string> {
    const id = randomUUID();

    const post = await this.mktPrisma.client.mktPost.create({
      data: {
        id,
        tenantId: command.tenantId,
        authorId: command.authorId,
        createdById: command.createdById,
        postType: command.postType as any,
        content: command.content,
        mediaUrls: command.mediaUrls ?? [],
        linkedListingId: command.linkedListingId,
        linkedOfferId: command.linkedOfferId,
        rating: command.rating,
        productId: command.productId,
        visibility: (command.visibility as any) ?? 'PUBLIC',
        visibilityConfig: command.visibilityConfig,
        publishAt: command.publishAt,
        expiresAt: command.expiresAt,
        hashtags: command.hashtags ?? [],
        mentions: command.mentions ?? [],
        pollConfig: command.pollConfig,
        status: command.publishAt && command.publishAt > new Date() ? 'SCHEDULED' : 'ACTIVE',
        publishedAt: (!command.publishAt || command.publishAt <= new Date()) ? new Date() : undefined,
      },
    });

    this.logger.log(`Post created: ${post.id} (type: ${post.postType}) by ${command.authorId}`);
    return post.id;
  }
}
