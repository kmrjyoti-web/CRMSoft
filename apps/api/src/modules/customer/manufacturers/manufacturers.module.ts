import { Module } from '@nestjs/common';
import { ManufacturersController } from './presentation/manufacturers.controller';

@Module({
  controllers: [ManufacturersController],
})
export class ManufacturersModule {}
