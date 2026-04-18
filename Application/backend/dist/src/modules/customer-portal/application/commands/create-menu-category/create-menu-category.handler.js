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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMenuCategoryHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_menu_category_command_1 = require("./create-menu-category.command");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let CreateMenuCategoryHandler = class CreateMenuCategoryHandler {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute(command) {
        const { tenantId, adminId, name, enabledRoutes, nameHi, description, icon, color, isDefault, sortOrder, } = command;
        if (isDefault) {
            await this.prisma.identity.customerMenuCategory.updateMany({
                where: { tenantId, isDefault: true },
                data: { isDefault: false },
            });
        }
        try {
            const category = await this.prisma.identity.customerMenuCategory.create({
                data: {
                    tenantId,
                    name,
                    nameHi: nameHi ?? null,
                    description: description ?? null,
                    icon: icon ?? null,
                    color: color ?? null,
                    enabledRoutes,
                    isDefault: isDefault ?? false,
                    sortOrder: sortOrder ?? 0,
                    createdById: adminId,
                },
            });
            return category;
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes('Unique constraint')) {
                throw new common_1.ConflictException(`A menu category named "${name}" already exists`);
            }
            throw err;
        }
    }
};
exports.CreateMenuCategoryHandler = CreateMenuCategoryHandler;
exports.CreateMenuCategoryHandler = CreateMenuCategoryHandler = __decorate([
    (0, cqrs_1.CommandHandler)(create_menu_category_command_1.CreateMenuCategoryCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateMenuCategoryHandler);
//# sourceMappingURL=create-menu-category.handler.js.map