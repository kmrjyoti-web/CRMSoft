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
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
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
