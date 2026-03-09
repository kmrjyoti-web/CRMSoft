import { Module } from '@nestjs/common';
import { TenantConfigModule } from '../tenant-config/tenant-config.module';
import { PluginService } from './services/plugin.service';
import { PluginHookService } from './services/plugin-hook.service';
import { PluginController } from './presentation/plugin.controller';

@Module({
  imports: [TenantConfigModule],
  controllers: [PluginController],
  providers: [PluginService, PluginHookService],
  exports: [PluginService, PluginHookService],
})
export class PluginsModule {}
