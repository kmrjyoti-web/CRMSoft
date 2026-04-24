import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '../../../core/prisma/prisma.module';
import { VersionControlController } from './presentation/version-control.controller';
import { CreateVersionHandler } from './application/handlers/create-version.handler';
import { PublishVersionHandler } from './application/handlers/publish-version.handler';
import { RollbackVersionHandler } from './application/handlers/rollback-version.handler';
import { CreatePatchHandler } from './application/handlers/create-patch.handler';
import { ListVersionsHandler } from './application/handlers/list-versions.handler';
import { GetVersionHandler, GetCurrentVersionHandler } from './application/handlers/get-version.handler';

const CommandHandlers = [
  CreateVersionHandler,
  PublishVersionHandler,
  RollbackVersionHandler,
  CreatePatchHandler,
];

const QueryHandlers = [
  ListVersionsHandler,
  GetVersionHandler,
  GetCurrentVersionHandler,
];

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [VersionControlController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class VersionControlModule {}
