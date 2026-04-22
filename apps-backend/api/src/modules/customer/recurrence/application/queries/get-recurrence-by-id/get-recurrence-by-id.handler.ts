// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { GetRecurrenceByIdQuery } from './get-recurrence-by-id.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetRecurrenceByIdQuery)
export class GetRecurrenceByIdHandler implements IQueryHandler<GetRecurrenceByIdQuery> {
    private readonly logger = new Logger(GetRecurrenceByIdHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetRecurrenceByIdQuery) {
    try {
      const event = await this.prisma.working.recurringEvent.findUnique({
        where: { id: query.id },
        include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
      });
      if (!event) throw new NotFoundException('Recurring event not found');
      return event;
    } catch (error) {
      this.logger.error(`GetRecurrenceByIdHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
