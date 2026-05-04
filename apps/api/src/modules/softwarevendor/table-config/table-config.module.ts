import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../core/prisma/prisma.module';

import { TableConfigController } from './presentation/table-config.controller';
import { DataMaskingController } from './presentation/data-masking.controller';
import { TableConfigService } from './services/table-config.service';
import { DataMaskingService } from './services/data-masking.service';
import { DataMaskingInterceptor } from './data-masking.interceptor';

const SERVICES = [TableConfigService, DataMaskingService, DataMaskingInterceptor];
const CONTROLLERS = [TableConfigController, DataMaskingController];

@Module({
  imports: [PrismaModule],
  controllers: CONTROLLERS,
  providers: SERVICES,
  exports: [TableConfigService, DataMaskingService, DataMaskingInterceptor],
})
export class TableConfigModule {}
