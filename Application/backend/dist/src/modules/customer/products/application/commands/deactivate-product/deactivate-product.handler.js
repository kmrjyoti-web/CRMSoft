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
var DeactivateProductHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeactivateProductHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const deactivate_product_command_1 = require("./deactivate-product.command");
let DeactivateProductHandler = DeactivateProductHandler_1 = class DeactivateProductHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DeactivateProductHandler_1.name);
    }
    async execute(command) {
        try {
            const { id } = command;
            const product = await this.prisma.working.product.findUnique({ where: { id } });
            if (!product) {
                throw new common_1.NotFoundException(`Product "${id}" not found`);
            }
            await this.prisma.working.product.update({
                where: { id },
                data: { isActive: false, status: 'INACTIVE' },
            });
            await this.prisma.working.product.updateMany({
                where: { parentId: id },
                data: { isActive: false, status: 'INACTIVE' },
            });
            this.logger.log(`Product deactivated (with children): ${id}`);
            return { id, deactivated: true };
        }
        catch (error) {
            this.logger.error(`DeactivateProductHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeactivateProductHandler = DeactivateProductHandler;
exports.DeactivateProductHandler = DeactivateProductHandler = DeactivateProductHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(deactivate_product_command_1.DeactivateProductCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeactivateProductHandler);
//# sourceMappingURL=deactivate-product.handler.js.map