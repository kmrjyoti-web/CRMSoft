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
var DeactivateActivityHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeactivateActivityHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const deactivate_activity_command_1 = require("./deactivate-activity.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let DeactivateActivityHandler = DeactivateActivityHandler_1 = class DeactivateActivityHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DeactivateActivityHandler_1.name);
    }
    async execute(command) {
        try {
            const activity = await this.prisma.working.activity.findUnique({ where: { id: command.activityId } });
            if (!activity)
                throw new common_1.NotFoundException(`Activity ${command.activityId} not found`);
            if (!activity.isActive) {
                throw new Error('Activity is already inactive');
            }
            await this.prisma.working.activity.update({
                where: { id: command.activityId },
                data: { isActive: false, updatedAt: new Date() },
            });
            this.logger.log(`Activity ${command.activityId} deactivated`);
        }
        catch (error) {
            this.logger.error(`DeactivateActivityHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeactivateActivityHandler = DeactivateActivityHandler;
exports.DeactivateActivityHandler = DeactivateActivityHandler = DeactivateActivityHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(deactivate_activity_command_1.DeactivateActivityCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeactivateActivityHandler);
//# sourceMappingURL=deactivate-activity.handler.js.map