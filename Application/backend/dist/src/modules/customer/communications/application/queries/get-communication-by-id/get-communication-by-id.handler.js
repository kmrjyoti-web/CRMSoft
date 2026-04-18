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
var GetCommunicationByIdHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCommunicationByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_communication_by_id_query_1 = require("./get-communication-by-id.query");
let GetCommunicationByIdHandler = GetCommunicationByIdHandler_1 = class GetCommunicationByIdHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetCommunicationByIdHandler_1.name);
    }
    async execute(query) {
        try {
            const comm = await this.prisma.working.communication.findUnique({
                where: { id: query.communicationId },
                include: {
                    contact: { select: { id: true, firstName: true, lastName: true } },
                    rawContact: { select: { id: true, firstName: true, lastName: true, status: true } },
                    organization: { select: { id: true, name: true } },
                    lead: { select: { id: true, leadNumber: true, status: true } },
                },
            });
            if (!comm)
                throw new common_1.NotFoundException(`Communication ${query.communicationId} not found`);
            return comm;
        }
        catch (error) {
            this.logger.error(`GetCommunicationByIdHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetCommunicationByIdHandler = GetCommunicationByIdHandler;
exports.GetCommunicationByIdHandler = GetCommunicationByIdHandler = GetCommunicationByIdHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_communication_by_id_query_1.GetCommunicationByIdQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetCommunicationByIdHandler);
//# sourceMappingURL=get-communication-by-id.handler.js.map