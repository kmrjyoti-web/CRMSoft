import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetUserQuery } from './get-user.query';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
    private readonly logger = new Logger(GetUserHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUserQuery) {
    try {
      const user = await this.prisma.identity.user.findFirst({
        where: { id: query.userId, tenantId: query.tenantId },
        include: { role: true, department: true, designation: true },
      });
      if (!user) throw new NotFoundException(`User ${query.userId} not found`);
      const { password, ...safe } = user as any;
      return safe;
    } catch (error) {
      this.logger.error(`GetUserHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
