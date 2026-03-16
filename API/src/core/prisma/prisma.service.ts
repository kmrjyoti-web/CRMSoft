import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Optional, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContextService } from '../../modules/tenant/infrastructure/tenant-context.service';
import { createTenantMiddleware } from '../../modules/tenant/infrastructure/prisma-tenant.middleware';
import { createSoftDeleteMiddleware } from './soft-delete.middleware';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(
    @Optional() @Inject(TenantContextService)
    private readonly tenantContext?: TenantContextService,
  ) {
    // Append connection_limit for Supabase session pooler (free tier has low pool_size)
    let dbUrl = process.env.DATABASE_URL || '';
    if (process.env.NODE_ENV === 'production' && dbUrl && !dbUrl.includes('connection_limit')) {
      const sep = dbUrl.includes('?') ? '&' : '?';
      dbUrl = `${dbUrl}${sep}connection_limit=5&pool_timeout=30`;
    }
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      datasources: { db: { url: dbUrl } },
    });
  }

  async onModuleInit() {
    if (this.tenantContext) {
      this.$use(createTenantMiddleware(this.tenantContext));
      this.logger.log('Tenant middleware registered');
    }
    this.$use(createSoftDeleteMiddleware());
    this.logger.log('Soft-delete middleware registered');
    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
