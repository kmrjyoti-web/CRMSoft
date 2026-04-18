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
var ManageProductImagesHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageProductImagesHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const manage_product_images_command_1 = require("./manage-product-images.command");
let ManageProductImagesHandler = ManageProductImagesHandler_1 = class ManageProductImagesHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ManageProductImagesHandler_1.name);
    }
    async execute(command) {
        try {
            const { productId, images } = command;
            const product = await this.prisma.working.product.findUnique({
                where: { id: productId },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product "${productId}" not found`);
            }
            const updated = await this.prisma.working.product.update({
                where: { id: productId },
                data: { images: images },
            });
            this.logger.log(`Product images updated: ${productId}`);
            return updated;
        }
        catch (error) {
            this.logger.error(`ManageProductImagesHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ManageProductImagesHandler = ManageProductImagesHandler;
exports.ManageProductImagesHandler = ManageProductImagesHandler = ManageProductImagesHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(manage_product_images_command_1.ManageProductImagesCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ManageProductImagesHandler);
//# sourceMappingURL=manage-product-images.handler.js.map