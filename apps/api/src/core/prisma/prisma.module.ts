import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CrossDbResolverService } from './cross-db-resolver.service';
import { TenantContextService } from '../../modules/core/identity/tenant/infrastructure/tenant-context.service';

@Global()
@Module({
  providers: [PrismaService, TenantContextService, CrossDbResolverService],
  exports: [PrismaService, TenantContextService, CrossDbResolverService],
})
export class PrismaModule {}
