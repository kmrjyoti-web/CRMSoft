import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { MasterCodeService } from './services/master-code.service';
import { PcMasterCodeController } from './presentation/pc-master-code.controller';
import { PcResolvedFieldsController } from './presentation/pc-resolved-fields.controller';
import { BrandConfigPublicController } from './presentation/brand-config-public.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    PcMasterCodeController,
    PcResolvedFieldsController,
    BrandConfigPublicController,
  ],
  providers: [MasterCodeService],
  exports: [MasterCodeService],
})
export class PcConfigModule {}
