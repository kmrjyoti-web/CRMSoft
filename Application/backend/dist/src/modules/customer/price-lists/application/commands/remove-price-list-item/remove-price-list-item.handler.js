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
var RemovePriceListItemHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemovePriceListItemHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const remove_price_list_item_command_1 = require("./remove-price-list-item.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let RemovePriceListItemHandler = RemovePriceListItemHandler_1 = class RemovePriceListItemHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RemovePriceListItemHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.working.priceListItem.findUnique({
                where: { id: cmd.itemId },
            });
            if (!existing)
                throw new common_1.NotFoundException('PriceListItem not found');
            await this.prisma.working.priceListItem.delete({ where: { id: cmd.itemId } });
            return { id: cmd.itemId, deleted: true };
        }
        catch (error) {
            this.logger.error(`RemovePriceListItemHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RemovePriceListItemHandler = RemovePriceListItemHandler;
exports.RemovePriceListItemHandler = RemovePriceListItemHandler = RemovePriceListItemHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(remove_price_list_item_command_1.RemovePriceListItemCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RemovePriceListItemHandler);
//# sourceMappingURL=remove-price-list-item.handler.js.map