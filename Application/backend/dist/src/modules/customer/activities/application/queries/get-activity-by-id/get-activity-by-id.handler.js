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
var GetActivityByIdHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetActivityByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_activity_by_id_query_1 = require("./get-activity-by-id.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetActivityByIdHandler = GetActivityByIdHandler_1 = class GetActivityByIdHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetActivityByIdHandler_1.name);
    }
    async execute(query) {
        try {
            const activity = await this.prisma.working.activity.findUnique({
                where: { id: query.id },
                include: {
                    lead: { select: { id: true, leadNumber: true, status: true } },
                    contact: { select: { id: true, firstName: true, lastName: true } },
                    createdByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
                },
            });
            if (!activity)
                throw new common_1.NotFoundException('Activity not found');
            return activity;
        }
        catch (error) {
            this.logger.error(`GetActivityByIdHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetActivityByIdHandler = GetActivityByIdHandler;
exports.GetActivityByIdHandler = GetActivityByIdHandler = GetActivityByIdHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_activity_by_id_query_1.GetActivityByIdQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetActivityByIdHandler);
//# sourceMappingURL=get-activity-by-id.handler.js.map