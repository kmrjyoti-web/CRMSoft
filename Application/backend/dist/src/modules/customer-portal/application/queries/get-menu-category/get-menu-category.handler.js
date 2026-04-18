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
var GetMenuCategoryHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMenuCategoryHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_menu_category_query_1 = require("./get-menu-category.query");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let GetMenuCategoryHandler = GetMenuCategoryHandler_1 = class GetMenuCategoryHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetMenuCategoryHandler_1.name);
    }
    async execute(query) {
        try {
            const category = await this.prisma.identity.customerMenuCategory.findFirst({
                where: { id: query.id, isDeleted: false },
                include: { _count: { select: { users: { where: { isDeleted: false } } } } },
            });
            if (!category)
                throw new common_1.NotFoundException('Menu category not found');
            return category;
        }
        catch (error) {
            this.logger.error(`GetMenuCategoryHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetMenuCategoryHandler = GetMenuCategoryHandler;
exports.GetMenuCategoryHandler = GetMenuCategoryHandler = GetMenuCategoryHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_menu_category_query_1.GetMenuCategoryQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetMenuCategoryHandler);
//# sourceMappingURL=get-menu-category.handler.js.map