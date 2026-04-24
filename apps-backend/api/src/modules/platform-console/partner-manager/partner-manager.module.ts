import { Module } from '@nestjs/common';
import { PartnerManagerController } from './partner-manager.controller';
import { PartnerManagerService } from './partner-manager.service';

@Module({
  controllers: [PartnerManagerController],
  providers: [PartnerManagerService],
  exports: [PartnerManagerService],
})
export class PartnerManagerModule {}
