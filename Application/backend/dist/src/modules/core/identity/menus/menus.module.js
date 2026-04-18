"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenusModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const menus_controller_1 = require("./presentation/menus.controller");
const menu_permission_controller_1 = require("./presentation/menu-permission.controller");
const create_menu_handler_1 = require("./application/commands/create-menu/create-menu.handler");
const update_menu_handler_1 = require("./application/commands/update-menu/update-menu.handler");
const reorder_menus_handler_1 = require("./application/commands/reorder-menus/reorder-menus.handler");
const deactivate_menu_handler_1 = require("./application/commands/deactivate-menu/deactivate-menu.handler");
const bulk_seed_menus_handler_1 = require("./application/commands/bulk-seed-menus/bulk-seed-menus.handler");
const get_menu_tree_handler_1 = require("./application/queries/get-menu-tree/get-menu-tree.handler");
const get_my_menu_handler_1 = require("./application/queries/get-my-menu/get-my-menu.handler");
const get_menu_by_id_handler_1 = require("./application/queries/get-menu-by-id/get-menu-by-id.handler");
const menu_permission_service_1 = require("./application/services/menu-permission.service");
const CommandHandlers = [
    create_menu_handler_1.CreateMenuHandler, update_menu_handler_1.UpdateMenuHandler, reorder_menus_handler_1.ReorderMenusHandler,
    deactivate_menu_handler_1.DeactivateMenuHandler, bulk_seed_menus_handler_1.BulkSeedMenusHandler,
];
const QueryHandlers = [
    get_menu_tree_handler_1.GetMenuTreeHandler, get_my_menu_handler_1.GetMyMenuHandler, get_menu_by_id_handler_1.GetMenuByIdHandler,
];
let MenusModule = class MenusModule {
};
exports.MenusModule = MenusModule;
exports.MenusModule = MenusModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [menus_controller_1.MenusController, menu_permission_controller_1.MenuPermissionController],
        providers: [...CommandHandlers, ...QueryHandlers, menu_permission_service_1.MenuPermissionService, prisma_service_1.PrismaService],
        exports: [menu_permission_service_1.MenuPermissionService],
    })
], MenusModule);
//# sourceMappingURL=menus.module.js.map