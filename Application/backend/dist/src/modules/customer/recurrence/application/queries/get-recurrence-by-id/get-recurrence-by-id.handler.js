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
var GetRecurrenceByIdHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRecurrenceByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_recurrence_by_id_query_1 = require("./get-recurrence-by-id.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetRecurrenceByIdHandler = GetRecurrenceByIdHandler_1 = class GetRecurrenceByIdHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetRecurrenceByIdHandler_1.name);
    }
    async execute(query) {
        try {
            const event = await this.prisma.working.recurringEvent.findUnique({
                where: { id: query.id },
                include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
            });
            if (!event)
                throw new common_1.NotFoundException('Recurring event not found');
            return event;
        }
        catch (error) {
            this.logger.error(`GetRecurrenceByIdHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetRecurrenceByIdHandler = GetRecurrenceByIdHandler;
exports.GetRecurrenceByIdHandler = GetRecurrenceByIdHandler = GetRecurrenceByIdHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_recurrence_by_id_query_1.GetRecurrenceByIdQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetRecurrenceByIdHandler);
//# sourceMappingURL=get-recurrence-by-id.handler.js.map