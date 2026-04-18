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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailLinkerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let EmailLinkerService = class EmailLinkerService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async autoLink(emailId, participantEmails) {
        for (const addr of participantEmails) {
            const comm = await this.prisma.working.communication.findFirst({
                where: {
                    type: 'EMAIL',
                    value: { equals: addr, mode: 'insensitive' },
                },
                include: {
                    rawContact: {
                        include: {
                            contact: true,
                        },
                    },
                },
            });
            if (comm?.rawContact?.contact) {
                const contact = comm.rawContact.contact;
                const lead = await this.prisma.working.lead.findFirst({
                    where: { contactId: contact.id, status: { notIn: ['WON', 'LOST'] } },
                    orderBy: { createdAt: 'desc' },
                });
                if (lead) {
                    await this.prisma.working.email.update({
                        where: { id: emailId },
                        data: { linkedEntityType: 'LEAD', linkedEntityId: lead.id, autoLinked: true },
                    });
                    return { entityType: 'LEAD', entityId: lead.id };
                }
                await this.prisma.working.email.update({
                    where: { id: emailId },
                    data: { linkedEntityType: 'CONTACT', linkedEntityId: contact.id, autoLinked: true },
                });
                return { entityType: 'CONTACT', entityId: contact.id };
            }
            const orgComm = await this.prisma.working.communication.findFirst({
                where: {
                    type: 'EMAIL',
                    value: { equals: addr, mode: 'insensitive' },
                    organizationId: { not: null },
                },
            });
            const org = orgComm?.organizationId ? await this.prisma.working.organization.findUnique({
                where: { id: orgComm.organizationId },
            }) : null;
            if (org) {
                await this.prisma.working.email.update({
                    where: { id: emailId },
                    data: { linkedEntityType: 'ORGANIZATION', linkedEntityId: org.id, autoLinked: true },
                });
                return { entityType: 'ORGANIZATION', entityId: org.id };
            }
        }
        return {};
    }
    async manualLink(emailId, entityType, entityId) {
        await this.prisma.working.email.update({
            where: { id: emailId },
            data: { linkedEntityType: entityType, linkedEntityId: entityId, autoLinked: false },
        });
    }
    async unlink(emailId) {
        await this.prisma.working.email.update({
            where: { id: emailId },
            data: { linkedEntityType: null, linkedEntityId: null, autoLinked: false, activityId: null },
        });
    }
};
exports.EmailLinkerService = EmailLinkerService;
exports.EmailLinkerService = EmailLinkerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmailLinkerService);
//# sourceMappingURL=email-linker.service.js.map