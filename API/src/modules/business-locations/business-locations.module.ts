import { Module } from '@nestjs/common';
import { LocationsController } from './presentation/locations.controller';

@Module({
  controllers: [LocationsController],
})
export class BusinessLocationsModule {}
