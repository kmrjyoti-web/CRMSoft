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
var GetRecurrenceListHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRecurrenceListHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_recurrence_list_query_1 = require("./get-recurrence-list.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetRecurrenceListHandler = GetRecurrenceListHandler_1 = class GetRecurrenceListHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetRecurrenceListHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {};
            if (query.createdById)
                where.createdById = query.createdById;
            if (query.pattern)
                where.pattern = query.pattern;
            if (query.isActive !== undefined)
                where.isActive = query.isActive;
            const [data, total] = await Promise.all([
                this.prisma.working.recurringEvent.findMany({
                    where,
                    orderBy: { nextOccurrence: 'asc' },
                    skip: (query.page - 1) * query.limit,
                    take: query.limit,
                }),
                this.prisma.working.recurringEvent.count({ where }),
            ]);
            return { data, total, page: query.page, limit: query.limit };
        }
        catch (error) {
            this.logger.error(`GetRecurrenceListHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetRecurrenceListHandler = GetRecurrenceListHandler;
exports.GetRecurrenceListHandler = GetRecurrenceListHandler = GetRecurrenceListHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_recurrence_list_query_1.GetRecurrenceListQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetRecurrenceListHandler);
//# sourceMappingURL=get-recurrence-list.handler.js.map