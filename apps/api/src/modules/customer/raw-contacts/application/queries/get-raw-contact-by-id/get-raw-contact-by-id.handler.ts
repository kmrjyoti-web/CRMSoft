// @ts-nocheck
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetRawContactByIdQuery } from './get-raw-contact-by-id.query';

@QueryHandler(GetRawContactByIdQuery)
export class GetRawContactByIdHandler implements IQueryHandler<GetRawContactByIdQuery> {
    private readonly logger = new Logger(GetRawContactByIdHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetRawContactByIdQuery) {
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
          // verifiedBy / createdByUser are in identity DB — use IDs only
        },
      });
      if (!rc) throw new NotFoundException(`RawContact ${query.rawContactId} not found`);
      return rc;
    } catch (error) {
      this.logger.error(`GetRawContactByIdHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
