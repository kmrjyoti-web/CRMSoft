import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetRecurrenceByIdQuery } from './get-recurrence-by-id.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@QueryHandler(GetRecurrenceByIdQuery)
export class GetRecurrenceByIdHandler implements IQueryHandler<GetRecurrenceByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetRecurrenceByIdQuery) {
    const event = await this.prisma.recurringEvent.findUnique({
      where: { id: query.id },
      include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!event) throw new NotFoundException('Recurring event not found');
    return event;
  }
}
