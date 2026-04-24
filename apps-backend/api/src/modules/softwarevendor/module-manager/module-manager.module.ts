import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../core/prisma/prisma.module';

import { ModuleManagerController } from './presentation/module-manager.controller';
import { ModuleManagerService } from './services/module-manager.service';

const SERVICES = [ModuleManagerService];
const CONTROLLERS = [ModuleManagerController];

@Module({
  imports: [PrismaModule],
  controllers: CONTROLLERS,
  providers: SERVICES,
  exports: [ModuleManagerService],
})
export class ModuleManagerModule {}
