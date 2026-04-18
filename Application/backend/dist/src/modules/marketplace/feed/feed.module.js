"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const feed_controller_1 = require("./presentation/feed.controller");
const mkt_prisma_service_1 = require("./infrastructure/mkt-prisma.service");
const feed_ranker_service_1 = require("./application/services/feed-ranker.service");
const create_post_handler_1 = require("./application/commands/create-post/create-post.handler");
const engage_post_handler_1 = require("./application/commands/engage-post/engage-post.handler");
const follow_user_handler_1 = require("./application/commands/follow-user/follow-user.handler");
const unfollow_user_handler_1 = require("./application/commands/unfollow-user/unfollow-user.handler");
const get_feed_handler_1 = require("./application/queries/get-feed/get-feed.handler");
const get_ranked_feed_handler_1 = require("./application/queries/get-ranked-feed/get-ranked-feed.handler");
const get_followers_handler_1 = require("./application/queries/get-followers/get-followers.handler");
const get_following_handler_1 = require("./application/queries/get-following/get-following.handler");
const get_share_link_handler_1 = require("./application/queries/get-share-link/get-share-link.handler");
const marketplace_engagement_handler_1 = require("./application/events/marketplace-engagement.handler");
const CommandHandlers = [
    create_post_handler_1.CreatePostHandler,
    engage_post_handler_1.EngagePostHandler,
    follow_user_handler_1.FollowUserHandler,
    unfollow_user_handler_1.UnfollowUserHandler,
];
const QueryHandlers = [
    get_feed_handler_1.GetFeedHandler,
    get_ranked_feed_handler_1.GetRankedFeedHandler,
    get_followers_handler_1.GetFollowersHandler,
    get_following_handler_1.GetFollowingHandler,
    get_share_link_handler_1.GetShareLinkHandler,
];
const EventHandlers = [marketplace_engagement_handler_1.MarketplaceEngagementEventHandler];
let FeedModule = class FeedModule {
};
exports.FeedModule = FeedModule;
exports.FeedModule = FeedModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [feed_controller_1.FeedController],
        providers: [
            mkt_prisma_service_1.MktPrismaService,
            feed_ranker_service_1.FeedRankerService,
            ...CommandHandlers,
            ...QueryHandlers,
            ...EventHandlers,
        ],
        exports: [mkt_prisma_service_1.MktPrismaService, feed_ranker_service_1.FeedRankerService],
    })
], FeedModule);
//# sourceMappingURL=feed.module.js.map