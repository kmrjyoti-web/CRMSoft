import { Module } from '@nestjs/common';
import { BusinessTypeController } from './presentation/business-type.controller';
import { BusinessTypeService } from './services/business-type.service';
import { TerminologyService } from './services/terminology.service';

@Module({
  controllers: [BusinessTypeController],
  providers: [BusinessTypeService, TerminologyService],
  exports: [BusinessTypeService, TerminologyService],
})
export class BusinessTypeModule {}
