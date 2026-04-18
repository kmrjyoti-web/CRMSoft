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
var GetContactByIdHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetContactByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_contact_by_id_query_1 = require("./get-contact-by-id.query");
let GetContactByIdHandler = GetContactByIdHandler_1 = class GetContactByIdHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetContactByIdHandler_1.name);
    }
    async execute(query) {
        try {
            const contact = await this.prisma.working.contact.findUnique({
                where: { id: query.contactId },
                include: {
                    communications: {
                        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
                        select: {
                            id: true, type: true, value: true, priorityType: true,
                            isPrimary: true, isVerified: true, label: true,
                        },
                    },
                    contactOrganizations: {
                        where: { isActive: true },
                        include: {
                            organization: {
                                select: {
                                    id: true, name: true, industry: true, city: true, isActive: true,
                                },
                            },
                        },
                    },
                    leads: {
                        select: {
                            id: true, leadNumber: true, status: true,
                            priority: true, expectedValue: true, createdAt: true,
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 20,
                    },
                    filters: {
                        include: {
                            lookupValue: {
                                select: {
                                    id: true, value: true, label: true,
                                    lookup: { select: { category: true } },
                                },
                            },
                        },
                    },
                    rawContacts: {
                        select: {
                            id: true, status: true, source: true,
                            companyName: true, createdAt: true,
                        },
                        orderBy: { createdAt: 'desc' },
                    },
                    _count: {
                        select: { leads: true, communications: true, activities: true },
                    },
                },
            });
            if (!contact) {
                throw new common_1.NotFoundException(`Contact ${query.contactId} not found`);
            }
            return contact;
        }
        catch (error) {
            this.logger.error(`GetContactByIdHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetContactByIdHandler = GetContactByIdHandler;
exports.GetContactByIdHandler = GetContactByIdHandler = GetContactByIdHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_contact_by_id_query_1.GetContactByIdQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetContactByIdHandler);
//# sourceMappingURL=get-contact-by-id.handler.js.map