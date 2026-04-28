import { Module } from '@nestjs/common';
import { PcConfigController } from './pc-config.controller';
import { PcConfigService } from './pc-config.service';
import { WlDomainService } from './wl-domain.service';
import { WlDbProvisioningService } from '../identity/tenant/services/wl-db-provisioning.service';
import { PrismaClientFactory } from '../../../common/database/prisma-client-factory.service';
import { PlatformConsoleModule } from '../../platform-console/platform-console.module';

@Module({
  imports: [PlatformConsoleModule],
  controllers: [PcConfigController],
  providers: [PcConfigService, WlDomainService, WlDbProvisioningService, PrismaClientFactory],
  exports: [PcConfigService, WlDomainService, WlDbProvisioningService, PrismaClientFactory],
})
export class PcConfigModule {}
