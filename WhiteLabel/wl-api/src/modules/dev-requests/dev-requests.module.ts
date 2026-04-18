import { Module } from '@nestjs/common';
import { DevRequestsService } from './dev-requests.service';
import { DevRequestsController } from './dev-requests.controller';

@Module({
  providers: [DevRequestsService],
  controllers: [DevRequestsController],
  exports: [DevRequestsService],
})
export class DevRequestsModule {}
