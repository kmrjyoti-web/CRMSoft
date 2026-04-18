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
exports.WaEntityLinkerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let WaEntityLinkerService = class WaEntityLinkerService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    normalizePhone(phone) {
        const digits = phone.replace(/\D/g, '');
        return digits.length >= 10 ? digits.slice(-10) : digits;
    }
    async autoLinkByPhone(conversationId, phoneNumber) {
        const normalized = this.normalizePhone(phoneNumber);
        const comm = await this.prisma.working.communication.findFirst({
            where: {
                type: { in: ['PHONE', 'MOBILE', 'WHATSAPP'] },
                value: { endsWith: normalized },
            },
            include: {
                rawContact: {
                    include: { contact: true },
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
                await this.prisma.working.waConversation.update({
                    where: { id: conversationId },
                    data: { linkedEntityType: 'LEAD', linkedEntityId: lead.id },
                });
                return { entityType: 'LEAD', entityId: lead.id };
            }
            await this.prisma.working.waConversation.update({
                where: { id: conversationId },
                data: { linkedEntityType: 'CONTACT', linkedEntityId: contact.id },
            });
            return { entityType: 'CONTACT', entityId: contact.id };
        }
        const orgComm = await this.prisma.working.communication.findFirst({
            where: {
                type: { in: ['PHONE', 'MOBILE', 'WHATSAPP'] },
                value: { endsWith: normalized },
                organizationId: { not: null },
            },
        });
        if (orgComm?.organizationId) {
            await this.prisma.working.waConversation.update({
                where: { id: conversationId },
                data: { linkedEntityType: 'ORGANIZATION', linkedEntityId: orgComm.organizationId },
            });
            return { entityType: 'ORGANIZATION', entityId: orgComm.organizationId };
        }
        return {};
    }
    async manualLink(conversationId, entityType, entityId) {
        await this.prisma.working.waConversation.update({
            where: { id: conversationId },
            data: { linkedEntityType: entityType, linkedEntityId: entityId },
        });
    }
    async unlink(conversationId) {
        await this.prisma.working.waConversation.update({
            where: { id: conversationId },
            data: { linkedEntityType: null, linkedEntityId: null },
        });
    }
};
exports.WaEntityLinkerService = WaEntityLinkerService;
exports.WaEntityLinkerService = WaEntityLinkerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WaEntityLinkerService);
//# sourceMappingURL=wa-entity-linker.service.js.map