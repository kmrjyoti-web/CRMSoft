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
var SoftDeleteActivityHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoftDeleteActivityHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const soft_delete_activity_command_1 = require("./soft-delete-activity.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let SoftDeleteActivityHandler = SoftDeleteActivityHandler_1 = class SoftDeleteActivityHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SoftDeleteActivityHandler_1.name);
    }
    async execute(command) {
        try {
            const activity = await this.prisma.working.activity.findUnique({ where: { id: command.activityId } });
            if (!activity)
                throw new common_1.NotFoundException(`Activity ${command.activityId} not found`);
            if (activity.isDeleted) {
                throw new Error('Activity is already deleted');
            }
            await this.prisma.working.activity.update({
                where: { id: command.activityId },
                data: {
                    isDeleted: true,
                    isActive: false,
                    deletedAt: new Date(),
                    deletedById: command.deletedById,
                    updatedAt: new Date(),
                },
            });
            this.logger.log(`Activity ${command.activityId} soft-deleted by ${command.deletedById}`);
        }
        catch (error) {
            this.logger.error(`SoftDeleteActivityHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SoftDeleteActivityHandler = SoftDeleteActivityHandler;
exports.SoftDeleteActivityHandler = SoftDeleteActivityHandler = SoftDeleteActivityHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(soft_delete_activity_command_1.SoftDeleteActivityCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SoftDeleteActivityHandler);
//# sourceMappingURL=soft-delete-activity.handler.js.map