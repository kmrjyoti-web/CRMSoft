import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetRoleQuery } from './get-role.query';

@QueryHandler(GetRoleQuery)
export class GetRoleHandler implements IQueryHandler<GetRoleQuery> {
    private readonly logger = new Logger(GetRoleHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetRoleQuery) {
    try {
      const role = await this.prisma.identity.role.findFirst({
        where: { id: query.roleId, tenantId: query.tenantId },
        include: {
          permissions: { include: { permission: true } },
          _count: { select: { users: true } },
        },
      });
      if (!role) throw new NotFoundException(`Role ${query.roleId} not found`);
      return { ...(role as any), permissions: (role as any).permissions.map((rp: Record<string, unknown>) => rp.permission) };
    } catch (error) {
      this.logger.error(`GetRoleHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
