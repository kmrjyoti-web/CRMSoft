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
var SoftDeleteUserHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoftDeleteUserHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const soft_delete_user_command_1 = require("./soft-delete-user.command");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let SoftDeleteUserHandler = SoftDeleteUserHandler_1 = class SoftDeleteUserHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SoftDeleteUserHandler_1.name);
    }
    async execute(command) {
        try {
            const user = await this.prisma.identity.user.findUnique({ where: { id: command.userId } });
            if (!user)
                throw new common_1.NotFoundException(`User ${command.userId} not found`);
            if (user.isDeleted) {
                throw new Error('User is already deleted');
            }
            await this.prisma.identity.user.update({
                where: { id: command.userId },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                    deletedById: command.deletedById,
                    updatedAt: new Date(),
                },
            });
            this.logger.log(`User ${command.userId} soft-deleted by ${command.deletedById}`);
        }
        catch (error) {
            this.logger.error(`SoftDeleteUserHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SoftDeleteUserHandler = SoftDeleteUserHandler;
exports.SoftDeleteUserHandler = SoftDeleteUserHandler = SoftDeleteUserHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(soft_delete_user_command_1.SoftDeleteUserCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SoftDeleteUserHandler);
//# sourceMappingURL=soft-delete-user.handler.js.map