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
var DeletePriceListHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletePriceListHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_price_list_command_1 = require("./delete-price-list.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let DeletePriceListHandler = DeletePriceListHandler_1 = class DeletePriceListHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DeletePriceListHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.working.priceList.findFirst({
                where: { id: cmd.id, isDeleted: false },
            });
            if (!existing)
                throw new common_1.NotFoundException('PriceList not found');
            await this.prisma.working.priceList.update({
                where: { id: cmd.id },
                data: { isDeleted: true, deletedAt: new Date() },
            });
            return { id: cmd.id, deleted: true };
        }
        catch (error) {
            this.logger.error(`DeletePriceListHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeletePriceListHandler = DeletePriceListHandler;
exports.DeletePriceListHandler = DeletePriceListHandler = DeletePriceListHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(delete_price_list_command_1.DeletePriceListCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeletePriceListHandler);
//# sourceMappingURL=delete-price-list.handler.js.map