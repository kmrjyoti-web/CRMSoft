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
var UpdateMenuCategoryHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMenuCategoryHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_menu_category_command_1 = require("./update-menu-category.command");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let UpdateMenuCategoryHandler = UpdateMenuCategoryHandler_1 = class UpdateMenuCategoryHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateMenuCategoryHandler_1.name);
    }
    async execute(command) {
        try {
            const { id, updates } = command;
            const existing = await this.prisma.identity.customerMenuCategory.findFirst({
                where: { id, isDeleted: false },
            });
            if (!existing)
                throw new common_1.NotFoundException('Menu category not found');
            if (updates.isDefault) {
                await this.prisma.identity.customerMenuCategory.updateMany({
                    where: { tenantId: existing.tenantId, isDefault: true, id: { not: id } },
                    data: { isDefault: false },
                });
            }
            return this.prisma.identity.customerMenuCategory.update({
                where: { id },
                data: {
                    ...(updates.name !== undefined ? { name: updates.name } : {}),
                    ...(updates.nameHi !== undefined ? { nameHi: updates.nameHi } : {}),
                    ...(updates.description !== undefined ? { description: updates.description } : {}),
                    ...(updates.icon !== undefined ? { icon: updates.icon } : {}),
                    ...(updates.color !== undefined ? { color: updates.color } : {}),
                    ...(updates.enabledRoutes !== undefined ? { enabledRoutes: updates.enabledRoutes } : {}),
                    ...(updates.isDefault !== undefined ? { isDefault: updates.isDefault } : {}),
                    ...(updates.isActive !== undefined ? { isActive: updates.isActive } : {}),
                    ...(updates.sortOrder !== undefined ? { sortOrder: updates.sortOrder } : {}),
                },
            });
        }
        catch (error) {
            this.logger.error(`UpdateMenuCategoryHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateMenuCategoryHandler = UpdateMenuCategoryHandler;
exports.UpdateMenuCategoryHandler = UpdateMenuCategoryHandler = UpdateMenuCategoryHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_menu_category_command_1.UpdateMenuCategoryCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateMenuCategoryHandler);
//# sourceMappingURL=update-menu-category.handler.js.map