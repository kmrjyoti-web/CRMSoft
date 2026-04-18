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
var UpdateMenuHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMenuHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_menu_command_1 = require("./update-menu.command");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let UpdateMenuHandler = UpdateMenuHandler_1 = class UpdateMenuHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateMenuHandler_1.name);
    }
    async execute(cmd) {
        try {
            const menu = await this.prisma.identity.menu.findUnique({ where: { id: cmd.id } });
            if (!menu)
                throw new common_1.NotFoundException('Menu not found');
            if (cmd.data.parentId && cmd.data.parentId !== menu.parentId) {
                if (cmd.data.parentId === cmd.id) {
                    throw new common_1.BadRequestException('Menu cannot be its own parent');
                }
                const parent = await this.prisma.identity.menu.findUnique({ where: { id: cmd.data.parentId } });
                if (!parent)
                    throw new common_1.NotFoundException('Parent menu not found');
                if (await this.isDescendant(cmd.data.parentId, cmd.id)) {
                    throw new common_1.BadRequestException('Circular reference: target parent is a descendant');
                }
            }
            return this.prisma.identity.menu.update({ where: { id: cmd.id }, data: cmd.data });
        }
        catch (error) {
            this.logger.error(`UpdateMenuHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async isDescendant(childId, ancestorId) {
        let current = await this.prisma.identity.menu.findUnique({
            where: { id: childId }, select: { parentId: true },
        });
        while (current?.parentId) {
            if (current.parentId === ancestorId)
                return true;
            current = await this.prisma.identity.menu.findUnique({
                where: { id: current.parentId }, select: { parentId: true },
            });
        }
        return false;
    }
};
exports.UpdateMenuHandler = UpdateMenuHandler;
exports.UpdateMenuHandler = UpdateMenuHandler = UpdateMenuHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_menu_command_1.UpdateMenuCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateMenuHandler);
//# sourceMappingURL=update-menu.handler.js.map