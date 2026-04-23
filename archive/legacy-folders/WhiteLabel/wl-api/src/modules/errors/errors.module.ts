import { Module } from '@nestjs/common';
import { ErrorsService } from './errors.service';
import { ErrorsController } from './errors.controller';

@Module({
  providers: [ErrorsService],
  controllers: [ErrorsController],
  exports: [ErrorsService],
})
export class ErrorsModule {}
