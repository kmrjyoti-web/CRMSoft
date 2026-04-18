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
exports.OrderController = exports.EnquiryController = exports.PostController = exports.ListingController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../core/permissions/decorators/require-permissions.decorator");
const require_verification_decorator_1 = require("../../softwarevendor/verification/decorators/require-verification.decorator");
const verification_guard_1 = require("../../softwarevendor/verification/guards/verification.guard");
const listing_service_1 = require("../services/listing.service");
const post_service_1 = require("../services/post.service");
const enquiry_service_1 = require("../services/enquiry.service");
const order_service_1 = require("../services/order.service");
let ListingController = class ListingController {
    constructor(listingService) {
        this.listingService = listingService;
    }
    async list(tenantId, userId, page, limit, type, category, search, minPrice, maxPrice) {
        return this.listingService.findMany(tenantId, {
            listingType: type,
            category,
            search,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
        }, { page, limit }, userId);
    }
    async getById(id, userId) {
        return this.listingService.findById(id, userId);
    }
    async create(tenantId, userId, body) {
        return this.listingService.create(tenantId, userId, body);
    }
    async update(id, tenantId, userId, body) {
        return this.listingService.update(id, tenantId, userId, body);
    }
    async myListings(tenantId, userId) {
        return this.listingService.getVendorListings(tenantId, userId);
    }
};
exports.ListingController = ListingController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(4, (0, common_1.Query)('type')),
    __param(5, (0, common_1.Query)('category')),
    __param(6, (0, common_1.Query)('search')),
    __param(7, (0, common_1.Query)('minPrice')),
    __param(8, (0, common_1.Query)('maxPrice')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('marketplace:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('marketplace:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('vendor/mine'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "myListings", null);
exports.ListingController = ListingController = __decorate([
    (0, common_1.Controller)('marketplace/listings'),
    __metadata("design:paramtypes", [listing_service_1.ListingService])
], ListingController);
let PostController = class PostController {
    constructor(postService) {
        this.postService = postService;
    }
    async getFeed(tenantId, userId, page, limit) {
        return this.postService.getFeed(tenantId, { page, limit }, userId);
    }
    async getById(id) {
        return this.postService.findById(id);
    }
    async create(tenantId, userId, body) {
        return this.postService.create(tenantId, userId, body);
    }
    async toggleLike(postId, userId, tenantId) {
        return this.postService.toggleLike(postId, userId, tenantId);
    }
    async toggleSave(postId, userId, tenantId) {
        return this.postService.toggleSave(postId, userId, tenantId);
    }
    async addComment(postId, userId, tenantId, body) {
        return this.postService.addComment(postId, userId, tenantId, body.content, body.parentId);
    }
    async trackShare(postId, userId, tenantId, body) {
        return this.postService.trackShare(postId, userId, tenantId, body.sharedTo);
    }
};
exports.PostController = PostController;
__decorate([
    (0, common_1.Get)('feed'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getFeed", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/like'),
    (0, common_1.UseGuards)(verification_guard_1.VerificationGuard),
    (0, require_verification_decorator_1.RequireVerification)('like'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "toggleLike", null);
__decorate([
    (0, common_1.Post)(':id/save'),
    (0, common_1.UseGuards)(verification_guard_1.VerificationGuard),
    (0, require_verification_decorator_1.RequireVerification)('save'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "toggleSave", null);
__decorate([
    (0, common_1.Post)(':id/comment'),
    (0, common_1.UseGuards)(verification_guard_1.VerificationGuard),
    (0, require_verification_decorator_1.RequireVerification)('comment'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "addComment", null);
__decorate([
    (0, common_1.Post)(':id/share'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "trackShare", null);
exports.PostController = PostController = __decorate([
    (0, common_1.Controller)('marketplace/posts'),
    __metadata("design:paramtypes", [post_service_1.PostService])
], PostController);
let EnquiryController = class EnquiryController {
    constructor(enquiryService) {
        this.enquiryService = enquiryService;
    }
    async create(tenantId, userId, body) {
        return this.enquiryService.create(tenantId, userId, body);
    }
    async vendorEnquiries(tenantId, userId, status) {
        return this.enquiryService.getVendorEnquiries(tenantId, userId, status);
    }
    async buyerEnquiries(tenantId, userId) {
        return this.enquiryService.getBuyerEnquiries(tenantId, userId);
    }
    async getById(id) {
        return this.enquiryService.findById(id);
    }
    async reply(id, userId, body) {
        return this.enquiryService.reply(id, userId, body.senderType, body.message);
    }
    async markRead(id, body) {
        return this.enquiryService.markRead(id, body.readerType);
    }
};
exports.EnquiryController = EnquiryController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(verification_guard_1.VerificationGuard),
    (0, require_verification_decorator_1.RequireVerification)('enquiry'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EnquiryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('vendor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EnquiryController.prototype, "vendorEnquiries", null);
__decorate([
    (0, common_1.Get)('buyer'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EnquiryController.prototype, "buyerEnquiries", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnquiryController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(':id/reply'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EnquiryController.prototype, "reply", null);
__decorate([
    (0, common_1.Post)(':id/read'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EnquiryController.prototype, "markRead", null);
exports.EnquiryController = EnquiryController = __decorate([
    (0, common_1.Controller)('marketplace/enquiries'),
    __metadata("design:paramtypes", [enquiry_service_1.EnquiryService])
], EnquiryController);
let OrderController = class OrderController {
    constructor(orderService) {
        this.orderService = orderService;
    }
    async create(tenantId, userId, body) {
        return this.orderService.create(tenantId, userId, body);
    }
    async vendorOrders(tenantId, userId, status) {
        return this.orderService.getVendorOrders(tenantId, userId, status);
    }
    async buyerOrders(tenantId, userId) {
        return this.orderService.getBuyerOrders(tenantId, userId);
    }
    async getById(id) {
        return this.orderService.findById(id);
    }
    async updateStatus(id, userId, body) {
        return this.orderService.updateStatus(id, body.status, body.note, userId);
    }
    async updateTracking(id, body) {
        return this.orderService.updateTracking(id, body.trackingNumber, body.carrier, body.estimatedDelivery ? new Date(body.estimatedDelivery) : undefined);
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(verification_guard_1.VerificationGuard),
    (0, require_verification_decorator_1.RequireVerification)('order'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('vendor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "vendorOrders", null);
__decorate([
    (0, common_1.Get)('buyer'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "buyerOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, require_permissions_decorator_1.RequirePermissions)('marketplace:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Put)(':id/tracking'),
    (0, require_permissions_decorator_1.RequirePermissions)('marketplace:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "updateTracking", null);
exports.OrderController = OrderController = __decorate([
    (0, common_1.Controller)('marketplace/orders'),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], OrderController);
//# sourceMappingURL=marketplace-feed.controller.js.map