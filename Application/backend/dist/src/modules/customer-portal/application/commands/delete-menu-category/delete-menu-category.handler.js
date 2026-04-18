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
var DeleteMenuCategoryHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteMenuCategoryHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_menu_category_command_1 = require("./delete-menu-category.command");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let DeleteMenuCategoryHandler = DeleteMenuCategoryHandler_1 = class DeleteMenuCategoryHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DeleteMenuCategoryHandler_1.name);
    }
    async execute(command) {
        try {
            const { id } = command;
            const category = await this.prisma.identity.customerMenuCategory.findFirst({
                where: { id, isDeleted: false },
                include: { _count: { select: { users: { where: { isDeleted: false } } } } },
            });
            if (!category)
                throw new common_1.NotFoundException('Menu category not found');
            if (category._count.users > 0) {
                throw new common_1.BadRequestException(`Cannot delete: ${category._count.users} portal user(s) are assigned to this category. Reassign them first.`);
            }
            await this.prisma.identity.customerMenuCategory.update({
                where: { id },
                data: { isDeleted: true },
            });
            return { message: 'Menu category deleted' };
        }
        catch (error) {
            this.logger.error(`DeleteMenuCategoryHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeleteMenuCategoryHandler = DeleteMenuCategoryHandler;
exports.DeleteMenuCategoryHandler = DeleteMenuCategoryHandler = DeleteMenuCategoryHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(delete_menu_category_command_1.DeleteMenuCategoryCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeleteMenuCategoryHandler);
//# sourceMappingURL=delete-menu-category.handler.js.map