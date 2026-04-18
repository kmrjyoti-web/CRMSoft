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
var GetRawContactByIdHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRawContactByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_raw_contact_by_id_query_1 = require("./get-raw-contact-by-id.query");
let GetRawContactByIdHandler = GetRawContactByIdHandler_1 = class GetRawContactByIdHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetRawContactByIdHandler_1.name);
    }
    async execute(query) {
        try {
            const rc = await this.prisma.working.rawContact.findUnique({
                where: { id: query.rawContactId },
                include: {
                    communications: {
                        orderBy: { createdAt: 'asc' },
                        select: {
                            id: true, type: true, value: true, priorityType: true,
                            isPrimary: true, isVerified: true, label: true,
                        },
                    },
                    filters: {
                        include: {
                            lookupValue: { select: { id: true, value: true, label: true } },
                        },
                    },
                    contact: { select: { id: true, firstName: true, lastName: true } },
                },
            });
            if (!rc)
                throw new common_1.NotFoundException(`RawContact ${query.rawContactId} not found`);
            return rc;
        }
        catch (error) {
            this.logger.error(`GetRawContactByIdHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetRawContactByIdHandler = GetRawContactByIdHandler;
exports.GetRawContactByIdHandler = GetRawContactByIdHandler = GetRawContactByIdHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_raw_contact_by_id_query_1.GetRawContactByIdQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetRawContactByIdHandler);
//# sourceMappingURL=get-raw-contact-by-id.handler.js.map