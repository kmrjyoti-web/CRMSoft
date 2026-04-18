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
var GetCommunicationsByEntityHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCommunicationsByEntityHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_communications_by_entity_query_1 = require("./get-communications-by-entity.query");
let GetCommunicationsByEntityHandler = GetCommunicationsByEntityHandler_1 = class GetCommunicationsByEntityHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetCommunicationsByEntityHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {};
            switch (query.entityType) {
                case 'rawContact':
                    where.rawContactId = query.entityId;
                    break;
                case 'contact':
                    where.contactId = query.entityId;
                    break;
                case 'organization':
                    where.organizationId = query.entityId;
                    break;
                case 'lead':
                    where.leadId = query.entityId;
                    break;
            }
            if (query.type)
                where.type = query.type;
            const communications = await this.prisma.working.communication.findMany({
                where,
                orderBy: [{ isPrimary: 'desc' }, { type: 'asc' }, { createdAt: 'asc' }],
                select: {
                    id: true,
                    type: true,
                    value: true,
                    priorityType: true,
                    isPrimary: true,
                    isVerified: true,
                    label: true,
                    rawContactId: true,
                    contactId: true,
                    organizationId: true,
                    leadId: true,
                    createdAt: true,
                },
            });
            return communications;
        }
        catch (error) {
            this.logger.error(`GetCommunicationsByEntityHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetCommunicationsByEntityHandler = GetCommunicationsByEntityHandler;
exports.GetCommunicationsByEntityHandler = GetCommunicationsByEntityHandler = GetCommunicationsByEntityHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_communications_by_entity_query_1.GetCommunicationsByEntityQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetCommunicationsByEntityHandler);
//# sourceMappingURL=get-communications-by-entity.handler.js.map