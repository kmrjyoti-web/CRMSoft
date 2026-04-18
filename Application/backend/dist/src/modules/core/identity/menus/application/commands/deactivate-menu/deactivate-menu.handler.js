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
var DeactivateMenuHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeactivateMenuHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const deactivate_menu_command_1 = require("./deactivate-menu.command");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let DeactivateMenuHandler = DeactivateMenuHandler_1 = class DeactivateMenuHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DeactivateMenuHandler_1.name);
    }
    async execute(cmd) {
        try {
            const menu = await this.prisma.identity.menu.findUnique({ where: { id: cmd.id } });
            if (!menu)
                throw new common_1.NotFoundException('Menu not found');
            const idsToDeactivate = await this.collectDescendantIds(cmd.id);
            idsToDeactivate.push(cmd.id);
            await this.prisma.identity.menu.updateMany({
                where: { id: { in: idsToDeactivate } },
                data: { isActive: false },
            });
            return { deactivated: idsToDeactivate.length };
        }
        catch (error) {
            this.logger.error(`DeactivateMenuHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async collectDescendantIds(parentId) {
        const children = await this.prisma.identity.menu.findMany({
            where: { parentId }, select: { id: true },
        });
        const ids = [];
        for (const child of children) {
            ids.push(child.id);
            ids.push(...(await this.collectDescendantIds(child.id)));
        }
        return ids;
    }
};
exports.DeactivateMenuHandler = DeactivateMenuHandler;
exports.DeactivateMenuHandler = DeactivateMenuHandler = DeactivateMenuHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(deactivate_menu_command_1.DeactivateMenuCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeactivateMenuHandler);
//# sourceMappingURL=deactivate-menu.handler.js.map