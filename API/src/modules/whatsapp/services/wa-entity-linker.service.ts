import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class WaEntityLinkerService {
  constructor(private readonly prisma: PrismaService) {}

  normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : digits;
  }

  async autoLinkByPhone(conversationId: string, phoneNumber: string): Promise<{ entityType?: string; entityId?: string }> {
    const normalized = this.normalizePhone(phoneNumber);

    // Search Communication table for matching phone
    const comm = await this.prisma.communication.findFirst({
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

      // Check for active lead
      const lead = await this.prisma.lead.findFirst({
        where: { contactId: contact.id, status: { notIn: ['WON', 'LOST'] } },
        orderBy: { createdAt: 'desc' },
      });

      if (lead) {
        await this.prisma.waConversation.update({
          where: { id: conversationId },
          data: { linkedEntityType: 'LEAD', linkedEntityId: lead.id },
        });
        return { entityType: 'LEAD', entityId: lead.id };
      }

      // Link to contact
      await this.prisma.waConversation.update({
        where: { id: conversationId },
        data: { linkedEntityType: 'CONTACT', linkedEntityId: contact.id },
      });
      return { entityType: 'CONTACT', entityId: contact.id };
    }

    // Search organization via Communication
    const orgComm = await this.prisma.communication.findFirst({
      where: {
        type: { in: ['PHONE', 'MOBILE', 'WHATSAPP'] },
        value: { endsWith: normalized },
        organizationId: { not: null },
      },
    });

    if (orgComm?.organizationId) {
      await this.prisma.waConversation.update({
        where: { id: conversationId },
        data: { linkedEntityType: 'ORGANIZATION', linkedEntityId: orgComm.organizationId },
      });
      return { entityType: 'ORGANIZATION', entityId: orgComm.organizationId };
    }

    return {};
  }

  async manualLink(conversationId: string, entityType: string, entityId: string): Promise<void> {
    await this.prisma.waConversation.update({
      where: { id: conversationId },
      data: { linkedEntityType: entityType, linkedEntityId: entityId },
    });
  }

  async unlink(conversationId: string): Promise<void> {
    await this.prisma.waConversation.update({
      where: { id: conversationId },
      data: { linkedEntityType: null, linkedEntityId: null },
    });
  }
}
