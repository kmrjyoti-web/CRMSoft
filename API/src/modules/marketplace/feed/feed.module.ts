import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FeedController } from './presentation/feed.controller';
import { MktPrismaService } from './infrastructure/mkt-prisma.service';
import { CreatePostHandler } from './application/commands/create-post/create-post.handler';
import { EngagePostHandler } from './application/commands/engage-post/engage-post.handler';
import { GetFeedHandler } from './application/queries/get-feed/get-feed.handler';

const CommandHandlers = [CreatePostHandler, EngagePostHandler];
const QueryHandlers = [GetFeedHandler];

@Module({
  imports: [CqrsModule],
  controllers: [FeedController],
  providers: [MktPrismaService, ...CommandHandlers, ...QueryHandlers],
})
export class FeedModule {}
