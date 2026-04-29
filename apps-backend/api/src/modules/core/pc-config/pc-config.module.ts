import { Module } from '@nestjs/common';
import { PcConfigController } from './pc-config.controller';
import { PcConfigService } from './pc-config.service';
import { WlDomainService } from './wl-domain.service';
import { WlDbProvisioningService } from '../identity/tenant/services/wl-db-provisioning.service';
import { TenantDataMigrationService } from '../identity/tenant/services/tenant-data-migration.service';
import { PrismaClientFactory } from '../../../common/database/prisma-client-factory.service';
import { FeatureGateService } from '../../../common/guards/feature-gate.service';
import { ErrorCenterService } from '../../platform-console/error-center/error-center.service';
import { PlatformConsoleModule } from '../../platform-console/platform-console.module';

@Module({
  imports: [PlatformConsoleModule],
  controllers: [PcConfigController],
  providers: [
    PcConfigService, WlDomainService, WlDbProvisioningService,
    TenantDataMigrationService, PrismaClientFactory, FeatureGateService, ErrorCenterService,
  ],
  exports: [
    PcConfigService, WlDomainService, WlDbProvisioningService,
    PrismaClientFactory, FeatureGateService,
  ],
})
export class PcConfigModule {}
