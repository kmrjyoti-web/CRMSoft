"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_post_command_1 = require("../application/commands/create-post/create-post.command");
const engage_post_command_1 = require("../application/commands/engage-post/engage-post.command");
const follow_user_command_1 = require("../application/commands/follow-user/follow-user.command");
const unfollow_user_command_1 = require("../application/commands/unfollow-user/unfollow-user.command");
const get_feed_query_1 = require("../application/queries/get-feed/get-feed.query");
const get_ranked_feed_query_1 = require("../application/queries/get-ranked-feed/get-ranked-feed.query");
const get_followers_query_1 = require("../application/queries/get-followers/get-followers.query");
const get_following_query_1 = require("../application/queries/get-following/get-following.query");
const get_share_link_query_1 = require("../application/queries/get-share-link/get-share-link.query");
const create_post_dto_1 = require("./dto/create-post.dto");
let FeedController = class FeedController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async getFeed(userId, tenantId, page, limit, category, city) {
        const result = await this.queryBus.execute(new get_ranked_feed_query_1.GetRankedFeedQuery(tenantId, userId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20, category, city, 'main'));
        return api_response_1.ApiResponse.success(result);
    }
    async getFollowingFeed(userId, tenantId, page, limit) {
        const result = await this.queryBus.execute(new get_ranked_feed_query_1.GetRankedFeedQuery(tenantId, userId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20, undefined, undefined, 'following'));
        return api_response_1.ApiResponse.success(result);
    }
    async getTrendingFeed(userId, tenantId, page, limit) {
        const result = await this.queryBus.execute(new get_ranked_feed_query_1.GetRankedFeedQuery(tenantId, userId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20, undefined, undefined, 'trending'));
        return api_response_1.ApiResponse.success(result);
    }
    async getDiscoverFeed(userId, tenantId, page, limit, category) {
        const result = await this.queryBus.execute(new get_ranked_feed_query_1.GetRankedFeedQuery(tenantId, userId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20, category, undefined, 'discover'));
        return api_response_1.ApiResponse.success(result);
    }
    async getPostsFeed(userId, tenantId, page, limit, postType, authorId) {
        const result = await this.queryBus.execute(new get_feed_query_1.GetFeedQuery(tenantId, userId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20, postType, authorId));
        return api_response_1.ApiResponse.paginated(result.data, result.meta.total, result.meta.page, result.meta.limit);
    }
    async createPost(dto, userId, tenantId) {
        const id = await this.commandBus.execute(new create_post_command_1.CreatePostCommand(tenantId, userId, userId, dto.postType, dto.content, dto.mediaUrls, dto.linkedListingId, dto.linkedOfferId, dto.rating, dto.productId, dto.visibility, dto.visibilityConfig, dto.publishAt ? new Date(dto.publishAt) : undefined, dto.expiresAt ? new Date(dto.expiresAt) : undefined, dto.hashtags, dto.mentions, dto.pollConfig));
        return api_response_1.ApiResponse.success({ id }, 'Post created');
    }
    async engagePost(postId, body, userId, tenantId) {
        await this.commandBus.execute(new engage_post_command_1.EngagePostCommand(postId, tenantId, userId, body.action, body.sharedTo, body.city, body.state, body.deviceType));
        return api_response_1.ApiResponse.success(null, 'Engagement recorded');
    }
    async followUser(followingId, followerId, tenantId) {
        const result = await this.commandBus.execute(new follow_user_command_1.FollowUserCommand(tenantId, followerId, followingId));
        return api_response_1.ApiResponse.success(result, 'Following user');
    }
    async unfollowUser(followingId, followerId, tenantId) {
        const result = await this.commandBus.execute(new unfollow_user_command_1.UnfollowUserCommand(tenantId, followerId, followingId));
        return api_response_1.ApiResponse.success(result, 'Unfollowed user');
    }
    async getFollowers(userId, tenantId, page, limit) {
        const result = await this.queryBus.execute(new get_followers_query_1.GetFollowersQuery(userId, tenantId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20));
        return api_response_1.ApiResponse.paginated(result.data, result.meta.total, result.meta.page, result.meta.limit);
    }
    async getFollowing(userId, tenantId, page, limit) {
        const result = await this.queryBus.execute(new get_following_query_1.GetFollowingQuery(userId, tenantId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20));
        return api_response_1.ApiResponse.paginated(result.data, result.meta.total, result.meta.page, result.meta.limit);
    }
    async getShareLink(entityType, entityId, tenantId) {
        const result = await this.queryBus.execute(new get_share_link_query_1.GetShareLinkQuery(entityType, entityId, tenantId));
        return api_response_1.ApiResponse.success(result);
    }
};
exports.FeedController = FeedController;
__decorate([
    (0, common_1.Get)('feed'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ranked main feed' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('category')),
    __param(5, (0, common_1.Query)('city')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "getFeed", null);
__decorate([
    (0, common_1.Get)('feed/following'),
    (0, swagger_1.ApiOperation)({ summary: 'Get feed from followed users' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "getFollowingFeed", null);
__decorate([
    (0, common_1.Get)('feed/trending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get trending feed (last 24h)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "getTrendingFeed", null);
__decorate([
    (0, common_1.Get)('feed/discover'),
    (0, swagger_1.ApiOperation)({ summary: 'Discover new content' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "getDiscoverFeed", null);
__decorate([
    (0, common_1.Get)('feed/posts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get marketplace posts feed (legacy)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('postType')),
    __param(5, (0, common_1.Query)('authorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "getPostsFeed", null);
__decorate([
    (0, common_1.Post)('feed/posts'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new post' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_post_dto_1.CreatePostDto, String, String]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "createPost", null);
__decorate([
    (0, common_1.Post)('feed/posts/:id/engage'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Engage with a post (like, share, save, view)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "engagePost", null);
__decorate([
    (0, common_1.Post)('follow/:userId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Follow a user' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "followUser", null);
__decorate([
    (0, common_1.Delete)('follow/:userId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Unfollow a user' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "unfollowUser", null);
__decorate([
    (0, common_1.Get)('follow/followers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get your followers' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "getFollowers", null);
__decorate([
    (0, common_1.Get)('follow/following'),
    (0, swagger_1.ApiOperation)({ summary: 'Get users you follow' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "getFollowing", null);
__decorate([
    (0, common_1.Post)('share/:entityType/:entityId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get share links (web, deep link, WhatsApp)' }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "getShareLink", null);
exports.FeedController = FeedController = __decorate([
    (0, swagger_1.ApiTags)('Marketplace - Feed'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('marketplace'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], FeedController);
//# sourceMappingURL=feed.controller.js.map