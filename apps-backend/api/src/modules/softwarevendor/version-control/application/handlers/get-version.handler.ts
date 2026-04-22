// @ts-nocheck
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { GetVersionQuery, GetCurrentVersionQuery } from '../queries/get-version.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@QueryHandler(GetVersionQuery)
export class GetVersionHandler implements IQueryHandler<GetVersionQuery> {
  private readonly logger = new Logger(GetVersionHandler.name);
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetVersionQuery) {
    try {
      const version = await this.prisma.platform.appVersion.findUnique({
        where: { id: query.id },
        include: { patches: true },
      });
      if (!version) throw new NotFoundException(`Version ${query.id} not found`);
      return version;
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`GetVersionHandler failed: ${err.message}`, err.stack);
      throw error;
    }
  }
}

@QueryHandler(GetCurrentVersionQuery)
export class GetCurrentVersionHandler implements IQueryHandler<GetCurrentVersionQuery> {
  private readonly logger = new Logger(GetCurrentVersionHandler.name);
  constructor(private readonly prisma: PrismaService) {}

  async execute(_query: GetCurrentVersionQuery) {
    try {
      const version = await this.prisma.platform.appVersion.findFirst({
        where: { status: 'LIVE' },
        orderBy: { deployedAt: 'desc' },
      });
      return version ?? { status: 'NO_LIVE_VERSION', message: 'No version is currently LIVE' };
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`GetCurrentVersionHandler failed: ${err.message}`, err.stack);
      throw error;
    }
  }
}
