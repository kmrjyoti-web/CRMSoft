// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetFollowUpByIdQuery } from './get-follow-up-by-id.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetFollowUpByIdQuery)
export class GetFollowUpByIdHandler implements IQueryHandler<GetFollowUpByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetFollowUpByIdQuery) {
    const followUp = await this.prisma.followUp.findUnique({
      where: { id: query.id },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!followUp) throw new NotFoundException('Follow-up not found');
    return followUp;
  }
}
