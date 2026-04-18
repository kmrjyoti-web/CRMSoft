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
exports.ListingsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_listing_command_1 = require("../application/commands/create-listing/create-listing.command");
const update_listing_command_1 = require("../application/commands/update-listing/update-listing.command");
const publish_listing_command_1 = require("../application/commands/publish-listing/publish-listing.command");
const get_listing_query_1 = require("../application/queries/get-listing/get-listing.query");
const list_listings_query_1 = require("../application/queries/list-listings/list-listings.query");
const create_listing_dto_1 = require("./dto/create-listing.dto");
const update_listing_dto_1 = require("./dto/update-listing.dto");
let ListingsController = class ListingsController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, userId, tenantId) {
        const id = await this.commandBus.execute(new create_listing_command_1.CreateListingCommand(tenantId, userId, dto.listingType, dto.title, userId, dto.description, dto.shortDescription, dto.categoryId, dto.subcategoryId, dto.mediaUrls, dto.currency, dto.basePrice, dto.mrp, dto.minOrderQty, dto.maxOrderQty, dto.hsnCode, dto.gstRate, dto.trackInventory, dto.stockAvailable, dto.visibility, dto.visibilityConfig, dto.publishAt ? new Date(dto.publishAt) : undefined, dto.expiresAt ? new Date(dto.expiresAt) : undefined, dto.attributes, dto.keywords, dto.shippingConfig, dto.requirementConfig, dto.priceTiers));
        const listing = await this.queryBus.execute(new get_listing_query_1.GetListingQuery(id, tenantId));
        return api_response_1.ApiResponse.success(listing, 'Listing created');
    }
    async findAll(tenantId, page, limit, status, listingType, categoryId, search, authorId) {
        const result = await this.queryBus.execute(new list_listings_query_1.ListListingsQuery(tenantId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20, status, listingType, categoryId, search, authorId));
        return api_response_1.ApiResponse.paginated(result.data, result.meta.total, result.meta.page, result.meta.limit);
    }
    async findOne(id, tenantId) {
        const listing = await this.queryBus.execute(new get_listing_query_1.GetListingQuery(id, tenantId));
        return api_response_1.ApiResponse.success(listing);
    }
    async update(id, dto, userId, tenantId) {
        await this.commandBus.execute(new update_listing_command_1.UpdateListingCommand(id, tenantId, userId, dto.title, dto.description, dto.shortDescription, dto.categoryId, dto.subcategoryId, dto.mediaUrls, dto.basePrice, dto.mrp, dto.minOrderQty, dto.maxOrderQty, dto.hsnCode, dto.gstRate, dto.stockAvailable, dto.visibility, dto.visibilityConfig, dto.publishAt ? new Date(dto.publishAt) : undefined, dto.expiresAt ? new Date(dto.expiresAt) : undefined, dto.attributes, dto.keywords, dto.shippingConfig, dto.requirementConfig));
        const listing = await this.queryBus.execute(new get_listing_query_1.GetListingQuery(id, tenantId));
        return api_response_1.ApiResponse.success(listing, 'Listing updated');
    }
    async publish(id, userId, tenantId) {
        await this.commandBus.execute(new publish_listing_command_1.PublishListingCommand(id, tenantId, userId));
        const listing = await this.queryBus.execute(new get_listing_query_1.GetListingQuery(id, tenantId));
        return api_response_1.ApiResponse.success(listing, 'Listing published');
    }
};
exports.ListingsController = ListingsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new marketplace listing' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_listing_dto_1.CreateListingDto, String, String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List marketplace listings' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('listingType')),
    __param(5, (0, common_1.Query)('categoryId')),
    __param(6, (0, common_1.Query)('search')),
    __param(7, (0, common_1.Query)('authorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a listing by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a listing' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_listing_dto_1.UpdateListingDto, String, String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Publish a listing' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "publish", null);
exports.ListingsController = ListingsController = __decorate([
    (0, swagger_1.ApiTags)('Marketplace - Listings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('marketplace/listings'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], ListingsController);
//# sourceMappingURL=listings.controller.js.map