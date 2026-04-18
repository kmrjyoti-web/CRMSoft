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
var ReorderMenusHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReorderMenusHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const reorder_menus_command_1 = require("./reorder-menus.command");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let ReorderMenusHandler = ReorderMenusHandler_1 = class ReorderMenusHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ReorderMenusHandler_1.name);
    }
    async execute(cmd) {
        try {
            const updates = cmd.orderedIds.map((id, index) => this.prisma.identity.menu.update({ where: { id }, data: { sortOrder: index } }));
            await this.prisma.identity.$transaction(updates);
            return { reordered: cmd.orderedIds.length };
        }
        catch (error) {
            this.logger.error(`ReorderMenusHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ReorderMenusHandler = ReorderMenusHandler;
exports.ReorderMenusHandler = ReorderMenusHandler = ReorderMenusHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(reorder_menus_command_1.ReorderMenusCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReorderMenusHandler);
//# sourceMappingURL=reorder-menus.handler.js.map