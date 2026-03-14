import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { LocationsController } from './presentation/locations.controller';
import { CompanyLocationsController } from './presentation/company-locations.controller';
import { CompanyLocationsService } from './services/company-locations.service';

@Module({
  imports: [PrismaModule],
  controllers: [LocationsController, CompanyLocationsController],
  providers: [CompanyLocationsService],
  exports: [CompanyLocationsService],
})
export class BusinessLocationsModule {}
