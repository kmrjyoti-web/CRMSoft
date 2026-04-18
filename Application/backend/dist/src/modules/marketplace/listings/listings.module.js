"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const listings_controller_1 = require("./presentation/listings.controller");
const mkt_prisma_service_1 = require("./infrastructure/mkt-prisma.service");
const create_listing_handler_1 = require("./application/commands/create-listing/create-listing.handler");
const update_listing_handler_1 = require("./application/commands/update-listing/update-listing.handler");
const publish_listing_handler_1 = require("./application/commands/publish-listing/publish-listing.handler");
const get_listing_handler_1 = require("./application/queries/get-listing/get-listing.handler");
const list_listings_handler_1 = require("./application/queries/list-listings/list-listings.handler");
const CommandHandlers = [create_listing_handler_1.CreateListingHandler, update_listing_handler_1.UpdateListingHandler, publish_listing_handler_1.PublishListingHandler];
const QueryHandlers = [get_listing_handler_1.GetListingHandler, list_listings_handler_1.ListListingsHandler];
let ListingsModule = class ListingsModule {
};
exports.ListingsModule = ListingsModule;
exports.ListingsModule = ListingsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [listings_controller_1.ListingsController],
        providers: [mkt_prisma_service_1.MktPrismaService, ...CommandHandlers, ...QueryHandlers],
        exports: [mkt_prisma_service_1.MktPrismaService],
    })
], ListingsModule);
//# sourceMappingURL=listings.module.js.map