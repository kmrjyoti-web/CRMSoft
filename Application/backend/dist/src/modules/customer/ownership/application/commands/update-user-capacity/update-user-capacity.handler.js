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
var UpdateUserCapacityHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserCapacityHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_user_capacity_command_1 = require("./update-user-capacity.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let UpdateUserCapacityHandler = UpdateUserCapacityHandler_1 = class UpdateUserCapacityHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateUserCapacityHandler_1.name);
    }
    async execute(command) {
        try {
            return this.prisma.userCapacity.upsert({
                where: { userId: command.userId },
                create: { userId: command.userId, ...command.data },
                update: command.data,
            });
        }
        catch (error) {
            this.logger.error(`UpdateUserCapacityHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateUserCapacityHandler = UpdateUserCapacityHandler;
exports.UpdateUserCapacityHandler = UpdateUserCapacityHandler = UpdateUserCapacityHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_user_capacity_command_1.UpdateUserCapacityCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateUserCapacityHandler);
//# sourceMappingURL=update-user-capacity.handler.js.map