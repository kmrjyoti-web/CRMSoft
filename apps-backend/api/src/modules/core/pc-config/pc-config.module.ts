import { Module } from '@nestjs/common';
import { PcConfigController } from './pc-config.controller';
import { PcConfigService } from './pc-config.service';
import { WlDomainService } from './wl-domain.service';
import { PlatformConsoleModule } from '../../platform-console/platform-console.module';

@Module({
  imports: [PlatformConsoleModule],
  controllers: [PcConfigController],
  providers: [PcConfigService, WlDomainService],
  exports: [PcConfigService, WlDomainService],
})
export class PcConfigModule {}
