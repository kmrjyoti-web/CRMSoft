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
var GetOrgsByContactHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrgsByContactHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_by_contact_query_1 = require("./get-by-contact.query");
let GetOrgsByContactHandler = GetOrgsByContactHandler_1 = class GetOrgsByContactHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetOrgsByContactHandler_1.name);
    }
    async execute(query) {
        try {
            const where = { contactId: query.contactId };
            if (query.activeOnly !== false)
                where.isActive = true;
            return this.prisma.working.contactOrganization.findMany({
                where,
                orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
                include: {
                    organization: {
                        select: {
                            id: true, name: true, city: true, industry: true,
                            isActive: true,
                        },
                    },
                },
            });
        }
        catch (error) {
            this.logger.error(`GetOrgsByContactHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetOrgsByContactHandler = GetOrgsByContactHandler;
exports.GetOrgsByContactHandler = GetOrgsByContactHandler = GetOrgsByContactHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_by_contact_query_1.GetOrgsByContactQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetOrgsByContactHandler);
//# sourceMappingURL=get-by-contact.handler.js.map