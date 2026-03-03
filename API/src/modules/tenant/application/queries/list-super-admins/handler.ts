import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { ListSuperAdminsQuery } from './query';

@QueryHandler(ListSuperAdminsQuery)
export class ListSuperAdminsHandler implements IQueryHandler<ListSuperAdminsQuery> {
  private readonly logger = new Logger(ListSuperAdminsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(_query: ListSuperAdminsQuery) {
    this.logger.log('Listing super admins');

    return this.prisma.superAdmin.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLoginAt: true,
      },
    });
  }
}
