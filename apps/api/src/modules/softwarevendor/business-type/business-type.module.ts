import { Module } from '@nestjs/common';
import { BusinessTypeController } from './presentation/business-type.controller';
import { BusinessTypeService } from './services/business-type.service';
import { TerminologyService } from './services/terminology.service';
import { IndustryConfigService } from './services/industry-config.service';

@Module({
  controllers: [BusinessTypeController],
  providers: [BusinessTypeService, TerminologyService, IndustryConfigService],
  exports: [BusinessTypeService, TerminologyService, IndustryConfigService],
})
export class BusinessTypeModule {}
