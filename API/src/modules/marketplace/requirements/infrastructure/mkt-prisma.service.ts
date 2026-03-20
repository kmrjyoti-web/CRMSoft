import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';

// @ts-ignore — generated after `prisma generate --schema=prisma/schemas/marketplace.prisma`
import { PrismaClient as MarketplaceClient } from '@prisma/marketplace-client';

/**
 * Dedicated PrismaService for the Marketplace (5th) Database.
 * Used only inside src/modules/marketplace/** handlers.
 */
@Injectable()
export class MktPrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MktPrismaService.name);
  private _client: MarketplaceClient;

  constructor() {
    this._client = new MarketplaceClient({
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
      datasources: {
        db: { url: process.env.MARKETPLACE_DATABASE_URL || process.env.DATABASE_URL || '' },
      },
    });
  }

  async onModuleInit() {
    await this._client.$connect();
    this.logger.log('MarketplaceDB connected');
  }

  async onModuleDestroy() {
    await this._client.$disconnect();
    this.logger.log('MarketplaceDB disconnected');
  }

  get client(): MarketplaceClient {
    return this._client;
  }
}
