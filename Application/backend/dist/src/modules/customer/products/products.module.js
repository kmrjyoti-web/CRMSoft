"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const products_controller_1 = require("./presentation/products.controller");
const create_product_handler_1 = require("./application/commands/create-product/create-product.handler");
const update_product_handler_1 = require("./application/commands/update-product/update-product.handler");
const manage_product_images_handler_1 = require("./application/commands/manage-product-images/manage-product-images.handler");
const link_products_handler_1 = require("./application/commands/link-products/link-products.handler");
const deactivate_product_handler_1 = require("./application/commands/deactivate-product/deactivate-product.handler");
const assign_product_filters_handler_1 = require("./application/commands/assign-product-filters/assign-product-filters.handler");
const get_product_by_id_handler_1 = require("./application/queries/get-product-by-id/get-product-by-id.handler");
const list_products_handler_1 = require("./application/queries/list-products/list-products.handler");
const get_product_tree_handler_1 = require("./application/queries/get-product-tree/get-product-tree.handler");
const get_product_pricing_handler_1 = require("./application/queries/get-product-pricing/get-product-pricing.handler");
const CommandHandlers = [
    create_product_handler_1.CreateProductHandler,
    update_product_handler_1.UpdateProductHandler,
    manage_product_images_handler_1.ManageProductImagesHandler,
    link_products_handler_1.LinkProductsHandler,
    deactivate_product_handler_1.DeactivateProductHandler,
    assign_product_filters_handler_1.AssignProductFiltersHandler,
];
const QueryHandlers = [
    get_product_by_id_handler_1.GetProductByIdHandler,
    list_products_handler_1.ListProductsHandler,
    get_product_tree_handler_1.GetProductTreeHandler,
    get_product_pricing_handler_1.GetProductPricingHandler,
];
let ProductsModule = class ProductsModule {
};
exports.ProductsModule = ProductsModule;
exports.ProductsModule = ProductsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [products_controller_1.ProductsController],
        providers: [...CommandHandlers, ...QueryHandlers],
    })
], ProductsModule);
//# sourceMappingURL=products.module.js.map