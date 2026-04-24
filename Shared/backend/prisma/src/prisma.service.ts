import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Base PrismaService for @crmsoft/* SDK consumers.
 *
 * For multi-schema architectures (identity + platform + working DBs),
 * extend this class or instantiate separate PrismaClient instances per DB.
 *
 * The full multi-schema PrismaService lives in Application/backend/src/core/prisma/
 * and uses generated @prisma/identity-client, @prisma/platform-client etc.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(databaseUrl?: string) {
    super({
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
      datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
