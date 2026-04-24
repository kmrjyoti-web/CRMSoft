import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PartnersController } from './presentation/partners.controller';
import { PartnersService } from './partners.service';

@Module({
  imports: [CqrsModule],
  controllers: [PartnersController],
  providers: [PartnersService],
  exports: [PartnersService],
})
export class PartnersModule {}
