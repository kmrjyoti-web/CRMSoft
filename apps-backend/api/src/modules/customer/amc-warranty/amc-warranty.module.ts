import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../core/prisma/prisma.module';
import { WarrantyTemplateController } from './presentation/warranty-template.controller';
import { WarrantyRecordController } from './presentation/warranty-record.controller';
import { WarrantyClaimController } from './presentation/warranty-claim.controller';
import { AMCPlanController } from './presentation/amc-plan.controller';
import { AMCContractController } from './presentation/amc-contract.controller';
import { AMCScheduleController } from './presentation/amc-schedule.controller';
import { ServiceVisitController } from './presentation/service-visit.controller';
import { WarrantyTemplateService } from './services/warranty-template.service';
import { WarrantyRecordService } from './services/warranty-record.service';
import { WarrantyClaimService } from './services/warranty-claim.service';
import { AMCPlanService } from './services/amc-plan.service';
import { AMCContractService } from './services/amc-contract.service';
import { AMCScheduleService } from './services/amc-schedule.service';
import { ServiceVisitService } from './services/service-visit.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    WarrantyTemplateController,
    WarrantyRecordController,
    WarrantyClaimController,
    AMCPlanController,
    AMCContractController,
    AMCScheduleController,
    ServiceVisitController,
  ],
  providers: [
    WarrantyTemplateService,
    WarrantyRecordService,
    WarrantyClaimService,
    AMCPlanService,
    AMCContractService,
    AMCScheduleService,
    ServiceVisitService,
  ],
  exports: [WarrantyRecordService, AMCContractService],
})
export class AmcWarrantyModule {}
