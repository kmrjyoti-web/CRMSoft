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
var PermanentDeleteUserHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermanentDeleteUserHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const permanent_delete_user_command_1 = require("./permanent-delete-user.command");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let PermanentDeleteUserHandler = PermanentDeleteUserHandler_1 = class PermanentDeleteUserHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PermanentDeleteUserHandler_1.name);
    }
    async execute(command) {
        try {
            const user = await this.prisma.identity.user.findUnique({ where: { id: command.userId } });
            if (!user)
                throw new common_1.NotFoundException(`User ${command.userId} not found`);
            if (!user.isDeleted) {
                throw new common_1.BadRequestException('User must be soft-deleted before permanent deletion');
            }
            await this.prisma.identity.user.delete({ where: { id: command.userId } });
            this.logger.log(`User ${command.userId} permanently deleted`);
        }
        catch (error) {
            this.logger.error(`PermanentDeleteUserHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.PermanentDeleteUserHandler = PermanentDeleteUserHandler;
exports.PermanentDeleteUserHandler = PermanentDeleteUserHandler = PermanentDeleteUserHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(permanent_delete_user_command_1.PermanentDeleteUserCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermanentDeleteUserHandler);
//# sourceMappingURL=permanent-delete-user.handler.js.map