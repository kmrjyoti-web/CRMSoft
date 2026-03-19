// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetDemoByIdQuery } from './get-demo-by-id.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetDemoByIdQuery)
export class GetDemoByIdHandler implements IQueryHandler<GetDemoByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetDemoByIdQuery) {
    const demo = await this.prisma.demo.findUnique({
      where: { id: query.id },
      include: {
        lead: { select: { id: true, leadNumber: true, status: true } },
        conductedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!demo) throw new NotFoundException('Demo not found');
    return demo;
  }
}
