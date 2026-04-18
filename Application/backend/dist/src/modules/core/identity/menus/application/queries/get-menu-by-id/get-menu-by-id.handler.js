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
var GetMenuByIdHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMenuByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_menu_by_id_query_1 = require("./get-menu-by-id.query");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let GetMenuByIdHandler = GetMenuByIdHandler_1 = class GetMenuByIdHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetMenuByIdHandler_1.name);
    }
    async execute(query) {
        try {
            const menu = await this.prisma.identity.menu.findUnique({
                where: { id: query.id },
                include: {
                    parent: { select: { id: true, name: true, code: true } },
                    children: {
                        select: {
                            id: true, name: true, code: true, icon: true, route: true,
                            menuType: true, sortOrder: true, isActive: true,
                        },
                        orderBy: { sortOrder: 'asc' },
                    },
                },
            });
            if (!menu)
                throw new common_1.NotFoundException('Menu not found');
            return menu;
        }
        catch (error) {
            this.logger.error(`GetMenuByIdHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetMenuByIdHandler = GetMenuByIdHandler;
exports.GetMenuByIdHandler = GetMenuByIdHandler = GetMenuByIdHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_menu_by_id_query_1.GetMenuByIdQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetMenuByIdHandler);
//# sourceMappingURL=get-menu-by-id.handler.js.map