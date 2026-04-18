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
var CreateRecurrenceHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRecurrenceHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_recurrence_command_1 = require("./create-recurrence.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let CreateRecurrenceHandler = CreateRecurrenceHandler_1 = class CreateRecurrenceHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateRecurrenceHandler_1.name);
    }
    async execute(cmd) {
        try {
            return this.prisma.working.recurringEvent.create({
                data: {
                    entityType: cmd.entityType,
                    entityId: cmd.entityId,
                    pattern: cmd.pattern,
                    interval: cmd.interval || 1,
                    daysOfWeek: cmd.daysOfWeek,
                    dayOfMonth: cmd.dayOfMonth,
                    startDate: cmd.startDate,
                    endDate: cmd.endDate,
                    nextOccurrence: cmd.startDate,
                    maxOccurrences: cmd.maxOccurrences,
                    createdById: cmd.createdById,
                    templateData: cmd.templateData,
                },
            });
        }
        catch (error) {
            this.logger.error(`CreateRecurrenceHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateRecurrenceHandler = CreateRecurrenceHandler;
exports.CreateRecurrenceHandler = CreateRecurrenceHandler = CreateRecurrenceHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_recurrence_command_1.CreateRecurrenceCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateRecurrenceHandler);
//# sourceMappingURL=create-recurrence.handler.js.map