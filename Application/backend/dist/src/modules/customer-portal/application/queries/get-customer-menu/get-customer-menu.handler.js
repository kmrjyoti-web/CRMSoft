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
var GetCustomerMenuHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCustomerMenuHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_customer_menu_query_1 = require("./get-customer-menu.query");
const customer_user_repository_interface_1 = require("../../../domain/interfaces/customer-user.repository.interface");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const portal_routes_1 = require("../../../data/portal-routes");
let GetCustomerMenuHandler = GetCustomerMenuHandler_1 = class GetCustomerMenuHandler {
    constructor(userRepo, prisma) {
        this.userRepo = userRepo;
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetCustomerMenuHandler_1.name);
    }
    async execute(query) {
        try {
            const user = await this.userRepo.findById(query.customerId);
            if (!user)
                throw new common_1.NotFoundException('Customer account not found');
            let categoryRoutes = [];
            let categoryName;
            if (user.menuCategoryId) {
                const category = await this.prisma.identity.customerMenuCategory.findUnique({
                    where: { id: user.menuCategoryId },
                });
                if (category) {
                    categoryRoutes = category.enabledRoutes;
                    categoryName = category.name;
                }
            }
            const resolvedRoutes = user.resolveMenu(categoryRoutes);
            const routeMap = new Map(portal_routes_1.CUSTOMER_PORTAL_ROUTES.map((r) => [r.route, r]));
            const menuItems = resolvedRoutes.map((route) => ({
                ...(routeMap.get(route) ?? { route, name: route, nameHi: route, icon: 'circle', group: 'Other' }),
            }));
            const grouped = menuItems.reduce((acc, item) => {
                const group = item.group ?? 'Other';
                if (!acc[group])
                    acc[group] = [];
                acc[group].push(item);
                return acc;
            }, {});
            return {
                categoryName,
                totalRoutes: resolvedRoutes.length,
                pageOverrides: user.pageOverrides,
                menu: menuItems,
                menuGrouped: grouped,
            };
        }
        catch (error) {
            this.logger.error(`GetCustomerMenuHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetCustomerMenuHandler = GetCustomerMenuHandler;
exports.GetCustomerMenuHandler = GetCustomerMenuHandler = GetCustomerMenuHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_customer_menu_query_1.GetCustomerMenuQuery),
    __param(0, (0, common_1.Inject)(customer_user_repository_interface_1.CUSTOMER_USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], GetCustomerMenuHandler);
//# sourceMappingURL=get-customer-menu.handler.js.map