"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePostCommand = void 0;
class CreatePostCommand {
    constructor(tenantId, authorId, createdById, postType, content, mediaUrls, linkedListingId, linkedOfferId, rating, productId, visibility, visibilityConfig, publishAt, expiresAt, hashtags, mentions, pollConfig) {
        this.tenantId = tenantId;
        this.authorId = authorId;
        this.createdById = createdById;
        this.postType = postType;
        this.content = content;
        this.mediaUrls = mediaUrls;
        this.linkedListingId = linkedListingId;
        this.linkedOfferId = linkedOfferId;
        this.rating = rating;
        this.productId = productId;
        this.visibility = visibility;
        this.visibilityConfig = visibilityConfig;
        this.publishAt = publishAt;
        this.expiresAt = expiresAt;
        this.hashtags = hashtags;
        this.mentions = mentions;
        this.pollConfig = pollConfig;
    }
}
exports.CreatePostCommand = CreatePostCommand;
//# sourceMappingURL=create-post.command.js.map