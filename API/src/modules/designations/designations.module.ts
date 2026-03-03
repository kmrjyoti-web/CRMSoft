import { Module } from '@nestjs/common';
import { DesignationsController } from './presentation/designations.controller';

@Module({
  controllers: [DesignationsController],
})
export class DesignationsModule {}
