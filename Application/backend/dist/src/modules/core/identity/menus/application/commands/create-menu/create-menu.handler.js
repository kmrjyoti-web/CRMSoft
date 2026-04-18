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
var CreateMenuHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMenuHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_menu_command_1 = require("./create-menu.command");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let CreateMenuHandler = CreateMenuHandler_1 = class CreateMenuHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateMenuHandler_1.name);
    }
    async execute(cmd) {
        try {
            const name = cmd.name.trim();
            const code = cmd.code?.trim().toUpperCase()
                || name.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/(^_|_$)/g, '');
            const existing = await this.prisma.identity.menu.findFirst({ where: { code } });
            if (existing) {
                throw new common_1.ConflictException(`Menu with code "${code}" already exists`);
            }
            if (cmd.parentId) {
                const parent = await this.prisma.identity.menu.findUnique({ where: { id: cmd.parentId } });
                if (!parent)
                    throw new common_1.NotFoundException('Parent menu not found');
            }
            return this.prisma.identity.menu.create({
                data: {
                    name,
                    code,
                    icon: cmd.icon,
                    route: cmd.route,
                    parentId: cmd.parentId,
                    sortOrder: cmd.sortOrder ?? 0,
                    menuType: cmd.menuType ?? 'ITEM',
                    permissionModule: cmd.permissionModule,
                    permissionAction: cmd.permissionAction ?? (cmd.permissionModule ? 'view' : undefined),
                    badgeColor: cmd.badgeColor,
                    badgeText: cmd.badgeText,
                    openInNewTab: cmd.openInNewTab ?? false,
                },
            });
        }
        catch (error) {
            this.logger.error(`CreateMenuHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateMenuHandler = CreateMenuHandler;
exports.CreateMenuHandler = CreateMenuHandler = CreateMenuHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_menu_command_1.CreateMenuCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateMenuHandler);
//# sourceMappingURL=create-menu.handler.js.map