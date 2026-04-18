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
var RecurrenceGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurrenceGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const error_utils_1 = require("../../../../../common/utils/error.utils");
let RecurrenceGeneratorService = RecurrenceGeneratorService_1 = class RecurrenceGeneratorService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RecurrenceGeneratorService_1.name);
    }
    async generateOccurrences() {
        const now = new Date();
        const events = await this.prisma.working.recurringEvent.findMany({
            where: {
                isActive: true,
                nextOccurrence: { lte: now },
                OR: [{ endDate: null }, { endDate: { gte: now } }],
                AND: [
                    { OR: [{ maxOccurrences: null }, { occurrenceCount: { lt: this.prisma.working.recurringEvent.fields?.maxOccurrences } }] },
                ],
            },
            take: 100,
        });
        for (const event of events) {
            if (event.maxOccurrences && event.occurrenceCount >= event.maxOccurrences) {
                await this.prisma.working.recurringEvent.update({ where: { id: event.id }, data: { isActive: false } });
                continue;
            }
            try {
                const nextDate = this.calculateNextOccurrence(event);
                await this.prisma.working.recurringEvent.update({
                    where: { id: event.id },
                    data: {
                        lastGenerated: now,
                        nextOccurrence: nextDate,
                        occurrenceCount: { increment: 1 },
                    },
                });
                this.logger.log(`Generated occurrence for recurring event ${event.id}, next: ${nextDate.toISOString()}`);
            }
            catch (error) {
                this.logger.error(`Failed to generate occurrence for ${event.id}: ${(0, error_utils_1.getErrorMessage)(error)}`);
            }
        }
        if (events.length > 0) {
            this.logger.log(`Processed ${events.length} recurring events`);
        }
    }
    calculateNextOccurrence(event) {
        const current = new Date(event.nextOccurrence);
        const interval = event.interval || 1;
        switch (event.pattern) {
            case 'DAILY':
                current.setDate(current.getDate() + interval);
                break;
            case 'WEEKLY':
                current.setDate(current.getDate() + 7 * interval);
                break;
            case 'MONTHLY':
                current.setMonth(current.getMonth() + interval);
                if (event.dayOfMonth) {
                    current.setDate(Math.min(event.dayOfMonth, new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate()));
                }
                break;
        }
        return current;
    }
};
exports.RecurrenceGeneratorService = RecurrenceGeneratorService;
exports.RecurrenceGeneratorService = RecurrenceGeneratorService = RecurrenceGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecurrenceGeneratorService);
//# sourceMappingURL=recurrence-generator.service.js.map