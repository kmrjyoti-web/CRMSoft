import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FeedController } from './presentation/feed.controller';
import { MktPrismaService } from './infrastructure/mkt-prisma.service';
import { FeedRankerService } from './application/services/feed-ranker.service';
import { CreatePostHandler } from './application/commands/create-post/create-post.handler';
import { EngagePostHandler } from './application/commands/engage-post/engage-post.handler';
import { FollowUserHandler } from './application/commands/follow-user/follow-user.handler';
import { UnfollowUserHandler } from './application/commands/unfollow-user/unfollow-user.handler';
import { GetFeedHandler } from './application/queries/get-feed/get-feed.handler';
import { GetRankedFeedHandler } from './application/queries/get-ranked-feed/get-ranked-feed.handler';
import { GetFollowersHandler } from './application/queries/get-followers/get-followers.handler';
import { GetFollowingHandler } from './application/queries/get-following/get-following.handler';
import { GetShareLinkHandler } from './application/queries/get-share-link/get-share-link.handler';
import { MarketplaceEngagementEventHandler } from './application/events/marketplace-engagement.handler';

const CommandHandlers = [
  CreatePostHandler,
  EngagePostHandler,
  FollowUserHandler,
  UnfollowUserHandler,
];

const QueryHandlers = [
  GetFeedHandler,
  GetRankedFeedHandler,
  GetFollowersHandler,
  GetFollowingHandler,
  GetShareLinkHandler,
];

const EventHandlers = [MarketplaceEngagementEventHandler];

@Module({
  imports: [CqrsModule],
  controllers: [FeedController],
  providers: [
    MktPrismaService,
    FeedRankerService,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [MktPrismaService, FeedRankerService],
})
export class FeedModule {}
