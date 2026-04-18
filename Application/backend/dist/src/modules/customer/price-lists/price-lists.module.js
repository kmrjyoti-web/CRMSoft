"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceListsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const price_lists_controller_1 = require("./presentation/price-lists.controller");
const create_price_list_handler_1 = require("./application/commands/create-price-list/create-price-list.handler");
const update_price_list_handler_1 = require("./application/commands/update-price-list/update-price-list.handler");
const delete_price_list_handler_1 = require("./application/commands/delete-price-list/delete-price-list.handler");
const add_price_list_item_handler_1 = require("./application/commands/add-price-list-item/add-price-list-item.handler");
const update_price_list_item_handler_1 = require("./application/commands/update-price-list-item/update-price-list-item.handler");
const remove_price_list_item_handler_1 = require("./application/commands/remove-price-list-item/remove-price-list-item.handler");
const list_price_lists_handler_1 = require("./application/queries/list-price-lists/list-price-lists.handler");
const get_price_list_handler_1 = require("./application/queries/get-price-list/get-price-list.handler");
const CommandHandlers = [
    create_price_list_handler_1.CreatePriceListHandler,
    update_price_list_handler_1.UpdatePriceListHandler,
    delete_price_list_handler_1.DeletePriceListHandler,
    add_price_list_item_handler_1.AddPriceListItemHandler,
    update_price_list_item_handler_1.UpdatePriceListItemHandler,
    remove_price_list_item_handler_1.RemovePriceListItemHandler,
];
const QueryHandlers = [list_price_lists_handler_1.ListPriceListsHandler, get_price_list_handler_1.GetPriceListHandler];
let PriceListsModule = class PriceListsModule {
};
exports.PriceListsModule = PriceListsModule;
exports.PriceListsModule = PriceListsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [price_lists_controller_1.PriceListsController],
        providers: [...CommandHandlers, ...QueryHandlers],
    })
], PriceListsModule);
//# sourceMappingURL=price-lists.module.js.map