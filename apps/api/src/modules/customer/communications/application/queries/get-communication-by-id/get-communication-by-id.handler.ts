import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetCommunicationByIdQuery } from './get-communication-by-id.query';

@QueryHandler(GetCommunicationByIdQuery)
export class GetCommunicationByIdHandler implements IQueryHandler<GetCommunicationByIdQuery> {
    private readonly logger = new Logger(GetCommunicationByIdHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetCommunicationByIdQuery) {
    try {
      const comm = await this.prisma.working.communication.findUnique({
        where: { id: query.communicationId },
        include: {
          contact: { select: { id: true, firstName: true, lastName: true } },
          rawContact: { select: { id: true, firstName: true, lastName: true, status: true } },
          organization: { select: { id: true, name: true } },
          lead: { select: { id: true, leadNumber: true, status: true } },
        },
      });
      if (!comm) throw new NotFoundException(`Communication ${query.communicationId} not found`);
      return comm;
    } catch (error) {
      this.logger.error(`GetCommunicationByIdHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
