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
var ListMenuCategoriesHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListMenuCategoriesHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const list_menu_categories_query_1 = require("./list-menu-categories.query");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let ListMenuCategoriesHandler = ListMenuCategoriesHandler_1 = class ListMenuCategoriesHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ListMenuCategoriesHandler_1.name);
    }
    async execute(query) {
        try {
            return this.prisma.identity.customerMenuCategory.findMany({
                where: { tenantId: query.tenantId, isDeleted: false },
                orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
                include: { _count: { select: { users: { where: { isDeleted: false } } } } },
            });
        }
        catch (error) {
            this.logger.error(`ListMenuCategoriesHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListMenuCategoriesHandler = ListMenuCategoriesHandler;
exports.ListMenuCategoriesHandler = ListMenuCategoriesHandler = ListMenuCategoriesHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_menu_categories_query_1.ListMenuCategoriesQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ListMenuCategoriesHandler);
//# sourceMappingURL=list-menu-categories.handler.js.map