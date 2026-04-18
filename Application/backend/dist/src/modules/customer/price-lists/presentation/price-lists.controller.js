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
exports.PriceListsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_price_list_dto_1 = require("./dto/create-price-list.dto");
const update_price_list_dto_1 = require("./dto/update-price-list.dto");
const price_list_query_dto_1 = require("./dto/price-list-query.dto");
const add_price_list_item_dto_1 = require("./dto/add-price-list-item.dto");
const update_price_list_item_dto_1 = require("./dto/update-price-list-item.dto");
const create_price_list_command_1 = require("../application/commands/create-price-list/create-price-list.command");
const update_price_list_command_1 = require("../application/commands/update-price-list/update-price-list.command");
const delete_price_list_command_1 = require("../application/commands/delete-price-list/delete-price-list.command");
const add_price_list_item_command_1 = require("../application/commands/add-price-list-item/add-price-list-item.command");
const update_price_list_item_command_1 = require("../application/commands/update-price-list-item/update-price-list-item.command");
const remove_price_list_item_command_1 = require("../application/commands/remove-price-list-item/remove-price-list-item.command");
const list_price_lists_query_1 = require("../application/queries/list-price-lists/list-price-lists.query");
const get_price_list_query_1 = require("../application/queries/get-price-list/get-price-list.query");
let PriceListsController = class PriceListsController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async list(query) {
        const result = await this.queryBus.execute(new list_price_lists_query_1.ListPriceListsQuery(query.page, query.limit, query.search, query.isActive));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getById(id) {
        return api_response_1.ApiResponse.success(await this.queryBus.execute(new get_price_list_query_1.GetPriceListQuery(id)));
    }
    async create(dto, userId) {
        const result = await this.commandBus.execute(new create_price_list_command_1.CreatePriceListCommand(dto, userId));
        return api_response_1.ApiResponse.success(result, 'Price list created');
    }
    async update(id, dto) {
        return api_response_1.ApiResponse.success(await this.commandBus.execute(new update_price_list_command_1.UpdatePriceListCommand(id, dto)));
    }
    async remove(id) {
        return api_response_1.ApiResponse.success(await this.commandBus.execute(new delete_price_list_command_1.DeletePriceListCommand(id)));
    }
    async addItem(priceListId, dto) {
        const result = await this.commandBus.execute(new add_price_list_item_command_1.AddPriceListItemCommand(priceListId, dto));
        return api_response_1.ApiResponse.success(result, 'Item added');
    }
    async updateItem(itemId, dto) {
        return api_response_1.ApiResponse.success(await this.commandBus.execute(new update_price_list_item_command_1.UpdatePriceListItemCommand(itemId, dto)));
    }
    async removeItem(itemId) {
        return api_response_1.ApiResponse.success(await this.commandBus.execute(new remove_price_list_item_command_1.RemovePriceListItemCommand(itemId)));
    }
};
exports.PriceListsController = PriceListsController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('price-lists:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [price_list_query_dto_1.PriceListQueryDto]),
    __metadata("design:returntype", Promise)
], PriceListsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('price-lists:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PriceListsController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('price-lists:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_price_list_dto_1.CreatePriceListDto, String]),
    __metadata("design:returntype", Promise)
], PriceListsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('price-lists:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_price_list_dto_1.UpdatePriceListDto]),
    __metadata("design:returntype", Promise)
], PriceListsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('price-lists:delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PriceListsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    (0, require_permissions_decorator_1.RequirePermissions)('price-lists:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_price_list_item_dto_1.AddPriceListItemDto]),
    __metadata("design:returntype", Promise)
], PriceListsController.prototype, "addItem", null);
__decorate([
    (0, common_1.Patch)(':id/items/:itemId'),
    (0, require_permissions_decorator_1.RequirePermissions)('price-lists:update'),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_price_list_item_dto_1.UpdatePriceListItemDto]),
    __metadata("design:returntype", Promise)
], PriceListsController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)(':id/items/:itemId'),
    (0, require_permissions_decorator_1.RequirePermissions)('price-lists:update'),
    __param(0, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PriceListsController.prototype, "removeItem", null);
exports.PriceListsController = PriceListsController = __decorate([
    (0, common_1.Controller)('price-lists'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus, cqrs_1.QueryBus])
], PriceListsController);
//# sourceMappingURL=price-lists.controller.js.map