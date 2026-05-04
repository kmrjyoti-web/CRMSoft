import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CustomerPortalService } from './customer-portal.service';
import { AdminPortalController } from './presentation/admin-portal.controller';
import { PortalController } from './presentation/portal.controller';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AdminPortalController, PortalController],
  providers: [CustomerPortalService],
  exports: [CustomerPortalService],
})
export class CustomerPortalModule {}
