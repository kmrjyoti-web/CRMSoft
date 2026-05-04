import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class EmailLinkerService {
  constructor(private readonly prisma: PrismaService) {}

  async autoLink(emailId: string, participantEmails: string[]): Promise<{ entityType?: string; entityId?: string }> {
    for (const addr of participantEmails) {
      // Search in Communications table for matching email
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

        // Check if there's an active lead linked to this contact
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

        // Link to contact
        await this.prisma.working.email.update({
          where: { id: emailId },
          data: { linkedEntityType: 'CONTACT', linkedEntityId: contact.id, autoLinked: true },
        });
        return { entityType: 'CONTACT', entityId: contact.id };
      }

      // Search in Organization via Communications
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

  async manualLink(emailId: string, entityType: string, entityId: string): Promise<void> {
    await this.prisma.working.email.update({
      where: { id: emailId },
      data: { linkedEntityType: entityType, linkedEntityId: entityId, autoLinked: false },
    });
  }

  async unlink(emailId: string): Promise<void> {
    await this.prisma.working.email.update({
      where: { id: emailId },
      data: { linkedEntityType: null, linkedEntityId: null, autoLinked: false, activityId: null },
    });
  }
}
