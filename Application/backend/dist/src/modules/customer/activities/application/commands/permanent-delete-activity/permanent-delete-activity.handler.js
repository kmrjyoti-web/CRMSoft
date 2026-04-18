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
var PermanentDeleteActivityHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermanentDeleteActivityHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const permanent_delete_activity_command_1 = require("./permanent-delete-activity.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let PermanentDeleteActivityHandler = PermanentDeleteActivityHandler_1 = class PermanentDeleteActivityHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PermanentDeleteActivityHandler_1.name);
    }
    async execute(command) {
        try {
            const activity = await this.prisma.working.activity.findUnique({ where: { id: command.activityId } });
            if (!activity)
                throw new common_1.NotFoundException(`Activity ${command.activityId} not found`);
            if (!activity.isDeleted) {
                throw new common_1.BadRequestException('Activity must be soft-deleted before permanent deletion');
            }
            await this.prisma.working.activity.delete({ where: { id: command.activityId } });
            await this.prisma.working.calendarEvent.updateMany({
                where: { eventType: 'ACTIVITY', sourceId: command.activityId },
                data: { isActive: false },
            });
            this.logger.log(`Activity ${command.activityId} permanently deleted`);
        }
        catch (error) {
            this.logger.error(`PermanentDeleteActivityHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.PermanentDeleteActivityHandler = PermanentDeleteActivityHandler;
exports.PermanentDeleteActivityHandler = PermanentDeleteActivityHandler = PermanentDeleteActivityHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(permanent_delete_activity_command_1.PermanentDeleteActivityCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermanentDeleteActivityHandler);
//# sourceMappingURL=permanent-delete-activity.handler.js.map