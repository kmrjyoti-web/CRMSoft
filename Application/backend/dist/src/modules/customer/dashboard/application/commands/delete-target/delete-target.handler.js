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
var DeleteTargetHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTargetHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const delete_target_command_1 = require("./delete-target.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const common_1 = require("@nestjs/common");
let DeleteTargetHandler = DeleteTargetHandler_1 = class DeleteTargetHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DeleteTargetHandler_1.name);
    }
    async execute(command) {
        try {
            const target = await this.prisma.working.salesTarget.findUnique({ where: { id: command.id } });
            if (!target)
                throw new common_1.NotFoundException('Target not found');
            await this.prisma.working.salesTarget.update({
                where: { id: command.id },
                data: { isActive: false },
            });
            return { deleted: true };
        }
        catch (error) {
            this.logger.error(`DeleteTargetHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeleteTargetHandler = DeleteTargetHandler;
exports.DeleteTargetHandler = DeleteTargetHandler = DeleteTargetHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(delete_target_command_1.DeleteTargetCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeleteTargetHandler);
//# sourceMappingURL=delete-target.handler.js.map