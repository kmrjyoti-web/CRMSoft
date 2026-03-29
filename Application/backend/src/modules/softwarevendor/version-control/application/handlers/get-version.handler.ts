// @ts-nocheck
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetVersionQuery, GetCurrentVersionQuery } from '../queries/get-version.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@QueryHandler(GetVersionQuery)
export class GetVersionHandler implements IQueryHandler<GetVersionQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetVersionQuery) {
    const version = await this.prisma.platform.appVersion.findUnique({
      where: { id: query.id },
      include: { patches: true },
    });
    if (!version) throw new NotFoundException(`Version ${query.id} not found`);
    return version;
  }
}

@QueryHandler(GetCurrentVersionQuery)
export class GetCurrentVersionHandler implements IQueryHandler<GetCurrentVersionQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(_query: GetCurrentVersionQuery) {
    const version = await this.prisma.platform.appVersion.findFirst({
      where: { status: 'LIVE' },
      orderBy: { deployedAt: 'desc' },
    });
    return version ?? { status: 'NO_LIVE_VERSION', message: 'No version is currently LIVE' };
  }
}
