import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetCommunicationsByEntityQuery } from './get-communications-by-entity.query';

@QueryHandler(GetCommunicationsByEntityQuery)
export class GetCommunicationsByEntityHandler implements IQueryHandler<GetCommunicationsByEntityQuery> {
    private readonly logger = new Logger(GetCommunicationsByEntityHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetCommunicationsByEntityQuery) {
    try {
      const where: any = {};

      // Set entity filter
      switch (query.entityType) {
        case 'rawContact': where.rawContactId = query.entityId; break;
        case 'contact': where.contactId = query.entityId; break;
        case 'organization': where.organizationId = query.entityId; break;
        case 'lead': where.leadId = query.entityId; break;
      }

      // Filter by type (PHONE, EMAIL, etc.)
      if (query.type) where.type = query.type;

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
    } catch (error) {
      this.logger.error(`GetCommunicationsByEntityHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
